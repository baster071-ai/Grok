#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const action = process.argv[2] ?? "restart";
const port = 8081;

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

function stopPreview() {
  const attempts = [
    { cmd: "sh", args: ["-lc", `lsof -ti tcp:${port} | xargs -r kill -9`] },
    { cmd: "sh", args: ["-lc", `fuser -k ${port}/tcp 2>/dev/null || true`] },
    { cmd: "sh", args: ["-lc", `ss -lntp '( sport = :${port} )' | awk 'NR>1 {print $NF}' | sed -E 's/.*pid=([0-9]+).*/\\1/' | xargs -r kill -9`] },
  ];

  for (const attempt of attempts) {
    const result = spawnSync(attempt.cmd, attempt.args, { stdio: "ignore", shell: false });
    if (result.status === 0 || result.status === null) {
      return;
    }
  }
}

if (action === "stop") {
  stopPreview();
  process.exit(0);
}

if (action === "restart" || action === "start") {
  stopPreview();
  run("npm", ["run", "preview"]);
  process.exit(0);
}

console.error("Usage: node scripts/preview.mjs [start|restart|stop]");
process.exit(1);
