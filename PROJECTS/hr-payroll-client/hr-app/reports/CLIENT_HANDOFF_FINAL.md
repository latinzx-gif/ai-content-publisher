# Client Handoff — Final (T107)

**Project:** LINE OA HR & Payroll Platform  
**Date:** 2026-06-11  
**Production:** https://hr-app-two-iota.vercel.app

## What's new since Phase 5 handoff

1. **Self-register** — LINE login → `/register` → employee LIFF/portal
2. **HR onboarding queue** — `/admin/employees?status=onboarding`
3. **Employee Web Portal** — `/portal` (profile, attendance, leave, documents)
4. **OT** — พนักงานยื่นเองผ่าน LIFF → BM อนุมัติ → HR อนุมัติ

## Key URLs

| Surface | URL |
|---------|-----|
| Login | `/login` |
| Register | `/register` |
| Employee portal | `/portal` |
| HR admin | `/admin` |
| CEO | `/admin/ceo` |
| Branch Manager | `/admin/branch` |

## Runbook

### Deploy

```bash
cd hr-app && npx vercel --prod --yes
```

### Smoke

```bash
node scripts/e2e/smoke-role-routes.mjs
node scripts/e2e/flow-onboarding.mjs
```

### Cron health

```bash
node scripts/cron-health-check.mjs
# Run printed SQL in Supabase dashboard
```

### Key rotation (recommended post-handoff)

1. Supabase → rotate service role → update Vercel env
2. LINE channel secret / access token
3. Update Vault `secret_key` with new `sb_secret_*`

## Out of scope (Phase 9 CR)

- Payslip PDF / baht payroll calculation (T96–T101)

## Support

See `CLIENT_HANDOFF_P5.md` for LINE OA, Supabase, BM setup details.
