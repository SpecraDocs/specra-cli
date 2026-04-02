import "../../../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import { a as getProducts, c as getEffectiveConfig, b as getI18nConfig, l as loadVersionConfig, d as getCachedAllDocs, e as getCachedVersions, f as getVersionsMeta } from "../../../../chunks/mdx-cache.js";
import { redirect } from "@sveltejs/kit";
const load = async ({ params }) => {
  const { version } = params;
  const products = getProducts();
  const isProduct = products.some((p) => p.slug === version);
  if (isProduct) {
    return { allDocs: [], versions: [], versionsMeta: [], config: getEffectiveConfig(""), products };
  }
  const i18nConfig = getI18nConfig();
  const defaultLocale = i18nConfig?.defaultLocale || "en";
  const currentVersionConfig = loadVersionConfig(version);
  if (currentVersionConfig?.hidden) {
    const config2 = getEffectiveConfig(version);
    const activeVersion = config2.site?.activeVersion || "v1.0.0";
    throw redirect(302, `/docs/${activeVersion}`);
  }
  const allDocs = await getCachedAllDocs(version, defaultLocale);
  const versions = getCachedVersions();
  const config = getEffectiveConfig(version);
  const versionsMeta = getVersionsMeta(versions);
  return {
    allDocs,
    versions,
    versionsMeta,
    config,
    products,
    versionBanner: currentVersionConfig?.banner
  };
};
export {
  load
};
