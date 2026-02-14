<script lang="ts">
  import {
    TableOfContents,
    Header,
    DocLayout,
    CategoryIndex,
    HotReloadIndicator,
    DevModeBadge,
    MdxHotReload,
    NotFoundContent,
    SearchHighlight,
    MobileDocLayout,
    Sidebar,
    TabGroups,
  } from 'specra/components';

  let { data } = $props();
</script>

<svelte:head>
  {#if data.type === 'doc' || data.type === 'category-with-doc'}
    <title>{data.doc?.meta?.title || 'Documentation'}</title>
    <meta name="description" content={data.doc?.meta?.description || `Documentation for ${data.doc?.meta?.title}`} />
  {:else if data.type === 'category'}
    <title>{data.title}</title>
    <meta name="description" content={data.description} />
  {:else}
    <title>Page Not Found</title>
  {/if}
</svelte:head>

<Header currentVersion={data.version} versions={data.versions} config={data.config} />

{#if data.config.navigation?.tabGroups?.length}
  <TabGroups
    tabGroups={data.config.navigation.tabGroups}
    activeTabId={data.currentPageTabGroup}
    docs={data.allDocs}
    version={data.version}
  />
{/if}

<div class="container mx-auto flex">
  <!-- Sidebar -->
  <aside class="hidden lg:block w-64 shrink-0">
    <div class="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-4">
      <Sidebar
        docs={data.allDocs}
        version={data.version}
        config={data.config}
      />
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 min-w-0 px-4 py-6 lg:px-8">
    {#if data.type === 'not-found'}
      <NotFoundContent version={data.version} />
    {:else if data.type === 'category'}
      <CategoryIndex
        categoryPath={data.slug}
        version={data.version}
        allDocs={data.allDocs}
        title={data.title}
        description={data.description}
        config={data.config}
      />
    {:else if data.type === 'category-with-doc'}
      <CategoryIndex
        categoryPath={data.slug}
        version={data.version}
        allDocs={data.allDocs}
        title={data.doc.meta.title}
        description={data.doc.meta.description}
        content={data.doc.content}
        config={data.config}
      />
    {:else if data.type === 'doc'}
      <SearchHighlight />
      <DocLayout
        meta={data.doc.meta}
        previousDoc={data.previous || undefined}
        nextDoc={data.next || undefined}
        version={data.version}
        slug={data.slug}
        config={data.config}
      >
        <!-- Doc content rendered via mdsvex -->
        {@html data.doc.content}
      </DocLayout>
    {/if}
  </main>

  <!-- Table of Contents -->
  {#if data.type === 'doc' && data.toc?.length}
    <aside class="hidden xl:block w-56 shrink-0">
      <div class="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pl-4">
        <TableOfContents items={data.toc} config={data.config} />
      </div>
    </aside>
  {/if}
</div>

<MdxHotReload />
<HotReloadIndicator />
<DevModeBadge />
