# עוצמת התמרון · מרכז הניהול

Hebrew RTL operations dashboard for Otzmat Timron. Built with **Next.js App Router**, ready for Vercel.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + a small set of shadcn/ui components
- In-memory **MockDataStore** behind a `DataStore` interface (no database yet)

## Prerequisites

- Node.js 20+ (recommended 22+)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint
```

## Routes

| Path | Content |
|------|---------|
| `/` | Home KPIs + featured systems + open tasks |
| `/systems` | System directory (links only) |
| `/employees` | Employees table |
| `/vehicles` | Vehicles + current assignment |
| `/properties` | Properties |
| `/legal` | Legal cases |
| `/fines` | Fines / fees |
| `/tasks` | Tasks |

## Data layer

All pages read through `getDataStore()` from `lib/data`:

- `lib/data/types.ts` — domain types
- `lib/data/store.ts` — `DataStore` interface (read methods)
- `lib/data/mock-store.ts` — fake demo data
- `lib/data/system-catalog.ts` — company systems seed (from the previous catalog)

To swap in Supabase later: implement `DataStore` and return it from `getDataStore()`.

## Deploy (Vercel)

Connect the repo to Vercel. Default Next.js settings are enough — no env vars required for the mock store.

## Out of scope (for now)

- Auth / roles
- CRUD forms
- Live integrations (Gmail, Rivhit, Priority, etc.)
- Database
