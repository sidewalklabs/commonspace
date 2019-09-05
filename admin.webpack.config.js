const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = env => {
  const envKeys = Object.keys(env).reduce((acc, next) => {
    acc[`process.env.${next}`] = JSON.stringify(env[next]);
    return acc;
  }, {});
  return [{
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
            extensions: [".ts", ".tsx", ".js"]
          },
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: true
            }
          }
        },
        {
          test: /\.css$/,
          resolve: {
            extensions: ['.css']
          },
          use: [
                {
                    loader: "style-loader",
                    options: { singleton: true }
                },
                {
                    loader: "css-loader",
                    options: { modules: true }
                }
            ]
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
        {from: 'css/styles.css', to: 'css/'},
        {from: 'assets/', to: 'assets/'},
        {from: 'node_modules/react-leaflet-search/lib/react-leaflet-search.css', to: 'css/'}
      ]),
      new webpack.DefinePlugin(envKeys),
      new CompressionPlugin()
    ]
  }];
};
