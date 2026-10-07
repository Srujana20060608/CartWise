import crypto from 'node:crypto'
import express from 'express'
import { db, save } from './db.js'
import {
  sha256, token, uid, hashPassword, verifyPassword, DUMMY_HASH, EMAIL_RE, normEmail, passwordOk,
  parseCookies, setCookie, limited,
} from './security.js'
import { sendResetMail, mailConfigured } from './mail.js'
import { BY_ID } from '../src/data.js' // same product catalogue the UI uses, so prices are decided here, not by the browser

export const router = express.Router()

const DAY = 864e5, MAX_TRIES = 5, LOCK_SEC = 30, RESET_MS = 10 * 60 * 1000, MAX_QTY = 20, MAX_LINES = 50
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const bad = (res, status, error, extra = {}) => res.status(status).json({ error, ...extra })
const pub = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', created: u.created })
const validId = (id) => typeof id === 'string' && Object.hasOwn(BY_ID, id)
const qtyOf = (v) => (Number.isInteger(v) && v >= 0 && v <= MAX_QTY ? v : null)

// ---------- live events (Server-Sent Events): every open tab/device of a user hears about changes ----------
const clients = new Map() // userId -> Set<{res, req}>
function broadcast(userId, type) {
  for (const c of clients.get(userId) || []) c.res.write(`event: ${type}\ndata: {}\n\n`)
}

// ---------- sessions ----------
function startSession(res, user, remember) {
  const t = token(), ttl = (remember ? 30 : 1) * DAY
  db.sessions.push({ id: sha256(t), uid: user.id, exp: Date.now() + ttl, created: Date.now() })
  const mine = db.sessions.filter((s) => s.uid === user.id)
  if (mine.length > 10) { const drop = new Set(mine.sort((a, b) => a.created - b.created).slice(0, mine.length - 10)); db.sessions = db.sessions.filter((s) => !drop.has(s)) }
  setCookie(res, 'cw_sid', t, ttl / 1000)
}
function loadSession(req) {
  const t = parseCookies(req.headers.cookie).cw_sid
  if (!t) return null
  const id = sha256(t), s = db.sessions.find((x) => x.id === id)
  if (!s) return null
  if (s.exp < Date.now()) { db.sessions = db.sessions.filter((x) => x !== s); save(); return null }
  const user = db.users.find((u) => u.id === s.uid)
  return user ? { s, user } : null
}
const optional = (req, res, next) => { const x = loadSession(req); if (x) { req.session = x.s; req.user = x.user } next() }
const required = (req, res, next) => optional(req, res, () => (req.user ? next() : bad(res, 401, 'Please sign in')))

// ---------- health ----------
router.get('/health', (req, res) => res.json({ ok: true, email: mailConfigured() }))

// ---------- auth ----------
router.get('/auth/me', optional, (req, res) => res.json({ user: req.user ? pub(req.user) : null }))

router.get('/auth/email-available', (req, res) => {
  if (limited('avail:' + req.ip, 60, 60e3)) return bad(res, 429, 'Slow down')
  const email = normEmail(req.query.email)
  if (!EMAIL_RE.test(email)) return bad(res, 400, 'Enter a valid email address', { field: 'email' })
  res.json({ available: !db.users.some((u) => u.email === email) })
})

router.post('/auth/signup', wrap(async (req, res) => {
  if (limited('signup:' + req.ip, 10, 3600e3)) return bad(res, 429, 'Too many sign-ups from this network. Try again later.')
  const name = String(req.body.name || '').trim().slice(0, 80), email = normEmail(req.body.email), password = req.body.password
  if (name.length < 2) return bad(res, 400, 'Enter your full name', { field: 'name' })
  if (!EMAIL_RE.test(email)) return bad(res, 400, 'Enter a valid email address', { field: 'email' })
  if (!passwordOk(password)) return bad(res, 400, 'Use 8+ characters with a letter and a number', { field: 'password' })
  if (db.users.some((u) => u.email === email)) return bad(res, 409, 'An account with this email already exists', { field: 'email' })
  const hash = await hashPassword(password)
  if (db.users.some((u) => u.email === email)) return bad(res, 409, 'An account with this email already exists', { field: 'email' }) // re-check after the await
  const user = { id: uid(), name, email, phone: '', hash, created: Date.now() }
  db.users.push(user)
  startSession(res, user, true)
  save()
  res.status(201).json({ user: pub(user) })
}))

router.post('/auth/signin', wrap(async (req, res) => {
  if (limited('signin:' + req.ip, 30, 10 * 60e3)) return bad(res, 429, 'Too many attempts', { retryAfter: 60 })
  const email = normEmail(req.body.email), password = String(req.body.password || '')
  const a = db.attempts[email] || { n: 0, until: 0 }
  if (a.until > Date.now()) return bad(res, 429, 'Too many attempts', { retryAfter: Math.ceil((a.until - Date.now()) / 1000) })
  const user = db.users.find((u) => u.email === email)
  const match = await verifyPassword(password, user ? user.hash : DUMMY_HASH)
  if (!user || !match) {
    a.n += 1
    let extra = { left: MAX_TRIES - a.n }, status = 401
    if (a.n >= MAX_TRIES) { a.until = Date.now() + LOCK_SEC * 1000; a.n = 0; extra = { retryAfter: LOCK_SEC }; status = 429 }
    db.attempts[email] = a; save()
    return bad(res, status, status === 429 ? 'Too many attempts' : 'Incorrect email or password', extra)
  }
  delete db.attempts[email]
  startSession(res, user, req.body.remember !== false)
  save()
  res.json({ user: pub(user) })
}))

router.post('/auth/signout', optional, (req, res) => {
  if (req.session) { db.sessions = db.sessions.filter((s) => s.id !== req.session.id); save(); broadcast(req.user.id, 'auth') }
  setCookie(res, 'cw_sid', '', 0)
  res.json({ ok: true })
})

router.post('/auth/forgot', wrap(async (req, res) => {
  if (limited('forgot:' + req.ip, 10, 3600e3)) return bad(res, 429, 'Too many requests. Try again later.')
  const email = normEmail(req.body.email)
  if (!EMAIL_RE.test(email)) return bad(res, 400, 'Enter a valid email address', { field: 'email' })
  const user = db.users.find((u) => u.email === email), prev = db.resets[email]
  let devCode
  if (user && !(prev && mailConfigured() && Date.now() - prev.sent < 30e3)) {
    const code = String(crypto.randomInt(100000, 1000000))
    db.resets[email] = { hash: sha256(email + ':' + code), exp: Date.now() + RESET_MS, tries: 0, sent: Date.now() }
    save()
    await sendResetMail(email, code).catch((e) => console.error('Could not send reset email:', e.message))
    if (!mailConfigured()) devCode = code // demo mode only: no mail server, so the page shows the code
  }
  res.json({ sent: true, ...(devCode ? { devCode } : {}) }) // same answer whether or not the account exists
}))

router.post('/auth/reset', wrap(async (req, res) => {
  if (limited('reset:' + req.ip, 20, 3600e3)) return bad(res, 429, 'Too many attempts. Try again later.')
  const email = normEmail(req.body.email), code = String(req.body.code || '').trim(), password = req.body.password
  const wrong = () => bad(res, 400, 'That code is wrong or has expired', { field: 'code' })
  const r = db.resets[email], user = db.users.find((u) => u.email === email)
  if (!r || !user || r.exp < Date.now()) return wrong()
  if (r.tries >= MAX_TRIES) { delete db.resets[email]; save(); return wrong() }
  if (sha256(email + ':' + code) !== r.hash) { r.tries += 1; save(); return wrong() }
  if (!passwordOk(password)) return bad(res, 400, 'Use 8+ characters with a letter and a number', { field: 'password' })
  user.hash = await hashPassword(password)
  delete db.resets[email]; delete db.attempts[email]
  db.sessions = db.sessions.filter((s) => s.uid !== user.id) // everyone is signed out after a reset
  save(); broadcast(user.id, 'auth')
  res.json({ ok: true })
}))

// ---------- account ----------
router.patch('/account', required, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80), phone = String(req.body.phone || '').trim()
  if (name.length < 2) return bad(res, 400, 'Enter your full name', { field: 'name' })
  if (phone && !/^[+\d][\d\s-]{6,14}$/.test(phone)) return bad(res, 400, 'Enter a valid phone number', { field: 'phone' })
  req.user.name = name; req.user.phone = phone
  save(); broadcast(req.user.id, 'auth')
  res.json({ user: pub(req.user) })
})

router.post('/account/password', required, wrap(async (req, res) => {
  const { current, next } = req.body
  if (!(await verifyPassword(String(current || ''), req.user.hash))) return bad(res, 400, 'Current password is incorrect', { field: 'current' })
  if (!passwordOk(next)) return bad(res, 400, 'Use 8+ characters with a letter and a number', { field: 'next' })
  if (next === current) return bad(res, 400, 'Choose a password you have not used here before', { field: 'next' })
  req.user.hash = await hashPassword(next)
  db.sessions = db.sessions.filter((s) => s.uid !== req.user.id || s.id === req.session.id) // sign out every other device
  save(); broadcast(req.user.id, 'auth')
  res.json({ ok: true })
}))

router.delete('/account', required, wrap(async (req, res) => {
  if (!(await verifyPassword(String(req.body.password || ''), req.user.hash))) return bad(res, 400, 'Password is incorrect', { field: 'password' })
  const id = req.user.id
  db.users = db.users.filter((u) => u.id !== id)
  db.sessions = db.sessions.filter((s) => s.uid !== id)
  delete db.carts[id]; delete db.wishes[id]; delete db.orders[id]
  save(); broadcast(id, 'auth'); clients.delete(id)
  setCookie(res, 'cw_sid', '', 0)
  res.json({ ok: true })
}))

// ---------- cart, wishlist, orders ----------
const stateOf = (u) => ({ cart: db.carts[u.id] || [], wish: db.wishes[u.id] || [], orders: db.orders[u.id] || [] })
const changed = (req, res) => { save(); broadcast(req.user.id, 'sync'); res.json(stateOf(req.user)) }

router.get('/state', required, (req, res) => res.json(stateOf(req.user)))

router.post('/cart/items', required, (req, res) => {
  const id = req.body.id
  if (!validId(id)) return bad(res, 404, 'Product not found')
  const cart = (db.carts[req.user.id] ||= []), line = cart.find((l) => l.id === id)
  if (line) line.qty = Math.min(MAX_QTY, line.qty + 1)
  else if (cart.length >= MAX_LINES) return bad(res, 400, 'Your cart is full')
  else cart.push({ id, qty: 1 })
  changed(req, res)
})
router.put('/cart/items/:id', required, (req, res) => {
  const id = req.params.id, qty = qtyOf(req.body.qty)
  if (!validId(id)) return bad(res, 404, 'Product not found')
  if (qty === null) return bad(res, 400, `Quantity must be a whole number from 0 to ${MAX_QTY}`)
  let cart = (db.carts[req.user.id] ||= []); const line = cart.find((l) => l.id === id)
  if (qty === 0) db.carts[req.user.id] = cart.filter((l) => l.id !== id)
  else if (line) line.qty = qty
  else if (cart.length >= MAX_LINES) return bad(res, 400, 'Your cart is full')
  else cart.push({ id, qty })
  changed(req, res)
})

router.put('/wishlist/:id', required, (req, res) => {
  if (!validId(req.params.id)) return bad(res, 404, 'Product not found')
  const w = (db.wishes[req.user.id] ||= [])
  if (!w.includes(req.params.id)) { if (w.length >= 500) return bad(res, 400, 'Your wishlist is full'); w.push(req.params.id) }
  changed(req, res)
})
router.delete('/wishlist/:id', required, (req, res) => {
  db.wishes[req.user.id] = (db.wishes[req.user.id] || []).filter((x) => x !== req.params.id)
  changed(req, res)
})

// Called right after sign in: moves the guest's browser cart/wishlist into the account.
router.post('/merge', required, (req, res) => {
  const cart = (db.carts[req.user.id] ||= []), wish = (db.wishes[req.user.id] ||= [])
  for (const g of Array.isArray(req.body.cart) ? req.body.cart.slice(0, MAX_LINES) : []) {
    const q = qtyOf(g?.qty)
    if (!validId(g?.id) || !q) continue
    const line = cart.find((l) => l.id === g.id)
    if (line) line.qty = Math.min(MAX_QTY, line.qty + q); else if (cart.length < MAX_LINES) cart.push({ id: g.id, qty: q })
  }
  for (const id of Array.isArray(req.body.wish) ? req.body.wish.slice(0, 500) : []) if (validId(id) && !wish.includes(id) && wish.length < 500) wish.push(id)
  changed(req, res)
})

router.post('/orders', required, (req, res) => {
  const cart = db.carts[req.user.id] || []
  const items = cart.filter((l) => validId(l.id)).map((l) => { const p = BY_ID[l.id]; return { id: p.id, name: p.name, qty: l.qty, price: p.best.price, market: p.best.market } })
  if (!items.length) return bad(res, 400, 'Your cart is empty')
  const order = { id: 'CW' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase(), date: Date.now(), items, total: items.reduce((s, i) => s + i.price * i.qty, 0) }
  const list = (db.orders[req.user.id] ||= [])
  list.unshift(order); if (list.length > 200) list.length = 200
  db.carts[req.user.id] = []
  save(); broadcast(req.user.id, 'sync')
  res.status(201).json({ order, ...stateOf(req.user) })
})

// ---------- live stream ----------
router.get('/events', required, (req, res) => {
  req.socket.setTimeout(0)
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
  res.flushHeaders()
  res.write('retry: 3000\n\n')
  const c = { res, req }, id = req.user.id
  if (!clients.has(id)) clients.set(id, new Set())
  clients.get(id).add(c)
  const beat = setInterval(() => {
    if (!loadSession(req)) { res.write('event: auth\ndata: {}\n\n'); res.end(); return } // session expired or was revoked
    res.write(': ping\n\n')
  }, 25000)
  req.on('close', () => { clearInterval(beat); clients.get(id)?.delete(c) })
})
