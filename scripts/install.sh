#!/usr/bin/env bash
set -euo pipefail

case "$DG_SKILLS_VERSION" in
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) echo "::error::dg-skills-version must look like 1.2.3, got \"$DG_SKILLS_VERSION\""; exit 1 ;;
esac

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) asset=dg-skills-linux-x64 ;;
  Linux-aarch64) asset=dg-skills-linux-arm64 ;;
  Darwin-x86_64) asset=dg-skills-macos-x64 ;;
  Darwin-arm64) asset=dg-skills-macos-arm64 ;;
  *) echo "::error::no dg-skills build for $(uname -s)-$(uname -m); use a Linux or macOS runner"; exit 1 ;;
esac

copilot_pid=""
if [ -n "${COPILOT_CLI_VERSION:-}" ]; then
  npm install --global --ignore-scripts --no-audit --no-fund "@github/copilot@${COPILOT_CLI_VERSION}" &
  copilot_pid=$!
fi

tag="v${DG_SKILLS_VERSION}"
if [ "$(printf '%s\n' "$DG_SKILLS_VERSION" 1.22.0 | sort -V | head -n 1)" != 1.22.0 ]; then
  tag="skills-v${DG_SKILLS_VERSION}"
fi
base="https://github.com/detailedghost/dg-ai/releases/download/${tag}"
mkdir -p "$BIN_DIR"
cd "$BIN_DIR"
curl -fsSL --retry 3 --retry-delay 5 -o "$asset" "$base/$asset"
curl -fsSL --retry 3 --retry-delay 5 -o SHA256SUMS "$base/SHA256SUMS"
if ! grep -E "[ *]${asset}\$" SHA256SUMS | sha256sum --check --status; then
  echo "::error::$asset does not match the SHA256SUMS of ${tag}"
  exit 1
fi
mv "$asset" dg-skills
chmod +x dg-skills
echo "THRASHLEY_DG_SKILLS=$BIN_DIR/dg-skills" >> "$GITHUB_ENV"

if [ -n "$copilot_pid" ] && ! wait "$copilot_pid"; then
  echo "::error::npm install @github/copilot@${COPILOT_CLI_VERSION} failed"
  exit 1
fi
echo "Installed dg-skills ${DG_SKILLS_VERSION}${COPILOT_CLI_VERSION:+ and @github/copilot@${COPILOT_CLI_VERSION}}"
