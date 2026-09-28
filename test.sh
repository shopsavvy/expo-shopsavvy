#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== expo-shopsavvy tests ==="

echo "==> bun install"
bun install

echo "==> typecheck"
bun run typecheck

echo "==> build"
bun run build
for f in dist/index.js dist/index.mjs dist/index.d.ts dist/index.d.mts plugin/build/withShopsavvy.js; do
  [ -f "$f" ] || { echo "ERROR: build artifact missing: $f"; exit 1; }
done

echo "==> bun test (hooks + config plugin via Expo introspection)"
bun test

echo "==> All checks passed"
