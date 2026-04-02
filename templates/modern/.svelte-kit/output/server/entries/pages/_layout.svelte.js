import { h as head, e as escape_html, a as attr } from "../../chunks/root.js";
import "../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import { s as setConfigContext } from "../../chunks/config.js";
function LayoutProviders($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { config, children } = $$props;
    setConfigContext(config);
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, children } = $$props;
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data?.config?.site?.title || "Documentation")}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", data?.config?.site?.description || "Modern documentation platform")}/>`);
    });
    if (data?.config) {
      $$renderer2.push("<!--[0-->");
      LayoutProviders($$renderer2, {
        config: data.config,
        children: ($$renderer3) => {
          children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      children?.($$renderer2);
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _layout as default
};
