# Codex Setup & Environment Review (2026-03-14)

This review summarizes the current InfraLens repository/tooling setup as observed from the active Codex environment, plus recommended improvements.

## What I can infer about you / your workflow

- You are building a **single-page React + TypeScript platform** (InfraLens) with many route-driven internal tools for systems engineering workflows.
- You prioritize **test coverage and data integrity** (Vitest + dedicated data contract tests).
- You deploy as a **containerized static app on Cloud Run + NGINX**.
- You value maintainability through **aliases, structured datasets, and registry-driven routing**.
- You run Codex in a **proxy-mediated, CI-like environment** with MCP integrations (`browser_tools`, `make_pr`).

## Current environment snapshot

### Runtime / toolchain

- Node: `v20.19.6`
- npm: `11.4.2`
- git: `2.43.0`
- Environment indicates polyglot runtimes are preinstalled (Node, Python, Go, Rust, etc.).

### Project stack (from package metadata)

- React 19.2.x
- Vite 6.x
- Vitest 3.x
- TypeScript 5.8.x
- React Router 6.x

### Security / dependency state

- `npm audit --omit=dev` reports **0 vulnerabilities** in production dependencies.
- `npm outdated` shows several patch/minor updates, and some major version upgrades available.

### Codex/MCP setup

- Codex config includes:
  - websocket model provider endpoint
  - `make_pr` MCP server (python stdio)
  - `browser_tools` MCP server (HTTP endpoint)

## Key findings and prioritized recommendations

## 1) Fix npm proxy warning now (high priority)

`npm` emits:

- `Unknown env config "http-proxy". This will stop working in the next major version of npm.`

Recommendation:

- Replace deprecated lowercase config env usage with supported configuration in `.npmrc` (or supported envs only).
- Validate with `npm config list` and a clean `npm ci`.

Why: this is a forward-compatibility risk that can break installs when npm major version changes.

## 2) Add deterministic runtime pinning (high priority)

Recommendation:

- Add `.nvmrc` (or Volta/asdf tool versions) pinned to the current supported Node LTS for this repo.
- Add `"engines"` and `"packageManager"` to `package.json`.

Why: avoids “works on my machine” drift across local, CI, and Codex environments.

## 3) Introduce quality gates in scripts (high priority)

Current scripts are minimal (`dev`, `build`, `preview`, `test`).

Recommendation:

- Add `typecheck`, `lint`, and `test:ci` scripts.
- Consider CI command pattern:
  - `npm ci`
  - `npm run typecheck`
  - `npm run test -- --run`
  - `npm run build`

Why: catches type regressions and unsafe changes before deploy.

## 4) Upgrade policy: patch fast, majors intentionally (medium-high)

Recommendation:

- Apply patch/minor updates regularly (e.g., React patch updates).
- Schedule explicit migration tracks for major jumps:
  - React Router 6 → 7
  - Vite 6 → 8
  - Vitest 3 → 4
  - TypeScript 5.8 → 5.9

Why: balances stability and security with controlled migration cost.

## 5) Strengthen Cloud Run production posture (medium)

Recommendation:

- Ensure immutable/static caching policy for hashed assets and safe no-cache for HTML shell.
- Add/confirm security headers in `nginx.conf` (CSP, X-Content-Type-Options, Referrer-Policy).
- Track container image provenance/SBOM in CI.

Why: improves performance, security baseline, and supply-chain confidence.

## 6) Add an environment “doctor” script (medium)

Recommendation:

- Add a script (`scripts/doctor.mjs`) to validate:
  - Node/npm versions
  - lockfile presence
  - proxy configuration health
  - required environment keys

Why: shortens onboarding and reduces invisible config errors.

## 7) Codex-specific optimization opportunities (medium)

Recommendation:

- Add a repository-level `AGENTS.md` with:
  - preferred test commands
  - “definition of done” checks
  - release/PR checklist
  - coding conventions beyond TS defaults
- Add a “Codex runbook” doc under `docs/` for common agent tasks.

Why: improves agent consistency and reduces prompt overhead.

## Suggested 30-day roadmap

1. Week 1: proxy warning fix + runtime pinning.
2. Week 2: add typecheck/lint/test:ci scripts + wire into CI.
3. Week 3: dependency patch wave and lockfile refresh.
4. Week 4: Cloud Run/NGINX hardening and Codex runbook.

## Quick command checklist you can run regularly

- `node -v && npm -v`
- `npm ci`
- `npm run test -- --run`
- `npm run build`
- `npm outdated`
- `npm audit --omit=dev`

