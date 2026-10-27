# 0002. A GitHub App posts the review, and its approval may count

Status: Accepted

## Context

A review from `GITHUB_TOKEN` posts as `github-actions[bot]`. It can comment and request changes. It can approve only
when the repo allows GitHub Actions to approve pull requests. Every repo that uses it shares the same bot name.

A GitHub App posts as its own bot, such as `thrashley[bot]`. Its tokens are short-lived and scoped to the repos where
it is installed. A bot user account needs a seat and a long-lived token.

## Decision

- The main setup is a GitHub App. The README gives its full steps.
- The `GITHUB_TOKEN` setup stays as a short, simpler option.
- A Thrashley approval may count as the required review. The README says how to set that up, and how to keep a
  person in the loop instead: require a code owner, and make the Thrashley job a required check.
- The Thrashley repo itself requires its owner's approval on every merge into `master`. A Thrashley approval does not
  count there.

## Consequences

- When the approval counts, a PR can merge with no person approving it. A team must choose this on purpose.
- GitHub refuses an approval from the PR's own author. Thrashley then posts a comment that still states the verdict.
