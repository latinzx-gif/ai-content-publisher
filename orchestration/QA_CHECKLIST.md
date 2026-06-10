# QA_CHECKLIST.md — AI Content Publisher

**Use this checklist to verify quality before advancing between tasks and before Phase 1 sign-off.**

---

## General Quality Gates (Every Task)

- [ ] `npm run build` succeeds with 0 errors
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] No console errors in browser (check after `npm run dev`)
- [ ] All new routes render correctly
- [ ] All links in sidebar work
- [ ] No hardcoded secrets in source code
- [ ] TypeScript types are used (no `any` unless justified)
- [ ] Responsive layout (sidebar + main content area)

---

## Phase 1 Module Checklist

### Task 00 — Audit
- [ ] CURRENT_STATE_REPORT.md exists
- [ ] IMPLEMENTATION_GAP_MAP.md exists
- [ ] No source code was modified
- [ ] Findings are accurate

### Task 01 — Product Shell
- [ ] Sidebar shows all 17 modules
- [ ] Phase 2/3 modules show "(Phase 2)" badge
- [ ] Phase 1 MVP modules render with description
- [ ] Tailwind CSS is installed and configured
- [ ] shadcn/ui is initialized
- [ ] Layout matches blueprint (navy sidebar, light background)

### Task 02 — Create Flow
- [ ] Manual Mode and Batch Theme Mode are both functional
- [ ] All fields render: topic/theme, brand, campaign, platform, account, date, language, category, objective
- [ ] Form validation works for required fields
- [ ] Draft saves to localStorage

### Task 03 — Brief Builder + Rule Loader
- [ ] Brief generates from topic/theme
- [ ] Brief sections are editable
- [ ] Rules load by brand/platform/language
- [ ] Rules display in read-only cards
- [ ] Both save to same post_id

### Task 04 — Content Generation
- [ ] Dual-language content generates (primary + secondary)
- [ ] Content structure includes all required sections
- [ ] Both languages under same post_id
- [ ] Regenerate works per section

### Task 05 — Image Prompt Generation
- [ ] Primary and secondary prompts generate
- [ ] Both share same visual_concept_id
- [ ] Prompt includes layout/mood/hero/color/text_language
- [ ] Saved to post_id

### Task 06 — Image Generation
- [ ] Primary image generates
- [ ] Secondary image generates
- [ ] Version tracking works
- [ ] Regeneration creates new version
- [ ] Version history displays

### Task 07 — Quality Check
- [ ] All 7 checks run
- [ ] Each check shows PASS/WARN/FAIL
- [ ] Color coding is correct (green/amber/red)
- [ ] Results reference loaded rules
- [ ] Results save to post_id

### Task 08 — Review & Editing
- [ ] Full preview shows primary + secondary + images
- [ ] QC notes display below each section
- [ ] Approve/Reject/Revision/Regenerate/Draft all work
- [ ] Status changes persist

### Task 09 — Calendar
- [ ] Posts display grouped by date
- [ ] Filters work (status, platform, brand)
- [ ] Warning badges show on posts with issues
- [ ] Clicking post opens detail/links to review

### Task 10 — Publishing
- [ ] Approved posts show in publish queue
- [ ] Publish Now triggers mock publish
- [ ] Schedule button opens date/time picker
- [ ] Failed publishes show retry button
- [ ] Publish logs save

### Task 11 — Dashboard
- [ ] 8 status cards display
- [ ] Each card shows accurate count
- [ ] Each card links to relevant module
- [ ] Data updates on post status change

### Task 12 — Logs
- [ ] All 4 log types display
- [ ] Filters work (type, date, post_id)
- [ ] Color coding for status (red/amber/green)
- [ ] Sortable by timestamp

### Task 13 — Final QA
- [ ] `npm run build` succeeds with 0 errors
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All MVP routes verified
- [ ] Demo flow walkthrough complete
- [ ] DEMO_READINESS_REPORT.md exists
- [ ] NEXT_BUILD_PLAN.md exists

---

## Security Checklist

- [ ] No API keys in source code (use .env only)
- [ ] No hardcoded secrets
- [ ] .env is in .gitignore
- [ ] No console.log of sensitive data in production code
- [ ] Supabase RLS policies considered (for later tasks)

---

## Performance Checklist

- [ ] All images use appropriate sizing
- [ ] No unnecessary re-renders (use React.memo if needed)
- [ ] localStorage usage is reasonable (not storing large blobs)
- [ ] Build output size is reasonable for a SaaS app

---

## Demo Flow Test

Walk through this sequence before marking Phase 1 complete:

```
1. Open /create → enter topic + brand + platform → Save Draft
2. Go to /briefs → select post_id → Generate Brief → Save
3. Go to /rules → select brand/platform → Load Rules → Save
4. Go to /content-generation → Generate dual-language content → Save
5. Go to /image-prompts → Generate prompts → Save
6. Go to /images → Generate primary + secondary images → Save
7. Go to /quality-check → Run Checks → Review results → Save
8. Go to /review → Preview all content → Approve
9. Go to /calendar → Verify post appears
10. Go to /publishing → Publish → Verify publish log
11. Go to /dashboard → Verify counts updated
12. Go to /logs → Verify generation, image, publish logs exist
```

All 12 steps must complete successfully for Phase 1 sign-off.