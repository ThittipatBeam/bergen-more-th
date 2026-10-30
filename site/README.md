# SIAM.AI Thai RAG Benchmark — site

Public leaderboard and documentation site for the Thai RAG benchmark produced
by the tooling in this repository (`../bergen.py`, `../evaluate.py`,
`../scripts/scan_experiments.py`).

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS 4, tokens in `src/app/globals.css` (SIAM.AI "Cloudy Sky" system)
- GSAP (ScrollTrigger, `@gsap/react`) for the hero pin and page transitions
- KaTeX for the metric formulas on `/metrics`
- Fonts: Space Grotesk (display/latin) · Noto Sans Thai (Thai text) ·
  Space Mono (data and kickers), loaded via `next/font` in `src/app/layout.tsx`

## Commands

```bash
npm run dev        # dev server on :3000 (runs sync-data first)
npm run build      # production build (runs sync-data first)
npm run lint       # eslint
```

`sync-data` copies `../experiments_data.json` (the scan dump produced by
`python scripts/scan_experiments.py` in the repo root) into
`src/lib/experiments-data.json`. The committed snapshot is used as-is when the
root file is absent. The leaderboard, champion cards, and all derived numbers
in the copy are computed from that file at module scope.

## Routes

- `/` — hero + leaderboard (table on `md+`, stacked cards on phones)
- `/methodology` — corpus, pipeline, judge protocol, worked scoring example
- `/metrics` — the seven metrics, formulas, and the overall-score weights
- `/request` — submit a pipeline for evaluation (see below)
- `/about` — why the benchmark exists, resources, credits

## Request form delivery

`POST /api/request` validates server-side and delivers through the first
configured provider — set exactly one of these in the environment:

| Provider | Env vars |
|---|---|
| SMTP (Microsoft 365 / Outlook, Gmail) | `REQUEST_SMTP_HOST` + `REQUEST_SMTP_PORT` + `REQUEST_SMTP_USER` + `REQUEST_SMTP_PASS` + `REQUEST_INBOX_EMAIL`, optional `REQUEST_FROM_EMAIL` |
| Any HTTP webhook (n8n, Zapier, Power Automate, Slack, Apps Script) | `REQUEST_WEBHOOK_URL` |
| Email via Resend | `RESEND_API_KEY` + `REQUEST_INBOX_EMAIL`, optional `REQUEST_FROM_EMAIL` |
| Notion database row | `NOTION_TOKEN` + `NOTION_REQUESTS_DATABASE_ID` |

Priority is webhook → SMTP → Resend → Notion; only the first one runs.
With none configured the endpoint returns `503 not_configured` and the form
shows the honest fallback (open a GitHub issue) instead of faking success.

### Deploying the request form

1. Copy the template and fill one provider block:

   ```bash
   cp site/.env.example site/.env
   ```

2. Start the container. `docker-compose.yml` passes `site/.env` in via
   `env_file`, so the variables reach the Node server at runtime:

   ```bash
   docker compose up -d --build
   ```

3. Submit the form, or test the endpoint directly:

   ```bash
   curl -X POST https://your-domain/api/request \
     -H 'Content-Type: application/json' \
     -d '{"generatorName":"test","embeddingName":"test","contact":"me","email":"me@example.com"}'
   ```

   `{"ok":true}` means it was delivered; `502` means the provider rejected it
   and the reason is in the server log.

**Google Sheets (no SMTP, no mailbox password).** Use the webhook provider with
the ready-made Apps Script in `scripts/google-sheet-webhook.gs`:

1. Create a Google Sheet → **Extensions → Apps Script**, paste the script, save.
2. **Deploy → New deployment → Web app**; execute as **Me**, access **Anyone**.
3. Copy the `/exec` URL into `site/.env` as `REQUEST_WEBHOOK_URL`.
4. Restart the site; each submission appends one row.

The script can also require a `?token=` query parameter — set `SHARED_TOKEN`
in the script and append the same token to the URL. Apps Script quotas are
ample for a request form; the webhook has priority over email providers.

**Company Outlook / Microsoft 365.** `REQUEST_SMTP_HOST=smtp.office365.com`,
port `587`, and the mailbox credentials. SMTP AUTH is disabled by default on
new Microsoft 365 tenants; an admin enables it per mailbox:

```powershell
Set-CASMailbox -Identity benchmark@yourdomain -SmtpClientAuthenticationDisabled $false
```

If the tenant blocks SMTP AUTH entirely, use the webhook provider with a Power
Automate flow ("When an HTTP request is received" → "Send an email (V2)"),
which sends from the Outlook mailbox without SMTP.

**Resend.** `onboarding@resend.dev` only delivers to the account owner. Set
`REQUEST_FROM_EMAIL` to an address on a verified domain for production.

The endpoint needs a Node runtime — `output: "standalone"` (the Docker image)
or `next start`. Static hosting will not run it. The rate limit is in-memory
and per process, so it does not coordinate across replicas or survive restarts.

## Conventions

See `AGENTS.md` — mobile-first, 44px touch targets, ~200-line file budget,
three-tier component layout (`ui/` · `layout/` · `sections/`), thin `page.tsx`
orchestrators. The site is bilingual EN/TH (`src/lib/i18n/`, `use-language`);
the navbar itself stays English in both languages by design. Full bilingual
parity is a product requirement: Thai and English copy must carry the same
information.
