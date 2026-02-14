<script lang="ts">
  import { ArrowRight, BookOpen, Zap, Code, Github, Twitter, Linkedin } from 'lucide-svelte';
  import { Button, SiteBanner, Logo } from 'specra/components';

  let { data } = $props();
  const config = data.config;
  const activeVersion = config.site.activeVersion || 'v1.0.0';
  const docsUrl = `/docs/${activeVersion}/about`;
</script>

<svelte:head>
  <title>{config.site.title}</title>
  <meta name="description" content={config.site.description || 'Modern documentation platform'} />
</svelte:head>

<div class="min-h-screen bg-background">
  <SiteBanner {config} />
  <header class="border-b border-border">
    <div class="container flex h-16 items-center justify-between px-6 mx-auto">
      <a href="/" class="flex items-center gap-2">
        <Logo logo={config.site.logo} alt={config.site.title} class="w-18 object-contain" />
        <span class="font-semibold text-lg text-foreground">Specra</span>
      </a>
      <div class="flex items-center gap-6">
        <a href={docsUrl} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Documentation
        </a>
        {#if config?.social?.github}
          <a href={config.social.github} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">
            <Github class="h-5 w-5" />
          </a>
        {/if}
        <Button href={docsUrl}>Get Started</Button>
      </div>
    </div>
  </header>

  <main class="container px-6 mx-auto">
    <!-- Hero Section -->
    <div class="mx-auto text-center space-y-6 py-20 max-w-4xl">
      <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
        Beautiful documentation made <span class="text-primary">simple</span>
      </h1>
      <p class="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        The modern documentation framework that grows with your project
      </p>
      <p class="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
        Built for developers who want powerful, flexible documentation without the complexity.
        Write in MDX, configure with ease, and ship beautiful docs in minutes.
      </p>
      <div class="flex items-center justify-center gap-4 pt-4">
        <Button href={docsUrl} size="lg">
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

    <!-- Key Features -->
    <div class="grid md:grid-cols-3 gap-6 py-16 max-w-6xl mx-auto">
      <div class="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
        <div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen class="h-6 w-6 text-primary" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">MDX-Powered</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Write your docs in MDX with support for custom components, code blocks with syntax highlighting, and rich interactive content.
        </p>
      </div>

      <div class="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
        <div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Zap class="h-6 w-6 text-primary" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Built on SvelteKit for optimal performance. Server-side rendering, instant page loads, and seamless navigation out of the box.
        </p>
      </div>

      <div class="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
        <div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Code class="h-6 w-6 text-primary" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Developer First</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Version control friendly, Git-based workflow, and full TypeScript support. Your docs live alongside your code.
        </p>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="py-16 max-w-4xl mx-auto">
      <div class="rounded-xl border border-border bg-card p-8 md:p-12 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground">Ready to Get Started?</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">
          Create beautiful, versioned documentation for your project in minutes.<br />
          Specra gives you everything you need to write, organize, and publish great docs.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button href={docsUrl} size="lg" variant="default">
            Read the Docs
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
          {#if config?.social?.github}
            <Button href={config.social.github} size="lg" variant="outline">
              <Github class="mr-2 h-4 w-4" />
              Star on GitHub
            </Button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Community Section -->
    <div class="py-16 max-w-3xl mx-auto text-center space-y-6">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground">Join the Community</h2>
      <p class="text-muted-foreground">
        Specra is open source and community-driven. Connect with developers and stay updated.
      </p>
      <div class="flex items-center justify-center gap-4 pt-4">
        {#if config?.social?.github}
          <Button href={config.social.github} variant="outline" size="lg">
            <Github class="mr-2 h-5 w-5" />
            GitHub
          </Button>
        {/if}
        {#if config?.social?.twitter}
          <Button href={config.social.twitter} variant="outline" size="lg">
            <Twitter class="mr-2 h-5 w-5" />
            Twitter
          </Button>
        {/if}
        {#if config?.social?.linkedin}
          <Button href={config.social.linkedin} variant="outline" size="lg">
            <Linkedin class="mr-2 h-5 w-5" />
            LinkedIn
          </Button>
        {/if}
      </div>
    </div>
  </main>
</div>
