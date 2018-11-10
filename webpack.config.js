const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
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
    new CopyWebpackPlugin([{from: 'css/styles.css', to: 'css/styles.css'}])
  ]
}, {
  name: 'map-annotation',
  entry: {
    map: ['babel-polyfill', path.resolve(__dirname, 'src/map.ts')]
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, "map-annotation"),
    filename: 'bundle.js'
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
    new HtmlWebpackPlugin(
      {
        title: 'La Sombra y El Gemelo',
        filename: 'index.html',
        template: 'map.html'
      }
    ),
    new CopyWebpackPlugin([{from: 'css/map.css', to: 'css/styles.css'}])
  ]
}];
