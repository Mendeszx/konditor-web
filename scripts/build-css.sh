#!/usr/bin/env bash
# Gera o CSS do Tailwind (assets/css/tailwind.css) usando o standalone CLI —
# sem depender de Node/npm. Baixa o binário na primeira execução (.tools/ é
# ignorado pelo git).
#
#   ./scripts/build-css.sh            # build minificado (produção)
#   ./scripts/build-css.sh --watch    # rebuild automático durante o desenvolvimento
set -euo pipefail

cd "$(dirname "$0")/.."

TAILWIND_VERSION="v3.4.17"
TOOLS_DIR=".tools"
BIN="$TOOLS_DIR/tailwindcss-$TAILWIND_VERSION"

if [ ! -x "$BIN" ]; then
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  ASSET="tailwindcss-macos-arm64" ;;
    Darwin-x86_64) ASSET="tailwindcss-macos-x64" ;;
    Linux-x86_64)  ASSET="tailwindcss-linux-x64" ;;
    Linux-aarch64) ASSET="tailwindcss-linux-arm64" ;;
    *) echo "Plataforma não suportada: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
  esac
  echo "Baixando Tailwind standalone CLI $TAILWIND_VERSION ($ASSET)..."
  mkdir -p "$TOOLS_DIR"
  curl -fsSL -o "$BIN" \
    "https://github.com/tailwindlabs/tailwindcss/releases/download/$TAILWIND_VERSION/$ASSET"
  chmod +x "$BIN"
fi

if [ "${1:-}" = "--watch" ]; then
  exec "$BIN" -i assets/css/tailwind.source.css -o assets/css/tailwind.css --watch
fi

"$BIN" -i assets/css/tailwind.source.css -o assets/css/tailwind.css --minify
echo "OK: assets/css/tailwind.css gerado."
