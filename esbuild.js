const esbuild = require("esbuild");
const { execSync } = require("child_process");
const glob = require("glob");

// Clean lib folder
execSync("rimraf lib");

// Find all .ts files in src/ (excluding .test.ts etc. if you want)
const entryPoints = glob.sync("src/**/*.ts");

// Shared build options
const shared = {
  entryPoints,
  bundle: false,
  sourcemap: true,
  target: ["esnext"],
  platform: "node",
  external: [],
  outbase: "src",
};

// ESM build
esbuild
  .build({
    ...shared,
    outdir: "lib/esm",
    format: "esm",
  })
  .catch(() => process.exit(1));

// CJS build
esbuild
  .build({
    ...shared,
    target: "es2015",
    outdir: "lib/cjs",
    format: "cjs",
  })
  .catch(() => process.exit(1));
