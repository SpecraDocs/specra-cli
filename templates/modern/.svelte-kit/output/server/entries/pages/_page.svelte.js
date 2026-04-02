import { h as head, e as escape_html, a as attr } from "../../chunks/root.js";
import "../../chunks/tabs.js";
import { S as SiteBanner, L as Logo, G as Github, B as Button, A as Arrow_right, Z as Zap, a as Book_open, C as Code } from "../../chunks/Button.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const config = data.config;
    const docsUrl = "/docs/platform/v1.0.0/introduction/getting-started";
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(config.site.title)}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", config.site.description || "Modern documentation platform")}/>`);
    });
    $$renderer2.push(`<div class="min-h-screen bg-background">`);
    SiteBanner($$renderer2, { config });
    $$renderer2.push(`<!----> <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style="border-color: var(--border);"><div class="max-w-7xl mx-auto flex h-14 items-center justify-between px-6"><a href="/" class="flex items-center gap-2">`);
    Logo($$renderer2, {
      logo: config.site.logo,
      alt: config.site.title
    });
    $$renderer2.push(`<!----> <span class="font-semibold text-foreground">${escape_html(config.site.title || "Modern Docs")}</span></a> <div class="flex items-center gap-6"><a${attr("href", docsUrl)} class="text-sm text-muted-foreground hover:text-foreground transition-colors">Guide</a> <a href="/docs/platform/v1.0.0/api" class="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a> <a href="/docs/cli/v1.0.0/getting-started/installation" class="text-sm text-muted-foreground hover:text-foreground transition-colors">CLI</a> `);
    if (config?.social?.github) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", config.social.github)} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">`);
      Github($$renderer2, { class: "h-5 w-5" });
      $$renderer2.push(`<!----></a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></header> <main><div class="max-w-4xl mx-auto text-center py-24 px-6"><h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6"><span class="bg-gradient-to-r from-[#bd34fe] to-[#646cff] bg-clip-text text-transparent">Next Generation</span> <br/> <span class="text-foreground">Documentation Platform</span></h1> <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">Build beautiful, versioned documentation for your projects. Fast, flexible, and developer-friendly.</p> <div class="flex items-center justify-center gap-4">`);
    Button($$renderer2, {
      href: docsUrl,
      size: "lg",
      class: "bg-[#bd34fe] hover:bg-[#a020f0] text-white",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Get Started `);
        Arrow_right($$renderer3, { class: "ml-2 h-4 w-4" });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (config?.social?.github) {
      $$renderer2.push("<!--[0-->");
      Button($$renderer2, {
        href: config.social.github,
        size: "lg",
        variant: "outline",
        children: ($$renderer3) => {
          Github($$renderer3, { class: "mr-2 h-4 w-4" });
          $$renderer3.push(`<!----> View on GitHub`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="border-t" style="border-color: var(--border);"><div class="max-w-5xl mx-auto py-20 px-6"><div class="grid md:grid-cols-3 gap-10"><div><div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">`);
    Zap($$renderer2, { class: "h-5 w-5 text-[#bd34fe]" });
    $$renderer2.push(`<!----></div> <h3 class="text-base font-semibold text-foreground mb-2">Lightning Fast</h3> <p class="text-sm text-muted-foreground leading-relaxed">Pre-rendered static pages with instant navigation. Built on SvelteKit for optimal performance.</p></div> <div><div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">`);
    Book_open($$renderer2, { class: "h-5 w-5 text-[#bd34fe]" });
    $$renderer2.push(`<!----></div> <h3 class="text-base font-semibold text-foreground mb-2">Multi-Product</h3> <p class="text-sm text-muted-foreground leading-relaxed">Document multiple products and versions under one roof. Each product gets its own namespace and sidebar.</p></div> <div><div class="h-10 w-10 rounded-lg bg-[#bd34fe]/10 flex items-center justify-center mb-4">`);
    Code($$renderer2, { class: "h-5 w-5 text-[#bd34fe]" });
    $$renderer2.push(`<!----></div> <h3 class="text-base font-semibold text-foreground mb-2">Developer First</h3> <p class="text-sm text-muted-foreground leading-relaxed">Write in MDX with interactive components, API playgrounds, and full TypeScript support.</p></div></div></div></div></main> <footer class="border-t py-8 px-6 text-center" style="border-color: var(--border);"><p class="text-sm text-muted-foreground">${escape_html(config.footer?.copyright || "Built with Specra")}</p></footer></div>`);
  });
}
export {
  _page as default
};
