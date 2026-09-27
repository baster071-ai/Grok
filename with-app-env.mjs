import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export function projectRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)));
}

export function readAppEnv(root = projectRoot()) {
  const envFile = resolve(root, ".grok", "app-env.json");
  if (!existsSync(envFile)) return {};

  try {
    const text = readFileSync(envFile, "utf8");
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function mergeAppEnv(fileEnv = {}, processEnv = process.env) {
  const merged = { ...fileEnv, ...processEnv };
  merged.VITE_AUTH_ENABLED ??= "false";
  return merged;
}

export function writeAppEnv(root = projectRoot(), value = { VITE_AUTH_ENABLED: "false" }) {
  const dir = resolve(root, ".grok");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "app-env.json"), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function isMainModule(metaUrl = import.meta.url) {
  const entry = process.argv[1] ? resolve(process.argv[1]) : null;
  return entry !== null && resolve(fileURLToPath(metaUrl)) === entry;
}

export function runWithAppEnv(argv = process.argv.slice(2), root = projectRoot()) {
  const currentAppEnv = readAppEnv(root);
  const resolvedEnv = mergeAppEnv(currentAppEnv, process.env);
  const env = { ...process.env, ...resolvedEnv };

  if (!env.VITE_AUTH_ENABLED) {
    env.VITE_AUTH_ENABLED = "false";
  }

  writeAppEnv(root, { VITE_AUTH_ENABLED: String(env.VITE_AUTH_ENABLED) });

  const command = argv[0] ?? "vite";
  const args = argv.slice(1);
  const viteBin = resolve(root, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite");
  const proc = spawnSync(existsSync(viteBin) ? viteBin : command, command === "vite" ? args : [command, ...args], {
    stdio: "inherit",
    env,
    cwd: root,
    shell: false,
  });

  if (proc.error) {
    throw proc.error;
  }

  process.exit(proc.status ?? 0);
}

if (isMainModule()) {
  runWithAppEnv(process.argv.slice(2));
}
