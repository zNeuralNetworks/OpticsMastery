# EOS manual reference

Use this file when exact EOS syntax, command mode, or feature behavior matters.

## Source priority

1. Bundled PDF in this skill: `references/EOS-User-Manual.pdf`
2. Local PDF fallback: `/Users/theorajan/Downloads/EOS-User-Manual.pdf`
3. Web fallback: `https://www.arista.com/assets/data/pdf/user-manual/EOS-User-Manual.pdf`

The attached local manual currently identifies itself as:

- Title: `EOS USER GUIDE`
- Version: `4.35.2F`
- Document ID: `DOC-03495-44`

## Fast search workflow

Run:

```bash
scripts/search_eos_manual.sh "configure session"
scripts/search_eos_manual.sh "mlag"
scripts/search_eos_manual.sh "show reload cause" 2
```

The script searches the bundled PDF by default when present. Override the PDF path with:

```bash
EOS_CLI_MANUAL_PDF=/path/to/EOS-User-Manual.pdf scripts/search_eos_manual.sh "varp"
```

## What to verify from the manual

- Exact command spelling
- Command mode and hierarchy
- Release-sensitive behavior
- Show command names and available subcommands
- Operational caveats called out by the manual

## Answering guidance

- Prefer the manual over memory when there is any syntax ambiguity.
- If the manual does not clearly resolve the question, say that and provide the most likely EOS approach.
- If the user asks for config, pair it with verification commands and short operational caveats.
