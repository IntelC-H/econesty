var path = require('path');
var webpack = require('webpack');
//var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// TODO: bundle CSS

module.exports = {
  entry: ['./frontend/js/index.js'],
  output: {
    path: path.resolve('./.econesty_webpack_build/'),
    filename: 'app.js',
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
    extensions: ['.js', '.jsx', '.scss'],
  },
  plugins: [
    new ExtractTextPlugin('app.css')
//    new UglifyJSPlugin({comments: false})
  ]
};

