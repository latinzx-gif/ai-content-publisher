# Deployment Pattern

## Purpose
Capture the reusable deployment pattern for AI Content Publisher SaaS projects.

## Source Pattern
- Next.js application deployed on Vercel.
- Supabase for Auth, PostgreSQL, RLS, and storage needs.
- OpenAI SDK for generation.
- Buffer or publishing provider integration.
- Environment-variable driven configuration.

## Required Deployment Inputs
- Supabase project URL and anon key.
- Supabase service role key when admin or single-owner workflows require it.
- Encryption key for stored provider tokens.
- OpenAI API key or BYOK setup.
- Publishing provider token or OAuth configuration.
- App URL.
- Mock/production publishing mode.

## Deployment Workflow
1. Confirm source project readiness.
2. Confirm Supabase schema and RLS status.
3. Configure Vercel environment variables.
4. Deploy from GitHub to Vercel.
5. Run smoke test: auth or single-owner access, brand setup, generation, draft review, publish/schedule mock or live path.
6. Record known limitations and support scope.
7. Get manual approval before final client delivery.

## Red Zone Controls
- Production database changes require owner approval.
- Deleting data requires owner approval.
- Security credentials must never be pasted into reusable docs.
- Live publishing and final client delivery require approval.

## Future Customization Points
- Client domain.
- Region and data retention requirements.
- Provider-specific publishing setup.
- Single-owner vs multi-user deployment.
- Staging/production split for higher-risk clients.
