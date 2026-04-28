# Optics Master Agent Notes

Read `AGENTS.md` first. It is the canonical repo guidance for app surfaces,
validation, Git hygiene, and code-review-graph usage.

Use code-review-graph before broad source scans:

```bash
code-review-graph status --repo .
code-review-graph detect-changes --repo . --brief
code-review-graph update --repo . --skip-flows
```

Prefer graph MCP stats/architecture tools for orientation, then targeted file reads.
