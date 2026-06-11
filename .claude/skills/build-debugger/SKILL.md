---
name: build-debugger
description: >-
  Debugs build, TypeScript, lint, and runtime errors in ai-content-publisher.
  Runs validation commands, captures exact errors, applies smallest safe fix,
  and re-runs checks. Use when build fails, tsc/eslint errors appear, Next.js
  compile breaks, or before TASK_RESULT submission.
---

# Build Debugger — ai-content-publisher

## Purpose

Debug build, TypeScript, lint, and runtime errors.

## When to Use

- `npm run build` fails
- TypeScript or ESLint errors block a task
- Next.js 16 compile / runtime errors in dev
- Validation required before `TASK_RESULT.md`

## Steps

1. **Run build/typecheck command** — see Commands below (from `head-office-app/`)
2. **Capture exact error** — first failing command, first error line, file:line
3. **Identify root cause** — one primary cause; ignore cascade errors until fixed
4. **Apply smallest safe fix** — match neighboring patterns; respect `../orchestration/CURRENT_TASK.md` allowed files
5. **Re-run check** — full stack after fix (build + typecheck + lint)
6. **Report changed files** — list every path touched and why

## Commands

```bash
cd head-office-app

npm run build
npm run lint
npm run typecheck    # available — tsc --noEmit

git status --short
git diff head-office-app   # from repo root, if needed
```

Run in order. Stop at **first failure** to fix; then re-run all three.

**0 errors required** before task complete. Warnings in `.claude/skills/run-ai-content-publisher/driver.mjs` are out of scope unless tasked.

## Rules

- **Do not install packages unless approved** — check `CURRENT_TASK.md` (`Can Install Packages: YES` only)
- **Do not refactor unrelated files** — fix the reported error only
- **Do not commit** — unless user explicitly asks

Additional guardrails:

- Do not disable ESLint globally or use `--no-verify` to fake green
- Do not edit `package.json` when task says `Can Install Packages: NO`
- If fix needs forbidden files → STOP; document in `TASK_RESULT.md` as `STOP_FOR_USER`
- Read `node_modules/next/dist/docs/` before App Router fixes (Next.js 16, not 14/15)

## Failure Quick Reference

| Signal | Likely cause | First file to check |
|--------|--------------|---------------------|
| `tsc` file:line | Type/import drift | edited file + `src/lib/supabase/types.ts` |
| ESLint rule name | hooks / unused vars | `ReviewDashboard.tsx`, effects |
| `Failed to compile` | RSC vs client boundary | `page.tsx` + imports |
| `Can't resolve` | bad path or missing dep | import path; package allowlist |
| Runtime env throw | secret on wrong side | server vs `NEXT_PUBLIC_*` |

## Output

```markdown
## Build Debug Report

### Failing command
`npm run [build|typecheck|lint]`

### Exact error
```
[paste first error block]
```

### Root cause
[one sentence]

### Fix applied
[what changed — smallest safe diff]

### Changed files
- `path/to/file` — [why]

### Re-run results
| Command | Result |
|---------|--------|
| npm run build | ✅ / ❌ |
| npm run typecheck | ✅ / ❌ |
| npm run lint | ✅ / ❌ |

### git status --short
```
[paste output]
```

### Scope note
[within CURRENT_TASK allowed files | STOP — needs approval / package install]
```
