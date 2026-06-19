#!/usr/bin/env bash
#
# complete_current_task.sh — Phase 4 Task Completion
#
# Run this AFTER Codex finishes executing TODAY_AGENT_TASK.md.
#
# Flow:
#   1. Read TODAY_AGENT_TASK.md to identify the completed task.
#   2. Check git status for changed files.
#   3. Create a completion report.
#   4. Pick the next highest-priority task from NEXT_GEMINI_TASKS.md
#      (skipping the completed task).
#   5. Save next task to runtime/next_pending_agent_task.md.
#   6. Send Telegram with completion summary + next task + approval options.
#
# NEVER creates TODAY_AGENT_TASK.md — that only happens after
# APPROVE_NEXT via check_next_task_approval.sh.
#
# Dependencies: jq, curl, git
#
set -euo pipefail

HEAD_OFFICE="${HOME}/HEAD-OFFICE"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HERMES_OS="${HEAD_OFFICE}/OS/HERMES-OS"
RUNTIME_DIR="${HERMES_OS}/runtime"
TODAY=$(date "+%Y-%m-%d")
TASK_FILE="${HEAD_OFFICE}/TODAY_AGENT_TASK.md"

# ─── Load secrets ───────────────────────────────────────────────
if [ -f "${HEAD_OFFICE}/.env" ]; then
  set -a
  source "${HEAD_OFFICE}/.env"
  set +a
fi

# ─── Dependencies ───────────────────────────────────────────────
for cmd in jq curl git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is required."
    exit 1
  fi
done

mkdir -p "$RUNTIME_DIR"

# ═══════════════════════════════════════════════════════════════
#  VERIFY TASK EXISTS
# ═══════════════════════════════════════════════════════════════

if [ ! -f "$TASK_FILE" ]; then
  echo "ERROR: TODAY_AGENT_TASK.md not found at $TASK_FILE"
  echo "Run the morning brief + approve it first, then execute the task."
  exit 1
fi

echo "[$(date)] Reading completed task: $TASK_FILE"

# Extract the task name from the file (line starting with "## Task" or after first heading)
COMPLETED_TASK=$(grep -E '^\|\| Task|^\#\# Task' "$TASK_FILE" | head -1 | sed 's/^[#| ]*Task[#| ]*//;s/^[# ]*//' 2>/dev/null || echo "")
if [ -z "$COMPLETED_TASK" ]; then
  # Fallback: first non-empty line after "## Task"
  COMPLETED_TASK=$(sed -n '/^## Task/,/^##/{ /^## Task/!p }' "$TASK_FILE" | head -2 | tail -1 | xargs 2>/dev/null || echo "Unknown")
fi

echo "[$(date)] Completed task: $COMPLETED_TASK"

# ═══════════════════════════════════════════════════════════════
#  COLLECT GIT STATUS
# ═══════════════════════════════════════════════════════════════

GIT_REPO=""
GIT_STATUS=""
FILES_CHANGED=""

# Try HEAD-OFFICE root first
if git -C "$HEAD_OFFICE" rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
  GIT_REPO="$HEAD_OFFICE"
  echo "[$(date)] Git repo found: $GIT_REPO"
elif git -C "${HEAD_OFFICE}/PROJECTS/AI Content Legal System" rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
  GIT_REPO="${HEAD_OFFICE}/PROJECTS/AI Content Legal System"
  echo "[$(date)] Git repo found: $GIT_REPO"
else
  echo "[$(date)] No git repo found. Skipping git status."
fi

if [ -n "$GIT_REPO" ]; then
  # Collect changed files (short status, no secrets)
  GIT_STATUS=$(git -C "$GIT_REPO" status --short 2>/dev/null || echo "")
  FILES_CHANGED=$(git -C "$GIT_REPO" diff --name-only 2>/dev/null || echo "")
  if [ -z "$FILES_CHANGED" ]; then
    # Check for unstaged + untracked
    FILES_CHANGED=$(git -C "$GIT_REPO" ls-files --others --exclude-standard 2>/dev/null || echo "")
  fi
fi

if [ -z "$FILES_CHANGED" ]; then
  FILES_CHANGED="(no file changes detected — task may be informational)"
fi

echo "[$(date)] Files changed:"
echo "$FILES_CHANGED" | head -20

# ═══════════════════════════════════════════════════════════════
#  VALIDATION STATUS
# ═══════════════════════════════════════════════════════════════

VALIDATION_STATUS="Task executed. Verify output manually by reviewing the files listed above."

# ═══════════════════════════════════════════════════════════════
#  PICK NEXT TASK (skip the completed one)
# ═══════════════════════════════════════════════════════════════

# Priority keyword sets (same as hermes_morning_brief.sh)
P1_KEYWORDS="ai content publisher|client delivery|delivery readiness|handoff|qa|buffer|image generation|creative approval|supabase storage|image metadata|metadata db|image validation|batch upload|upload|storage|gallery|media"
P2_KEYWORDS="fastwork|service package|pricing|sales asset|requirement form|support scope"
P3_KEYWORDS="dataclaw|market scan|signal|dataset|report|research pipeline"
P4_KEYWORDS="investment|risk policy|drawdown|capital preservation"
P5_KEYWORDS="hermes|system|documentation|cleanup|architecture"

score_task() {
  local text="$1"
  text=$(echo "$text" | tr '[:upper:]' '[:lower:]')
  echo "$text" | grep -qE "$P1_KEYWORDS" && echo 1 && return
  echo "$text" | grep -qE "$P2_KEYWORDS" && echo 2 && return
  echo "$text" | grep -qE "$P3_KEYWORDS" && echo 3 && return
  echo "$text" | grep -qE "$P4_KEYWORDS" && echo 4 && return
  echo "$text" | grep -qE "$P5_KEYWORDS" && echo 5 && return
  echo 99
}

priority_label() {
  case "$1" in 1) echo "P1 Cashflow";; 2) echo "P2 FASTWORK";; 3) echo "P3 DATACLAW";; 4) echo "P4 INVESTMENT";; 5) echo "P5 System";; *) echo "Unclassified";; esac
}

pick_next_task() {
  local tasks_file="${HEAD_OFFICE}/NEXT_GEMINI_TASKS.md"
  local completed_name="$1"

  if [ ! -f "$tasks_file" ]; then
    echo "[$(date)] NEXT_GEMINI_TASKS.md not found."
    return 1
  fi

  # Parse all tasks
  local -a task_names=()
  local -a task_descs=()
  local -a task_bodies=()
  local -a task_steps_arr=()

  local in_task=0
  local cur_name=""
  local cur_desc=""
  local cur_steps=""
  local task_index=0

  while IFS= read -r line; do
    if [[ "$line" =~ ^[0-9]+\.\ \*\*([A-Z_]+)\*\*:(.*)$ ]]; then
      if [ $in_task -eq 1 ]; then
        task_names[$task_index]="$cur_name"
        task_descs[$task_index]="$cur_desc"
        task_bodies[$task_index]="${cur_name} ${cur_desc} ${cur_steps}"
        task_steps_arr[$task_index]="$cur_steps"
        task_index=$((task_index + 1))
      fi
      in_task=1
      cur_name="${BASH_REMATCH[1]}"
      cur_desc="${BASH_REMATCH[2]}"
      cur_steps=""
      continue
    fi
    if [ $in_task -eq 1 ]; then
      if [[ "$line" =~ ^[[:space:]]*-\ (.*)$ ]]; then
        cur_steps="${cur_steps}${BASH_REMATCH[1]}"$'\n'
      elif [[ -z "$line" || "$line" =~ ^### ]]; then
        :
      fi
    fi
  done < "$tasks_file"

  if [ $in_task -eq 1 ] && [ -n "$cur_name" ]; then
    task_names[$task_index]="$cur_name"
    task_descs[$task_index]="$cur_desc"
    task_bodies[$task_index]="${cur_name} ${cur_desc} ${cur_steps}"
    task_steps_arr[$task_index]="$cur_steps"
    task_index=$((task_index + 1))
  fi

  echo "[$(date)] Found $task_index tasks. Scoring (skipping completed: $completed_name)..."

  local best_idx=-1
  local best_score=999
  local best_label=""

  for ((i=0; i<task_index; i++)); do
    local name="${task_names[$i]}"
    local body="${task_bodies[$i]}"

    # Skip the completed task
    local completed_upper=$(echo "$completed_name" | tr '[:lower:]' '[:upper:]')
    if echo "$completed_upper" | grep -q "${name}"; then
      echo "[$(date)]   #$((i+1)) SKIP (completed): $name"
      continue
    fi

    local score=$(score_task "$body")
    local label=$(priority_label "$score")
    echo "[$(date)]   #$((i+1)) score=$score ($label): $name"

    if [ "$score" -lt "$best_score" ]; then
      best_score=$score
      best_idx=$i
      best_label="$label"
    fi
  done

  if [ "$best_idx" -lt 0 ]; then
    echo "[$(date)] No next task available (all tasks completed or no match)."
    return 1
  fi

  local name="${task_names[$best_idx]}"
  local desc="${task_descs[$best_idx]}"
  local steps="${task_steps_arr[$best_idx]}"

  desc=$(echo "$desc" | xargs)
  NEXT_TASK_NAME="$name"
  NEXT_TASK_TITLE="$name: $desc"
  NEXT_TASK_REASON="Priority: $best_label (score $best_score) — next available after '$completed_name'"

  # Build instructions
  NEXT_TASK_INSTRUCTIONS="${NEXT_TASK_TITLE}

Steps:
$(echo "$steps" | while IFS= read -r s; do [ -n "$s" ] && echo "- $s"; done)

Work inside /Users/jakarinosk/HEAD-OFFICE/.
Do not modify project application code outside the scope.
Do not build UI unless explicitly instructed.
Do not create new infrastructure.
Stop when all steps are completed and verified."

  return 0
}

NEXT_TASK_NAME=""
NEXT_TASK_TITLE=""
NEXT_TASK_INSTRUCTIONS=""
NEXT_TASK_REASON=""

echo "[$(date)] Picking next task..."
if pick_next_task "$COMPLETED_TASK"; then
  echo "[$(date)] Next task: $NEXT_TASK_TITLE"
else
  echo "[$(date)] No next task found. Using completion summary only."
  NEXT_TASK_NAME=""
  NEXT_TASK_TITLE="All P1 tasks complete — run morning brief tomorrow for new tasks"
  NEXT_TASK_INSTRUCTIONS=""
  NEXT_TASK_REASON="No remaining tasks in NEXT_GEMINI_TASKS.md"
fi

# ═══════════════════════════════════════════════════════════════
#  SAVE COMPLETION REPORT
# ═══════════════════════════════════════════════════════════════

WARNINGS="Review the completed task output to confirm correctness."

cat > "${RUNTIME_DIR}/latest_task_completion_report.md" << REPORTEOF
# Task Completion Report — ${TODAY}

## Completed Task
${COMPLETED_TASK}

## Files Changed
${FILES_CHANGED}

## Validation Status
${VALIDATION_STATUS}

## Warnings / Risks
${WARNINGS}

## Next Recommended Task
${NEXT_TASK_TITLE}
Reason: ${NEXT_TASK_REASON}
REPORTEOF

echo "[$(date)] Created: ${RUNTIME_DIR}/latest_task_completion_report.md"

# ═══════════════════════════════════════════════════════════════
#  SAVE NEXT PENDING TASK
# ═══════════════════════════════════════════════════════════════

if [ -n "$NEXT_TASK_NAME" ]; then
  cat > "${RUNTIME_DIR}/next_pending_agent_task.md" << TASKEOF
# Today's Agent Task — ${TODAY}

## Task
${NEXT_TASK_TITLE}

---

## Instructions

${NEXT_TASK_INSTRUCTIONS}

---

## Constraints (What Not To Do)

- Do not modify application source code.
- Do not run build/compile/test commands unless explicitly instructed.
- Do not deploy anything.
- Do not create new database infrastructure.
- Do not touch files outside HEAD-OFFICE/.
- Do not create UI components or pages.

---

## Expected Output

A completed task artifact as described in the instructions above.
Verify the output before finishing.

---

## Stop Condition

When the described output has been produced and verified.

---

## Source

This task was selected via: auto-advance after completing "$COMPLETED_TASK"
Generated by: Task Completion Agent on ${TODAY}
TASKEOF
  echo "[$(date)] Created: ${RUNTIME_DIR}/next_pending_agent_task.md"
else
  echo "[$(date)] No next task to save."
fi

# ═══════════════════════════════════════════════════════════════
#  BUILD TELEGRAM MESSAGE
# ═══════════════════════════════════════════════════════════════

FILES_CHANGED_SHORT=$(echo "$FILES_CHANGED" | head -15 | sed 's/^/* /')

TELEGRAM_MSG="## ✅ Task Complete — ${TODAY}

**Completed Task:** ${COMPLETED_TASK}

---

### 📂 Files Changed

${FILES_CHANGED_SHORT}

---

### ✅ Validation Status

${VALIDATION_STATUS}

---

### ⚠️ Warnings / Risks

${WARNINGS}

---

### 🔮 Next Recommended Task

**${NEXT_TASK_TITLE}**

*Reason:* ${NEXT_TASK_REASON}

*Saved to \`runtime/next_pending_agent_task.md\`*

---

### ✅ Approval

**Reply to this message:**

\`\`\`
APPROVE_NEXT — Create TODAY_AGENT_TASK.md with the next task
HOLD         — No next task for now
CHANGE       — Revise the next task manually
\`\`\`"

# ═══════════════════════════════════════════════════════════════
#  SEND TELEGRAM
# ═══════════════════════════════════════════════════════════════

if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "[$(date)] Sending Telegram completion report..."
  "${SCRIPT_DIR}/send_telegram_message.sh" \
    "${TELEGRAM_BOT_TOKEN}" \
    "${TELEGRAM_CHAT_ID}" \
    "${TELEGRAM_MSG}" && \
    echo "[$(date)] Telegram sent." || \
    echo "[$(date)] Telegram send had an issue."
else
  echo "[$(date)] Telegram skipped (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set)."
  echo ""
  echo "=== TELEGRAM MESSAGE ==="
  echo "$TELEGRAM_MSG"
fi

echo ""
echo "=== TASK COMPLETION COMPLETE ==="
echo "Completed:  $COMPLETED_TASK"
echo "Report:     ${RUNTIME_DIR}/latest_task_completion_report.md"
if [ -f "${RUNTIME_DIR}/next_pending_agent_task.md" ]; then
  echo "Next task:  ${RUNTIME_DIR}/next_pending_agent_task.md"
fi
echo "NEXT:       Reply APPROVE_NEXT in Telegram, then run check_next_task_approval.sh"
echo ""