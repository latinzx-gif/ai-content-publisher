#!/usr/bin/env bash
# =============================================================================
# tmux_hermes.sh — Hermes 2.0 Session Setup
# =============================================================================
# สร้าง tmux session พร้อม 4 windows สำหรับ Hermes + 9-agent team
#
# Layout:
#   Win 0 [HERMES]  — Orchestrator (Claude / Hermes CLI)
#   Win 1 [BUILD]   — Planner | Builder A | Builder B
#   Win 2 [FIX]     — Debugger | Patcher | Verifier
#   Win 3 [SUPPORT] — Researcher | Analyst | Auditor
#
# Usage:
#   chmod +x tmux_hermes.sh
#   ./tmux_hermes.sh
#   ./tmux_hermes.sh attach   # attach โดยตรง
# =============================================================================

SESSION="HERMES"
HO_DIR="$HOME/HEAD-OFFICE"

# Color codes (สำหรับ echo)
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

# ── Validate HEAD-OFFICE exists ──────────────────────────────────────────────
if [[ ! -d "$HO_DIR" ]]; then
  echo -e "${RED}ERROR: HEAD-OFFICE not found at $HO_DIR${NC}"
  exit 1
fi

# ── Kill existing session if requested ──────────────────────────────────────
if tmux has-session -t "$SESSION" 2>/dev/null; then
  if [[ "$1" == "reset" ]]; then
    echo -e "${YELLOW}Killing existing session: $SESSION${NC}"
    tmux kill-session -t "$SESSION"
  else
    echo -e "${YELLOW}Session '$SESSION' already running.${NC}"
    echo "  tmux attach -t $SESSION   — join"
    echo "  $0 reset                  — restart fresh"
    exit 0
  fi
fi

echo -e "${GREEN}Starting Hermes 2.0 tmux session...${NC}"

# ─────────────────────────────────────────────────────────────────────────────
# WIN 0 — HERMES (orchestrator)
# ─────────────────────────────────────────────────────────────────────────────
tmux new-session -d -s "$SESSION" -n "HERMES" -c "$HO_DIR"

tmux send-keys -t "$SESSION:HERMES" "
echo '╔══════════════════════════════════════════════════════════╗'
echo '║   HERMES 2.0 — ORCHESTRATOR                             ║'
echo '║   Role: PM / Task Dispatcher — ไม่แตะ code              ║'
╠══════════════════════════════════════════════════════════╣
echo '║   อ่านก่อน:                                              ║'
echo '║   OS/HERMES-OS/HERMES_TASK_ORDER.md                     ║'
echo '║   OS/HERMES-OS/READING_PROTOCOL.md                      ║'
echo '║   OS/HERMES-OS/AGENT_TEAM.md                            ║'
echo '╚══════════════════════════════════════════════════════════╝'
echo ''
echo 'ถ้าใช้ Claude Code: claude --dangerously-skip-permissions'
echo 'ถ้าใช้ Hermes CLI:  hermes start'
" Enter

# ─────────────────────────────────────────────────────────────────────────────
# WIN 1 — BUILD (3 panes: Planner | Builder A | Builder B)
# ─────────────────────────────────────────────────────────────────────────────
tmux new-window -t "$SESSION" -n "BUILD" -c "$HO_DIR"

# Pane 0 (main): Planner
tmux send-keys -t "$SESSION:BUILD.0" "
echo '┌─── PLANNER ───────────────────────────────────────────────┐'
echo '│ Runtime: Codex CLI    Model: gpt-5.4-mini                  │'
echo '│ Role: วางแผน approach ก่อน execute ทุก task               │'
echo '│ ห้าม: Implement โดยตรง                                     │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Start: codex --model gpt-5.4-mini -f <TASK_FILE>'
" Enter

# Split vertical → pane 1: Builder A
tmux split-window -t "$SESSION:BUILD" -h -c "$HO_DIR"
tmux send-keys -t "$SESSION:BUILD.1" "
echo '┌─── BUILDER A ─────────────────────────────────────────────┐'
echo '│ Runtime: Antigravity  Model: Gemini 3.5 Flash              │'
echo '│ Role: UI components / frontend / E2E browser               │'
echo '│ ห้าม: Self-approve                                         │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Note: Builder A ใช้ Antigravity IDE ไม่ใช่ terminal'
echo 'ใช้ pane นี้สำหรับ monitor output / TASK_RESULT.md เท่านั้น'
" Enter

# Split horizontal under Builder A → pane 2: Builder B
tmux split-window -t "$SESSION:BUILD.1" -v -c "$HO_DIR"
tmux send-keys -t "$SESSION:BUILD.2" "
echo '┌─── BUILDER B ─────────────────────────────────────────────┐'
echo '│ Runtime: Codex CLI    Model: gpt-5.3-codex-spark           │'
echo '│ Role: API / script / backend / isolated new files          │'
echo '│ ห้าม: แตะ logic เดิม, self-approve                         │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Start: codex --model gpt-5.3-codex-spark -f <TASK_FILE>'
" Enter

# Focus Planner pane
tmux select-pane -t "$SESSION:BUILD.0"

# ─────────────────────────────────────────────────────────────────────────────
# WIN 2 — FIX (3 panes: Debugger | Patcher | Verifier)
# ─────────────────────────────────────────────────────────────────────────────
tmux new-window -t "$SESSION" -n "FIX" -c "$HO_DIR"

# Pane 0 (main): Debugger
tmux send-keys -t "$SESSION:FIX.0" "
echo '┌─── DEBUGGER ──────────────────────────────────────────────┐'
echo '│ Runtime: Codex CLI    Model: gpt-5.5                       │'
echo '│ Role: หา root cause, วิเคราะห์ multi-file bug             │'
echo '│ ห้าม: Apply fix เอง                                       │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Debug: codex --model gpt-5.5 -f <BUG_REPORT>'
" Enter

# Split vertical → pane 1: Patcher
tmux split-window -t "$SESSION:FIX" -h -c "$HO_DIR"
tmux send-keys -t "$SESSION:FIX.1" "
echo '┌─── PATCHER ───────────────────────────────────────────────┐'
echo '│ Runtime: Codex CLI    Model: gpt-5.3-codex-spark           │'
echo '│ Role: Apply fix ตามที่ Debugger ชี้เป้า                    │'
echo '│ ห้าม: วิเคราะห์ root cause เอง                             │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Patch: codex --model gpt-5.3-codex-spark -f <BUG_ANALYSIS>'
" Enter

# Split horizontal under Patcher → pane 2: Verifier
tmux split-window -t "$SESSION:FIX.1" -v -c "$HO_DIR"
tmux send-keys -t "$SESSION:FIX.2" "
echo '┌─── VERIFIER ──────────────────────────────────────────────┐'
echo '│ Runtime: Antigravity  Model: Gemini 3.5 Flash              │'
echo '│ Role: รัน browser test ยืนยันหลังแก้                        │'
echo '│ ห้าม: Self-approve                                         │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Note: Verifier ใช้ Antigravity IDE ไม่ใช่ terminal'
echo 'ใช้ pane นี้สำหรับ monitor output / test results เท่านั้น'
" Enter

# Focus Debugger pane
tmux select-pane -t "$SESSION:FIX.0"

# ─────────────────────────────────────────────────────────────────────────────
# WIN 3 — SUPPORT (3 panes: Researcher | Analyst | Auditor)
# ─────────────────────────────────────────────────────────────────────────────
tmux new-window -t "$SESSION" -n "SUPPORT" -c "$HO_DIR"

# Pane 0 (main): Researcher
tmux send-keys -t "$SESSION:SUPPORT.0" "
echo '┌─── RESEARCHER ────────────────────────────────────────────┐'
echo '│ Runtime: Gemini CLI   Model: gemini-3.1-pro-preview        │'
echo '│ Role: DataClaw / long doc / market analysis / audit        │'
echo '│ ห้าม: Implement code                                        │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Start: gemini -m gemini-3.1-pro-preview < <RESEARCH_BRIEF>'
" Enter

# Split vertical → pane 1: Analyst
tmux split-window -t "$SESSION:SUPPORT" -h -c "$HO_DIR"
tmux send-keys -t "$SESSION:SUPPORT.1" "
echo '┌─── ANALYST ───────────────────────────────────────────────┐'
echo '│ Runtime: Gemini CLI   Model: gemini-3.5-flash              │'
echo '│ Role: Morning brief / triage / สรุปสั้น / routing          │'
echo '│ ห้าม: Complex reasoning tasks                               │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Start: gemini -m gemini-3.5-flash < <BRIEF_PROMPT>'
" Enter

# Split horizontal under Analyst → pane 2: Auditor
tmux split-window -t "$SESSION:SUPPORT.1" -v -c "$HO_DIR"
tmux send-keys -t "$SESSION:SUPPORT.2" "
echo '┌─── AUDITOR ───────────────────────────────────────────────┐'
echo '│ Runtime: Codex CLI    Model: gpt-5.5                       │'
echo '│ Role: Pre-delivery audit, quality gate check               │'
echo '│ ห้าม: Implement code                                        │'
echo '└───────────────────────────────────────────────────────────┘'
echo ''
echo 'Audit: codex --model gpt-5.5 -f <DELIVERY_READINESS_AUDIT>'
" Enter

# Focus Researcher pane
tmux select-pane -t "$SESSION:SUPPORT.0"

# ─────────────────────────────────────────────────────────────────────────────
# Focus back to HERMES window
# ─────────────────────────────────────────────────────────────────────────────
tmux select-window -t "$SESSION:HERMES"

echo -e "${GREEN}✓ Session '$SESSION' ready — 4 windows created${NC}"
echo ""
echo "  Win 0  HERMES      — Orchestrator"
echo "  Win 1  BUILD       — Planner | Builder A | Builder B"
echo "  Win 2  FIX         — Debugger | Patcher | Verifier"
echo "  Win 3  SUPPORT     — Researcher | Analyst | Auditor"
echo ""

if [[ "$1" == "attach" ]] || [[ "$1" == "reset" ]]; then
  tmux attach -t "$SESSION"
else
  echo "  tmux attach -t $SESSION"
fi
