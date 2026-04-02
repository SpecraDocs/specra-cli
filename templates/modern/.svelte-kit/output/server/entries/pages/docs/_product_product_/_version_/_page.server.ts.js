import { redirect } from "@sveltejs/kit";
import "../../../../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import { a as getProducts, d as getCachedAllDocs } from "../../../../../chunks/mdx-cache.js";
const load = async ({ params }) => {
  const { product, version } = params;
  const products = getProducts();
  const matchedProduct = products.find((p) => p.slug === product);
  if (!matchedProduct) {
    return {};
  }
  const docs = await getCachedAllDocs(version, void 0, product);
  if (docs.length === 0) {
    const activeVersion = matchedProduct.config.activeVersion || "v1.0.0";
    redirect(302, `/docs/${product}/${activeVersion}`);
  }
  redirect(302, `/docs/${product}/${version}/${docs[0].slug}`);
};
export {
  load
};
