// const webpack = require('webpack');

const webpack_config = {
  mode: 'development',
  entry: "./demo/src/demo.js",
  output: {
    path: `${__dirname}/demo`,
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js"],
    modules: ["node_modules"],
    alias: {
      'csv-parse/dist/esm/sync': `${__dirname}/node_modules/csv-parse/dist/esm/sync.js`,
    }
  },
};

module.exports = webpack_config;
