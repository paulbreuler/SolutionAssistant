import typescript from "rollup-plugin-typescript";

export default {
  input: {
    electron: "public/electron.ts"
  },
  output: {
    dir: "public",
    format: "cjs",
    name: "electron",
    sourcemap: true
  },
  plugins: [typescript()]
};
