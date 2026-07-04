# Slicly — URL Shortener

A full-stack URL shortener web application with a marketing landing page and a comprehensive link-management dashboard. Built with Next.js App Router, PostgreSQL, and Redis.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) v12 |
| Database | PostgreSQL (pg) |
| Caching & Rate Limiting | Redis (@upstash/redis) |
| Authentication | Custom JWT & Google OAuth |
| Fonts | Geist Sans + Geist Mono |

## Features

- **Hero shortener** — paste a URL on the landing page and instantly get a `slicely.in/<code>` short link with one-click copy
- **Dashboard** — manage all your links with search, sort, toggle active/inactive, delete, and copy-to-clipboard
- **Create Link Modal** — custom slug support, URL validation, and a live `slicely.in/<slug>` preview
- **Advanced Security** — **Password-protect** specific shortened links, and enforce **Multi-Method 2FA** (Authenticator App & Email OTP) for your account
- **Settings Dashboard** — manage global account configurations, toggle dual 2FA, and enable/disable global VirusTotal URL safety scanning
- **Auth pages** — secure sign-in and sign-up with email/password and Google OAuth support
- **Real-time analytics** — track clicks, active links, and engagement metrics
- **Responsive Navbar** — scroll-aware frosted glass effect with a mobile hamburger menu
- **Design system** — reusable `Button`, `Input`, `Modal`, `Badge`, and `CopyButton` primitives, all motion-animated

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page — Hero, Features, How It Works, Stats, CTA |
| `/auth/signin` | Sign-in form |
| `/auth/signup` | Sign-up form |
| `/dashboard` | Link management dashboard |
| `/dashboard/settings` | Security and account settings panel |
| `/secure/[slug]` | Password prompt for secured links |
| `*` | Animated 404 page |

## Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add the following environment variables:

```env
JWT_SECRET_KEY=your_jwt_secret
NEON_CONNECTION_STRING=your_postgres_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
VIRUSTOTAL_API_KEY=your_virustotal_api_key
RESEND_API_KEY=your_resend_api_key
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

## API Endpoints

The application includes several core API routes to handle authentication, URLs, and analytics:

| Endpoint | Description |
| --- | --- |
| `/api/urls` | Create and fetch short URLs |
| `/api/secure/[slug]` | Verify link passwords and log analytics |
| `/api/signin` | Authenticate user via email/password |
| `/api/signup` | Register new user via email/password |
| `/api/auth/google` | Authenticate user via Google OAuth |
| `/api/auth/me` | Fetch current authenticated user |
| `/api/2fa/*` | Setup, enable, disable, and verify TOTP & Email 2FA |
| `/api/dashboard` | Dashboard link statistics and data |
| `/api/public-stats` | Public platform statistics (e.g. total links, clicks) |
| `/api/account` | Manage user account settings |
| `/api/logout` | Clear authentication tokens |
