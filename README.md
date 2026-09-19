# עוצמת התמרון · מרכז הניהול

Hebrew RTL operations dashboard for Otzmat Timron. Built with **Next.js App Router**, ready for Vercel.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui primitives
- Supabase Auth + Postgres via `DataStore` (MockDataStore fallback without env)

## Prerequisites

- Node.js 20+ (recommended 22+)

## Environment

Copy `.env.local.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Without these variables the app runs against `MockDataStore` and skips the auth gate.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

```bash
npm run build
npm run start
npm run lint
```

## Auth & roles

- Email/password sign-in against Supabase Auth (`/login`)
- Profile (`full_name`, `role`) loaded from `profiles`
- Roles: `admin` | `operations` | `accounting` | `viewer`
- CRUD UI is gated by role (viewers are read-only)
- Users are created manually in the Supabase dashboard (no signup page)

## Data layer

Pages use `await getDataStore()`:

- `SupabaseDataStore` when env is set (soft-delete via `deleted_at`, vehicle assignment history)
- `MockDataStore` otherwise

## Deploy (Vercel)

Set the two `NEXT_PUBLIC_SUPABASE_*` env vars in the project settings.
