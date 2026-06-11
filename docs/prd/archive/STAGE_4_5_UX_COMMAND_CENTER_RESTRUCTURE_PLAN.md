# Stage 4.5 UX Command Center Restructure Plan

Date: 2026-06-07 Asia/Bangkok

## Product direction

The product UX should feel like an **Operations Command Center + Content Studio** for an agentic publisher OS, not a website with many equally weighted technical tool pages.

The user should understand within five seconds:

- whether the system is ready
- where work is stuck
- what the one next action is
- what agents have already done
- what humans must decide

## Navigation target

Replace the feeling of many technical implementation pages with larger operational groups:

- Command
  - Dashboard
  - Calendar
  - Publishing
- Studio
  - Create
  - Review
  - Content Library
- Intelligence
  - Analytics
  - Learning Loop
- System
  - Sources
  - Knowledge
  - Settings
  - Logs

Implementation note: existing backend routes and internal components can stay. The restructure is primarily information architecture, copywriting, and flow design.

## Dashboard target

Dashboard becomes the command center.

It should answer:

- System readiness:
  - OpenAI
  - Buffer
  - Brand Rules
  - Content Rules
- Work stuck:
  - drafts
  - QC failed
  - awaiting review
  - scheduled
  - failed publish
- One clear next action:
  - Review drafts
  - Connect Buffer
  - Create first batch
- Workflow pipeline:
  - Brief
  - Rules
  - Generate
  - QC
  - Review
  - Schedule
  - Publish

Copywriting should remove dev wording such as `Live localStorage counts` and use product language such as:

- Publishing pipeline overview
- Posts waiting for approval
- Ready to schedule
- Needs manual action

## Create target

Create becomes one guided flow, not separate technical pages:

1. Topic / campaign brief
2. Brand + platform + language
3. Rules preview
4. Generate content + image prompt
5. Run QC
6. Send to Review

Brief, Rules, Generate, Image, and QC should appear as steps/tabs inside Create instead of top-level navigation.

## Review target

Review becomes the most important human-control screen.

Desktop layout should be preview-first with three columns:

- Left: queue of draft / failed QC / awaiting approval items
- Center: social preview, such as Facebook/LinkedIn post preview
- Right: QC, brand compliance, and actions

Primary actions:

- Approve
- Request Revision
- Regenerate
- Schedule

The user should feel safe: actions need clear intent, status, and audit trail.

## Publishing target

Publishing is an operational queue, not a settings page.

Sections:

- Approved but unscheduled
- Scheduled
- Failed
- Manual action required
- Published log

Each item should show:

- status
- platform
- scheduled time
- retry
- manual fallback
- short publish log

## Stage 4.5 task order

1. Update sidebar/navigation grouping and labels.
2. Refactor Dashboard above-the-fold into command center:
   - readiness strip
   - stuck work summary
   - one next action
   - workflow pipeline
3. Refactor Review page into preview-first three-column layout.
4. Refactor Create page labels/structure into guided flow copy.
5. Polish Publishing wording as queue-first.
6. Remove dev/technical copy from product-facing UI.
7. Run browser sanity check and static gates.
8. Write Stage 4.5 audit report before moving to Stage 5.

## Audit criteria

Stage 4.5 passes only if:

- sidebar feels grouped and lower cognitive load
- Dashboard answers today’s operational state quickly
- technical steps are presented as flow steps, not equal top-level destinations
- Review is visibly preview-first and action-safe
- Publishing reads as a queue
- no backend contract is broken
- `/prd` still loads successfully
- `npx tsc --noEmit` passes
- `npx eslint src scripts` has 0 errors

## Stage decision

Stage 4 is complete. Stage 4.5 should run before Publishing Integrations because the UX direction has changed enough that building integrations first would likely create rework.
