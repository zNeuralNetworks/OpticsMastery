# Architecture Surfaces

Optics Master intentionally contains two planner code surfaces.

## Live app surface

This is the product users actually run from the repo root entrypoints:

- `index.html`
- `index.tsx`
- `App.tsx`
- `components/`
- `context/`
- `data/`
- `features/`
- `hooks/`
- `services/`
- `types.ts`

Use this surface for customer-visible changes, BOM behavior, planner navigation, and any feature the running Optics Master shell must expose.

## Reference planner surface

This lives under `src/features/cluster-designer/`.

It is a staging and reference implementation for newer AI fabric planner ideas, richer models, and alternate UX patterns. It is not the canonical runtime for this repository.

## One-way reuse rule

Use the reference surface as an idea pool.

- `src/` may inspire live planner changes
- live planner changes must be intentionally ported
- do not assume a change in `src/` appears in the running shell
- do not merge the two surfaces without an explicit repo decision

## Module mapping for planner work

When changing the live planner, start here:

- `hooks/useAIPlanner.ts`: live planner state and snapshot workflow
- `services/aiPlannerService.ts`: planner orchestration
- `services/plannerBomBuilder.ts`: hardware and cabling packet assembly
- `services/plannerViewHelpers.ts`: warning, assumption, and visual summary formatting
- `services/planner*`: specialized AI fabric reasoning modules
- `features/ai-planner/types.ts`: stable planner type barrel

Reference equivalents live under `src/features/cluster-designer/`:

- `lib/designEngine.ts`: reference orchestration
- `models/`: reference heuristics
- `components/`: reference panels and summaries
- `data/`: reference defaults and profiles

Current status:

- `Page.AI_PLANNER` renders the live planner in `components/AIClusterPlanner.tsx`
- `src/features/cluster-designer/` is not on the runtime route
- `src/main.tsx` now lands on a reference notice page instead of mounting `ClusterDesignerPage`
- reference modules must be ported intentionally into live planner services or panels before they affect users

See [Planner Reference Map](./PLANNER_REFERENCE_MAP.md) for the current one-way merge status.

## Naming guidance

Use these conventions to reduce drift:

- `components/`, `hooks/`, `services/`, `features/ai-planner/`: live app only
- `src/features/cluster-designer/`: reference only
- shared logic should only be extracted when both surfaces truly benefit and the ownership is explicit
