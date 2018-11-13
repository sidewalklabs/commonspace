const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  const envKeys = Object.keys(env).reduce((acc, next) => {
    acc[`process.env.${next}`] = JSON.stringify(env[next]);
    return acc;
  }, {});
  return [{
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
  },{
    name: 'admin-app',
    entry: {
      app: ['babel-polyfill', path.resolve(__dirname, 'src/app.tsx')]
    },
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, "dist"),
      filename: 'app.bundle.js'
    },
    module: {
      noParse: [
          /aws/
      ],
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
      new HtmlWebpackPlugin(
        {
          title: 'Commons Survey Administrator',
          template: 'index.html'
        }
      ),
      new CopyWebpackPlugin([
        {from: 'css/styles.css', to: 'css/styles.css'},
        {from: 'node_modules/leaflet/dist/leaflet.css', to: 'css/leaflet.css'},
        {from: 'node_modules/leaflet-draw/dist/leaflet.draw.css', to: 'css/leaflet.draw.css'}
      ]),
      new webpack.DefinePlugin(envKeys)
    ]
  }];
};
