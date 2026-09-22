# Source integration progress

## Verified on 22 September 2026

- The latest work is on `migrate/nextjs-app-router`, based on `95d787a`.
- TimeWatch browser login succeeded. Its dashboard exposes attendance reporting counts for today, yesterday and the same weekday last week. The account explicitly denies access to hours versus standard. Those counts are a reporting summary, not payroll or employee-level attendance.
- The user completed Google sign-in. A bounded Gmail search and selected messages were read. The local sample includes invoice notices and payment reminders; it is not a complete invoice ledger. Road 6 PDF attachments were identified, but their contents and totals were not parsed.
- No credentials, cookies, document-access tokens or mail bodies are stored in tracked files.

## Local preview

Private snapshots live in ignored `.local-data/timewatch.json` and `.local-data/gmail.json`. They contain only the selected summary fields needed by the UI. They are not checked in or copied into `public/`.

```bash
LOCAL_SOURCE_SNAPSHOTS=1 npm run dev -- --hostname 127.0.0.1 --port 5173
```

The reader requires BOTH `NODE_ENV=development` and `LOCAL_SOURCE_SNAPSHOTS=1`. Production builds never read these snapshots, even if the opt-in variable is present. Missing files fall back to explicitly labeled mock adapters; invalid files report an error. The detail pages show an unavailable state instead of invented data.

- `/` contains separate imported summaries alongside the existing demo records.
- `/systems/timewatch` shows dated counts, comparison bars, the access limitation, and a source link.
- `/systems/gmail` shows sampled conversations, supplier counts, notes and links to Gmail. Unknown amounts remain `null`; payment reminders are unverified signals, not confirmed debts. Thread counts must not be interpreted as invoice counts.

## What is not connected yet

Browser authentication does not provide a persistent API integration. There is no scheduled sync, automatic attachment extraction or production source-data storage in this change. The previous mocks for unrelated systems remain mocks.

Next steps: configure a server-side Google OAuth application with read-only mail scope and explicit user consent; obtain a documented TimeWatch API/export integration and suitable account permissions. Keep secrets in server-side secret storage. Add authenticated persistence, duplicate-document detection, verified amount extraction, and a sync log before enabling automated BI updates. Never infer payment completion from an invoice or reminder alone.

## Validation

```bash
node --experimental-strip-types --test tests/source-snapshots.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

The tests cover local-only gating, invalid input, unknown monetary amounts, duplicate records and unsafe source links. Test fixtures are fictional.
