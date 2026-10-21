# SIAM.AI Design System
## Company Research, Brand Strategy, UX Principles & UI Foundations

**Document status:** Research and proposed direction  
**Research date:** October 21, 2026  
**Organization:** SIAM.AI Cloud / Siam AI Corporation  
**Primary products:** SIAM.AI Cloud and SiamGPT  
**Purpose:** Establish a research-backed foundation for a consistent, accessible, scalable company-wide UX/UI design system.

---

# 1. Executive Summary

SIAM.AI operates at the intersection of AI infrastructure, cloud computing, and Thai-focused artificial intelligence.

Its public website presents a cloud platform for GPU-accelerated workloads, including GPU computing, CPU computing, virtual servers, storage, networking, and machine-learning infrastructure. It also presents SiamGPT as an AI assistant designed to communicate naturally in Thai and English.

Sources:
- [Official SIAM.AI Cloud website](https://siam.ai/)
- [Official SiamGPT product page](https://siam.ai/siamgpt/)
- [SIAM.AI Cloud Machine Learning & AI](https://siam.ai/machine-learning-and-ai/)

The design system should help these products feel like parts of one technology company without forcing every product to use the same interface.

## Proposed design vision

> Build technology that feels powerful to engineers, understandable to businesses, and natural to Thai users.

## Proposed design principles

1. **Trust through clarity:** Explain system status, pricing, permissions, limitations, and AI uncertainty.
2. **Thai-first, globally capable:** Treat Thai as a first-class language rather than an afterthought.
3. **Power without complexity:** Make advanced capabilities discoverable without overwhelming new users.
4. **Consistency across products:** Share foundations and components wherever the underlying interaction is genuinely the same.
5. **Accessible by default:** Design for keyboard users, screen readers, different visual abilities, and different levels of technical experience.
6. **Evidence over decoration:** Prioritize useful information, measurable outcomes, and clear feedback over unnecessary visual effects.

These are proposed principles for internal review, not verified official company values.

---

# 2. Company Research

## 2.1 What is SIAM.AI Cloud?

SIAM.AI Cloud is a Thailand-based AI cloud computing provider. Its public website describes infrastructure for GPU-accelerated workloads, machine learning, model training, fine-tuning, and inference.

Its public product navigation includes:

- GPU Compute
- CPU Compute
- NVIDIA B200
- NVIDIA H200 and H100
- Virtual Server
- Storage
- Networking
- GPU Model Calculator
- Service Level Agreement (SLA)
- Inference Service
- Machine Learning & AI

The website describes an architecture involving Kubernetes and NVIDIA Slurm for GPU workload management.

Sources:
- [SIAM.AI Cloud](https://siam.ai/)
- [Machine Learning & AI](https://siam.ai/machine-learning-and-ai/)

### What this means for UX/UI

The product is not simply a marketing website. Cloud infrastructure products must help users make decisions, configure resources, understand costs, monitor workloads, and recover from failures.

The design system must eventually support operational interfaces such as:

- Resource dashboards
- GPU selection and configuration
- Workload creation
- Job and deployment status
- Usage and billing
- Performance metrics
- API keys and credentials
- Team members and permissions
- Logs and error messages
- Documentation and support

These are recommended design-system coverage areas. They are not a claim that every listed screen already exists in the current product.

## 2.2 Company positioning

The public website emphasizes business technology, GPU infrastructure, AI workloads, and collaboration with NVIDIA.

A useful working positioning statement is:

**SIAM.AI Cloud provides AI computing infrastructure that helps organizations and developers build, train, and deploy AI systems.**

This wording summarizes its publicly described offering; it is not an official company tagline.

### Design implications

The brand should communicate:

- Technical competence
- Reliability
- Performance
- Operational transparency
- Professionalism
- Developer friendliness
- Confidence without unnecessary complexity

Avoid making the entire product look like a gaming interface or an experimental AI demo. A visually impressive interface is not enough if customers cannot understand their infrastructure, costs, or workload status.

## 2.3 Who are the likely users?

The following personas are inferred from the product offering and should be validated with actual customers.

| Persona | Primary goal | Main UX concern |
|---|---|---|
| AI/ML engineer | Run models and workloads efficiently | Configuration, logs, GPU utilization |
| Researcher | Train and evaluate models | Compute availability, reproducibility, job status |
| Developer | Integrate AI through APIs | Documentation, API keys, examples, errors |
| Engineering lead | Manage projects and infrastructure | Cost, capacity, access, reliability |
| Enterprise buyer | Evaluate a cloud provider | Security, pricing, support, SLA |
| IT administrator | Manage users and resources | Roles, permissions, auditability |
| Beginner or student | Learn and experiment with AI | Onboarding, understandable terminology |

### Important research question

Which of these users currently generate the most business value for SIAM.AI Cloud?

The design system should support the real customer mix, not assume every user is an expert or every user is a beginner.

---

# 3. Understanding SiamGPT

## 3.1 What is SiamGPT?

The official SIAM.AI Cloud product page describes SiamGPT as an AI assistant that supports natural Thai and English conversations, writing, creative work, learning, and everyday assistance.

The same page references a Thai tourism LLM called Sukjai.

Source: [SiamGPT — SIAM.AI Cloud](https://siam.ai/siamgpt/)

NVIDIA has also published a customer story describing Siam AI's collaboration with Wipro on an AI-powered tourism assistant called Sukjai. The project used NVIDIA AI technologies and tourism information associated with the Tourism Authority of Thailand.

Source: [NVIDIA customer story: Transforming Thailand's tourism with AI-powered assistance](https://www.nvidia.com/en-us/case-studies/thailand-tourism-with-ai-powered-assistance/)

## 3.2 SiamGPT-32B

The published [SiamGPT-32B model card](https://huggingface.co/siamaids/SiamGPT-32B) describes a model fine-tuned from Qwen3-32B, targeting Thai-language generation, instruction following, and multi-turn dialogue stability.

The model card identifies Thai and English as its primary languages and documents efforts to reduce unwanted language mixing in Thai responses.

This has a direct UX implication: **Thai-language quality is a product experience requirement, not merely a model benchmark.**

For example, interfaces should be tested for:

- Thai text rendering
- Natural Thai phrasing
- Mixed Thai and English technical terminology
- Correct line wrapping
- Thai punctuation and spacing
- Copying and exporting Thai content
- Long Thai messages
- Mixed-language code blocks
- Streaming responses
- Error messages in Thai
- Thai and English date and number formatting

Model performance claims should always be evaluated against the relevant benchmark, model version, and test conditions. A model's public claims do not guarantee that every response will be correct.

## 3.3 What this means for SiamGPT UX

A trustworthy AI interface should help users understand:

1. What the assistant can do.
2. What information it is using.
3. Whether it is still generating a response.
4. Whether the response includes sources.
5. Whether an answer may be incorrect or incomplete.
6. How to retry, edit, copy, regenerate, or provide feedback.
7. What happens to their conversations and data.

Recommended components include:

- Conversation list
- Message bubbles
- Prompt input
- Suggested prompts
- Streaming indicator
- Stop-generation button
- Copy response button
- Regenerate response button
- Source citations
- Feedback controls
- Error and retry states
- Model selector, if supported
- File upload, if supported
- Tool activity indicators, if applicable
- Conversation settings
- Empty and loading states

Do not implement product-specific controls unless the underlying capability exists.

---

# 4. Brand Architecture

## 4.1 Recommended structure

Use a shared design foundation with product-specific themes and component extensions.

```text
SIAM.AI
│
├── Shared Design Foundation
│   ├── Design tokens
│   ├── Typography
│   ├── Color system
│   ├── Spacing and layout
│   ├── Accessibility
│   ├── Icons
│   ├── Motion
│   └── Core components
│
├── SIAM.AI Cloud
│   ├── Cloud console
│   ├── GPU / CPU compute
│   ├── Workloads
│   ├── Monitoring
│   ├── Billing
│   └── Developer experience
│
├── SiamGPT
│   ├── Chat interface
│   ├── AI responses
│   ├── Sources and citations
│   ├── Conversation management
│   └── AI feedback
│
└── Future Products
    ├── Shared foundations
    └── Product-specific extensions
```

The diagram represents a proposed architecture, not the company's confirmed organizational structure.

## 4.2 What should be shared?

Share components when they serve the same user need and behave the same way.

Good shared components:

- Buttons
- Inputs
- Selects
- Dialogs
- Tooltips
- Alerts
- Badges
- Navigation primitives
- Tabs
- Tables
- Form validation
- Loading indicators
- Empty states
- Toast notifications
- Accessibility patterns

Keep specialized components separate when their interaction models differ.

For example:

- A cloud resource configuration form should not inherit the interaction model of a chat composer.
- A GPU utilization chart should not be forced into a generic card that cannot communicate operational context.
- An AI message should support streaming and citations, which ordinary text content does not require.

**Share the foundation; specialize the experience.**

---

# 5. Proposed Brand Personality

The following is a design hypothesis to test with stakeholders.

## 5.1 Personality attributes

| Attribute | Target | Avoid |
|---|---|---|
| Technical | Precise and capable | Cold and incomprehensible |
| Professional | Credible and consistent | Generic corporate stock design |
| Modern | Clean and purposeful | Trend-driven decoration |
| Thai-aware | Natural and culturally relevant | Superficial national symbolism |
| Helpful | Clear and approachable | Childish or overly playful |
| Powerful | Advanced capabilities | Unnecessary complexity |

## 5.2 Proposed visual direction

**Direction: Trusted Thai AI Infrastructure**

Use:

- Clear typography
- Strong information hierarchy
- Restrained use of brand color
- Neutral surfaces
- High-quality technical data visualization
- Consistent spacing
- Intentional whitespace
- Subtle, functional motion
- Distinct but compatible product identities

Avoid:

- Excessive gradients
- Constant glow effects
- Too many accent colors
- Tiny low-contrast text
- Decorative charts that do not communicate data
- Inconsistent border radii
- Animation that delays essential actions
- AI-themed imagery that obscures the actual product

The existing official logo, brand colors, font licenses, and corporate identity guidelines should be obtained before finalizing the visual identity.

---

# 6. Color System

## 6.1 Important rule

Do not assume a color is an official brand color simply because it appears on a current website or product page.

First collect:

- Official logo files
- Brand guidelines
- Existing CSS variables
- Current website colors
- Product screenshots
- Presentation templates
- Any approved typography specifications

Then compare these assets and determine which values are authoritative.

## 6.2 Semantic color architecture

Organize colors by purpose rather than using arbitrary names such as `blue-1` or `gray-3`.

Recommended token groups:

```text
color.brand.*
color.background.*
color.surface.*
color.text.*
color.border.*
color.interactive.*
color.status.*
color.chart.*
```

Example token names:

```text
color.brand.primary
color.brand.secondary

color.background.canvas
color.background.subtle

color.surface.default
color.surface.raised
color.surface.inverse

color.text.primary
color.text.secondary
color.text.muted
color.text.inverse

color.border.default
color.border.strong
color.border.focus

color.interactive.primary
color.interactive.primary-hover
color.interactive.primary-disabled

color.status.success
color.status.warning
color.status.danger
color.status.info
```

These are semantic roles, not finalized color values.

## 6.3 Initial palette exploration

A restrained blue-based palette can be tested as a prototype because the company operates in technical infrastructure and its public materials include blue visual elements.

The proposed values below are exploratory, not verified corporate brand colors.

| Token | Prototype value | Intended use |
|---|---|---|
| Brand primary | `#2563EB` | Primary actions |
| Brand emphasis | `#1D4ED8` | Stronger emphasis |
| Canvas | `#F8FAFC` | Main application background |
| Surface | `#FFFFFF` | Cards and panels |
| Primary text | `#0F172A` | Main content |
| Secondary text | `#475569` | Supporting content |
| Default border | `#E2E8F0` | Dividers and boundaries |
| Success | `#15803D` | Successful operations |
| Warning | `#B45309` | Warnings |
| Danger | `#B91C1C` | Errors and destructive states |
| Info | `#0369A1` | Informational feedback |

Before adoption, validate contrast ratios for every foreground/background combination. Status must never be communicated through color alone.

## 6.4 Product-specific expression

### SIAM.AI Cloud

Prioritize neutral backgrounds, legible data, restrained accents, and unmistakable operational status.

### SiamGPT

Prioritize comfortable reading, natural conversation flow, clear input boundaries, and restrained highlights for sources and interactive AI features.

The products can use the same semantic tokens while applying them differently.

---

# 7. Typography

Typography is particularly important because the products need to support both Thai and English.

## 7.1 Font selection criteria

Evaluate candidate fonts for:

- Thai and Latin glyph coverage
- Readability at small sizes
- Numeral legibility
- Bold and semibold quality
- Thai tone marks and vowel placement
- Rendering on Windows, macOS, Android, and iOS
- Web performance
- Licensing and redistribution requirements

Potential candidates to test include Noto Sans Thai, IBM Plex Sans Thai, and IBM Plex Sans.

These are candidates for evaluation, not a declaration of the company's official typeface.

## 7.2 Typography tokens

```text
font.family.interface
font.family.monospace

font.size.xs
font.size.sm
font.size.md
font.size.lg
font.size.xl
font.size.2xl
font.size.3xl

font.weight.regular
font.weight.medium
font.weight.semibold
font.weight.bold

font.line-height.tight
font.line-height.normal
font.line-height.relaxed
```

Suggested initial scale:

| Token | Size | Example |
|---|---:|---|
| `xs` | 12 px | Metadata |
| `sm` | 14 px | Supporting labels |
| `md` | 16 px | Default body text |
| `lg` | 18 px | Emphasized body text |
| `xl` | 20 px | Small headings |
| `2xl` | 24 px | Section headings |
| `3xl` | 32 px | Page headings |

Validate this scale against Thai text, actual product layouts, and accessibility needs.

## 7.3 Typography rules

- Use 16 px as the initial default body size for web applications.
- Allow comfortable line spacing for Thai text.
- Avoid fixed-height text containers that clip tone marks or descenders.
- Avoid forcing every Thai sentence to use English-style line breaks.
- Use a monospace font for code and technical identifiers.
- Use tabular numerals for comparable metrics when supported by the font.
- Do not rely on font weight alone to establish hierarchy.
- Test long headings and narrow screens.

---

# 8. Spacing, Layout, and Grid

Use a consistent spacing scale rather than choosing arbitrary gaps for every component.

## 8.1 Proposed spacing tokens

Use a 4 px base unit.

| Token | Value | Typical use |
|---|---:|---|
| `space.1` | 4 px | Icon-to-label gap |
| `space.2` | 8 px | Compact internal spacing |
| `space.3` | 12 px | Form controls |
| `space.4` | 16 px | Standard component padding |
| `space.5` | 20 px | Related content groups |
| `space.6` | 24 px | Card and section spacing |
| `space.8` | 32 px | Major content groups |
| `space.10` | 40 px | Large section spacing |
| `space.12` | 48 px | Page-level separation |
| `space.16` | 64 px | Large layout sections |

These are proposed starting values. Components may use other values when their interaction requirements justify them.

## 8.2 Layout principles

- Establish a clear page container.
- Use consistent content alignment.
- Separate navigation from primary work areas.
- Keep related actions close to the content they affect.
- Use whitespace to group information.
- Avoid excessive nesting of cards inside cards.
- Allow dense operational screens to be more compact than marketing pages.
- Define responsive breakpoints based on content, not device names alone.

## 8.3 Density modes

Consider three density levels if user research demonstrates a need:

- **Comfortable:** default for general users.
- **Compact:** for dense tables and engineering workflows.
- **Touch-friendly:** for touch-first interfaces and mobile devices.

Do not create multiple density modes before the team can explain which user problems each mode solves.

---

# 9. Shape, Borders, Shadows, and Elevation

## 9.1 Proposed radius tokens

```text
radius.sm = 4px
radius.md = 8px
radius.lg = 12px
radius.xl = 16px
radius.full = 9999px
```

Suggested usage:

- Small: badges and compact controls.
- Medium: inputs and buttons.
- Large: cards and dialogs.
- Extra large: prominent, spacious panels.
- Full: pills, avatars, and circular controls.

Treat these as initial tokens to test, not final brand rules.

## 9.2 Borders and shadows

Prefer borders for clear structure and shadows for meaningful elevation.

Recommended elevation hierarchy:

- Base surface: no shadow.
- Raised surface: subtle shadow.
- Popover or dropdown: stronger separation.
- Modal: clear separation from the background.

Avoid applying shadows to every card. Excessive elevation weakens visual hierarchy.

---

# 10. Component Architecture

Organize the component library into three levels.

## 10.1 Foundations

- Color
- Typography
- Spacing
- Layout
- Radius
- Borders
- Shadows
- Icons
- Motion
- Accessibility
- Localization

## 10.2 Core components

- Button
- Icon button
- Text input
- Textarea
- Search field
- Select
- Checkbox
- Radio group
- Switch
- Slider
- Tooltip
- Badge
- Avatar
- Card
- Divider
- Tabs
- Breadcrumbs
- Pagination
- Table
- Dialog
- Drawer
- Dropdown menu
- Toast
- Alert
- Skeleton
- Spinner
- Empty state
- Form field

## 10.3 Product patterns

### Cloud infrastructure

- Resource configuration
- GPU selection
- Workload creation
- Job status
- Deployment status
- Usage summary
- Billing summary
- Metric chart
- Log viewer
- API credential management
- Role and permission editor
- Resource quota display

### AI assistant

- Conversation item
- Chat message
- Message composer
- Streaming response
- Source citation
- Code block
- Copy response
- Response feedback
- Tool activity
- Generation error
- Conversation empty state

A component should be added because a real user need recurs, not merely because a design file needs more components.

---

# 11. Button Design Specification

The button is a good first component to build in Figma because it establishes tokens, component properties, variants, and interaction states.

## 11.1 Button hierarchy

| Variant | Purpose | Example |
|---|---|---|
| Primary | Main action | Create deployment |
| Secondary | Supporting action | Configure |
| Outline | Alternative action | View details |
| Ghost | Low-emphasis action | Cancel |
| Destructive | Risky action | Delete resource |
| Link | Navigation or inline action | Read documentation |

Do not use multiple competing primary buttons in the same action group unless the interaction genuinely requires it.

## 11.2 Button properties

Create component properties for:

- Variant
- Size
- State
- Leading icon
- Trailing icon
- Icon-only mode
- Full-width mode

Suggested sizes:

| Size | Height | Use |
|---|---:|---|
| Small | 32 px | Compact toolbars |
| Medium | 40 px | Default desktop actions |
| Large | 48 px | Prominent actions and touch use |

These are initial dimensions. Ensure that the clickable area meets the selected accessibility target, particularly for icon-only and touch controls.

## 11.3 Required states

Every interactive button needs a documented state model.

- Default
- Hover
- Focus-visible
- Pressed
- Disabled
- Loading, where relevant

The visual state must match the actual interactive state.

For example, a disabled button should not still execute its action. A loading button should prevent duplicate submissions when appropriate.

## 11.4 Figma implementation

1. Create a button frame with Auto Layout.
2. Add horizontal padding and a consistent icon-label gap.
3. Use semantic color and typography variables.
4. Create component variants for the supported button hierarchy.
5. Add component properties for size and icon visibility.
6. Create interactive component variants for hover, pressed, and focus demonstrations where useful.
7. Document behavior separately from visual appearance.
8. Test the component with short and long Thai labels.
9. Verify contrast, focus visibility, and disabled behavior.
10. Publish the component to the shared library.

**Important:** Figma prototype animations demonstrate intended behavior. They do not automatically implement the production behavior of the real website or application.

---

# 12. UX Laws and Principles

These principles should guide the design system's decisions.

## 12.1 Gestalt principles

Use proximity, similarity, common regions, and visual hierarchy to communicate relationships.

Example: place a resource's GPU type, memory, and availability together so the user can evaluate the configuration as one unit.

## 12.2 Fitts's law

Important and frequently used controls should be easy to reach and large enough to select accurately.

Example: keep the primary deployment action visible in the relevant workflow rather than hiding it inside an overflow menu.

## 12.3 Hick–Hyman law

Decision time generally increases with the number and complexity of choices.

Example: guide new users through a recommended GPU configuration while retaining advanced settings for experienced users.

Do not remove useful options merely to make the interface appear simple.

## 12.4 Nielsen's usability heuristics

Apply the heuristics during design reviews:

1. Visibility of system status.
2. Match between the system and the real world.
3. User control and freedom.
4. Consistency and standards.
5. Error prevention.
6. Recognition rather than recall.
7. Flexibility and efficiency of use.
8. Aesthetic and minimalist design.
9. Help users recognize, diagnose, and recover from errors.
10. Help and documentation.

Example: when a cloud workload is provisioning, communicate the actual state rather than displaying a generic spinner indefinitely.

## 12.5 Affordances and signifiers

Users should be able to distinguish actions from static information.

- Buttons should look actionable.
- Links should look navigable.
- Editable fields should look editable.
- Expandable rows should communicate their expandability.
- Destructive actions should clearly communicate their consequences.

## 12.6 User needs

Before building a component, identify:

- Who uses it?
- What task are they completing?
- What information do they need?
- What can go wrong?
- What feedback do they expect?
- How will success be measured?

A design system should reduce repeated design decisions while preserving the ability to solve genuine user problems.

---

# 13. Interaction and Motion

Motion should communicate cause and effect, not merely make the interface look expensive.

## 13.1 Recommended motion principles

- Keep feedback immediate.
- Use subtle transitions for state changes.
- Avoid delaying important actions.
- Avoid decorative motion in dense operational interfaces.
- Respect reduced-motion preferences.
- Ensure that animations do not prevent keyboard interaction.
- Do not use animation as the only indicator of state.

## 13.2 Suggested motion tokens

```text
motion.duration.fast = 100ms
motion.duration.normal = 180ms
motion.duration.slow = 280ms

motion.easing.standard = cubic-bezier(0.2, 0, 0, 1)
```

These are prototype values that should be tested with real interactions.

## 13.3 Figma prototype examples

Useful demonstrations include:

- Button hover and pressed states
- Dropdown opening
- Dialog appearance
- Sidebar collapse
- Tab switching
- Toast appearance and dismissal
- Loading-to-success transitions

Production applications must implement these behaviors in code and account for keyboard use, reduced motion, errors, and real asynchronous operations.

---

# 14. Accessibility Standards

Adopt WCAG 2.2 Level AA as the proposed accessibility target for web interfaces.

Reference: [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)

## 14.1 Minimum design checks

- Normal text contrast: at least 4.5:1.
- Large text contrast: at least 3:1.
- Meaningful non-text controls and visual boundaries: generally at least 3:1 against adjacent colors where WCAG requires it.
- Visible keyboard focus.
- Logical focus order.
- Keyboard-accessible controls.
- Programmatically identifiable labels.
- Accessible error messages.
- Alternatives to color-only status communication.
- Appropriate names for icon-only buttons.
- Reduced-motion support.
- Responsive layouts at zoomed text sizes.

WCAG includes additional requirements and exceptions; these examples do not replace a complete accessibility audit.

## 14.2 Thai accessibility considerations

- Test Thai text with screen readers.
- Avoid clipping vowel marks and tone marks.
- Use understandable Thai labels.
- Provide clear error explanations.
- Allow longer Thai strings to wrap naturally.
- Do not assume English strings and Thai translations have equal lengths.
- Verify keyboard behavior for forms and menus.
- Test text resizing and zoom.

Accessibility must be part of component acceptance criteria, not an optional final polishing phase.

---

# 15. Thai-First Internationalization

Internationalization must be designed into the foundations rather than added at the end.

## 15.1 Localization requirements

- Support Thai and English.
- Use locale-aware number formatting.
- Handle Thai and Gregorian calendar conventions intentionally.
- Distinguish timestamps from dates.
- Support localized currency formatting where relevant.
- Allow flexible text widths.
- Avoid embedding essential text inside images.
- Provide translation-ready content structures.
- Support appropriate language metadata.
- Test long and short translated strings.

## 15.2 Cloud-specific considerations

Technical identifiers, GPU names, model names, API endpoints, and code should remain unambiguous regardless of interface language.

For example, translating an explanatory label is appropriate; altering a literal API endpoint or model identifier is not.

## 15.3 AI-specific considerations

The AI interface should handle:

- Thai responses containing English technical terms.
- Long responses with headings and lists.
- Source titles in multiple languages.
- Code and prose in the same message.
- Streaming text without layout jumps.
- Copying formatted and plain text.
- Long conversations.
- Thai text in exported files.

The UI should not promise that a model understands every Thai dialect or always produces flawless Thai.

---

# 16. Trust, Privacy, and Security UX

Trust is especially important for cloud infrastructure and AI applications.

## 16.1 Cloud infrastructure

The interface should make it easy to understand:

- What resource will be created.
- Which region or environment will be used, if applicable.
- Estimated costs and pricing units.
- Resource availability.
- Who has access.
- Which permissions are required.
- What happens when a resource is deleted.
- Whether an operation is reversible.
- How to find logs and support.

Before a costly or destructive action, communicate the consequences and provide confirmation where appropriate.

## 16.2 AI applications

The interface should communicate:

- What the AI can and cannot do.
- Whether a response is still being generated.
- Whether external tools or sources were used.
- Whether a citation supports a particular claim.
- When the system encounters an error.
- What data handling and retention policies apply.

Do not claim that conversations are private, encrypted, retained for a particular period, or processed entirely within Thailand unless those claims have been verified for the specific product and service.

---

# 17. Data Visualization for Cloud Products

Cloud infrastructure requires visualizations that communicate operational meaning.

Recommended chart patterns:

- Line charts for utilization over time.
- Bar charts for comparisons.
- Tables for exact resource values.
- Status indicators for workload state.
- Progress indicators for bounded tasks.
- Usage summaries for billing and quota monitoring.

## 17.1 Chart design rules

- Label axes and units.
- Show meaningful time ranges.
- Distinguish actual values from estimates.
- Provide exact values on hover or through accessible alternatives.
- Avoid misleading scales.
- Do not rely on color alone.
- Make missing data and collection delays visible.
- Use consistent status colors.
- Provide a tabular alternative when appropriate.

Example: GPU utilization should communicate the percentage, observation period, and resource being measured. A chart without units or context is not sufficient.

---

# 18. Figma File Architecture

Create a shared Figma library with clear separation between foundations, reusable components, and product-specific patterns.

Recommended file structure:

```text
SIAM.AI — Design System
│
├── 00 — Cover & Introduction
├── 01 — Brand Foundations
├── 02 — Design Principles
├── 03 — Color Variables
├── 04 — Typography
├── 05 — Spacing & Layout
├── 06 — Icons
├── 07 — Effects & Motion
├── 08 — Core Components
├── 09 — Forms & Validation
├── 10 — Navigation
├── 11 — Data Display
├── 12 — Feedback & Status
├── 13 — Cloud Patterns
├── 14 — AI Patterns
├── 15 — Accessibility
├── 16 — Templates & Examples
└── 17 — Changelog
```

## 18.1 Figma implementation principles

Use:

- Variables for design tokens.
- Auto Layout for responsive components.
- Component properties for configurable behavior.
- Variants for meaningful visual or interaction differences.
- Interactive components for prototype demonstrations.
- Published libraries for cross-file reuse.
- Documentation for usage rules and anti-patterns.

Avoid creating a separate variant for every possible combination if component properties or composable components can express the same system more clearly.

---

# 19. Design Tokens and Developer Handoff

Design tokens should be the shared vocabulary between design and code.

## 19.1 Token layers

**Primitive tokens:** raw values.

```text
blue.600
slate.900
space.4
radius.md
```

**Semantic tokens:** purpose.

```text
color.text.primary
color.background.canvas
color.interactive.primary
```

**Component tokens:** component-specific needs where necessary.

```text
button.primary.background
button.primary.text
button.primary.radius
```

Prefer semantic tokens in product components so the system can evolve without manually changing every screen.

## 19.2 Example CSS

```css
:root {
  /* Exploratory values — not approved brand colors. */
  --color-brand-primary: #2563eb;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-background-canvas: #f8fafc;
  --color-surface-default: #ffffff;
  --color-border-default: #e2e8f0;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;

  --motion-fast: 100ms;
  --motion-normal: 180ms;
}

body {
  color: var(--color-text-primary);
  background: var(--color-background-canvas);
  font-size: var(--font-size-md);
}
```

This is an illustrative starting point. It is not production-ready until brand values, contrast, themes, typography, and browser behavior have been validated.

## 19.3 Handoff checklist

For every component, document:

- Component name
- Purpose
- Supported variants
- Component properties
- Default state
- Hover state
- Focus-visible state
- Pressed state
- Disabled state
- Loading and error states where relevant
- Responsive behavior
- Accessibility requirements
- Localization requirements
- Implementation notes
- Examples of correct usage
- Anti-patterns

---

# 20. Design System Governance

A design system is a maintained product asset, not a one-time Figma file.

## 20.1 Component maturity

Use the following lifecycle:

1. **Proposed:** identified as a potential reusable pattern.
2. **In design:** undergoing exploration and validation.
3. **Ready for review:** design and behavior are documented.
4. **Approved:** accepted for shared use.
5. **Implemented:** available in the production component library.
6. **Deprecated:** replaced by a newer supported pattern.

The status should be visible to both designers and developers.

## 20.2 Change management

For significant changes:

- Explain the problem being solved.
- Identify affected products.
- Review accessibility implications.
- Evaluate migration costs.
- Document breaking changes.
- Provide a migration path.
- Update examples and documentation.

Do not silently change a shared component in a way that breaks existing products.

## 20.3 Suggested ownership

- Design owner: design principles, tokens, and Figma library.
- Engineering owner: implementation, APIs, and release compatibility.
- Product stakeholders: product requirements and prioritization.
- Accessibility reviewer: accessibility validation.
- Localization reviewer: Thai and English quality.

One person can initially cover multiple responsibilities, but ownership must be explicit.

---

# 21. Recommended Implementation Roadmap

## Phase 1 — Discovery

- Collect current logos, brand assets, product screenshots, and source files.
- Audit the current SIAM.AI Cloud website.
- Audit SiamGPT and any internal product interfaces in scope.
- Interview relevant stakeholders.
- Identify target users and their most important workflows.
- Confirm which products must share the system.
- Record current inconsistencies and accessibility issues.

**Deliverable:** Research summary, asset inventory, user needs, and scope.

## Phase 2 — Foundations

- Approve the design direction.
- Select and test fonts.
- Define color roles.
- Create spacing and layout tokens.
- Define radius, border, elevation, and motion tokens.
- Establish accessibility and localization standards.
- Create Figma variables.

**Deliverable:** Approved foundation library.

## Phase 3 — Core components

Start with the most reusable and consequential components:

1. Buttons
2. Text inputs and textareas
3. Selects and dropdowns
4. Form fields and validation
5. Alerts and toasts
6. Cards
7. Dialogs and drawers
8. Tabs and navigation
9. Tables
10. Loading, empty, and error states

**Deliverable:** Documented, reusable Figma components and corresponding implementation specifications.

## Phase 4 — First product pilot

Choose one real workflow rather than redesigning everything at once.

A useful SIAM.AI Cloud pilot could be a resource configuration and creation workflow.

Evaluate:

- How users choose resources.
- Whether configuration requirements are understandable.
- Whether costs and limitations are clear.
- Whether validation prevents common mistakes.
- Whether the workflow handles errors and recovery.

If SiamGPT is the first priority, choose a chat workflow and test Thai response readability, streaming, sources, and error handling.

**Deliverable:** One validated end-to-end product workflow.

## Phase 5 — Expansion

- Build product-specific patterns.
- Connect Figma tokens to implementation.
- Establish documentation and release practices.
- Migrate existing interfaces incrementally.
- Measure usability and consistency.
- Review component adoption and gaps.

**Deliverable:** A maintained, cross-product design system.

---

# 22. How to Measure Success

Measure outcomes instead of counting the number of components in the library.

Recommended indicators:

- Time required to design a common workflow.
- Time required to implement a standard component.
- Percentage of eligible interfaces using approved components.
- Number of duplicated components.
- Number of design inconsistencies found in audits.
- Keyboard accessibility defects.
- Localization defects.
- Task completion rate.
- User-reported usability problems.
- Time to recover from common errors.

Establish baselines before setting numerical improvement targets.

---

# 23. Questions to Resolve Internally

Public research cannot determine the company's internal decisions. Confirm the following before the system is treated as official.

## Brand

- Is there an approved corporate brand guideline?
- Which logo versions and colors are authoritative?
- Is there an approved Thai and English typeface?
- Are SiamGPT and SIAM.AI Cloud governed by one brand or separate product identities?

## Product scope

- Which applications are included in the initial release?
- Is the priority a marketing website, a cloud console, an AI chat product, or all three?
- Which screens already exist?
- Which frontend frameworks and component libraries are in use?

## Users

- Which user groups matter most commercially?
- What are their most frequent and highest-risk tasks?
- What usability problems have already been reported?
- How often do users switch between Thai and English?

## Engineering

- What design tokens already exist in the codebase?
- Is there an existing component library?
- How will Figma variables map to production tokens?
- Who owns releases and breaking changes?

## Security and privacy

- What data handling claims are approved for each product?
- Which permissions and audit requirements apply?
- What accessibility and security review processes are required?

---

# 24. Official Research Sources

The following sources provide the foundation for the company and product overview.

1. **SIAM.AI Cloud — Official website**  
   https://siam.ai/  
   Public overview of the company and its cloud product categories.

2. **SIAM.AI Cloud — SiamGPT**  
   https://siam.ai/siamgpt/  
   Public product positioning and descriptions of SiamGPT.

3. **SIAM.AI Cloud — Machine Learning & AI**  
   https://siam.ai/machine-learning-and-ai/  
   Public description of GPU infrastructure, model training, and inference services.

4. **NVIDIA — Transforming Thailand's tourism with AI-powered assistance**  
   https://www.nvidia.com/en-us/case-studies/thailand-tourism-with-ai-powered-assistance/  
   External customer story describing Siam AI, Wipro, and the Sukjai tourism assistant.

5. **Hugging Face — SiamGPT-32B model card**  
   https://huggingface.co/siamaids/SiamGPT-32B  
   Technical model description, language objectives, and published benchmark information.

6. **W3C — Web Content Accessibility Guidelines (WCAG) 2.2**  
   https://www.w3.org/TR/WCAG22/  
   Accessibility reference for web interfaces.

7. **Figma — Official website**  
   https://www.figma.com/  
   Product reference for component libraries, variables, prototyping, and design collaboration.

## Research limitations

- Public websites do not reveal the complete internal design system, brand governance, customer research, or implementation details.
- Marketing claims should be independently validated before becoming product promises.
- The proposed palette, typography, spacing, component specifications, and roadmap are design recommendations.
- SiamGPT's model capabilities and the availability of individual application features may change between versions.
- Internal stakeholders should approve the final brand direction and product scope.

---

# 25. Final Recommendation

Start by creating a small, high-quality foundation rather than attempting to design every possible component.

The first milestone should contain:

1. A documented brand direction.
2. A verified logo and brand asset inventory.
3. A Thai/English typography decision.
4. Semantic color variables.
5. Spacing and layout tokens.
6. A button component with all essential states.
7. Input and form components.
8. Accessible feedback and error patterns.
9. One real product workflow.
10. A documented handoff process between Figma and code.

Use that pilot to validate the system with real users and developers.

The long-term goal is not to make every product look identical. It is to make every SIAM.AI product feel intentional, consistent, understandable, and trustworthy while preserving the interaction patterns its users actually need.

**Proposed design-system principle: One shared foundation. Distinct product experiences. Trusted Thai AI technology.**