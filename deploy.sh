#!/usr/bin/env bash
# Hetzner deploy for Next.js standalone + PM2 (ideeata).
# Run from the app root on the server: ./deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

APP_NAME="${PM2_APP_NAME:-ideeata}"

echo "==> Installing dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Building"
npm run build

echo "==> Syncing static assets into standalone (required — prevents ChunkLoadError)"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/
rm -rf .next/standalone/public
cp -a public .next/standalone/

if [[ -f .env ]]; then
  cp -f .env .next/standalone/.env
  echo "==> Copied .env into standalone"
fi

echo "==> Restarting PM2 app: $APP_NAME"
pm2 restart "$APP_NAME"

echo "==> Deploy OK"
pm2 describe "$APP_NAME" | head -25
