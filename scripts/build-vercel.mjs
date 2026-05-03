import { mkdir, cp, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { nodeFileTrace } from "@vercel/nft";

const root = process.cwd();
const distClient = path.join(root, "dist", "client");
const distServerEntry = path.join(root, "dist", "server", "server.js");
const out = path.join(root, ".vercel", "output");
const staticOut = path.join(out, "static");
const fnDir = path.join(out, "functions", "ssr.func");

if (!existsSync(distClient) || !existsSync(distServerEntry)) {
  console.error("[build-vercel] dist/client or dist/server/server.js missing — did the build run?");
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(staticOut, { recursive: true });
await mkdir(fnDir, { recursive: true });

// Copy client assets to /static
await cp(distClient, staticOut, { recursive: true });

// Trace and copy only the server files actually needed at runtime
const { fileList } = await nodeFileTrace([distServerEntry], {
  base: root,
  processCwd: root,
});

for (const file of fileList) {
  const src = path.join(root, file);
  const dest = path.join(fnDir, file);
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true });
}

const handler = `import * as serverMod from "./dist/server/server.js";
import { Readable } from "node:stream";

function resolveFetch(mod) {
  const candidates = [
    mod?.default?.fetch,
    mod?.fetch,
    typeof mod?.default === "function" ? mod.default : null,
    mod?.default?.default?.fetch,
    typeof mod?.default?.default === "function" ? mod.default.default : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "function") {
      return candidate.bind(mod);
    }
  }

  console.error("[ssr] server.js exports:", Object.keys(mod || {}));
  if (mod?.default && typeof mod.default === "object") {
    console.error("[ssr] server.js default keys:", Object.keys(mod.default));
  }

  throw new Error("Could not find a fetch handler exported from server.js");
}

const fetchHandler = resolveFetch(serverMod);

function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url, proto + "://" + host);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }

  const init = { method: req.method, headers };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }

  return new Request(url.toString(), init);
}

async function sendWebResponse(res, webRes) {
  res.statusCode = webRes.status;

  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!webRes.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(webRes.body);
  nodeStream.pipe(res);
}

export default async function handler(req, res) {
  try {
    const webReq = toWebRequest(req);
    const webRes = await fetchHandler(webReq);
    await sendWebResponse(res, webRes);
  } catch (err) {
    console.error("[ssr] handler error:", err && err.stack ? err.stack : err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("Internal Server Error: " + (err?.message || "unknown"));
  }
}
`;

await writeFile(path.join(fnDir, "index.mjs"), handler);

await writeFile(path.join(fnDir, "package.json"), JSON.stringify({ type: "module" }, null, 2));

await writeFile(
  path.join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

const config = {
  version: 3,
  routes: [
    {
      src: "^/assets/(.*)$",
      headers: { "cache-control": "public, max-age=31536000, immutable" },
      continue: true,
    },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/ssr" },
  ],
};

await writeFile(path.join(out, "config.json"), JSON.stringify(config, null, 2));

console.log("[build-vercel] Wrote .vercel/output (static + traced ssr.func)");
