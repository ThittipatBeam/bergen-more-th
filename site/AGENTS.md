<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Development Guidelines & Rules

## 1. Mobile-First Development Principle (Mandatory)

Always design, build, and test for mobile screens first before expanding to tablet and desktop viewports.

### 1.1 Responsive Classes (Tailwind + CSS)
- **Mobile styles are default**: In Tailwind, any class without a prefix applies to mobile screens by default.
  ```tsx
  {/* Correct: Mobile-first */}
  <div className="flex flex-col md:flex-row p-4 md:p-8 gap-4">
    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">Title</h1>
  </div>
  ```
- **Only use responsive prefixes for larger screens**:
  - `sm:` $\ge$ 640px (large phones / phablets)
  - `md:` $\ge$ 768px (tablets)
  - `lg:` $\ge$ 1024px (laptops / desktops)
  - `xl:` $\ge$ 1280px (wide desktop)
- **Normal CSS & CSS Modules**: If writing custom CSS, always use `min-width` media queries (progressive enhancement). Never write desktop styles by default and patch mobile layouts with `max-width`.
  ```css
  /* Base styles = Mobile */
  .customCard {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  /* Larger viewports */
  @media (min-width: 768px) {
    .customCard {
      padding: 2rem;
      flex-direction: row;
    }
  }
  ```

### 1.2 Layout & Content Flow
- **Single-column first**: Default to single-column layout (`flex-col` or `grid-cols-1`). Expand to multi-column (`md:grid-cols-2`, `lg:grid-cols-3`) on larger screens.
- **Zero horizontal overflow**: Never allow horizontal scrolling on mobile. Ensure images use `max-w-full h-auto` (or Next.js `<Image>`) and avoid hardcoded fixed widths (`w-[500px]` $\rightarrow$ use `w-full max-w-lg`).
- **Mobile vs Desktop elements**:
  - Show on mobile only: `block md:hidden`
  - Show on desktop only: `hidden md:block` (or `hidden md:flex`)

### 1.3 Touch Targets & Ergonomics
- **Minimum 44px × 44px tap targets**: Every button, link, and interactive element must have at least 44px hit area for touch (e.g. `min-h-[44px] min-w-[44px]` or `h-11 px-4`).
- **No hover-dependent functionality**: Do not hide primary actions or crucial content behind `hover:`. Touch screens do not have persistent cursor hover.
- **Form inputs >= 16px font-size**: Always use `text-base` (16px) or larger on form inputs (`<input>`, `<textarea>`, `<select>`) to prevent iOS Safari from auto-zooming into fields on focus.

### 1.4 Combining Tailwind with Normal CSS
- Use **Tailwind** for rapid responsive layout, flexbox, grid, spacing, colors, and visibility.
- Use **Normal CSS / CSS Modules** for custom keyframe animations, complex pseudo-elements, or deeply styled components.
- You can freely combine both on the same element:
  ```tsx
  <div className={`flex flex-col md:flex-row p-4 ${styles.glowEffect}`}>
  ```

### 1.5 Verification Checklist Before Merging/Committing
- [ ] Tested at **375px** (standard mobile width like iPhone) with zero horizontal overflow.
- [ ] Tested at **768px** (tablet width) to verify layout transition.
- [ ] Tested at **1280px+** (desktop width) for max container constraints.
- [ ] All interactive buttons and links have $\ge$ 44px touch targets.
- [ ] No critical content or UI states rely solely on hover interactions.

---

## 2. Project Architecture & Component Modularization Standards

Maintain clean, readable, modular code. Prevent monolithic "god files" and enforce clean folder boundaries.

### 2.1 File Size Budget & Single Responsibility
- **Hard limit: ~150–200 lines per file**: No single file should exceed ~200 lines. Monolithic files with hundreds or thousands of lines are strictly forbidden.
- **Decomposition rules**: If a component approaches ~150 lines:
  - Extract sub-components into their own focused files (e.g. `Navbar.tsx` $\rightarrow$ `NavLinks.tsx`, `MobileNavMenu.tsx`).
  - Extract stateful logic, event listeners, or complex effects into custom hooks (`src/hooks/`).
  - Extract data formatting, math, or transformations into pure helper functions (`src/lib/` or `src/utils/`).

### 2.2 Thin Page Orchestrators (`src/app/`)
- Page route files (`src/app/**/page.tsx`) must be **lightweight orchestrators**, not monolithic walls of JSX.
- A `page.tsx` file should simply assemble and arrange high-level sections:
  ```tsx
  // src/app/page.tsx
  import { HeroSection } from "@/components/sections/HeroSection";
  import { FeaturesSection } from "@/components/sections/FeaturesSection";
  import { FaqSection } from "@/components/sections/FaqSection";

  export default function HomePage() {
    return (
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        <FeaturesSection />
        <FaqSection />
      </main>
    );
  }
  ```

### 2.3 3-Tier Component Directory Structure (`src/components/`)
All React components must be placed into one of three distinct folders under `src/components/`:
```text
src/components/
├── ui/         # Primitives / Design System (reusable anywhere)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
├── layout/     # Structural Chrome & Shell (site-wide framework)
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MobileDrawer.tsx
└── sections/   # Page Sections (high-level domain content)
    ├── HeroSection.tsx
    ├── FeaturesSection.tsx
    ├── PricingSection.tsx
    └── ContactSection.tsx
```

### 2.4 Separation of Concerns
Place non-UI logic in dedicated directories:
- **`src/hooks/`**: Custom React hooks (e.g., `use-mobile.ts`, `use-debounce.ts`, `use-scroll.ts`).
- **`src/lib/`**: Pure utility functions, helper libraries, and shared constants (e.g., `utils.ts`, `formatters.ts`).
- **`src/types/`**: Shared TypeScript interfaces, types, and schemas (e.g., `index.ts`, `api.ts`).

### 2.5 Strict Naming Conventions & Imports
- **React Components**: `PascalCase` file names and export names (e.g. `Navbar.tsx`, `Button.tsx`, `HeroSection.tsx`).
- **Hooks**: `kebab-case` prefixed with `use-` (e.g. `use-mobile.ts`, `use-local-storage.ts`).
- **Utilities**: `kebab-case` or `camelCase` (e.g. `format-date.ts`, `utils.ts`).
- **Clean Imports**: Always use the root alias `@/*` rather than relative paths with multiple `../../`:
  ```tsx
  // Correct
  import { Button } from "@/components/ui/Button";
  import { useMobile } from "@/hooks/use-mobile";

  // Avoid
  import { Button } from "../../../components/ui/Button";
  ```
