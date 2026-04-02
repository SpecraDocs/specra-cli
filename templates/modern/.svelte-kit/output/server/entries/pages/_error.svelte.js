import { e as escape_html, b as ensure_array_like, a as attr, s as stringify, h as head } from "../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/tabs.js";
import { T as Triangle_alert } from "../../chunks/triangle-alert.js";
function VersionNotFound($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { version, availableVersions = [] } = $$props;
    $$renderer2.push(`<div class="flex min-h-screen items-center justify-center px-4"><div class="text-center"><div class="mb-4 flex justify-center">`);
    Triangle_alert($$renderer2, { class: "h-16 w-16 text-yellow-500" });
    $$renderer2.push(`<!----></div> <h1 class="mb-2 text-4xl font-bold">Version Not Found</h1> <p class="mb-6 text-muted-foreground">`);
    if (version) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`The documentation version "${escape_html(version)}" doesn't exist.`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`The documentation version you're looking for doesn't exist.`);
    }
    $$renderer2.push(`<!--]--></p> `);
    if (availableVersions.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mb-6"><p class="mb-3 text-sm text-muted-foreground">Available versions:</p> <div class="flex flex-wrap justify-center gap-2"><!--[-->`);
      const each_array = ensure_array_like(availableVersions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let ver = each_array[$$index];
        $$renderer2.push(`<a${attr("href", `/docs/${stringify(ver)}`)} class="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">${escape_html(ver)}</a>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<a href="/docs/v1.0.0" class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go to Latest Version</a>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function _error($$renderer) {
  head("1j96wlh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Page Not Found</title>`);
    });
  });
  VersionNotFound($$renderer, {});
}
export {
  _error as default
};
