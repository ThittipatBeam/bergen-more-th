---
name: "Thai RAG Leaderboard"
description: "The Thai RAG leaderboard — which Thai RAG system reads best, judge-first, on a warm paper score table."
colors:
  paper: "#F7F3EA"
  paper-deep: "#EFE8D8"
  ink: "#1B1710"
  ink-soft: "#4A4335"
  ink-faint: "#6A6248"
  leader-vermilion: "#B83618"
  vermilion-deep: "#93290F"
  hairline: "rgba(27,23,16,.16)"
  hairline-strong: "rgba(27,23,16,.4)"
  band-fill: "#FDFBF4"
  slot-fill: "#ECE5D3"
  code-ground: "#211C14"
  code-ink: "#EDE6D2"
  code-comment: "#9A8F77"
  code-command: "#F0B429"
  code-accent: "#E86A4A"
typography:
  display:
    fontFamily: "IBMPlexSansThaiLooped, IBM Plex Sans Thai Looped, IBMPlexSansThai, IBMPlexSans, sans-serif"
    fontSize: "clamp(1.9rem,4.6vw,3.3rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "IBMPlexSansThaiLooped, IBM Plex Sans Thai Looped, IBMPlexSansThai, IBMPlexSans, sans-serif"
    fontSize: "clamp(1.5rem,3vw,2rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "IBMPlexSansThaiLooped, IBM Plex Sans Thai Looped, IBMPlexSansThai, IBMPlexSans, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBMPlexSansThai, IBM Plex Sans Thai, IBMPlexSans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBMPlexMono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    letterSpacing: "0.14em"
  micro:
    fontFamily: "IBMPlexMono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 500
    letterSpacing: "0.04em"
  caption:
    fontFamily: "IBMPlexMono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "0.02em"
  note:
    fontFamily: "IBMPlexSansThai, IBM Plex Sans Thai, IBMPlexSans, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "IBMPlexMono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1.15rem"
    fontWeight: 600
    letterSpacing: "normal"
  cell:
    fontFamily: "IBMPlexMono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    letterSpacing: "normal"
rounded:
  card: "3px"
  mark: "2px"
  icon: "4px"
  track: "6px"
spacing:
  sheet-gutter: "clamp(1rem,4vw,3rem)"
  section-top: "clamp(3.2rem,6.5vw,4.6rem)"
  section-bottom: "clamp(2.2rem,5vw,3.4rem)"
  intro-top: "clamp(2rem,5vw,3.6rem)"
  cell-pad: "0.85rem 0.9rem"
  frame-max: "1180px"
components:
  score-table:
    backgroundColor: "{colors.band-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  table-head:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.card}"
  row-leader:
    backgroundColor: "{colors.band-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  row-slot:
    backgroundColor: "{colors.slot-fill}"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.card}"
  lang:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.card}"
    padding: "0.5rem 1rem"
  lang-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "0.5rem 1rem"
---

# Design System: Thai RAG Leaderboard

## Overview

**Creative North Star: "The Tone-Level Stave" (ระดับเสียง)**

Thai script stacks its marks on four vertical levels — consonant body, vowel above, vowel below, tone mark on top — and that stack is this system's identity. It survives as the **stave**: four dashed tier rules named for the script levels ride above the leaderboard like ruled staff lines, and the measured sheet beneath them is paper ruled in ink. Above the stave the system is calm and legible; the score is carried by a readable LMArena-style **score table**, not by staggered geometry, because a reader comparing systems reads down a column, not across a stagger.

The leaderboard's truth lives in the table: one judge-first column (the LLM-as-judge score, big, vermilion on the leader) flanked by the Thai string metrics, every numeral in tabular Plex Mono, each non-headline column ruled by a thin inline score bar so the leader's margin is glanceable. The leader row is lifted by a vermilion wash and a filled LEADER tape-flag; unmeasured slots stay dashed and empty. A brand icon (lobehub) anchors each model name so systems are recognized at a glance.

The material is a warm paper sheet ruled in thin ink: a cream field, 1–1.5px ink rules, and one vermilion reserved for the leader and the judge's voice. Type is IBM Plex Sans Thai throughout — Looped for display, unlooped for body, Plex Mono for every label and numeral, tabular so scores align down columns. State is a mark, not a hue: pending = dashed flag, unmeasured = em-dash slot, leader = tape-flag, sort key = tinted column — never a recolored band alone.

**Key Characteristics:**
- Judge-first table: one readable score table; the judged column leads and shows partial-vs-full score beside it.
- Tone-level stave: four named script-level rules frame the sheet — the Thai identity without sacrificing scannability.
- Warm paper ruled in ink: cream field, graphite ink, hairline rules, one vermilion voice.
- Thai-first type: Looped Thai display, unlooped body, tabular Mono for every number.
- State is a mark, not a hue; brand icons (lobehub) identify each model at a glance.

## Colors

The palette is a paper-and-ink duet with a single vermilion voice: warm cream grounds, near-black graphite ink, and Leader Vermilion held to under a tenth of any screen.

### Primary
- **Leader Vermilion** (#B83618): the judge's voice and the leader's mark only — the leader row's wash and rank numeral, the LEADER tape-flag, the judge score in the leader row, focus outlines, text selection, nav hover underlines, and the judge-partial flag's border. Its rarity is the point; it never paints a background fill larger than the leader row's wash.

### Secondary
- **Vermilion Deep** (#93290F): the darkened second string of the vermilion — used where vermilion needs body-text weight against paper: judge-flag copy, worked-example verdicts, the judge-flag border. Set by the contrast fix, not by the original #C23B1C direction value.

### Neutral
- **Warm Paper** (#F7F3EA): the field every surface sits on; the stave stripe and tier rules are drawn into it, not onto a white card.
- **Paper Deep** (#EFE8D8): recessed paper — scrollbar track, equation blocks, the footer's shelf.
- **Graphite Ink** (#1B1710): body text, every 1.5px structural rule (masthead, section tops, the stave baseline, the table edge and header baseline).
- **Ink Soft** (#4A4335): secondary copy — ledes, column prose, cell keys, pipeline strings.
- **Ink Faint** (#6A6248): tertiary annotations — ranks, axis numerals, meta labels, footer small print. Never used for body-sized information.
- **Hairline** (rgba(27,23,16,.16)) and **Hairline Strong** (rgba(27,23,16,.4)): ink at 16% and 40% — cell separators, dashed tier rules, sort-button strokes, equation border. Hairlines are ink let down with paper, never gray.
- **Band Fill** (#FDFBF4): the scored slip — a fraction lighter than paper so a measured band reads as paper laid on paper.
- **Slot Fill** (#ECE5D3): the reserved-slot ground, always paired with a dashed border and faint type; honest absence has its own paper.

### Named Rules
**The One Voice Rule.** Vermilion speaks for exactly two things — the leader and the judge — and covers under ~10% of any viewport. If a third meaning needs emphasis, it gets a mark (flag, dash, tape), never a share of the vermilion.

**The Ink-Led-Down Rule.** Every neutral between paper and ink is the same #1B1710 ink at lowered alpha (.16, .4) or a named soft/faint step — no cool grays, no blue-grays. Gray on this sheet is ink that has been rinsed in paper.

## Typography

**Display Font:** IBM Plex Sans Thai Looped (600/700, falling back to unlooped Thai)
**Body Font:** IBM Plex Sans Thai (400/500/600/700, falling back to IBM Plex Sans and system sans)
**Label/Mono Font:** IBM Plex Mono (400/500, `font-variant-numeric: tabular-nums` on every score)

**Character:** A Thai-first pairing where the script does the display work. Looped Thai carries the wordmark, headlines, and system names with tight negative tracking; unlooped Thai carries long bilingual reading at a calm 1.6; Plex Mono is the voice of everything measured — labels, ranks, scores, commands — always small, always letterspaced, always uppercase in English.

### Hierarchy
- **Display** (600, clamp(1.9rem,4.6vw,3.3rem), 1.12, -0.02em): the page thesis ("Which Thai RAG system reads best?") and the masthead wordmark ("Thai RAG Leaderboard" — the clear name; ระดับเสียง survives only as the system's internal North-Star nickname, not the site title).
- **Headline** (600, clamp(1.5rem,3vw,2rem), -0.015em): section heads — The Judge, Metrics, Reproduce — each paired with a small mono English caption in faint ink.
- **Title** (700, 1.05rem, -0.01em): system names in the model cell; unmeasured slots use faint ink. Sub-heads in columns at 600/1.05rem.
- **Body** (400, 16px, 1.6): ledes (clamped to 1.13rem, max 62ch) and column prose (0.98rem); `<strong>` lifts to 600 ink for the measured claims.
- **Label** (500, 0.66–0.74rem, +0.04–0.14em, uppercase in English): every annotation — EN subtitles, table headers, cell captions, sort arrows, footer heads. Thai never takes the label treatment.
- **Data** (600, 1.15rem leader judge score / 1.0rem full score, 0.95rem other numerals, tabular-nums): the judged column leads; vermilion on the leader only.

### Named Rules
**The Numbers-Speak-Mono Rule.** Anything measured — a score, a rank, a count, a command, a metric id — is set in tabular IBM Plex Mono. Prose never carries a numeral the reader must compare.

**The Thai-Leads Rule.** Display and body voices default to the Thai faces; Latin falls through the same stacks. Technical terms (API, metric names, model ids) stay English inside bilingual copy, but the script of record is Thai.

## Layout

The sheet is a single centered column at 1180px max (`--sheet-max`) with fluid side gutters (`clamp(1rem,4vw,3rem)`); its vertical rhythm comes from a small set of clamp() steps, not a numeric spacing scale. Sections breathe at `clamp(3.2rem,6.5vw,4.6rem)` top and `clamp(2.2rem,5vw,3.4rem)` bottom, separated by 1.5px ink rules; the intro runs tighter (`clamp(2rem,5vw,3.6rem)` / `clamp(1.4rem,3vw,2.2rem)`). Inside sections, two-column grids collapse via `repeat(auto-fit,minmax(min(300px,100%),1fr))` with 2.2rem gaps.

The measured sheet is a table, not a banded list. A three-line **tone-level stave** frames it from above — four dashed tier rules (tone mark / vowel above / consonant / vowel below) drawn as hairlines with mono labels right-aligned, closed by a 1.5px ink baseline — then the **score table**: a bordered slip (`border-collapse: collapse`, 1.5px ink edge, 3px radius) whose header row sits on Paper Deep. Columns read `# · Model · Judge · M_th · F1_th · Precision_th · Recall_th`; the model column is left-aligned, all numerics right-aligned (`text-align: right`). Each cell pads `0.85rem 0.9rem`; rows separate on hairlines and hover to Paper Deep. The leader row carries a vermilion wash across the first 30% and a LEADER tape-flag; slots render dashed with em-dashes where numbers belong.

Two responsive reflexes honor reading over gesture: the table keeps its column structure as width shrinks, and below 560px the cells flow tighter and long model names ellipsis rather than wrap the row. The sort lives in the column headers (click to toggle ↑/↓, `aria-sort` on the active key); there is no separate sort bar — the header is the control.

## Elevation & Depth

Depth is flat at rest. The measured sheet is paper reading down into ruled rows; the table slip is defined by its ink border and header ground, not by shadow. Rows separate on hairlines and acknowledge hover with a Paper Deep tint, not a lift. The sheet never layers raised panels: separation comes from ink rules, fill against paper, and text weight.

### Shadow Vocabulary
- **None at rest.** No card on this surface casts a permanent shadow. The only motion is the toggle/language-switch state and row hover tint — the system is intentionally shadow-quiet so the ruled paper reads flat and calm.
- **Focus** uses the vermilion `:focus-visible` outline (2px, offset 3px) rather than a glow.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Separation comes from ink rules and fill, never from permanent drop shadows. A card that looks like it needs elevation is asking for a 1.5px ink rule instead.

**The Motion Rule.** State transitions run 0.12–0.18s on one shallow ease (row hover tint, icon/flag opacity, sort arrow). Nothing bounces, nothing springs, nothing exceeds 0.2s — the sheet is paper, paper doesn't animate.

## Shapes

Corners are nearly square with a 3px radius on paper surfaces (the score table, worked-example cards, code blocks, equations, the language switch), 4px on small media tiles (brand-icon tiles), and 2px on tiny marks (tape-flags, sort-arrow, judge flags). There are no pills; even buttons are rectangles with the same 3px soften. Strokes are the dominant shape language: 1.5px ink for structure (rules, borders, the stave baseline, the table edge, header baseline), 1px dashed hairline for the stave's tier rules and reserved slots, 1px hairline for row separators, 2px vermilion for quoted evidence and judge flags. Brand-icon tiles are small squares (1.7rem) with a 1px hairline border holding a real lobehub SVG — a recognition mark, not a generic model glyph. The stave is the only silhouette the page owns: four short dashed rules pulled right, each labeled with a script level.

## Components

### Score Table (the measured sheet)
The signature component: a bordered slip of paper holding ranked systems.
- **Shape:** `border-collapse: collapse`, 1.5px ink border, 3px radius, Band Fill (#FDFBF4) on Warm Paper.
- **Header row:** Paper Deep ground, 1.5px ink baseline, mono uppercase labels (0.72rem, +0.04em); each numeric header is a sort button (`aria-sort` on the active key, the ↓/↑ arrow in vermilion).
- **Body rows:** separated by 1px hairlines, hover to Paper Deep; numerics right-aligned in tabular mono at 0.95–1.0rem; each non-headline metric cell carries a thin inline bar (3px, Slot track, ink fill scaled to the column max) under the numeral so the leader's margin reads at a glance.

### Leader Row
- **Style:** a vermilion wash (`linear-gradient(to right, rgba(184,54,24,.05), band-fill 30%)`) across the row; the rank numeral in vermilion 600.
- **Judge cell:** the partial score at 1.15rem vermilion 600, with the full-run headline beside it as a faint `full-run` readout — partial and complete numbers are never merged.
- **Mark:** a filled vermilion tape-flag (LEADER / อันดับ 1) with a notched SVG tail sits in the model cell beside the name.

### Model Cell
- **Style:** rank numeral (faint mono, 2.8rem column) · a brand-icon tile (lobehub SVG, 1.7rem square, 1px hairline border, 4px radius, icon at 1.15rem) · the system name in Looped Thai 700 at 1.05rem. Slots use a dashed empty tile and a faint 500 name.
- The icon is the recognition shortcut; the name is the truth. Never a generic model glyph standing in for a real brand mark.

### Reserved Slot (unmeasured row)
- **Style:** faint text throughout, em-dashes in every numeric cell, a dashed empty icon tile. Visually present but reads as honest absence — never a projected score.

### Language Toggle (EN ⇄ ไทย)
- **Style:** a single 1.5px ink-outlined lozenge split into two mono buttons; the active segment fills ink with paper text, the quiet segment hovers to Paper Deep. It sits in the masthead and swaps full bilingual parity — Thai is never a collapsed summary.

### Worked Example Card
- **Style:** Band Fill with the standard 1.5px ink border and 3px radius; padded 1.1rem 1.2rem.
- **Interior:** mono uppercase captions (question / system answer), blockquotes edged with a 2px vermilion rule, and the judge's verdict in Vermilion Deep mono led by ▸ — evidence quoted, verdict spoken in the judge's voice.

### Code Block
- **Style:** the one dark object on the sheet: deep ink ground (#211C14 — the ink, deepened) with warm paper ink (#EDE6D2) text, mono at 0.78rem/1.7, 3px radius. Comments are rinsed ink (#9A8F77), commands amber (#F0B429), model accents softened vermilion (#E86A4A). Dark-mode logic without a dark mode: the terminal stays a terminal.

## Do's and Don'ts

### Do:
- **Do** state status as a mark — dashed/dashed-empty for pending or unmeasured, tape-flag for leader, tinted column for the sort key — never as a hue alone.
- **Do** set every measured numeral in tabular IBM Plex Mono with `font-variant-numeric: tabular-nums` so scores align down the columns.
- **Do** keep the judge column first and largest; show the partial score big with the full-run headline beside it, never blended into one number.
- **Do** use a real lobehub brand SVG in each model-icon tile — recognition, not a generic model placeholder.
- **Do** keep vermilion to the leader row, the judge's voice (flag, verdict, selection, focus), and the sorted key's arrow; wash it across the leader row only at 5% fading by 30%.
- **Do** pair English labels with Thai body: mono uppercase for Latin annotations, Thai display faces for everything read aloud.
- **Do** render empty slots honestly with em-dashes and a dashed icon tile — never a projected score.
- **Do** mirror all copy in Thai and English with equal weight; technical terms stay English inside Thai sentences.
- **Do** frame the leaderboard with the stave — four named script-level rules above the sheet — while keeping the rows themselves calm and scannable.

### Don't:
- **Don't** recolor a whole row to show state; one vermilion wash on the leader is the maximum the accent covers.
- **Don't** introduce grays that aren't ink rinsed in paper (the .16/.4 alpha steps or the named soft/faint inks) — the sheet has no cool gray.
- **Don't** animate past 0.2s or add spring/bounce easings; paper settles.
- **Don't** raise a resting surface with a permanent shadow; use a 1.5px ink rule where separation is needed.
- **Don't** stack or stagger rows by score vertically; readers compare down columns, so keep the table flat and let the stave carry the Thai identity.
- **Don't** use a generic model glyph or emoji as a brand mark; the lobehub SVG is the only iconology.
- **Don't** set Thai at display sizes in the unlooped face or Latin annotations in the Looped face; each voice has its register.
- **Don't** show unmeasured numbers anywhere — the data-honesty rule outranks every layout convenience.
