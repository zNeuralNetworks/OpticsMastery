# Learning Product Review

Date: 2026-04-02
Context: senior instructional-design review of the live app in `/Users/theorajan/local builds/optics-master`

## Summary

The app has strong educational raw material:

- credible engineering content
- useful interactive tools
- visual explainers
- strong reference surfaces

The primary weakness is not content quality. It is pedagogical structure. The product behaves more like a toolbox of excellent learning assets than a sequenced learning system.

## Top 5 learning design problems

### 1. The app is structured like a toolbox, not a curriculum

- Learning content sits beside calculators, catalogs, planners, and datasheets with similar visual weight.
- Users do not get a strong sense of where to start or what should come next.

### 2. Progression exists in labels, not in learner guidance

- Levels and phases are labeled, but prerequisites are not operationalized.
- A learner can jump directly into advanced content without enough scaffolding.

### 3. Mental-model formation is weaker than reference density

- Definitions, rules of thumb, and failure symptoms exist, but the product does not consistently guide the user from concept -> intuition -> application.

### 4. Interactive tools are weakly sequenced

- Tools are individually strong, but they are not connected into a deliberate learning arc.
- Users must infer how one tool should reinforce another.

### 5. Recall and transfer are underdesigned

- The app helps users read and explore.
- It less consistently helps them remember, diagnose, compare, and apply in novel situations.

## Why these problems matter

### 1. Weak start points increase learner drift

- New users can wander into expert surfaces before they understand core concepts.

### 2. Cognitive load rises too early

- Dense screens combine too many ideas at once.

### 3. Conceptual confidence remains fragile

- Users may recognize terminology without building durable intuition.

### 4. Tool usage does not reliably become learning

- A strong simulator or calculator is not automatically a strong teaching step.

### 5. Knowledge transfer remains incomplete

- The app teaches facts and workflows, but not always the reusable mental models behind them.

## Concrete recommendations

### 1. Create a clear learning spine

Recommended path:

1. Foundations
2. Signal and compatibility
3. Selection and validation
4. Troubleshooting
5. Architecture transfer

### 2. Make progression explicit

Every module should state:

- what you need to know first
- what this module teaches
- what to try next
- what tool this concept unlocks

### 3. Reduce per-screen concept density

- Split heavy modules into smaller steps
- Stage explanation before simulation
- Stage simulation before expert reference

### 4. Turn tool transitions into instructional transitions

- not just “open tool”
- but “use this tool to test the concept you just learned”

### 5. Add recall and transfer supports

- quick checks
- scenario prompts
- common-mistake prompts
- short takeaway cards
- job-aid style summaries

## Specific files and components that should change

Highest-priority files:

- `components/LearnSection.tsx`
- `data/knowledgeBase.ts`
- `features/learn/components/ModuleShared.tsx`
- `features/learn/modules/submodules/ConnectivityModule.tsx`
- `features/learn/modules/submodules/StrategyModule.tsx`
- `components/SmartCompatibility.tsx`
- `components/BreakoutVisualizer.tsx`
- `components/OpticsCatalog.tsx`
- `components/InteractiveDatasheet.tsx`
- `components/Sidebar.tsx`

## Proposed improved learning flow

### Phase 1: Foundations

- fiber types
- reach classes
- connector safety
- polarity

### Phase 2: Signal Logic

- NRZ vs PAM4
- FEC
- lane density
- breakout logic
- compatibility rules

### Phase 3: Selection and Validation

- part finder
- guided selection
- datasheet interpretation
- link budget

### Phase 4: Troubleshooting

- DOM/DDM
- failure symptoms
- structured debug flow

### Phase 5: Architecture Transfer

- oversubscription
- topology
- AI fabric strategy
- AI cluster planning

## Recommended execution roadmap

### Phase 1: learning-home clarity

Implement first:

1. Redesign `LearnSection.tsx` as a guided learning entry surface
2. Add:
   - start here
   - recommended sequence
   - practice tools
   - reference library
   - what each stage unlocks

### Phase 2: shared pedagogy layer

1. Upgrade `ModuleShared.tsx`
2. Add:
   - real takeaway cards
   - concept-specific failure callouts
   - “try this next” actions
   - recall prompts

### Phase 3: content-model upgrade

1. Extend `knowledgeBase.ts` with:
   - prerequisites
   - misconceptions
   - mental models
   - next actions
   - practice targets

### Phase 4: module refactor

Start with:

1. `ConnectivityModule.tsx`
2. `StrategyModule.tsx`

### Phase 5: tool framing

Improve:

1. `SmartCompatibility.tsx`
2. `BreakoutVisualizer.tsx`
3. `OpticsCatalog.tsx`
4. `InteractiveDatasheet.tsx`

## Reminder for another session

When you open the next session, ask to execute:

`Implement the learning-product roadmap in docs/LEARNING_PRODUCT_REVIEW.md starting with ModuleShared, knowledgeBase sequencing, and ConnectivityModule refactoring.`
