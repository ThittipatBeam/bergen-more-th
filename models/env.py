'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Loads API keys (and any other environment overrides) from a `.env` file in the
repository root, if present. Uses python-dotenv; silent no-op if not installed
or if the file doesn't exist - running with exported env vars works too.
'''

import os


def load_env_file():
    try:
        from dotenv import load_dotenv
    except ImportError:
        return False
    # variables already set in the environment take precedence (override=False)
    return bool(load_dotenv(override=False))
