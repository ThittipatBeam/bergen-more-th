#!/usr/bin/env bash
# BERGEN one-shot installer.
#
# Usage:
#   ./install.sh                          # core deps + torch for your platform
#   ./install.sh --api cohere            # also install cohere client
#   ./install.sh --api cohere,voyage,google,openai
#   ./install.sh --all                   # core + all API provider clients
#
# Keeps your active python env (conda/venv) untouched other than pip installs.

set -euo pipefail

cd "$(dirname "$0")"

echo ">>> Installing core requirements..."
pip install -r requirements.txt

# basic check whether torch is already installed
if python -c "import torch" 2>/dev/null; then
    TORCH_VER=$(python -c "import torch; print(torch.__version__)")
    echo ">>> torch already installed ($TORCH_VER), skipping"
else
    echo ">>> Installing torch for your platform..."
    # macOS / Windows / CPU-linux: PyPI default wheel is correct (Metal/MPS support on macOS arm64).
    # On linux with NVIDIA you may instead want:
    #   pip install torch --index-url https://download.pytorch.org/whl/cu121
    pip install torch
fi

API_PKGS=""
for arg in "$@"; do
    case "$arg" in
        --api=*)   API_PKGS="$(echo "${arg#--api=}" | tr ',' ' ')";;
        --api)     shift; API_PKGS="$(echo "${1:-}" | tr ',' ' ')";;
        --all)     API_PKGS="openai cohere voyageai google-genai";;
    esac
done

if [ -n "$API_PKGS" ]; then
    echo ">>> Installing API client packages: $API_PKGS"
    # shellcheck disable=SC2086
    pip install $API_PKGS
fi

echo ""
echo ">>> Done. Quick sanity check:"
python -c "import torch, transformers, hydra, datasets, pythainlp; print('bergen deps OK - torch', torch.__version__)"
echo ""
echo "Next steps:"
echo "  - run unit tests:          pytest tests/api_models_test.py -v"
echo "  - dry-run a Thai pipeline: see documentation/apis.md + documentation/INSTALL.md"
