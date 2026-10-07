// Thin fetch wrapper for the CartWise API. Errors carry the server's message plus extras (field, left, retryAfter).
export async function api(method, path, body) {
  let res
  try {
    res = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw Object.assign(new Error('Cannot reach the CartWise server. Check that it is running.'), { offline: true })
  }
  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error || `Request failed (${res.status})`), data || {}, { status: res.status })
  return data
}
