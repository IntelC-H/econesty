const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const pkg = require('./package.json');

const extractStyle = new ExtractTextPlugin({
  filename: 'code/[name].css',
  allChunks: true
});

module.exports = {
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
    vendor: Object.keys(pkg.dependencies).concat(pkg.additionalFiles)
  },
  output: {
    path: path.resolve(pkg.files),
    filename: "code/[name].js",
    publicPath: '/',
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
        loader: extractStyle.extract({ use: ["css-loader", "sass-loader"] })
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
      app: path.resolve('./frontend/js/'),
      style: path.resolve('./frontend/css/')
    },
    extensions: [".js", ".jsx", ".json", ".scss", ".css", ".ttf", ".otf", ".eot", ".svg", ".woff", ".woff2"],
    mainFields: ["browser", "module", "main", "style"]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),
    extractStyle,
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      threshold: 10240,
      minRatio: 0.8
    }),
    new StyleLintPlugin({
      syntax: 'scss'
    }),
    new HtmlWebpackPlugin({
      cache: true,
      title: "Econesty",
      filename: "index.html",
      xhtml: true,
      inject: false,
      template: require('html-webpack-template'),
      meta: [
        {
          name: "viewport",
          content: "width=320, initial-scale=1.0, maximum-scale=1.0"
        }
      ],
      minify: {
        caseSensitive: true,
        collapseWhitespace: true
      }
    })
  ]
};
