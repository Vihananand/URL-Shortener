# Snip.ly — URL Shortener

A URL shortener web application with a marketing landing page and a full link-management dashboard. Built as a polished frontend prototype — all data is mocked client-side, with clear `TODO` markers where real API calls should be wired in.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) v12 |
| Fonts | Geist Sans + Geist Mono |

## Features

- **Hero shortener** — paste a URL on the landing page and instantly get a `snip.ly/<code>` short link with one-click copy
- **Dashboard** — manage all your links with search, sort, toggle active/inactive, delete, and copy-to-clipboard
- **Create Link Modal** — custom slug support, URL validation, and a live `snip.ly/<slug>` preview
- **Auth pages** — sign-in and sign-up forms with validation, password strength indicator, and loading states
- **Animated stats bar** — count-up animation (1.2M links, 500M clicks, 50K users, 99.9% uptime) triggered on scroll
- **Responsive Navbar** — scroll-aware frosted glass effect with a mobile hamburger menu
- **Design system** — reusable `Button`, `Input`, `Modal`, `Badge`, and `CopyButton` primitives, all motion-animated

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page — Hero, Features, How It Works, Stats, CTA |
| `/auth/signin` | Sign-in form |
| `/auth/signup` | Sign-up form |
| `/dashboard` | Link management dashboard |
| `*` | Animated 404 page |

## Getting Started

```bash
npm install
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

## Planned API Endpoints

The following endpoints are marked with `TODO` comments and are ready to be implemented:

| Method | Endpoint | Used by |
| --- | --- | --- |
| `POST` | `/api/urls` | Landing hero shortener, Create Link Modal |
| `POST` | `/api/auth/signin` | Sign-in page |
| `POST` | `/api/auth/signup` | Sign-up page |
