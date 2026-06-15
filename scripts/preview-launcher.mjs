import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  statSync,
  writeSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const drive = process.env.PREVIEW_DRIVE || "X:";
const port = process.env.PORT || "4173";
const log = openSync(resolve(root, "preview-server.log"), "a");

const write = (message) => {
  writeSync(log, `[${new Date().toISOString()}] ${message}\n`);
};

spawnSync("subst.exe", [drive, "/D"]);
const mapped = spawnSync("subst.exe", [drive, root]);
if (mapped.status !== 0) {
  write(`Failed to map ${drive} to ${root}`);
  process.exit(mapped.status ?? 1);
}

write(`Mapped ${drive} to ${root}`);
let child;
let restarting = false;
let stopped = false;
let restartTimer;

const startPreview = () => {
  child = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      port,
    ],
    {
      cwd: `${drive}\\`,
      env: process.env,
      stdio: ["ignore", log, log],
    },
  );

  write(`Started preview child ${child.pid}`);
  child.on("exit", (code, signal) => {
    write(`Preview child exited code=${code} signal=${signal}`);
    if (restarting && !stopped) {
      restarting = false;
      setTimeout(startPreview, 250);
      return;
    }
    cleanup();
    process.exit(code ?? 1);
  });
};

const buildFingerprint = () => {
  const paths = [
    resolve(root, "dist", "client", "assets"),
    resolve(root, "dist", "server"),
  ];

  return paths
    .flatMap((path) => {
      if (!existsSync(path)) return [];
      return readdirSync(path, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const filePath = resolve(entry.parentPath, entry.name);
          const stats = statSync(filePath);
          return `${filePath}:${stats.size}:${stats.mtimeMs}`;
        });
    })
    .sort()
    .join("|");
};

let fingerprint = buildFingerprint();
const buildWatcher = setInterval(() => {
  const nextFingerprint = buildFingerprint();
  if (!nextFingerprint || nextFingerprint === fingerprint) return;
  fingerprint = nextFingerprint;
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    if (!child || child.killed || stopped) return;
    write("Build output changed; restarting preview child");
    restarting = true;
    child.kill();
  }, 1_500);
}, 750);

const cleanup = () => {
  if (stopped) return;
  stopped = true;
  write("Cleaning up preview launcher");
  clearInterval(buildWatcher);
  clearTimeout(restartTimer);
  if (child && !child.killed) child.kill();
  spawnSync("subst.exe", [drive, "/D"]);
  closeSync(log);
};

startPreview();

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
