import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  ["assets/js/frame.js", "kit/chrome/frame.js"],
  ["assets/css/frame.css", "kit/chrome/frame.css"],
  ["assets/js/phone-nav.js", "kit/chrome/phone-nav.js"],
  ["assets/css/footer.css", "kit/chrome/footer.css"],
  ["assets/css/polish.css", "kit/chrome/polish.css"],
  ["assets/js/brand.js", "kit/chrome/brand.js"],
  ["assets/js/polish.js", "kit/chrome/polish.js"],
  ["guide/guide.js", "kit/bot/guide.js"],
  ["guide/wxbot.js", "kit/bot/wxbot.js"],
  ["guide/guide.css", "kit/bot/guide.css"],
  ["guide/engine.mjs", "kit/bot/engine.mjs"],
  ["assets/js/onboard.js", "kit/onboarding/tour.js"],
  ["assets/js/studio.js", "kit/course/studio.js"],
  ["assets/js/export-doc.mjs", "kit/course/export-doc.mjs"],
  ["assets/js/office-parts.mjs", "kit/course/office-parts.mjs"],
  ["assets/js/sources-render.mjs", "kit/course/sources-render.mjs"]
];

for (const [from, to] of files) {
  const target = join(root, to);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, from), target);
  if (to === "kit/bot/wxbot.js") {
    const text = readFileSync(target, "utf8")
      .replaceAll("../shared/pybot-chat/engine.js", "../../shared/pybot-chat/engine.js")
      .replaceAll("../assets/data/wxbot-index.json", "../../assets/data/wxbot-index.json");
    writeFileSync(target, text);
  }
  console.log(to);
}
