#!/usr/bin/env bash
# BERGEN one-shot installer.
#
# Usage:
#   ./install.sh                          # core deps + torch (auto-detects uv or pip)
#   ./install.sh --uv                     # force using 'uv pip install'
#   ./install.sh --pip                    # force using conda/python pip
#   ./install.sh --api cohere             # also install cohere client
#   ./install.sh --api cohere,voyage,google,openai
#   ./install.sh --all                    # core + all API provider clients
#
# Keeps your active python env (conda/venv) untouched other than installs.

set -euo pipefail

cd "$(dirname "$0")"

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
INSTALLER="auto"
API_PKGS=""

while [ $# -gt 0 ]; do
    case "$1" in
        --uv)
            INSTALLER="uv"
            shift
            ;;
        --pip)
            INSTALLER="pip"
            shift
            ;;
        --api=*)
            API_PKGS="$(echo "${1#--api=}" | tr ',' ' ')"
            shift
            ;;
        --api)
            shift
            if [ $# -gt 0 ]; then
                API_PKGS="$(echo "$1" | tr ',' ' ')"
                shift
            fi
            ;;
        --all)
            API_PKGS="openai cohere voyageai google-genai"
            shift
            ;;
        -h|--help)
            echo "BERGEN one-shot installer"
            echo ""
            echo "Usage:"
            echo "  ./install.sh                          # core deps + torch (auto-detects uv or pip)"
            echo "  ./install.sh --uv                     # force using 'uv pip install'"
            echo "  ./install.sh --pip                    # force using conda/python pip"
            echo "  ./install.sh --api cohere             # also install cohere client"
            echo "  ./install.sh --api cohere,voyage,...  # install multiple API clients"
            echo "  ./install.sh --all                    # core + all API provider clients"
            echo ""
            echo "Supports active Conda environments, uv environments, and standard venvs."
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            echo "Run './install.sh --help' for usage." >&2
            exit 1
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Python environment detection
# ---------------------------------------------------------------------------
PYTHON_BIN="${PYTHON:-}"
if [ -z "$PYTHON_BIN" ]; then
    if command -v python >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python)"
    elif command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python3)"
    else
        echo "Error: Python executable not found in PATH." >&2
        echo "Please activate your conda or virtual environment first." >&2
        exit 1
    fi
fi

ENV_DESC=""
if [ -n "${CONDA_DEFAULT_ENV:-}" ]; then
    ENV_DESC="conda: ${CONDA_DEFAULT_ENV}"
elif [ -n "${VIRTUAL_ENV:-}" ]; then
    ENV_DESC="venv: $(basename "$VIRTUAL_ENV")"
fi

if [ -n "$ENV_DESC" ]; then
    echo ">>> Target environment: $ENV_DESC ($PYTHON_BIN)"
else
    echo ">>> Target python: $PYTHON_BIN"
fi

# ---------------------------------------------------------------------------
# Installer resolution (uv vs pip)
# ---------------------------------------------------------------------------
if [ "$INSTALLER" = "auto" ]; then
    if command -v uv >/dev/null 2>&1; then
        INSTALLER="uv"
    else
        INSTALLER="pip"
    fi
fi

if [ "$INSTALLER" = "uv" ]; then
    if ! command -v uv >/dev/null 2>&1; then
        echo "Error: 'uv' command not found in PATH." >&2
        echo "Install uv (https://astral.sh/uv) or run with './install.sh --pip'." >&2
        exit 1
    fi
    echo ">>> Installer: uv (uv pip install)"
    run_install() {
        uv pip install --python "$PYTHON_BIN" "$@"
    }
else
    if "$PYTHON_BIN" -m pip --version >/dev/null 2>&1; then
        PIP_CMD=("$PYTHON_BIN" -m pip)
    elif command -v pip >/dev/null 2>&1; then
        PIP_CMD=(pip)
    else
        echo "Error: Neither '$PYTHON_BIN -m pip' nor 'pip' command found in PATH." >&2
        if command -v uv >/dev/null 2>&1; then
            echo "Tip: 'uv' is installed. Run './install.sh --uv' instead." >&2
        elif [ -n "${CONDA_DEFAULT_ENV:-}" ]; then
            echo "Tip: Install pip in your conda environment via 'conda install pip'." >&2
        fi
        exit 1
    fi
    echo ">>> Installer: pip (${PIP_CMD[*]})"
    run_install() {
        "${PIP_CMD[@]}" install "$@"
    }
fi

# ---------------------------------------------------------------------------
# Dependency installation
# ---------------------------------------------------------------------------
echo ">>> Installing core requirements..."
run_install -r requirements.txt

# Basic check whether torch is already installed
if "$PYTHON_BIN" -c "import torch" 2>/dev/null; then
    TORCH_VER=$("$PYTHON_BIN" -c "import torch; print(torch.__version__)")
    echo ">>> torch already installed ($TORCH_VER), skipping"
else
    echo ">>> Installing torch for your platform..."
    # macOS / Windows / CPU-linux: PyPI default wheel is correct (Metal/MPS support on macOS arm64).
    # On linux with NVIDIA you may instead want:
    #   pip:  pip install torch --index-url https://download.pytorch.org/whl/cu121
    #   uv:   uv pip install torch --index-url https://download.pytorch.org/whl/cu121
    run_install torch
fi

if [ -n "$API_PKGS" ]; then
    echo ">>> Installing API client packages: $API_PKGS"
    # shellcheck disable=SC2086
    run_install $API_PKGS
fi

echo ""
echo ">>> Done. Quick sanity check:"
"$PYTHON_BIN" -c "import torch, transformers, hydra, datasets, pythainlp; print('bergen deps OK - torch', torch.__version__)"
echo ""
echo "Next steps:"
echo "  - run unit tests:          pytest tests/api_models_test.py -v"
echo "  - dry-run a Thai pipeline: see documentation/apis.md + documentation/INSTALL.md"
