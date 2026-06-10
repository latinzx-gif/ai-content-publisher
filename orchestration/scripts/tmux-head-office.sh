#!/usr/bin/env bash
# Start or attach tmux "head-office" session (4-pane: claude, codex, gemini, dev)
# Usage: ./orchestration/scripts/tmux-head-office.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECT_DIR="$ROOT/head-office-app"
SESSION="head-office"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  exec tmux attach -t "$SESSION"
fi

tmux new-session -d -s "$SESSION" -n "agents" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION":0.0 "cd $PROJECT_DIR && claude" C-m

tmux split-window -h -t "$SESSION":0.0 -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION":0.1 "cd $PROJECT_DIR && codex" C-m

tmux select-pane -t "$SESSION":0.0
tmux split-window -v -t "$SESSION":0.0 -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION":0.2 "cd $PROJECT_DIR && gemini" C-m

tmux select-pane -t "$SESSION":0.1
tmux split-window -v -t "$SESSION":0.1 -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION":0.3 "cd $PROJECT_DIR && npm run dev" C-m

tmux select-layout -t "$SESSION":0 tiled
exec tmux attach -t "$SESSION"
