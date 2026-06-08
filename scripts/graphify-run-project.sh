#!/bin/bash

# Graphify Run Project
# Purpose: Safely execute Graphify with correct exclusions.

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GRAPHIFY RUN PROJECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check Git Status
if [[ ! -z $(git status --short) ]]; then
  echo "ERROR: Working tree is dirty. Please commit or stash changes before running Graphify."
  exit 1
fi

# 2. Check Binary
if ! command -v graphify &> /dev/null; then
  echo "ERROR: 'graphify' command not found. Please install the Graphify tool."
  exit 1
fi

# 3. Execute
echo "Generating graphify-out..."
graphify . --exclude node_modules,.next,.git,supabase/.temp,public,reports,scripts

if [[ $? -eq 0 ]]; then
  echo "SUCCESS: graphify-out generated."
else
  echo "FAILURE: Graphify execution failed."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
