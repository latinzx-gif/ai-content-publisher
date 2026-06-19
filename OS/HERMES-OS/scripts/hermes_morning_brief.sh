#!/usr/bin/env bash
#
# Hermes Morning Brief — Main Orchestrator (Phase 1)
#
# Lightweight daily brief. Reads minimal context, picks the first
# available P1 cashflow task from NEXT_GEMINI_TASKS.md, generates
# a Telegram-ready brief + scope-limited Codex prompt.
#
# No LLM call — purely shell-based for reliability and speed.
#
# NEVER creates TODAY_AGENT_TASK.md — that only happens after APPROVE
# via check_telegram_approval.sh.
#
# Schedule: 06:00 Asia/Bangkok via macOS launchd
#
set -euo pipefail

HEAD_OFFICE="${HOME}/HEAD-OFFICE"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HERMES_OS="${HEAD_OFFICE}/OS/HERMES-OS"
RUNTIME_DIR="${HERMES_OS}/runtime"
TODAY=$(date "+%Y-%m-%d")

# ─── Load secrets ───────────────────────────────────────────────
if [ -f "${HEAD_OFFICE}/.env" ]; then
  set -a
  source "${HEAD_OFFICE}/.env"
  set +a
fi

# ─── Ensure runtime dir ─────────────────────────────────────────
mkdir -p "$RUNTIME_DIR"

# ═══════════════════════════════════════════════════════════════
#  READ INPUT FILES
# ═══════════════════════════════════════════════════════════════

echo "[$(date)] Reading: HEAD_OFFICE_CURRENT_STATE.md, NEXT_GEMINI_TASKS.md"

CURRENT_STATE=""
[ -f "${HEAD_OFFICE}/HEAD_OFFICE_CURRENT_STATE.md" ] && CURRENT_STATE=$(cat "${HEAD_OFFICE}/HEAD_OFFICE_CURRENT_STATE.md")

NEXT_TASKS=""
[ -f "${HEAD_OFFICE}/NEXT_GEMINI_TASKS.md" ] && NEXT_TASKS=$(cat "${HEAD_OFFICE}/NEXT_GEMINI_TASKS.md")

# ═══════════════════════════════════════════════════════════════
#  PICK TASK BY PRIORITY SCORING
# ═══════════════════════════════════════════════════════════════
#  Parse ALL tasks from NEXT_GEMINI_TASKS.md
#  Score each by keyword match against priority levels
#  Pick the highest-priority (lowest score) task
#
#  Priority levels (lower score = higher priority):
#
#  Level 1 (score 1): AI Content Publisher, client delivery,
#    delivery readiness, handoff, QA, Buffer, image generation,
#    creative approval, Supabase storage, image metadata,
#    metadata db, image validation, batch upload, upload,
#    storage, gallery, media
#  Level 2 (score 2): FASTWORK, service package, pricing,
#    sales asset, requirement form, support scope
#  Level 3 (score 3): DATACLAW, market scan, signal, dataset,
#    report, research pipeline
#  Level 4 (score 4): INVESTMENT, risk policy, drawdown,
#    capital preservation
#  Level 5 (score 5): HERMES, system, documentation, cleanup,
#    architecture

TASK_TITLE=""
TASK_PROMPT=""
TASK_SOURCE=""
TASK_REASON=""

# Priority keyword map: score -> pipe-separated keywords (lowercase)
P1_KEYWORDS="ai content publisher|client delivery|delivery readiness|handoff|qa|buffer|image generation|creative approval|supabase storage|image metadata|metadata db|image validation|batch upload|upload|storage|gallery|media"
P2_KEYWORDS="fastwork|service package|pricing|sales asset|requirement form|support scope"
P3_KEYWORDS="dataclaw|market scan|signal|dataset|report|research pipeline"
P4_KEYWORDS="investment|risk policy|drawdown|capital preservation"
P5_KEYWORDS="hermes|system|documentation|cleanup|architecture"

score_task() {
  local text="$1"
  text=$(echo "$text" | tr '[:upper:]' '[:lower:]')

  # Check each priority level in order (P1 first = highest priority)
  echo "$text" | grep -qE "$P1_KEYWORDS" && echo 1 && return
  echo "$text" | grep -qE "$P2_KEYWORDS" && echo 2 && return
  echo "$text" | grep -qE "$P3_KEYWORDS" && echo 3 && return
  echo "$text" | grep -qE "$P4_KEYWORDS" && echo 4 && return
  echo "$text" | grep -qE "$P5_KEYWORDS" && echo 5 && return
  echo 99
}

priority_label() {
  case "$1" in
    1) echo "P1 Cashflow (highest priority)" ;;
    2) echo "P2 FASTWORK" ;;
    3) echo "P3 DATACLAW" ;;
    4) echo "P4 INVESTMENT" ;;
    5) echo "P5 System" ;;
    *) echo "Unclassified" ;;
  esac
}

pick_best_task() {
  local tasks_file="${HEAD_OFFICE}/NEXT_GEMINI_TASKS.md"

  if [ ! -f "$tasks_file" ]; then
    echo "[$(date)] NEXT_GEMINI_TASKS.md not found — using default task."
    return 1
  fi

  # Parse ALL tasks into arrays
  local -a task_names=()
  local -a task_descs=()
  local -a task_bodies=()  # description + steps combined for scoring
  local -a task_steps_arr=()

  local in_task=0
  local cur_name=""
  local cur_desc=""
  local cur_steps=""
  local task_index=0

  while IFS= read -r line; do
    # "N. **TASK_NAME**: description"
    if [[ "$line" =~ ^[0-9]+\.\ \*\*([A-Z_]+)\*\*:(.*)$ ]]; then
      # Save previous task if exists
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
        # End of this task's bullet list
        :
      fi
    fi
  done < "$tasks_file"

  # Save last task
  if [ $in_task -eq 1 ] && [ -n "$cur_name" ]; then
    task_names[$task_index]="$cur_name"
    task_descs[$task_index]="$cur_desc"
    task_bodies[$task_index]="${cur_name} ${cur_desc} ${cur_steps}"
    task_steps_arr[$task_index]="$cur_steps"
    task_index=$((task_index + 1))
  fi

  if [ $task_index -eq 0 ]; then
    echo "[$(date)] No tasks parsed from NEXT_GEMINI_TASKS.md."
    return 1
  fi

  echo "[$(date)] Found $task_index tasks in NEXT_GEMINI_TASKS.md. Scoring..."

  # Score all tasks and pick best
  local best_idx=-1
  local best_score=999
  local best_label=""

  for ((i=0; i<task_index; i++)); do
    local name="${task_names[$i]}"
    local body="${task_bodies[$i]}"
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
    echo "[$(date)] No scored task found."
    return 1
  fi

  local name="${task_names[$best_idx]}"
  local desc="${task_descs[$best_idx]}"
  local steps="${task_steps_arr[$best_idx]}"

  desc=$(echo "$desc" | xargs)
  TASK_TITLE="$name: $desc"
  TASK_PROMPT="${TASK_TITLE}

Steps:
$(echo "$steps" | while IFS= read -r s; do [ -n "$s" ] && echo "- $s"; done)

Work inside /Users/jakarinosk/HEAD-OFFICE/.
Do not modify project application code outside the scope.
Do not build UI unless explicitly instructed.
Do not create new infrastructure.
Stop when all steps are completed and verified."
  TASK_SOURCE="NEXT_GEMINI_TASKS.md"
  TASK_REASON="Priority: $best_label (score $best_score) — matched keywords in '$name'"
  return 0
}

# ═══════════════════════════════════════════════════════════════
#  BUILD SCOPED CODEX PROMPT
# ═══════════════════════════════════════════════════════════════
#  Wraps the raw task prompt in the TODAY_AGENT_TASK_TEMPLATE.md
#  format with scope-limits.

build_task_prompt() {
  local raw_prompt="$1"
  local title="$2"
  local template="${HERMES_OS}/templates/TODAY_AGENT_TASK_TEMPLATE.md"

  echo "# Today's Agent Task — ${TODAY}

## Task
${title}

---

## Instructions

${raw_prompt}

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

This task was selected from: ${TASK_SOURCE:-"NEXT_GEMINI_TASKS.md"}
Generated by: Hermes Morning Brief Agent on ${TODAY}"
}

# ═══════════════════════════════════════════════════════════════
#  BUILD TELEGRAM BRIEF
# ═══════════════════════════════════════════════════════════════

build_telegram_brief() {
  local title="$1"
  local reason="$2"
  local cashflow_impact="$3"
  local asset_impact="$4"
  local risk_impact="$5"
  local system_impact="$6"
  local task_summary="$7"
  local phase=""

  # Extract phase from CURRENT_STATE if available
  if [ -n "$CURRENT_STATE" ]; then
    phase=$(echo "$CURRENT_STATE" | grep -i "current phase" | head -1 | sed 's/.*\*\*//;s/\*\*//;s/- //')
  fi
  [ -z "$phase" ] && phase="Activation & Integration Phase"

  echo "## 📋 Morning Brief — ${TODAY}

**Phase:** ${phase}

---

### 🎯 Recommended P1 Task

**${title}**

*Reason:* ${reason}

---

### 📊 Impact Matrix

| Dimension | Impact |
|-----------|--------|
| 💰 Cashflow | ${cashflow_impact} |
| 🏗️ Asset | ${asset_impact} |
| ⚠️ Risk | ${risk_impact} |
| 🔧 System | ${system_impact} |

---

### 📝 Task Summary

${task_summary}

*The full task prompt is pending your approval.*

---

### ✅ Approval

**Reply to this message:**

\`\`\`
APPROVE — I will execute this now
HOLD   — Not ready, keep it queued
CHANGE — Pick a different task (state preference)
\`\`\`

*This brief was generated automatically by Hermes Morning Brief Agent.*"
}

# ═══════════════════════════════════════════════════════════════
#  EXECUTE
# ═══════════════════════════════════════════════════════════════

echo "[$(date)] Picking task by priority scoring..."

if pick_best_task; then
  echo "[$(date)] Selected task: $TASK_TITLE"
  echo "[$(date)] Reason: $TASK_REASON"
  FULL_TASK_PROMPT=$(build_task_prompt "$TASK_PROMPT" "$TASK_TITLE")

  BRIEF_MSG=$(build_telegram_brief \
    "$TASK_TITLE" \
    "$TASK_REASON" \
    "HIGH" "MEDIUM" "MEDIUM" "MEDIUM" \
    "Execute the ${TASK_TITLE} task.")
else
  echo "[$(date)] No task found. Using default."

  TASK_TITLE="Validate AI Content Publisher delivery readiness"
  TASK_PROMPT="# Task: Validate AI Content Publisher delivery readiness

Your role is a Quality Assurance Agent.

Work only inside /Users/jakarinosk/HEAD-OFFICE/PROJECTS/AI Content Legal System/.

Your task is to validate the AI Content Publisher project for client delivery readiness.

1. Read the project README.md, ARCHITECTURE.md, and any STATUS or TODO files.
2. Identify any missing documentation, broken references, or incomplete sections.
3. Check that deployment instructions exist and are accurate.
4. Create a file named DELIVERY_READINESS_REPORT.md in the PROJECTS/ directory.
5. The report should include: project summary, known blockers, missing docs, go/no-go recommendation."

  FULL_TASK_PROMPT=$(build_task_prompt "$TASK_PROMPT" "$TASK_TITLE")

  BRIEF_MSG=$(build_telegram_brief \
    "$TASK_TITLE" \
    "P1 cashflow task (default — no tasks found in NEXT_GEMINI_TASKS.md)" \
    "HIGH" "MEDIUM" "MEDIUM" "MEDIUM" \
    "Validate the AI Content Publisher project for client delivery readiness. Check documentation, known issues, and deployment steps.")
fi

# ═══════════════════════════════════════════════════════════════
#  SAVE RUNTIME FILES
# ═══════════════════════════════════════════════════════════════

echo "$BRIEF_MSG" > "${RUNTIME_DIR}/latest_morning_brief.md"
echo "[$(date)] Created: ${RUNTIME_DIR}/latest_morning_brief.md"

echo "$FULL_TASK_PROMPT" > "${RUNTIME_DIR}/pending_agent_task.md"
echo "[$(date)] Created: ${RUNTIME_DIR}/pending_agent_task.md"

# ═══════════════════════════════════════════════════════════════
#  SEND TELEGRAM
# ═══════════════════════════════════════════════════════════════

if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "[$(date)] Sending Telegram report..."
  "${SCRIPT_DIR}/send_telegram_message.sh" \
    "${TELEGRAM_BOT_TOKEN}" \
    "${TELEGRAM_CHAT_ID}" \
    "${BRIEF_MSG}" && \
    echo "[$(date)] Telegram sent." || \
    echo "[$(date)] Telegram send had an issue."
else
  echo "[$(date)] Telegram skipped (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set)."
  echo ""
  echo "=== MORNING BRIEF ==="
  echo "$BRIEF_MSG"
fi

echo ""
echo "=== MORNING BRIEF COMPLETE ==="
echo "Date:        $TODAY"
echo "Task:        $TASK_TITLE"
echo "Brief:       ${RUNTIME_DIR}/latest_morning_brief.md"
echo "Pending:     ${RUNTIME_DIR}/pending_agent_task.md"
echo "NEXT:        Reply APPROVE in Telegram, then run check_telegram_approval.sh"
echo ""