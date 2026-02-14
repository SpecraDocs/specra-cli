<script lang="ts">
  import { LayoutProviders } from 'specra/components';
  import '../app.css';

  let { data, children } = $props();
</script>

<svelte:head>
  <title>{data.config.site.title}</title>
  <meta name="description" content={data.config.site.description || 'Modern documentation platform'} />
</svelte:head>

<LayoutProviders config={data.config}>
  {@render children()}
</LayoutProviders>
