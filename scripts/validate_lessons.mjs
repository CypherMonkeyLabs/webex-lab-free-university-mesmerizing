// Validates data/lesson-map.json against rooms/*.html and data/sources-catalog.json.
// Every room needs a level 0-10, at least one outcome, source ids that exist, and a matching title.
// Run: node scripts/validate_lessons.mjs
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const map = JSON.parse(readFileSync(join(root, "data/lesson-map.json"), "utf8"));
const schema = JSON.parse(readFileSync(join(root, "data/lesson-schema.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(root, "data/sources-catalog.json"), "utf8"));

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

const problems = [];
const sourceIds = new Set((catalog.sources || []).map((item) => item.id));
const mapped = new Map((map.lessons || []).map((lesson) => [lesson.key, lesson]));
const seen = new Set();
const required = schema.required;
const files = readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html"));

for (const file of files) {
  const html = readFileSync(join(root, "rooms", file), "utf8");
  const idMatch = html.match(/data-room="([^"]+)"/);
  const roomId = idMatch ? idMatch[1] : "";
  const track = roomId.slice(0, roomId.indexOf("-"));
  const key = `${track}/${roomId}`;
  seen.add(key);
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = plain(titleMatch ? titleMatch[1] : "");
  const lesson = mapped.get(key);
  if (!lesson) {
    problems.push(`${key}: not in lesson-map.json`);
    continue;
  }
  for (const field of required) if (!(field in lesson)) problems.push(`${key}: missing field ${field}`);
  if (!Number.isInteger(lesson.level) || lesson.level < 0 || lesson.level > 10) problems.push(`${key}: level must be 0-10`);
  if (!Array.isArray(lesson.outcomes) || lesson.outcomes.length < 1 || lesson.outcomes.some((item) => typeof item !== "string" || item.length < 8)) {
    problems.push(`${key}: needs at least one outcome`);
  }
  if (!Array.isArray(lesson.sources) || lesson.sources.length < 1) problems.push(`${key}: needs at least one source`);
  for (const source of lesson.sources || []) if (!sourceIds.has(source)) problems.push(`${key}: unknown source id ${source}`);
  if (lesson.title !== title) problems.push(`${key}: title differs from the room h1`);
  if (lesson.last_verified !== null && !/^\d{4}-\d{2}-\d{2}$/.test(lesson.last_verified)) {
    problems.push(`${key}: last_verified must be null or YYYY-MM-DD`);
  }
  if (typeof lesson.has_exercise !== "boolean") problems.push(`${key}: has_exercise must be boolean`);
}

for (const key of mapped.keys()) if (!seen.has(key)) problems.push(`${key}: in lesson-map.json but no such room`);

const perLevel = {};
for (const lesson of map.lessons || []) perLevel[lesson.level] = (perLevel[lesson.level] || 0) + 1;
for (const problem of problems) console.log("FAIL", problem);
console.log("lessons:", seen.size, "mapped:", mapped.size, "per level:", JSON.stringify(perLevel));
console.log("validate_lessons:", problems.length, "problems");
process.exit(problems.length ? 1 : 0);
