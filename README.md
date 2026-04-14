# Optics Master

Optics Master is a frontend-only React + TypeScript + Vite application for Arista SE and architect workflows. The canonical runtime is the root-level shell served via `index.html` → `index.tsx` → `App.tsx`. The standalone `src/features/cluster-designer/` tree remains in-repo as a reference and staging surface for planner ideas, not the shipped planner runtime. The `src/main.tsx` router now lands on a reference notice page rather than the standalone designer itself.

## Runtime entrypoints

The canonical runtime for this repository is:

- `index.html` → `index.tsx` → `App.tsx`
- `components/AIClusterPlanner.tsx` — the live AI Cluster Planner
- `components/`, `services/`, `features/ai-planner/`, `hooks/` — the live planner implementation

If a planner UI change does not appear in the running app, confirm the edit landed in the root-level live planner path, not only in `src/features/cluster-designer/`.

## Architecture surfaces

Read [Architecture Surfaces](./docs/ARCHITECTURE_SURFACES.md) before changing planner code. It explains:

- the live planner surface
- the reference cluster-designer surface
- planner module mapping and port status

## What the app does

The repository provides Arista-oriented optical, cabling, topology, and AI infrastructure workflows for customer-facing engineering conversations, including:

- optics and cable catalog exploration
- breakout and compatibility explainers
- BOM construction
- topology decision aids
- link budget workflow handoff
- AI cluster planning and representative topology visualization

The AI Cluster Planner is assumption-driven. It supports architecture reasoning, not exact procurement, validated physical design, or deployment-ready configuration.

## Local development

Node 22 is the supported local baseline for this repository.

```bash
nvm use
npm install
npm run dev
```

If you do not use `nvm`, ensure `node -v` reports a Node 22 release before running the app.

## Dependency health

If the dev server fails before opening a port, check the local dependency tree first.

Recommended recovery order:

```bash
rm -rf node_modules
npm ci
npm run dev
```

Use `npm install` only when `npm ci` is not viable for your local environment.

## Verification

```bash
npm run verify
```

That runs:

- `npm run doctor`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`

## Orientation path

For repo work, start here:

1. `AGENTS.md`
2. `README.md`
3. `docs/CODEX_RUNBOOK.md`
4. `docs/ARCHITECTURE_SURFACES.md`
5. `App.tsx`

For live planner work, the highest-signal files are:

- `components/AIClusterPlanner.tsx`
- `hooks/useAIPlanner.ts`
- `features/ai-planner/types.ts`
- `services/aiPlannerService.ts`
- `services/plannerBomBuilder.ts`
- `services/plannerViewHelpers.ts`
- `services/sizerEngine.ts`
- `services/mediaAdvisor.ts`

## Product boundary

Keep the planner on the correct side of the product boundary:

- directional architecture assistant
- representative topology and BOM support
- explicit assumptions, warnings, and tradeoffs

Do not let it drift into:

- exact validated optics or chassis claims without source-backed support
- procurement logic
- exact queue-policy validation
- final rack layout or deployment-ready implementation claims

Git Commands
git status
git add .
git commit -m "initial commit"
git push -u origin main