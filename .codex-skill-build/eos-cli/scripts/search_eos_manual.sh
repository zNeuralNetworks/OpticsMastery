#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLED_PDF="${SCRIPT_DIR}/../references/EOS-User-Manual.pdf"
FALLBACK_PDF="/Users/theorajan/Downloads/EOS-User-Manual.pdf"
DEFAULT_PDF="${BUNDLED_PDF}"

if [[ ! -f "${DEFAULT_PDF}" ]]; then
  DEFAULT_PDF="${FALLBACK_PDF}"
fi

PDF_PATH="${EOS_CLI_MANUAL_PDF:-${DEFAULT_PDF}}"
QUERY="${1:-}"
CONTEXT="${2:-3}"

if [[ -z "${QUERY}" ]]; then
  echo "Usage: $(basename "$0") <query> [context-lines]" >&2
  exit 1
fi

if [[ ! -f "${PDF_PATH}" ]]; then
  echo "EOS manual not found at ${PDF_PATH}" >&2
  exit 2
fi

if ! command -v pdftotext >/dev/null 2>&1; then
  echo "pdftotext is required but not installed" >&2
  exit 3
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "${TMP_FILE}"' EXIT

pdftotext -nopgbrk "${PDF_PATH}" - > "${TMP_FILE}"

if ! grep -niF -C "${CONTEXT}" -- "${QUERY}" "${TMP_FILE}"; then
  echo "No matches found for: ${QUERY}" >&2
  exit 4
fi
