<img src="docs/icon-animated.svg" alt="Thrashley" width="96" />

# Thrashley

The blunt, tiered pull request reviewer for GitHub Actions.

[![BLT][badge-blt]][workflow-blt]
[![Release][badge-release-workflow]][workflow-release]
[![Latest Release][badge-release]][latest-release]

Thrashley runs the [`/dg:thrash`](https://github.com/detailedghost/dg-ai) review on every pull request (PR). It
posts inline comments that start with a tier, a summary in a fixed shape, and a real verdict: **Approve**,
**Request changes**, or **Comment**.

```text
## Code Review

> [!NOTE]
> **What changed**
>
> Adds retry logic to the sync client.

💀 0 · 🔥 1 · ⚠️ 2 · 🧹 1 · 🔬 0 · **Round:** 2, strict · **Verdict:** Request changes. 1 high finding found. · 4 line comments, 0 file comments
```

| Tier | Meaning |
| --- | --- |
| 💀 Critical | Breaks production, loses data, or opens a security hole. |
| 🔥 High | A real bug on a reachable path, or changed logic with no test. |
| ⚠️ Medium | An edge-case risk or a design smell that costs later. |
| 🧹 Low | Readability, naming, dead code, or a missing doc. |
| 🔬 Nit | Formatting or pure taste. |

## Getting Started

### Prerequisites

- A GitHub repo where you can add workflows and secrets.
- A model backend. The default is GitHub Copilot, which needs a user with a Copilot seat.
- Optional: a review rules doc (`docs/code_review.md`) and a policy file (`.github/thrashley.yml`). See
  [Add your own rules](#add-your-own-rules).

### Setup

Every setup needs the model credential. For the default Copilot backend, create a fine-grained personal access
token with the **Copilot Requests** permission, from a user with a Copilot seat. A dedicated service user keeps the
cost on one seat. Save it as the `COPILOT_GITHUB_TOKEN` secret.

> [!NOTE]
> Copilot bills requests to a user's seat, so use a token from a user. Thrashley is tested with a user token passed
> only through `COPILOT_GITHUB_TOKEN`.

Then pick a setup mode. They go from the least work to the most control.

| Mode | Posts as | Can approve | Extra setup |
| --- | --- | --- | --- |
| [1. Quick start](#mode-1-quick-start) | `github-actions[bot]` | No, approvals post as comments | None |
| [2. Advisory only](#mode-2-advisory-only) | `github-actions[bot]` | No, it never votes | One input |
| [3. Default token that approves](#mode-3-default-token-that-approves) | `github-actions[bot]` | Yes | One repo setting |
| [4. Your own bot](#mode-4-your-own-bot-github-app) | `<your-app>[bot]` | Yes | A GitHub App and two secrets |

After the mode, decide [whether a Thrashley approval counts](#make-the-approval-count-or-not) toward the required
review.

All modes use this workflow shell. Each mode below shows only the steps that change.

```yaml
name: Thrashley
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

concurrency:
  group: thrashley-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    name: Thrashley review
    if: ${{ !github.event.pull_request.draft }}
    runs-on: ubuntu-latest
    steps:
      - name: Review
        uses: detailedghost/thrashley@v1
        with:
          copilot-token: ${{ secrets.COPILOT_GITHUB_TOKEN }}
```

> [!NOTE]
> Thrashley does not need `actions/checkout`. It reads the diff, the rules doc and the policy file through the
> API, from the PR's base commit, so a PR cannot change the rules that review it.

<details>
<summary><strong>Mode 1: Quick start</strong> (easiest)</summary>

#### Mode 1: Quick start

1. Add the `COPILOT_GITHUB_TOKEN` secret.
1. Save the workflow shell above as `.github/workflows/thrashley.yml`.

The review posts as `github-actions[bot]` with the default `GITHUB_TOKEN`. GitHub does not let that token approve
a PR unless you change a setting, so an approval posts as a comment. The summary still states the verdict.

To try it with no risk, add `dry-run: true`. The job then writes the review to the step summary and posts nothing.

</details>

<details>
<summary><strong>Mode 2: Advisory only</strong></summary>

#### Mode 2: Advisory only

Use this when you want the comments and the summary, but no vote on the PR.

```yaml
      - name: Review
        uses: detailedghost/thrashley@v1
        with:
          copilot-token: ${{ secrets.COPILOT_GITHUB_TOKEN }}
          verdict: comment
```

Every review posts as a comment, and the job never fails on the verdict.

</details>

<details>
<summary><strong>Mode 3: Default token that approves</strong></summary>

#### Mode 3: Default token that approves

1. Use the workflow shell above, with no changes.
1. Go to **Settings → Actions → General → Workflow permissions** and turn on **Allow GitHub Actions to create and
   approve pull requests**. In an organization, an owner must allow it at the organization level first.

The review posts as `github-actions[bot]` and can now approve. Every workflow in the repo that uses
`GITHUB_TOKEN` can approve PRs too, so prefer Mode 4 in a shared repo.

</details>

<details>
<summary><strong>Mode 4: Your own bot (GitHub App)</strong> (recommended for teams)</summary>

#### Mode 4: Your own bot (GitHub App)

The review posts as your own bot, for example `thrashley[bot]`. Only this App can approve, and you can name it in a
ruleset.

1. Create a GitHub App in your account or organization settings, under **Developer settings → GitHub Apps**. Give it
   a name, turn off the webhook, and set these repository permissions:
   - **Pull requests:** Read and write
   - **Contents:** Read
   - **Metadata:** Read
1. Generate a private key and note the App ID.
1. Install the App on the repos that Thrashley will review.
1. Add two secrets to the repo or the organization: `THRASHLEY_APP_ID` and `THRASHLEY_APP_PRIVATE_KEY`.
1. Replace the steps in the workflow shell with these:

```yaml
    steps:
      - name: Get the app token
        id: app
        uses: actions/create-github-app-token@64ab729a6294000f5aa4a4bc0b73d1f32bc45510
        with:
          app-id: ${{ secrets.THRASHLEY_APP_ID }}
          private-key: ${{ secrets.THRASHLEY_APP_PRIVATE_KEY }}

      - name: Review
        uses: detailedghost/thrashley@v1
        with:
          github-token: ${{ steps.app.outputs.token }}
          bot-login: ${{ steps.app.outputs.app-slug }}[bot]
          copilot-token: ${{ secrets.COPILOT_GITHUB_TOKEN }}
```

`bot-login` must match the App, because rounds and open findings count only that login's reviews.

</details>

<details>
<summary><strong>Make the approval count, or not</strong></summary>

#### Make the approval count, or not

This applies to Mode 3 and Mode 4.

**It counts:** in the branch ruleset, require one approval and turn off **Require review from Code Owners**. GitHub
counts an approval from a reviewer with write access, and a GitHub App with the permissions above has it. Open a
test PR and check that the Thrashley approval meets the rule before you rely on it.

**It does not count:** keep **Require review from Code Owners**, or require an approval from a person. Then add the
`Thrashley review` job as a required status check. The job fails when the verdict is Request changes, so it still
blocks a bad PR.

> [!WARNING]
> When the approval counts, no person needs to approve a PR. Choose this only when the team agrees to it.

</details>

<details>
<summary><strong>Add your own rules</strong> (any mode)</summary>

#### Add your own rules

- `docs/code_review.md` tells the model what to check and how to word comments. Set another path with
  `review-rules`.
- `.github/thrashley.yml` sets the verdict rules, such as strict early rounds and a comment cap. See
  [Verdict and rounds](#verdict-and-rounds).
- To use another model backend, see [Swap the backend](#swap-the-backend).

</details>

## Inputs

| Input | Default | What it does |
| --- | --- | --- |
| `github-token` | `github.token` | Reads the PR and posts the review. |
| `copilot-token` | none | Copilot user token. Required for the `copilot` backend. |
| `bot-login` | `github-actions[bot]` | The login the review posts as. Rounds and open findings count only its reviews. |
| `spice` | `2` | Review depth, 1 to 5. Sets the nit budget, and the verdict when there is no policy file. |
| `review-rules` | `docs/code_review.md` | Rules doc for the model: what to check, tiers, comment wording. |
| `policy` | `.github/thrashley.yml` | Verdict rules. See [Verdict and rounds](#verdict-and-rounds). |
| `verdict` | `auto` | The highest event the review may submit: `auto`, `approve`, `request-changes` or `comment`. |
| `backend` | `copilot` | `copilot`, `codex`, `pi`, `opencode` or `grok`. See [Swap the backend](#swap-the-backend). |
| `model` | backend default | Model name for the backend. |
| `agent-file` | none | A persona file that replaces the thrash persona. |
| `prompt-file` | none | Extra instructions for every review chunk. |
| `heading` | `Code Review` | The summary heading. |
| `max-comments` | none | Most inline comments per review, highest tier first. |
| `sass` | `false` | Adds one joke line to the summary. See [Sass](#sass). |
| `dry-run` | `false` | Reviews, but posts nothing. |
| `fail-on-request-changes` | `true` | Fails the job on Request changes, so it can be a required check. |
| `review-forks` | `false` | Reviews PRs from forks. Forks get no secrets, so this rarely works. |
| `unsafe-allow-shell` | `false` | Allows a backend other than `copilot`. See [Security](#security). |
| `dg-skills-version` | pinned | The dg-skills release that runs the review. |
| `copilot-cli-version` | pinned | The Copilot CLI version. It installs in parallel with dg-skills. |

The `verdict` input never forces a result. `approve` lets the review approve but never request changes.
`request-changes` lets it block but never approve. `comment` never votes. A verdict that the input does not allow
posts as a comment, and the summary says why. Because of that, `fail-on-request-changes` never fails the job when
`verdict` is `approve` or `comment`.

## Outputs

| Output | Value |
| --- | --- |
| `verdict` | `approve`, `request_changes` or `comment` |
| `round` | This review's round number |
| `tally` | Findings per tier, as JSON |
| `review-url` | Link to the posted review |
| `skipped` | `true` when the PR was skipped, such as a PR from a fork |

## Verdict and rounds

Each Thrashley review on a PR is one round. Thrashley counts its own reviews on the PR, dismissed ones included.
Your first review is round 1.

Without a policy file, the spice table decides. Spice sets how many findings per tier a PR can have:

| Spice | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| 1 | 0 | 4 | | |
| 2 | 0 | 1 | | |
| 3 | 0 | 0 | 4 | |
| 4 | 0 | 0 | 2 | |
| 5 | 0 | 0 | 0 | 4 |

One more than the limit means Request changes. A blank cell has no limit. Nits never block.

With a policy file, the file decides. The verdict then counts only open findings: the new findings plus every
open earlier finding. A finding stays open until someone fixes it, answers it in its thread, or resolves the
thread. When no finding is open, Thrashley approves in every round, strict or relaxed. Earlier blockers that are
now fixed or answered do not hold the verdict back.

Thrashley does not post the same finding twice, and it does not post a Medium, Low or Nit finding again on a line
whose thread was resolved. A finding matches an earlier thread only on the same file, line and diff side, so a
comment on a deleted line never stands in for one on an added line.

Block only on Critical or High, with at most 10 comments and no nits:

```yaml
maxComments: 10
phases:
  - nits: false
    block: { critical: 0, high: 0 }
```

Strict for the first three rounds, then relaxed once every Critical and High is fixed or answered:

```yaml
maxComments: 10
phases:
  - name: strict
    through: 3
    block: { critical: 0, high: 0, medium: 0, low: 4 }
  - name: relaxed
    requiresClear: [critical, high]
    nits: false
    block: { critical: 0, high: 1 }
```

| Key | Meaning |
| --- | --- |
| `maxComments` | Most inline comments. The rest are listed in the summary and still count. |
| `phases[].name` | Shown in the summary after the round number. |
| `phases[].through` | The last round this phase covers. Leave it out on the last phase. |
| `phases[].requiresClear` | Tiers that must have no open earlier finding before a PR enters this phase. |
| `phases[].nits` | `false` posts no nits. |
| `phases[].block` | The count each tier may reach. One more requests changes. |

## Sass

Set `sass: true` to add exactly one line to the summary, like sudo's `insults` option:

```text
_🔥 2 High. Bold of you to ship this on a Friday._
```

The line comes from a fixed list, keyed by the verdict and the highest tier found. The model never writes it. It
is never in an inline comment, and it never changes the verdict or a tier. Every line is about the code, never a
person. Leave it off when your review rules forbid jokes.

## Swap the backend

The review runs in `dg-skills proxy`, so the design is swappable:

- `backend` and `model` pick the model CLI.
- `agent-file` replaces the reviewer persona. Start from
  [the thrash persona](https://github.com/detailedghost/dg-ai/blob/master/plugins/dg/agents/thrash.md).
- `prompt-file` adds instructions to every chunk, such as "check every SQL migration".
- `review-rules` gives the model your team's rules.

Whatever the design, the model only writes findings. Thrashley validates them against the diff and computes the
verdict itself.

For a backend other than `copilot`, set `unsafe-allow-shell: true`, and pass its credential as step `env`, such as
`OPENAI_API_KEY` for `codex`.

## Security

- The model step gets only the model credential. It never sees the token that posts the review.
- The `copilot` backend runs with shell, URL and built-in MCP tools denied. A PR that hides instructions in its diff
  cannot make it run commands or send data out.
- Other backends keep their shell tools, so they need `unsafe-allow-shell: true`. Use them only when you trust every
  PR author.
- Use the `pull_request` trigger only. Never use `pull_request_target`, which gives a PR from a fork your secrets.
- PRs from forks are skipped by default.

See [SECURITY.md](SECURITY.md) to report a problem.

## Troubleshooting

| Message | Fix |
| --- | --- |
| `GitHub Actions is not permitted to approve pull requests` | Use [Mode 3](#mode-3-default-token-that-approves) or [Mode 4](#mode-4-your-own-bot-github-app). Until then the review posts as a comment. |
| `Can not approve your own pull request` | The bot opened the PR. The review posts as a comment, and the summary states the verdict. |
| `the copilot backend needs the copilot-token input` | Add the `COPILOT_GITHUB_TOKEN` secret and pass it. |
| `backend … cannot run without shell tools` | Use `copilot`, or set `unsafe-allow-shell: true`. |
| `Thrashley skips PR … from fork` | Expected. Forks get no secrets. |

## Contributing

See [the contributing guide](docs/CONTRIBUTING.md).

## License

[MIT](LICENSE)

[badge-blt]: https://github.com/detailedghost/thrashley/actions/workflows/blt.yml/badge.svg
[badge-release]: https://img.shields.io/github/v/release/detailedghost/thrashley
[badge-release-workflow]: https://github.com/detailedghost/thrashley/actions/workflows/release.yml/badge.svg
[latest-release]: https://github.com/detailedghost/thrashley/releases/latest
[workflow-blt]: https://github.com/detailedghost/thrashley/actions/workflows/blt.yml
[workflow-release]: https://github.com/detailedghost/thrashley/actions/workflows/release.yml
