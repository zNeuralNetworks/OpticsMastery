# Planner Reference Map

This document tracks how the standalone reference planner under `src/features/cluster-designer/` relates to the shipped AI Cluster Planner.

## Runtime rule

- live runtime: `components/AIClusterPlanner.tsx`
- reference only: `src/features/cluster-designer/`

## Port status

| Live planner surface | Reference source | Status | Note |
| --- | --- | --- | --- |
| `services/plannerPressureModels.ts` | `src/features/cluster-designer/models/trainingCommunicationModel.ts`, `src/features/cluster-designer/models/congestionModel.ts` | `ported` | Live planner owns the runtime heuristics. |
| `services/plannerArtifactService.ts` | `src/features/cluster-designer/lib/discoveryGenerator.ts`, `src/features/cluster-designer/lib/narrativeGenerator.ts`, multiple reference panels | `ported` | Narrative, discovery, and validation ideas were absorbed into the live design package flow. |
| `components/ai-planner/PlannerComparisonPanel.tsx` | `src/features/cluster-designer/engine/comparisonSupport.ts`, `src/features/cluster-designer/components/CompareSummaryPanel.tsx`, `src/features/cluster-designer/components/ChangeImpactPanel.tsx` | `ported` | Compare and change-impact now run on `PlannerModel` and planner snapshots. |
| `components/ai-planner/PlannerArchitectureCanvasPanel.tsx` | `src/features/cluster-designer/components/ArchitectureCanvas.tsx` | `partially ported` | Live planner keeps a simpler analytical canvas driven by planner data. |
| `components/ai-planner/PlannerPortConsumptionPanel.tsx` | `src/features/cluster-designer/components/PortConsumptionChart.tsx` | `partially ported` | Port-consumption review moved into the live planner using planner math. |
| `src/features/cluster-designer/data/platformProfiles.ts` | none | `rejected as runtime source` | Live planner hardware decisions must continue to use `data/hardware.ts`. |
| `src/features/cluster-designer/pages/ClusterDesignerPage.tsx` | none | `reference only` | No runtime route dependency. Keep as a staging surface only. |
| `src/router.tsx` | none | `de-routed` | The standalone `src/` app now lands on a reference notice page instead of mounting `ClusterDesignerPage`. |

## Merge rule

When reusing reference planner work:

1. Port heuristics into `services/` or `features/ai-planner/`.
2. Adapt panels to `PlannerModel` instead of importing `DesignEngineResult`.
3. Do not route users into `src/features/cluster-designer/` unless there is an explicit product decision.
