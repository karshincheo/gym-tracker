# Pup Gains 🐾 — Gym Tracker

A happy, mobile-first gym tracker for **Upper Body** and **Lower Body** workouts.
The home page has two expandable sections — tap one open and edit that workout's
exercises, sets, reps, and weights right there. Weights auto-convert between **kg and
lbs** (type either, the other fills in). Every change saves to your device instantly
and syncs to the cloud, so **nothing ever gets lost**.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## How it works

- **Two workouts, one running list each.** Upper Body and Lower Body. Each is a single
  persistent list you keep editing — no dated history, no charts. Just your current numbers.
- **kg ↔ lbs auto-fill.** Weight is stored canonically in kg; pounds are derived on
  display, so the two columns can never disagree.
- **Local-first persistence.** Every edit writes to `localStorage` immediately (survives
  reload, quit/reopen, and works offline), then syncs to Supabase in the background.
  Offline edits queue and flush automatically when you reconnect. The top badge shows
  the state: *Saved to cloud ✓*, *Syncing…*, or *Offline — saved on device*.

## Cloud config (Supabase)

Cloud sync is optional — without config the app runs fully local-first. To enable it, set:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

They live in `.env.local` for local dev (gitignored). One table, `sessions`, stores each
workout as a row with a `jsonb` payload, keyed by a stable id per type. There is **no
login** by design — a single shared dataset behind the URL, so keep the URL private.
(To add a PIN later: gate the app shell and scope rows by a `user_token` column.)

## Deploy to Vercel

```bash
npx vercel login      # one-time
npx vercel deploy --prod
```

Set the two `NEXT_PUBLIC_*` env vars in the Vercel project settings to enable cloud
sync on the deployed site; without them it still works, saving to the device only.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase.

## Known quirk

> Note: running from a cloud-synced folder (OneDrive/Dropbox/iCloud) can stall the
> Next.js dev server, since those services lock files while syncing. If `npm run dev`
> hangs, copy the project to a plain local folder (e.g. `~/Projects/gym-tracker`) and
> run it there.
