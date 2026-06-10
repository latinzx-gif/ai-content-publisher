#!/usr/bin/env bash
# Verify acp_* tables exist on remote Supabase (uses head-office-app/.env.local)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT/head-office-app/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: missing $ENV_FILE"
  exit 1
fi
# shellcheck disable=SC1090
source <(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=' "$ENV_FILE" | sed 's/^/export /' | tr -d '"')
URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
SRK="$SUPABASE_SERVICE_ROLE_KEY"
TABLES=(acp_posts acp_post_content acp_post_images acp_audit_logs)
FAIL=0
for t in "${TABLES[@]}"; do
  code=$(curl -s -o /tmp/verify_"$t".json -w "%{http_code}" \
    -H "apikey: $SRK" -H "Authorization: Bearer $SRK" \
    "$URL/rest/v1/$t?select=*&limit=0")
  if [[ "$code" == "200" ]]; then
    echo "OK  $t"
  else
    echo "FAIL $t (HTTP $code)"
    head -c 120 /tmp/verify_"$t".json 2>/dev/null; echo
    FAIL=1
  fi
done
exit $FAIL
