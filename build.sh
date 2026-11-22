#!/usr/bin/env bash
# Rebuilds assets/app.js from src/ (needs Node). Run: npm install && npm run build
set -euo pipefail
cd "$(dirname "$0")"
npx esbuild src/main.js --bundle --format=esm --minify --target=es2020 --legal-comments=none --outfile=assets/app.js
