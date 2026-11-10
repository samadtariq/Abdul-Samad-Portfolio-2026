import { build, context } from "esbuild";
import { mkdir, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
await mkdir(path.join(root, "dist"), { recursive: true });
await cp(path.join(root, "public"), path.join(root, "dist"), {
  recursive: true,
});
const jobs = [
  {
    absWorkingDir: root,
    entryPoints: ["src/main.jsx"],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: "esm",
    outfile: path.join(root, "dist/client.js"),
    define: { "process.env.NODE_ENV": '"production"' },
  },
  {
    absWorkingDir: root,
    entryPoints: ["src/entry-server.jsx"],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile: path.join(root, "dist-ssr/render.mjs"),
  },
];
if (process.argv.includes("--watch")) {
  const contexts = await Promise.all(jobs.map((x) => context(x)));
  await Promise.all(contexts.map((x) => x.watch()));
  console.log(
    "Client/SSR source watching. Open the Express server URL; refresh after edits.",
  );
  for (const s of ["SIGINT", "SIGTERM"])
    process.on(s, async () => {
      await Promise.all(contexts.map((x) => x.dispose()));
      process.exit(0);
    });
} else {
  await Promise.all(jobs.map((x) => build(x)));
  console.log("Client assets and React SSR build complete.");
}
