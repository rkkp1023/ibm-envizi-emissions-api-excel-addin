// Copyright IBM Corp. 2025, 2026

/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const urlDev = "https://localhost:8000/";
const urlProd = "https://plugins.app.ibm.com/excel-addin/";

/* global require, module, process, __dirname */

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: ["./src/taskpane/index.tsx"],
      login: ["./src/login/login.ts"],
      "login-callback": ["./src/login/login-callback.ts"],
      functions: ["./src/functions/functions.ts"],
      commands: ["./src/commands/commands-entry.ts"],
      redirect: ["./src/redirect/redirect.ts"],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".html", ".js", ".jsx", ".tsx"],
      fallback: {
        buffer: require.resolve("buffer/"),
      },
    },
    optimization: {
      runtimeChunk: "single", // create a single runtime file
      splitChunks: {
        chunks: "all", // make chunks shared to avoid duplication
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              targets: { browsers: "defaults", node: "current" },
              presets: [
                ["@babel/preset-env"],
                ["@babel/preset-react", { runtime: "automatic" }],
                ["@babel/preset-typescript"],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false, // Disable the strict extension requirement
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions/functions.ts",
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane", "functions", "commands"],
      }),
      new HtmlWebpackPlugin({
        filename: "login.html",
        template: "./src/login/login.html",
        chunks: ["login"],
      }),
      new HtmlWebpackPlugin({
        filename: "login-callback.html",
        template: "./src/login/login-callback.html",
        chunks: ["login-callback"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands/notification.html",
        template: "./src/commands/notification.html",
        chunks: [],
      }),
      new HtmlWebpackPlugin({
        filename: "redirect.html",
        template: "./src/redirect/redirect.html",
        chunks: ["redirect"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content
                  .toString()
                  .replace(new RegExp(urlDev + "(?:public/)?", "g"), urlProd);
              }
            },
          },
          {
            from: "*.xlsx",
            to: "[name][ext]",
          },
        ],
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    performance: {
      maxEntrypointSize: 1048576,
      maxAssetSize: 1048576,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
        publicPath: "/public",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options:
          env.WEBPACK_BUILD || options.https !== undefined
            ? options.https
            : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 8000,
    },
  };
  return config;
};
