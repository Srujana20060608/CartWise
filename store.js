import { useState, useEffect, useCallback } from 'react'

// Guest cart/wishlist live in this browser (localStorage) until the person signs in; then they move to the server.
export const read = (k, d) => { try { const r = localStorage.getItem(k); return r == null ? d : JSON.parse(r) } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

export function useStore(key, init) {
  const [v, setV] = useState(() => read(key, init))
  useEffect(() => {
    const f = (e) => { if (e.key === key) setV(read(key, init)) } // keeps guest tabs in sync too
    addEventListener('storage', f)
    return () => removeEventListener('storage', f)
  }, [key])
  const set = useCallback((fn) => setV((prev) => { const next = typeof fn === 'function' ? fn(prev) : fn; write(key, next); return next }), [key])
  return [v, set]
}
