# Contributing

## Which branch is the default?

This repo's default branch is `master`. In this guide, "the default branch" means `master`.

## How do I start a change?

Make a branch from the default branch. Never commit to the default branch directly.

This repo holds `action.yml`, one install script and the docs. The review code lives in
[dg-ai](https://github.com/detailedghost/dg-ai) as `dg-skills thrash action`, and the action installs a pinned
release of it.

Use these commands for every lint and test step. The BLT workflow runs the same checks.

| Purpose | Command |
| --- | --- |
| Lint the workflows | `actionlint` |
| Lint the scripts | `shellcheck scripts/*.sh` |
| Test the install | `DG_SKILLS_VERSION=<version> BIN_DIR=/tmp/thrashley GITHUB_ENV=/dev/null scripts/install.sh` |

A change to how a review runs, its tiers, its verdict or its summary belongs in dg-ai first. Then bump
`dg-skills-version` in `action.yml` here.

## How do I write commits?

Use Conventional Commits with a scope, like `feat(action): add the max-comments input`.

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
- Scope: lowercase kebab-case. Reuse a scope this repo already uses: `action`, `install`, `docs`, `ci`, `deps`. Add a new scope only when none fits.
- Mark a breaking change with `!` after the scope, or with a `BREAKING CHANGE:` footer. A breaking change to an
  input or an output needs a new major version.

## What must every pull request (PR) include?

1. The code change, with tests.
1. Updated docs, if anything a user or developer sees has changed. A new or changed input changes `action.yml` and
   the README inputs table together.
1. An ADR (Architecture Decision Record) at `docs/adr/NNNN-kebab-title.md` if the PR introduces or changes an
   architectural decision. It says what we decided and why. Add a row for it to `docs/adr/README.md`.

Routine docs, bug fixes, and maintenance do not need an ADR unless they change an architectural decision. To change an
accepted ADR, add a dated amendment. Do not rewrite it.

Write each ADR in simple English: short sentences, common words, and active voice, for a reader who is new to the
project. `AGENTS.md` is for AI agents. Write it dense and terse, to keep agent context small.

## How do I write the PR description?

Answer three questions in plain American English:

- **What does this change do?**
- **Why do we need it?**
- **How can someone test it?**

Then link any docs or ADR included with the PR. Pretend the reader is smart but new to the project.

Merges to `master` are squash merges, so the PR title becomes the commit subject. Write the title as a Conventional
Commit.

## When can I merge?

A PR merges only when all of these are true:

- These CI checks are green: `Does it lint?` and `Does it test well?` (the BLT jobs).
- The repo owner, @detailedghost, approved. `.github/CODEOWNERS` lists the owner, and the `master protection`
  ruleset requires a code owner's approval. A Thrashley approval does not count here.
- Thrashley reviewed the latest push, and someone fixed or answered every open Critical or High finding.
- Someone fixed or answered every review comment and resolved its thread.

Thrashley reviews its own PRs with the action from the PR's base branch. Only Critical and High review findings
block a merge; see [the code review rules](code_review.md).

## How does it get to users?

Users pin a tag, such as `detailedghost/thrashley@v1`.

1. A maintainer pushes a semver tag, such as `v1.2.0`, on the default branch.
1. The **Release** workflow runs BLT again, creates a GitHub release with generated notes, and moves the major tag
   (`v1`) to the new commit.
1. Every workflow that pins `@v1` gets the new release on its next run.

## How do I undo a release?

Move the major tag back to the last good release, and mark the bad release as a pre-release:

```sh
git tag -f v1 v1.1.0
git push -f origin v1
gh release edit v1.2.0 --prerelease
```

Then fix the problem in a PR and release a new patch version.

## Code Standards

Follow [the code standards](code_standards.md). Run the lint and test commands before you push. Reviewers check
each change against that file and this guide, using [the code review rules](code_review.md).

## What if I am stuck?

Open an issue, or ask on the PR. Do not turn off a check to get past it.
