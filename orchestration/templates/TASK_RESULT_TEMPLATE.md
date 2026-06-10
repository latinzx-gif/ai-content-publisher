# TASK RESULT: [Task Number] — [Task Name]

> Fill this template after completing the task in CURRENT_TASK.md.
> Replace all `[bracketed]` placeholders with actual results.

---

## Status

✅ PASS / ❌ FAIL / ⚠️ PARTIAL

## Task

[Task Number]: [Task Name]

## What Was Done

[Summarize what was implemented, created, or changed. 2–5 sentences.]

## Files Changed

```
[File path 1] — [brief description of change]
[File path 2] — [brief description of change]
[File path 3] — [brief description of change]
...
```

### New files created:
- [path]
- [path]

### Existing files modified:
- [path]
- [path]

## Build Status

```
npm run build:   ✅ PASS / ❌ FAIL
npx tsc --noEmit: ✅ PASS / ❌ FAIL
npm run lint:    ✅ PASS / ❌ FAIL
```

If FAIL, paste relevant error lines below:

```
[Error output, max 20 lines]
```

## Acceptance Criteria

1. [✅ / ❌] [Criterion 1]
2. [✅ / ❌] [Criterion 2]
3. [✅ / ❌] [Criterion 3]
...

## Packages Installed

- `package-name@version` — reason
- (none if no packages were installed)

## Warnings / Risks

[Any warnings, known issues, or risks discovered during implementation.
If nothing, write "None."]

## Scope Check

- All modified files are in Allowed Files list: ✅ YES / ❌ NO
- No Forbidden Files were modified: ✅ YES / ❌ NO
- No Phase 2/3 features implemented: ✅ YES / ❌ NO

## Next Suggested

- **NEXT_TASK**: Proceed to Task [number] — [name]
- **FIX_TASK**: [describe what needs fixing, if build fails]
- **STOP_FOR_USER**: [reason, if scope drift or blocking issue]

## Cursor Review Gate (mandatory for close-out tasks)

- [ ] `CURSOR_REVIEW_REQUEST.md` written in `head-office-app/`
- [ ] Implementer has **STOPPED** — did not start next task
- [ ] Did not update `CURRENT_TASK.md` or `REVIEW_STATUS.md`

**User action:** Ask Cursor to review this task before continuing.

See `CURSOR_REVIEW_GATE.md`.

## Additional Notes

[Anything else the reviewer should know before deciding the next step.]