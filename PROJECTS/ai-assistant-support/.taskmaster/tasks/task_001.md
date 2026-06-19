# Task ID: 1

**Title:** F1 — Project Scaffold & Database

**Status:** in-progress

**Dependencies:** None

**Priority:** high

**Description:** Bootstrap support-app Next.js 16 + Supabase migrations aas_clients, aas_support_contacts, aas_tickets + seed + env template

**Details:**

Create support-app/ with build/typecheck/lint. Migrations per PRD F1. Seed client chinesevibe. .env.example for Supabase, LINE Support OA, Linear. docs/RUNBOOK.md stub.

**Test Strategy:**

npm run build pass; migrations valid SQL

## Subtasks

### 1.1. Scaffold support-app Next.js 16

**Status:** pending  
**Dependencies:** None  

Create support-app/ with App Router, TypeScript, Tailwind, shadcn/ui, npm scripts build/typecheck/lint

**Details:**

npx create-next-app or equivalent in support-app/. No LINE/Linear code yet. Must pass npm run build.

### 1.2. Supabase migrations — aas_ tables

**Status:** pending  
**Dependencies:** None  

Migration for aas_clients, aas_support_contacts, aas_tickets per PRD F1/F2/F5 fields

**Details:**

supabase/migrations/*.sql. Prefix aas_. Include RLS stubs. Generate types if using supabase gen types.

### 1.3. Seed client chinesevibe

**Status:** pending  
**Dependencies:** None  

Seed at least ChineseVibe (slug chinesevibe) with linear_project_name placeholder

**Details:**

supabase/seed.sql or migration seed. active=true.

### 1.4. support-app .env.example

**Status:** pending  
**Dependencies:** None  

Env template: Supabase URL/keys, LINE Support channel, Linear API key

**Details:**

support-app/.env.example — no secrets. Match PRD dependencies list.

### 1.5. docs/RUNBOOK.md stub

**Status:** pending  
**Dependencies:** None  

Stub runbook listing env vars and setup steps for LINE/Linear/Supabase/Vercel

**Details:**

docs/RUNBOOK.md at project root. Env vars only — no deploy in T1.
