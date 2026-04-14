You are working in the Optics Master repository.

Context:
- This repo currently contains two app shapes:
  - the canonical Optics Master shell, mounted from `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/index.tsx` and rendered by `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/App.tsx`
  - a copied router-based `src/` app from AI Fabric Architecture Studio that remains in-tree as reference/staging code
- The production-local boot target for this repo is the legacy Optics Master shell, not `src/main.tsx`.
- The AI Cluster Planner inside the legacy shell has absorbed a number of newer planner concepts, but it is still not the same UI architecture as the standalone `src/features/cluster-designer` app.

How to work here:
- Start by identifying which app surface the task actually targets:
  - Optics Master runtime shell: `index.html -> index.tsx -> App.tsx`
  - copied/staging planner app: `src/`
- Do not assume the `src/` app is the live UI. The user-visible planner in Optics Master is still reached from `App.tsx` via `/components/AIClusterPlanner.tsx`.
- Preserve the modeling boundary: keep calculations in typed hooks/services/data layers, not inside React rendering code.
- Prefer small, verifiable changes over broad replacement. When possible, port good ideas from `src/` into the legacy planner rather than replacing the whole shell.
- Validate with `npm run verify` before closing substantial work.

Fastest review path for Optics Master:
1. Read `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/README.md`
2. Read `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/docs/CODEX_RUNBOOK.md`
3. Confirm boot path in `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/index.html`
4. Review `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/App.tsx`
5. If the task is planner-specific, read:
   - `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/components/AIClusterPlanner.tsx`
   - `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/hooks/useAIPlanner.ts`
   - `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/services/aiPlannerService.ts`
   - `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/services/sizerEngine.ts`
   - `/Users/theorajan/Library/Mobile Documents/com~apple~CloudDocs/6 - Design Engineering/Projects/optics-master/components/ClusterDiagram.tsx`

Planner-specific guidance:
- The legacy planner currently owns the live customer-facing AI cluster workflow.
- The copied `src/features/cluster-designer` tree is valuable reference code for:
  - dynamic hardware policy
  - storage-fabric modeling
  - rack/power posture
  - FE/BE diagram ideas
- But do not cite or modify only `src/` if the request is about the live Optics Master UI unless you are intentionally staging future work.

Definition of done:
- `npm run doctor`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`

Implementation preferences:
- Use modern TypeScript and functional React components.
- Preserve Arista-accurate terminology and assumption-driven architect language.
- Add comments only where they clarify architectural intent or non-obvious tradeoffs.

Avoid:
- Treating the repo as if the `src/` app is the live entrypoint
- Mixing presentation concerns into planner derivation code
- Turning the planner into exact procurement, exact optics validation, or deployment-ready guidance
- Assuming a UI change landed just because it exists in `src/`; check the legacy shell path first
