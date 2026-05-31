#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f package.json ]]; then
  echo "package.json not found. Run this script from the repository root." >&2
  exit 1
fi

if [[ -f package-lock.json ]]; then
  npm ci
elif [[ -f yarn.lock ]]; then
  corepack enable
  yarn install --frozen-lockfile
else
  npm install
fi

if ! node -e "require.resolve('@react-native-community/cli/package.json')" >/dev/null 2>&1; then
  npm install --no-save --no-package-lock @react-native-community/cli@latest
fi

mkdir -p android/app/src/main/assets
mkdir -p android/app/src/main/res

npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

chmod +x android/gradlew
(
  cd android
  ./gradlew clean --no-daemon
  ./gradlew assembleRelease --no-daemon
)

APK_PATH="$(find android/app/build/outputs/apk/release -type f -name '*.apk' | sort | tail -n 1)"
if [[ -z "$APK_PATH" ]]; then
  echo "Release APK was not produced." >&2
  exit 1
fi

echo "Release APK: $APK_PATH"
