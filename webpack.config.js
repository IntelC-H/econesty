var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var pkg = require("./package.json");

module.exports = {
  entry: {
    app: ['./frontend/js/index.js'],
    vendor: Object.keys(pkg.dependencies)
  },
  output: {
    path: path.resolve('./.econesty_webpack_build/'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("css-loader!sass-loader")
      }
    ]
  },
  resolve: {
    alias: {
      app: path.resolve("./frontend/js/"),
      style: path.resolve("./frontend/css/")
    },
    extensions: ['.js', '.jsx', '.scss', '.css']
  },
  plugins: [
    new ProgressBarPlugin(),
    new ExtractTextPlugin('app.css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    })
  ]
};

