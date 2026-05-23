# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Commit authorship

Never list yourself as the author or co-author of a commit. The author of each commit must always be the human who requested the change. Do not add `Co-Authored-By: Claude` lines (or any other Claude attribution) to commit messages.

If you are unsure which identity to use, check `git log` to see which authors already appear in the repository's history, and ask if there is still doubt.

## Language

- **Source code, identifiers, and code comments**: English.
- **User-facing text** (page copy, UI labels, anything rendered in the browser for visitors): Argentinian Spanish (rioplatense). Neutral and clear — no slang, no exaggeration.
- **Git commit messages**: Argentinian Spanish, matching the existing lowercase, conversational style visible in `git log`.

Across all of the above, do **not** translate domain-specific terms that originate in English. Game names (Warmaster, Greathelm), rule names, unit types, scenario names, and similar terminology stay in English to preserve the established vocabulary used by the club and the wider community.

## Project layout

```
.
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # global site navbar (rendered above all routes)
│   │   ├── Footer.tsx           # global site footer (privacy/terms links, rendered below all routes)
│   │   ├── AuthMenu.tsx         # navbar sign-in button / avatar + account popup menu
│   │   └── ui/                  # shared UI primitives — use these before rolling your own
│   ├── context/                 # React context providers (e.g. AuthProvider / useAuth)
│   ├── hooks/                   # shared React hooks (e.g. useDocumentTitle)
│   ├── lib/
│   │   └── supabase.ts          # shared Supabase client
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── Privacy.tsx          # /privacy — privacy policy (required for Google OAuth)
│   │   ├── Terms.tsx            # /terms — terms of use
│   │   └── tools/
│   │       ├── GreathelmCards/  # one folder per tool route
│   │       └── WarmasterMap/
│   ├── App.tsx                  # router setup, wrapped in AuthProvider
│   ├── config.ts               # Supabase URL + publishable key (public, committed)
│   ├── main.tsx                 # React entry point
│   ├── index.css                # global styles + Tailwind v4 @theme tokens
│   └── vite-env.d.ts
├── supabase/
│   ├── config.toml              # Supabase CLI project config
│   └── migrations/              # SQL migrations (timestamped, pushed via pnpm db:push)
├── public/                      # static assets served verbatim
│   └── 404.html                 # SPA fallback for GH Pages
├── .env.example                 # template for the db:* scripts (SUPABASE_PROJECT_REF, etc.)
├── eslint.config.js
├── .prettierrc.json
├── .husky/                      # pre-commit hook
├── .github/workflows/deploy.yml # CI: lint → format-check → test → build → deploy
├── CLAUDE.md                    # this file
└── README.md
```

A typical tool route folder looks like this:

```
src/routes/tools/MyTool/
├── index.tsx          # route component, state owner, side-effect handlers
├── Controls.tsx       # left-panel form (uses shared primitives)
├── types.ts           # TypeScript types for the tool's data model
├── *-logic.ts         # pure functions (testable, no React, no DOM)
├── *.test.ts          # unit tests next to the modules they test
└── mytool.css         # tool-specific visuals, rules nested under .mytool-route
```

## Adding a new tool route

1. Create `src/routes/tools/MyTool/` mirroring the layout above. Use Greathelm or Warmaster as a reference.
2. Register the route in `src/App.tsx`. **Path without trailing slash** (`/tools/my-tool`, not `/tools/my-tool/`) — see [Known gotchas](#known-gotchas).
3. Add a navbar link in `src/components/Navbar.tsx`. Use `<Link>` (not `<a>`) since tools are internal React routes.
4. Add a tool card on the landing page in `src/routes/Home.tsx`.
5. Write unit tests for the pure logic in `*.test.ts` files next to the modules they test.
6. Update the docs — `CLAUDE.md` (project-layout tree at minimum) and `README.md` (project-structure section, and the tagline if the tool is significant). See [Keep the docs in sync](#keep-the-docs-in-sync).

## Auth and data (Supabase)

The site is **publicly browsable without signing in** — the tools work for anonymous visitors. Auth is additive: signing in with Google unlocks per-user features as we build them. Don't gate existing tools behind auth.

- **Client**: one shared `supabase` client in `src/lib/supabase.ts`. Import it; never call `createClient` elsewhere.
- **Connection details**: `src/config.ts` holds `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (the new `sb_publishable_…` key, not the legacy anon JWT). These are **committed on purpose** — the publishable key is a public client key whose only power is what Row Level Security grants. Do **not** move them to env vars or treat them as secrets. (Secrets like the DB password live in `.env`, used only by the `db:*` scripts, and are gitignored.)
- **Session access**: `AuthProvider` (in `src/context/AuthContext.tsx`) owns the session and exposes `useAuth()` → `{ session, signIn, signOut }`. The context is split across two files — `authContext.ts` (the `createContext` + `useAuth` hook) and `AuthContext.tsx` (the provider component) — because `eslint-plugin-react-refresh` forbids exporting a component and non-component from the same module. Follow that split for any new context.
- **Sign-in** is Google OAuth via `supabase.auth.signInWithOAuth`, redirecting back to `window.location.origin`. The navbar's `AuthMenu` renders the sign-in button when signed out and the avatar + account popup (name, email, sign out) when signed in.
- **Identity ↔ data mapping** is by **email**: `auth.jwt() ->> 'email'`. The `users` table has a unique, nullable `email` so a row can exist before a Google account links to it.

### Migrations

SQL migrations live in `supabase/migrations/`, timestamped (`pnpm db:migration:new <name>` scaffolds one). Apply them to the remote project with `pnpm db:push` after `pnpm db:link` (both read `.env`). **RLS is enabled on every table; access policies are added per-feature, not speculatively** — a new table starts locked (RLS on, no policies) and gains exactly the policies a feature needs. Mirror the security-definer RPC pattern (e.g. for reads that must not expose a restricted column) when a plain policy can't express the rule.

## Design tokens and primitives

**Use the shared UI components in `src/components/ui/`** before reaching for raw HTML elements or hand-rolled CSS:

| Primitive                                               | Use for                                                   |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `<Panel>`, `<PanelHead>`, `<PanelBody>`                 | Dark surface containers; pass `sticky` for sidebar panels |
| `<Button variant="primary" \| "secondary" \| "danger">` | Full-width gradient button                                |
| `<FormLabel htmlFor="...">`                             | Form field labels                                         |
| `<TextInput>`, `<Select>`                               | Styled form fields                                        |
| `<CheckboxRow checked={} onChange={}>`                  | Checkbox + label inline                                   |
| `<Row>`                                                 | 2-column grid                                             |

Design tokens (colors, surface shades, gradient stops) live in `src/index.css`'s `@theme` block. They are available both as CSS variables (`var(--color-accent)`) and as Tailwind utilities (`bg-accent`, `text-ink`, `border-line`).

When adding **tool-specific visuals** (card backgrounds, SVG containers, parchment textures, etc.), put them in the tool's `*.css` file with all rules **nested under `.mytool-route`** via CSS nesting (supported natively by Tailwind v4's Lightning CSS). Do not add unscoped class rules — they leak across tools.

Tool-scoped CSS variables should use a **semantic prefix that describes what they represent** (the artifact, not the tool letter), e.g. `--card-ink` and `--card-paper-*` in Greathelm, `--map-paper` and `--map-paper-ink` in Warmaster. Avoid plain `--ink` or `--paper` — they shadow the global `--color-*` tokens and confuse readers. Avoid `--g-*` or `--w-*` letter prefixes too — they're arbitrary and don't convey meaning.

## Responsive design

**This site is mobile-first.** Design and build for small screens first, then layer on larger layouts with `min-width` breakpoints (Tailwind's default mobile-first utilities — base styles target mobile, `sm:`/`md:`/`lg:` prefixes enhance for wider viewports). Never start from a desktop layout and try to cram it into a phone.

**Desktop still matters** — many tools (the Warmaster map, Greathelm card sheets) are genuinely more usable on a large screen, so the wide-viewport experience must be deliberate and polished, not an afterthought. Mobile-first is about the order you build in and the default that ships, not about neglecting desktop.

Practical implications:

- Default styles (no breakpoint prefix) should produce a working, legible single-column layout on a narrow phone.
- Sidebar/control panels that sit beside content on desktop should stack above or below it on mobile.
- Touch targets, font sizes, and spacing should be comfortable on a phone without zooming.
- Test both ends of the range — narrow phone and wide desktop — before considering a layout done.

## Quality gates

**Local pre-commit hook** (`.husky/pre-commit`) runs on every `git commit`:

- `lint-staged` → `eslint --fix` + `prettier --write` on staged files
- `tsc -b` → project-wide typecheck

The hook blocks the commit on failure. If a fix is genuinely needed and the hook is wrong, use `// eslint-disable-next-line <rule>` with a one-line justification — never `--no-verify`.

**CI** (`.github/workflows/deploy.yml`) runs on every push to `main`:

- `pnpm lint` → fails on any ESLint error
- `pnpm format:check` → fails if any file isn't Prettier-formatted
- `pnpm test` → fails if any Vitest test fails
- `pnpm build` → fails on type errors or build errors (build runs `tsc -b && vite build`)
- Deploys `dist/` to GitHub Pages on success

Available scripts:

```
pnpm lint           # ESLint check
pnpm lint:fix       # ESLint with auto-fix
pnpm format         # Auto-format with Prettier
pnpm format:check   # Check formatting without writing
pnpm typecheck      # tsc -b
pnpm test           # Run all Vitest tests once
pnpm test:watch     # Watch mode
pnpm dev            # Vite dev server (port 8000)
pnpm build          # Production build
pnpm preview        # Preview the production build locally

pnpm db:link              # Link to the remote Supabase project (run once; reads .env)
pnpm db:push              # Push pending migrations to the remote
pnpm db:migration:new foo # Scaffold a new timestamped migration
```

## Testing conventions

- Unit tests live next to the modules they test, named `*.test.ts`.
- Focus on **pure logic** — generators, data transformations, helpers. Skip React rendering tests and DOM interaction tests; the underlying bugs are usually caught more cheaply in pure-logic tests.
- The seeded PRNG (`WarmasterMap/prng.ts`) makes map/card generation fully deterministic, so tests can assert exact outputs without flakiness.
- Snapshot-style assertions should snapshot a **summary** of the output (item-type counts, labels, etc.), not full structures with floating-point positions — those make tests brittle to harmless refactors.

## Known gotchas

- **React Router v7 trailing slashes**: `<Route path="/foo/" />` (with trailing slash) silently breaks the entire `<Routes>` tree — no console error, no warning, just an empty render. Always declare paths without a trailing slash. Browser URLs ending in `/` already match no-slash routes via React Router's built-in normalization, so the defensive redirect route is both unnecessary and harmful.
- **pnpm 11 + jspdf's `core-js` build script**: `pnpm-workspace.yaml` holds the build approval (`core-js: false`). Don't delete it or pnpm commands will refuse to run cleanly (the install loops on the unresolved build approval).
- **html2canvas + jspdf are bundled, not CDN-loaded**: both are dynamically imported inside their export handlers so they don't bloat the initial bundle. Don't move them to top-level imports — that adds ~600 KB to the entry chunk.
- **Vite dev server directory-index resolution**: `vite.config.ts` includes a `publicDirIndexFallback` middleware that lets directory URLs in `public/` (e.g. `/tools/foo/`) resolve to their `index.html` during dev. Production static hosts handle this natively, so the middleware is dev-only.
- **Greathelm UI is currently in English**, in defiance of the Spanish language rule above. This is a known leftover from the original standalone HTML and is slated for translation. Do not treat it as a sanctioned pattern when writing new tool UIs — follow the language rule, not the precedent.

## Keep the docs in sync

`CLAUDE.md` and `README.md` describe the project as it currently is. When you change the project, update **both files in the same commit**:

- **Added a new tool route?** Add it to the project-layout tree in `CLAUDE.md`. If the tool is significant (something visitors would notice), mention it in `README.md`'s tagline.
- **Added a new non-tool route or major feature** (member list, event calendar, attendance tracker, OAuth login, Supabase-backed data, etc.)? Add it to the project-layout tree in `CLAUDE.md`. If it introduces new conventions (a data layer, a service module pattern, an auth context), add a dedicated subsection to `CLAUDE.md` so future sessions know to use it. Mention it in `README.md`'s tagline and/or tech-stack section if it's user-visible or changes the stack.
- **Added a new shared primitive in `components/ui/`?** Add it to the primitives table in `CLAUDE.md`'s "Design tokens and primitives".
- **Added or removed a `pnpm` script?** Update the script lists in both files.
- **Hit a new silent-failure gotcha (the kind you'd want to warn the next session about)?** Add it to "Known gotchas" with a one-paragraph explanation.
- **Changed a quality-gate behavior (new lint rule, new CI step, etc.)?** Update "Quality gates" in `CLAUDE.md` and the deployment paragraph in `README.md` if it's user-visible.
- **Changed the tech stack (added a major dep, swapped routers, etc.)?** Update the tech-stack section in `README.md` and any affected sections in `CLAUDE.md`.

A stale doc is worse than no doc — future AI sessions trust both as ground truth and will reproduce old patterns. If you remove or rename something, grep both files for references and update them. The pre-commit hook will not catch stale prose.
