You are working in the Optics Master repository.

Context:
- This repo currently contains two app shapes:
  - the canonical Optics Master shell, mounted from `index.tsx` and rendered by `App.tsx`
  - a copied router-based `src/` app from AI Fabric Architecture Studio that remains in-tree as reference/staging code
- The production-local boot target for this repo is the legacy Optics Master shell, not `src/main.tsx`.
- The AI Cluster Planner inside the legacy shell has absorbed a number of newer planner concepts, but it is still not the same UI architecture as the standalone `src/features/cluster-designer` app.
- Canonical GitHub remote: `https://github.com/zNeuralNetworks/OpticsMastery.git`

How to work here:
- Start by identifying which app surface the task actually targets:
  - Optics Master runtime shell: `index.html -> index.tsx -> App.tsx`
  - copied/staging planner app: `src/`
- Do not assume the `src/` app is the live UI. The user-visible planner in Optics Master is still reached from `App.tsx` via `/components/AIClusterPlanner.tsx`.
- Preserve the modeling boundary: keep calculations in typed hooks/services/data layers, not inside React rendering code.
- Prefer small, verifiable changes over broad replacement. When possible, port good ideas from `src/` into the legacy planner rather than replacing the whole shell.
- Validate with `npm run verify` before closing substantial work.
- Before committing or pushing, check ignored tracked files with `git ls-files -ci --exclude-standard`. Keep local agent artifacts, temporary PDFs/extracts, build output, and secrets out of Git.

Fastest review path for Optics Master:
1. Use code-review-graph for broad orientation before reading source files.
2. Read `README.md` and `docs/CODEX_RUNBOOK.md`.
3. Confirm boot path in `index.html`.
4. Review `App.tsx`.
5. If the task is planner-specific, read:
   - `components/AIClusterPlanner.tsx`
   - `hooks/useAIPlanner.ts`
   - `services/aiPlannerService.ts`
   - `services/sizerEngine.ts`
   - `components/ClusterDiagram.tsx`

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

Git and repository hygiene:
- `origin` should point to `https://github.com/zNeuralNetworks/OpticsMastery.git`.
- Do not commit `.claude/`, `.codex-skill-build/`, `tmp/`, `dist/`, `.env*`, local Docker overrides, logs, or editor metadata.
- Local-only files may remain on disk; remove them from Git with `git rm --cached` rather than deleting the user's local copies.
- If documenting a push, include the commit hash, target remote, validation command, and any non-blocking warnings.

Implementation preferences:
- Use modern TypeScript and functional React components.
- Preserve Arista-accurate terminology and assumption-driven architect language.
- Add comments only where they clarify architectural intent or non-obvious tradeoffs.

Avoid:
- Treating the repo as if the `src/` app is the live entrypoint
- Mixing presentation concerns into planner derivation code
- Turning the planner into exact procurement, exact optics validation, or deployment-ready guidance
- Assuming a UI change landed just because it exists in `src/`; check the legacy shell path first

## code-review-graph workflow

Use code-review-graph before broad `rg`, `find`, or whole-file reads.
Keep graph calls small, then read only the files the graph identifies.

Available MCP tools in this repo are currently:

- `list_graph_stats_tool`: graph freshness, file/node/edge counts
- `get_architecture_overview_tool`: communities and cross-community coupling
- `get_suggested_questions_tool`: review prompts from graph structure
- `get_bridge_nodes_tool`: high-betweenness chokepoints
- `get_surprising_connections_tool`: unexpected coupling
- `generate_wiki_tool`: optional local markdown wiki
- `list_repos_tool`: registered repo inventory

CLI fallbacks for deeper analysis:

```bash
code-review-graph status --repo .
code-review-graph detect-changes --repo . --brief
code-review-graph update --repo . --skip-flows
code-review-graph build --repo .
```

Token-efficient pattern:

1. Start with graph stats plus architecture overview.
2. Use suggested questions, bridge nodes, or surprising connections only when relevant.
3. Use targeted `rg` or file reads after the graph narrows the surface.
4. After meaningful edits, run `code-review-graph update --repo . --skip-flows`; use full `build` only after broad moves/renames.
