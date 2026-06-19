# CODEX_TASK_QUEUE.md — Task Queue for Codex Implementation

**Instructions:**
- Codex must complete tasks in order (00 → 13).
- Codex must run `npm run build` and `npx tsc --noEmit` after each task.
- Codex must report what was done, files changed, and any warnings.
- Codex must NOT modify Hermes orchestration documents.
- Codex must NOT start tasks beyond the current assigned task.

---

## Task 00: Audit Current App

### Goal
Inspect the existing codebase and create audit reports. No code changes.

### Files Likely Affected
- `headoffice/reports/CURRENT_STATE_REPORT.md` (to be created)
- `headoffice/reports/IMPLEMENTATION_GAP_MAP.md` (to be created)

### Implementation Rules
- Do not modify any source code.
- Do not install any packages.
- Create reports under `headoffice/reports/` directory.

### Acceptance Criteria
1. Routes/pages/components are documented with their current state.
2. Supabase usage (or lack thereof) is documented.
3. OpenAI text/image generation status is documented.
4. Buffer publishing status is documented.
5. Gap map shows what needs to be built for Phase 1.

### Stop Condition
When `CURRENT_STATE_REPORT.md` and `IMPLEMENTATION_GAP_MAP.md` exist with accurate findings.

### Exact Codex Prompt
```
Audit the current ai-content-publisher app at apps/ai-content-publisher/. Do NOT modify any code.

1. List all routes, pages, and components under src/.
2. Check package.json for Supabase, OpenAI, Buffer dependencies.
3. Check for any Supabase schema or client code.
4. Check for any OpenAI integration.
5. Check for any Buffer or publishing code.
6. Check the .gitignore and tsconfig for relevant config.
7. Note the Next.js version and any breaking changes to be aware of.
8. Create headoffice/reports/CURRENT_STATE_REPORT.md with findings.
9. Create headoffice/reports/IMPLEMENTATION_GAP_MAP.md listing what needs to be built.

Do NOT modify any source code. Do NOT install packages. Only create reports.
```

---

## Task 01: Product Shell

### Goal
Create the full route structure, sidebar navigation, shared app layout, and placeholder pages for all 17 modules.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/layout.tsx`
- `apps/ai-content-publisher/src/components/Sidebar.tsx`
- `apps/ai-content-publisher/src/app/create/page.tsx`
- `apps/ai-content-publisher/src/app/dashboard/page.tsx`
- `apps/ai-content-publisher/src/app/briefs/page.tsx` (new)
- `apps/ai-content-publisher/src/app/rules/page.tsx` (new)
- `apps/ai-content-publisher/src/app/content-generation/page.tsx` (new)
- `apps/ai-content-publisher/src/app/image-prompts/page.tsx` (new)
- `apps/ai-content-publisher/src/app/images/page.tsx` (new)
- `apps/ai-content-publisher/src/app/quality-check/page.tsx` (new)
- `apps/ai-content-publisher/src/app/review/page.tsx` (new)
- `apps/ai-content-publisher/src/app/calendar/page.tsx` (new)
- `apps/ai-content-publisher/src/app/publishing/page.tsx` (new)
- `apps/ai-content-publisher/src/app/logs/page.tsx` (new)
- `apps/ai-content-publisher/src/app/analytics/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/knowledge/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/sources/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/learning-loop/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/content-library/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/settings/page.tsx` (new) — placeholder
- `apps/ai-content-publisher/src/app/globals.css` (update)
- `apps/ai-content-publisher/package.json` (install Tailwind + shadcn/ui)

### Implementation Rules
- Use Tailwind CSS and shadcn/ui for styling (install both).
- Sidebar must include links to ALL 17 modules, with Phase 2/3 modules marked as "Coming Soon" or "Phase 2".
- Placeholder pages for Phase 2/3 modules must render a simple message like "This module is coming in Phase 2."
- MVP modules must render their module name with a brief description.
- Layout must match the blueprint design (navy sidebar, light background, 300px sidebar width).

### Acceptance Criteria
1. `npm run dev` starts without errors.
2. Sidebar shows all 17 module links.
3. Phase 2/3 modules show placeholder content.
4. Phase 1 MVP modules render without errors (content can be placeholder).
5. Layout matches blueprint (sidebar + main content area).
6. `npm run build` succeeds.

### Stop Condition
When all routes render correctly, the sidebar is complete, and `npm run build` passes.

### Exact Codex Prompt
```
Build the product shell for the AI Content Publisher app at apps/ai-content-publisher/.

CRITICAL FIRST STEP: Before editing any code, read the Next.js 16 breaking changes documentation at node_modules/next/dist/docs/ to check for App Router, config, or API changes from previous Next.js versions.

1. Install Tailwind CSS (npm install tailwindcss @tailwindcss/postcss) and configure postcss.config.mjs. Verify Tailwind v4 works with Next.js 16 before proceeding.
2. Initialize shadcn/ui (npx shadcn@latest init --defaults). If React 19 compatibility issues arise, add --force flag. Add a Button component as smoke test.
3. Add a "typecheck" script to package.json: "typecheck": "tsc --noEmit"
4. Update apps/ai-content-publisher/src/app/globals.css to include @tailwind base/components/utilities directives alongside the existing custom CSS. Keep the navy sidebar styling.
5. Update apps/ai-content-publisher/src/app/layout.tsx to be clean with Tailwind classes.
6. Rewrite apps/ai-content-publisher/src/components/Sidebar.tsx with a complete sidebar that has ALL module links organized into groups. Use a single route config data structure (array of {href, label, phase}) to prevent sidebar/route drift:
   - MAIN: Dashboard (P1), Create (P1), Review (P1), Calendar (P1), Publishing (P1)
   - WORKFLOW: Brief Builder (P1), Sources (P2 placeholder), Knowledge (P2 placeholder), Rules (P1), Content Generation (P1), Image Prompts (P1), Images (P1), Quality Check (P1), Content Library (P2 placeholder)
   - INTELLIGENCE: Analytics (P2 placeholder), Learning Loop (P3 placeholder)
   - SYSTEM: Logs (P1), Settings (P1 — minimal)
   Phase 2/3 modules must show a "(Phase 2)" or "(Phase 3)" badge. Use shadcn/ui Badge component.

7. Create page files for ALL modules. MVP module pages should render the module name and a brief description. Phase 2/3 placeholder pages should render: "This module is coming in Phase 2/3."
   - MVP P1 pages: /create, /briefs, /rules, /content-generation, /image-prompts, /images, /quality-check, /review, /calendar, /publishing, /dashboard, /logs
   - Settings: /settings (minimal — API key config note, brand profile note)
   - Phase 2 placeholders: /sources, /knowledge, /content-library, /analytics
   - Phase 3 placeholder: /learning-loop

8. Run npm run build and fix any errors. Run npx tsc --noEmit and fix any type errors.
9. Verify every sidebar link resolves to a page (check that no route 404s).

Do NOT implement deep logic yet. Only routes, layout, sidebar, and placeholder pages.
Do NOT create Supabase schema, OpenAI integration, or Buffer integration.
Do NOT implement Create form fields or Brief Builder logic.
```

---

## Task 02: Create Flow

### Goal
Implement the Create module with Manual Mode and Batch Theme Mode, topic/theme input, and all required fields.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/create/page.tsx`
- `apps/ai-content-publisher/src/app/create/CreateForm.tsx` (new)
- `apps/ai-content-publisher/src/lib/create-post.ts` (new)

### Implementation Rules
- Two modes: Manual Mode (single post) and Batch Theme Mode (multiple posts from a theme).
- Fields: topic/theme, brand, campaign, platform, account, date, language, category, objective.
- Save to drafts (local state or database if Supabase is configured).
- Use shadcn/ui form components.

### Acceptance Criteria
1. Both Manual and Batch Theme modes are selectable.
2. All required fields render and accept input.
3. Form validates required fields.
4. Draft can be saved and retrieved.
5. `npm run build` succeeds.

### Stop Condition
When Create module renders with both modes, all fields work, and drafts can be saved.

### Exact Codex Prompt
```
Implement the Create flow for the AI Content Publisher at apps/ai-content-publisher/.

1. Rewrite apps/ai-content-publisher/src/app/create/page.tsx with:
   - A mode selector (Manual Mode / Batch Theme Mode) as tab buttons
   - Manual Mode fields: topic (textarea), brand (select), campaign (text), platform (select: Facebook, Instagram, LinkedIn, Twitter/X, TikTok, Threads), account (text), date (date picker), language (select: Thai, English, Chinese, Japanese, Korean), category (select), objective (select: awareness, engagement, conversion, education, entertainment)
   - Batch Theme Mode: same fields but theme (textarea) instead of topic, with a note "Enter 3-5 topics separated by new lines"
   - Save Draft button that stores data (use localStorage for now, or a simple state object)
2. Use shadcn/ui components (Button, Input, Textarea, Select, Card).
3. Add form validation: topic/theme required, brand required, platform required.
4. Style with Tailwind CSS.
5. Run npm run build and fix any errors.

Do NOT implement database persistence yet. Use local state or localStorage.
Do NOT implement content generation logic yet.
```

---

## Task 03: Brief Builder + Rule Loader

### Goal
Implement Brief Builder (generate/edit a content brief from a topic) and Rule Loader (load brand/platform/legal/image/language rules).

### Files Likely Affected
- `apps/ai-content-publisher/src/app/briefs/page.tsx`
- `apps/ai-content-publisher/src/app/rules/page.tsx`
- `apps/ai-content-publisher/src/lib/brief-builder.ts` (new)
- `apps/ai-content-publisher/src/lib/rules-loader.ts` (new)

### Implementation Rules
- Brief is generated from the topic/theme input from Create flow.
- Rules are loaded by brand, platform, and language.
- Brief and rules are saved to the same post_id.
- Rules must include: brand voice guidelines, prohibited claims, platform-specific limits, image style rules, language style rules.

### Acceptance Criteria
1. Brief Builder accepts a topic and generates a brief structure (headline, angle, key points, target audience, tone).
2. Rule Loader accepts brand/platform/language and returns applicable rules.
3. Both are savable to a shared post_id.
4. `npm run build` succeeds.

### Stop Condition
When a brief can be generated from a topic, rules can be loaded, and both are saved to a post_id.

### Exact Codex Prompt
```
Implement Brief Builder and Rule Loader for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/briefs/page.tsx:
   - Input: topic (from Create flow or manual entry), brand, platform, language
   - Generate Brief button (calls a mock function that returns a brief object with: headline, angle, key_points[], target_audience, tone, structure_notes)
   - Editable brief fields (textarea for each section)
   - Save button (stores to localStorage with a post_id)
   
2. Create apps/ai-content-publisher/src/app/rules/page.tsx:
   - Input: brand select, platform select, language select
   - Load Rules button (calls a mock function that returns rules object with: brand_voice[], prohibited_claims[], platform_limits{}, image_style_guide{}, language_style_guide{})
   - Display rules in read-only card view
   - Save button (associates rules with a post_id)

3. Create apps/ai-content-publisher/src/lib/brief-builder.ts with mock generateBrief(topic, brand, platform, language) function.
4. Create apps/ai-content-publisher/src/lib/rules-loader.ts with mock loadRules(brand, platform, language) function.
5. Connect both pages to accept a post_id via URL search params.
6. Use shadcn/ui components and Tailwind CSS.
7. Run npm run build and fix errors.

Do NOT connect to OpenAI yet. Use mock data functions.
Do NOT implement database persistence. Use localStorage.
```

---

## Task 04: Dual-Language Content Generation

### Goal
Generate primary post (main language) and secondary first comment (second language) from the brief. Include headline, subheadline, support line, long-form article, hashtags, disclaimer.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/content-generation/page.tsx`
- `apps/ai-content-publisher/src/lib/content-generator.ts` (new)

### Implementation Rules
- Primary post in the selected language.
- Secondary first comment in a second language.
- Both use the same post_id.
- Content structure: headline, subheadline, support line, long-form article, hashtags, disclaimer.
- Must reference the loaded brief and rules.

### Acceptance Criteria
1. Content Generation page takes a post_id (from Brief + Rules).
2. User selects primary language and secondary language.
3. Clicking Generate creates dummy content in both languages.
4. Both versions share the same post_id.
5. `npm run build` succeeds.

### Stop Condition
When dual-language content can be generated from a brief and saved to a post_id.

### Exact Codex Prompt
```
Implement dual-language content generation for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/content-generation/page.tsx:
   - Accept a post_id via URL search params
   - Load brief and rules from localStorage by post_id
   - Primary language select (default: Thai)
   - Secondary language select (default: English)
   - Generate Content button
   - Display generated content in two columns:
     Left: Primary post with Headline, Subheadline, Support Line, Long-form Article, Hashtags, Disclaimer
     Right: Secondary first comment with same structure but in second language
   - Save button (to localStorage by post_id)
   - Regenerate button for each section

2. Create apps/ai-content-publisher/src/lib/content-generator.ts with mock generateContent(brief, rules, primaryLang, secondaryLang) function that returns:
   {
     post_id: string,
     primary: { headline, subheadline, support_line, long_form, hashtags, disclaimer, language },
     secondary: { headline, subheadline, support_line, long_form, hashtags, disclaimer, language }
   }

3. Use shadcn/ui (Card, Button, Textarea, Select, Tabs).
4. Use Tailwind CSS with the two-column layout.
5. Run npm run build and fix errors.

Do NOT connect to OpenAI yet. Use mock data functions.
Do NOT implement database persistence. Use localStorage.
```

---

## Task 05: Image Prompt Generation

### Goal
Generate primary and secondary image prompts from the generated content. Both prompts share a visual_concept_id with same layout/mood/hero object but different visible text language.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/image-prompts/page.tsx`
- `apps/ai-content-publisher/src/lib/image-prompt-generator.ts` (new)

### Implementation Rules
- Primary image prompt for main post.
- Secondary image prompt for first comment.
- Both share a visual_concept_id for layout consistency.
- Same layout, mood, hero object, color palette.
- Visible text in the image differs by language (prompt specifies text language).

### Acceptance Criteria
1. Image Prompt page accepts a post_id.
2. User can generate both prompts with one click.
3. Both prompts share a visual_concept_id.
4. Prompt specifies layout, mood, hero object, color palette, and visible text language.
5. `npm run build` succeeds.

### Stop Condition
When both image prompts are generated, share a visual_concept_id, and are saved to a post_id.

### Exact Codex Prompt
```
Implement image prompt generation for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/image-prompts/page.tsx:
   - Accept a post_id via URL search params
   - Load generated content from localStorage by post_id
   - Generate Prompts button
   - Display two prompt cards:
     Primary Image Prompt (for main post language)
     Secondary Image Prompt (for first comment language)
   - Each card shows: visual_concept_id, layout, mood, hero_object, color_palette, visible_text_language
   - The visual_concept_id must be the same for both prompts (e.g., "vc_<post_id>")
   - Save button (to localStorage by post_id)
   - Regenerate button

2. Create apps/ai-content-publisher/src/lib/image-prompt-generator.ts with mock function generateImagePrompts(content, brand_rules, image_rules) that returns:
   {
     post_id: string,
     visual_concept_id: string,
     primary: { prompt, layout, mood, hero_object, color_palette, text_language },
     secondary: { prompt, layout, mood, hero_object, color_palette, text_language }
   }

3. Use shadcn/ui (Card, Button, Textarea, Badge to show visual_concept_id).
4. Use Tailwind CSS.
5. Run npm run build and fix errors.

Do NOT connect to OpenAI yet. Use mock data.
```

---

## Task 06: Image Generation

### Goal
Generate primary and secondary images from the image prompts using a mock function (OpenAI Image API in later task). Save image URLs, prompts, version history, and regeneration options.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/images/page.tsx`
- `apps/ai-content-publisher/src/lib/image-generator.ts` (new)

### Implementation Rules
- Generate primary image first, then secondary.
- Images can be regenerated individually.
- Save: image URL, prompt used, version number, generation timestamp.
- Show generation history.

### Acceptance Criteria
1. Image page accepts a post_id and loads image prompts.
2. Generate Images button creates image records.
3. Primary and secondary images display (placeholder URLs for now).
4. Version history shows each generation.
5. Regeneration creates a new version.
6. `npm run build` succeeds.

### Stop Condition
When images can be generated, displayed, regenerated, and version history is tracked.

### Exact Codex Prompt
```
Implement image generation for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/images/page.tsx:
   - Accept a post_id via URL search params
   - Load image prompts from localStorage by post_id
   - Generate Primary Image button → displays placeholder image URL
   - Generate Secondary Image button → displays placeholder image URL
   - Show each image with: prompt used, version number, generation timestamp
   - Regenerate button per image → creates new version
   - Version history panel showing all versions with timestamps
   - Save button (to localStorage by post_id)

2. Create apps/ai-content-publisher/src/lib/image-generator.ts with mock function generateImage(prompt, post_id, type) that returns:
   {
     post_id: string,
     type: 'primary' | 'secondary',
     version: number,
     image_url: string (placeholder like "https://placehold.co/600x400/navy/white?text=Primary+Image+V1"),
     prompt: string,
     generated_at: ISO timestamp
   }
   Also create generateImageHistory(post_id) that returns all versions.

3. Use shadcn/ui (Card, Button, Image component or <img>, Badge for version, Tabs for history).
4. Use Tailwind CSS with image preview layout.
5. Run npm run build and fix errors.

Do NOT connect to OpenAI Image API yet. Use placeholder image URLs.
```

---

## Task 07: Quality Check

### Goal
Run quality checks on generated content: prohibited claims, legal sensitivity, brand consistency, spelling/grammar, platform limits, hashtag check, image readability note.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/quality-check/page.tsx`
- `apps/ai-content-publisher/src/lib/quality-checker.ts` (new)

### Implementation Rules
- Checks run on both primary and secondary content.
- Results show PASS/WARN/FAIL per check.
- User can see which specific items failed.
- Loaded brief rules and platform limits inform the checks.

### Acceptance Criteria
1. Quality Check page accepts a post_id and loads content + rules.
2. Run Checks button executes all checks.
3. Each check shows PASS/WARN/FAIL status with details.
4. Prohibited claims and legal sensitivity checks reference the loaded rules.
5. `npm run build` succeeds.

### Stop Condition
When all checks run, results display per check with PASS/WARN/FAIL, and rules are referenced.

### Exact Codex Prompt
```
Implement Quality Check for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/quality-check/page.tsx:
   - Accept a post_id via URL search params
   - Load content + rules from localStorage by post_id
   - Run Checks button
   - Display check results in a table:
     | Check | Status | Details |
     |-------|--------|---------|
     | Prohibited Claims | PASS/WARN/FAIL | List matching claims |
     | Legal Sensitivity | PASS/WARN/FAIL | List sensitive terms |
     | Brand Consistency | PASS/WARN/FAIL | List inconsistencies |
     | Spelling & Grammar | PASS/WARN/FAIL | List issues |
     | Platform Limits | PASS/WARN/FAIL | Character count vs limit |
     | Hashtag Check | PASS/WARN/FAIL | Count + relevance |
     | Image Readability | NOTE | Text visibility note |
   - Each row is color-coded: green/amber/red
   - Save results to localStorage by post_id

2. Create apps/ai-content-publisher/src/lib/quality-checker.ts with mock function runQualityChecks(content, rules) that returns check results.

3. Use shadcn/ui (Table, Badge for status, Card, Button).
4. Use Tailwind CSS.
5. Run npm run build and fix errors.

Do NOT implement real AI-based checking. Use mock/rule-based checks (e.g., check for keywords from prohibited claims list in the rules).
```

---

## Task 08: Review & Editing

### Goal
Show a full preview of the generated post (primary + secondary + images), QC notes, source references. Allow approve/reject/request revision/regenerate/save draft.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/review/page.tsx`
- `apps/ai-content-publisher/src/lib/review-actions.ts` (new)

### Implementation Rules
- Preview: primary post content, secondary comment content, primary image, secondary image.
- Show QC notes below each section.
- Show source references if available.
- Actions: Approve, Reject, Request Revision, Regenerate Section, Save as Draft.
- On Approve: change status to "approved".

### Acceptance Criteria
1. Review page accepts a post_id and loads all generated content.
2. Preview shows primary + secondary posts with images.
3. QC notes display below each section.
4. All five actions work (approve, reject, revision, regenerate, save draft).
5. `npm run build` succeeds.

### Stop Condition
When full preview renders with all content, actions work, and status changes persist.

### Exact Codex Prompt
```
Implement Review & Editing for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/review/page.tsx:
   - Accept a post_id via URL search params
   - Load ALL generated content from localStorage by post_id: content, image prompts, images, QC results
   - Display a full preview with sections:
     
     Section 1: Primary Post
     - Headline, subheadline, support line, long-form article, hashtags, disclaimer
     - Primary image (with version badge)
     - QC notes for primary content (loaded from QC results)
     
     Section 2: Secondary Comment
     - Same structure as primary but for first comment
     - Secondary image
     - QC notes for secondary
     
     Section 3: Source References (empty/placeholder for now)
     
   - Action buttons at bottom:
     Approve → sets status = "approved", saves to localStorage
     Reject → sets status = "rejected"
     Request Revision → sets status = "revision_requested", opens edit mode
     Regenerate Section → links back to content generation or image generation page
     Save as Draft → sets status = "draft"
   
   - Status badge at top showing current status

2. Create apps/ai-content-publisher/src/lib/review-actions.ts with functions:
   approvePost(post_id), rejectPost(post_id), requestRevision(post_id), saveDraft(post_id)

3. Use shadcn/ui (Card, Button, Tabs, Badge, Alert for QC warnings).
4. Use Tailwind CSS.
5. Run npm run build and fix errors.
```

---

## Task 09: Calendar

### Goal
Show approved/scheduled posts in a calendar view with filters and warning badges. Click to open post detail.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/calendar/page.tsx`
- `apps/ai-content-publisher/src/lib/calendar-data.ts` (new)

### Implementation Rules
- Show posts by scheduled date.
- Filters: by status, by platform, by brand.
- Warning badges on posts that have QC warnings or missing images.
- Clicking a post opens a detail view or links to review.

### Acceptance Criteria
1. Calendar page shows posts grouped by date.
2. Filters work (status, platform, brand).
3. Warning badges display on posts with issues.
4. Clicking a post shows detail or links to review.
5. `npm run build` succeeds.

### Stop Condition
When calendar renders with posts, filters work, and warning badges display.

### Exact Codex Prompt
```
Implement the Calendar module for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/calendar/page.tsx:
   - Load posts from localStorage (approved/scheduled posts)
   - Display posts grouped by date in a list or simple calendar grid
   - Filter bar with: Status (All, Approved, Scheduled, Published, Failed), Platform, Brand
   - Each post card shows: headline (truncated), scheduled date, platform, status badge
   - Warning badge (⚠️) on posts that have QC warnings or missing images
   - Click a post to open a detail modal or navigate to /review?post_id=xxx

2. Create apps/ai-content-publisher/src/lib/calendar-data.ts with mock functions:
   getScheduledPosts(filters) → filtered list
   getPostWarnings(post_id) → array of warnings

3. Use shadcn/ui (Card, Badge, Select for filters, Dialog for post detail).
4. Use Tailwind CSS.
5. Run npm run build and fix errors.

Do NOT implement drag-and-drop. Do NOT implement yearly view.
Keep it simple: list or month grid with filters.
```

---

## Task 10: Publishing

### Goal
Implement Buffer publishing for schedule/publish. Primary post as main post, secondary as first comment (or manual action). Retry failed, publish logs.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/publishing/page.tsx`
- `apps/ai-content-publisher/src/lib/buffer-publisher.ts` (new)

### Implementation Rules
- Buffer API integration (mock for now).
- Primary post → Buffer main post.
- Secondary → first comment (or mark as "manual action" if not supported).
- Retry button for failed publishes.
- Publish logs saved to post_id.

### Acceptance Criteria
1. Publishing page shows approved posts ready to publish.
2. Schedule button opens scheduling options (date/time).
3. Publish Now button triggers mock publish.
4. Primary/secondary handling is clear in UI.
5. Failed publishes show retry option.
6. Publish logs are saved.
7. `npm run build` succeeds.

### Stop Condition
When posts can be scheduled or published, failures can be retried, and logs are saved.

### Exact Codex Prompt
```
Implement Publishing for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/publishing/page.tsx:
   - Load approved posts from localStorage (status = "approved")
   - Display posts in a queue with: headline, platform, scheduled date (if set), status
   - For each post:
     Publish Now button → mock publish via Buffer (primary as main post, secondary as note/first comment)
     Schedule button → opens date/time picker, sets scheduled_at
     Status shows: pending, scheduled, publishing, published, failed
     If failed: show error message + Retry button
   - Publish log section showing history per post_id: timestamp, action, result, error (if any)

2. Create apps/ai-content-publisher/src/lib/buffer-publisher.ts with mock functions:
   bufferPublish(post_id, content, scheduled_at?) → { success, publish_id, error? }
   bufferSchedule(post_id, content, scheduled_at) → { success, schedule_id, error? }
   bufferRetry(post_id) → { success, publish_id, error? }

3. Use shadcn/ui (Card, Button, DatePicker if available, Badge for status, Table for logs).
4. Use Tailwind CSS.
5. Run npm run build and fix errors.

Do NOT connect to real Buffer API yet. Use mock functions.
Primary post = main post. Secondary = first comment (UI must show this clearly).
```

---

## Task 11: Dashboard

### Goal
Dashboard with database-driven counts showing today/upcoming/pending/approved/scheduled/published/failed/manual action cards.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/dashboard/page.tsx`
- `apps/ai-content-publisher/src/lib/dashboard-data.ts` (new)

### Implementation Rules
- Cards show counts from localStorage/database.
- Cards: Today's Posts, Upcoming, Pending Approval, Approved, Scheduled, Published, Failed, Manual Action.
- Each card links to the relevant module.

### Acceptance Criteria
1. Dashboard shows 8 status cards with live counts.
2. Each card links to the relevant module page.
3. Data updates when posts change status.
4. `npm run build` succeeds.

### Stop Condition
When dashboard renders with 8 cards showing accurate counts and each card links to a module.

### Exact Codex Prompt
```
Implement the Dashboard for the AI Content Publisher at apps/ai-content-publisher/.

1. Rewrite apps/ai-content-publisher/src/app/dashboard/page.tsx:
   - Load all posts from localStorage
   - Compute counts for 8 status cards:
     📅 Today's Posts (scheduled_at = today)
     📋 Upcoming (scheduled_at > today)
     ⏳ Pending Approval (status = "draft" or "revision_requested")
     ✅ Approved (status = "approved")
     📆 Scheduled (status = "scheduled")
     📤 Published (status = "published")
     ❌ Failed (status = "failed")
     👤 Manual Action (posts where secondary needs manual action)
   - Display as a grid of cards, each with: icon, label, count, link to relevant page
   - Each card is clickable → navigates to the corresponding module

2. Create apps/ai-content-publisher/src/lib/dashboard-data.ts with function getDashboardStats() that computes counts from localStorage.

3. Use shadcn/ui (Card, Badge with count).
4. Use Tailwind CSS grid layout.
5. Run npm run build and fix errors.
```

---

## Task 12: Logs & Audit Trail

### Goal
Build filterable logs for generation, image, publish, and error events.

### Files Likely Affected
- `apps/ai-content-publisher/src/app/logs/page.tsx`
- `apps/ai-content-publisher/src/lib/log-system.ts` (new)

### Implementation Rules
- Log categories: generation, image, publish, error.
- Each log entry: timestamp, type, action, post_id, details, status.
- Filterable by type, date range, post_id.
- Sortable by timestamp.

### Acceptance Criteria
1. Logs page shows all log entries from localStorage.
2. Filters work (by type, date, post_id).
3. Each log shows timestamp, type, action, post_id, details, status.
4. `npm run build` succeeds.

### Stop Condition
When logs render with filters and correct data from localStorage.

### Exact Codex Prompt
```
Implement Logs & Audit Trail for the AI Content Publisher at apps/ai-content-publisher/.

1. Create apps/ai-content-publisher/src/app/logs/page.tsx:
   - Load all logs from localStorage (generated by previous task actions)
   - Display as a filterable table:
     | Timestamp | Type | Action | Post ID | Details | Status |
   - Filter bar: Type (generation, image, publish, error, all), Date Range (today, 7 days, 30 days, all), Post ID search
   - Sortable by timestamp (newest first by default)
   - Color-coded rows: error = red, warning = amber, success = green

2. Create apps/ai-content-publisher/src/lib/log-system.ts with functions:
   addLog(type, action, post_id, details, status) → saves to localStorage
   getLogs(filters) → filtered and sorted logs
   clearLogs() → for testing

3. Integrate logging: update previous mock functions to also call addLog() when actions happen (content generation, image generation, publishing, errors).

4. Use shadcn/ui (Table, Select for filters, Input for search, Badge for status).
5. Use Tailwind CSS.
6. Run npm run build and fix errors.
```

---

## Task 13: Final QA & Demo Readiness

### Goal
Run final quality checks: build/typecheck, route check, demo flow check, risk report, handoff report.

### Files Likely Affected
- `headoffice/reports/DEMO_READINESS_REPORT.md` (new)
- `headoffice/reports/NEXT_BUILD_PLAN.md` (new)

### Implementation Rules
- Run `npm run build` and fix any remaining errors.
- Run `npx tsc --noEmit` and fix any type errors.
- Verify all routes render.
- Walk through the demo flow end-to-end.
- Create a risk report and handoff report.

### Acceptance Criteria
1. `npm run build` succeeds with 0 errors.
2. `npx tsc --noEmit` passes with 0 errors.
3. All 12 MVP routes render without errors.
4. Demo flow works: Create → Brief → Content → Image Prompts → Images → QC → Review → Calendar → Publish → Dashboard → Logs.
5. Risk report lists known issues.
6. Handoff report documents what was built and what's next.

### Stop Condition
When build passes, demo flow works, and both reports are created.

### Exact Codex Prompt
```
Run Final QA and Demo Readiness for the AI Content Publisher at apps/ai-content-publisher/.

1. Run npm run build and fix any remaining errors.
2. Run npx tsc --noEmit and fix any type errors.
3. Manually verify all MVP routes render:
   /, /create, /briefs, /rules, /content-generation, /image-prompts, /images, /quality-check, /review, /calendar, /publishing, /dashboard, /logs
4. Walk through the complete demo flow (create a test post_id and verify each step works).
5. Document any known issues, warnings, or risks.
6. Create headoffice/reports/DEMO_READINESS_REPORT.md with:
   - Build status
   - Type check status
   - Route check results
   - Demo flow results
   - Known issues
   - Risks
7. Create headoffice/reports/NEXT_BUILD_PLAN.md with:
   - What was built in Phase 1
   - What Phase 2/3 items are ready to start
   - Recommended next steps

Do NOT start Phase 2/3 work. Only verify and document.
```