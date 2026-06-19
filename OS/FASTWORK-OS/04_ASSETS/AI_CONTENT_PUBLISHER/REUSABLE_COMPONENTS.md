# Reusable Components

## Purpose
Capture reusable UI, database, and system components from AI Content Legal System for future content-generation SaaS clients.

## Reusable UI Patterns
- Dashboard shell with sidebar navigation and language switcher.
- Brand profile settings form.
- Integration settings form for OpenAI and publishing provider credentials.
- Generate form with topic, objective, and mode-based controls.
- Draft list with preview, edit, approve, reject, and status display.
- Calendar and timeline views for scheduled or published posts.
- Status badges, metric cards, empty states, dialogs, and loading states.

## Reusable Database Patterns
- Profiles table linked to authenticated users.
- Brands table for tone, personality, audience, business type, and content rules.
- Integrations table for encrypted provider tokens.
- Workflow logs for generation and publishing events.
- Content posts table for generated content, lifecycle status, metadata, and provider IDs.
- RLS-first Supabase structure with single-owner mode option.
- Migration sequence for schema evolution and feature additions.

## Reusable System Patterns
- Next.js App Router SaaS structure.
- Supabase client/server/admin split.
- OpenAI generation layer isolated in `src/lib/openai`.
- Publishing provider abstraction in `src/lib/publishing`.
- Encryption utility for BYOK integrations.
- Documentation-heavy delivery model with audit, handoff, deployment, and QA reports.

## Future Customization Points
- Industry-specific fields in brand profile.
- Client-specific dashboard labels and language.
- Provider modules for additional social platforms.
- Reporting, analytics, and approval-stage depth.
- White-label styling, typography, and client domain.
