# Monorepo Round 2 Reorganization Result

## Overview
The Monorepo Round 2 reorganization has been completed. The monorepo root is now cleaner, with all orchestration logic consolidated into a dedicated `orchestration/` directory and historical/stale documentation moved to `archive/`.

## New Monorepo Structure
```text
HEAD-OFFICE/
├── head-office-app/     # Primary application (PRD + Publisher)
├── orchestration/       # Agent loop control center
│   ├── scripts/         # run-claude-task.sh, tmux-claude.sh
│   ├── templates/       # TASK_PLAN_TEMPLATE.md, etc.
│   └── (Control Docs)   # CURRENT_TASK.md, AGENT_LOOP.md, etc.
├── archive/             # Historical docs and retired artifacts
│   └── tasks/
├── PROJECTS/            # Client delivery (untouched)
├── agentops-lite/       # Separate tool (untouched)
├── HERMES-BRAIN/        # Knowledge (to be consolidated)
├── OS/                  # OS definitions (to be consolidated)
├── DATA/                # Data registries (to be consolidated)
└── README.md            # New monorepo map
```

## Key Changes
- **Orchestration Consolidation**: Moved 20+ control files and the `scripts/` folder from the monorepo root to `orchestration/`.
- **Path Migration**: Updated `run-claude-task.sh`, `tmux-claude.sh`, and `auto_build_loop.sh` to handle the new directory structure, correctly referencing `head-office-app/_agent/` for app tasks.
- **Reference Cleanup**: Performed a global search and replace to update stale `apps/ai-content-publisher` references to `head-office-app`.
- **Historical Archive**: Moved 15+ stale root documents and legacy task files to `archive/`.

## Verification Results
- **Path Resolution**: `head-office-app/_agent/PLAN_APPROVAL.md` resolves correctly.
- **App Health**: `npm run build` and `npm run typecheck` PASSED in `head-office-app`.
- **Script Paths**: No bad `$ROOT/_agent` paths found in orchestration scripts.
- **Stale References**: Active orchestration files are clean of stale `apps/ai-content-publisher` paths (except for historical notes in decisions).

## New vs Old Path Table
| Artifact | Old Path | New Path |
|----------|----------|----------|
| Agent Loop Control | `./AGENT_LOOP.md` | `orchestration/AGENT_LOOP.md` |
| Active Task | `./CURRENT_TASK.md` | `orchestration/CURRENT_TASK.md` |
| Task Scripts | `./scripts/` | `orchestration/scripts/` |
| Build Loop | `./auto_build_loop.sh` | `orchestration/auto_build_loop.sh` |
| Legacy Tasks | `./tasks/` | `archive/tasks/` |
| Stale Audits | `./STAGE_* ` | `head-office-app/docs/prd/archive/` |
| Monorepo Map | (None) | `./README.md` |

## Broken Links / Remaining Risks
- **Shell Aliases**: Any user-defined shell aliases pointing to root `scripts/` or task files will need to be updated.
- **Archived Docs**: Links within archived documents were not updated to minimize risk of historical data corruption.

