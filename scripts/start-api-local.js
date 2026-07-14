#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const env = { ...process.env };
for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  const k = line.slice(0, i);
  let v = line.slice(i + 1);
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[k] = v;
}

// Root .env may still hold Compose service hostname `mongodb` — rewrite for host runs.
try {
  const u = new URL(env.MONGODB_URI);
  if (u.hostname === "mongodb") {
    env.MONGODB_URI =
      "mongodb://alwisam:alwisam_mongo_change_me@127.0.0.1:27018/alwisam?authSource=admin";
  }
} catch {
  // keep as-is
}

env.API_PORT = env.API_PORT || "4001";
env.NODE_ENV = "development";
env.WEB_ORIGIN = env.WEB_ORIGIN || "http://localhost:3003";
env.COOKIE_SECURE = env.COOKIE_SECURE || "false";

const host = new URL(env.MONGODB_URI).hostname;
console.log(`starting api with mongo host=${host} port=${env.API_PORT}`);

const logFd = fs.openSync("/tmp/alwisam-api.log", "w");
const child = spawn("node", ["dist/main"], {
  cwd: path.join(root, "apps/api"),
  env,
  stdio: ["ignore", logFd, logFd],
  detached: true,
});
child.unref();
fs.writeFileSync("/tmp/alwisam-api.pid", String(child.pid));
console.log(`pid=${child.pid}`);
