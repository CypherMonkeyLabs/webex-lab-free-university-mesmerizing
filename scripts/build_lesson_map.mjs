/* Write data/lesson-map.json and data/sources-catalog.json from rooms and cites. */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function plain(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const sources = [];
const lessons = [];
const files = readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html")).sort();

for (const file of files) {
  const html = readFileSync(join(root, "rooms", file), "utf8");
  const idMatch = html.match(/data-room="([^"]+)"/);
  const roomId = idMatch ? idMatch[1] : "";
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = plain(titleMatch ? titleMatch[1] : "");
  const track = roomId.slice(0, roomId.indexOf("-")) || "T1";
  const trackNum = Number(track.replace(/\D/g, "")) || 1;
  const level = Math.min(10, trackNum);
  let ledger = "";
  try {
    ledger = readFileSync(join(root, "cites", `${roomId}.md`), "utf8");
  } catch {
    ledger = "";
  }
  const ids = [];
  for (const line of ledger.split("\n")) {
    const match = line.match(/^(\d+)\.\s+(\S.*?)\s+—\s+https?:\/\/\S+|^(\d+)\.\s+(.+)$/);
    if (!match) continue;
    const n = match[1] || match[3];
    const label = (match[2] || match[4] || "").replace(/\s+/g, " ").trim();
    const hrefMatch = line.match(/https?:\/\/\S+/);
    const id = `${roomId}-${n}`;
    ids.push(id);
    sources.push({
      id,
      room: roomId,
      label: label.slice(0, 180),
      href: hrefMatch ? hrefMatch[0].replace(/[).,]+$/, "") : "",
    });
  }
  if (!ids.length) {
    const id = `${roomId}-ledger`;
    ids.push(id);
    sources.push({ id, room: roomId, label: `${title} citation ledger`, href: "" });
  }
  const dateMatch = ledger.match(/Retrieved (\d{4}-\d{2}-\d{2})/);
  lessons.push({
    key: `${track}/${roomId}`,
    title,
    level,
    outcomes: [`Explain what this room covers: ${title}`],
    sources: ids.slice(0, 8),
    has_exercise: /id="quiz"|id="lab"/i.test(html),
    last_verified: dateMatch ? dateMatch[1] : null,
    href: `rooms/${file}`,
  });
}

writeFileSync(join(root, "data/lesson-map.json"), `${JSON.stringify({ lessons }, null, 2)}\n`);
writeFileSync(join(root, "data/sources-catalog.json"), `${JSON.stringify({ sources }, null, 2)}\n`);
console.log(`lesson-map ${lessons.length} rooms, sources ${sources.length}`);
