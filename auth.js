// Client-side helpers for the sign in / sign up forms. The real checks happen on the server (server/routes.js);
// these only give instant feedback while typing.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const passwordChecks = (pw) => ({ len: pw.length >= 8, letter: /[A-Za-z]/.test(pw), num: /\d/.test(pw) })
export const passwordOk = (pw) => Object.values(passwordChecks(pw)).every(Boolean)
export function strength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.max(1, Math.min(4, s))
}
