import { test, expect } from "@playwright/test";
import path from "node:path";

const shot = path.join("docs", "screenshots", "wave");

async function openGuide(page) {
  await page.addInitScript(() => {
    localStorage.setItem("canon-tour-done", "skip");
    localStorage.setItem("cg-greet-done", "1");
  });
  await page.goto("/");
  await page.locator("button.cg-monkey").click();
  await expect(page.locator("#cg-panel")).toBeVisible();
}

test("home, guide, and a room at desktop and phone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openGuide(page);
  await expect(page.locator("#cg-panel")).toContainText("lifelong student");
  await page.locator("#cg-panel input").fill("What can you help with?");
  await page.locator("#cg-panel form").press("Enter");
  await expect(page.locator("#cg-panel .cg-bubble.is-bot").last()).toContainText("Control Hub");
  await page.screenshot({ path: path.join(shot, "home-bot-1440x900.png") });
  await page.goto("/rooms/T1-R01-control-hub-foundations.html");
  await expect(page.locator("h1")).toContainText("Control Hub Foundations");
  await page.screenshot({ path: path.join(shot, "lesson-1440x900.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("button.cg-monkey").click();
  await expect(page.locator("#cg-panel")).toBeVisible();
  await page.screenshot({ path: path.join(shot, "home-bot-390x844.png") });
  await page.goto("/rooms/T1-R01-control-hub-foundations.html");
  await expect(page.locator("h1")).toContainText("Control Hub Foundations");
  await page.screenshot({ path: path.join(shot, "lesson-390x844.png") });
});

test("offline reload still opens a room and answers", async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openGuide(page);
  await page.waitForFunction(async () => {
    const ready = await navigator.serviceWorker.ready;
    if (!ready.active) return false;
    const keys = await caches.keys();
    const cache = await caches.open(keys.find((key) => key.startsWith("webex-university-v")) || "");
    const index = await cache.match("./assets/data/wxbot-index.json");
    const engine = await cache.match("./shared/pybot-chat/engine.js");
    return Boolean(index && engine);
  }, null, { timeout: 20000 });
  await context.setOffline(true);
  await page.reload();
  await page.locator("button.cg-monkey").click();
  await page.locator("#cg-panel input").fill("what is Control Hub");
  await page.locator("#cg-panel button[type=submit]").click();
  await expect(page.locator("#cg-panel .cg-bubble.is-bot").last()).toContainText(/Control Hub|don't have that yet/i);
  await page.goto("/rooms/T1-R01-control-hub-foundations.html");
  await expect(page.locator("h1")).toContainText("Control Hub Foundations");
  await page.screenshot({ path: path.join(shot, "offline-lesson-1440.png") });
});

async function expectClickable(page, locator) {
  const box = await locator.boundingBox();
  expect(box).toBeTruthy();
  const view = page.viewportSize();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(view.height + 0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(view.width + 0.5);
  const hit = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.tagName + (el.getAttribute("type") ? ":" + el.getAttribute("type") : "") : "";
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  const tag = await locator.evaluate((el) => el.tagName + (el.getAttribute("type") ? ":" + el.getAttribute("type") : ""));
  expect(hit).toBe(tag);
}

test("chat input and Send stay clickable on a short phone", async ({ page }) => {
  for (const height of [430, 844]) {
    await page.setViewportSize({ width: 390, height });
    await page.addInitScript(() => {
      localStorage.setItem("canon-tour-done", "skip");
      localStorage.setItem("cg-greet-done", "1");
    });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.locator("button.cg-monkey").click();
    await expect(page.locator("#cg-panel")).toBeVisible();
    const input = page.locator("#cg-panel input");
    const send = page.locator("#cg-panel button[type=submit]");
    const geom = await page.evaluate(() => {
      const panel = document.querySelector("#cg-panel").getBoundingClientRect();
      const dock = document.querySelector(".phone-dock");
      const bar = document.querySelector(".topbar");
      return {
        top: panel.top,
        bottom: panel.bottom,
        dock: dock ? getComputedStyle(dock).display : "missing",
        bar: bar ? getComputedStyle(bar).display : "missing",
      };
    });
    expect(geom.top).toBeGreaterThanOrEqual(-1);
    expect(geom.bottom).toBeLessThanOrEqual(height + 1);
    expect(geom.dock).toBe("none");
    expect(geom.bar).toBe("none");
    await expectClickable(page, input);
    await expectClickable(page, send);
    await input.fill("What can you help with?");
    await send.click();
    await expect(page.locator("#cg-panel .cg-bubble.is-bot").last()).toContainText("Control Hub");
    await expectClickable(page, input);
    await expectClickable(page, send);
  }
});

test("SIP ladder builds a simulated message and labels it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sip-sim.html");
  await page.getByRole("button", { name: /Local gateway/ }).click();
  await expect(page.locator("#node-note")).toContainText("Simulation");
  await page.getByRole("button", { name: "Build the simulated message" }).click();
  await expect(page.locator("#sip-out")).toContainText("SIMULATION — not sent");
  await expect(page.locator("#sip-out")).toContainText("INVITE");
});
