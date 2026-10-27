# Code Review

Every reviewer, people and Thrashley, uses these rules. The goal is a review that blocks real problems and lets a
good PR pass in one or two rounds.

## What to check

Check every changed line against [the contributing guide](CONTRIBUTING.md) and [the code standards](code_standards.md).

- The PR follows the guide: Conventional Commit title with a scope, tests for changed logic, updated docs, and an ADR
  in `docs/adr/` when it changes an architectural decision. An accepted ADR gets a dated amendment, not a rewrite.
  An ADR uses simple English. `AGENTS.md` is dense and terse.
- The change keeps CI green. The checks are `actionlint`, `shellcheck scripts/*.sh` and the install test. Flag a
  change that fails one of them. Flag a workflow change that skips, weakens, or removes a check, or renames a job in `blt.yml`. Flag a deleted or
  skipped test.
- An input or output change updates `action.yml` and the README inputs table together.
- A step in `action.yml` gets only the secrets it needs. Flag a change that gives the review step the GitHub
  token, or that reads a rules, policy, persona or prompt file from the PR head instead of the base commit.
- An action that `action.yml` or a workflow uses is pinned to a full commit SHA.
- Do not flag style that the formatter accepts or fixes on its own.

## Scope

- Review the diff, not the whole file. Comment outside the diff only for a Critical or High problem that the diff
  causes.
- On a later push, review only what changed since your last review. Do not raise a thread again after someone fixed
  it, answered it, or resolved it. Do not add new findings on lines you already reviewed, unless they are Critical
  or High.
- Post at most 10 inline comments in one review, highest tier first. Do not post Nits.
- Flag only what you are sure of. When you are not sure, ask a question and keep it non-blocking.

## Tiers

Pick the tier from the finding alone. File count and PR size never move it.

| Tier | Assign when |
| --- | --- |
| 💀 Critical | Leaks a secret, lets a PR run code with a write token, posts a wrong verdict, or breaks every user's workflow. |
| 🔥 High | A real bug on a reachable path, a swallowed error, a CI failure, or changed logic with no test. |
| ⚠️ Medium | An edge-case risk, a design smell that costs later, a duplicated shared helper, or a broken code standard that affects behavior or security, such as an unpinned action. |
| 🧹 Low | Readability, naming, dead code, an older idiom, or a broken style or docs rule: an inline comment, a missing ADR, or missing docs. |
| 🔬 Nit | Formatting, quote style, comment wording, or pure taste. |

## Comment format

Start each inline comment with the tier emoji and the bold tier name. Then write one to three sentences that name the
problem and the fix:

```text
🔥 **High** `readBaseFile` treats a 403 as a missing file, so a token without Contents: Read skips the rules. Throw on any status but 404.
```

Use backticks for identifiers and no headings. When a claim needs code outside the diff, ask a question and cap the
tier at Medium.

## Review summary

Write the summary in this shape:

```text
## Code Review

> [!NOTE]
> **What changed:** one or two sentences on what the diff does.

> [!TIP]
> **Strengths:** one to three real strengths.

> [!WARNING]
> **Opportunities:** up to four themes, each with `file:line`.

💀 N · 🔥 N · ⚠️ N · 🧹 N · 🔬 N · **Round:** N · **Verdict:** Approve or Request changes. <reason>.
```

## Verdict

Only an open Critical or High finding means **Request changes**. Medium, Low, and Nit findings never block: the
author fixes each one or answers it in the thread. When no Critical or High finding is open, the verdict is
**Approve**, also when earlier blocking findings are now fixed or answered. State the verdict in the summary.
`.github/thrashley.yml` holds the same rule for Thrashley.

## Tone

Write for a colleague who reads this on a bad day. Be direct, specific, and professional. Critique the code, never
the author. Every comment names the fix or the question that unblocks it. Use a suggestion block for a small fix.
Use American English. This repo turns on Thrashley's `sass` line, which is the only joke in a review. It is one line
from a fixed list, about the code, never about a person.
