import { redirect } from '@sveltejs/kit';
import { getConfig } from 'specra';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const config = getConfig();
  const activeVersion = config.site?.activeVersion || 'v1.0.0';
  redirect(302, `/docs/${activeVersion}/about`);
};
