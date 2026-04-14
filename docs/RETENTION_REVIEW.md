# Retention Review

Date: 2026-04-02
Context: retention-focused product strategy review of the live app in `/Users/theorajan/local builds/optics-master`

## Summary

The app has strong one-time value once a user reaches the AI Cluster Planner, but weak continuity and weak product loops. The main risk is not poor computation or shallow outputs. The risk is that the product behaves like a high-quality one-shot answer engine instead of a revisitable workspace.

Current behavioral pattern:

1. Generate answer
2. Inspect result
3. Export workbook or BOM
4. Leave

Desired behavioral pattern:

1. Start a design
2. Save and evolve it
3. Compare variants
4. Carry assumptions and open validations forward
5. Revisit as the customer conversation changes

## Why users may bounce after first use

### 1. The app does not reopen where the user left off

- Navigation always starts at `Page.LEARN`.
- There is no restoration of the last active planner state or workflow tab.
- Returning users come back cold instead of resuming work.

### 2. The AI planner is buried inside a broad toolbox

- The app shell presents many tools with similar visual priority.
- The highest-value workflow for AI infrastructure work is not the default landing experience.
- This weakens activation for users who came for cluster design specifically.

### 3. The active design is not automatically preserved

- Planner state is in-memory unless the user explicitly saves a snapshot.
- Snapshots exist, but they are opt-in and hidden behind a manual save action.
- Most users will not build a habit around a tool that requires explicit persistence discipline.

### 4. The first answer is strong, but the next step is weak

- The planner gives a fast, valuable answer.
- After topology, BOM, and workbook export, the app does not strongly guide the user into an additional action.
- Exports currently end the session more often than they extend it.

### 5. Comparison is available but not naturally activated

- Compare mode depends on first saving snapshots.
- That means one of the strongest depth and retention features is secondary instead of primary.

### 6. The app explains designs, but does not accumulate project context

- Assumptions, warnings, discovery questions, and validation items are rendered well.
- But they do not behave like living project objects that users return to close out over time.

## What would improve session depth

### 1. Start users in the right workflow

- Either land directly in the AI Cluster Planner for AI users
- Or offer a role-based home screen with task-oriented entry points such as:
  - Design a 400G RoCEv2 cluster
  - Compare 2-tier vs 3-tier
  - Build BOM from a customer target

### 2. Add strong next-step prompts after the first answer

After the first result, prompt users to:

- Save this design
- Compare against a future-scale target
- Compare a rail-optimized variant
- Add the BOM to the project
- Open the topology in lab mode
- Export a customer-ready package

### 3. Promote compare mode into the main flow

- Comparison should feel native, not optional
- The product should recommend scenarios to compare instead of waiting for the user to invent them

### 4. Turn static analysis sections into action surfaces

Examples:

- warnings -> create a validation checklist
- topology -> test an alternative fabric depth
- media -> inspect alternative reach or cable families
- failure analysis -> compare stricter failure-domain posture

### 5. Make the current design feel like a real project object

- A user should feel they are editing a design package, not merely changing a transient screen state

## What would improve repeat usage

### 1. Autosave current planner state and reopen it automatically

This is the highest-leverage repeat-usage improvement.

### 2. Add a recent designs / customer projects surface

Users need a place to return to:

- customer A draft
- customer A v2
- rail-optimized option
- growth-ready option
- compute-only vs compute-plus-storage options

### 3. Persist open questions and validation status

- Assumptions and validation tasks should be tracked over time
- The app should become useful between meetings, not just during one

### 4. Treat BOM and workbook outputs as artifacts attached to a saved design

- Exports should belong to a revisitable design package
- Not just a terminal action

### 5. Center the revisit loop on design evolution

The strongest reason to return is not “run the calculator again.” It is:

- target GPU count changed
- a different spine class must be defended
- storage is now in scope
- a customer asked for stricter fault tolerance
- the export needs revision after a meeting

## Proposed retention loops

### Loop 1: Design iteration

1. User creates first design
2. App autosaves it
3. App suggests 2-3 adjacent variants
4. User compares and refines
5. User returns later to continue the same design thread

### Loop 2: Customer engagement

1. User creates a design package
2. Exports workbook and BOM
3. App stores package with timestamp and scenario name
4. User reopens after a meeting and revises assumptions
5. User regenerates package

### Loop 3: Implementation readiness

1. User moves from architecture to validation posture
2. App tracks open validation items and assumptions
3. User returns during POC or handoff to close the gaps

### Loop 4: Comparative architecture

1. User tests single-plane vs rail-optimized
2. User tests 2-tier vs 3-tier or spine-class changes
3. App preserves variants in one comparison workspace
4. User revisits the app as a decision-defense tool

### Loop 5: Tool-chain return loop

1. User jumps from planner to topology, datasheet, link budget, or BOM
2. App preserves provenance and lets the user return to the originating design
3. Cross-tool movement reinforces retention instead of acting like an exit

## Highest-leverage product changes ranked by impact vs effort

### 1. Autosave current planner state and reopen last design

- Impact: very high
- Effort: low

### 2. Add a recent designs / projects landing surface

- Impact: very high
- Effort: medium

### 3. Make compare mode first-class and recommendation-driven

- Impact: high
- Effort: medium

### 4. Add contextual next-step calls to action after the first result

- Impact: high
- Effort: low

### 5. Persist last active workflow and reopen the last working surface

- Impact: medium-high
- Effort: low

### 6. Track assumptions, warnings, and validation items as project state

- Impact: high
- Effort: medium-high

### 7. Add a role-based or task-based home screen

- Impact: medium
- Effort: medium

### 8. Attach exports and BOM state to saved designs

- Impact: medium-high
- Effort: medium

## Recommended next-session execution plan

Execute this in a follow-up session:

### Phase 1: continuity and return path

1. Add autosave for active AI planner state
2. Persist last active page and last active planner workflow tab
3. Reopen the app into the last active design context

### Phase 2: make saved work visible

1. Add a `Recent Designs` surface
2. Promote snapshots into named design packages
3. Show last modified time, GPU count, topology summary, and comparison-ready actions

### Phase 3: deepen the active session

1. Add guided next-step CTAs after the first design result
2. Make compare flows recommendation-driven
3. Add quick variant buttons:
   - future-scale compare
   - rail-optimized compare
   - storage-isolated compare
   - larger spine compare

### Phase 4: create true revisit value

1. Persist assumptions, warnings, discovery questions, and validation items with each saved design
2. Attach export history and BOM state to saved designs
3. Allow reopening a saved design into the exact workflow context

## Reminder for another session

When you open the next session, ask to execute:

`Implement the retention roadmap in docs/RETENTION_REVIEW.md starting with autosave, recent designs, and first-class compare flows.`
