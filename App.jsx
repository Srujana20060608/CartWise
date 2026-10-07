import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { CATEGORIES, PRODUCTS, BY_ID, fmt } from './data.js'
import { search } from './search.js'
import { useStore } from './store.js'
import { api } from './api.js'
import { SignIn, SignUp, Forgot, Account, UserMenu } from './AuthPages.jsx'

const MK = { Amazon: '#ff9900', Flipkart: '#2874f0', Meesho: '#f43397' }
const URLS = { Amazon: (q) => 'https://www.amazon.in/s?k=' + encodeURIComponent(q), Flipkart: (q) => 'https://www.flipkart.com/search?q=' + encodeURIComponent(q), Meesho: (q) => 'https://www.meesho.com/search?q=' + encodeURIComponent(q) }
const EXAMPLES = ['iphone', 'wireless headphones', 'running shoes', 'sunscreen', 'air fryer', 'laptop under 50000', 'budget headphones']

function useHash() {
  const [h, setH] = useState(location.hash || '#/')
  useEffect(() => { const f = () => { setH(location.hash || '#/'); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h
}
const Loading = () => <main className="wrap"><p className="muted">Loading…</p></main>
const Img = ({ p, cls }) => <img className={cls} src={p.image} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
const Market = ({ m }) => <span className="mk" style={{ background: MK[m] }}>{m}</span>

function Card({ p, S }) {
  const wished = S.wish.includes(p.id)
  return (
    <div className="card">
      <a href={'#/product/' + p.id} className="imgwrap"><Img p={p} cls="pimg" /><span className="score">⚡ {p.aiScore}</span></a>
      <div className="cbody">
        <div className="brand">{p.brand} · {p.sub}</div>
        <a href={'#/product/' + p.id} className="pname">{p.name}</a>
        <div className="row"><span className="stars">★ {p.rating.toFixed(1)}</span><span className="muted">({fmt(p.reviews)} reviews)</span></div>
        <div className="price">₹{fmt(p.minPrice)} <span className="muted small">– ₹{fmt(p.maxPrice)}</span></div>
        <div className="pick">🤖 Pick: <Market m={p.best.market} /> ₹{fmt(p.best.price)}</div>
        <div className="row btns">
          <a className="btn" href={'#/product/' + p.id}>Compare 10 offers</a>
          <button className={'ico' + (wished ? ' on' : '')} onClick={() => S.toggleWish(p.id)} title="Wishlist">{wished ? '♥' : '♡'}</button>
          <button className="ico" onClick={() => S.addCart(p.id)} title="Add to cart">🛒</button>
        </div>
      </div>
    </div>
  )
}

function Listing({ title, sub, items, S, defaultSort = 'rec' }) {
  const [sort, setSort] = useState(defaultSort), [minR, setMinR] = useState(0), [cap, setCap] = useState('')
  const [market, setMarket] = useState('')
  useEffect(() => { setSort(defaultSort) }, [items, defaultSort])
  const list = useMemo(() => {
    let l = items.filter((p) => p.rating >= minR && (!cap || p.minPrice <= Number(cap)) && (!market || p.offers.some((o) => o.market === market && o.stock !== 'Out of stock')))
    const s = { low: (a, b) => a.minPrice - b.minPrice, high: (a, b) => b.minPrice - a.minPrice, rating: (a, b) => b.rating - a.rating, reviews: (a, b) => b.reviews - a.reviews, score: (a, b) => b.aiScore - a.aiScore }[sort]
    return s ? [...l].sort(s) : l
  }, [items, sort, minR, cap, market])
  return (
    <main className="wrap">
      <h2 className="h2">{title}</h2>
      <p className="muted">{sub} · showing {list.length}</p>
      <div className="filters">
        <label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">Recommended</option><option value="score">Highest AI score</option><option value="low">Price: low → high</option><option value="high">Price: high → low</option><option value="rating">Top rated</option><option value="reviews">Most reviewed</option></select></label>
        <label>Min rating <select value={minR} onChange={(e) => setMinR(Number(e.target.value))}><option value="0">Any</option><option value="3.5">3.5★+</option><option value="4">4★+</option><option value="4.3">4.3★+</option></select></label>
        <label>Max price ₹ <input type="number" min="0" placeholder="no limit" value={cap} onChange={(e) => setCap(e.target.value)} /></label>
        <label>Marketplace <select value={market} onChange={(e) => setMarket(e.target.value)}><option value="">All</option><option>Amazon</option><option>Flipkart</option><option>Meesho</option></select></label>
      </div>
      {list.length === 0 ? <Empty /> : <div className="grid">{list.map((p) => <Card key={p.id} p={p} S={S} />)}</div>}
    </main>
  )
}
const Empty = ({ q }) => <div className="empty"><div className="big">🫠</div><h3>{q ? `No products found for "${q}"` : 'Nothing matches those filters'}</h3><p className="muted">Try headphones, iphone, shoes, sunscreen, air fryer or laptop.</p></div>

function Home({ S }) {
  const top = [...PRODUCTS].sort((a, b) => b.aiScore - a.aiScore).slice(0, 8)
  const trending = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 8)
  return (
    <main className="wrap">
      <section className="hero">
        <div className="sticker">✨ 350 products · 3 marketplaces · 0 tab-hopping</div>
        <h1>Stop scrolling.<br /><span className="grad">Start choosing.</span> 🔥</h1>
        <p>CartWise lines up Amazon, Flipkart & Meesho offers, then tells you the best pick based on <b>price + reviews</b>.</p>
        <div className="chips">{EXAMPLES.map((e) => <a key={e} className="chip" href={'#/search?q=' + encodeURIComponent(e)}>{e}</a>)}</div>
      </section>
      <h2 className="h2">Explore categories</h2>
      <div className="cats">{CATEGORIES.map((c) => <a key={c.id} href={'#/category/' + c.id} className="cat" style={{ background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}><span>{c.emoji}</span><b>{c.name}</b><small>35 products</small></a>)}</div>
      <h2 className="h2">⚡ CartWise top picks</h2><div className="grid">{top.map((p) => <Card key={p.id} p={p} S={S} />)}</div>
      <h2 className="h2">📈 Trending (most reviewed)</h2><div className="grid">{trending.map((p) => <Card key={p.id} p={p} S={S} />)}</div>
      <p className="note">Marketplace prices, ratings & reviews are simulated demo data. "Open" buttons go to each store's real search page.</p>
    </main>
  )
}

function ProductPage({ id, S }) {
  const p = BY_ID[id]
  if (!p) return <main className="wrap"><Empty /></main>
  const live = p.offers.filter((o) => o.stock !== 'Out of stock')
  const save = p.maxPrice - p.minPrice
  return (
    <main className="wrap">
      <a href={'#/category/' + p.catId} className="muted">← {p.category}</a>
      <div className="pd">
        <Img p={p} cls="pdimg" />
        <div>
          <div className="brand">{p.brand} · {p.sub}</div>
          <h1 className="pdname">{p.name}</h1>
          <div className="row"><span className="stars">★ {p.rating.toFixed(1)}</span><span className="muted">{fmt(p.reviews)} reviews across 3 marketplaces</span><span className="score inline">⚡ AI {p.aiScore}/100</span></div>
          <div className="price big">₹{fmt(p.minPrice)} <span className="muted small">lowest · up to ₹{fmt(p.maxPrice)}</span></div>
          <div className="row btns"><button className="btn solid" onClick={() => S.addCart(p.id)}>🛒 Add to cart</button><button className="btn" onClick={() => S.toggleWish(p.id)}>{S.wish.includes(p.id) ? '♥ Wishlisted' : '♡ Wishlist'}</button></div>
        </div>
      </div>
      <div className="reco"><b>🤖 I'll recommend this based on price and reviews:</b><div>{p.headline}</div></div>
      <div className="stats"><div><small>Lowest</small><b>₹{fmt(p.minPrice)}</b></div><div><small>Highest</small><b>₹{fmt(p.maxPrice)}</b></div><div><small>Average</small><b>₹{fmt(p.avgPrice)}</b></div><div><small>You can save</small><b className="green">₹{fmt(save)}</b></div></div>
      <h2 className="h2">All 10 offers (Amazon + Flipkart + Meesho)</h2>
      <div className="tablewrap"><table className="offers"><thead><tr><th>#</th><th>Store</th><th>Seller</th><th>Price</th><th>Delivery</th><th>Total</th><th>Rating</th><th>Reviews</th><th>Stock</th><th>Score</th><th></th></tr></thead><tbody>
        {p.offers.map((o, i) => (
          <tr key={i} className={o === p.best ? 'best' : o.stock === 'Out of stock' ? 'oos' : ''}>
            <td>{i + 1}</td><td><Market m={o.market} />{o === p.best && <span className="tag">TOP PICK</span>}</td><td>{o.seller}<div className="muted small">{o.eta}</div></td>
            <td><b>₹{fmt(o.price)}</b><div className="muted small"><s>₹{fmt(o.original)}</s> {o.discount}% off</div></td>
            <td>{o.delivery ? '₹' + o.delivery : 'Free'}</td><td><b>₹{fmt(o.price + o.delivery)}</b></td>
            <td className="stars">★ {o.rating.toFixed(1)}</td><td>{fmt(o.reviews)}</td><td className={o.stock === 'In stock' ? 'green' : o.stock === 'Out of stock' ? 'red' : 'amber'}>{o.stock}</td>
            <td><div className="bar"><i style={{ width: o.score + '%' }} /></div>{o.score}</td>
            <td><a className="btn small" target="_blank" rel="noreferrer" href={URLS[o.market](p.name)}>Open ↗</a></td>
          </tr>))}
      </tbody></table></div>
      <p className="note">Score = 45% price (incl. delivery) + 55% rating weighted by review count. {live.length} of 10 offers in stock. Demo data.</p>
    </main>
  )
}

function Cart({ S }) {
  const rows = S.cart.map((c) => ({ ...c, p: BY_ID[c.id] })).filter((r) => r.p)
  const total = rows.reduce((s, r) => s + r.p.best.price * r.qty, 0)
  if (!rows.length) return <main className="wrap"><div className="empty"><div className="big">🛒</div><h3>Your cart is empty</h3><a className="btn solid" href="#/">Go find something</a></div></main>
  const order = async () => {
    if (!S.user) { location.hash = '#/signin?next=' + encodeURIComponent('/cart'); return }
    try { await S.placeOrder(); location.hash = '#/account?tab=orders' } catch (e) { S.say(e.message) }
  }
  return (
    <main className="wrap"><h2 className="h2">Your cart</h2>
      {rows.map((r) => (<div className="crow" key={r.id}><Img p={r.p} cls="cimg" /><div className="grow"><a href={'#/product/' + r.id} className="pname">{r.p.name}</a><div className="muted small">Best offer: <Market m={r.p.best.market} /> ₹{fmt(r.p.best.price)}</div></div>
        <div className="qty"><button onClick={() => S.setQty(r.id, r.qty - 1)}>−</button><b>{r.qty}</b><button onClick={() => S.setQty(r.id, r.qty + 1)}>+</button></div><b>₹{fmt(r.p.best.price * r.qty)}</b><button className="ico" onClick={() => S.setQty(r.id, 0)}>✕</button></div>))}
      <div className="total">Total <b>₹{fmt(total)}</b></div>
      {!S.user && <p className="alert">Sign in or create an account to place your order. Your cart will be kept.</p>}
      <div className="row end"><button className="btn solid" onClick={order}>{S.user ? 'Place order' : 'Sign in to place order'}</button></div>
      <p className="note">Demo checkout – no payment is taken. The server recalculates prices when you order.</p></main>
  )
}

export default function App() {
  const h = useHash()
  // user: undefined = still checking the session, null = signed out, object = signed in
  const [user, setUser] = useState(undefined), [offline, setOffline] = useState(false)
  const uid = user === undefined ? undefined : user ? user.id : null
  const [gCart, setGCart] = useStore('cw_cart', []), [gWish, setGWish] = useStore('cw_wish', [])   // guest data (this browser)
  const [srv, setSrv] = useState({ cart: [], wish: [], orders: [] })                              // account data (server)
  const [toast, setToast] = useState('')
  const [path, qs] = h.slice(1).split('?'), params = new URLSearchParams(qs || ''), parts = path.split('/').filter(Boolean)
  const [q, setQ] = useState(params.get('q') || '')
  useEffect(() => { if (parts[0] === 'search') setQ(params.get('q') || '') }, [h])
  const say = (t) => { setToast(t); setTimeout(() => setToast(''), 2200) }

  // Session: checked on load, every minute, whenever the tab regains focus, and when the server pushes an "auth" event.
  const refreshMe = useCallback(() => api('GET', '/auth/me')
    .then((r) => { setOffline(false); setUser((p) => (JSON.stringify(p) === JSON.stringify(r.user) ? p : r.user)) })
    .catch((e) => { if (e.offline) { setOffline(true); setUser((p) => (p === undefined ? null : p)) } }), [])
  useEffect(() => {
    refreshMe()
    const t = setInterval(refreshMe, 60000)
    addEventListener('focus', refreshMe)
    return () => { clearInterval(t); removeEventListener('focus', refreshMe) }
  }, [])

  // Account data lives on the server. A live connection (Server-Sent Events) pushes changes made in any other tab or device.
  const loadState = useCallback(() => api('GET', '/state').then(setSrv).catch(() => {}), [])
  useEffect(() => {
    if (!uid) { setSrv({ cart: [], wish: [], orders: [] }); return }
    loadState()
    const es = new EventSource('/api/events')
    es.addEventListener('sync', loadState)
    es.addEventListener('auth', refreshMe)
    es.onerror = () => refreshMe()
    return () => es.close()
  }, [uid])

  const fail = (e) => { say(e.message); loadState() }
  const bump = (cart, id, d) => (cart.find((x) => x.id === id) ? cart.map((x) => (x.id === id ? { ...x, qty: Math.min(20, x.qty + d) } : x)) : [...cart, { id, qty: 1 }])
  const mergeGuest = async () => {
    if (!gCart.length && !gWish.length) return
    try { await api('POST', '/merge', { cart: gCart, wish: gWish }) } catch {}
    setGCart([]); setGWish([])
  }
  const S = {
    cart: user ? srv.cart : gCart, wish: user ? srv.wish : gWish, orders: srv.orders, user, say,
    signIn: async (v) => { const r = await api('POST', '/auth/signin', v); await mergeGuest(); setUser(r.user) },
    signUp: async (v) => { const r = await api('POST', '/auth/signup', { name: v.name, email: v.email, password: v.password }); await mergeGuest(); setUser(r.user) },
    signOut: async () => { try { await api('POST', '/auth/signout') } catch {} setUser(null) },
    updateProfile: async (v) => { const r = await api('PATCH', '/account', v); setUser(r.user) },
    changePassword: (current, next) => api('POST', '/account/password', { current, next }),
    deleteAccount: async (password) => { await api('DELETE', '/account', { password }); setUser(null) },
    placeOrder: async () => { const r = await api('POST', '/orders'); setSrv({ cart: r.cart, wish: r.wish, orders: r.orders }); say('Order placed 🎉'); return r.order },
    addCart: (id) => {
      if (user) { setSrv((x) => ({ ...x, cart: bump(x.cart, id, 1) })); api('POST', '/cart/items', { id }).catch(fail) }
      else setGCart((c) => bump(c, id, 1))
      say('Added to cart 🛒')
    },
    setQty: (id, qty) => {
      qty = Math.min(20, qty)
      const apply = (c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x)))
      if (user) { setSrv((x) => ({ ...x, cart: apply(x.cart) })); api('PUT', '/cart/items/' + id, { qty: Math.max(0, qty) }).catch(fail) }
      else setGCart(apply)
    },
    toggleWish: (id) => {
      const on = (user ? srv.wish : gWish).includes(id)
      if (user) { setSrv((x) => ({ ...x, wish: on ? x.wish.filter((i) => i !== id) : [...x.wish, id] })); api(on ? 'DELETE' : 'PUT', '/wishlist/' + id).catch(fail) }
      else setGWish((w) => (on ? w.filter((i) => i !== id) : [...w, id]))
    },
  }

  // Reactions to sign in / sign out, including ones that happen in another tab or when a session expires.
  const prevUid = useRef(uid)
  useEffect(() => {
    const was = prevUid.current; prevUid.current = uid
    if (was === undefined || was === uid) return
    if (uid) say(`Welcome, ${user.name.split(' ')[0]} 👋`); else say('You are signed out')
  }, [uid])
  const authPage = ['signin', 'signup', 'forgot'].includes(parts[0]), needsAuth = parts[0] === 'account'
  const prevGuard = useRef(uid)
  useEffect(() => {
    const was = prevGuard.current; prevGuard.current = uid
    if (uid === undefined) return
    if (!uid && needsAuth) location.replace(was ? '#/' : '#/signin?next=' + encodeURIComponent(h.slice(1)))
    if (uid && authPage) { const n = params.get('next'); location.replace(n && n.startsWith('/') ? '#' + n : '#/') }
  }, [uid, h])
  const submit = (e) => { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent(q) }
  let page
  if (parts[0] === 'search') { const items = search(params.get('q') || ''); page = items.length ? <Listing title={`Results for "${params.get('q')}"`} sub={`CartWise found ${items.length} products, ranked by relevance + AI score`} items={items} S={S} /> : <main className="wrap"><Empty q={params.get('q')} /></main> }
  else if (parts[0] === 'category') { const c = CATEGORIES.find((x) => x.id === parts[1]); page = c ? <Listing title={`${c.emoji} ${c.name}`} sub="35 products" items={PRODUCTS.filter((p) => p.catId === c.id).sort((a, b) => b.aiScore - a.aiScore)} S={S} /> : <main className="wrap"><Empty /></main> }
  else if (parts[0] === 'product') page = <ProductPage id={parts[1]} S={S} />
  else if (parts[0] === 'cart') page = <Cart S={S} />
  else if (parts[0] === 'signin') page = user === undefined ? <Loading /> : user ? null : <SignIn S={S} next={params.get('next')} />
  else if (parts[0] === 'signup') page = user === undefined ? <Loading /> : user ? null : <SignUp S={S} next={params.get('next')} />
  else if (parts[0] === 'forgot') page = user === undefined ? <Loading /> : user ? null : <Forgot S={S} />
  else if (parts[0] === 'account') page = user === undefined ? <Loading /> : user ? <Account S={S} tab={params.get('tab')} /> : null
  else if (parts[0] === 'wishlist') page = <Listing title="♥ Your wishlist" sub="Saved products" items={S.wish.map((i) => BY_ID[i]).filter(Boolean)} S={S} />
  else page = <Home S={S} />
  return (
    <>
      <header className="hdr"><div className="wrap hrow">
        <a href="#/" className="logo">cart<span>wise</span>⚡</a>
        <form onSubmit={submit} className="sbox"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What are you looking for? (try: iphone)" /><button>Search</button></form>
        <a href="#/wishlist" className="nav">♥ {S.wish.length}</a><a href="#/cart" className="nav">🛒 {S.cart.reduce((n, c) => n + c.qty, 0)}</a><UserMenu S={S} />
      </div>
      <nav className="strip">{CATEGORIES.map((c) => <a key={c.id} href={'#/category/' + c.id}>{c.emoji} {c.name}</a>)}</nav></header>
      {offline && <div className="offline" role="alert">Can't reach the CartWise server, so sign in and your account are unavailable. Start it with <b>npm run dev</b>.</div>}
      {page}
      {toast && <div className="toast">{toast}</div>}
      <footer className="foot">CartWise · Shop Smarter. Decide Better. · Prototype with simulated marketplace data</footer>
    </>
  )
}
