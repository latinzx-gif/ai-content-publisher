#!/bin/bash
# new-project.sh — สร้างโปรเจกต์ใหม่ตาม COMPANY_OS standard
# Usage: bash orchestration/scripts/new-project.sh [project-name] [app-name]

set -e

PROJECT_NAME="${1:-new-project}"
APP_NAME="${2:-app}"
BASE="$(cd "$(dirname "$0")/../.." && pwd)"   # ← detect path อัตโนมัติ
PROJECT_DIR="$BASE/PROJECTS/$PROJECT_NAME"

echo "🚀 Creating: $PROJECT_NAME"
echo "📁 Location: $PROJECT_DIR"

mkdir -p "$PROJECT_DIR/orchestration/templates"
mkdir -p "$PROJECT_DIR/docs"
mkdir -p "$PROJECT_DIR/reports/incidents"
mkdir -p "$PROJECT_DIR/reports/deployments"
mkdir -p "$PROJECT_DIR/$APP_NAME/_agent/archive"
mkdir -p "$PROJECT_DIR/.cursor/rules"

cat > "$PROJECT_DIR/GROUND_TRUTH.md" << GTEOF
# GROUND_TRUTH.md — $PROJECT_NAME

> @$BASE/COMPANY_OS.md — กฎทั้งหมดใน COMPANY_OS.md มีผลกับ project นี้ด้วย

**อ่านก่อนทุก session**

---

## 1. สิ่งที่กำลังสร้าง
[TODO: อธิบาย product + tech stack + flow หลัก]

## 2. App Structure
| Surface | Path | URL |
|---------|------|-----|
| Main app | \`$APP_NAME/src/\` | \`http://localhost:3000/\` |

## 3. Phase Status
| Phase | Status |
|-------|--------|
| Phase 1 | 🔄 IN PROGRESS |
| Phase 2+ | 🔒 LOCKED |

## 4. ห้ามสร้าง
- [TODO: Phase 2+ features]

## 5. Agent Override
ใช้ standard lineup จาก COMPANY_OS.md

## 6. Active Task
ดู: orchestration/CURRENT_TASK.md
GTEOF

cat > "$PROJECT_DIR/orchestration/REVIEW_STATUS.md" << 'RSEOF'
# REVIEW_STATUS.md

| Task ID | Task Name | Status | Approved Date | Created | Notes |
|---------|-----------|--------|---------------|---------|-------|
RSEOF

cat > "$PROJECT_DIR/orchestration/CURRENT_TASK.md" << 'CTEOF'
# CURRENT TASK — (not set)

ยังไม่มี task — บอก Cursor: "plan project" เพื่อเริ่ม
CTEOF

cat > "$PROJECT_DIR/docs/PRD.md" << 'PRDEOF'
# PRD — PROJECT_NAME_PLACEHOLDER

## Overview
[TODO]

## Problem
[TODO]

## Target Users
[TODO]

## Core Features (Phase 1)
1. 
2. 
3. 

## Out of Scope (Phase 2+)
- 

## Tech Stack
- Frontend: 
- Backend: 
- Database: 
- Deploy: 

## Success Metrics
- 
PRDEOF

sed -i '' "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/" "$PROJECT_DIR/docs/PRD.md" 2>/dev/null || \
sed -i "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/" "$PROJECT_DIR/docs/PRD.md"

cp "$BASE/.cursor/rules/company-os.mdc" "$PROJECT_DIR/.cursor/rules/"
cp "$BASE/.cursor/rules/workflow.mdc" "$PROJECT_DIR/.cursor/rules/"
cp "$BASE/orchestration/templates/GOOD_TASK_GUIDE.md" "$PROJECT_DIR/orchestration/templates/"

command -v task-master &>/dev/null && \
  (cd "$PROJECT_DIR" && task-master init 2>/dev/null && echo "✅ Taskmaster initialized") || \
  echo "⚠️  Taskmaster: install แล้วรัน task-master init ใน $PROJECT_DIR"

echo ""
echo "═══════════════════════════════════"
echo "✅ $PROJECT_NAME ready!"
echo ""
echo "Next steps:"
echo "1. เปิด $PROJECT_DIR ใน Cursor"
echo "2. กรอก docs/PRD.md"
echo "3. บอก Cowork: 'อ่าน PRD แล้วออกแบบ milestones + parse Taskmaster'"
echo "═══════════════════════════════════"
