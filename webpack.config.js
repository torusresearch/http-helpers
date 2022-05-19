/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const pkg = require("./package.json");

function camelCase(input) {
  return input.toLowerCase().replace(/-(.)/g, (_, group1) => group1.toUpperCase());
}

function generatePackageName(name) {
  const splits = name.split("/");
  const pkgName = splits[splits.length - 1];
  const usableName = camelCase(pkgName);
  return usableName;
}

const pkgName = generatePackageName(pkg.name);

exports.baseConfig = {};

exports.nodeConfig = {
  optimization: {
    minimize: false,
  },
  output: {
    filename: `${pkgName}-node.js`,
    library: {
      type: "commonjs2",
    },
  },
  externals: [...Object.keys(pkg.dependencies), "node-fetch", /^(@babel\/runtime)/i],
  target: "node",
  plugins: [
    new webpack.ProvidePlugin({
      fetch: ["node-fetch", "default"],
    }),
  ],
};

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
