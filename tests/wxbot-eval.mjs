/* Score the dev set. Held-out scoring is tests/wxbot-heldout.mjs. */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(process.execPath, [
  path.join(here, "wxbot-heldout.mjs"),
  "--spec", path.join(here, "wxbot-dev.json"),
  "--out", path.join(here, "wxbot-eval-report.json"),
], { stdio: "inherit" });
process.exit(result.status == null ? 1 : result.status);
