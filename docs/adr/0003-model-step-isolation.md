# 0003. The model step gets no GitHub token and no shell

Status: Accepted

## Context

A PR diff is input from the PR author. It can hold text that tries to steer the model, such as "run this command"
or "print your token". The model CLI runs on the same runner as the steps that hold secrets.

## Decision

- The review step gets only the model credential. The GitHub token reaches only the prepare and publish steps.
- The `copilot` backend runs with shell, URL and built-in MCP tools denied (`DG_PROXY_NO_SHELL=1`). It keeps file
  tools, so it can read the diff and write its findings.
- Other backends keep their shell tools, so Thrashley refuses them unless `unsafe-allow-shell` is `true`.
- The rules doc, policy, persona and prompt file are read from the PR's base commit, so a PR cannot change what
  reviews it.
- The action does not check out the PR. The model sees the diff, the context file and the rules doc only.
- Only `pull_request` is supported. PRs from forks are skipped by default.

## Consequences

- A steered model can still write bad findings. The compile step validates every finding against the diff, and the
  verdict comes from the policy, not from the model.
- Teams that want another backend accept the shell risk in writing, through the input name.
