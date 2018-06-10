const webpack = require('webpack'),
    CompressionPlugin = require('compression-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    pkg = require('./package.json');

var Visualizer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isVendor = ({ resource }) => /node_modules/.test(resource);

const publicPath = process.env.STATIC_URL || '/static/';

module.exports = {
  context: __dirname,
  entry: __dirname + '/src/main.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'js/[name].[hash].js',
    publicPath,
    chunkFilename: 'js/[name].[hash].js',
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': __dirname + "/src",
    },
  },

  module: {
    rules: [
      { test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        options: {
          extractCSS: true,
          loaders: {
            ts: 'ts-loader'
          },
        }
      },
      { test: /\.ts$/,
        loader: 'ts-loader',
        include: [__dirname + "/src"],
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        }
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['dist/**/*'], {root: __dirname, watch: true}),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: isVendor,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: './index.html',
      //favicon: helpers.root('./src/favicon.ico')
    }),
    new ExtractTextPlugin("style.css"),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      "NODE_ENV": "development",
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      vue: true,
    }),
    new CompressionPlugin({test: /\.css$|\.js$|\.html$/}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    //new Visualizer(),
    //new UglifyJSPlugin({
      //sourceMap: true
    //}),
  ]
}
