# Codex Runbook

This runbook defines the fastest reliable operating pattern for Codex in Optics Master.

## First rule: confirm the live app surface

This repository contains both:

- the live Optics Master shell
- a reference planner surface in `src/features/cluster-designer/`

Current runtime note:

- `Page.AI_PLANNER` routes to `components/AIClusterPlanner.tsx`
- `src/features/cluster-designer/` is reference-only unless a future explicit routing change says otherwise
- `src/main.tsx` and `src/router.tsx` now open a reference notice page, not the standalone designer runtime

Before reviewing or changing anything, confirm which one the user is actually looking at.

For the live app, verify:

- `index.html` loads `/index.tsx`
- `index.tsx` mounts `App.tsx`

Use [Architecture Surfaces](./ARCHITECTURE_SURFACES.md) for the authoritative live-vs-reference module map.

## Supported local environment

Use Node 22 locally.

```bash
nvm use
npm run doctor
```

If the app fails before binding a port, treat dependency health as the first suspect:

```bash
rm -rf node_modules
npm ci
npm run dev
```

## Primary commands

- `npm run doctor`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`
- `npm run verify`

## GitHub sync and hygiene

Canonical remote:

```bash
git remote -v
# origin  https://github.com/zNeuralNetworks/OpticsMastery.git
```

Before committing or pushing:

```bash
git status --short --branch
git ls-files -ci --exclude-standard
```

Expected result for ignored tracked files is no output. If ignored local-only files are tracked, untrack them without deleting local copies:

```bash
git rm --cached -r .claude .codex-skill-build tmp
```

Do not push:

- `.claude/`
- `.codex-skill-build/`
- `tmp/`
- `.env*`
- `dist/`, `build/`, coverage, logs, or editor metadata

Latest known GitHub sync:

- Date: 2026-04-14
- Remote: `https://github.com/zNeuralNetworks/OpticsMastery.git`
- Branch: `main`
- Commit: `3e786202bb4a86371827bf4eb20757f409d3315d`
- Verification: `npm run verify` passed with non-blocking Node-version and framer-motion/Vite warnings

## Default review workflow

1. Read `AGENTS.md`
2. Check graph freshness with `code-review-graph status --repo .` or the graph MCP stats tool
3. Use graph architecture overview before broad source scans
4. Read `README.md` and `docs/ARCHITECTURE_SURFACES.md`
5. Confirm the entrypoint in `index.html`
6. Review `App.tsx` to understand the live navigation surface
7. Only then branch into the relevant feature files

## Token-efficient graph workflow

Use the graph for orientation and impact, then read exact source lines only after the target surface is clear.

Recommended first calls:

- `list_graph_stats_tool` for freshness and scale
- `get_architecture_overview_tool` for communities and coupling
- `get_suggested_questions_tool` when doing a review
- `get_bridge_nodes_tool` or `get_surprising_connections_tool` when a change touches shared behavior

CLI fallbacks:

```bash
code-review-graph status --repo .
code-review-graph detect-changes --repo . --brief
code-review-graph update --repo . --skip-flows
```

Use a full rebuild only after broad file moves, renames, or graph drift:

```bash
code-review-graph build --repo .
```

## Fast planner review workflow

If the request is about the live AI Cluster Planner, review in this order:

1. `components/AIClusterPlanner.tsx`
2. `hooks/useAIPlanner.ts`
3. `features/ai-planner/types.ts`
4. `services/aiPlannerService.ts`
5. `services/plannerBomBuilder.ts`
6. `services/plannerViewHelpers.ts`
7. `services/sizerEngine.ts`
8. `services/mediaAdvisor.ts`
9. `components/ai-planner/PlannerWorkflowWorkspace.tsx`
10. `components/ai-planner/PlannerDesignPackagePanel.tsx`

Do not start with `src/features/cluster-designer/` if the question is about the live planner UI.

## Review heuristics that save time

### Boot-path bugs

If the user says the full app no longer renders:

- inspect `index.html`
- inspect `index.tsx`
- inspect `App.tsx`

### “I don’t see the UI change”

Usually one of:

- the change only landed in `src/`
- the change landed in reference planner code but not the live planner path
- the dev server is stale or the dependency tree is broken

### Planner correctness bugs

Highest-signal live files:

- `services/aiPlannerService.ts`
- `services/plannerBomBuilder.ts`
- `services/plannerViewHelpers.ts`
- `services/sizerEngine.ts`
- `services/mediaAdvisor.ts`
- `hooks/useAIPlanner.ts`

## Architecture boundaries

Keep the app on the correct product boundary:

- directional Ethernet AI fabric guidance
- representative topology and BOM support
- explicit assumptions and caveats

Do not drift into:

- exact validated optics or queue-policy claims without source-backed support
- procurement or quoting logic
- exact physical rack or cabling validation

## Validation expectations

Before handing off substantial work, run:

```bash
npm run verify
```

If the task changed the live runtime path or a visible UX flow, also smoke-check:

```bash
npm run dev
```

## Current repo-specific note

The hybrid repo shape is intentional:

- live shell: root-level Optics Master app
- reference planner: `src/features/cluster-designer/`

Every substantial review or code change should state which surface was inspected and which surface was modified.
