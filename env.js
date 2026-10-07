import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Tiny .env loader (no dependency, works on every Node version).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m || line.trim().startsWith('#')) continue
    let v = m[2]
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
} catch {}
export const ROOT = root
