import { redirect } from '@sveltejs/kit';
import { getCachedVersions, getCachedAllDocs } from 'specra';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { version } = params;
  const docs = await getCachedAllDocs(version);

  if (docs.length === 0) {
    redirect(302, '/docs/v1.0.0');
  }

  redirect(302, `/docs/${version}/${docs[0].slug}`);
};
