/* eslint-disable import/no-unresolved */
const path = require('path')
const webpack = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')
const pkg = require('./package.json')

const pkgName = 'httpHelpers'
const libraryName = pkgName.charAt(0).toUpperCase() + pkgName.slice(1)

const baseConfig = {
  mode: 'production',
  entry: './src/httpHelpers.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: libraryName,
  },
  module: {
    rules: [],
  },
}

const optimization = {
  optimization: {
    minimize: false,
  },
}

const babelLoaderWithPolyfills = {
  test: /\.m?js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
  },
}

const babelLoader = { ...babelLoaderWithPolyfills, use: { loader: 'babel-loader', options: { plugins: ['@babel/transform-runtime'] } } }

const cjsConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}.cjs.js`,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [babelLoader],
  },
  plugins: [new ESLintPlugin()],
  externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
}

const nodeConfig = {
  ...baseConfig,
  ...optimization,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}-node.js`,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [babelLoader],
  },
  externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
  target: 'node',
  plugins: [
    new webpack.ProvidePlugin({
      fetch: ['node-fetch', 'default'],
    }),
  ],
}

module.exports = [cjsConfig, nodeConfig]
// module.exports = [cjsConfig]

// V5
// experiments: {
//   outputModule: true
// }

// node: {
//   global: true,
// },
// resolve: {
//   alias: { crypto: 'crypto-browserify', stream: 'stream-browserify', vm: 'vm-browserify' },
//   aliasFields: ['browser'],
// },
