import "../../../../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import { a as getProducts, b as getI18nConfig, l as loadVersionConfig, c as getEffectiveConfig, d as getCachedAllDocs, e as getCachedVersions, f as getVersionsMeta } from "../../../../../chunks/mdx-cache.js";
import { redirect } from "@sveltejs/kit";
const load = async ({ params }) => {
  const { product, version } = params;
  const products = getProducts();
  const matchedProduct = products.find((p) => p.slug === product);
  if (!matchedProduct) {
    return {};
  }
  const i18nConfig = getI18nConfig();
  const defaultLocale = i18nConfig?.defaultLocale || "en";
  const currentVersionConfig = loadVersionConfig(version, product);
  if (currentVersionConfig?.hidden) {
    const config2 = getEffectiveConfig(version, product);
    const activeVersion = matchedProduct.config.activeVersion || config2.site?.activeVersion || "v1.0.0";
    throw redirect(302, `/docs/${product}/${activeVersion}`);
  }
  const allDocs = await getCachedAllDocs(version, defaultLocale, product);
  const versions = getCachedVersions(product);
  const config = getEffectiveConfig(version, product);
  const versionsMeta = getVersionsMeta(versions, product);
  return {
    allDocs,
    versions,
    versionsMeta,
    config,
    product,
    products,
    versionBanner: currentVersionConfig?.banner
  };
};
export {
  load
};
