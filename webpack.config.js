const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const EasyStylelintPlugin = require('easy-stylelint-plugin');

const fs = require('fs');
const pkg = require('./package.json');

const extractStyle = new ExtractTextPlugin({
  filename: 'code/[name].css',
  allChunks: true
});

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

let vendored = pkg.vendorOrder ? pkg.vendorOrder : []; // first load the files that need to be bundled in order.

// Then load everything else
if (pkg.vendorDirectory) {
  filesIn(pkg.vendorDirectory).forEach(file => {
    if (!vendored.includes(file)) {
      vendored.push(file);
    }
  });
}

let appStyleDir = path.resolve(pkg.style);
appStyleDir = path.resolve(appStyleDir.substring(0, appStyleDir.lastIndexOf('/')));

let appJSDir = path.resolve(pkg.browser);
appJSDir = path.resolve(appJSDir.substring(0, appJSDir.lastIndexOf('/')));

module.exports = {
  mode: "development",
  stats: {
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
      path.resolve(pkg.browser), // app JS entry point
      path.resolve(pkg.style), // app CSS entrypoint
      path.resolve("./frontend/base/css/base.scss")
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
        test: /\.scss$/,
        loader: extractStyle.extract({ use: [
	    { loader: "css-loader" },
	    {
		loader: "sass-loader",
		options: {
		    includePaths: [
			path.resolve("frontend/base/css/"),
			appStyleDir
		    ]
		}
	    }
	]})
      },
      {
        test: /\.css$/,
        loader: extractStyle.extract({ use: ["css-loader"]})
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
      app: appJSDir,
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
    extractStyle,
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      threshold: 10240, // 10KiB
      minRatio: 0.8
    }),
    new EasyStylelintPlugin({
      syntax: 'scss'
    })
  ]
};
