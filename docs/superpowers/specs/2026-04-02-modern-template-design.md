# Modern Template Design Spec

**Date**: 2026-04-02
**Template name**: `modern`
**Inspiration**: Vite docs (v7.vite.dev)

## Overview

A Vite-inspired documentation template for Specra. Dark-first with light mode support, flat bordered sidebar, gradient hero homepage, and multi-product content showcase. Targets developer tool documentation with a clean, spacious, modern aesthetic.

## Architecture

### Approach

Custom sidebar component inside the template. The template imports `buildSidebarStructure`, `sortSidebarGroups`, `sortSidebarItems`, and `SidebarGroup` type from `specra` and renders its own `ModernSidebar.svelte`. No SDK changes required — all data utilities are already exported.

The docs page layout reuses Specra's `DocLayout`/`MobileDocLayout` but replaces the sidebar slot with the custom component. Route files (`+page.server.ts`, `+layout.server.ts`) follow the same patterns as the minimal template.

### Key Difference from Other Templates

| Template | Homepage | Theme | Sidebar | Products |
|----------|----------|-------|---------|----------|
| minimal | Marketing hero + features + CTA + community | system | Collapsible folders | No |
| book-docs | Redirect to docs | dark-only | Flush collapsible | No |
| jbrains-docs | Redirect to docs | light-only | Flush, no TOC | No |
| **modern** | **Vite-style hero + feature grid** | **dark default, light supported** | **Flat bordered groups, no collapse** | **Yes (2 products)** |

## Homepage (`+page.svelte`)

Vite-style landing page at `/`:

### Top Nav Bar
- Sticky, dark background, thin bottom border
- Left: logo + "Modern Docs" text
- Center-right: nav links (Guide, API, Config)
- Far right: theme toggle + GitHub icon

### Hero Section
- Large gradient headline (purple-to-blue gradient text)
- Subtitle in muted gray, 1-2 lines
- Two CTA buttons: "Get Started" (filled purple), "View on GitHub" (outlined)
- Generous vertical padding

### Feature Grid
- 3-column grid below hero
- Each card: icon + title + short description
- No card borders, subtle text hierarchy
- Muted background section

### Footer
- Minimal: copyright + links row

## Docs Page Layout

Three-column: custom sidebar left, content center, TOC right.

### Custom `ModernSidebar.svelte`

Located at `src/lib/components/ModernSidebar.svelte`.

**Data flow**:
1. Receives `docs` array, `version`, `product`, `config` as props
2. Calls `buildSidebarStructure(docs)` to get `{ rootGroups, standalone }`
3. Calls `sortSidebarGroups(rootGroups)` for ordering
4. Renders flat list with group separators

**Visual style**:
- Section group labels: bold text, no background
- Thin border-bottom separator after each group's items
- No collapsible chevrons — groups always open (flat navigation)
- Active link: purple left border + purple text color
- Font size: ~13px, muted gray text, generous line spacing
- No icons next to items (text-only)
- Sidebar persists collapsed state in localStorage (uses same `specra-sidebar-collapsed` key)

### TOC (Right Side)
- "ON THIS PAGE" label in small caps, muted
- Uses existing Specra `TableOfContents` component
- Styled via CSS to match the modern aesthetic

### Docs Page Integration

The `docs/[version]/[...slug]/+page.svelte` (and the product variant) does **not** use `MobileDocLayout` because that component hardcodes `SidebarMenuItems` and `Sidebar` internally with no sidebar snippet slot.

Instead, the modern template builds its own page layout in `+page.svelte` that:
1. Imports `ModernSidebar` for the desktop sidebar
2. Imports `DocLayout`, `TableOfContents`, `Header`, `Footer`, `MdxContent`, `SiteBanner` from `specra/components` for content rendering
3. Imports `sidebarStore` from `specra/stores` for mobile sidebar toggle
4. Composes a three-column layout (sidebar, content, TOC) directly

This keeps the template self-contained with no SDK changes. The mobile sidebar overlay uses the same `ModernSidebar` component in a slide-out drawer.

### Content Area
- Prose styling inherited from Specra
- Horizontal rules as section dividers between major headings

## Color Scheme

### Dark Mode (default)

Maps to Specra CSS variables in `app.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#1b1b1f` | Main background |
| `--sidebar-bg` | `#161618` | Sidebar/nav background |
| `--card` | `#232326` | Surface/card |
| `--border` | `#2e2e32` | Borders |
| `--foreground` | `#ffffffde` | Primary text |
| `--muted-foreground` | `#ababab` | Secondary text |
| `--primary` | `#bd34fe` | Purple accent |
| `--primary-gradient-end` | `#646cff` | Blue gradient end |

### Light Mode

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#ffffff` | Main background |
| `--sidebar-bg` | `#f6f6f7` | Sidebar/nav background |
| `--card` | `#f9f9f9` | Surface/card |
| `--border` | `#e2e2e3` | Borders |
| `--foreground` | `#1b1b1f` | Primary text |
| `--muted-foreground` | `#616161` | Secondary text |
| `--primary` | `#bd34fe` | Purple accent (same) |
| `--primary-gradient-end` | `#646cff` | Blue gradient end (same) |

## Content Structure

### Product 1: "Platform" (default product)

Two versions: `v1.0.0` and `v2.0.0`.

```
docs/platform/v1.0.0/
├── introduction/
│   ├── _category_.json         # position: 1
│   ├── getting-started.mdx
│   ├── why-platform.mdx
│   └── philosophy.mdx
├── guide/
│   ├── _category_.json         # position: 2
│   ├── features.mdx
│   ├── configuration.mdx
│   ├── plugins.mdx
│   ├── building-for-production.mdx
│   └── deployment.mdx
└── api/
    ├── _category_.json         # position: 3
    ├── index.mdx               # <ApiReference> with users-api.json
    └── manual-endpoints.mdx    # Manual ApiEndpoint/ApiParams/ApiResponse
```

`v2.0.0` mirrors the same structure.

### Product 2: "CLI"

One version: `v1.0.0`.

```
docs/cli/v1.0.0/
├── getting-started/
│   ├── _category_.json         # position: 1
│   ├── installation.mdx
│   └── quick-start.mdx
├── commands/
│   ├── _category_.json         # position: 2
│   ├── init.mdx
│   ├── build.mdx
│   ├── dev.mdx
│   └── deploy.mdx
└── configuration/
    ├── _category_.json         # position: 3
    └── config-reference.mdx
```

### Static Assets

Reuse existing API spec files from `static/api-specs/`:
- `users-api.json`
- `openapi-example.json`
- `postman-example.json`
- `test-api.json`

## specra.config.json

Key settings:

```json
{
  "site": {
    "title": "Modern Docs",
    "activeVersion": "v1.0.0"
  },
  "theme": {
    "defaultMode": "dark",
    "respectPrefersColorScheme": true
  },
  "navigation": {
    "showSidebar": true,
    "collapsibleSidebar": false,
    "showBreadcrumbs": true,
    "showTableOfContents": true,
    "tocPosition": "right",
    "tocMaxDepth": 3
  },
  "products": [
    { "id": "platform", "label": "Platform", "default": true },
    { "id": "cli", "label": "CLI" }
  ],
  "features": {
    "versioning": true
  }
}
```

No tab groups — the flat bordered sidebar replaces that navigation pattern.

## File Structure

```
templates/modern/
├── package.json
├── specra.config.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
├── gitignore
├── .env.sample
├── static/
│   └── api-specs/
│       ├── users-api.json
│       ├── openapi-example.json
│       ├── postman-example.json
│       └── test-api.json
├── src/
│   ├── app.html
│   ├── app.css
│   ├── lib/
│   │   └── components/
│   │       ├── ModernSidebar.svelte    # custom flat bordered sidebar
│   │       └── ModernDocsPage.svelte   # shared docs page layout (sidebar + content + TOC)
│   ├── params/
│   │   └── product.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.server.ts
│       ├── +page.svelte
│       ├── +page.server.ts
│       ├── +error.svelte
│       └── docs/
│           ├── [version]/
│           │   ├── +layout.server.ts
│           │   ├── +page.server.ts
│           │   └── [...slug]/
│           │       ├── +page.server.ts
│           │       └── +page.svelte
│           └── [product=product]/
│               └── [version]/
│                   ├── +layout.server.ts
│                   ├── +page.server.ts
│                   └── [...slug]/
│                       ├── +page.server.ts
│                       └── +page.svelte
└── docs/
    ├── platform/
    │   ├── v1.0.0/
    │   └── v2.0.0/
    └── cli/
        └── v1.0.0/
```

## CLI Registration

Add to `src/cli.ts` choices array:

```typescript
{ title: 'Modern', value: 'modern', description: 'Vite-inspired dark theme with flat sidebar and multi-product support' }
```

## Out of Scope

- No SDK changes (all utilities already exported)
- No search integration (matches other templates)
- No i18n content
- No custom fonts (uses system font stack)
