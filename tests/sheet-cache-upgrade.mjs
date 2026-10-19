import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import fs from "node:fs";

const root = "/tmp/wx-serve";
const port = 8766;
const origin = `http://127.0.0.1:${port}`;
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root);
const oldRev = process.env.SHEET_OLD_REV || "ea4b938";
execSync(`git archive ${oldRev} | tar -C ${root} -x`, { cwd: "/workspace" });

const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", root], {
  stdio: "ignore",
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ready() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(origin + "/");
      if (response.ok) return;
    } catch (error) {
      /* server still booting */
    }
    await sleep(100);
  }
  throw new Error("server did not start");
}

async function readSheet(page) {
  return page.evaluate(() => {
    const panel = document.querySelector("#cg-panel");
    const input = panel && panel.querySelector("input");
    const send = panel && panel.querySelector("button[type=submit]");
    const log = panel && panel.querySelector(".cg-log");
    const box = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        y: Math.round(rect.y * 10) / 10,
        bottom: Math.round(rect.bottom * 10) / 10,
        h: Math.round(rect.height * 10) / 10,
      };
    };
    const style = panel ? getComputedStyle(panel) : null;
    const guide = document.querySelector("script[src*='guide/guide.js']");
    const css = [...document.querySelectorAll("link[href*='guide/guide.css']")].map((link) => link.href);
    return {
      sheet: document.documentElement.classList.contains("guide-sheet"),
      inlineHeight: panel ? panel.style.height : "",
      inlineMax: panel ? panel.style.maxHeight : "",
      height: style && style.height,
      maxH: style && style.maxHeight,
      top: style && style.top,
      bottom: style && style.bottom,
      panel: box(panel),
      input: box(input),
      send: box(send),
      log: box(log),
      guide: guide ? guide.src : "",
      css,
    };
  });
}

async function clickSend(page) {
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.locator("button.cg-monkey").click();
  await page.locator("#cg-panel").waitFor({ state: "visible" });
  const open = await readSheet(page);
  const input = page.locator("#cg-panel input");
  const send = page.locator("#cg-panel button[type=submit]");
  await input.fill("What can you help with?");
  const box = await send.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, bottom: rect.bottom };
  });
  const beforeCount = await page.locator("#cg-panel .cg-bubble.is-bot").count();
  const hit = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.tagName + "." + (el.className || "") + " " + (el.getAttribute("type") || "") : "none";
  }, { x: box.x, y: box.y });
  await page.mouse.click(box.x, box.y);
  const appeared = await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll("#cg-panel .cg-bubble.is-bot"));
    return nodes.some((node) => /Control Hub/i.test(node.textContent || ""));
  }, null, { timeout: 8000 }).then(() => true).catch(() => false);
  const bubbles = await page.locator("#cg-panel .cg-bubble").evaluateAll((nodes) => nodes.map((node) => (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140)));
  const after = await readSheet(page);
  return {
    open,
    clickY: Math.round(box.y * 10) / 10,
    clickBottom: Math.round(box.bottom * 10) / 10,
    hit,
    beforeCount,
    answered: appeared,
    bubbles,
    after,
  };
}

async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem("canon-tour-done", "skip");
    localStorage.setItem("cg-greet-done", "1");
  });
}

async function cachesOf(page) {
  return page.evaluate(async () => {
    const keys = await caches.keys();
    const reg = await navigator.serviceWorker.getRegistration();
    return {
      keys,
      script: reg && reg.active ? reg.active.scriptURL : "",
      state: reg && reg.active ? reg.active.state : "",
    };
  });
}

await ready();
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const report = { fresh: {}, upgrade: {} };

try {
  const upgrade = await browser.newContext({ serviceWorkers: "allow" });
  const page = await upgrade.newPage();
  await boot(page);
  await page.setViewportSize({ width: 390, height: 430 });
  await page.goto(origin + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    return keys.includes("webex-university-v28");
  }, null, { timeout: 20000 });
  report.upgrade.beforeSwap = await cachesOf(page);
  report.upgrade.cachedUrls = await page.evaluate(async () => {
    const cache = await caches.open("webex-university-v28");
    const keys = await cache.keys();
    return keys.map((key) => key.url).filter((url) => /sw\.js|shell\.js|guide\.(js|css)/.test(url));
  });

  execSync("python3 - << 'PY'\nimport os, shutil\nsrc='/workspace'\ndst='/tmp/wx-serve'\nskip={'.git','node_modules'}\nfor dirpath, dirnames, filenames in os.walk(src):\n    dirnames[:] = [name for name in dirnames if name not in skip]\n    rel=os.path.relpath(dirpath, src)\n    target=dst if rel=='.' else os.path.join(dst, rel)\n    os.makedirs(target, exist_ok=True)\n    for name in filenames:\n        shutil.copy2(os.path.join(dirpath, name), os.path.join(target, name))\nPY");

  report.upgrade.update = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return { error: "no registration" };
    let updatefound = false;
    reg.addEventListener("updatefound", () => { updatefound = true; });
    await reg.update();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      updatefound,
      waiting: reg.waiting ? reg.waiting.scriptURL : "",
      installing: reg.installing ? reg.installing.scriptURL : "",
      active: reg.active ? reg.active.scriptURL : "",
    };
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    return keys.includes("webex-university-v29");
  }, null, { timeout: 20000 }).catch(() => null);
  await page.reload({ waitUntil: "networkidle" });
  await sleep(500);
  report.upgrade.afterSwap = await cachesOf(page);

  for (const height of [430, 844]) {
    await page.setViewportSize({ width: 390, height });
    await page.goto(origin + "/", { waitUntil: "networkidle" });
    report.upgrade[height] = await clickSend(page);
  }
  await upgrade.close();

  const fresh = await browser.newContext({ serviceWorkers: "allow" });
  const freshPage = await fresh.newPage();
  await boot(freshPage);
  for (const height of [430, 844]) {
    await freshPage.setViewportSize({ width: 390, height });
    await freshPage.goto(origin + "/", { waitUntil: "domcontentloaded" });
    report.fresh[height] = await clickSend(freshPage);
  }
  report.fresh.caches = await cachesOf(freshPage);
  await fresh.close();
} finally {
  console.log(JSON.stringify(report, null, 2));
  server.kill();
  await browser.close();
  for (const scenario of ["fresh", "upgrade"]) {
    for (const height of [430, 844]) {
      const row = report[scenario][height];
      const send = row.after.send;
      const log = row.after.log;
      if (!row.answered) throw new Error(scenario + " " + height + " click did not answer");
      if (send.y < 0 || send.bottom > height + 0.5) throw new Error(scenario + " " + height + " Send outside viewport " + JSON.stringify(send));
      if (log.h < 100) throw new Error(scenario + " " + height + " log " + log.h);
      if (row.after.inlineHeight || row.after.inlineMax) throw new Error(scenario + " " + height + " still sets inline height");
    }
  }
  if (!report.upgrade.afterSwap.keys.includes("webex-university-v29")) throw new Error("upgrade did not install v29");
  if (report.upgrade.afterSwap.keys.includes("webex-university-v28")) throw new Error("old cache still present");
  if (!report.upgrade[430].after.guide.includes("v=efe84a13bc3d")) throw new Error("upgrade kept the unversioned guide");
}
