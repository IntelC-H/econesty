const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

const pkg = require('./package.json');

function filesIn(dir, acc = []) {
  let dirp = dir.endsWith('/') ? dir : dir + '/';
  fs.readdirSync(dirp).forEach(file => {
    if (fs.statSync(dirp + file).isDirectory()) {
      filesIn(dirp + file, acc);
    } else {
      acc.push(dirp + file);
    }
  });
  return acc;
}

// first load the files that need to be bundled in order.
let vendored = pkg.vendorOrder ? pkg.vendorOrder : []; 

// Then load everything else
if (pkg.vendorDirectory) {
  filesIn(path.resolve(pkg.vendorDirectory)).forEach(file => {
    if (!vendored.includes(file)) {
      vendored.push(file);
    }
  });
}

module.exports = {
  mode: "development",
  stats: {
    entrypoints: false,
    performance: true,
    children: false,
    modules: false,
    excludeAssets: /\.(map|gz)$/,
    assetsSort: "name",
    version: false,
    hash: false
  },
  entry: {
    app: [
      path.resolve(pkg.browser) // app JS entry point
    ].concat(vendored)
  },
  output: {
    path: path.resolve("./webpack-build/"),
    filename: "code/[name].js",
    publicPath: '/static/',
    strictModuleExceptionHandling: true
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"]
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
        options: {
          name: "fonts/[name].[ext]"
        }
      }
    ]
  },
  watchOptions: {
    ignored: /^((?![\\/]frontend[\\/]).)*$/ // only watch code in ./frontend/
  },
  resolve: {
    alias: {
      app: path.resolve(pkg.browser.substring(0, pkg.browser.lastIndexOf('/'))),
      base: path.resolve('./frontend/base/js/')
    },
    extensions: [".js", ".jsx", ".json", ".scss", ".css", ".ttf", ".otf", ".eot", ".svg", ".woff", ".woff2"],
    mainFields: ["browser", "module", "main", "style"]
  },
  optimization: {
    noEmitOnErrors: true,
    runtimeChunk: {
      name: "runtime"
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: /([\\/]node_modules[\\/]|[\\/]frontend[\\/]vendor[\\/])/,
          enforce: true
        },
        base: {
          chunks: 'initial',
          name: 'base',
          test: /[\\/]frontend[\\/](base[\\/]|config.scss)/,
          enforce: true
        }
      }
    }
  },
  plugins: [
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      threshold: 10240, // 10KiB
      minRatio: 0.8
    })
  ]
};
