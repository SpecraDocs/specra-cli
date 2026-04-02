// @ts-nocheck
import { getConfig, initConfig } from 'specra';
import specraConfig from '../../specra.config.json';
import type { LayoutServerLoad } from './$types';
import type { SpecraConfig } from 'specra';

initConfig(specraConfig as unknown as Partial<SpecraConfig>);

export const prerender = true;
export const trailingSlash = 'never';

export const load = async () => {
  const config = getConfig();
  return { config };
};
;null as any as LayoutServerLoad;