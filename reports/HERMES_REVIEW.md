# HERMES_REVIEW — Codex CLI Capability Audit

**Date:** 2026-06-08
**Author:** Hermes PM/Orchestrator
**Codex Version:** v0.137.0 (OpenAI Codex CLI)

---

## Executive Summary

Codex CLI v0.137.0 is a **fully-featured autonomous coding agent** installed at `/Users/jakarinosk/.npm-global/bin/codex`. It has **18 plugins already enabled** across 3 marketplaces, **25+ stable features**, and **3 configured MCP servers**. It can write code, browse the web, control the desktop, manage Supabase, deploy to Vercel, edit designs in Figma/Canva, send emails, and much more.

---

## 1. Plugin Ecosystem (3 Marketplaces)

### ✅ Installed & Enabled (18 plugins)

#### openai-primary-runtime — Productivity Suite
| Plugin | Capability |
|--------|-----------|
| `documents` | Create, edit, render, verify, export Word docs & Google Docs |
| `spreadsheets` | Create, edit, analyze Excel/Sheets spreadsheets |
| `presentations` | Create, edit PowerPoint/Keynote presentations |

#### openai-bundled — Built-in Tools
| Plugin | Capability |
|--------|-----------|
| `browser` | Web browsing, page interaction, scraping |
| `chrome` | Chrome browser automation and control |
| `computer-use` | Desktop/macOS GUI automation (click, type, screenshot) |
| `latex` ❌ (not installed) | LaTeX document compilation |

#### openai-curated — Third-party Integrations
| Plugin | Capability |
|--------|-----------|
| `gmail` | Send, read, search Gmail messages |
| `google-calendar` | Calendar event management |
| `google-drive` | Google Drive file operations |
| `canva` | Design creation and editing via Canva |
| `figma` | Design file inspection, component edits |
| `vercel` | Vercel deployment, preview, monitoring |
| `supabase` | **Database operations, storage, auth, RLS policies** |
| `third-bridge` | Third-party API integration bridge |
| `lovable` | Web app building assistant |
| `openai-developers` | OpenAI API usage, model management |
| `codex-security` | Code security scanning and analysis |

### ❌ Available but Not Installed (Notable)
| Plugin | Would Enable |
|--------|-------------|
| `linear` | Issue tracking |
| `github` | GitHub repo management |
| `slack` | Messaging/notifications |
| `notion` | Wiki/documentation |
| `stripe` | Payment processing |
| `hugging-face` | Model hub access |
| `netlify` | Deployment |
| `docusign` | Document signing |
| `shopify` | E-commerce management |
| `datadog` | Monitoring/observability |
| `sentry` | Error tracking |
| `calendly` | Scheduling |
| **90+ more** | See full list in `codex plugin list` |

---

## 2. Stable Feature Flags (Ready to Use)

| Feature | Purpose |
|---------|---------|
| `browser_use` | Web browsing from within Codex |
| `computer_use` | Desktop GUI automation |
| `image_generation` | Generate images via AI |
| `multi_agent` | Multi-agent collaboration |
| `goals` | Goal-oriented task planning |
| `hooks` | Pre/post execution hooks |
| `plugins` | Plugin management |
| `fast_mode` | Optimized execution speed |
| `shell_snapshot` | Shell state snapshots for recovery |
| `guardian_approval` | Safety guardrails |
| `tool_suggest` | Intelligent tool suggestions |
| `workspace_dependencies` | Auto-detect project dependencies |
| `in_app_browser` | In-app browser for auth flows |
| `personality` | Customizable agent personality |
| `unified_exec` | Unified execution engine |

---

## 3. MCP Servers Configured (3)

| Name | Purpose |
|------|---------|
| `computer-use` | macOS desktop agent service |
| `node_repl` | Node.js REPL for code execution |
| `openai-api-key-local-confirmation` | API key confirmation flow |

---

## 4. Key Commands for Hermes Integration

| Command | Purpose |
|---------|---------|
| `codex exec 'prompt'` | One-shot task execution |
| `codex exec review --uncommitted` | Review unstaged changes |
| `codex exec review --base main` | Review diff against branch |
| `codex exec review --commit <SHA>` | Review a specific commit |
| `codex plugin list` | List plugins |
| `codex plugin add <name>@marketplace` | Install new plugin |
| `codex mcp list/add/remove` | Manage MCP servers |
| `codex doctor` | Diagnose installation |

### Recommended Flags for Hermes:
```bash
# Replace deprecated --full-auto with:
-s workspace-write

# Capture output to file:
--output-last-message reports/CODEX_RESULT.md

# No session files:
--ephemeral

# Use working directory:
-C /path/to/project
```

---

## 5. Critical Notes

### PATH Issue (⚠️ Must Fix)
Codex binary at `~/.npm-global/bin/codex` is NOT in default Hermes terminal PATH. Always use full path or prepend to PATH.

### Build in Sandbox
Codex sandbox may fail `npm run build` with `Operation not permitted`. The code is correct — run build OUTSIDE sandbox to confirm.

### PTY Required
Codex hangs without `pty=True` in terminal calls. Always set this.

### Prompt via stdin
Codex reads prompt from argument. For long prompts, write to temp file and use `'$(cat /tmp/prompt.txt)'`.

---

## 6. Relevance to Current Project

| Project Need | Codex Plugin/Feature | Status |
|-------------|---------------------|--------|
| Supabase DB operations | `supabase` plugin | ✅ Installed |
| Supabase Storage | `supabase` plugin | ✅ Installed |
| UI/Figma design edits | `figma` plugin | ✅ Installed |
| Canva design creation | `canva` plugin | ✅ Installed |
| Vercel deployment | `vercel` plugin | ✅ Installed |
| Code review | `codex exec review` | ✅ Built-in |
| Image generation | `image_generation` feature | ✅ Stable |

---

## Verdict

**Codex CLI is fully capable of handling all current and upcoming project tasks.** The Supabase plugin being already installed is especially valuable — it means Codex can handle database schema, storage, auth, and RLS policies directly without manual setup.

**Recommendation:** No additional plugins needed for current project scope. If linear/slack integration is desired later, they can be installed on-demand via `codex plugin add <name>@openai-curated`.