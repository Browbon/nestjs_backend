import process from 'node:process';

export const HelperService = {
  // The 'isProd' function checks the NODE_ENV whether is in the production environment, return 'true' if the NODE_ENV is 'prod' or 'production'
  isProd(): boolean {
    return process.env.NODE_ENV.startsWith('prod');
  },
};
