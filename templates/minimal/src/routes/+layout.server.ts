import { getConfig, initConfig } from 'specra/lib';
import specraConfig from '../../specra.config.json';
import type { LayoutServerLoad } from './$types';
import type { SpecraConfig } from 'specra';

// Initialize Specra config
initConfig(specraConfig as unknown as Partial<SpecraConfig>);

export const load: LayoutServerLoad = async () => {
  const config = getConfig();

  return {
    config
  };
};
