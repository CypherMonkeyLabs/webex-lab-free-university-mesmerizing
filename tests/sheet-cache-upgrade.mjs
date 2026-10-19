import { chromium } from "@playwright/test";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";

const root = "/tmp/wx-serve";
const port = 8766;
const origin = `http://127.0.0.1:${port}`;
const oldRev = process.env.SHEET_OLD_REV || "f48416d";
const guideJs = "guide.js?v=e4b5a85ecfe4";
const cacheName = "webex-university-v30";
const times = [100, 500, 2000, 10000];

fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root);
execSync(`git archive ${oldRev} | tar -C ${root} -x`, { cwd: "/workspace" });
const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", root], { stdio: "ignore" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ready() {
  for (let i = 0; i < 50; i += 1) {
    try {
      if ((await fetch(origin + "/")).ok) return;
    } catch (error) { /* booting */ }
    await sleep(100);
  }
  throw new Error("server did not start");
}

function copyNew() {
  execSync("python3 - << 'PY'\nimport os, shutil\nsrc='/workspace'\ndst='/tmp/wx-serve'\nskip={'.git','node_modules'}\nfor dirpath, dirnames, filenames in os.walk(src):\n    dirnames[:] = [name for name in dirnames if name not in skip]\n    rel=os.path.relpath(dirpath, src)\n    target=dst if rel=='.' else os.path.join(dst, rel)\n    os.makedirs(target, exist_ok=True)\n    for name in filenames:\n        shutil.copy2(os.path.join(dirpath, name), os.path.join(target, name))\nPY");
}

async function rects(page) {
  return page.evaluate(() => {
    const panel = document.querySelector("#cg-panel");
    const send = panel && panel.querySelector("button[type=submit]");
    const log = panel && panel.querySelector(".cg-log");
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { y: Math.round(r.y * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, h: Math.round(r.height * 10) / 10 };
    };
    return {
      sheet: document.documentElement.classList.contains("guide-sheet"),
      greet: !!(document.querySelector(".cg-root") && document.querySelector(".cg-root").classList.contains("is-greeting")),
      guide: (document.querySelector("script[src*='guide/guide.js']") || {}).src || "",
      panel: box(panel),
      send: box(send),
      log: box(log),
    };
  });
}

async function clickMonkey(page) {
  const monkey = page.locator("button.cg-monkey");
  await monkey.waitFor({ state: "visible", timeout: 15000 });
  const box = await monkey.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function runPass(page, height, tour) {
  await page.setViewportSize({ width: 390, height });
  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  if (tour === "skipped") {
    await page.waitForFunction(() => {
      const root = document.querySelector(".cg-root");
      return root && root.classList.contains("is-greeting");
    }, null, { timeout: 8000 });
  }
  await clickMonkey(page);
  const samples = {};
  let elapsed = 0;
  for (const mark of times) {
    await page.waitForTimeout(mark - elapsed);
    elapsed = mark;
    samples[mark] = await rects(page);
  }
  const send = page.locator("#cg-panel button[type=submit]");
  const target = await send.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.locator("#cg-panel input").fill("What can you help with?");
  await page.mouse.click(target.x, target.y);
  const answered = await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll("#cg-panel .cg-bubble.is-bot")).some((node) => /Control Hub/i.test(node.textContent || ""));
  }, null, { timeout: 8000 }).then(() => true).catch(() => false);
  const after = await rects(page);
  return { samples, answered, after };
}

function assertPass(label, height, result) {
  if (!result.answered) throw new Error(label + " click did not answer");
  if (!result.after.log || result.after.log.h < 100) throw new Error(label + " log " + JSON.stringify(result.after.log));
  for (const mark of times) {
    const row = result.samples[mark];
    const panel = row.panel;
    const send = row.send;
    if (!row.sheet) throw new Error(label + " @" + mark + "ms not pinned " + JSON.stringify(row));
    if (!panel || panel.y < -1 || panel.bottom > height + 1 || panel.h < height - 2) {
      throw new Error(label + " @" + mark + "ms panel " + JSON.stringify(panel));
    }
    if (!send || send.y < 0 || send.bottom > height + 0.5) {
      throw new Error(label + " @" + mark + "ms send " + JSON.stringify(send));
    }
  }
}

await ready();
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const report = {};
try {
  const upgrade = await browser.newContext({ serviceWorkers: "allow" });
  const primer = await upgrade.newPage();
  await primer.setViewportSize({ width: 390, height: 430 });
  await primer.goto(origin + "/", { waitUntil: "domcontentloaded" });
  await primer.waitForFunction(async () => (await caches.keys()).includes("webex-university-v29"), null, { timeout: 20000 });
  copyNew();
  await primer.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    try { await reg.update(); } catch (error) { /* a reload checks the script again */ }
  });
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await primer.reload({ waitUntil: "domcontentloaded" });
    const found = await primer.waitForFunction(async () => {
      const keys = await caches.keys();
      const reg = await navigator.serviceWorker.getRegistration();
      const script = document.querySelector("script[src*='guide/guide.js']");
      const src = script ? script.src : "";
      return keys.includes("webex-university-v30")
        && !keys.includes("webex-university-v29")
        && reg && reg.active && reg.active.state === "activated"
        && navigator.serviceWorker.controller
        && src.includes("guide.js?v=e4b5a85ecfe4");
    }, null, { timeout: 15000 }).then(() => true).catch(() => false);
    if (found) break;
  }
  const readyState = await primer.evaluate(async () => {
    const keys = await caches.keys();
    const cache = keys.includes("webex-university-v30") ? await caches.open("webex-university-v30") : null;
    const guide = cache ? await cache.match("./guide/guide.js") : null;
    const shell = cache ? await cache.match("./assets/js/shell.js") : null;
    const text = guide ? await guide.text() : "";
    const shellText = shell ? await shell.text() : "";
    const live = document.querySelector("script[src*='guide/guide.js']");
    return {
      keys,
      pinned: text.includes("if (window.innerWidth <= 720 && !panel.hidden) return"),
      shell: shellText.includes("e4b5a85ecfe4"),
      guide: live ? live.src : "",
      controlled: !!(navigator.serviceWorker.controller),
    };
  });
  if (!readyState.keys.includes("webex-university-v30") || readyState.keys.includes("webex-university-v29") || !readyState.pinned || !readyState.shell || !String(readyState.guide).includes(guideJs)) {
    throw new Error("upgrade cache not ready " + JSON.stringify(readyState));
  }
  await primer.close();

  const errors = [];
  for (const tour of ["skipped", "shown"]) {
    for (const height of [430, 844]) {
      const page = await upgrade.newPage();
      if (tour === "skipped") {
        await page.addInitScript(() => localStorage.setItem("canon-tour-done", "skip"));
      }
      const key = "upgrade-" + tour + "-" + height;
      try {
        report[key] = await runPass(page, height, tour);
        assertPass(key, height, report[key]);
        const guide = report[key].samples[100] && report[key].samples[100].guide;
        if (!String(guide).includes(guideJs)) errors.push(key + " loaded " + guide);
      } catch (error) {
        errors.push(String(error && error.message || error));
      }
      await page.close();
    }
  }
  await upgrade.close();

  const fresh = await browser.newContext({ serviceWorkers: "allow" });
  for (const tour of ["skipped", "shown"]) {
    for (const height of [430, 844]) {
      const page = await fresh.newPage();
      if (tour === "skipped") {
        await page.addInitScript(() => localStorage.setItem("canon-tour-done", "skip"));
      }
      const key = "fresh-" + tour + "-" + height;
      try {
        report[key] = await runPass(page, height, tour);
        assertPass(key, height, report[key]);
        const guide = report[key].samples[100] && report[key].samples[100].guide;
        if (!String(guide).includes(guideJs)) errors.push(key + " loaded " + guide);
      } catch (error) {
        errors.push(String(error && error.message || error));
      }
      await page.close();
    }
  }
  await fresh.close();
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  const brief = {};
  for (const [key, value] of Object.entries(report)) {
    if (!value || !value.samples) { brief[key] = value; continue; }
    brief[key] = {
      answered: value.answered,
      log: value.after.log,
      guide: value.samples[100] && value.samples[100].guide,
      samples: Object.fromEntries(times.map((mark) => [mark, { panel: value.samples[mark].panel, send: value.samples[mark].send, sheet: value.samples[mark].sheet, greet: value.samples[mark].greet }])),
    };
  }
  console.log(JSON.stringify(brief, null, 2));
  server.kill();
  await browser.close();
}
