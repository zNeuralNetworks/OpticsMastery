# code-review-graph

Use `AGENTS.md` as canonical repo guidance.

Start with graph stats and architecture before broad grep/file reads. If MCP
tools are incomplete, use:

```bash
code-review-graph status --repo .
code-review-graph detect-changes --repo . --brief
code-review-graph update --repo . --skip-flows
```
