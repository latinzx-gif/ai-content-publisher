# Final Test Matrix

Date: 2026-06-08
Project: Head Office App
Primary surface: `/prd`

## A. Content Text Output

### Test: Generate content
- Entry:
  - `/login`
  - `/prd` -> Create Post
- Steps:
  - create a content job
  - complete source search
  - trigger draft generation
- Verify:
  - user sees readable post text
  - title and caption/body appear in readable UI
  - platform-ready content is visible by language/platform
  - raw JSON is not the primary output

## B. Image Output

### Test: Generate image
- Entry:
  - `/prd` -> Create Post / Review Queue / Content Job Detail
- Steps:
  - complete text generation
  - trigger image generation/layout handoff
- Verify:
  - image preview or visible asset reference appears
  - placeholder-only output does not count as completed
  - if generation fails, degraded/error state appears

## C. Layout Output

### Test: Generate layout/creative result
- Entry:
  - `/prd` -> Create Post / Review Queue / Content Job Detail
- Steps:
  - advance through layout/creative preparation
- Verify:
  - user sees layout preview or readable creative summary
  - raw layout JSON is not final output
  - layout placeholder state is clearly marked as planning only

## D. Review Queue

### Test: Open review queue
- Entry:
  - `/prd` -> Review Queue
- Steps:
  - open a generated review item
- Verify:
  - readable text output appears
  - readable image preview/reference appears
  - readable layout/creative summary appears
  - approval action is based on readable output
  - raw JSON is not presented as normal review content

## E. Error / Degraded State

### Test: Unavailable image/layout output
- Entry:
  - `/prd` -> Review Queue / Content Job Detail
- Steps:
  - simulate or observe missing image/layout output
- Verify:
  - user sees clear degraded/error state
  - fake success is not shown
  - placeholder asset state is not treated as completion

## F. Agent / Runtime Output

### Test: Inspect agent/runtime surfaces
- Entry:
  - `/prd` -> Agents / Settings / Logs
- Steps:
  - inspect runtime checks, queue state, and workflow logs
- Verify:
  - user-facing summaries are readable
  - raw JSON is not the primary output in normal operator flow
  - technical detail remains secondary to readable status/action

## G. Publishing Readiness

### Test: Move approved item into Publishing Queue
- Entry:
  - `/prd` -> Review Queue -> Publishing
- Steps:
  - approve a readable review item
  - inspect publishing queue state
- Verify:
  - publishing status is readable
  - failure/degraded states are visible
  - payload-style output is not used as the primary publishing state
