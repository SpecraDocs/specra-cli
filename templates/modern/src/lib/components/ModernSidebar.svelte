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
    meta: {
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
  {#if sortedStandalone.length > 0}
    <div class="sidebar-group">
      {#each sortedStandalone as doc}
        <a
          href="{docsBase}/{doc.slug}"
          class="sidebar-link"
          class:active={isActive(doc.slug)}
          onclick={() => onLinkClick?.()}
        >
          {doc.meta.title || doc.slug}
        </a>
      {/each}
    </div>
  {/if}

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
          {doc.meta.title || doc.slug}
        </a>
      {/each}

      {#each sortSidebarGroups(group.children) as [childKey, childGroup]}
        <h4 class="sidebar-subgroup-label">{childGroup.label}</h4>
        {#each sortSidebarItems(childGroup.items) as doc}
          <a
            href="{docsBase}/{doc.slug}"
            class="sidebar-link nested"
            class:active={isActive(doc.slug)}
            onclick={() => onLinkClick?.()}
          >
            {doc.meta.title || doc.slug}
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
