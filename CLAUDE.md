# llm-d Website — Project Instructions

## Overview
This is the new website for llm-d, an open-source Kubernetes-native distributed LLM inference framework. The site serves as the primary web presence at https://llm-d.ai/.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Content**: MDX via next-mdx-remote (docs and blog are .mdx files in content/)
- **Font**: IBM Plex Sans + IBM Plex Mono (loaded via next/font/google)
- **Deployment**: Vercel (or any static-export-compatible host)
- **Package manager**: pnpm

## Design System

### Philosophy
Minimal, clean, content-first. The design should feel like well-maintained infrastructure software — professional, trustworthy, and quiet. Inspired by BeeAI Framework docs, Mellea docs, and IBM Granite docs: sidebar-driven navigation, card-based overviews, generous whitespace, and code as a first-class citizen.

Key principles:
- Content clarity over visual flair
- Generous whitespace and line spacing
- The sidebar is the navigational backbone for docs
- Code blocks are prominent, with copy buttons and language tabs
- Cards are used for navigation and feature overviews
- Color is almost entirely absent — monochromatic with rare purple accent

### Color Palette
The palette is almost entirely grayscale. Purple appears only in a few specific places.

```
/* Grayscale — used for 95%+ of the interface */
--color-white:       #FFFFFF      /* page backgrounds, cards */
--color-gray-50:     #F9FAFB      /* alternate section backgrounds */
--color-gray-100:    #F3F4F6      /* hover fills, code block backgrounds */
--color-gray-200:    #E5E7EB      /* borders, dividers, card outlines */
--color-gray-300:    #D1D5DB      /* disabled states, step numbers */
--color-gray-500:    #6B7280      /* secondary text, captions, descriptions */
--color-gray-700:    #374151      /* body text, sidebar items */
--color-gray-900:    #111827      /* headings, primary text */

/* Brand purple — used VERY sparingly */
--color-purple:      #7B2D8E      /* from the llm-d logo */
--color-purple-light:#F3E8F9      /* hover/active tint for sidebar, callouts */
--color-purple-dark: #5B1D6E      /* hover state for purple CTAs */

/* Callout colors (used only inside callout components) */
--color-blue-50:     #EFF6FF      /* info callout background */
--color-blue-500:    #3B82F6      /* info callout border/icon */
--color-green-50:    #F0FDF4      /* tip callout background */
--color-green-500:   #22C55E      /* tip callout border/icon */
--color-amber-50:    #FFFBEB      /* warning callout background */
--color-amber-500:   #F59E0B      /* warning callout border/icon */

/* Dark mode palette — applied when <html> has class="dark" */
--color-dark-bg:         #111827   /* gray-900 — page background */
--color-dark-surface:    #1F2937   /* gray-800 — cards, dropdowns */
--color-dark-surface-2:  #374151   /* gray-700 — active sidebar, hover states */
--color-dark-text:       #F9FAFB   /* gray-50 — primary text */
--color-dark-text-2:     #9CA3AF   /* gray-400 — secondary text */
--color-dark-border:     #374151   /* gray-700 — borders, dividers */
--color-dark-sim-bg:     #1a2332   /* simulator page bg (slightly differentiated) */
--color-blue-950:        #172554   /* info callout bg in dark mode */
--color-green-950:       #052e16   /* tip callout bg in dark mode */
--color-amber-950:       #451a03   /* warning callout bg in dark mode */
```

### Where Purple Is Allowed (exhaustive list)
- Active sidebar item: left border + text color
- Primary CTA button: 1 per page maximum (purple bg, white text)
- Links on hover (not default state)
- The llm-d logo itself
- Active "On this page" TOC indicator
- Active nav tab indicator in header

### Where Purple Is NOT Allowed
- Section backgrounds, page backgrounds
- Card backgrounds or borders
- Body text, headings
- Icons (use gray-500 or gray-700)
- Decorative elements, gradients, overlays
- Secondary buttons (use gray-200 border, gray-700 text)

### Typography
- **Font family**: 'IBM Plex Sans' for all UI and body text
- **Code**: 'IBM Plex Mono' for code blocks, inline code, terminal output
- **Headings**: font-weight 600, color gray-900
- **Body**: font-weight 400, color gray-700, 16px (1rem) base, line-height 1.7
- **Captions/secondary**: font-weight 400, color gray-500, 14px (0.875rem)
- **Sidebar items**: 14px, gray-700, font-weight 400 (500 when active)

### Layout Principles
- Max content width: 1200px, centered
- **Docs pages**: left sidebar (250px) + main content (max 720px) + right "On this page" TOC (200px)
- **Marketing pages** (landing, blog, videos, community): full-width sections, content centered at 1200px
- **Blog pages**: centered column, max 720px
- **Simulator**: two-panel layout, light gray-50 page background to gently differentiate from other pages
- Vertical rhythm: 64px between major sections, 32px between subsections, 24px card padding
- Cards: white bg, 1px gray-200 border, 8px border-radius, subtle shadow-sm on hover
- Mobile: sidebar collapses to off-canvas drawer, TOC hidden, single column

## Header (persistent across all pages)

### Announcement Bar
- Slim bar above the navbar, full width
- Gray-50 background (or very subtle purple-light), gray-700 text, purple link
- Dismissible with X button on the right
- Content is a single string — easy to update for new releases
- Example: "llm-d 0.5 is now released! Read the announcement →"

### Navbar
The navbar is the same component on every page. It never unmounts or reloads.

- **Left**: llm-d full logotype (`public/img/llm-d-logotype-and-icon.png`, ~120px wide, vertically centered)
- **Center**: four navigation tabs — **Docs**, **Simulator**, **Blog**, **Community**
- **Right**: GitHub badge (with star count) + "Join Slack" button + **ThemeToggle** (rightmost item)
- GitHub badge shows "★ 2.9k" as a small attached badge (gray-200 bg, gray-700 text, text-xs, rounded, px-2). Static value for now — TODO comment in code to replace with live fetch from `https://api.github.com/repos/llm-d/llm-d` (.stargazers_count)
- Sticky top, white background (`dark:bg-gray-900`), 1px bottom border gray-200 (`dark:border-gray-700`)
- Active tab: purple text or thin 2px purple bottom border
- Mobile: hamburger icon opening full-width panel with all links + theme toggle row; star badge shown in mobile GitHub link too
- The Docs tab links to /docs/getting-started (the docs landing)
- No search bar in the prototype (add later)

### Theme Toggle (`components/theme-toggle.tsx`)
- Pill-shaped toggle: 56px × 28px (`w-14 h-7`), `rounded-full`
- Gray-200 bg in light mode, gray-700 bg in dark mode
- Sun icon (left) and moon icon (right) as fixed position SVGs inside the pill
- White circular thumb (`w-5 h-5`) slides via `translate-x` — left in light, right in dark
- Reads initial state from `document.documentElement.classList` on mount (set by flash-prevention script)
- Persists preference to `localStorage` key `'theme'`; adds/removes `'dark'` class on `<html>`
- Flash prevention: inline `<script>` in `<head>` in `app/layout.tsx` reads `localStorage` and `prefers-color-scheme` before first paint

### Dark Mode Implementation
- Strategy: Tailwind `darkMode: 'class'` — the `dark` class on `<html>` enables all `dark:` variants
- All components use `dark:` Tailwind variants for background, text, border, and surface colors
- `app/globals.css` has `.dark body { color/background }` for baseline reset
- Simulator page uses `dark:bg-[#1a2332]` (slightly lighter than gray-900) to maintain visual differentiation
- Image swap pattern: if a `*-dark.svg` variant exists alongside an image, swap in dark mode; otherwise use same image
- Callout dark backgrounds: blue → blue-950, green → green-950, amber → amber-950

## Page: Landing (`/`)

### Layout
Single centered column, `max-w-6xl`, `px-6`. All content shares the same container width. No logo on the landing page — logo is in the navbar only; do not repeat it in the hero.

**Six sections, each separated by `mt-20`:**

**1. Hero** (`pt-24`, flex row left/right split, stack on mobile):
- Left (`flex-[55]`): headline `text-4xl font-semibold text-gray-900 max-w-xl`, subtitle `text-base text-gray-500`, two buttons (purple "Get Started" → prerequisites, gray-border "Try the Simulator" → /simulator)
- Right (`flex-[45]`): `VideoEmbed youtubeId="32MqYC3OydE"`
- No logo above the headline

**2. Capabilities** (`mt-20`):
- Section heading: `text-lg font-semibold text-gray-700` — intentionally lighter than a page title
- 3 primary cards: `font-mono text-xs text-gray-500` tags, title, description, outcome, "Deploy this →" link
- 3 secondary compact cards below

**3. Architecture Diagram** (`mt-20`): full-width SVG in white card, centered "Explore the full architecture →" link below

**4. Performance** (`mt-20`): 3 dashed-border placeholder cards, `text-5xl font-bold text-gray-300` metric, "Benchmarks coming soon" footer link

**5. Company Logos** (`mt-20`): single row of contributor company logos, horizontally centered, `gap-8 md:gap-10`, wraps on mobile. Companies in order: IBM, Google, Red Hat, NVIDIA, CoreWeave, AMD. Followed by "+ more" in gray-400. No card, no background, no heading. Logo files in `public/img/logos/`.

Logo sizing (optical consistency at ~28px target height):
- IBM (`ibm.png`): `h-7` (28px) — square IBM bars icon, white rect baked-in
- Google (`google.png`): `h-7` (28px) — wide colorful logotype on transparent bg
- Red Hat (`redhat.png`): `h-6` (24px) — wide horizontal logo, reduced for visual balance
- NVIDIA (`nvidia.png`): `h-9` (36px) — stacked icon+text, needs more height
- CoreWeave (`coreweave.svg`): `h-5` (20px) — very wide, reduced to avoid overwhelming
- AMD (`amd.svg`): `h-7` (28px) — horizontal AMD chevron mark

Dark mode per logo:
- IBM: `dark:invert` — white rect bg becomes dark, black bars become white ✓
- Google: no dark treatment — colorful letters on transparent bg, works on both backgrounds
- Red Hat: `dark:invert` — red+black on transparent; accepted color shift for visibility
- NVIDIA: `dark:invert` — green+black on transparent; accepted color shift for visibility
- CoreWeave: `dark:invert` — blue+black on transparent; accepted color shift for visibility
- AMD: `dark:invert` — black-only mark on transparent; becomes white ✓

**6. Community** (`mt-20 mb-20`): full-width gray-50 block (`bg-gray-50 rounded-lg p-10 text-center`) — no max-w constraint; spans the full content column width

No GitHub/Slack links on the page — they are already in the navbar and footer.

## Page: Docs (`/docs/*`)

### Documentation Navigation Structure

```
I. Getting Started  (folder: getting-started/, index sidebar_order: 1)
   ├── Architecture Overview  (index.mdx, order: 1)
   ├── Prerequisites  (prerequisites.mdx, order: 2)
   └── Choose Your Quickstart  (quickstart/ sub-group, no index)
       ├── Gateway-Free  (gateway-free.mdx, order: 3)
       └── Gateway-Backed  (gateway-backed.mdx, order: 4)

II. Core Concepts  (folder: core-concepts/, _group.json order: 2)
   ├── The Inference Gateway  (inference-gateway.mdx, order: 1)
   ├── Disaggregated Serving  (disaggregated-serving.mdx, order: 2)
   ├── Autoscaling  (autoscaling.mdx, order: 3)
   ├── Tiered KV Cache Offloading  (tiered-kv-cache.mdx, order: 4)
   ├── Latency Predictor  (latency-predictor.mdx, order: 5)
   └── Synchronous and Asynchronous Processing  (sync-async-processing.mdx, order: 6)

III. Local Guides  (folder: development-guides/, _group.json order: 3)
   └── Accelerator Simulation  (accelerator-simulation.mdx, order: 1)

IV. Deployment Guides  (folder: production-deployment/, _group.json order: 4)
   ├── Intelligent Inference Scheduling  (inference-scheduling/ sub-group, _group.json order: 1 — heading only, no landing page)
   │   ├── With Precise Prefix Cache Aware Scheduling  (inference-scheduling/prefix-cache-scheduling.mdx, order: 2)
   │   └── With Predicted Latency Based Scheduling  (inference-scheduling/predicted-latency-scheduling.mdx, order: 3)
   ├── Scheduling With Tiered Prefix Cache  (scheduling-tiered-cache.mdx, order: 4)
   ├── Scheduling With P/D Disaggregation  (scheduling-pd.mdx, order: 5)
   ├── Scheduling With Wide Expert Parallelism  (scheduling-wide-ep.mdx, order: 6)
   ├── Admission & Flow Control  (admission-flow-control.mdx, order: 7)
   ├── Asynchronous Processing  (async-processing.mdx, order: 8)
   └── Model Server Autoscaling  (model-server-autoscaling.mdx, order: 9)

V. Observability & Operations  (folder: observability/, _group.json order: 5)
   ├── Monitoring, Metrics & Tracing  (monitoring-metrics-tracing.mdx, order: 1)
   ├── Troubleshooting  (troubleshooting.mdx, order: 2)
   └── Infrastructure  (infrastructure.mdx, order: 3)

VI. Benchmarking & Performance  (folder: benchmarking/, _group.json order: 6)
   ├── Standardized Benchmark Methodologies  (methodology.mdx, order: 1)
   └── Dynamic Benchmark Results  (benchmark-results.mdx, order: 2)

VII. References  (folder: references/, _group.json order: 7)
   ├── Component Versions & Release Notes  (component-versions.mdx, order: 1)
   ├── Upstream Dependency Versions  (upstream-versions.mdx, order: 2)
   ├── Accelerator Support Matrix  (accelerator-support-matrix.mdx, order: 3)
   └── Helm Chart Values Reference  (helm-chart-values.mdx, order: 4)
```

**Group ordering rule**: Group position is determined by (in priority order):
1. `index.mdx` `sidebar_order` — when the group has a navigable landing page (only Getting Started uses this)
2. `_group.json` `order` field — for groups that are section headings only (no landing page)
3. Min child `sidebar_order` — fallback for index-less sub-groups like `quickstart/`

**Group display names**: `_group.json` `title` field overrides `titleCase(folderName)` (e.g. `"Observability & Operations"`). Getting Started uses `group_title` in its `index.mdx` frontmatter instead.

**Sidebar clickability rule**:
- Groups WITH `index.mdx` → heading is expand/collapse button; index page appears as first link inside the group
- Groups WITHOUT `index.mdx` → heading is expand/collapse button only; no link rendered for the group itself

### Docs Versioning

**URL structure:**
- Latest (v0.6): `/docs/getting-started`, `/docs/core-concepts`, etc. — no version prefix
- Older versions: `/docs/v/v0.5.1/getting-started`, etc.

**Content structure:**
- Latest content: `content/docs/` (unchanged)
- Older versions: `content/docs-versions/[version]/` — e.g. `content/docs-versions/v0.5.1/`

**Versions config:** `lib/versions.ts` — single source of truth. Each entry has `version`, `label`, `badge`, `isLatest`. Add new versions here.

**Routing:**
- Latest: `app/docs/[[...slug]]/page.tsx` — reads from `content/docs/`
- Versioned: `app/docs/v/[version]/[[...slug]]/page.tsx` — reads from `content/docs-versions/[version]/`
- Both use the same MDX rendering pipeline. `lib/docs.ts` and `lib/mdx.ts` accept an optional `version` param.

**Version switcher sub-header:**
- A slim bar (h-10) at the top of the **right column only** — it does NOT span the sidebar area
- The sidebar sits full-height in its own column; the version bar starts at the sidebar's right border
- White bg, 1px bottom border gray-200; `VersionSwitcher` button sits at the left edge of this bar
- `VersionSwitcher` reads `usePathname()` to detect current version and slug, navigates on select
- Dropdown: white bg, gray-200 border, rounded-lg, shadow-sm; each row shows version label + green "Stable" badge; checkmark on selected
- Badge style: green-50 bg, green-700 text, rounded-full, text-xs

**Sidebar is version-aware (client-side tree selection):**
- `app/docs/layout.tsx` builds ALL version trees server-side into a `treesMap: Record<string, DocGroup[]>` and passes it to `DocsSidebar`
- `DocsSidebar` (client component) calls `usePathname()` to detect the active version key (`/docs/v/v0.5.1/...` → `"v0.5.1"`, otherwise `"v0.6"`), then picks `treesMap[activeKey]` — sidebar updates reactively on every client navigation without re-SSR
- `VersionSwitcher` navigates to `/docs/v/[version]/[slug]` (versioned) or `/docs/[slug]` (latest)
- `middleware.ts` still injects `x-pathname` header (kept for potential server-side use)

**Adding a new version:**
1. Add entry to `lib/versions.ts`
2. Create content under `content/docs-versions/[version]/`
3. That's it — routing, sidebar, and switcher update automatically

### Docs Layout
Layout structure (flex row):
- **Left**: `DocsSidebar` (250px) — starts immediately at navbar bottom, spans full height to footer; no sub-header above it
- **Right column** (flex-1, flex-col):
  - Version switcher bar (h-10, border-b)
  - Scrollable content area (`overflow-y-auto`):
    - Main content (flex-1, max-w-3xl): breadcrumb → title → description → MDX content
    - Right TOC (200px): "On this page" with h2/h3 headings, scroll-spy

### Sidebar Behavior
- Grouped sections with gray-900 font-weight 600 group headings (title case, text-xs — NOT uppercase)
- Group headings are always expand/collapse `<button>` elements — never anchor links
- Groups WITH an `index.mdx` show that page as the first clickable link inside the group
- Groups WITHOUT an `index.mdx` are section dividers only — no link is rendered for the group itself
- Items: 14px, gray-700, 8px vertical padding
- Active item: gray-100 background, gray-900 text, font-weight 500 — no purple border or color
- Hover on inactive: gray-100 background
- Collapsible groups with chevron arrow; group containing the active page starts open
- Scrolls independently from main content
- Mobile: off-canvas drawer triggered by floating "Menu" button

### "On this page" Table of Contents
- Sticky, right side, visible ≥1280px
- "On this page" label: gray-500, text-xs, uppercase
- Items: gray-500, 13px, indented for h3
- Active: gray-900 text, 2px purple left border
- Scroll-spy highlights current heading

## Docs Components

### Code Blocks
- White background, 1px gray-200 border, 8px radius
- Top bar: gray-50 background with language label (left) and copy button (right)
- Language label top-left (e.g., "Python", "shell", "yaml")
- Copy button icon top-right
- **Tabbed code blocks**: for multi-language/platform examples (Python/TypeScript, macOS/Linux/Windows)
- IBM Plex Mono, 14px, horizontal scroll for overflow
- No purple decorative elements

### Callout Boxes
- `<Callout type="info">` — blue-50 bg, blue-500 left border 3px, info circle icon
- `<Callout type="tip">` — green-50 bg, green-500 left border 3px, lightbulb icon
- `<Callout type="warning">` — amber-50 bg, amber-500 left border 3px, alert triangle icon
- 8px radius, 16px padding, full width

### Numbered Step Guides
- Large step number (24px, purple) on the left
- Step title: gray-900, font-weight 600
- Step description below in gray-700
- Code block below when applicable
- Vertical connector line (1px gray-200) between steps

### Navigation Cards
- 2x2 or 2x3 grid
- Each card: icon (gray-500), title (gray-900, font-weight 600), description (gray-500)
- Optional external link arrow top-right
- Standard card styling with hover shadow

## Page: Simulator (`/simulator`)

### Architecture
- `app/simulator/page.tsx` — thin server component (exports metadata), renders `<SimulatorClient />`
- `components/simulator-client.tsx` — full client component with all interactive state

### Layout
Full-width, gray-50 background. Two panels: left config (~40%, max 480px, white bg, border-r) + right results (flex-1, gray-50). Both panels scroll independently (overflow-y-auto). Desktop: side-by-side. Mobile (< lg): stacked vertically.

### Left Panel — Configuration
- Heading + subtitle
- **Load Preset** dropdown: Small Model/Single GPU, Large MoE/Multi-GPU, High Throughput Batch, Low Latency Interactive — auto-fills all form fields
- **Form sections** (each with `pl-4 border-l border-gray-200`): Model & Hardware, Cluster Configuration, Workload
- **Advanced Settings** (collapsible with chevron): Workload Type, Total KV Blocks, Disaggregated Serving toggle, Prefix Caching toggle
- **Toggle switches**: gray-200 off, purple on, white circle thumb
- **Run Simulation** button: `bg-[#7B2D8E]` purple, full width, py-3
- **Saved Simulations** area: appears after first Save, shows count badge + chip list + Compare button (when ≥2 saved)

### Right Panel — Results
Three states:
1. **Empty**: centered chart SVG + gray-400 text
2. **Results** (after Run Simulation):
   - Green "Completed" badge + "Save to Compare" button
   - **Recommended Docs** callout (gray-50 box): contextual links based on routing policy / toggles
   - **Latency** metrics: 4-column grid cards (TTFT row, E2E row, ITL row, Sched Delay)
   - **Throughput**: 3-column (Throughput tok/s, Req/sec, Duration)
   - **Request Statistics**: 4-column × 2 rows (Completed, Injected, Queued, Running, TimedOut, Dropped, LengthCapped, Preemptions)
   - **Token Statistics**: 2 wide cards (Prompt Tokens, Output Tokens)
   - **Deployment Config**: tabbed (values.yaml / kubectl apply) CodeBlock generated from form values, Copy Config button
   - **Export JSON** (downloads JSON blob) + **Reset** buttons
3. **Comparison** (when ≥2 saved + Compare clicked):
   - Two-column layout comparing key metrics (TTFT, E2E, Throughput)
   - Better metric: `text-green-700`; worse: `text-red-600`
   - Config summary at top of each column
   - "← Back to Simulator" button

### Mock Data (BASE_METRICS)
```
TTFT: mean=30.17ms p90=44.76 p95=49.20 p99=53.16
E2E: mean=4677.15ms p90=7370.21 p95=8079.38 p99=10499.43
ITL: mean=8.67ms p90=9.60 p95=9.75 p99=9.88
SchedDelay P99: 7.72ms
Throughput: 3148.8 tok/s | Req/sec: 5.83 | Duration: 17.15s
Completed: 100 | Injected: 100 | all others: 0
Prompt: 54508 | Output: 54017
```

Saved simulations get ±10% random variance applied to numeric metrics via `varyMetrics()`.

### Recommended Docs Logic
- Prefix Cache Aware routing → /docs/production-deployment/inference-scheduling/prefix-cache-scheduling
- Predicted Latency routing → /docs/production-deployment/inference-scheduling/predicted-latency-scheduling
- Disaggregated serving ON → /docs/production-deployment/scheduling-pd
- Prefix caching ON → /docs/core-concepts/tiered-kv-cache
- Always → /docs/getting-started/prerequisites

All static/mock for the prototype — simulation backend connects later.

## Page: Blog (`/blog`)

### Layout
The blog page has two tabs: **Posts** and **Videos**. This keeps the header clean (4 tabs) while giving videos a home.

**Posts tab** (`/blog` default):
- Centered content, max-w-3xl
- Posts grouped by year with year as a section heading (gray-900, font-weight 600)
- Each post:
  - Title: gray-900, text-xl, font-weight 600, links to post (hover purple)
  - Date + reading time: gray-500, text-sm (e.g., "March 13, 2026 · 28 min read")
  - Author row: small circular photos (32px) in a row + names and titles in gray-500 text-sm
  - Description/excerpt: gray-700, 2-3 lines
  - "Read more" link at bottom-right in gray-500 (hover purple)
  - Tags are stored in frontmatter but NOT displayed in the UI
  - Separated by generous whitespace (no divider lines needed)

**Videos tab** (`/blog?tab=videos` or `/blog/videos`):
- Heading: "Learn llm-d" with subtitle "Explore our video collection to learn about llm-d's capabilities, architecture, and best practices."
- 2-column grid of video cards (1 column on mobile)
- Each card: YouTube embed (16:9), title below in gray-900 font-weight 600, description in gray-500, speaker/event info in gray-500 text-sm
- Standard card styling

### Individual Blog Post (`/blog/[slug]`)
- Centered content, max-w-3xl
- "← Back to Blog" link at top, gray-500 text-sm
- Title: gray-900, text-3xl, font-weight 600
- Date + reading time: gray-500
- Author row: photos (40px circles) + name + title/affiliation, in a 2-column grid if multiple authors
- MDX content rendered with same components as docs
- No tags displayed (stored in frontmatter only)

## Page: Community (`/community/*`)

### Architecture
Community has its own mini-layout at `app/community/layout.tsx`:
- Same fixed-height + overflow pattern as docs (`height: calc(100vh - 3.5rem)`)
- Left sidebar: `CommunitySidebar` client component (220px), `components/community-sidebar.tsx`
- Main content: `<main id="docs-main" className="flex-1 overflow-y-auto">` — TOC scans this
- Right TOC: `TableOfContents` (200px, hidden below xl)
- No version switcher bar

**Community sidebar nav items:**
- Welcome to llm-d → /community
- Contributing → /community/contribute
- Upcoming Events → /community/events
- Code of Conduct → /community/code-of-conduct
- Special Interest Groups → /community/sigs
- Security Policy → /community/security

Active item: gray-100 bg, gray-900 text, font-weight 500. Same style as docs.
All content pages use `<article className="max-w-3xl mx-auto px-8 py-10">`.
No emojis anywhere.

### Sub-pages

**`/community`** — Landing/hub page
- Welcome paragraphs from CONTRIBUTING.md
- Quick Start Guide: StepGuide (4 steps: Slack, GitHub, Events page, SIGs page)
- Get Involved: NavCards 2-column (Contributing, Events, SIGs, Code of Conduct, Security, Slack)
- Communication Channels: plain list (Slack, GitHub, Google Groups, Google Drive)
- Connect With Us: social links (LinkedIn, Bluesky, X, Reddit, YouTube)

**`/community/contribute`** — Full CONTRIBUTING.md content
- Source: https://github.com/llm-d/llm-d/blob/main/CONTRIBUTING.md
- Sections: How You Can Contribute, Community and Communication, Contributing Process (Features/Fixes), Feature Testing (with CodeBlock for bash/yaml), Code Review, Commit Style, Code Organization, Experimental Features, API Changes, Testing Requirements, Project Structure

**`/community/events`** — Upcoming Events
- Source: content/community/events.md from existing site
- Regular Meetings section (Weekly Standup Wed 12:30 ET, SIG Meetings)
- Google Calendar iframe embed
- Upcoming Conferences: structured cards with sessions (PyTorch EU 2026, Google Cloud Next 2026)

**`/community/sigs`** — Special Interest Groups
- Source: https://github.com/llm-d/llm-d/blob/main/SIGS.md
- Overview NavCards (3-column grid, 8 SIGs)
- Active SIGs table: SIG name (purple link to anchor), Focus Area, Documentation links
- SIG Details: h3 sections for each SIG with leadership, charter, key areas, communication
- Getting Involved, SIG Communication, Formation/Evolution sections

**`/community/code-of-conduct`** — Code of Conduct
- Source: https://github.com/llm-d/llm-d/blob/main/CODE_OF_CONDUCT.md
- Pledge, Standards (positive/negative examples), Responsibilities, Scope, Attribution

**`/community/security`** — Security Policy
- Source: https://github.com/llm-d/llm-d/blob/main/SECURITY.md
- Security Announcements, Report a Vulnerability (Callout warning with email), When to/not to report, Response process, Public Disclosure Timing

### Real URLs used
- Slack: https://llm-d.ai/slack
- GitHub repo: https://github.com/llm-d/llm-d
- GitHub org: https://github.com/llm-d
- Calendar: https://red.ht/llm-d-public-calendar
- Google Groups: https://groups.google.com/g/llm-d-contributors
- Google Drive (public): https://drive.google.com/drive/folders/1cN2YQiAZFJD_cb1ivlyukuNwecnin6lZ
- Security email: llm-d-security-reporting@googlegroups.com
- Security Announcements: https://groups.google.com/u/1/g/llm-d-security-announce
- LinkedIn: https://www.linkedin.com/company/llm-d/
- Bluesky: https://bsky.app/profile/llm-d.ai
- X (Twitter): https://x.com/_llm_d_
- Reddit: https://www.reddit.com/r/llm_d/
- YouTube: https://www.youtube.com/@llm-d-project

## File Structure
```
llm-d/website/
├── CLAUDE.md
├── CONTRIBUTING.md              # content contribution guide
├── app/
│   ├── layout.tsx               # root layout: font, AnnouncementBar, Navbar, Footer
│   ├── page.tsx                 # landing page
│   ├── docs/
│   │   ├── layout.tsx           # docs layout: sidebar + content + TOC
│   │   └── [[...slug]]/
│   │       └── page.tsx         # dynamic docs renderer
│   ├── blog/
│   │   ├── page.tsx             # blog index (Posts + Videos tabs)
│   │   └── [slug]/
│   │       └── page.tsx         # individual blog post
│   ├── simulator/
│   │   └── page.tsx             # inference simulator
│   ├── community/
│   │   ├── layout.tsx           # community layout: left sidebar + content + TOC
│   │   ├── page.tsx             # community landing (hub)
│   │   ├── contribute/page.tsx  # contributing guidelines
│   │   ├── events/page.tsx      # upcoming events + calendar embed
│   │   ├── sigs/page.tsx        # special interest groups
│   │   ├── code-of-conduct/page.tsx
│   │   └── security/page.tsx   # security policy
│   └── not-found.tsx            # 404 page
├── components/
│   ├── announcement-bar.tsx     # dismissible top banner
│   ├── navbar.tsx               # persistent header
│   ├── footer.tsx               # site footer
│   ├── docs-sidebar.tsx         # auto-generated docs sidebar
│   ├── table-of-contents.tsx    # "On this page" right-side TOC
│   ├── card.tsx                 # base card component
│   ├── nav-card.tsx             # icon + title + description navigation card
│   ├── callout.tsx              # info/tip/warning callout boxes
│   ├── code-block.tsx           # code block with copy + language tabs
│   ├── step-guide.tsx           # numbered step component
│   ├── video-embed.tsx          # YouTube embed wrapper
│   ├── mdx-components.tsx       # MDX renderers
│   ├── community-sidebar.tsx    # community sub-nav sidebar (client component)
│   ├── simulator-client.tsx     # full simulator UI (client component)
│   └── ui/                      # small shared primitives
├── content/
│   ├── docs/
│   │   ├── getting-started/
│   │   │   ├── index.mdx                # Architecture Overview (landing)
│   │   │   ├── prerequisites.mdx
│   │   │   └── quickstart/
│   │   │       ├── gateway-free.mdx
│   │   │       └── gateway-backed.mdx
│   │   ├── core-concepts/
│   │   │   ├── inference-gateway.mdx
│   │   │   ├── disaggregated-serving.mdx
│   │   │   ├── autoscaling.mdx
│   │   │   ├── tiered-kv-cache.mdx
│   │   │   ├── latency-predictor.mdx
│   │   │   └── sync-async-processing.mdx
│   │   ├── development-guides/
│   │   │   └── accelerator-simulation.mdx
│   │   ├── production-deployment/
│   │   │   ├── inference-scheduling.mdx
│   │   │   ├── prefix-cache-scheduling.mdx
│   │   │   ├── predicted-latency-scheduling.mdx
│   │   │   ├── scheduling-tiered-cache.mdx
│   │   │   ├── scheduling-pd.mdx
│   │   │   ├── scheduling-wide-ep.mdx
│   │   │   ├── admission-flow-control.mdx
│   │   │   ├── async-processing.mdx
│   │   │   └── model-server-autoscaling.mdx
│   │   ├── observability/
│   │   │   ├── monitoring-metrics-tracing.mdx
│   │   │   ├── troubleshooting.mdx
│   │   │   └── infrastructure.mdx
│   │   ├── benchmarking/
│   │   │   ├── methodology.mdx
│   │   │   └── benchmark-results.mdx
│   │   └── references/
│   │       ├── component-versions.mdx
│   │       ├── upstream-versions.mdx
│   │       ├── accelerator-support-matrix.mdx
│   │       └── helm-chart-values.mdx
│   ├── blog/
│   │   ├── llm-d-announce.mdx
│   │   ├── llm-d-press-release.mdx
│   │   ├── llm-d-week-1-round-up.mdx
│   │   ├── llm-d-community-update-june-2025.mdx
│   │   ├── llm-d-v0.2-our-first-well-lit-paths.mdx
│   │   ├── intelligent-inference-scheduling-with-llm-d.mdx
│   │   ├── kvcache-wins-you-can-see.mdx
│   │   ├── llm-d-v0.3-expanded-hardware-faster-perf-and-igw-ga.mdx
│   │   ├── llm-d-v0.4-achieve-sota-inference-across-accelerators.mdx
│   │   ├── llm-d-v0.5-sustaining-performance-at-scale.mdx
│   │   ├── native-kv-cache-offloading-to-any-file-system-with-llm-d.mdx
│   │   └── predicted-latency-based-scheduling-for-llms.mdx
│   └── videos.yaml
├── lib/
│   ├── mdx.ts
│   ├── docs.ts
│   ├── blog.ts        # getAllPosts(), getPostBySlug() — reads content/blog/*.mdx
│   └── videos.ts      # getAllVideos() — reads content/videos.yaml via js-yaml
├── public/
│   └── img/
│       ├── llm-d-icon.png               # small icon only — used in navbar at 32px height
│       ├── llm-d-logotype-and-icon.png  # full logo (hexagon icon + wordmark) — used on landing page at ~280px wide
│       └── authors/             # author headshots for blog
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── package.json
```

## Content Contribution (for engineers and AI agents)

### How to Add a Doc Page
1. Create an `.mdx` file at the right path under `content/docs/`
2. The file path determines the URL: `content/docs/getting-started/prerequisites.mdx` → `/docs/getting-started/prerequisites`
3. Add the required frontmatter (see below)
4. Write content in standard markdown (with optional MDX components)
5. Open a PR — the preview deployment shows the rendered page

No other files need to be edited. No sidebar config, no routing table, no manifest.

### Required Frontmatter for Docs
```yaml
---
title: "Page Title"                    # required
description: "One-line SEO summary"    # required
sidebar_order: 1                       # required: position within its group (lower = higher)
sidebar_group: "Components"            # optional: override group name
sidebar_icon: "cpu"                    # optional: Lucide icon name
---
```

### Required Frontmatter for Blog Posts
```yaml
---
title: "Post Title"                    # required
description: "Short summary"           # required
date: "2026-02-15"                     # required: ISO date
authors:                               # required
  - name: "Kaushik Mitra"
    title: "Software Engineer, Google"
    avatar: "/img/authors/kaushik.jpg" # optional
tags: ["release", "performance"]       # optional
readingTime: "28 min read"             # optional
---
```

### How to Add a Blog Post
1. Create an `.mdx` file under `content/blog/` — the filename becomes the slug
2. Add required frontmatter (see above)
3. Write content in standard markdown (MDX components like `<Callout>` work here too)
4. Author avatars go in `public/img/authors/` — reference as `"/img/authors/name.jpg"`
5. No other files need to be edited — `lib/blog.ts` auto-discovers all posts

**Blog data layer:**
- `lib/blog.ts` — `getAllPosts()` returns all posts sorted by date desc; `getPostBySlug(slug)` returns `{ post, source }` for rendering
- `lib/videos.ts` — `getAllVideos()` reads `content/videos.yaml` via `js-yaml`
- `components/blog-page-client.tsx` — client component with Posts/Videos tab state
- `app/blog/[slug]/page.tsx` — server component; uses `MDXRemote` with same `mdxComponents` as docs

### How to Add a Video
Add an entry to `content/videos.yaml`:
```yaml
- title: "Kubernetes Native Distributed Inferencing"
  description: "Introduction to llm-d at DevConf.US 2025"
  youtubeId: "32MqYC3OydE"
  date: "2025-09-19"
  speaker: "Rob Shaw (Red Hat)"
  event: "DevConf.US 2025"
  tags: ["overview", "conference"]
```

### Sidebar Auto-Generation Rules
- Built by scanning `content/docs/` at build time
- Folders become groups; folder name is titlecased for the heading
- `index.mdx` in a folder becomes that group's landing page
- Files sorted by `sidebar_order` within their group
- Groups sorted by the lowest `sidebar_order` of their children
- No manual config — the file tree IS the sidebar

### Available MDX Components
Engineers can use these in any .mdx file without importing:
- `<Callout type="info|tip|warning">` — colored callout boxes
- `<CodeTabs labels="Python,TypeScript">` — tabbed code blocks (comma-separated string; array literals don't survive RSC serialization)
- `<StepGuide>` + `<Step number={1} title="...">` — numbered sequences
- `<NavCards>` + `<NavCard title="..." href="..." icon="...">` — card grids

### CI Validation (for PRs)
A GitHub Action on every PR touching `content/`:
- Validates frontmatter has required fields
- Checks sidebar_order doesn't conflict
- Validates internal links
- Runs markdown lint
- Builds the site to catch rendering errors

Enables AI agents to self-correct: submit PR → CI fails → read error → fix → push.

## Things to NEVER Do
- Do not use dark mode or dark backgrounds
- Do not use gradients or decorative overlays (no hexagon backgrounds)
- Do not use purple for backgrounds, section fills, or decorative blocks
- Do not use any font other than IBM Plex Sans / IBM Plex Mono
- Do not add animations beyond subtle hover states (opacity, shadow, border-color)
- Do not use hero images, stock photography, or illustrations
- Do not use emoji in navigation, headings, or UI elements
- Do not install UI component libraries (no shadcn, no MUI, no Chakra, no Radix)
- Do not add a search bar in the prototype
- Do not create manual sidebar config files
- Do not require engineers to edit anything outside content/ to add docs or blog posts
- Do not over-engineer — this is a prototype demonstrating the vision
