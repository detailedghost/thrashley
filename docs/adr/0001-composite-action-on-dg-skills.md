# 0001. Thrashley is a composite action that runs a pinned dg-skills release

Status: Accepted

## Context

GitHub Copilot code review writes its own fixed summary. Repo instructions cannot change it, and it never submits
Request changes. Teams that use the `/dg:thrash` review format want that format on every PR, with a real verdict.

The thrash review already exists in dg-ai as `dg-skills thrash`. It splits the diff, compiles findings, decides the
verdict and posts the review. It also has `dg-skills proxy`, which runs a review chunk on a model CLI.

GitHub has three kinds of actions: JavaScript, Docker and composite. A JavaScript action runs on Node, not Bun. A
Docker action is slow to start. A Bun program compiled to its own binary is about 78 MB, because it carries the Bun
runtime.

## Decision

- Thrashley is a composite action. Its steps install a pinned `dg-skills` release and run
  `dg-skills thrash action prepare`, `review` and `publish`.
- All code lives in dg-ai, including the action phases: inputs, round counting, base-commit reads and the chunk
  fan-out. This repo holds `action.yml`, one install script and the docs.
- The action installs no Bun and no second binary. It downloads the one binary it needs anyway.
- The `dg-skills` binary is downloaded from its GitHub release and checked against the release's `SHA256SUMS`.
- The repo is its own public repo, so the action can have `action.yml` at the root and a Marketplace listing.

## Consequences

- Every behavior change is made in dg-ai and reaches Thrashley through a version bump.
- A run downloads about 93 MB (dg-skills) plus the Copilot CLI, in parallel, in a few seconds.
- Each step can get its own secrets. This is the base for [ADR 0003](0003-model-step-isolation.md).
- Thrashley runs on Linux and macOS runners only, because those are the `dg-skills` builds the action installs.
