#!/usr/bin/env bash
# Smoke-test post-deploy: verifică că 5 rute critice returnează HTTP 200.
# Usage:
#   ./scripts/smoke-test.sh                        # testează https://ideeata.ai
#   BASE_URL=http://localhost:3000 ./scripts/smoke-test.sh
set -euo pipefail

BASE_URL="${BASE_URL:-https://ideeata.ai}"
TIMEOUT=15
FAIL=0

routes=(
  "/"
  "/demo"
  "/en/demo"
  "/es/demo"
  "/dashboard"
)

echo "==> Smoke test: $BASE_URL"
echo ""

for route in "${routes[@]}"; do
  url="$BASE_URL$route"
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "$TIMEOUT" \
    -L \
    -H "User-Agent: SmokeTest/1.0" \
    "$url" 2>/dev/null || echo "000")

  if [[ "$status" -ge 200 && "$status" -lt 400 ]]; then
    echo "  ✓ $route → $status"
  else
    echo "  ✗ $route → $status  [FAIL]"
    FAIL=1
  fi
done

echo ""
if [[ "$FAIL" -eq 0 ]]; then
  echo "==> OK: toate rutele răspund corect."
  exit 0
else
  echo "==> EROARE: una sau mai multe rute au eșuat."
  exit 1
fi
