// End-to-end API test. Starts the real server on a spare port with a temporary database.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 3900 + Math.floor(Math.random() * 90), BASE = `http://localhost:${PORT}/api`
const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cw-')), 'db.json')
const srv = spawn(process.execPath, [path.join(root, 'server/index.js')], { env: { ...process.env, PORT, DB_FILE: dbFile }, stdio: ['ignore', 'pipe', 'inherit'] })
let logs = ''; srv.stdout.on('data', (d) => (logs += d))

// Minimal client with its own cookie jar (one per "browser").
const client = () => {
  let cookie = ''
  const call = async (method, p, body, headers = {}) => {
    const r = await fetch(BASE + p, { method, headers: { 'content-type': 'application/json', ...(cookie && { cookie }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) })
    const set = r.headers.getSetCookie?.() || []
    for (const c of set) { const [kv] = c.split(';'); cookie = kv.endsWith('=') ? '' : kv }
    let json = null; try { json = await r.json() } catch {}
    return { status: r.status, body: json, setCookie: set.join('|') }
  }
  return { call, cookie: () => cookie }
}

let pass = 0, failed = 0
const t = async (name, fn) => { try { await fn(); pass++; console.log('ok   ' + name) } catch (e) { failed++; console.log('FAIL ' + name + ' -> ' + e.message) } }
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m || 'expected'} ${JSON.stringify(b)} got ${JSON.stringify(a)}`) }
const ok = (c, m) => { if (!c) throw new Error(m) }

for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + '/health')).ok) break } catch {} await new Promise((r) => setTimeout(r, 150)) }

const A = client(), B = client()
const email = 'Ravi@Example.com', pw = 'abcd1234'
let pid = '', pid2 = ''

await t('health', async () => eq((await A.call('GET', '/health')).body.ok, true))
await t('me when signed out is null', async () => eq((await A.call('GET', '/auth/me')).body.user, null))
await t('state requires sign in', async () => eq((await A.call('GET', '/state')).status, 401))
await t('signup validates name/email/password', async () => {
  eq((await A.call('POST', '/auth/signup', { name: 'R', email, password: pw })).body.field, 'name')
  eq((await A.call('POST', '/auth/signup', { name: 'Ravi K', email: 'nope', password: pw })).body.field, 'email')
  eq((await A.call('POST', '/auth/signup', { name: 'Ravi K', email, password: 'short' })).body.field, 'password')
})
await t('email availability', async () => eq((await A.call('GET', '/auth/email-available?email=' + email)).body.available, true))
await t('signup creates account + httpOnly cookie', async () => {
  const r = await A.call('POST', '/auth/signup', { name: 'Ravi K', email, password: pw })
  eq(r.status, 201); eq(r.body.user.email, 'ravi@example.com')
  ok(/HttpOnly/i.test(r.setCookie) && /SameSite=Lax/i.test(r.setCookie), 'cookie flags: ' + r.setCookie)
  ok(!JSON.stringify(r.body).includes('hash'), 'password hash leaked')
})
await t('email now taken (availability + duplicate signup)', async () => {
  eq((await A.call('GET', '/auth/email-available?email=ravi@example.com')).body.available, false)
  eq((await B.call('POST', '/auth/signup', { name: 'Other', email: 'RAVI@example.com', password: pw })).status, 409)
})
await t('me returns the user', async () => eq((await A.call('GET', '/auth/me')).body.user.name, 'Ravi K'))
await t('password stored hashed, session token stored hashed', async () => {
  await new Promise((r) => setTimeout(r, 200))
  const raw = fs.readFileSync(dbFile, 'utf8')
  ok(!raw.includes(pw), 'plain password on disk'); ok(raw.includes('scrypt$'), 'no scrypt hash')
  ok(!raw.includes(A.cookie().split('=')[1]), 'session token stored in clear')
})

await t('cart: add, set qty, remove, validation', async () => {
  const p = (await import('../src/data.js')).PRODUCTS; pid = p[0].id; pid2 = p[1].id
  eq((await A.call('POST', '/cart/items', { id: 'nope' })).status, 404)
  eq((await A.call('POST', '/cart/items', { id: pid })).body.cart, [{ id: pid, qty: 1 }])
  eq((await A.call('POST', '/cart/items', { id: pid })).body.cart, [{ id: pid, qty: 2 }])
  eq((await A.call('PUT', '/cart/items/' + pid2, { qty: 3 })).body.cart.length, 2)
  eq((await A.call('PUT', '/cart/items/' + pid2, { qty: 999 })).status, 400)
  eq((await A.call('PUT', '/cart/items/' + pid2, { qty: 0 })).body.cart, [{ id: pid, qty: 2 }])
})
await t('wishlist add/remove', async () => {
  eq((await A.call('PUT', '/wishlist/' + pid2)).body.wish, [pid2])
  eq((await A.call('PUT', '/wishlist/' + pid2)).body.wish, [pid2])
  eq((await A.call('DELETE', '/wishlist/' + pid2)).body.wish, [])
})
await t('merge guest cart/wishlist', async () => {
  const r = await A.call('POST', '/merge', { cart: [{ id: pid, qty: 1 }, { id: 'bad', qty: 1 }], wish: [pid2, 'bad'] })
  eq(r.body.cart, [{ id: pid, qty: 3 }]); eq(r.body.wish, [pid2])
})
await t('live events: second connection hears a change', async () => {
  const ctrl = new AbortController()
  const r = await fetch(BASE + '/events', { headers: { cookie: A.cookie() }, signal: ctrl.signal })
  eq(r.status, 200)
  const reader = r.body.getReader(); let got = ''
  const reading = (async () => { try { for (;;) { const { value, done } = await reader.read(); if (done) break; got += Buffer.from(value).toString(); if (got.includes('event: sync')) break } } catch {} })()
  await new Promise((x) => setTimeout(x, 200))
  await A.call('POST', '/cart/items', { id: pid })
  await Promise.race([reading, new Promise((x) => setTimeout(x, 2000))])
  ctrl.abort()
  ok(got.includes('event: sync'), 'no sync event received')
})
await t('events require sign in', async () => eq((await B.call('GET', '/events')).status, 401))

await t('order uses server prices and clears cart', async () => {
  const { PRODUCTS } = await import('../src/data.js'), p = PRODUCTS.find((x) => x.id === pid)
  const r = await A.call('POST', '/orders')
  eq(r.status, 201); eq(r.body.order.total, p.best.price * 4); eq(r.body.cart, []); eq(r.body.orders.length, 1)
  eq((await A.call('POST', '/orders')).status, 400, 'empty cart order')
})
await t('orders are private to the account', async () => {
  const C = client(); await C.call('POST', '/auth/signup', { name: 'Someone Else', email: 'else@example.com', password: pw })
  eq((await C.call('GET', '/state')).body.orders, [])
})

await t('cross-site write is blocked', async () => eq((await A.call('POST', '/cart/items', { id: pid }, { origin: 'https://evil.example' })).status, 403))
await t('bad JSON is a 400, not a crash', async () => {
  const r = await fetch(BASE + '/auth/signin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' }); eq(r.status, 400)
})

await t('profile update + validation', async () => {
  eq((await A.call('PATCH', '/account', { name: 'Ravi Kumar', phone: 'abc' })).body.field, 'phone')
  eq((await A.call('PATCH', '/account', { name: 'Ravi Kumar', phone: '+91 98765 43210' })).body.user.name, 'Ravi Kumar')
})

await t('sign out ends the session; sign in works; second device', async () => {
  eq((await A.call('POST', '/auth/signout')).body.ok, true)
  eq((await A.call('GET', '/auth/me')).body.user, null)
  eq((await A.call('POST', '/auth/signin', { email, password: pw })).status, 200)
  eq((await B.call('POST', '/auth/signin', { email, password: pw })).status, 200)
  eq((await B.call('GET', '/state')).body.orders.length, 1, 'orders follow the account to another device')
})
await t('change password signs out other devices', async () => {
  eq((await A.call('POST', '/account/password', { current: 'wrongpass1', next: 'newpass99' })).body.field, 'current')
  eq((await A.call('POST', '/account/password', { current: pw, next: 'weak' })).body.field, 'next')
  eq((await A.call('POST', '/account/password', { current: pw, next: 'newpass99' })).status, 200)
  eq((await A.call('GET', '/auth/me')).body.user.email, 'ravi@example.com', 'this device stays signed in')
  eq((await B.call('GET', '/auth/me')).body.user, null, 'other device signed out')
  eq((await B.call('POST', '/auth/signin', { email, password: pw })).status, 401, 'old password rejected')
})

await t('forgot/reset flow', async () => {
  const U = client()
  const unknown = await U.call('POST', '/auth/forgot', { email: 'ghost@example.com' })
  eq(unknown.body, { sent: true }, 'unknown email gives the same generic answer')
  const f = await U.call('POST', '/auth/forgot', { email })
  ok(/^\d{6}$/.test(f.body.devCode), 'demo mode should return the code')
  const wrong = await U.call('POST', '/auth/reset', { email, code: '000000', password: 'reset12345' })
  eq(wrong.status, 400); eq(wrong.body.field, 'code')
  eq((await U.call('POST', '/auth/reset', { email, code: f.body.devCode, password: 'weak' })).body.field, 'password')
  eq((await U.call('POST', '/auth/reset', { email, code: f.body.devCode, password: 'reset12345' })).status, 200)
  eq((await U.call('POST', '/auth/reset', { email, code: f.body.devCode, password: 'again12345' })).status, 400, 'code is single-use')
  eq((await A.call('GET', '/auth/me')).body.user, null, 'reset signs out every session')
  eq((await U.call('POST', '/auth/signin', { email, password: 'reset12345' })).status, 200)
})

await t('lockout after 5 wrong passwords', async () => {
  const L = client(); let last
  for (let i = 0; i < 5; i++) last = await L.call('POST', '/auth/signin', { email, password: 'wrong-' + i })
  eq(last.status, 429); ok(last.body.retryAfter > 0, 'retryAfter missing')
  eq((await L.call('POST', '/auth/signin', { email, password: 'reset12345' })).status, 429, 'correct password still locked')
})

await t('delete account removes everything', async () => {
  const D = client(); await D.call('POST', '/auth/signup', { name: 'Temp User', email: 'temp@example.com', password: pw })
  await D.call('POST', '/cart/items', { id: pid })
  eq((await D.call('DELETE', '/account', { password: 'wrongpass1' })).body.field, 'password')
  eq((await D.call('DELETE', '/account', { password: pw })).status, 200)
  eq((await D.call('GET', '/auth/me')).body.user, null)
  eq((await client().call('GET', '/auth/email-available?email=temp@example.com')).body.available, true)
})

await t('data survives a server restart', async () => {
  srv.kill('SIGINT'); await new Promise((r) => setTimeout(r, 500))
  const saved = JSON.parse(fs.readFileSync(dbFile, 'utf8'))
  ok(saved.users.some((u) => u.email === 'ravi@example.com'), 'user missing after restart')
  ok(saved.orders[saved.users.find((u) => u.email === 'ravi@example.com').id]?.length === 1, 'order missing after restart')
})

try { srv.kill() } catch {}
console.log(`\n${pass} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
