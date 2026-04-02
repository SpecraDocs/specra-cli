import { h as head, e as escape_html, a as attr } from "../../../../../chunks/root.js";
import { M as ModernDocsPage } from "../../../../../chunks/ModernDocsPage.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("n8opfh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.title)}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", data.description)}/> <meta property="og:title"${attr("content", data.title)}/> <meta property="og:description"${attr("content", data.description)}/> <meta property="og:url"${attr("content", data.ogUrl)}/> <meta property="og:type" content="article"/> <link rel="canonical"${attr("href", data.ogUrl)}/>`);
    });
    ModernDocsPage($$renderer2, { data });
  });
}
export {
  _page as default
};
