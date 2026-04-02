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
  <Header
    currentVersion={data.version}
    versions={data.versions}
    versionsMeta={data.versionsMeta}
    versionBanner={data.versionBanner}
    config={data.config}
    products={data.products}
  />

  <SiteBanner config={data.config} />

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

  <div class="flex">
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
