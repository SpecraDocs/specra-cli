import "../../../../../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/root.js";
import { a as getProducts, b as getI18nConfig, d as getCachedAllDocs, h as isCategoryPage, j as getCachedDocBySlug, k as extractTableOfContents, m as getAdjacentDocs } from "../../../../../../chunks/mdx-cache.js";
const load = async ({ params }) => {
  const { product, version, slug: slugArray } = params;
  const slug = slugArray.replace(/\/$/, "");
  const products = getProducts();
  const matchedProduct = products.find((p) => p.slug === product);
  if (!matchedProduct) {
    return {
      version,
      slug,
      product,
      isCategory: false,
      isNotFound: true,
      doc: null,
      categoryTitle: null,
      categoryDescription: null,
      categoryTabGroup: void 0,
      toc: [],
      previous: null,
      next: null,
      title: "Page Not Found",
      description: "The requested documentation page could not be found.",
      ogUrl: `/docs/${product}/${version}/${slug}`
    };
  }
  const i18nConfig = getI18nConfig();
  const slugParts = slug.split("/");
  let locale;
  if (i18nConfig && i18nConfig.locales.includes(slugParts[0])) {
    locale = slugParts[0];
  }
  const allDocs = await getCachedAllDocs(version, locale, product);
  const isCategory = isCategoryPage(slug, allDocs);
  const doc = await getCachedDocBySlug(slug, version, product);
  const urlPrefix = `/docs/${product}/${version}`;
  let title = "Page Not Found";
  let description = "The requested documentation page could not be found.";
  let ogUrl = `${urlPrefix}/${slug}`;
  if (doc) {
    title = doc.meta.title || doc.title;
    description = doc.meta.description || `Documentation for ${title}`;
  }
  if (!doc && isCategory) {
    const categoryDoc = allDocs.find((d) => d.slug.startsWith(slug + "/"));
    const categoryTabGroup = categoryDoc?.meta?.tab_group || categoryDoc?.categoryTabGroup;
    const categoryTitle = slug.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Category";
    return {
      version,
      slug,
      product,
      isCategory: true,
      isNotFound: false,
      doc: null,
      categoryTitle,
      categoryDescription: "Browse the documentation in this section.",
      categoryTabGroup,
      toc: [],
      previous: null,
      next: null,
      title,
      description,
      ogUrl
    };
  }
  if (!doc) {
    return {
      version,
      slug,
      product,
      isCategory: false,
      isNotFound: true,
      doc: null,
      categoryTitle: null,
      categoryDescription: null,
      categoryTabGroup: void 0,
      toc: [],
      previous: null,
      next: null,
      title,
      description,
      ogUrl
    };
  }
  const toc = extractTableOfContents(doc.meta.content || doc.content);
  const { previous, next } = getAdjacentDocs(slug, allDocs);
  const showCategoryIndex = isCategory && !!doc;
  const matchingDoc = allDocs.find((d) => d.slug === slug);
  const currentPageTabGroup = doc.meta?.tab_group || matchingDoc?.categoryTabGroup;
  return {
    version,
    slug,
    product,
    isCategory: showCategoryIndex,
    isNotFound: false,
    doc,
    categoryTitle: null,
    categoryDescription: null,
    categoryTabGroup: currentPageTabGroup,
    toc,
    previous: previous ? { title: previous.meta.title, slug: previous.slug } : null,
    next: next ? { title: next.meta.title, slug: next.slug } : null,
    title,
    description,
    ogUrl
  };
};
export {
  load
};
