# Contributing to dsh-sast

Thanks for considering a contribution. This document covers the practical
workflow; see `docs/architecture.md` for the full architecture (domain
model, ADRs, milestones, and the trust boundaries this project follows).

## Development environment

- Node.js **>= 22.5** (the sqlite storage backend uses `node:sqlite`).
- **`git` must be on `PATH`** — `sast_start_scan` fails loudly rather than
  silently if it's missing.
- Clone the repo, then:

  ```bash
  npm ci --legacy-peer-deps
  npm run build      # regenerate lib/ from src/ snapshots
  npm run typecheck
  npm test
  ```

  All three must pass before you open a PR — this is exactly what
  `.github/workflows/ci.yml` runs.

## Where the code lives

- `src/dsh-sast/` — the host plugin source (tools, storage domain, ingest,
  batch control plane). Private sub-package, not published independently.
- `src/dsh-client-ui-sast/` — the Web client source (React/TSX views over
  the session projection). Also private.
- `lib/` — the **built** bundle output (`npm run build` regenerates it from
  the two source packages above). CI enforces `git diff --exit-code lib/`
  after a fresh build, so **always run `npm run build` and commit the
  result** when you touch `src/`. Never hand-edit `lib/`.
- `packages/dsh-storage-sqlite/` — a vendored third-party build (see its own
  `NOTICE`); not part of this project's own source.
- `preset/sast/` — the read-only agent preset shipped with the bundle.
- `tests/bundle.spec.ts` — asserts the shape of the published bundle itself
  (patch layer, exports, module id, tarball contents).

## Commit and PR conventions

- Conventional Commit-style subjects: `feat: ...`, `fix: ...`,
  `refactor: ...`, `docs: ...`, `test: ...`, `chore: ...`.
- One logical change per commit; tests updated in the **same** commit as the
  behavior they cover. Don't accumulate unrelated
  changes into one commit, and don't leave a commit with failing or skipped
  tests.
- Never claim a test suite passes without having actually run it. If
  something is unimplemented or unverified (see the spike-D gate in
  `docs/architecture.md` §6), say so explicitly rather than papering over it.

## Testing guidelines

Tests are organized by layer (single-repo store, batch store, scheduler,
methodology, projection, tools, ingest, reports, client, preset/bundle —
see `docs/prd.md` §5's acceptance-criteria traceability table for what each
layer must cover). When you change
behavior:

- Add or update a test in the same commit.
- Prefer testing observable behavior (`describe`/`it` named for what a user
  or the host would see) over internal implementation details.
- Client (`.tsx`) tests run under `dsh-client-test-runtime`, not jsdom — keep
  it that way; switching runners has broken existing tests before.
- Run `npm test` (all three vitest projects) before pushing, not just the
  project you touched — shared modules (e.g. the report artifact allocator)
  are used by more than one layer.

## Screenshots for UI changes

If you change anything under `src/dsh-client-ui-sast/`, attach a screenshot
of the affected tab(s) to your PR. See `docs/demo/README.md` for how to spin
up a local Web profile against a built tarball.

## Security-relevant changes

Changes touching credential handling (`ingest/credentials.ts`), path
validation (`paths.ts`), the read-only sandbox (`ingest/sandbox.ts`), or the
sub-agent tool filter (`preset/sast/agent.cordis.yml`) are security-relevant
by definition (ADR-03/04/07/13 in `docs/architecture.md`). Call this out
explicitly in your PR description, and see `SECURITY.md` for the trust model
these changes must preserve.
