import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)
const OPTS = { N: 16384, r: 8, p: 1 }

export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex')
export const token = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url')
export const uid = () => 'u_' + crypto.randomBytes(6).toString('hex')

export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  const key = await scrypt(String(pw), salt, 64, OPTS)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}
export async function verifyPassword(pw, stored) {
  const [alg, saltHex, keyHex] = String(stored || '').split('$')
  if (alg !== 'scrypt' || !saltHex || !keyHex) return false
  const want = Buffer.from(keyHex, 'hex')
  const got = await scrypt(String(pw), Buffer.from(saltHex, 'hex'), want.length, OPTS)
  return want.length === got.length && crypto.timingSafeEqual(want, got)
}
// Verified against when an email is unknown, so unknown and wrong-password take the same time.
export const DUMMY_HASH = await hashPassword('not-a-real-password')

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const normEmail = (e) => String(e || '').trim().toLowerCase().slice(0, 254)
export const passwordOk = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 200 && /[A-Za-z]/.test(p) && /\d/.test(p)

export function parseCookies(header) {
  const out = {}
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) { try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()) } catch {} }
  }
  return out
}
export function setCookie(res, name, value, maxAgeSec) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`)
}

// In-memory sliding-window limiter for abusive clients (per IP and action).
const hits = new Map()
export function limited(key, max, windowMs) {
  const now = Date.now(), arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
  arr.push(now); hits.set(key, arr)
  return arr.length > max
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some((t) => now - t < 3600e3)) hits.delete(k) }, 600e3).unref()
