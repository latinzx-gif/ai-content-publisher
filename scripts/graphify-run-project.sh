#!/bin/bash

# Graphify Run Project
# Purpose: Safely execute Graphify with comprehensive exclusions.

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GRAPHIFY RUN PROJECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check Git Status
if [[ ! -z $(git status --short | grep -v "graphify-out") ]]; then
  echo "ERROR: Working tree is dirty. Please commit or stash changes before running Graphify."
  git status --short
  exit 1
fi

# 2. Check Binary
if ! command -v graphify &> /dev/null; then
  echo "ERROR: 'graphify' command not found. Please install the Graphify tool."
  exit 1
fi

# 3. Define Exclusions
EXCLUDES="node_modules,.next,.vercel,.git,dist,build,coverage,playwright-report,graphify-out,.turbo,.cache,*.log,.env,.env.local,.env.production,.env.vercel.local,*.key,*.pem,credentials.json,service-account.json,public,reports,scripts"

# 4. Execute
echo "Generating graphify-out with exclusions..."
graphify . --exclude "$EXCLUDES"

if [[ $? -eq 0 ]]; then
  echo "SUCCESS: graphify-out generated."
  echo "Running clustering..."
  graphify cluster-only .
else
  echo "FAILURE: Graphify extraction failed."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
