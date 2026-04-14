---
name: eos-cli
description: Provide production-correct Arista EOS CLI guidance, configuration examples, syntax validation, troubleshooting commands, and explanation of EOS-specific behavior. Use when requests involve Arista EOS commands or configs for switching, routing, MLAG, VARP, VLANs, trunks, port-channels, EVPN, CloudVision-related EOS workflows, CV-CUE operational context where EOS CLI is relevant, NDR, or MSS with an EOS command component. Do not use for Cisco, NX-OS, Junos, Aruba, or vendor-neutral syntax unless the user explicitly asks for a comparison.
---

# EOS CLI

Use Arista terminology and EOS-native syntax. Prefer documentation-backed answers, especially when exact command form, command mode, feature behavior, or release sensitivity matters.

## Workflow

1. Confirm the request is EOS-specific. If it is vendor-neutral or another platform, do not force EOS syntax.
2. If exact syntax matters, read [references/eos-manual.md](references/eos-manual.md) and search the manual before answering.
3. Give the smallest correct answer first: config, verification, and caveats.
4. Call out uncertainty instead of inventing unsupported syntax.

## Reference-first behavior

- Use [references/eos-manual.md](references/eos-manual.md) when:
  - the user asks to validate syntax
  - the command might vary by EOS release
  - the request involves less-common CLI or operational behavior
  - you suspect there is more than a small chance the exact command form is wrong
- Use [scripts/search_eos_manual.sh](scripts/search_eos_manual.sh) to grep the local manual text quickly before answering.
- Treat the provided EOS User Guide as the primary source when it covers the requested feature.

## Rules

1. Prefer production-correct Arista EOS syntax.
2. Never substitute Cisco-style syntax for EOS syntax.
3. State version sensitivity when behavior may differ across EOS releases.
4. Include verification commands with every config answer.
5. Prefer operationally useful outputs: exact commands, expected checks, likely failure domains, rollback notes when relevant.
6. Use concise explanations unless the user asks for depth.
7. If exact syntax is still uncertain after checking references, say so explicitly and give the most likely EOS approach.

## Output patterns

### Configuration request

- Goal
- EOS configuration
- Verification commands
- Notes / caveats

### Troubleshooting request

- What to check first
- Relevant show commands
- Likely causes
- Corrective action

### Syntax validation request

- Proposed corrected EOS syntax
- Why the original form is wrong or risky
- Verification command or mode check
- Version note if applicable

## Style and correctness guardrails

- Use realistic enterprise examples: `interface Ethernet3`, `interface Port-Channel10`, `vlan 120`, `router bgp 65001`.
- Avoid placeholder syntax that looks vendor-neutral or Cisco-derived.
- Prefer `show` and targeted `show running-config section ...` checks over vague verification guidance.
- When design tradeoffs matter, mention operational impact briefly: convergence, failure domain, config consistency, day-2 visibility, or CloudVision implications.
- Do not over-explain basic networking theory unless the user asks.

## Resources

- [references/eos-manual.md](references/eos-manual.md): source priority, bundled-manual location, and search guidance.
- `references/EOS-User-Manual.pdf`: bundled EOS User Guide for offline/manual-backed syntax checks.
- [scripts/search_eos_manual.sh](scripts/search_eos_manual.sh): quick context grep against the bundled EOS User Guide PDF, with local-path fallback.

## Example triggers

- "Give me EOS config for an MLAG port-channel to dual-attached servers."
- "Validate this Arista trunk config and fix any Cisco-style syntax."
- "What should I run on EOS to troubleshoot a VLAN not forwarding over a port-channel?"
- "Show me the EOS commands to verify VARP on a pair of leafs."
