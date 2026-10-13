#!/usr/bin/env bash
# Singura comandă de deploy pe Hetzner.
# Usage: cd ~/IdeeaTa.ai && ./update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

APP_NAME="${PM2_APP_NAME:-ideeata}"

echo "==> Backup .env before sync"
if [[ -f .env ]]; then
  cp -f .env /tmp/.env.backup
  echo "    .env backed up to /tmp/.env.backup"
fi

echo "==> Sync to origin/main (discard local server edits)"
git fetch origin
git checkout main
git reset --hard origin/main

# Restaurăm .env dacă git l-a șters (fișier gitignored, dar copiat accidental în tree)
if [[ -f /tmp/.env.backup && ! -f .env ]]; then
  cp -f /tmp/.env.backup .env
  echo "==> .env restored from backup"
fi

echo "==> Installing dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Building"
npm run build

echo "==> Syncing static assets into standalone"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/
rm -rf .next/standalone/public
cp -a public .next/standalone/

if [[ -f .env ]]; then
  cp -f .env .next/standalone/.env
  echo "==> Copied .env into standalone"
fi

echo "==> Restarting PM2: $APP_NAME"
pm2 restart "$APP_NAME"

echo "==> OK — $(git rev-parse --short HEAD) on main"
pm2 describe "$APP_NAME" | head -25
