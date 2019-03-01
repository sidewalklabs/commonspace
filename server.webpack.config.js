const path = require('path');
const webpack = require('webpack');

module.exports = {
    name: 'api-server',
    entry: ['babel-polyfill', path.resolve(__dirname, 'src/server.ts')],
    devtool: 'source-map',
    target: 'node',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'server.js'
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /(node_modules|expo_project|.test.ts$)/,
          resolve: {
            // Add `.ts` and `.tsx` as a resolvable extension.
            extensions: [".ts", ".tsx", ".js"]
          },
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/^pg-native$/)
    ]
};
