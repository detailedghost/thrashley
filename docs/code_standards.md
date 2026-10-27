# Code Standards

Every PR follows these rules. Reviewers, people and Thrashley, check each change against them.

## Everywhere

- Run the lint and test checks in [the contributing guide](CONTRIBUTING.md) before you push.
- Add no inline code comments. Put the reason for a change in the commit message and the PR description.
- Build the smallest change that meets the requirement. Do not add code for a need that does not exist yet.
- Put review behavior in dg-ai (`dg-skills thrash action`), not in this repo. This repo wires inputs to it.
- Use American English spelling in code and docs.
- Never commit a secret, and never print one. Secrets reach the action only through inputs.

## Pinned tools

The config files are the source of truth for style. If a tool accepts the code, it is not a review finding.

| What | Version | Where it is pinned |
| --- | --- | --- |
| dg-skills | see `dg-skills-version` | `action.yml` |
| GitHub Copilot CLI | see `copilot-cli-version` | `action.yml` |
| actionlint | 1.7.12 | `.github/workflows/blt.yml` |
| shellcheck | the runner's version | `.github/workflows/blt.yml` |

| Code | Check | Fix |
| --- | --- | --- |
| Workflows | `actionlint` | by hand |
| Shell scripts | `shellcheck scripts/*.sh` | by hand |
| `action.yml` | the BLT install test | by hand |

## Naming

- Inputs and outputs use lowercase kebab-case, such as `max-comments`.
- Each input reaches dg-skills as an environment variable named `THRASHLEY_` plus the input name in upper snake
  case, such as `THRASHLEY_MAX_COMMENTS`.

## Shell (`scripts`)

- Start with `set -euo pipefail`.
- Report a failure with a `::error::` line and a non-zero exit.
- Check every download against its published checksum before it can run.

## Workflows (`.github/workflows`, `action.yml`)

- Pin every third-party action to a full commit SHA. Put the version in the step name, not a comment.
- Give each job the least `permissions` it needs.
- Pass a secret only to the step that uses it. The review step never gets the GitHub token.
- Use the `pull_request` trigger for review. Never use `pull_request_target`.
