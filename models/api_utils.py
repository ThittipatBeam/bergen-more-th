'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Shared helpers for API-based components (embedding APIs, reranking APIs).
Retry + cost-confirmation utilities. Intentionally free of any SDK imports:
provider-specific exceptions are detected generically so this module works
no matter which client libraries are installed.
'''

import os
import sys
import time
import random


# substrings (case-insensitive) of exception class names considered retryable
RETRYABLE_CLASS_HINTS = (
    'ratelimit', 'toomanyrequests', 'internal', 'servererror',
    'serviceunavailable', 'timeout', 'badgateway', 'temporarilyunavailable',
)
# HTTP status codes considered retryable
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
# providers use these env vars for their API keys
PROVIDER_ENV_VARS = {
    'openai_compatible': 'OPENAI_API_KEY (and OPENAI_BASE_URL or the base_url config field for custom endpoints)',
    'cohere': 'COHERE_API_KEY',
    'voyage': 'VOYAGE_API_KEY',
    'google': 'GOOGLE_API_KEY',
    'jina': 'JINA_API_KEY',
}


def _get_status_code(exception):
    """Best-effort extraction of an HTTP status code from an exception, any SDK."""
    for attr in ('status_code', 'http_status', 'status'):
        status = getattr(exception, attr, None)
        if isinstance(status, int):
            return status
    response = getattr(exception, 'response', None)
    if response is not None:
        status = getattr(response, 'status_code', None)
        if isinstance(status, int):
            return status
    return None


def _get_retry_after(exception):
    """Best-effort extraction of a Retry-After hint (seconds) from an exception."""
    response = getattr(exception, 'response', None)
    headers = getattr(response, 'headers', None) if response is not None else None
    if headers:
        retry_after = headers.get('Retry-After') or headers.get('retry-after')
        if retry_after:
            try:
                return float(retry_after)
            except (TypeError, ValueError):
                pass
    retry_after = getattr(exception, 'retry_after', None)
    if isinstance(retry_after, (int, float)):
        return float(retry_after)
    return None


def is_retryable(exception):
    """Decide whether an exception is a transient API error worth retrying.

    Works for the openai, cohere, voyageai, google-genai SDKs and plain
    `requests` HTTP errors without importing any of them.
    """
    status = _get_status_code(exception)
    if status is not None:
        return status in RETRYABLE_STATUS_CODES
    class_name = type(exception).__name__.lower()
    return any(hint in class_name for hint in RETRYABLE_CLASS_HINTS)


def call_with_retry(fn, max_retries=6, base_delay=2.0, provider='API'):
    """Call fn() with exponential backoff (with jitter) on transient API errors.

    Honors Retry-After headers when present. After `max_retries` attempts,
    raises RuntimeError naming the provider and the env var that may be
    missing.
    """
    env_hint = PROVIDER_ENV_VARS.get(provider, 'the provider API key')
    last_exception = None
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except Exception as exception:  # noqa: BLE001 - intentionally broad, filtered below
            last_exception = exception
            if not is_retryable(exception) or attempt == max_retries:
                raise RuntimeError(
                    f'{provider} API call failed after {attempt + 1} attempt(s). '
                    f'Check your network and that the API key env var {env_hint} is set correctly. '
                    f'Last error: {type(exception).__name__}: {exception}'
                ) from exception
            delay = _get_retry_after(exception)
            if delay is None:
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f'[{provider}] retryable error ({type(exception).__name__}), '
                  f'attempt {attempt + 1}/{max_retries + 1} - retrying in {delay:.1f}s',
                  file=sys.stderr)
            time.sleep(delay)
    # unreachable, but keeps static analyzers happy
    raise RuntimeError(f'{provider} API call failed: {last_exception}')


def confirm_api_cost(what, estimated_calls=None, price_note=None,
                     scale_note=None, dry_run=False, require_confirmation=True):
    """Print an API-usage banner and ask for confirmation before spending money.

    Returns True if the caller should proceed.

    - scale_note              -> replaces the default indexing-scale sentence,
                                 for operations where it does not apply (e.g. judging)
    - dry_run=True            -> print banner and raise SystemExit (no API call is made)
    - non-interactive stdin   -> auto-proceed (CI/slurm safe), prints a note
    - BERGEN_API_CONFIRM set  -> auto-proceed (any value counts as confirmation)
    - require_confirmation=False -> auto-proceed
    - otherwise               -> interactive 'Proceed? [y/N]' prompt
    """
    banner_lines = [
        '',
        '=' * 72,
        f'API usage notice: {what}',
    ]
    if estimated_calls is not None:
        banner_lines.append(f'Estimated number of API calls for this operation: ~{estimated_calls:,}')
    banner_lines.append(scale_note or (
        'This is one batch of a (possibly large) indexing/retrieval/reranking run; '
        'total calls scale with corpus size. Full-text indexes such as the Thai '
        'Wikipedia for mkqa_th.retrieve_th contain 1-2M passages.'))
    if price_note:
        banner_lines.append(price_note)
    banner_lines.append('=' * 72)
    print('\n'.join(banner_lines), file=sys.stderr)

    if dry_run:
        raise SystemExit('[dry_run=True] exiting before any API call was made.')

    if os.environ.get('BERGEN_API_CONFIRM') is not None or not require_confirmation:
        return True

    if not sys.stdin.isatty():
        print('Non-interactive session detected (no TTY): proceeding automatically. '
              'Set BERGEN_API_CONFIRM=0 or require_confirmation: false to suppress this note.',
              file=sys.stderr)
        return True

    try:
        answer = input('Proceed with API calls? [y/N] ')
    except EOFError:
        return False
    if answer.strip().lower() not in ('y', 'yes'):
        raise SystemExit('Aborted by user before any API call was made.')
    return True


def require_env(env_var, provider):
    """Return the value of an env var or fail with a precise, actionable message."""
    value = os.environ.get(env_var)
    if not value:
        raise ValueError(
            f'{provider} requires the {env_var} environment variable to be set. '
            f'Set it with: export {env_var}=<your-key>'
        )
    return value
