import { redirect } from "@sveltejs/kit";
import "../../../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import { a as getProducts, c as getEffectiveConfig, d as getCachedAllDocs } from "../../../../chunks/mdx-cache.js";
const load = async ({ params }) => {
  const { version } = params;
  const products = getProducts();
  const matchedProduct = products.find((p) => p.slug === version);
  if (matchedProduct) {
    const config = getEffectiveConfig("", version);
    const activeVersion = matchedProduct.config.activeVersion || config.site?.activeVersion || "v1.0.0";
    redirect(302, `/docs/${version}/${activeVersion}`);
  }
  const docs = await getCachedAllDocs(version);
  if (docs.length === 0) {
    redirect(302, "/docs/v1.0.0");
  }
  redirect(302, `/docs/${version}/${docs[0].slug}`);
};
export {
  load
};
