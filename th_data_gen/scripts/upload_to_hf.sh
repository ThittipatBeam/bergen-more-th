#!/bin/bash
# Upload Thai QA dataset to Hugging Face
#
# Usage:
#   ./th_data_gen/scripts/upload_to_hf.sh                          # prompts for HF_TOKEN if not set
#   HF_TOKEN=hf_xxx ./th_data_gen/scripts/upload_to_hf.sh          # uses env var directly
#

set -e  # exit on error

# Check if HF_TOKEN is set; if not, prompt for it
if [ -z "$HF_TOKEN" ]; then
    echo "HF_TOKEN not set. Please enter your Hugging Face token:"
    read -s HF_TOKEN
fi
export HF_TOKEN

REPO_ID="siamaids/thai-wiki-qa-v1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR

echo "Uploading dataset to $REPO_ID..."

python3 << 'EOF'
import os
from pathlib import Path
from huggingface_hub import upload_folder, upload_file

REPO_ID = "siamaids/thai-wiki-qa-v1"
SCRIPT_DIR = Path(os.environ["SCRIPT_DIR"])
REPO_ROOT = SCRIPT_DIR.parent.parent

# Pass HF_TOKEN explicitly (env set by shell wrapper)
token = os.environ["HF_TOKEN"]

# 1. Upload dataset directory (parquet + dataset_info.json)
print("[1/2] Uploading dataset directory...")
upload_folder(
    folder_path=REPO_ROOT / "th_data_gen/output/final/thai_qa_v1_dataset",
    path_in_repo="",
    repo_id=REPO_ID,
    repo_type="dataset",
    token=token,
)
print("   ✓ Dataset files uploaded")

# 2. Upload README/data card
print("[2/2] Uploading README...")
upload_file(
    path_or_fileobj=REPO_ROOT / "th_data_gen/output/final/README.md",
    path_in_repo="README.md",
    repo_id=REPO_ID,
    repo_type="dataset",
    token=token,
)
print("   ✓ README uploaded")

print(f"\nDataset uploaded to https://huggingface.co/datasets/{REPO_ID}")
EOF

echo "Done."
