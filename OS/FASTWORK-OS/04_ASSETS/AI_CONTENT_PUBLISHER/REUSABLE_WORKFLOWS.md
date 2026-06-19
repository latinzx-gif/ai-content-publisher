# Reusable Workflows

## Purpose
Capture reusable operating and product workflows from AI Content Legal System for future client builds.

## Core Product Workflow
1. Brand setup
2. Content topic and objective input
3. AI text generation
4. Draft review
5. Edit, approve, or reject
6. Creative/image option generation when enabled
7. Creative approval
8. Publish now or schedule
9. Calendar visibility
10. Publishing provider handoff

## Content Lifecycle Pattern
Use a clear status model from draft to approval to scheduled/published/failed. Do not bypass approval stages for regulated clients.

## Client Onboarding Workflow
1. Capture business type, audience, tone, personality, website, and content rules.
2. Configure OpenAI and publishing provider access.
3. Confirm compliance guardrails.
4. Generate test content.
5. Review output with client.
6. Approve publishing workflow.

## QA Workflow
- Verify prompt inputs and brand context.
- Check generated content for compliance, tone, CTA, and risky claims.
- Confirm publish/schedule action is intentional.
- Log failures and provider errors.
- Validate final handoff before delivery.

## Delivery Workflow
- Prepare setup guide, support scope, limitations, cost guide, and client user guide.
- Run production readiness and smoke checks.
- Get approval before final client delivery.

## Reuse Notes
- Law and accounting should default to stricter compliance.
- Real estate, healthcare, and education need industry-specific disclaimers and content rules.
- Publishing workflow can remain provider-agnostic if provider integration is abstracted.
