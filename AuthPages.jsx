import { useState, useEffect } from 'react'
import { EMAIL_RE, passwordChecks, passwordOk, strength } from './auth.js'
import { api } from './api.js'
import { fmt } from './data.js'

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

function Field({ label, error, hint, children }) {
  return <label className="fld"><span>{label}</span>{children}{error ? <small className="err" role="alert">{error}</small> : hint ? <small className="hint">{hint}</small> : null}</label>
}

function PasswordInput({ value, onChange, onBlur, autoComplete, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} onBlur={onBlur} autoComplete={autoComplete} placeholder={placeholder} />
      <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
    </div>
  )
}

function Rules({ pw }) {
  const c = passwordChecks(pw), s = strength(pw)
  return (
    <div className="rules">
      <div className="meter" aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} className={i <= s ? 's' + s : ''} />)}</div>
      <div className="rlist"><span className={c.len ? 'ok' : ''}>8+ characters</span><span className={c.letter ? 'ok' : ''}>a letter</span><span className={c.num ? 'ok' : ''}>a number</span>{pw && <b className={'lvl s' + s}>{LABELS[s]}</b>}</div>
    </div>
  )
}

const Shell = ({ title, sub, children, foot }) => (
  <main className="wrap"><div className="authcard"><h1>{title}</h1><p className="muted">{sub}</p>{children}{foot && <div className="afoot">{foot}</div>}</div></main>
)

export function SignIn({ S, next }) {
  const [f, setF] = useState({ email: '', password: '', remember: true })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [until, setUntil] = useState(0), [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (until <= Date.now()) return
    const t = setInterval(() => { setNow(Date.now()); if (Date.now() >= until) { setUntil(0); setErr('') } }, 250)
    return () => clearInterval(t)
  }, [until])
  const left = Math.max(0, Math.ceil((until - now) / 1000))
  const nq = next ? '?next=' + encodeURIComponent(next) : ''
  const submit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(f.email.trim())) return setErr('Enter a valid email address')
    if (!f.password) return setErr('Enter your password')
    setBusy(true); setErr('')
    try { await S.signIn(f) } catch (x) {
      if (x.retryAfter) { setUntil(Date.now() + x.retryAfter * 1000); setNow(Date.now()); setErr('') }
      else setErr(x.message + (x.left ? ` · ${x.left} ${x.left === 1 ? 'try' : 'tries'} left` : ''))
    }
    setBusy(false)
  }
  return (
    <Shell title="Welcome back" sub="Sign in to sync your cart, wishlist and orders on every device." foot={<>New to CartWise? <a href={'#/signup' + nq}>Create an account</a></>}>
      <form onSubmit={submit} noValidate>
        <Field label="Email"><input type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoFocus /></Field>
        <Field label="Password"><PasswordInput value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></Field>
        <div className="row spread"><label className="chk"><input type="checkbox" checked={f.remember} onChange={(e) => setF({ ...f, remember: e.target.checked })} /> Keep me signed in</label><a href="#/forgot" className="lnk">Forgot password?</a></div>
        {left > 0 && <div className="alert" role="alert">Too many wrong attempts. Try again in {left}s.</div>}
        {err && <div className="alert" role="alert">{err}</div>}
        <button className="btn solid full" disabled={busy || left > 0}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Shell>
  )
}

export function SignUp({ S, next }) {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', terms: false })
  const [t, setT] = useState({}), [sent, setSent] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const [avail, setAvail] = useState(null) // null = unknown, true/false = checked with the server
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const touch = (k) => () => setT((x) => ({ ...x, [k]: true }))
  const valid = EMAIL_RE.test(f.email.trim()), taken = valid && avail === false
  useEffect(() => {
    setAvail(null)
    if (!valid) return
    let dead = false
    const id = setTimeout(() => { api('GET', '/auth/email-available?email=' + encodeURIComponent(f.email.trim())).then((r) => !dead && setAvail(r.available)).catch(() => {}) }, 400)
    return () => { dead = true; clearTimeout(id) }
  }, [f.email])
  const E = {
    name: f.name.trim().length < 2 ? 'Enter your full name' : '',
    email: !valid ? 'Enter a valid email address' : '',
    password: !passwordOk(f.password) ? 'Use 8+ characters with a letter and a number' : '',
    confirm: f.confirm !== f.password || !f.confirm ? "Passwords don't match" : '',
    terms: !f.terms ? 'Accept the terms to continue' : '',
  }
  const show = (k) => (t[k] || sent) && E[k]
  const nq = next ? '?next=' + encodeURIComponent(next) : ''
  const submit = async (e) => {
    e.preventDefault(); setSent(true); setErr('')
    if (Object.values(E).some(Boolean) || taken) return
    setBusy(true)
    try { await S.signUp(f) } catch (x) { if (x.field === 'email') setAvail(false); setErr(x.message) }
    setBusy(false)
  }
  return (
    <Shell title="Create your account" sub="Free, takes a minute. Your guest cart comes with you." foot={<>Already have an account? <a href={'#/signin' + nq}>Sign in</a></>}>
      <form onSubmit={submit} noValidate>
        <Field label="Full name" error={show('name')}><input autoComplete="name" value={f.name} onChange={set('name')} onBlur={touch('name')} autoFocus /></Field>
        <Field label="Email" error={show('email') || (taken && 'This email is already registered')} hint={valid && avail === true ? 'Looks good, email is available' : ''}>
          <input type="email" autoComplete="email" value={f.email} onChange={set('email')} onBlur={touch('email')} placeholder="you@example.com" />
        </Field>
        {taken && <a className="lnk" href={'#/signin' + nq}>Sign in instead</a>}
        <Field label="Password" error={show('password')}><PasswordInput value={f.password} onChange={set('password')} onBlur={touch('password')} autoComplete="new-password" /></Field>
        <Rules pw={f.password} />
        <Field label="Confirm password" error={show('confirm')}><PasswordInput value={f.confirm} onChange={set('confirm')} onBlur={touch('confirm')} autoComplete="new-password" /></Field>
        <label className="chk"><input type="checkbox" checked={f.terms} onChange={set('terms')} /> I agree to the terms and privacy policy</label>
        {show('terms') && <small className="err">{E.terms}</small>}
        {err && <div className="alert" role="alert">{err}</div>}
        <button className="btn solid full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </Shell>
  )
}

export function Forgot({ S }) {
  const [step, setStep] = useState(1), [email, setEmail] = useState(''), [code, setCode] = useState(''), [pw, setPw] = useState('')
  const [demo, setDemo] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const r = await api('POST', '/auth/forgot', { email }); setDemo(r.devCode || null); setStep(2) } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  const reset = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await api('POST', '/auth/reset', { email, code, password: pw }); S.say('Password updated. Sign in with it now'); location.hash = '#/signin' } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  return (
    <Shell title="Reset your password" sub={step === 1 ? 'Enter your email and we will send a 6-digit code.' : 'Enter the code and choose a new password.'} foot={<a href="#/signin">Back to sign in</a>}>
      {step === 1 ? (
        <form onSubmit={send} noValidate>
          <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></Field>
          {err && <div className="alert" role="alert">{err}</div>}
          <button className="btn solid full" disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
        </form>
      ) : (
        <form onSubmit={reset} noValidate>
          {demo ? <div className="demo">No mail server is set up, so here is your code for <b>{email}</b>: <b className="code">{demo}</b> (valid 10 minutes).</div> : <div className="demo">If an account exists for {email}, a code has been sent. It is valid for 10 minutes.</div>}
          <Field label="6-digit code"><input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus /></Field>
          <Field label="New password"><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Field>
          <Rules pw={pw} />
          {err && <div className="alert" role="alert">{err}</div>}
          <button className="btn solid full" disabled={busy || code.length < 6 || !passwordOk(pw)}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      )}
    </Shell>
  )
}

export function UserMenu({ S }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { const f = () => setOpen(false); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => {
    if (!open) return
    const f = (e) => { if (!e.target.closest?.('.umenu')) setOpen(false) }, k = (e) => e.key === 'Escape' && setOpen(false)
    addEventListener('click', f); addEventListener('keydown', k)
    return () => { removeEventListener('click', f); removeEventListener('keydown', k) }
  }, [open])
  const u = S.user
  if (u === undefined) return null // still checking the session
  if (!u) return <div className="authlinks"><a className="nav" href="#/signin">Sign in</a><a className="nav pri" href="#/signup">Sign up</a></div>
  const ini = u.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="umenu">
      <button className="nav avbtn" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}><span className="av">{ini}</span><span className="uname">{u.name.split(' ')[0]}</span></button>
      {open && (
        <div className="menu" role="menu">
          <div className="mhead"><b>{u.name}</b><small className="muted">{u.email}</small></div>
          <a role="menuitem" href="#/account">My account</a>
          <a role="menuitem" href="#/account?tab=orders">My orders</a>
          <a role="menuitem" href="#/wishlist">Wishlist</a>
          <button role="menuitem" onClick={S.signOut}>Sign out</button>
        </div>
      )}
    </div>
  )
}

export function Account({ S, tab: initial }) {
  const u = S.user
  const [tab, setTab] = useState(['profile', 'orders', 'security'].includes(initial) ? initial : 'profile')
  useEffect(() => { if (['profile', 'orders', 'security'].includes(initial)) setTab(initial) }, [initial])
  return (
    <main className="wrap">
      <h2 className="h2">Hi, {u.name.split(' ')[0]} 👋</h2>
      <div className="tabs">{[['profile', 'Profile'], ['orders', `Orders (${S.orders.length})`], ['security', 'Security']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'profile' && <Profile S={S} />}
      {tab === 'orders' && <Orders S={S} />}
      {tab === 'security' && <Security S={S} />}
    </main>
  )
}

function Profile({ S }) {
  const u = S.user
  const [f, setF] = useState({ name: u.name, phone: u.phone }), [err, setErr] = useState({}), [busy, setBusy] = useState(false)
  useEffect(() => { setF({ name: u.name, phone: u.phone }) }, [u.name, u.phone])
  const dirty = f.name !== u.name || f.phone !== u.phone
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await S.updateProfile(f); setErr({}); S.say('Profile saved') } catch (x) { setErr({ [x.field || 'name']: x.message }) }
    setBusy(false)
  }
  return (
    <form className="panel" onSubmit={save} noValidate>
      <Field label="Full name" error={err.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Email" hint="Email can't be changed here"><input value={u.email} disabled /></Field>
      <Field label="Phone (optional)" error={err.phone}><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
      <p className="muted small">Member since {new Date(u.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <button className="btn solid" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}

function Orders({ S }) {
  if (!S.orders.length) return <div className="empty"><div className="big">📦</div><h3>No orders yet</h3><p className="muted">Orders you place show up here instantly, on every device you are signed in on.</p><a className="btn solid" href="#/">Start shopping</a></div>
  return (
    <div>{S.orders.map((o) => (
      <div className="panel order" key={o.id}>
        <div className="row spread"><b>Order {o.id}</b><span className="muted small">{new Date(o.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
        {o.items.map((i) => <div className="oitem" key={i.id}><a href={'#/product/' + i.id}>{i.name}</a><span className="muted small">{i.market} · ×{i.qty}</span><b>₹{fmt(i.price * i.qty)}</b></div>)}
        <div className="total">Total <b>₹{fmt(o.total)}</b></div>
      </div>
    ))}</div>
  )
}

function Security({ S }) {
  const [p, setP] = useState({ current: '', next: '' }), [err, setErr] = useState({}), [busy, setBusy] = useState(false)
  const [del, setDel] = useState(''), [delErr, setDelErr] = useState(''), [confirm, setConfirm] = useState(false)
  const change = async (e) => {
    e.preventDefault(); setBusy(true); setErr({})
    try { await S.changePassword(p.current, p.next); setP({ current: '', next: '' }); S.say('Password changed. Other devices were signed out') } catch (x) { setErr({ [x.field || 'next']: x.message }) }
    setBusy(false)
  }
  const remove = async (e) => {
    e.preventDefault(); setDelErr('')
    try { await S.deleteAccount(del) } catch (x) { setDelErr(x.message) }
  }
  return (
    <>
      <form className="panel" onSubmit={change} noValidate>
        <h3>Change password</h3>
        <Field label="Current password" error={err.current}><PasswordInput value={p.current} onChange={(e) => setP({ ...p, current: e.target.value })} autoComplete="current-password" /></Field>
        <Field label="New password" error={err.next}><PasswordInput value={p.next} onChange={(e) => setP({ ...p, next: e.target.value })} autoComplete="new-password" /></Field>
        <Rules pw={p.next} />
        <button className="btn solid" disabled={busy || !p.current || !passwordOk(p.next)}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
      <div className="panel danger">
        <h3>Delete account</h3>
        <p className="muted small">This permanently removes your profile, cart, wishlist and orders. It can't be undone.</p>
        {!confirm ? <button className="btn" onClick={() => setConfirm(true)}>Delete my account…</button> : (
          <form onSubmit={remove}>
            <Field label="Enter your password to confirm" error={delErr}><PasswordInput value={del} onChange={(e) => setDel(e.target.value)} autoComplete="current-password" /></Field>
            <div className="row"><button className="btn dng" disabled={!del}>Delete permanently</button><button type="button" className="btn" onClick={() => { setConfirm(false); setDel(''); setDelErr('') }}>Cancel</button></div>
          </form>
        )}
      </div>
    </>
  )
}
