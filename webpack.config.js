var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

// TODO: bundle CSS

module.exports = {
  entry: ["whatwg-fetch", './frontend/js/index.js'],
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
      }
    ]
  },
  resolve: {
    alias: {
      app: path.resolve("./frontend/js/")
    },
    extensions: ['.js', '.jsx'],
  },
//  plugins: [
//    new UglifyJSPlugin({comments: false})
//  ]
};

