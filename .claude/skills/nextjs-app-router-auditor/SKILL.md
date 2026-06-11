---
name: nextjs-app-router-auditor
description: >-
  Audits Next.js 16 App Router patterns in ai-content-publisher — page vs client
  components, searchParams/post_id routing, Sidebar route sync, build/typecheck
  validation, and Next 16 breaking changes. Use when adding or changing routes,
  fixing RSC/client boundaries, ReviewDashboard lint issues, or build failures.
---

# Next.js App Router Auditor — ai-content-publisher

## Purpose

Keep routing, component boundaries, and build health aligned with **Next.js 16** conventions for this app — not Next 14/15 patterns from training data.

## Critical Rule

Read `node_modules/next/dist/docs/` before changing App Router code. See also `head-office-app/AGENTS.md`.

## App Layout

```text
head-office-app/src/
├── app/                    # One folder per route (App Router)
│   ├── page.tsx            # Home redirect / landing
│   ├── create/page.tsx
│   ├── briefs/page.tsx
│   ├── dashboard/page.tsx
│   └── ...                 # 17 routes total
├── components/
│   ├── Sidebar.tsx         # Route config — keep in sync with app/
│   ├── PostIdEmptyState.tsx
│   └── ui/                 # shadcn primitives
└── lib/                    # Business logic (no "use client" unless needed)
```

**Route source of truth for nav:** `src/components/Sidebar.tsx`

## URL Patterns

| Pattern | Usage |
|---------|--------|
| `/create` | Starts new `post_id` session |
| `/briefs?post_id=demo-001` | Post-dependent workflow pages |
| `/dashboard` | Aggregates — no post_id required |
| `/settings` | Env/API config (minimal Phase 1) |

Server `page.tsx` may read `searchParams` and pass to client children. Client pages use `useSearchParams()` inside `<Suspense>` when needed.

## Component Boundary Checklist

- [ ] `"use client"` only where hooks, browser APIs, or event handlers are required
- [ ] `localStorage` / `window` only in client components or `useEffect`
- [ ] Supabase browser client (`src/lib/supabase/client.ts`) — client components only
- [ ] Supabase server client (`src/lib/supabase/server.ts`) — Server Components, Route Handlers, Server Actions only
- [ ] No service role key in client bundle (`SUPABASE_SERVICE_ROLE_KEY` must stay server-only)

## Common Issues in This Codebase

| Issue | Where | Fix pattern |
|-------|-------|-------------|
| ESLint `setState` in effect | `ReviewDashboard.tsx` | Defer updates; hoist handlers |
| Missing empty state | `/rules` | Wrap with `PostIdEmptyState` like `/briefs` |
| Workspace root warning | build output | Multiple lockfiles — fix only if tasked |
| Async page props | Next 16 | `searchParams` may be Promise — await in server components |

## Validation (required after route changes)

```bash
cd head-office-app
npm run build
npm run typecheck
npm run lint
```

All three must pass (0 errors; pre-existing warnings in `.claude/skills/` driver.mjs are out of scope unless tasked).

## Audit Workflow

1. **Map the route** — `src/app/[route]/page.tsx` + any colocated components
2. **Check Sidebar entry** — label, href, icon match
3. **Verify post_id contract** — empty state vs loader component
4. **Trace data loading** — sync localStorage vs async Supabase (INT-02+)
5. **Run build/typecheck/lint**
6. **Report** — boundary violations, missing Suspense, secret exposure risk

## Output Format

```markdown
## App Router Audit — [route or area]

### Files inspected
- [...]

### Findings
| Severity | File | Issue | Recommended fix |
|----------|------|-------|-----------------|

### Route / Sidebar sync
- [ ] Sidebar href matches app folder

### Validation
- build: PASS/FAIL
- typecheck: PASS/FAIL
- lint: PASS/FAIL
```

## Forbidden Actions

- Adding Pages Router (`pages/`) alongside App Router
- Introducing middleware auth rewrites without INT-06 scope
- Hardcoding secrets in `NEXT_PUBLIC_*` env vars
- Redesigning UI shell when task is data-layer only
- Using Next 14/15 `getServerSideProps` patterns
