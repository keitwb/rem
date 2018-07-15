const webpack = require('webpack'),
      path = require('path'),
      CompressionPlugin = require('compression-webpack-plugin'),
      ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
      //ExtractTextPlugin = require('extract-text-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      pkg = require('./package.json');

var Visualizer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV !== "production",
      publicPath = process.env.STATIC_URL || '/static/';

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist",
        publicPath,
    },

    mode: 'none',
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      publicPath,
    },

    optimization: {
      splitChunks: {
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: true,
        cacheGroups: {
          vendor: {
            minChunks: 1,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'vendor',
            chunks: 'all',
          },
          default: {
            name: 'app',
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          }
        },
      },
      concatenateModules: true,
      noEmitOnErrors: true,
      minimize: !isDev,
    },

    plugins: [
      //new CleanWebpackPlugin(['dist/**/*'], {root: __dirname, watch: true}),
      new HtmlWebpackPlugin({
        inject: true,
        template: './index.html',
        //favicon: helpers.root('./src/favicon.ico')
      }),
      new ForkTsCheckerWebpackPlugin({
        tslint: true,
      }),
      //new ExtractTextPlugin("style.css"),
      new webpack.EnvironmentPlugin({
        "NODE_ENV": "development",
      }),
      isDev ? null : new CompressionPlugin({test: /\.css$|\.js$|\.html$/}),
      //new Visualizer(),
    ].filter(p => p !== null),
};
