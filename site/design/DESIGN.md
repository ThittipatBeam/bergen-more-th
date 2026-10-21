# SIAM.AI Design System — Visual Theme
## Theme: Cloudy Sky

**Status:** Proposed visual direction  
**Brand foundation:** Colors extracted from the SIAM.AI logo  
**Primary visual identity:** Sky blue, pale cyan, turquoise, and white  
**Interface character:** Bright, calm, spacious, modern, and technically trustworthy

---

## 1. Visual Concept

### Cloudy Sky

The Cloudy Sky theme represents a clear, open environment for AI and cloud computing.

The visual language takes inspiration from a bright sky: white space, soft blue surfaces, cyan highlights, and subtle turquoise accents.

The interface should feel lightweight and approachable while remaining suitable for enterprise infrastructure, AI engineering, and developer workflows.

### Design keywords

- Airy
- Bright
- Clean
- Calm
- Trustworthy
- Technical
- Approachable
- Precise

### Core visual rule

**White is the dominant surface. Sky blue is the primary brand color. Cyan and turquoise provide supporting accents. Dark navy provides contrast and readability.**

The design should not depend on dark backgrounds, excessive gradients, or glowing effects to communicate that it is an AI product.

---

## 2. Brand Color Palette

The following colors were extracted from the SIAM.AI logo. Preserve these original values in the design system.

| Color token | Hex | Role |
|---|---|---|
| `brand.sky-blue` | `#0795CF` | Primary brand blue |
| `brand.light-blue` | `#B7DBE8` | Soft backgrounds |
| `brand.turquoise` | `#01A9B1` | Supporting accent |
| `brand.ocean-cyan` | `#00A0BE` | Secondary brand accent |
| `brand.sky-light` | `#73B7DC` | Decorative highlights |
| `brand.cyan` | `#0198CA` | Supporting interactive accent |
| `brand.teal-cyan` | `#02A5B7` | Secondary highlight |
| `brand.deep-cyan` | `#009CC5` | Supporting brand color |

These are source colors, not eight separate primary colors. Most components should reference semantic tokens instead of selecting arbitrary colors from this list.

---

## 3. Semantic Color System

The semantic palette translates the logo colors into practical UI roles.

### 3.1 Brand colors

| Token | Initial value | Usage |
|---|---|---|
| `color.brand.primary` | `#0795CF` | Main brand identity |
| `color.brand.secondary` | `#01A9B1` | Secondary highlights |
| `color.brand.soft` | `#B7DBE8` | Soft brand surfaces |
| `color.brand.tint` | `#EAF6FB` | Light blue-tinted backgrounds |
| `color.brand.hover` | `#006B91` | Darker primary hover/link treatment, subject to contrast testing |

### 3.2 Backgrounds and surfaces

White should be the default surface for most application content.

| Token | Initial value | Usage |
|---|---|---|
| `color.background.canvas` | `#F7FBFD` | Main application background |
| `color.background.primary` | `#FFFFFF` | Main white background |
| `color.background.subtle` | `#F0F8FC` | Subtle section backgrounds |
| `color.surface.default` | `#FFFFFF` | Cards, forms, and panels |
| `color.surface.raised` | `#FFFFFF` | Dialogs and floating surfaces |
| `color.surface.brand` | `#EAF6FB` | Selected or highlighted sections |

### 3.3 Text colors

| Token | Initial value | Usage |
|---|---|---|
| `color.text.primary` | `#102A3A` | Headings and main content |
| `color.text.secondary` | `#496273` | Supporting information |
| `color.text.muted` | `#607786` | Metadata, after contrast validation |
| `color.text.inverse` | `#FFFFFF` | Text on sufficiently dark backgrounds |

Text colors must be evaluated against every background on which they appear.

### 3.4 Borders and interaction

| Token | Initial value | Usage |
|---|---|---|
| `color.border.default` | `#DCEAF1` | Default borders |
| `color.border.strong` | `#A8C7D7` | Stronger boundaries |
| `color.border.focus` | `#006B91` | Keyboard focus indicator |
| `color.interactive.primary` | `#0795CF` | Primary interactive elements |
| `color.interactive.hover` | `#006B91` | Darker hover treatment |
| `color.interactive.selected` | `#EAF6FB` | Selected backgrounds |

These values are proposed starting tokens. Validate contrast, usability, and component states before production adoption.

---

## 4. Color Usage Ratio

Use the following as a starting visual balance, not a rigid requirement.

| Color family | Approximate share | Purpose |
|---|---:|---|
| White and near-white | 70% | Main surfaces and whitespace |
| Neutral text and borders | 20% | Structure and readability |
| Sky blue | 7% | Primary identity and actions |
| Cyan and turquoise | 3% | Supporting accents |

The percentages refer to the approximate visual area of a typical interface, not the percentage of individual components.

A dashboard may require more neutral structure, while a landing page may use larger blue-tinted sections.

The important principle is to avoid making every element colorful.

---

## 5. Surface and Background Rules

### Main application

- Use white for the primary working surface.
- Use a very light blue-gray for the surrounding canvas when it helps distinguish sections.
- Use subtle borders to separate cards and panels.
- Avoid placing every component inside a separate card.
- Maintain clear content hierarchy and generous whitespace.

### Navigation

- Prefer a white or near-white sidebar and header.
- Use sky blue for the active navigation indicator.
- Use pale cyan for selected navigation backgrounds.
- Keep labels and icons readable without relying on color alone.

### Primary actions

- Use the primary sky-blue token for important actions.
- Use a tested darker blue for text links and other cases where the original blue fails text contrast requirements.
- Reserve turquoise for secondary emphasis rather than making every action compete with the primary button.

### Charts and data

- Use neutral chart foundations.
- Use sky blue as the first series color.
- Use turquoise and other colors from the brand family for additional series when distinguishable.
- Use separate, tested status colors for success, warning, and errors.
- Never communicate operational status through color alone.

---

## 6. Gradients and Cloud-Inspired Visuals

Gradients are optional decorative elements, not the foundation of the component system.

### Approved direction to explore

Use extremely subtle transitions between white, pale blue, and light cyan for:

- Landing-page hero sections
- Empty states
- Product introduction pages
- Onboarding screens
- Decorative backgrounds

Example:

```css
background: linear-gradient(
  135deg,
  #ffffff 0%,
  #f0f8fc 55%,
  #eaf6fb 100%
);
```

### Avoid

- Strong saturated gradients across entire dashboards.
- Neon cyan glows around ordinary buttons.
- Multiple competing gradients within one screen.
- Gradient text for essential information.
- Decorative cloud illustrations behind dense tables.
- Low-contrast text placed on top of gradients.

Cloud-inspired visuals should communicate openness and clarity, not literal clouds on every screen.

---

## 7. Typography Direction

Use typography that supports both Thai and English comfortably.

### Proposed font evaluation

Test Noto Sans Thai, IBM Plex Sans Thai, and suitable Latin font pairings before selecting the final family.

### Typography principles

- Use dark navy for primary text.
- Use consistent heading sizes and weights.
- Allow Thai text to wrap naturally.
- Avoid clipping tone marks and vowel marks.
- Maintain comfortable line height.
- Use monospace typography for code, model identifiers, and technical values.
- Avoid using sky blue for small body text on white.

The font choice must be confirmed against the actual product requirements, browser support, and licensing.

---

## 8. Product Expression

### SIAM.AI Cloud

**Visual character:** precise, structured, operational, and spacious.

Use:

- White working surfaces.
- Subtle blue-gray backgrounds.
- Sky-blue primary actions.
- Clear tables and data visualizations.
- Strong status and error communication.
- Compact layouts where engineering workflows require them.

Avoid sacrificing information density simply to achieve a minimal appearance.

### SiamGPT

**Visual character:** calm, readable, conversational, and approachable.

Use:

- White conversation surfaces.
- Generous reading space.
- Light cyan highlights for selected elements.
- Sky-blue interactive controls.
- Clear source citations and feedback.
- Minimal decoration around generated text.

AI responses should remain the main focus rather than being overwhelmed by colorful message bubbles or backgrounds.

---

## 9. CSS Foundation

```css
:root {
  /* Original logo-derived colors */
  --brand-sky-blue: #0795cf;
  --brand-light-blue: #b7dbe8;
  --brand-turquoise: #01a9b1;
  --brand-ocean-cyan: #00a0be;
  --brand-sky-light: #73b7dc;
  --brand-cyan: #0198ca;
  --brand-teal-cyan: #02a5b7;
  --brand-deep-cyan: #009cc5;

  /* Semantic brand tokens */
  --color-brand-primary: var(--brand-sky-blue);
  --color-brand-secondary: var(--brand-turquoise);
  --color-brand-soft: var(--brand-light-blue);
  --color-brand-tint: #eaf6fb;
  --color-brand-hover: #006b91;

  /* Cloudy Sky surfaces */
  --color-background-canvas: #f7fbfd;
  --color-background-primary: #ffffff;
  --color-background-subtle: #f0f8fc;
  --color-surface-default: #ffffff;
  --color-surface-brand: #eaf6fb;

  /* Typography */
  --color-text-primary: #102a3a;
  --color-text-secondary: #496273;
  --color-text-inverse: #ffffff;

  /* Structure */
  --color-border-default: #dceaf1;
  --color-border-strong: #a8c7d7;
  --color-border-focus: #006b91;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Shape */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

All values are proposed initial tokens and should be tested before production use.

---

## 10. Accessibility Requirements

The light, cloudy theme must remain readable and accessible.

- Test all text/background combinations against WCAG 2.2 AA.
- Do not use the original logo blue for normal-sized text on white without verifying contrast.
- Use a darker blue for text links when necessary.
- Ensure visible keyboard focus.
- Do not rely on color alone to show selection, status, or errors.
- Test disabled controls to ensure they remain understandable.
- Test charts with color-blind users or suitable simulations.
- Verify Thai and English typography at realistic sizes.
- Test all semantic tokens against their intended surfaces.

Reference: https://www.w3.org/TR/WCAG22/

---

## 11. Figma Implementation

Create the following variable collections:

1. `Brand / Palette`
2. `Color / Background`
3. `Color / Surface`
4. `Color / Text`
5. `Color / Border`
6. `Color / Interactive`
7. `Color / Status`
8. `Spacing`
9. `Radius`
10. `Typography`

Use the original extracted colors as primitive values. Build semantic variables on top of them.

For example:

```text
Brand / Palette / Sky Blue
    #0795CF

Color / Interactive / Primary
    references Brand / Palette / Sky Blue

Color / Background / Brand Tint
    #EAF6FB
```

This separation makes it easier to adjust the visual theme without manually changing every button, card, or input.

---

## 12. Final Theme Definition

**Theme name:** Cloudy Sky

**Primary surface:** White

**Primary brand:** Sky blue

**Supporting colors:** Pale blue, cyan, and turquoise

**Typography:** Dark navy and slate tones

**Visual style:** Spacious, minimal, bright, and technical

**Motion:** Subtle and functional

**Core principle:** The interface should feel like a clear sky surrounding powerful technology: the infrastructure is complex, but the user experience should feel understandable.

This is the proposed visual direction for the SIAM.AI design system. Final approval should follow review of the official brand assets and validation with the product team.
