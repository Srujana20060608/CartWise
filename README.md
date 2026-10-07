# CartWise ⚡ – Shop Smarter. Decide Better.

Compare Amazon, Flipkart and Meesho offers for 350 products, get a price + reviews recommendation, and keep a
cart, wishlist and order history in a real account. Front end: React + Vite. Back end: Node + Express.

## Run it (Windows Command Prompt or any terminal)

1. Install Node.js LTS from https://nodejs.org (version 18 or newer).
2. In this folder:

       npm install
       npm run dev

   This starts the API on http://localhost:3001 and the website on http://localhost:5173 (opens automatically).

**Single-server mode** (what you would deploy): `npm start` builds the site and serves website + API together
on http://localhost:3001.

**Check everything works:** `npm test` starts a throw-away server and runs 25 end-to-end checks.

## What the back end does

| Area | Details |
| --- | --- |
| Sign up / sign in / sign out | Passwords hashed with scrypt (never stored in clear). Sessions are random tokens in an HttpOnly, SameSite cookie; only a hash of the token is stored. "Keep me signed in" = 30 days, otherwise 1 day. |
| Brute-force protection | 5 wrong passwords lock that email for 30 s (countdown shown). Per-IP limits on sign in, sign up, reset and email checks. Unknown email and wrong password look identical. |
| Forgot / reset password | 6-digit code, valid 10 minutes, single use, 5 tries. A reset signs out every device. |
| Account | Edit profile, change password (signs out other devices), delete account (needs password). |
| Cart, wishlist, orders | Stored per account on the server, so they follow you to any device. "Place order" is calculated on the server from its own prices, never from numbers sent by the browser. Guest cart/wishlist merge into the account on sign in. |
| Live updates | The browser keeps a Server-Sent Events connection open. Add to cart, place an order, sign out or change your password on one tab/device and every other open tab/device updates within a moment. Expired or revoked sessions sign you out live. |
| Security basics | CSRF protection (Origin check + SameSite cookies), CSP and other security headers, request size limit, input validation on every endpoint. |

API summary (all under `/api`): `GET /health`, `GET /auth/me`, `GET /auth/email-available`, `POST /auth/signup`,
`POST /auth/signin`, `POST /auth/signout`, `POST /auth/forgot`, `POST /auth/reset`, `PATCH /account`,
`POST /account/password`, `DELETE /account`, `GET /state`, `POST /cart/items`, `PUT /cart/items/:id`,
`PUT|DELETE /wishlist/:id`, `POST /merge`, `POST /orders`, `GET /events`.

## Project layout

    server/index.js      Express app: security headers, CSRF check, serves dist/ in production
    server/routes.js     All API endpoints and the live-event stream
    server/security.js   Password hashing, cookies, rate limiting
    server/db.js         Database (JSON file at data/db.json, written atomically)
    server/mail.js       Sends the reset code (console or SMTP)
    server/test.js       End-to-end tests
    src/                 React app (App.jsx, AuthPages.jsx, api.js, data.js, search.js)
    .env.example         Optional settings (copy to .env)

## Settings (optional, copy `.env.example` to `.env`)

- `PORT` – API port (default 3001; if you change it also change the proxy target in `vite.config.js`).
- `SMTP_URL`, `MAIL_FROM` – turn on real password-reset emails (e.g. `smtps://user:pass@smtp.gmail.com:465`).
  **Without SMTP the code is printed in the server console and shown on the reset page**, so password reset
  works locally. Once SMTP is set, codes are only emailed.
- `COOKIE_SECURE=true` – set when the site is served over https. `TRUST_PROXY=1` – set behind a reverse proxy.
- `DB_FILE` – custom database file location.

## Before real customers use it

- The database is a single JSON file: perfect for development and small deployments on one server. For many users,
  or more than one server instance, swap `server/db.js` for PostgreSQL or MongoDB (the routes only use `db` and `save()`).
- Serve it over https (use a host such as Render, Railway or Fly, or put nginx/Caddy in front) and set `COOKIE_SECURE=true`.
- Product prices, ratings and reviews are still simulated demo data (`src/data.js`); real marketplace prices
  need the stores' official affiliate/product APIs, called from the server. Checkout is a demo: no payment is taken.
- Back up `data/db.json`.
