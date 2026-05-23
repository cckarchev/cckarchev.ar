# cckarchev.ar

Community site for **Centro Cultural Karchev (CCK)**, a tabletop gaming club. Hosts a growing set of tools — currently a Warmaster Revolution map generator and a Greathelm card generator — plus a club member list, with event calendars and attendance tracking planned next, backed by Supabase. Visitors can browse everything anonymously; signing in with Google unlocks per-member features.

## Tech stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** for the dev server and bundling
- **Tailwind v4** for utilities; design tokens in `src/index.css`'s `@theme` block
- **React Router v7** (`BrowserRouter` + `Routes`)
- **Supabase** (Postgres + auth via Google OAuth) — shared client in `src/lib/supabase.ts`, migrations in `supabase/migrations/`
- **Vitest** for unit tests
- **ESLint + Prettier + Husky** for code quality, enforced both pre-commit and in CI
- **GitHub Pages** for hosting at the custom apex domain `cckarchev.ar`

## Local development

```sh
pnpm install
pnpm dev
```

Dev server starts on http://localhost:8000 and binds to all interfaces (so it's reachable from outside a local machine / LXC container).

## Scripts

```sh
pnpm dev            # dev server with HMR
pnpm build          # production build → dist/
pnpm preview        # preview the production build locally
pnpm test           # run unit tests once
pnpm test:watch     # watch mode
pnpm lint           # ESLint check
pnpm format         # apply Prettier to the whole tree
pnpm format:check   # check Prettier formatting without writing
pnpm typecheck      # tsc -b (no emit)

pnpm db:link              # link to the remote Supabase project (run once; reads .env)
pnpm db:push              # push pending migrations to the remote
pnpm db:migration:new foo # scaffold a new timestamped migration
```

## Supabase

The app's connection details (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) live in `src/config.ts` and are committed — the publishable key (`sb_publishable_…`) is a public client key, safe to expose. The `db:*` scripts read a gitignored `.env` (copy `.env.example`) for the project ref and DB password used to link and push migrations. See [`CLAUDE.md`](./CLAUDE.md) for the auth/RLS conventions.

See [`CLAUDE.md`](./CLAUDE.md) for the development guide — project layout, conventions, how to add a new tool route, design tokens and primitives, quality gates, and known gotchas. Both files are kept in sync; when you change one in a way the other reflects, update the other in the same commit.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: lint → format check → tests → build → deploy to GitHub Pages. Any failure blocks the deploy. The site is served from the `cckarchev/cckarchev.ar` repo at the apex domain.
