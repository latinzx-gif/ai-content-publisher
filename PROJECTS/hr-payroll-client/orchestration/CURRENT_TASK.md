# CURRENT TASK: T151 — Burmese (my) i18n catalog + LINE OA manual update

## Phase

EXECUTE

## Status

Ready for **Codex** — handoff from Cursor 2026-06-15

## Primary Agent

Codex (GPT-5.5)

## Context

Cursor completed **Simplified Chinese (`/zh`)** i18n for all employee LINE/LIFF flows:
- `zh-employee.ts` (560 keys), deploy `73ca158` → https://hr-app-two-iota.vercel.app
- Handoff doc: `hr-app/reports/CURSOR_HANDOFF_2026-06-15.md`
- Codex prompt: `hr-app/_agent/CODEX_PROMPT.md`

**Gap:** Burmese (`/my`) still mostly English (`my` spreads `en` with ~15 overrides).

## Goal

1. Create `my-employee.ts` with full Burmese translations (same keys as `zh-employee.ts`)
2. Wire into `messages.ts`
3. Update LINE OA employee manual + work log with language-switch instructions

## Allowed Files

```
hr-app/src/lib/i18n/my-employee.ts                    (CREATE)
hr-app/src/lib/i18n/messages.ts                       (EDIT)
hr-app/scripts/generate-line-oa-employee-manual.py    (EDIT)
hr-app/reports/LINE_OA_WORK_LOG.md                    (EDIT)
hr-app/reports/LINE_OA_Employee_Manual_ZH.md          (OPTIONAL CREATE)
hr-app/_agent/TASK_RESULT.md                          (OUTPUT)
hr-app/_agent/CURSOR_REVIEW_REQUEST.md                (OUTPUT)
```

## Forbidden

- Rich Menu LINE API changes (→ T152 Claude Code)
- Webhook / handler logic changes
- New npm dependencies
- Commit / push / deploy by agent

## Acceptance Criteria

- [ ] `my-employee.ts` key count matches `zh-employee.ts` (~560)
- [ ] Placeholders `{name}`, `{time}`, `{count}`, etc. preserved
- [ ] `messages.ts`: `const my = { ...en, ...myEmployee }`
- [ ] Manual script includes `/th` `/en` `/zh` `/my` section
- [ ] `LINE_OA_WORK_LOG.md` documents i18n deploy (73ca158)
- [ ] `npm run typecheck` + `npm run lint` pass (0 errors)

## Skills to Load

Codex: read `hr-app/_agent/CODEX_PROMPT.md` (full prompt included)

Reference:
- `src/lib/i18n/zh-employee.ts` — template for key set
- `src/lib/i18n/translate.ts` — my fallback: en → th

## Workflow

1. Codex reads CODEX_PROMPT + handoff doc
2. Implement allowed files
3. Quality gates
4. Write `_agent/TASK_RESULT.md` + `_agent/CURSOR_REVIEW_REQUEST.md` → **STOP**
5. Cursor review → APPROVE → commit + deploy

## Queue (after T151)

| ID | Task | Agent |
|----|------|-------|
| T152 | Rich Menu labels per locale (LINE API swap on `/zh`) | Claude Code |
| T153 | HR admin LINE notify i18n (registration, branch manager) | Claude Code |
| T150 | Employee default check-in/out time backend (was blocked) | Claude Code |

## Linear

Not tracked (ad-hoc i18n continuation)

## Notes

- Rich Menu **bottom buttons stay Thai** until T152 — document in manual
- Supabase prod: `oouswalwqhojpzqwwdvs`
