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

test("SIP ladder builds a simulated message and labels it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sip-sim.html");
  await page.getByRole("button", { name: /Local gateway/ }).click();
  await expect(page.locator("#node-note")).toContainText("Simulation");
  await page.getByRole("button", { name: "Build the simulated message" }).click();
  await expect(page.locator("#sip-out")).toContainText("SIMULATION — not sent");
  await expect(page.locator("#sip-out")).toContainText("INVITE");
});
