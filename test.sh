#!/bin/bash
set -e

REQUIRED=(
  package.json
  tsconfig.json
  app.plugin.js
  plugin/src/withShopsavvy.ts
  src/index.ts
  src/client.ts
  src/provider/ShopsavvyProvider.tsx
  src/hooks/useAsync.ts
  src/hooks/useProductSearch.ts
  src/hooks/usePriceComparison.ts
  src/hooks/usePriceHistory.ts
  src/hooks/useDeals.ts
  example/App.tsx
  README.md
  LICENSE
  .gitignore
)

echo "==> Checking required files"
for f in "${REQUIRED[@]}"; do
  [ -f "$f" ] || { echo "MISSING: $f"; exit 1; }
done
echo "  all files present"

if command -v bun >/dev/null 2>&1; then
  echo "==> bun install"
  bun install --silent
  echo "==> typecheck"
  bun run typecheck
  echo "==> build"
  bun run build
  if [ ! -f dist/index.js ] || [ ! -f dist/index.mjs ] || [ ! -f plugin/build/withShopsavvy.js ]; then
    echo "ERROR: build artifacts missing"
    exit 1
  fi
  echo "  ESM + CJS dist + plugin build present"
else
  echo "==> bun not installed; skipping build smoke test"
fi

echo "==> All checks passed"
