const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

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

module.exports = {
  mode: "development",
  stats: {
    assets: false,
    performance: true,
    children: false,
    modulesSort: "size",
    modules: false,
    excludeAssets: /.*/,
    assetsSort: "ext",
    publicPath: false,
    version: false,
    hash: true,
    timings: false
  },
  performance: {
    hints: false,
    maxAssetSize: 90000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  },
  entry: {
    app: [
      path.resolve(pkg.browser),
      path.resolve(pkg.style)
    ],
    base: [
      path.resolve("frontend/base/css/base.scss"),
      path.resolve("frontend/base/js/base.js")
    ],
    vendor: Object.keys(pkg.dependencies).concat(vendored)
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
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "eslint-loader",
            options: pkg.eslint
          }
        ]
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
			path.resolve("frontend/app/css/")
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
    ignored: /^((?!frontend).)*$/ // only watch code in ./frontend/
  },
  resolve: {
    alias: {
      app: path.resolve('./frontend/app/js'),
      base: path.resolve('./frontend/base/js/')
    },
    extensions: [".js", ".jsx", ".json", ".scss", ".css", ".ttf", ".otf", ".eot", ".svg", ".woff", ".woff2"],
    mainFields: ["browser", "module", "main", "style"]
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    extractStyle,
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      threshold: 10240,
      minRatio: 0.8
    }),
    new StyleLintPlugin({
      syntax: 'scss'
    })
  ]
};
