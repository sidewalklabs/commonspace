const path = require('path');
const webpack = require('webpack');

module.exports = [{
  name: 'firestore and gcp',
  entry: {
    'dist/firestore': ['babel-polyfill', path.resolve(__dirname, 'src/firestore-client.ts')],
    'expo_project/lib/firestore': ['babel-polyfill', path.resolve(__dirname, 'src/firestore-client.ts')],
    'dist/index': ['babel-polyfill', path.resolve(__dirname, 'src/gcp.ts')],
    'dist/server': ['babel-polyfill', path.resolve(__dirname, 'src/server.ts')]
  },
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname),
    filename: '[name].js'
  },
  target: "node",
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
}, {
  name: 'admin-app',
  entry: ['babel-polyfill', path.resolve(__dirname, 'src/app.tsx')],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, "dist"),
    filename: 'app.bundle.js'
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
  }
}];
