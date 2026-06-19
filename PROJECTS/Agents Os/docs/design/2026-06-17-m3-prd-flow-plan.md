# Milestone 3 UI Plan Stub

Goal
- Extend PRD Import into PRD Context and Analysis Flow with preview + richer artifact list.

Planned UI edit zones
- `Views.swift:624-698` PRDImportView

Planned layout additions
- Right-side preview panel for normalized markdown
- Generated artifact list for MISSING_INFO / SCOPE_SUMMARY / MODULE_MAP / ROLE_MAP / RISK_REPORT
- Analyst checklist block under import metadata

Note
- Service-layer extraction/artifact generation can proceed first.
- Preview panel layout should be visually reviewed after backend artifact generation lands.
