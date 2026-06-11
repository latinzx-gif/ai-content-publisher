# Architecture Overview

## Monorepo Structure

The Head Office project is a consolidated Next.js application that serves two primary surfaces:

1.  **Head Office PRD (`/`)**: The main dashboard and agent orchestration interface. Source: `src/app/page.tsx`.
2.  **Content OS Publisher (`/publisher/*`)**: Dedicated workflow for content operations. Source: `src/app/publisher/`.

## Database Strategy (Dual Supabase)

The system utilizes two logical Supabase configurations:

- **Platform Tables (`lib/supabase`)**: Core application state, user data, and PRD-specific entities.
- **Publisher Tables (`lib/publisher/supabase`)**: Specialized tables for the Content OS, typically prefixed with `acp_`.

## Dev Environment

- **URL**: `http://localhost:3001`
- **Command**: `cd head-office-app && npm run dev`

---
*Refer to docs/README.md for the full documentation index.*
