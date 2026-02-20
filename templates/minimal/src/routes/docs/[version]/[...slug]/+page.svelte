<script lang="ts">
  import {
    TableOfContents,
    Header,
    DocLayout,
    CategoryIndex,
    HotReloadIndicator,
    DevModeBadge,
    MdxHotReload,
    MdxContent,
    NotFoundContent,
    SearchHighlight,
    MobileDocLayout,
    mdxComponents,
  } from 'specra/components';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let allDocsCompat: any[] = $derived(data.allDocs);
  let previousDoc = $derived(data.previous ?? undefined);
  let nextDoc = $derived(data.next ?? undefined);
  let categoryTitle = $derived(data.categoryTitle ?? undefined);
  let categoryDescription = $derived(data.categoryDescription ?? undefined);
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:url" content={data.ogUrl} />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.title} />
  <meta name="twitter:description" content={data.description} />
</svelte:head>

{#if !data.doc && data.isCategory}
  <MobileDocLayout
    docs={allDocsCompat}
    version={data.version}
    config={data.config}
    activeTabGroup={data.categoryTabGroup}
  >
    {#snippet header()}
      <Header currentVersion={data.version} versions={data.versions} config={data.config} />
    {/snippet}
    <CategoryIndex
      categoryPath={data.slug}
      version={data.version}
      allDocs={allDocsCompat}
      title={categoryTitle}
      description={categoryDescription}
      config={data.config}
    />
  </MobileDocLayout>
  <MdxHotReload />
  <HotReloadIndicator />
  <DevModeBadge />
{:else if data.isNotFound}
  <MobileDocLayout
    docs={allDocsCompat}
    version={data.version}
    config={data.config}
  >
    {#snippet header()}
      <Header currentVersion={data.version} versions={data.versions} config={data.config} />
    {/snippet}
    <NotFoundContent version={data.version} />
  </MobileDocLayout>
  <MdxHotReload />
  <HotReloadIndicator />
  <DevModeBadge />
{:else if data.doc}
  <MobileDocLayout
    docs={allDocsCompat}
    version={data.version}
    config={data.config}
    activeTabGroup={data.categoryTabGroup}
  >
    {#snippet header()}
      <Header currentVersion={data.version} versions={data.versions} config={data.config} />
    {/snippet}
    {#snippet toc()}
      {#if !data.isCategory}
        <TableOfContents items={data.toc} config={data.config} />
      {/if}
    {/snippet}

    {#if data.isCategory}
      {#snippet categoryContent()}
        {#if data.doc?.contentNodes}
          <MdxContent nodes={data.doc.contentNodes} components={mdxComponents} />
        {:else if data.doc?.content}
          {@html data.doc.content}
        {/if}
      {/snippet}
      <CategoryIndex
        categoryPath={data.slug}
        version={data.version}
        allDocs={allDocsCompat}
        title={data.doc.meta.title}
        description={data.doc.meta.description}
        content={categoryContent}
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
        config={data.config}
      >
        {#if data.doc.contentNodes}
          <MdxContent nodes={data.doc.contentNodes} components={mdxComponents} />
        {:else}
          {@html data.doc.content}
        {/if}
      </DocLayout>
    {/if}
  </MobileDocLayout>
  <MdxHotReload />
  <HotReloadIndicator />
  <DevModeBadge />
{/if}
