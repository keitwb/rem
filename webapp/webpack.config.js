const webpack = require("webpack"),
  path = require("path"),
  CompressionPlugin = require("compression-webpack-plugin"),
  ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin"),
  MiniCSSPlugin = require("mini-css-extract-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  CleanWebpackPlugin = require("clean-webpack-plugin"),
  pkg = require("./package.json");

var Visualizer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isDev = argv.mode !== "production",
    publicPath = process.env.STATIC_URL || "/";

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
      extensions: [".ts", ".tsx", ".js", ".json", ".css"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    module: {
      rules: [
        {
          test: /\.(css)$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: "style-loader", // inject CSS to page
            },
            {
              loader: "css-loader", // translates CSS into CommonJS modules
              options: {
                importLoaders: 1,
                localsConvention: "camelCase",
                modules: {
                  mode: "local",
                  localIdentName: "[path][name]__[local]",
                },
              },
            },
            {
              loader: "postcss-loader", // Run post css actions
              options: {
                plugins: function() {
                  // post css plugins, can be exported to postcss.config.js
                  return [require("autoprefixer")];
                },
              },
            },
          ],
        },
        {
          test: /\.css/,
          include: [/node_modules/],
          use: [
            {
              loader: "style-loader", // inject CSS to page
            },
            {
              loader: "css-loader", // translates CSS into CommonJS modules
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "assets/",
              },
            },
          ],
        },
        { test: /\.svg$/, loader: "svg-inline-loader" },
        { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      ],
    },

    devServer: {
      //contentBase: path.resolve(__dirname, "dist"),
      compress: true,
      port: 9000,
      historyApiFallback: true,
      //publicPath,
      hot: false,
      overlay: true,
      proxy: {
        "/auth": {
          target: "http://localhost:8080",
          pathRewrite: { "^/auth": "" },
        },
      },
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
            name: "vendor",
            chunks: "all",
          },
          default: {
            name: "app",
            minChunks: 1,
            priority: 0,
            reuseExistingChunk: true,
          },
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
        template: path.resolve(__dirname, "index.html"),
        //favicon: helpers.root('./src/favicon.ico')
      }),
      new ForkTsCheckerWebpackPlugin({
        tslint: false,
      }),
      new MiniCSSPlugin(),
      isDev ? null : new CompressionPlugin({ test: /\.css$|\.js$|\.html$/ }),
      //new Visualizer(),
    ].filter(p => p !== null),
  };
};
