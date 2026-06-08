#!/bin/bash

# Graphify Project Readiness Check
# Purpose: Verify git status, context files, and tool availability.

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GRAPHIFY PROJECT READINESS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Directory
echo "Directory: $(pwd)"

# 2. Git Status
echo -n "Git Status: "
if [[ -z $(git status --short) ]]; then
  echo "CLEAN"
else
  echo "DIRTY (Action Required)"
  git status --short
fi

# 3. Context Files
echo "Context Files:"
ls -la AGENTS.md .codex/skills/README.md docs/AGENT_WORKFLOW_MAP.md 2>/dev/null || echo "  MISSING critical context files"

# 4. Tool Availability
echo -n "Graphify Tool: "
if command -v graphify &> /dev/null; then
  echo "FOUND ($(command -v graphify))"
else
  echo "MISSING"
fi

echo -n "graphify-out: "
if [[ -d "graphify-out" ]]; then
  echo "EXISTS"
else
  echo "MISSING"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
