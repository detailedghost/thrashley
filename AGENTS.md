# AGENTS.md — thrashley

Composite GitHub Action. Installs a pinned dg-skills release and runs `dg-skills thrash action prepare|review|publish`.
All review code lives in dg-ai (`pkg/skills-cli/src/thrash/action/`); this repo is `action.yml`, one script, docs.

## Files

| Path | Role |
|------|------|
| `action.yml` | inputs, outputs, steps; per-step secrets; fork gate |
| `scripts/install.sh` | dg-skills download + SHA256SUMS check; Copilot CLI npm install in parallel |
| `.github/thrashley.yml` | this repo's review policy |

## Commands

| Purpose | Command |
|---------|---------|
| Lint | `actionlint`, `shellcheck scripts/*.sh` |
| Test | `scripts/install.sh` with `DG_SKILLS_VERSION`, `BIN_DIR`, `GITHUB_ENV` set |

## Rules

- Canonical rules: `docs/CONTRIBUTING.md`, `docs/code_standards.md`, `docs/code_review.md`.
- Default branch `master`; owner @detailedghost approves every merge. Conventional Commits, scope required.
- Review step gets only `COPILOT_GITHUB_TOKEN`; prepare/publish get `GH_TOKEN`. Never widen.
- Behavior changes go to dg-ai first; then bump `dg-skills-version`.
- No inline comments. American English. No company or employer names anywhere.
