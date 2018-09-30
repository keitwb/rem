const webpack = require('webpack'),
      path = require('path'),
      CompressionPlugin = require('compression-webpack-plugin'),
      ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
      //ExtractTextPlugin = require('extract-text-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      pkg = require('./package.json');

var Visualizer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isDev = argv.mode !== "production",
        publicPath = process.env.STATIC_URL || '/static/';

  console.log(`Mode is ${argv.mode}`);
  console.log(`Public path is ${publicPath}`);
  return {
    context: __dirname,
    entry: "./src/index.tsx",
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "dist"),
        publicPath,
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
    },

    module: {
        rules: [
          { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
          { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
          {
            test: /\.(css)$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }],
          },
          {
            test: /\.(scss)$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles Sass to CSS
            }]
          },
        ]
    },

    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      compress: true,
      port: 9000,
      historyApiFallback: true,
      publicPath,
      hot: false,
      overlay: true,
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
      concatenateModules: !isDev,
      noEmitOnErrors: true,
      minimize: !isDev,
    },

    plugins: [
      //new CleanWebpackPlugin(['dist/**/*'], {root: __dirname, watch: true}),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, 'index.html'),
        //favicon: helpers.root('./src/favicon.ico')
      }),
      new ForkTsCheckerWebpackPlugin({
        tslint: true,
      }),
      //new ExtractTextPlugin("style.css"),
      isDev ? null : new CompressionPlugin({test: /\.css$|\.js$|\.html$/}),
      //new Visualizer(),
    ].filter(p => p !== null),
  };
}
