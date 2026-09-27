#!/usr/bin/env node
import { isMainModule, runWithAppEnv } from "../with-app-env.mjs";

if (isMainModule(import.meta.url)) {
  runWithAppEnv(process.argv.slice(2));
}
