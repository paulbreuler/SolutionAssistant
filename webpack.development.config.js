module.exports = [
  {
    mode: "development",
    entry: "./public/electron.ts",
    target: "electron-main",
    watch: true,
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /public/,
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
      extensions: [".ts", ".tsx", ".js"]
    },
    devtool: "source-map"
  }
];
