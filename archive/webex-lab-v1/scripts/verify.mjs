import { readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { simulateDial } from "../campus/js/dialplan.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = join(root, "campus", "data");
const problems = [];

function fail(message) {
  problems.push(message);
}

async function readJSON(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const catalog = await readJSON(join(data, "catalog.json"));
const search = await readJSON(join(data, "search.json"));
const bosses = await readJSON(join(data, "bosses.json"));
const interview = await readJSON(join(data, "interview.json"));
const glossary = await readJSON(join(data, "glossary.json"));
const certs = await readJSON(join(data, "certs.json"));
const sources = await readJSON(join(data, "sources.json"));

let lessons = 0;
let quiz = 0;
let labs = 0;
let faults = 0;
let cards = 0;

if (catalog.tracks.length < 16) fail(`tracks ${catalog.tracks.length}`);

for (const meta of catalog.tracks) {
  const track = await readJSON(join(data, "tracks", `${meta.id}.json`));
  if (track.lessons.length < 7) fail(`${meta.id} lessons ${track.lessons.length}`);
  lessons += track.lessons.length;
  if (meta.counts.lessons !== track.lessons.length) fail(`${meta.id} count mismatch`);
  for (const lesson of track.lessons) {
    quiz += lesson.quiz.length;
    cards += lesson.cards.length;
    labs += 1;
    faults += 1;
    if (lesson.quiz.length < 6) fail(`${lesson.id} quiz`);
    if (lesson.cards.length < 4) fail(`${lesson.id} cards`);
    if (lesson.flow.steps.length < 4) fail(`${lesson.id} flow`);
    if (lesson.sections.length < 2) fail(`${lesson.id} sections`);
    if (lesson.lab.steps.length < 3) fail(`${lesson.id} lab`);
    if (!lesson.diagram.nodes.length) fail(`${lesson.id} diagram`);
    if (!lesson.fault.log.includes("SYNTHETIC")) fail(`${lesson.id} fault log`);
    const urls = [
      ...lesson.sections.map((section) => section.cite.url),
      ...lesson.quiz.map((row) => row.cite),
      lesson.fault.cite.url,
      ...lesson.flow.steps.map((step) => step.cite),
    ];
    for (const url of urls) {
      if (!url.startsWith("https://")) fail(`${lesson.id} cite ${url}`);
    }
    if (lesson.quiz.some((row) => row.answer !== 0)) fail(`${lesson.id} answer index`);
  }
}

if (lessons < 100) fail(`lessons ${lessons}`);
if (quiz < 600) fail(`quiz ${quiz}`);
if (labs < 20) fail(`labs ${labs}`);
if (faults < 30) fail(`faults ${faults}`);
if (cards < 400) fail(`cards ${cards}`);
if (search.length !== lessons) fail(`search ${search.length}`);
if (bosses.length < 8) fail(`bosses ${bosses.length}`);
if (interview.length < 36) fail(`interview ${interview.length}`);
if (glossary.length < 40) fail(`glossary ${glossary.length}`);
if (!certs.asOf || certs.items.length < 3) fail("certs");
if (sources.some((source) => !source.url.startsWith("https://"))) fail("sources");

const base = {
  extensionLength: 4,
  externalDigit: "9",
  locationName: "Richmond",
  routingPrefix: "21",
  otherLocations: [{ name: "Austin", prefix: "22", extensionLength: 4 }],
  patterns: [{ pattern: "+1804555XXXX", route: "Trunk LGW-Richmond" }],
  pstn: "lgw",
  origin: "webex-user",
  trunkCount: 1,
  emergencyProvider: "redsky",
  emergencyEnabled: true,
};

function expectRoute(label, raw, routeIncludes, ok = true) {
  const result = simulateDial({ ...base, ...raw });
  if (result.ok !== ok || !result.route.includes(routeIncludes)) {
    fail(`${label}: got ok=${result.ok} route=${result.route}`);
  }
  return result;
}

expectRoute("ext", { dialed: "2100" }, "Richmond extension 2100");
expectRoute("prefix", { dialed: "222100" }, "Austin extension 2100");
const patterned = expectRoute("pattern", { dialed: "918045551234" }, "Trunk LGW-Richmond");
if (patterned.normalized !== "+18045551234") fail(`pattern normalized ${patterned.normalized}`);
expectRoute("933", { dialed: "933" }, "RedSky enhanced emergency");
expectRoute("911 off", { dialed: "911", emergencyEnabled: false }, "Location PSTN");
expectRoute(
  "premises",
  {
    dialed: "918045559999",
    origin: "premises-pbx",
    pstn: "ccp",
    patterns: [{ pattern: "+19999999999", route: "unused" }],
  },
  "Blocked: premises user to cloud PSTN",
  false,
);
expectRoute("unmatched", { dialed: "917035550100" }, "local gateway");
const warned = simulateDial({ ...base, dialed: "917035550100", trunkCount: 2, pstn: "lgw" });
if (!warned.warnings.some((line) => line.includes("more than one trunk"))) fail("two trunks warning");

const shellNames = [
  "campus/index.html",
  "campus/css/campus.css",
  "campus/js/app.js",
  "campus/js/audio.js",
  "campus/js/diagram.js",
  "campus/js/flow.js",
  "campus/sw.js",
  "campus/manifest.webmanifest",
  "campus/data/catalog.json",
  "campus/data/search.json",
  "campus/data/bosses.json",
  "campus/data/interview.json",
  "campus/data/glossary.json",
  "campus/data/certs.json",
  "campus/data/sources.json",
];
let shell = 0;
for (const name of shellNames) {
  shell += (await stat(join(root, name))).size;
}
const budget = 500 * 1024;
if (shell > budget) fail(`shell ${shell} exceeds ${budget}`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`ok tracks=${catalog.tracks.length} lessons=${lessons} quiz=${quiz} labs=${labs} faults=${faults} cards=${cards} bosses=${bosses.length} interview=${interview.length} glossary=${glossary.length} shell=${shell}`);
