// Postbuild: convert Vite SSR output (dist/client + dist/server) into Vercel's
// Build Output API v3 layout. Bundles the SSR entry with esbuild so the function
// stays under Vercel's 250 MB unzipped limit (no node_modules copy needed).
import { mkdir, cp, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { build as esbuild } from "esbuild";

const root = process.cwd();
const distClient = path.join(root, "dist", "client");
const distServer = path.join(root, "dist", "server");
const out = path.join(root, ".vercel", "output");
const staticOut = path.join(out, "static");
const fnDir = path.join(out, "functions", "ssr.func");

if (!existsSync(distClient) || !existsSync(distServer)) {
  console.error("[build-vercel] dist/client or dist/server missing — did vite build run?");
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(staticOut, { recursive: true });
await mkdir(fnDir, { recursive: true });

// 1. Copy client assets to /static
await cp(distClient, staticOut, { recursive: true });

// 2. Bundle dist/server/server.js into a single file with all deps inlined.
//    This avoids needing node_modules at runtime (which blows past 250 MB).
await esbuild({
  entryPoints: [path.join(distServer, "server.js")],
  outfile: path.join(fnDir, "server.bundled.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  // Mark Node built-ins as external (Node provides them at runtime)
  external: ["node:*"],
  // Keep names readable for debugging
  keepNames: true,
  // Avoid eval warnings from some deps
  logLevel: "warning",
  banner: {
    // Some ESM deps reference these CJS globals; shim them.
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url); import { fileURLToPath as __fp } from 'node:url'; import { dirname as __dn } from 'node:path'; const __filename = __fp(import.meta.url); const __dirname = __dn(__filename);",
  },
});

// 3. Function entrypoint — imports the bundled server and bridges Node <-> Web fetch
const handler = `import * as serverMod from "./server.bundled.mjs";
import { Readable } from "node:stream";

function resolveFetch(mod) {
  const candidates = [
    mod?.default?.fetch,
    mod?.fetch,
    typeof mod?.default === "function" ? mod.default : null,
    mod?.default?.default?.fetch,
    typeof mod?.default?.default === "function" ? mod.default.default : null,
  ];
  for (const c of candidates) {
    if (typeof c === "function") return c.bind(mod);
  }
  console.error("[ssr] server exports:", Object.keys(mod || {}));
  if (mod?.default) console.error("[ssr] default keys:", Object.keys(mod.default));
  throw new Error("Could not find a fetch handler exported from server bundle");
}

const fetchHandler = resolveFetch(serverMod);

function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url, proto + "://" + host);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
    else if (v != null) headers.set(k, String(v));
  }
  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url.toString(), init);
}

async function sendWebResponse(res, webRes) {
  res.statusCode = w
