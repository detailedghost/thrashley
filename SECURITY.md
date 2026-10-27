# Security Policy

Thrashley is a GitHub Action. Security fixes land on `master` and ship in the next release tag. The major tag (`v1`)
moves to that release, so a workflow that pins `@v1` gets the fix on its next run.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest `v1.x.y` release | Yes |
| Older releases | No |

## Reporting a vulnerability

Use GitHub private vulnerability reporting. Open a draft security advisory at
[the advisory form](https://github.com/detailedghost/thrashley/security/advisories/new). Do not open a public issue.

Include:

- The Thrashley version and the workflow file that uses it.
- What an attacker controls, such as the PR diff, a PR from a fork, or a file on the PR head.
- What they gain, such as a leaked token, a wrong verdict, or a command run on the runner.
- Steps to reproduce it.

You get a first answer within seven days.

## What is in scope

- A PR that makes the review step run a command, read a secret, or reach the network.
- A PR that changes the rules, policy, persona or prompt that review it.
- A token that reaches a step that does not need it.
- A posted verdict that does not match the findings and the policy.

The review logic in `dg-skills` lives in [dg-ai](https://github.com/detailedghost/dg-ai). Report a problem there to
[its advisory form](https://github.com/detailedghost/dg-ai/security/advisories/new).
