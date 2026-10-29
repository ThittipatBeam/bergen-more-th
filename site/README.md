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
| Any HTTP webhook (n8n, Zapier, Slack, Apps Script) | `REQUEST_WEBHOOK_URL` |
| Email via Resend | `RESEND_API_KEY` + `REQUEST_INBOX_EMAIL` |
| Notion database row | `NOTION_TOKEN` + `NOTION_REQUESTS_DATABASE_ID` |

With none configured the endpoint returns `503 not_configured` and the form
shows the honest fallback (open a GitHub issue) instead of faking success.

## Conventions

See `AGENTS.md` — mobile-first, 44px touch targets, ~200-line file budget,
three-tier component layout (`ui/` · `layout/` · `sections/`), thin `page.tsx`
orchestrators. The site is bilingual EN/TH (`src/lib/i18n/`, `use-language`);
the navbar itself stays English in both languages by design. Full bilingual
parity is a product requirement: Thai and English copy must carry the same
information.
