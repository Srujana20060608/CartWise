import fs from 'node:fs'
import path from 'node:path'
import { ROOT } from './env.js'

// File-backed database: one JSON document held in memory and written to disk atomically after every change.
// Zero native dependencies, so it installs everywhere. For many users or several server instances,
// replace this module with PostgreSQL/MongoDB; the rest of the server only uses `db` and `save()`.
export const FILE = path.resolve(process.env.DB_FILE || path.join(ROOT, 'data', 'db.json'))
const empty = () => ({ users: [], sessions: [], carts: {}, wishes: {}, orders: {}, resets: {}, attempts: {} })

function load() {
  try {
    return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      // Unreadable file: keep a copy instead of silently overwriting someone's data.
      try { fs.renameSync(FILE, FILE + '.corrupt-' + Date.now()) } catch {}
      console.error('Database file was unreadable; it was moved aside and a fresh one started.')
    }
    return empty()
  }
}

export const db = load()
let timer = null

export function flush() {
  if (timer) { clearTimeout(timer); timer = null }
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  const tmp = FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db))
  fs.renameSync(tmp, FILE)
}
export function save() { if (!timer) timer = setTimeout(flush, 40) }

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { try { flush() } finally { process.exit(0) } })
process.on('exit', () => { try { flush() } catch {} })

// Housekeeping: drop expired sessions, reset codes and lockouts.
export function purge() {
  const now = Date.now()
  db.sessions = db.sessions.filter((s) => s.exp > now)
  for (const [k, r] of Object.entries(db.resets)) if (r.exp < now) delete db.resets[k]
  for (const [k, a] of Object.entries(db.attempts)) if ((a.until || 0) < now && a.n === 0) delete db.attempts[k]
  save()
}
