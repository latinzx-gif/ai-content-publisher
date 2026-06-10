# BUILD_STAGES.md — AI Content Publisher

---

## Stage Overview

The 17-stage workflow is split into 5 build stages:

### Stage A: Foundation (1 task)
- Task 00: Audit current app
- Task 01: Product shell (sidebar, routes, layout, placeholders)

### Stage B: Content Creation Pipeline (4 tasks)
- Task 02: Create flow (topic input + draft)
- Task 03: Brief Builder + Rule Loader
- Task 04: Dual-language content generation
- Task 05: Image prompt generation

### Stage C: Media & Quality (2 tasks)
- Task 06: Image generation
- Task 07: Quality Check

### Stage D: Review & Publishing (3 tasks)
- Task 08: Review & Editing
- Task 09: Calendar
- Task 10: Publishing (Buffer)

### Stage E: Monitoring & Wrap (3 tasks)
- Task 11: Dashboard
- Task 12: Logs & Audit Trail
- Task 13: Final QA & Demo Readiness

---

## Implementation Order Rules

1. Tasks within a stage may be reordered if dependencies allow.
2. Stage A must be complete before Stage B starts (foundation first).
3. Stages B, C, D must be sequential (content → media → review → publish).
4. Stage E (Dashboard + Logs) can overlap with Stage D.
5. Task 13 (Final QA) is always last.

---

## Database Schema Evolution

| Stage | Schema Changes |
|-------|----------------|
| A | None (product shell only) |
| B | `posts` table, `briefs` table, `rules` table |
| C | `images` table (with prompt, version, history) |
| D | `quality_checks` table, `schedules` table, `publish_logs` table |
| E | `generation_logs` table, `error_logs` table |

---

## Dependency Graph

```
Task 00 (Audit) ─┐
                  ├── Task 01 (Shell) ──┐
Task 13 (QA) ────┘                     │
                                        ├── Task 02 (Create) ── Task 03 (Brief+Rules) ── Task 04 (Content Gen) ── Task 05 (Image Prompt)
                                        │                                                                                       │
                                        │                                                                                       ▼
                                        │                                                                                Task 06 (Image Gen) ── Task 07 (QC)
                                        │                                                                                                       │
                                        │                                                                                                       ▼
                                        │                                                                                                Task 08 (Review)
                                        │                                                                                                  │
                                        │                                                                    ┌─────────────────────────────┘
                                        │                                                                    ▼
                                        │                                                          Task 09 (Calendar) ── Task 10 (Publish)
                                        │                                                                            │
                                        │                                                                            ▼
                                        │                                                          Task 11 (Dashboard) ── Task 12 (Logs)
                                        │                                                                                  │
                                        └──────────────────────────────────────────────────────────────────────────────────┘
                                                                                                                   Task 13 (Final QA)
```