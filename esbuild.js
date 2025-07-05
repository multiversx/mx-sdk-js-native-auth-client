const esbuild = require("esbuild");
const glob = require("glob");

/*
  The reason why we use esbuild instead of tsc is because esbuild can output .mjs files
*/

const filesToInclude = ["./src/**/*.ts"].join(",");

const allFiles = glob.sync(filesToInclude);

const files = allFiles.filter((file) => {
  const hasTestFiles = file.includes("/tests/");
  return !hasTestFiles;
});

const executeBuild = () =>
  esbuild
    .build({
      entryPoints: files,
      splitting: true,
      format: "esm",
      outdir: "lib",
      treeShaking: true,
      minify: true,
      bundle: true,
      sourcemap: true,
      chunkNames: "__chunks__/[name]-[hash]",
      target: ["es2021"],
      outExtension: { ".js": ".mjs" },
      tsconfig: "./tsconfig.json",
      platform: "node",
      define: {
        global: "global",
        process: "process",
        Buffer: "Buffer",
      },
    })
    .then(() => {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `[${new Date().toLocaleTimeString()}] native-auth-client build succeeded for esm types`
      );
    })
    .catch((err) => {
      console.log(11, err);
      process.exit(1);
    });

executeBuild();
