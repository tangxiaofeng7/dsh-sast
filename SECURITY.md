# Security Policy

## Reporting a vulnerability

Please report security issues privately rather than opening a public issue.
Open a [GitHub Security Advisory](https://github.com/tangxiaofeng7/dsh-sast/security/advisories/new)
on this repository, or email the maintainer listed in `package.json`
(`author`). Include:

- A description of the issue and its impact.
- Steps to reproduce (a minimal repo/config if the issue depends on scan
  input).
- The bundle version (`package.json` `version`) and DSH host version in use.

We aim to acknowledge reports within 5 business days and to ship a fix or
mitigation guidance within 30 days for confirmed issues, depending on
severity.

## Supported versions

Only the latest published `0.1.0-rc.x` release is supported. This project is
pre-1.0; there is no long-term-support branch yet.

## Trust model (read this before reporting "the audited code did X")

This plugin is a white-box **audit** tool. Understanding what it does and
does not trust is necessary to tell a real vulnerability from expected
behavior:

- **The repository being audited is untrusted input.** Its content, file
  names, comments, and any `SKILL.md`/`.dsh`/`.agents` manifests it ships
  are never treated as instructions. See ADR-14/15 in `docs/architecture.md`
  — Skill (audit-methodology) lookup always uses the decision agent's own
  trusted scope, never the cloned workspace path.
- **The repository worker/sub-agent has no shell.** `tool-bash`, `tool-pwsh`,
  and `tool-jobs` are removed from the audit preset (ADR-04); the audited
  code is never executed, built, or installed. If you find a code path that
  reintroduces shell access, execution, or dependency installation for
  audited content, that is a P0 security bug.
- **The workspace is a read-only, shallow, single-branch clone** with hooks
  disabled (`-c core.hooksPath=<empty>`) and submodules not recursed (ADR-13).
- **Credentials never touch argv, `.git/config`, or logs.** Git tokens are
  passed only via `GIT_ASKPASS` + an environment variable and redacted from
  URLs/errors before they reach storage, projections, or reports (ADR-07). A
  finding of a token leaking through any of those surfaces is a real
  vulnerability — please report it.
- **All written `path`/`codePath` values are hard-validated** against the
  actual scan workspace (ADR-03); a bypass that lets a model claim evidence
  for a path outside the workspace, or a path that was never read, is a
  security-relevant correctness bug, not just a quality issue.

If your report concerns the *audited* repository having vulnerabilities that
this tool correctly reports on, that is expected product behavior, not a
security issue in this project.
