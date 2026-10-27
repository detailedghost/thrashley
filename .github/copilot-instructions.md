# GitHub Copilot Instructions

## How to review

Read `docs/code_review.md` before you review, and follow it exactly. It sets what to check, the tiers, the comment
and summary format, and the verdict. It points to `docs/CONTRIBUTING.md` and `docs/code_standards.md`, so read those
too.

Keep the review short and fair. Review only the diff, and on a later push only the new changes. Do not repeat a
thread that someone fixed, answered, or resolved. Post no Nits and at most 10 comments. Approve when no Critical or
High finding is open; Medium and Low findings never block.

Use the repo's own checks, not your own style rules:

- Lint: `actionlint` and `shellcheck scripts/*.sh`
- Test: the BLT `Does it test well?` job installs the pinned dg-skills and Copilot CLI

## What matters most here

This composite GitHub Action runs a model on untrusted PR diffs and posts reviews with a write token. Look hard at
these:

- A secret that reaches a step that does not need it. The review step gets only `COPILOT_GITHUB_TOKEN`.
- A rules, policy, persona or prompt file read from the PR head instead of the base commit.
- A third-party action not pinned to a full commit SHA.
- An input added to `action.yml` but not to the README table, or the other way around.
- An error that is swallowed, so the job passes while the review never posted.
