# Choon

**Choon | Live Music Near You** is a mobile-first live music discovery platform for finding gigs nearby and helping artists/venues fill rooms.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- SQLite (`better-sqlite3`) with auto-initialised schema + seed data
- JWT cookie auth (email + password)
- Leaflet map for venue/gig discovery

## MVP features shipped
- Public discovery home with map/list toggle, search and price filtering
- Gig cards with artist, venue, date/time, genres, vibe tags, and optional distance (geolocation)
- Gig detail page with directions, share, ticket link, save button
- Auth with roles: `user`, `artist`, `venue_admin`, `admin`
- Create gig flow for artists/venues
- Creator dashboard to cancel/resubmit gigs
- Saved gigs page
- Admin moderation dashboard (approve/hide gigs + reports view)
- Seeded venues and gigs for instant demo

## Local development
```bash
npm install
npm run dev
```
App runs on `http://localhost:3000`.

## Environment variables
Create `.env.local`:
```bash
AUTH_SECRET=replace-with-strong-random-string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=file:./data/choon.db
```

## Demo admin account
- Email: `admin@choon.au`
- Password: `admin123`

## Deployment notes
- Works on any Node host that supports Next.js (Vercel, Fly.io, Render).
- For production, switch `DATABASE_URL` to a managed Postgres and swap DB adapter (queries are already centralised in `src/lib`).
- Use object storage URLs for `poster_url` in the create-gig form (S3/Supabase Storage/etc).

## Product tone
Friendly, local, energetic, vibe-led and in Australian English.
