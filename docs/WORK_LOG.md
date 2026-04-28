# Work Log

Purpose: maintain a compact running record of meaningful product, UX, content, and engineering changes so future sessions can resume quickly without reconstructing context.

Update rule:
- append new entries at the top
- keep entries short and decision-oriented
- capture what changed, why it mattered, and what remains open

Suggested next-session prompt:
- `Review docs/WORK_LOG.md first, then continue from the latest open items.`

## 2026-04-28

### Codex, Graph, and Linear Reconciliation
- Refreshed repo-local Codex guidance so agents start with code-review-graph before broad source scans.
- Updated `AGENTS.md`, `docs/CODEX_RUNBOOK.md`, and `docs/codex_setup_review.md` with repo-relative paths, current graph workflow, and CLI fallbacks.
- Added lightweight root agent notes and MCP configs that anchor code-review-graph to this repo with `--repo .`.
- Registered the code-review-graph repo alias as `optics-master`.
- Updated Linear `OpticsMastery` project state and created focused issues from repo strategy docs:
  - `TGR-115` planner autosave/reopen
  - `TGR-116` recent designs/design packages
  - `TGR-117` recommendation-driven compare flows
  - `TGR-118` guided optics education roadmap
  - `TGR-119` reference planner governance
  - `TGR-120` in-app engineering backlog reconciliation

Why it mattered:
- future Codex sessions should spend fewer tokens discovering the same live-vs-reference boundary
- Linear now reflects the actual deployed repo state and the next executable OpticsMastery work

Verification:
- `code-review-graph status --repo .`
- `code-review-graph update --repo . --skip-flows`
- `code-review-graph detect-changes --repo . --brief`
- JSON parse check for MCP/settings files
- `git ls-files -ci --exclude-standard`
- `npm run doctor`

Open follow-ups:
- decide whether to commit cross-agent local config files such as `.cursor/`, `.qoder/`, `.opencode.json`, `CLAUDE.md`, `GEMINI.md`, and `QODER.md`
- run `nvm use` before full `npm run verify` to match the Node 22 baseline

## 2026-04-14

### GitHub Sync and Repository Hygiene
- Pushed the latest local Optics Mastery app state to `https://github.com/zNeuralNetworks/OpticsMastery.git`.
- Repointed `origin` from the previous `Babia7/OpticsMastery` remote to `zNeuralNetworks/OpticsMastery`.
- Created commit `3e78620` / `3e786202bb4a86371827bf4eb20757f409d3315d` on `main`.
- Untracked local-only ignored paths while leaving local copies on disk:
  - `.claude/`
  - `.codex-skill-build/`
  - `tmp/`
- Confirmed `git ls-files -ci --exclude-standard` returns no tracked ignored files after the cleanup.
- Updated `.gitignore` and `.dockerignore` so future Git and Docker operations avoid secrets, build artifacts, temporary files, and local agent state.

Why it mattered:
- GitHub now matches the local app state for Optics Mastery and the AI Cluster Planner.
- Future pushes are less likely to leak local Codex/Claude state, temporary extracted source material, build output, or secrets.

Verification:
- `npm run verify` passed.
- Non-blocking warnings observed:
  - local shell used Node `25.9.0` while `.nvmrc` expects Node `22.22.2`
  - Vite/framer-motion emitted expected `"use client"` bundle warnings

Open follow-ups:
- Prefer `nvm use` before validation so local runs align with the Node 22 baseline.
- Keep using `git ls-files -ci --exclude-standard` before future pushes.

## 2026-04-02

### Learning Product Pass
- Reframed the app around clearer learning modes:
  - `Learn`
  - `Practice`
  - `Reference`
  - `Design`
- Upgraded the learning home in [LearnSection.tsx](/Users/theorajan/local%20builds/optics-master/components/LearnSection.tsx) from a launcher into a guided path.
- Added stronger learning metadata and note formatting in [knowledgeBase.ts](/Users/theorajan/local%20builds/optics-master/data/knowledgeBase.ts).
- Upgraded shared pedagogy components in [ModuleShared.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/components/ModuleShared.tsx) so copy notes, failure callouts, and contextual actions are instructional rather than decorative.
- Refactored these lesson modules to include lesson framing, goals, and takeaways:
  - [ConnectivityModule.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/modules/submodules/ConnectivityModule.tsx)
  - [SignalingModule.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/modules/submodules/SignalingModule.tsx)
  - [HardwareModule.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/modules/submodules/HardwareModule.tsx)
  - [OperationsModule.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/modules/submodules/OperationsModule.tsx)
- Reframed these tools as learning labs:
  - [SmartCompatibility.tsx](/Users/theorajan/local%20builds/optics-master/components/SmartCompatibility.tsx)
  - [BreakoutVisualizer.tsx](/Users/theorajan/local%20builds/optics-master/components/BreakoutVisualizer.tsx)

Why it mattered:
- the product was acting like a toolbox more than a learning system
- users now get clearer progression, lesson framing, and concept-to-tool transitions

Open follow-ups:
- add lightweight recall checks inside lessons
- improve instructional framing in [OpticsCatalog.tsx](/Users/theorajan/local%20builds/optics-master/components/OpticsCatalog.tsx)
- improve instructional framing in [InteractiveDatasheet.tsx](/Users/theorajan/local%20builds/optics-master/components/InteractiveDatasheet.tsx)
- decide whether to remove unused [LearnControls.tsx](/Users/theorajan/local%20builds/optics-master/features/learn/components/LearnControls.tsx)

### AI Cluster Planner and Export Improvements
- Added durable design-package artifacts and workflow packaging for the live AI planner.
- Added auditable workbook and CSV export coverage, including:
  - inputs
  - sizing logic / calculations
  - decision record
  - compute fabric evaluation
  - BOM / hardware packet
- Improved export readability so artifacts read like SE deliverables instead of internal tool output.
- Added topology, latency, ECMP, lossless, underlay, and failure-analysis justification to both exports and the UI.
- Added 7800R4 modular decomposition support in the BOM, including chassis, linecards, supervisors, fabric modules, cooling modules, and representative PSU treatment.
- Normalized 800G media family SKUs and removed incorrect pseudo-SKUs from planner/BOM paths.

Why it mattered:
- planner outputs are now more defensible in customer and internal design-review workflows
- exports are more traceable and useful outside the app

Open follow-ups:
- strengthen exported latency-budget explanation further if needed
- decide whether PSU placeholders should stay representative or be made exact with a stronger source

### Planner Runtime and Product Boundary Cleanup
- Restored the live AI planner as the canonical runtime instead of the separate cluster-designer surface.
- Kept `src/features/cluster-designer` as a reference pool rather than the shipped planner path.
- Added compare/review concepts into the live planner without keeping a second planner product live.

Why it mattered:
- the app had started drifting into two planner products with duplicated logic
- the runtime now matches the intended product boundary again

Open follow-ups:
- continue retiring or isolating obsolete `src/features/cluster-designer` UI code

### Copy and Positioning Cleanup
- Removed explicit “interoperability / multi-vendor compatibility” positioning from user-facing surfaces.
- Reframed the app around:
  - physical fit
  - signaling fit
  - link validation
  - deployment guidance
- Removed visible vendor references from most general UI copy so the site stays focused without stating that directly.

Key files touched:
- [constants.ts](/Users/theorajan/local%20builds/optics-master/constants.ts)
- [LearnSection.tsx](/Users/theorajan/local%20builds/optics-master/components/LearnSection.tsx)
- [SmartCompatibility.tsx](/Users/theorajan/local%20builds/optics-master/components/SmartCompatibility.tsx)
- [SmartMatrix.tsx](/Users/theorajan/local%20builds/optics-master/components/SmartMatrix.tsx)
- [OpticsFAQ.tsx](/Users/theorajan/local%20builds/optics-master/components/OpticsFAQ.tsx)
- [InteractiveDatasheet.tsx](/Users/theorajan/local%20builds/optics-master/components/InteractiveDatasheet.tsx)
- [data/knowledgeBase.ts](/Users/theorajan/local%20builds/optics-master/data/knowledgeBase.ts)
- [data/opticsFAQ.ts](/Users/theorajan/local%20builds/optics-master/data/opticsFAQ.ts)

Why it mattered:
- the product messaging is now more aligned with the intended positioning
- the site no longer overstates interoperability as a product goal

Open follow-ups:
- do a broader pass on non-core or low-traffic surfaces if more vendor-facing copy is discovered later

### Retention and Learning Review Notes
- Added [RETENTION_REVIEW.md](/Users/theorajan/local%20builds/optics-master/docs/RETENTION_REVIEW.md)
- Added [LEARNING_PRODUCT_REVIEW.md](/Users/theorajan/local%20builds/optics-master/docs/LEARNING_PRODUCT_REVIEW.md)

Why it mattered:
- these files capture the product strategy rationale and can be used as execution briefs in later sessions

## Current State

Known good:
- `npm run typecheck` passes
- `npm run build` passes
- local dev server has recently been run successfully on `127.0.0.1:5175`

Known non-blocking warnings:
- `framer-motion` `"use client"` build warnings
- large chunk warning on production build

## Next Best Work

1. Add recall checks and lightweight assessment to the lesson modules.
2. Improve instructional framing in the catalog and datasheet surfaces.
3. Clean up unused or obsolete learning-helper code.
4. Continue shrinking or archiving reference-only planner code under `src/features/cluster-designer/`.
