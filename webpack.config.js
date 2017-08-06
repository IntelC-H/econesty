const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppCachePlugin = require('appcache-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const pkg = require('./package.json');

const eslintOptions = {
  "parser": "babel-eslint",
  "parserOptions":{
    "sourceType":"module",
    "ecmaFeatures":{
      "binaryLiterals":false,
      "blockBindings":true,
      "defaultParams":true,
      "forOf":true,
      "generators":false,
      "objectLiteralComputedProperties":false,
      "objectLiteralDuplicateProperties":false,
      "objectLiteralShorthandMethods":false,
      "objectLiteralShorthandProperties":false,
      "octalLiterals":true,
      "regexUFlag":false,
      "regexYFlag":false,
      "templateStrings":false,
      "unicodeCodePointEscapes":false,
      "jsx":true,
      "spread":true,
      "experimentalObjectRestSpread":true,
      "modules":true
    }
  },
  "env":{
    "browser":true
  },
  "plugins":[
    "react"
  ],
  "rules":{
    "require-await": 1,
    "react/jsx-uses-vars":2,
    "comma-dangle":2,
    "no-cond-assign":2,
    "no-console":1,
    "no-constant-condition":0,
    "no-control-regex":2,
    "no-debugger":1,
    "no-dupe-keys":2,
    "no-empty":1,
    "no-empty-character-class":2,
    "no-ex-assign":0,
    "no-extra-boolean-cast":2,
    "no-extra-parens":1,
    "no-extra-semi":1,
    "no-func-assign":2,
    "no-inner-declarations":1,
    "no-invalid-regexp":2,
    "no-irregular-whitespace":1,
    "no-negated-in-lhs":0,
    "no-obj-calls":0,
    "no-regex-spaces":2,
    "no-sparse-arrays":0,
    "no-unreachable":2,
    "use-isnan":1,
    "valid-jsdoc":2,
    "valid-typeof":2,
    "block-scoped-var":0,
    "consistent-return":2,
    "curly":0,
    "default-case":2,
    "dot-notation":2,
    "eqeqeq":2,
    "guard-for-in":0,
    "no-alert":2,
    "no-caller":2,
    "no-div-regex":0,
    "no-else-return":2,
    "no-eq-null":2,
    "no-eval":2,
    "no-extend-native":2,
    "no-extra-bind":2,
    "no-fallthrough":0,
    "no-floating-decimal":2,
    "no-implied-eval":2,
    "no-iterator":0,
    "no-labels":0,
    "no-lone-blocks":0,
    "no-loop-func":0,
    "no-multi-spaces":0,
    "no-multi-str":0,
    "no-native-reassign":0,
    "no-new":0,
    "no-new-func":0,
    "no-new-wrappers":0,
    "no-octal":0,
    "no-octal-escape":0,
    "no-process-env":0,
    "no-proto":0,
    "no-redeclare":1,
    "no-return-assign":2,
    "no-script-url":2,
    "no-self-compare":0,
    "no-sequences":0,
    "no-unused-expressions":0,
    "radix":0,
    "no-catch-shadow":0,
    "no-delete-var":0,
    "no-label-var":0,
    "no-shadow":0,
    "no-shadow-restricted-names":0,
    "no-undef":0,
    "no-undef-init":0,
    "no-undefined":0,
    "no-unused-vars":1,
    "no-use-before-define":0,
    "brace-style":1,
    "camelcase":0,
    "comma-spacing":0,
    "comma-style":0,
    "consistent-this":0,
    "eol-last":0,
    "func-names":0,
    "func-style":0,
    "key-spacing":0,
    "max-nested-callbacks":0,
    "new-cap":0,
    "new-parens":2,
    "no-array-constructor":2,
    "no-inline-comments":0,
    "no-lonely-if":2,
    "no-mixed-spaces-and-tabs":2,
    "no-multiple-empty-lines":0,
    "no-nested-ternary":0,
    "no-new-object":0,
    "no-space-before-semi":0,
    "no-spaced-func":1,
    "no-ternary":0,
    "no-trailing-spaces":1,
    "no-underscore-dangle":0,
    "no-wrap-func":0,
    "one-var":0,
    "operator-assignment":0,
    "padded-blocks":0,
    "quote-props":0,
    "quotes":0,
    "semi":0,
    "sort-vars":0,
    "space-after-function-name":0,
    "space-after-keywords":0,
    "space-before-blocks":0,
    "space-in-brackets":0,
    "space-in-parens":0,
    "space-infix-ops":0,
    "space-return-throw-case":0,
    "space-unary-ops":0,
    "spaced-line-comment":0,
    "wrap-regex":0
  }
};

const extractStyle = new ExtractTextPlugin({
  filename: 'code/[name].css',
  allChunks: true
});

module.exports = {
  stats: {
    children: false,
    modulesSort: "size",
    assetsSort: "ext",
    usedExports: true
  },
  devtool: "source-map",
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
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["latest", "react"],
              plugins: ["transform-object-rest-spread", "syntax-decorators", ["transform-react-jsx", { "pragma": "h" }]]
            }
          },
          {
            loader: "eslint-loader",
            options: eslintOptions
          }
        ]
      },
      {
        test: /\.scss$/,
        loader: extractStyle.extract({ use: ["css-loader", "sass-loader"] }),
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
      app: path.resolve('./frontend/js/')
    },
    extensions: [".js", ".jsx", ".json", ".scss", ".css", ".ttf", ".otf", ".eot", ".svg", ".woff", ".woff2"],
    mainFields: ["browser", "module", "main", "style"]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
      // minChunks(module, count) {
      //   var context = module.context;
      //   return context && context.indexOf('node_modules') >= 0;
      // },
    }),
    extractStyle,
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: false,
      sourceMap: true
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /.*/,
      threshold: 10240,
      minRatio: 0.8
    }),
    // new AppCachePlugin({
    //   // TODO: fill out cache: [], and fallback: []
    //   settings: ['prefer-online'],
    //   output: 'econesty.appcache'
    // }),
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
