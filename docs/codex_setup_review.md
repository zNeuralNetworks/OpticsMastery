# Codex Setup Review

Last reviewed: 2026-04-28

## Current State

- Canonical agent guidance: `AGENTS.md`
- Operating runbook: `docs/CODEX_RUNBOOK.md`
- Graph database: `.code-review-graph/graph.db` ignored by Git
- Graph status at review time: 206 files, 781 nodes, 4,971 edges
- Registered graph repo alias: `optics-master`
- MCP config: `.mcp.json` starts `uvx code-review-graph serve --repo .`

## Token-Efficient Workflow

Use code-review-graph before broad source scans:

```bash
code-review-graph status --repo .
code-review-graph detect-changes --repo . --brief
```

For normal edits, refresh incrementally:

```bash
code-review-graph update --repo . --skip-flows
```

Use a full graph rebuild only after broad moves, renames, or obvious graph drift:

```bash
code-review-graph build --repo .
```

## What Was Tightened

- `AGENTS.md` now uses repo-relative paths instead of stale absolute iCloud paths.
- `AGENTS.md` and `docs/CODEX_RUNBOOK.md` document the actual available graph MCP tools plus CLI fallbacks.
- Root agent note files were shortened to point at `AGENTS.md` and the working graph commands.
- Graph update hooks in local agent settings were narrowed from `Edit|Write|Bash` to `Edit|Write` to avoid updating the graph after read-only shell commands.
- `.mcp.json` and sibling MCP configs pass `--repo .` so graph serving is anchored to this repo.

## Verification

- `code-review-graph status --repo .`
- `code-review-graph update --repo . --skip-flows`
- `code-review-graph detect-changes --repo . --brief`
- JSON parse check for MCP/settings files
- `git ls-files -ci --exclude-standard`
- `npm run doctor`

Non-blocking environment note: `npm run doctor` warns that the active shell is Node 25.9.0 while `.nvmrc` pins 22.22.2.
