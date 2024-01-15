const path = require('path');
const fs = require('fs');

const { name } = JSON.parse(fs.readFileSync(path.resolve('./package.json')));

const basePath = process.env.NODE_ENV === 'production' ? `/${name}/` : '/';

module.exports = {
  // baseUrl: basePath,
  publicPath: basePath,
  chainWebpack: (config) => {
    // alias to lib directory
    config.resolve.alias.set('_', path.resolve('./src/lib'));
  },
};
