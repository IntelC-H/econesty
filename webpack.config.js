var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var pkg = require("./package.json");

module.exports = {
  devtool: "cheap-module-source-map",
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
          presets: ['latest', 'react', ],
          plugins: ["transform-object-rest-spread"]
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader!sass-loader" })
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" })
      }
    ]
  },
  watchOptions: {
    ignored: /node_modules/
  },
  resolve: {
    alias: {
      app: path.resolve("./frontend/js/"),
      style: path.resolve("./frontend/css/")
    },
    extensions: ['.js', '.jsx', '.scss', '.css']
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      ENV: '"development"'
    }),
  ]
};

