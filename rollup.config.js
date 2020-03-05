import typescript from "rollup-plugin-typescript";

export default {
  input: {
    electron: "src/electron/ElectronApp.ts"
  },
  output: {
    dir: "public",
    format: "cjs",
    name: "electron",
    sourcemap: true
  },
  plugins: [typescript()]
};
