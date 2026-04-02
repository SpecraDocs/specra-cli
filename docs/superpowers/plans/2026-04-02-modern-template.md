# Modern Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Vite-inspired "modern" documentation template with flat bordered sidebar, gradient hero homepage, dark-first theming, and multi-product content.

**Architecture:** Custom sidebar component (`ModernSidebar.svelte`) imports `buildSidebarStructure`/`sortSidebarGroups`/`sortSidebarItems` from `specra` to render a flat, bordered sidebar. A shared `ModernDocsPage.svelte` composes the three-column layout (sidebar, content, TOC) without using `MobileDocLayout`. Route files reuse patterns from the minimal template.

**Tech Stack:** SvelteKit, Specra SDK, Tailwind CSS 4, TypeScript

---

### Task 1: Scaffold Template Config and Build Files

**Files:**
- Create: `templates/modern/package.json`
- Create: `templates/modern/specra.config.json`
- Create: `templates/modern/svelte.config.js`
- Create: `templates/modern/tsconfig.json`
- Create: `templates/modern/vite.config.ts`
- Create: `templates/modern/postcss.config.mjs`
- Create: `templates/modern/gitignore`
- Create: `templates/modern/.env.sample`
- Create: `templates/modern/src/app.html`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "my-docs",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "dependencies": {
    "lucide-svelte": "^0.454.0",
    "specra": "^0.2.4"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^6.0.0",
    "@tailwindcss/postcss": "^4.1.9",
    "@tailwindcss/typography": "^0.5.19",
    "postcss": "^8.5",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^4.1.9",
    "typescript": "^5",
    "vite": "^6.3.0"
  }
}
```

- [ ] **Step 2: Create `specra.config.json`**

```json
{
  "$schema": "./node_modules/specra/config/specra.config.schema.json",
  "site": {
    "title": "Modern Docs",
    "description": "Next-generation documentation platform",
    "url": "http://localhost:5173",
    "baseUrl": "/",
    "language": "en",
    "organizationName": "my-org",
    "projectName": "my-project",
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
  "social": {
    "github": "https://github.com/your-org/your-repo"
  },
  "search": {
    "enabled": false
  },
  "footer": {
    "copyright": "Copyright © 2025 Modern Docs. All rights reserved.",
    "links": [
      {
        "title": "Documentation",
        "items": [
          { "label": "Getting Started", "href": "/docs/platform/v1.0.0/introduction/getting-started" }
        ]
      },
      {
        "title": "Community",
        "items": [
          { "label": "GitHub", "href": "https://github.com/your-org/your-repo" }
        ]
      }
    ]
  },
  "banner": {
    "enabled": false,
    "message": "This is a development build.",
    "type": "info",
    "dismissible": true
  },
  "features": {
    "showLastUpdated": true,
    "showReadingTime": true,
    "showAuthors": false,
    "showTags": true,
    "versioning": true,
    "i18n": false
  }
}
```

- [ ] **Step 3: Create build config files**

Copy these exactly from the minimal template (identical content):

`svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-static';
import { specraConfig } from 'specra/svelte-config';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = specraConfig({
  vitePreprocess: { vitePreprocess },
  kit: {
    adapter: adapter(),
    prerender: { handleHttpError: 'warn', handleMissingId: 'warn', handleUnseenRoutes: 'warn' }
  }
});

export default config;
```

`tsconfig.json`:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

`vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});
```

`postcss.config.mjs`:
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

`gitignore`:
```
node_modules
.svelte-kit
build
.env
```

`.env.sample`:
```
SPECTRA_TOKEN=sk_xxx...
```

- [ ] **Step 4: Create `src/app.html`**

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.svg" type="image/svg+xml" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover" class="font-sans antialiased">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

No Google Fonts — uses system font stack for the modern/minimal feel.

- [ ] **Step 5: Commit**

```bash
git add templates/modern/package.json templates/modern/specra.config.json templates/modern/svelte.config.js templates/modern/tsconfig.json templates/modern/vite.config.ts templates/modern/postcss.config.mjs templates/modern/gitignore templates/modern/.env.sample templates/modern/src/app.html
git commit -m "feat(modern): scaffold template config and build files"
```

---

### Task 2: Create app.css with Vite-Inspired Theming

**Files:**
- Create: `templates/modern/src/app.css`

- [ ] **Step 1: Create `src/app.css` with dark and light mode CSS variables**

```css
@import "specra/styles";
@source "./**/*.{js,ts,svelte}";

@theme inline {
    --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    --font-mono: "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
}

/* ─── Vite-Inspired Dark Theme (default) ─── */
.dark {
  --background: #1b1b1f;
  --foreground: rgba(255, 255, 255, 0.87);
  --card: #232326;
  --card-foreground: rgba(255, 255, 255, 0.87);
  --popover: #232326;
  --popover-foreground: rgba(255, 255, 255, 0.87);
  --primary: #bd34fe;
  --primary-foreground: #ffffff;
  --secondary: #2e2e32;
  --secondary-foreground: rgba(255, 255, 255, 0.87);
  --muted: #232326;
  --muted-foreground: #ababab;
  --accent: #2e2e32;
  --accent-foreground: rgba(255, 255, 255, 0.87);
  --destructive: #e5484d;
  --destructive-foreground: #ffffff;
  --border: #2e2e32;
  --input: #2e2e32;
  --ring: #bd34fe;
  --sidebar-background: #161618;
  --sidebar-foreground: #ababab;
  --sidebar-border: #2e2e32;
}

/* ─── Vite-Inspired Light Theme ─── */
:root {
  --background: #ffffff;
  --foreground: #1b1b1f;
  --card: #f9f9f9;
  --card-foreground: #1b1b1f;
  --popover: #ffffff;
  --popover-foreground: #1b1b1f;
  --primary: #bd34fe;
  --primary-foreground: #ffffff;
  --secondary: #f6f6f7;
  --secondary-foreground: #1b1b1f;
  --muted: #f6f6f7;
  --muted-foreground: #616161;
  --accent: #f6f6f7;
  --accent-foreground: #1b1b1f;
  --destructive: #e5484d;
  --destructive-foreground: #ffffff;
  --border: #e2e2e3;
  --input: #e2e2e3;
  --ring: #bd34fe;
  --sidebar-background: #f6f6f7;
  --sidebar-foreground: #616161;
  --sidebar-border: #e2e2e3;
}
```

- [ ] **Step 2: Commit**

```bash
git add templates/modern/src/app.css
git commit -m "feat(modern): add Vite-inspired dark/light CSS variables"
```

---

### Task 3: Create ModernSidebar Component

**Files:**
- Create: `templates/modern/src/lib/components/ModernSidebar.svelte`

- [ ] **Step 1: Create `ModernSidebar.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { buildSidebarStructure, sortSidebarGroups, sortSidebarItems } from 'specra';
  import type { SpecraConfig } from 'specra';

  interface DocItem {
    title: string;
    slug: string;
    filePath: string;
    section?: string;
    group?: string;
    sidebar?: string;
    sidebar_position?: number;
    categoryLabel?: string;
    categoryPosition?: number;
    categoryCollapsible?: boolean;
    categoryCollapsed?: boolean;
    categoryIcon?: string;
    categoryTabGroup?: string;
    meta?: {
      icon?: string;
      tab_group?: string;
      sidebar_position?: number;
      order?: number;
      [key: string]: any;
    };
  }

  interface Props {
    docs: DocItem[];
    version: string;
    product?: string;
    config: SpecraConfig;
    onLinkClick?: () => void;
  }

  let { docs = [], version, product, config, onLinkClick }: Props = $props();

  let docsBase = $derived(
    product && product !== '_default_'
      ? `/docs/${product}/${version}`
      : `/docs/${version}`
  );

  let pathname = $derived($page.url.pathname.replace(/\/$/, ''));

  let structure = $derived.by(() => {
    return buildSidebarStructure(docs);
  });

  let sortedGroups = $derived(sortSidebarGroups(structure.rootGroups));
  let sortedStandalone = $derived(sortSidebarItems(structure.standalone));

  function isActive(slug: string): boolean {
    return pathname === `${docsBase}/${slug}`;
  }

  function isActiveInGroup(group: any): boolean {
    const hasActiveItem = group.items.some(
      (doc: any) => pathname === `${docsBase}/${doc.slug}`
    );
    if (hasActiveItem) return true;
    return Object.values(group.children).some((child: any) => isActiveInGroup(child));
  }
</script>

<nav class="modern-sidebar">
  <!-- Standalone items -->
  {#if sortedStandalone.length > 0}
    <div class="sidebar-group">
      {#each sortedStandalone as doc}
        <a
          href="{docsBase}/{doc.slug}"
          class="sidebar-link"
          class:active={isActive(doc.slug)}
          onclick={() => onLinkClick?.()}
        >
          {doc.meta?.title || doc.title}
        </a>
      {/each}
    </div>
  {/if}

  <!-- Groups -->
  {#each sortedGroups as [key, group], groupIndex}
    <div class="sidebar-group" class:has-border={groupIndex < sortedGroups.length - 1 || sortedStandalone.length > 0}>
      <h3 class="sidebar-group-label">{group.label}</h3>

      {#each sortSidebarItems(group.items) as doc}
        <a
          href="{docsBase}/{doc.slug}"
          class="sidebar-link"
          class:active={isActive(doc.slug)}
          onclick={() => onLinkClick?.()}
        >
          {doc.meta?.title || doc.title}
        </a>
      {/each}

      <!-- Nested children (sub-groups) -->
      {#each sortSidebarGroups(group.children) as [childKey, childGroup]}
        <h4 class="sidebar-subgroup-label">{childGroup.label}</h4>
        {#each sortSidebarItems(childGroup.items) as doc}
          <a
            href="{docsBase}/{doc.slug}"
            class="sidebar-link nested"
            class:active={isActive(doc.slug)}
            onclick={() => onLinkClick?.()}
          >
            {doc.meta?.title || doc.title}
          </a>
        {/each}
      {/each}
    </div>
  {/each}
</nav>

<style>
  .modern-sidebar {
    padding: 1rem 0;
    font-size: 0.8125rem;
    line-height: 1.75;
  }

  .sidebar-group {
    padding: 0.5rem 0;
  }

  .sidebar-group.has-border {
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.25rem;
  }

  .sidebar-group-label {
    padding: 0.25rem 1.5rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--foreground);
    text-transform: none;
    letter-spacing: 0;
    margin: 0;
  }

  .sidebar-subgroup-label {
    padding: 0.5rem 1.5rem 0.125rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .sidebar-link {
    display: block;
    padding: 0.25rem 1.5rem;
    color: var(--sidebar-foreground);
    text-decoration: none;
    transition: color 0.15s;
    border-left: 2px solid transparent;
  }

  .sidebar-link:hover {
    color: var(--foreground);
  }

  .sidebar-link.active {
    color: var(--primary);
    border-left-color: var(--primary);
    font-weight: 500;
  }

  .sidebar-link.nested {
    padding-left: 2rem;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add templates/modern/src/lib/components/ModernSidebar.svelte
git commit -m "feat(modern): add custom flat bordered sidebar component"
```

---

### Task 4: Create ModernDocsPage Shared Layout Component

**Files:**
- Create: `templates/modern/src/lib/components/ModernDocsPage.svelte`

- [ ] **Step 1: Create `ModernDocsPage.svelte`**

This is the shared three-column layout used by both `[version]/[...slug]/+page.svelte` and `[product=product]/[version]/[...slug]/+page.svelte`.

```svelte
<script lang="ts">
  import {
    TableOfContents,
    Header,
    Footer,
    DocLayout,
    CategoryIndex,
    HotReloadIndicator,
    DevModeBadge,
    MdxHotReload,
    MdxContent,
    NotFoundContent,
    SearchHighlight,
    SiteBanner,
    mdxComponents,
  } from 'specra/components';
  import { sidebarStore } from 'specra/stores';
  import ModernSidebar from './ModernSidebar.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    data: any;
  }

  let { data }: Props = $props();

  let allDocsCompat: any[] = $derived(data.allDocs);
  let previousDoc = $derived(data.previous ?? undefined);
  let nextDoc = $derived(data.next ?? undefined);
  let categoryTitle = $derived(data.categoryTitle ?? undefined);
  let categoryDescription = $derived(data.categoryDescription ?? undefined);
  let sidebarOpen = $derived($sidebarStore);

  function closeSidebar() {
    sidebarStore.close();
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <Header
    currentVersion={data.version}
    versions={data.versions}
    versionsMeta={data.versionsMeta}
    versionBanner={data.versionBanner}
    config={data.config}
    products={data.products}
  />

  <SiteBanner config={data.config} />

  <!-- Mobile Sidebar Overlay -->
  {#if sidebarOpen}
    <div
      class="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
      onclick={() => sidebarStore.close()}
      onkeydown={(e) => { if (e.key === 'Escape') sidebarStore.close(); }}
      role="button"
      tabindex="-1"
      aria-label="Close sidebar"
    ></div>
  {/if}

  <!-- Mobile Sidebar Drawer -->
  <div
    class="lg:hidden fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    style="background: var(--sidebar-background);"
  >
    <div class="flex flex-col h-full border-r" style="border-color: var(--sidebar-border);">
      <div class="shrink-0 px-4 py-4 border-b" style="border-color: var(--sidebar-border);">
        <a href="/" class="font-semibold text-foreground">
          {data.config.site?.title || 'Documentation'}
        </a>
      </div>
      <div class="flex-1 overflow-y-auto">
        <ModernSidebar
          docs={allDocsCompat}
          version={data.version}
          product={data.product}
          config={data.config}
          onLinkClick={closeSidebar}
        />
      </div>
    </div>
  </div>

  <!-- Main Layout -->
  <div class="flex">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r"
      style="background: var(--sidebar-background); border-color: var(--sidebar-border);"
    >
      <ModernSidebar
        docs={allDocsCompat}
        version={data.version}
        product={data.product}
        config={data.config}
      />
    </aside>

    <!-- Content + TOC -->
    <main class="flex-1 min-w-0 px-4 md:px-8 py-8">
      <div class="flex max-w-6xl mx-auto">
        <div class="flex-1 min-w-0">
          {#if !data.doc && data.isCategory}
            <CategoryIndex
              categoryPath={data.slug}
              version={data.version}
              product={data.product}
              allDocs={allDocsCompat}
              title={categoryTitle}
              description={categoryDescription}
              config={data.config}
            />
          {:else if data.isNotFound}
            <NotFoundContent version={data.version} />
          {:else if data.doc}
            {#if data.isCategory}
              {@const categoryContent = () => {}}
              <CategoryIndex
                categoryPath={data.slug}
                version={data.version}
                product={data.product}
                allDocs={allDocsCompat}
                title={data.doc.meta.title}
                description={data.doc.meta.description}
                config={data.config}
              />
            {:else}
              <SearchHighlight />
              <DocLayout
                meta={data.doc.meta}
                previousDoc={previousDoc}
                nextDoc={nextDoc}
                version={data.version}
                slug={data.slug}
                product={data.product}
                config={data.config}
              >
                {#if data.doc.contentNodes}
                  <MdxContent nodes={data.doc.contentNodes} components={mdxComponents} />
                {:else}
                  {@html data.doc.content}
                {/if}
              </DocLayout>
            {/if}
          {/if}

          <Footer config={data.config} />
        </div>

        <!-- TOC -->
        {#if data.doc && !data.isCategory && data.config.navigation?.showTableOfContents}
          <div class="hidden xl:block w-56 shrink-0 ml-8">
            <div class="sticky top-8">
              <TableOfContents items={data.toc} config={data.config} />
            </div>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>

<MdxHotReload />
<HotReloadIndicator />
<DevModeBadge />
```

- [ ] **Step 2: Commit**

```bash
git add templates/modern/src/lib/components/ModernDocsPage.svelte
git commit -m "feat(modern): add shared docs page layout with custom sidebar"
```

---

### Task 5: Create Route Files

**Files:**
- Create: `templates/modern/src/routes/+layout.svelte`
- Create: `templates/modern/src/routes/+layout.server.ts`
- Create: `templates/modern/src/routes/+page.server.ts`
- Create: `templates/modern/src/routes/+error.svelte`
- Create: `templates/modern/src/params/product.ts`
- Create: `templates/modern/src/routes/docs/[version]/+layout.server.ts`
- Create: `templates/modern/src/routes/docs/[version]/+page.server.ts`
- Create: `templates/modern/src/routes/docs/[version]/[...slug]/+page.server.ts`
- Create: `templates/modern/src/routes/docs/[version]/[...slug]/+page.svelte`
- Create: `templates/modern/src/routes/docs/[product=product]/[version]/+layout.server.ts`
- Create: `templates/modern/src/routes/docs/[product=product]/[version]/+page.server.ts`
- Create: `templates/modern/src/routes/docs/[product=product]/[version]/[...slug]/+page.server.ts`
- Create: `templates/modern/src/routes/docs/[product=product]/[version]/[...slug]/+page.svelte`

- [ ] **Step 1: Create root layout files**

`src/routes/+layout.server.ts` (identical to minimal):
```typescript
import { getConfig, initConfig } from 'specra';
import specraConfig from '../../specra.config.json';
import type { LayoutServerLoad } from './$types';
import type { SpecraConfig } from 'specra';

initConfig(specraConfig as unknown as Partial<SpecraConfig>);

export const prerender = true;
export const trailingSlash = 'never';

export const load: LayoutServerLoad = async () => {
  const config = getConfig();
  return { config };
};
```

`src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import '../app.css';
  import { LayoutProviders } from 'specra/components';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
  <title>{data?.config?.site?.title || 'Documentation'}</title>
  <meta name="description" content={data?.config?.site?.description || 'Modern documentation platform'} />
</svelte:head>

{#if data?.config}
  <LayoutProviders config={data.config}>
    {@render children?.()}
  </LayoutProviders>
{:else}
  {@render children?.()}
{/if}
```

`src/routes/+page.server.ts`:
```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};
```

`src/routes/+error.svelte`:
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { VersionNotFound } from 'specra/components';
</script>

<svelte:head>
  <title>Page Not Found</title>
</svelte:head>

<VersionNotFound />
```

`src/params/product.ts`:
```typescript
export function match(param: string): boolean {
  return !/^v\d/.test(param);
}
```

- [ ] **Step 2: Create docs route files**

Copy these files exactly from the minimal template (identical content):

- `src/routes/docs/[version]/+layout.server.ts`
- `src/routes/docs/[version]/+page.server.ts`
- `src/routes/docs/[version]/[...slug]/+page.server.ts`
- `src/routes/docs/[product=product]/[version]/+layout.server.ts`
- `src/routes/docs/[product=product]/[version]/+page.server.ts`
- `src/routes/docs/[product=product]/[version]/[...slug]/+page.server.ts`

These are the server-side data loaders and are identical across templates.

- [ ] **Step 3: Create docs page Svelte files using ModernDocsPage**

`src/routes/docs/[version]/[...slug]/+page.svelte`:
```svelte
<script lang="ts">
  import ModernDocsPage from '$lib/components/ModernDocsPage.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:url" content={data.ogUrl} />
  <meta property="og:type" content="article" />
  <link rel="canonical" href={data.ogUrl} />
</svelte:head>

<ModernDocsPage {data} />
```

`src/routes/docs/[product=product]/[version]/[...slug]/+page.svelte`:
```svelte
<script lang="ts">
  import ModernDocsPage from '$lib/components/ModernDocsPage.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:url" content={data.ogUrl} />
  <meta property="og:type" content="article" />
  <link rel="canonical" href={data.ogUrl} />
</svelte:head>

<ModernDocsPage {data} />
```

- [ ] **Step 4: Commit**

```bash
git add templates/modern/src/routes/ templates/modern/src/params/
git commit -m "feat(modern): add SvelteKit route files with custom layout"
```

---

### Task 6: Create Vite-Style Homepage

**Files:**
- Create: `templates/modern/src/routes/+page.svelte`

- [ ] **Step 1: Create homepage**

```svelte
<script lang="ts">
  import { ArrowRight, Github, Zap, BookOpen, Code, Sun, Moon } from 'lucide-svelte';
  import { Button, SiteBanner, Logo } from 'specra/components';

  let { data } = $props();
  const config = data.config;
  const docsUrl = '/docs/platform/v1.0.0/introduction/getting-started';
</script>

<svelte:head>
  <title>{config.site.title}</title>
  <meta name="description" content={config.site.description || 'Modern documentation platform'} />
</svelte:head>

<div class="min-h-screen bg-background">
  <SiteBanner {config} />

  <!-- Nav -->
  <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style="border-color: var(--border);">
    <div class="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
      <a href="/" class="flex items-center gap-2">
        <Logo logo={config.site.logo} alt={config.site.title} class="w-16 object-contain" />
        <span class="font-semibold text-foreground">{config.site.title || 'Modern Docs'}</span>
      </a>
      <div class="flex items-center gap-6">
        <a href={docsUrl} class="text-sm text-muted-foreground hover:text-foreground transition-colors">Guide</a>
        <a href="/docs/platform/v1.0.0/api" class="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a>
        <a href="/docs/cli/v1.0.0/getting-started/installation" class="text-sm text-muted-foreground hover:text-foreground transition-colors">CLI</a>
        {#if config?.social?.github}
          <a href={config.social.github} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">
            <Github class="h-5 w-5" />
          </a>
        {/if}
      </div>
    </div>
  </header>

  <main>
    <!-- Hero -->
    <div class="max-w-4xl mx-auto text-center py-24 px-6">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
        <span class="bg-gradient-to-r from-[#bd34fe] to-[#646cff] bg-clip-text text-transparent">
          Next Generation
        </span>
        <br />
        <span class="text-foreground">Documentation Platform</span>
      </h1>
      <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        Build beautiful, versioned documentation for your projects. Fast, flexible, and developer-friendly.
      </p>
      <div class="flex items-center justify-center gap-4">
        <Button href={docsUrl} size="lg" class="bg-[#bd34fe] hover:bg-[#a020f0] text-white">
          Get Started
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
        {#if config?.social?.github}
          <Button href={config.social.github} size="lg" variant="outline">
            <Github class="mr-2 h-4 w-4" />
            View on GitHub
          </Button>
        {/if}
      </div>
    </div>

    <!-- Feature Grid -->
    <div class="border-t" style="border-color: var(--border);">
      <div class="max-w-5xl mx-auto py-20 px-6">
        <div class="grid md:grid-cols-3 gap-10">
          <div>
            <div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">
              <Zap class="h-5 w-5 text-[#bd34fe]" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-2">Lightning Fast</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Pre-rendered static pages with instant navigation. Built on SvelteKit for optimal performance.
            </p>
          </div>
          <div>
            <div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">
              <BookOpen class="h-5 w-5 text-[#bd34fe]" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-2">Multi-Product</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Document multiple products and versions under one roof. Each product gets its own namespace and sidebar.
            </p>
          </div>
          <div>
            <div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">
              <Code class="h-5 w-5 text-[#bd34fe]" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-2">Developer First</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Write in MDX with interactive components, API playgrounds, and full TypeScript support.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t py-8 px-6 text-center" style="border-color: var(--border);">
    <p class="text-sm text-muted-foreground">
      {config.footer?.copyright || 'Built with Specra'}
    </p>
  </footer>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add templates/modern/src/routes/+page.svelte
git commit -m "feat(modern): add Vite-style homepage with gradient hero"
```

---

### Task 7: Create Platform Product Content (v1.0.0)

**Files:**
- Create: `templates/modern/docs/platform/v1.0.0/introduction/_category_.json`
- Create: `templates/modern/docs/platform/v1.0.0/introduction/getting-started.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/introduction/why-platform.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/introduction/philosophy.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/guide/_category_.json`
- Create: `templates/modern/docs/platform/v1.0.0/guide/features.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/guide/configuration.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/guide/plugins.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/guide/building-for-production.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/guide/deployment.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/api/_category_.json`
- Create: `templates/modern/docs/platform/v1.0.0/api/index.mdx`
- Create: `templates/modern/docs/platform/v1.0.0/api/manual-endpoints.mdx`

- [ ] **Step 1: Create category JSON files**

`docs/platform/v1.0.0/introduction/_category_.json`:
```json
{
  "label": "Introduction",
  "position": 1,
  "collapsible": false,
  "collapsed": false
}
```

`docs/platform/v1.0.0/guide/_category_.json`:
```json
{
  "label": "Guide",
  "position": 2,
  "collapsible": false,
  "collapsed": false
}
```

`docs/platform/v1.0.0/api/_category_.json`:
```json
{
  "label": "API Reference",
  "position": 3,
  "collapsible": false,
  "collapsed": false
}
```

- [ ] **Step 2: Create introduction docs**

`docs/platform/v1.0.0/introduction/getting-started.mdx`:
```mdx
---
title: Getting Started
description: Get up and running with the platform in minutes
sidebar_position: 1
---

Welcome to the platform documentation. This guide will help you get started quickly.

## Prerequisites

- Node.js 18 or higher
- A package manager (npm, yarn, or pnpm)

## Installation

Install the CLI tool globally:

```bash
npm install -g @platform/cli
```

## Create a New Project

```bash
platform init my-project
cd my-project
npm install
```

## Start Development Server

```bash
npm run dev
```

Your project is now running at `http://localhost:5173`.

## Next Steps

- Read the [Features](/docs/platform/v1.0.0/guide/features) guide to learn what's available
- Check out the [Configuration](/docs/platform/v1.0.0/guide/configuration) reference
- Browse the [API Reference](/docs/platform/v1.0.0/api) for detailed specifications
```

`docs/platform/v1.0.0/introduction/why-platform.mdx`:
```mdx
---
title: Why Platform
description: The motivation behind building this platform
sidebar_position: 2
---

## The Problem

Modern development teams need documentation that scales with their products. Existing solutions are either too rigid, too slow, or too expensive.

## Our Approach

Platform takes a different approach:

- **Content-first** — Write in MDX, version with Git, deploy anywhere
- **Multi-product** — One system for all your documentation needs
- **Performance** — Static site generation with instant page loads
- **Developer experience** — Hot reload, TypeScript, and component-driven authoring

## Who Is This For

Platform is built for teams that:

- Ship multiple products or libraries
- Need versioned documentation
- Want to own their documentation infrastructure
- Value developer experience and performance
```

`docs/platform/v1.0.0/introduction/philosophy.mdx`:
```mdx
---
title: Philosophy
description: Core principles that guide platform development
sidebar_position: 3
---

## Core Principles

### Content Is King

Your documentation content should be the focus. The platform handles routing, navigation, versioning, and rendering — you focus on writing.

### Convention Over Configuration

Sensible defaults that work out of the box. Drop MDX files into a folder structure, and the sidebar builds itself.

### Ship Fast, Iterate

Pre-rendered static pages deploy anywhere. No server to manage, no database to maintain.

### Extensible By Design

Every component can be customized or replaced. Build your own sidebar, add custom layouts, or extend the MDX component library.
```

- [ ] **Step 3: Create guide docs**

`docs/platform/v1.0.0/guide/features.mdx`:
```mdx
---
title: Features
description: Overview of platform features
sidebar_position: 1
---

## Feature Overview

<CardGrid cols={2}>
  <Card icon="git-branch" title="Versioning" description="Multiple documentation versions side by side" />
  <Card icon="layout" title="Multi-Product" description="Separate docs for each product under one roof" />
  <Card icon="moon" title="Dark Mode" description="System-aware theming with manual toggle" />
  <Card icon="search" title="Search" description="Full-text search with keyboard shortcuts" />
</CardGrid>

---

## MDX Components

Write documentation with interactive components:

<Callout type="tip" title="Pro Tip">
Components like Callout, Tabs, and CodeBlock are available in every MDX file — no imports needed.
</Callout>

## Versioned Documentation

Each version lives in its own folder. Navigate between versions using the version switcher in the header.

## API Documentation

Generate interactive API docs from OpenAPI specs, Postman collections, or write them manually with components.
```

`docs/platform/v1.0.0/guide/configuration.mdx`:
```mdx
---
title: Configuration
description: Configure your documentation site
sidebar_position: 2
---

## Configuration File

All configuration lives in `specra.config.json` at the project root.

```json
{
  "site": {
    "title": "My Docs",
    "description": "Documentation for my project",
    "activeVersion": "v1.0.0"
  },
  "theme": {
    "defaultMode": "dark"
  },
  "navigation": {
    "showSidebar": true,
    "showTableOfContents": true
  }
}
```

## Site Settings

| Setting | Type | Description |
|---------|------|-------------|
| `title` | string | Site title shown in header |
| `description` | string | Meta description |
| `activeVersion` | string | Default version to show |
| `url` | string | Production URL |

## Theme Settings

| Setting | Type | Description |
|---------|------|-------------|
| `defaultMode` | `"light"` \| `"dark"` \| `"system"` | Default theme mode |
| `respectPrefersColorScheme` | boolean | Follow OS preference |
```

`docs/platform/v1.0.0/guide/plugins.mdx`:
```mdx
---
title: Plugins
description: Extend the platform with plugins
sidebar_position: 3
---

## Plugin System

The platform supports plugins to extend functionality.

## Available Plugins

- **Search** — Full-text search powered by Meilisearch
- **Analytics** — Track page views and engagement
- **Sitemap** — Auto-generated XML sitemaps

## Creating a Plugin

Plugins follow a simple interface:

```typescript
interface Plugin {
  name: string;
  setup(config: PluginConfig): void;
}
```

<Callout type="info">
Plugin documentation is a work in progress. Check back for updates.
</Callout>
```

`docs/platform/v1.0.0/guide/building-for-production.mdx`:
```mdx
---
title: Building for Production
description: Build and optimize your documentation for production
sidebar_position: 4
---

## Build Command

```bash
npm run build
```

This generates a static site in the `build/` directory.

## Output

The build output is a collection of static HTML, CSS, and JavaScript files that can be served by any web server or CDN.

```
build/
├── index.html
├── docs/
│   └── platform/
│       └── v1.0.0/
│           └── ...
├── _app/
│   ├── immutable/
│   └── version.json
└── api-specs/
```

## Preview Locally

```bash
npm run preview
```

## Optimization

The build automatically:
- Pre-renders all pages as static HTML
- Code-splits JavaScript bundles
- Inlines critical CSS
- Generates a sitemap
```

`docs/platform/v1.0.0/guide/deployment.mdx`:
```mdx
---
title: Deployment
description: Deploy your documentation site
sidebar_position: 5
---

## Static Hosting

Since the platform generates a static site, you can deploy to any static hosting provider.

## Vercel

```bash
npm i -g vercel
vercel
```

## Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

## GitHub Pages

Add a GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

## Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```
```

- [ ] **Step 4: Create API docs**

`docs/platform/v1.0.0/api/index.mdx`:
```mdx
---
title: API Reference
description: Interactive API documentation
sidebar_position: 1
---

Explore the API endpoints with interactive examples and a live playground.

---

## Users API

<ApiReference spec="/api-specs/users-api.json" showPlayground={true} />

---

## OpenAPI Example

<ApiReference spec="/api-specs/openapi-example.json" />
```

`docs/platform/v1.0.0/api/manual-endpoints.mdx`:
```mdx
---
title: Manual Endpoints
description: Hand-crafted API endpoint documentation
sidebar_position: 2
---

API endpoints documented with individual components.

---

## Get User

<ApiEndpoint
  method="GET"
  path="/api/users/:id"
  summary="Retrieve a user by ID"
>

<ApiParams
  title="Path Parameters"
  params={[
    {
      name: "id",
      type: "string",
      required: true,
      description: "The unique identifier of the user"
    }
  ]}
/>

<ApiResponse
  status={200}
  description="User retrieved successfully"
  example={{
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  }}
/>

<ApiResponse
  status={404}
  description="User not found"
  example={{
    "error": "User not found",
    "code": "USER_NOT_FOUND"
  }}
/>

</ApiEndpoint>

## Create User

<ApiEndpoint
  method="POST"
  path="/api/users"
  summary="Create a new user"
>

<ApiParams
  title="Body Parameters"
  params={[
    {
      name: "name",
      type: "string",
      required: true,
      description: "Full name of the user"
    },
    {
      name: "email",
      type: "string",
      required: true,
      description: "Email address"
    }
  ]}
/>

<ApiResponse
  status={201}
  description="User created"
  example={{
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }}
/>

</ApiEndpoint>
```

- [ ] **Step 5: Commit**

```bash
git add templates/modern/docs/platform/v1.0.0/
git commit -m "feat(modern): add Platform product docs (v1.0.0)"
```

---

### Task 8: Create Platform v2.0.0 and CLI Product Content

**Files:**
- Create: `templates/modern/docs/platform/v2.0.0/` (mirror of v1.0.0)
- Create: `templates/modern/docs/cli/v1.0.0/` (all CLI content)

- [ ] **Step 1: Copy Platform v1.0.0 to v2.0.0**

```bash
cp -r templates/modern/docs/platform/v1.0.0 templates/modern/docs/platform/v2.0.0
```

- [ ] **Step 2: Create CLI category files**

`docs/cli/v1.0.0/getting-started/_category_.json`:
```json
{
  "label": "Getting Started",
  "position": 1,
  "collapsible": false,
  "collapsed": false
}
```

`docs/cli/v1.0.0/commands/_category_.json`:
```json
{
  "label": "Commands",
  "position": 2,
  "collapsible": false,
  "collapsed": false
}
```

`docs/cli/v1.0.0/configuration/_category_.json`:
```json
{
  "label": "Configuration",
  "position": 3,
  "collapsible": false,
  "collapsed": false
}
```

- [ ] **Step 3: Create CLI getting-started docs**

`docs/cli/v1.0.0/getting-started/installation.mdx`:
```mdx
---
title: Installation
description: Install the CLI tool
sidebar_position: 1
---

## Install

```bash
npm install -g @platform/cli
```

## Verify

```bash
platform --version
```

## Requirements

- Node.js 18+
- npm, yarn, or pnpm
```

`docs/cli/v1.0.0/getting-started/quick-start.mdx`:
```mdx
---
title: Quick Start
description: Create your first project with the CLI
sidebar_position: 2
---

## Create a Project

```bash
platform init my-docs
```

You'll be prompted to choose a template and package manager.

## Start Development

```bash
cd my-docs
npm run dev
```

## Project Structure

```
my-docs/
├── docs/           # Your documentation content
├── src/            # SvelteKit routes and components
├── static/         # Static assets
├── specra.config.json
└── package.json
```
```

- [ ] **Step 4: Create CLI commands docs**

`docs/cli/v1.0.0/commands/init.mdx`:
```mdx
---
title: init
description: Initialize a new documentation project
sidebar_position: 1
---

## Usage

```bash
platform init [project-name] [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--template` | Template to use (minimal, book-docs, jbrains-docs, modern) |
| `--pm` | Package manager (npm, yarn, pnpm) |

## Examples

```bash
platform init my-docs --template modern --pm pnpm
```
```

`docs/cli/v1.0.0/commands/build.mdx`:
```mdx
---
title: build
description: Build the documentation site for production
sidebar_position: 2
---

## Usage

```bash
platform build
```

## What It Does

1. Runs `vite build` to generate static HTML
2. Pre-renders all documentation pages
3. Outputs to the `build/` directory

## Options

| Option | Description |
|--------|-------------|
| `--outDir` | Custom output directory (default: `build`) |
```

`docs/cli/v1.0.0/commands/dev.mdx`:
```mdx
---
title: dev
description: Start the development server
sidebar_position: 3
---

## Usage

```bash
platform dev
```

## Features

- Hot module replacement (HMR)
- Instant page loads
- Auto-refresh on content changes
- Error overlay with stack traces

## Options

| Option | Description |
|--------|-------------|
| `--port` | Port number (default: 5173) |
| `--host` | Expose to network |
```

`docs/cli/v1.0.0/commands/deploy.mdx`:
```mdx
---
title: deploy
description: Deploy the documentation site
sidebar_position: 4
---

## Usage

```bash
platform deploy [target]
```

## Targets

| Target | Description |
|--------|-------------|
| `vercel` | Deploy to Vercel |
| `netlify` | Deploy to Netlify |
| `gh-pages` | Deploy to GitHub Pages |

## Example

```bash
platform build
platform deploy vercel
```
```

- [ ] **Step 5: Create CLI configuration docs**

`docs/cli/v1.0.0/configuration/config-reference.mdx`:
```mdx
---
title: Config Reference
description: Complete CLI configuration reference
sidebar_position: 1
---

## Configuration File

The CLI reads configuration from `specra.config.json`.

## All Options

| Section | Key | Type | Default | Description |
|---------|-----|------|---------|-------------|
| `site` | `title` | string | `"My Docs"` | Site title |
| `site` | `activeVersion` | string | `"v1.0.0"` | Default version |
| `theme` | `defaultMode` | string | `"system"` | Theme mode |
| `navigation` | `showSidebar` | boolean | `true` | Show sidebar |
| `navigation` | `showTableOfContents` | boolean | `true` | Show TOC |
| `navigation` | `collapsibleSidebar` | boolean | `true` | Allow collapsing |
| `features` | `versioning` | boolean | `true` | Enable versions |

## Products

```json
{
  "products": [
    { "id": "platform", "label": "Platform", "default": true },
    { "id": "cli", "label": "CLI" }
  ]
}
```

Each product gets its own docs folder and URL namespace: `/docs/{product}/{version}/`.
```

- [ ] **Step 6: Commit**

```bash
git add templates/modern/docs/
git commit -m "feat(modern): add Platform v2.0.0 and CLI product docs"
```

---

### Task 9: Add Static Assets and Register in CLI

**Files:**
- Create: `templates/modern/static/api-specs/` (copy from minimal)
- Modify: `src/cli.ts:78`

- [ ] **Step 1: Copy API spec files from minimal template**

```bash
mkdir -p templates/modern/static/api-specs
cp templates/minimal/static/api-specs/*.json templates/modern/static/api-specs/
```

- [ ] **Step 2: Add modern template to CLI choices**

In `src/cli.ts`, add to the choices array (after the jbrains-docs entry):

```typescript
{ title: 'Modern', value: 'modern', description: 'Vite-inspired dark theme with flat sidebar and multi-product support' },
```

The full choices array becomes:
```typescript
choices: [
  { title: 'Minimal', value: 'minimal', description: 'Minimal setup to get started quickly' },
  { title: 'Book Docs', value: 'book-docs', description: 'Knowledge base style with dark theme and categorized sidebar' },
  { title: 'JBrains Docs', value: 'jbrains-docs', description: 'Reference docs style with light theme and tab groups' },
  { title: 'Modern', value: 'modern', description: 'Vite-inspired dark theme with flat sidebar and multi-product support' },
],
```

- [ ] **Step 3: Commit**

```bash
git add templates/modern/static/ src/cli.ts
git commit -m "feat(modern): add static assets and register template in CLI"
```

---

### Task 10: Install Dependencies and Verify Build

- [ ] **Step 1: Install dependencies**

```bash
cd templates/modern
pnpm install
```

- [ ] **Step 2: Run the dev server and verify**

```bash
pnpm dev
```

Check:
- Homepage loads at `/` with gradient hero, feature grid, nav links
- Clicking "Get Started" navigates to Platform docs
- Sidebar shows flat bordered groups (Introduction, Guide, API Reference)
- Active link has purple left border
- Dark mode by default, light mode toggle works
- CLI product accessible at `/docs/cli/v1.0.0/...`
- API reference page renders with interactive playground
- Mobile sidebar drawer works on narrow viewport

- [ ] **Step 3: Run build to verify static generation**

```bash
pnpm build
```

Verify no errors. Pre-rendered pages should appear in `build/`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(modern): complete template with dependencies and build verification"
```
