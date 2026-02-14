import {
  extractTableOfContents,
  getAdjacentDocs,
  isCategoryPage,
  getCachedVersions,
  getCachedAllDocs,
  getCachedDocBySlug,
  getConfig,
} from 'specra/lib';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { version, slug: slugParam } = params;
  const slug = slugParam;

  const allDocs = await getCachedAllDocs(version);
  const versions = getCachedVersions();
  const config = getConfig();
  const isCategory = isCategoryPage(slug, allDocs);
  const doc = await getCachedDocBySlug(slug, version);

  if (!doc && isCategory) {
    const categoryDoc = allDocs.find((d) => d.slug.startsWith(slug + '/'));
    const categoryTabGroup = categoryDoc?.meta?.tab_group || categoryDoc?.categoryTabGroup;

    return {
      type: 'category' as const,
      slug,
      version,
      allDocs,
      versions,
      config,
      categoryTabGroup,
      title: slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Category',
      description: 'Browse the documentation in this section.',
    };
  }

  if (!doc) {
    return {
      type: 'not-found' as const,
      slug,
      version,
      allDocs,
      versions,
      config,
    };
  }

  const toc = extractTableOfContents(doc.content);
  const { previous, next } = getAdjacentDocs(slug, allDocs);
  const showCategoryIndex = isCategory && doc;
  const currentPageTabGroup = doc.meta?.tab_group || doc.categoryTabGroup;

  return {
    type: showCategoryIndex ? ('category-with-doc' as const) : ('doc' as const),
    doc,
    toc: showCategoryIndex ? [] : toc,
    previous: previous ? { title: previous.meta.title, slug: previous.slug } : null,
    next: next ? { title: next.meta.title, slug: next.slug } : null,
    slug,
    version,
    allDocs,
    versions,
    config,
    currentPageTabGroup,
  };
};
