import path from 'path';
import { readFileSync } from 'fs';

const { name } = JSON.parse(readFileSync(path.resolve('./package.json')));

const basePath = process.env.NODE_ENV === 'production' ? `/${name}/` : '/';

export default {
  // baseUrl: basePath,
  publicPath: basePath,
  chainWebpack: (config) => {
    // alias to lib directory
    config.resolve.alias.set('_', path.resolve('./src/lib'));
  },
};
