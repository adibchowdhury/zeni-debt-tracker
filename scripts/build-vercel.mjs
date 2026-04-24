// Postbuild: convert Vite SSR output (dist/client + dist/server) into Vercel's
// Build Output API v3 layout (.vercel/output). Vercel auto-detects this folder
// when "framework" is null in vercel.json.
import { mkdir, cp, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

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

// Copy client assets to /static
await cp(distClient, staticOut, { recursive: true });

// Copy SSR bundle into the function
await cp(distServer, fnDir, { recursive: true });

// Function entrypoint: bridge Node req/res to TanStack Start's Web fetch handler
const handler = `import handler from "./server.js";
import { Readable } from "node:stream";

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
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (!webRes.body) {
    res.end();
    return;
  }
  Readable.fromWeb(webRes.body).pipe(res);
}

export default async function (req, res) {
  try {
    const webReq = toWebRequest(req);
    const webRes = await handler.fetch(webReq);
    await sendWebResponse(res, webRes);
  } catch (err) {
    console.error("[ssr] handler error:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("Internal Server Error");
  }
}
`;
await writeFile(path.join(fnDir, "index.mjs"), handler);

await writeFile(
  path.join(fnDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

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

console.log("[build-vercel] Wrote .vercel/output (static + ssr.func)");
