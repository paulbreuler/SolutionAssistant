const path = require("path");
module.exports = [
  {
    mode: "development",
    entry: "./public/electron.ts",
    target: "electron-main",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: [
            /public/,
            path.resolve(__dirname, "src\\electron-extensions")
          ],
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.development.json"
          }
        }
      ]
    },
    output: {
      path: __dirname + "/public",
      filename: "electron.js"
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"]
    },
    watchOptions: {
      ignored: /node_modules/
    },
    devtool: "source-map",
    node: {
      __dirname: true
    }
  }
];
