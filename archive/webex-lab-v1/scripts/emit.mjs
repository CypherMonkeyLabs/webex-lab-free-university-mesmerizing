import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C } from "./content/helpers.mjs";
import { t01 } from "./content/t01.mjs";
import { t02 } from "./content/t02.mjs";
import { t03 } from "./content/t03.mjs";
import { t04 } from "./content/t04.mjs";
import { t05 } from "./content/t05.mjs";
import { t06 } from "./content/t06.mjs";
import { t07 } from "./content/t07.mjs";
import { t08 } from "./content/t08.mjs";
import { t09 } from "./content/t09.mjs";
import { t10 } from "./content/t10.mjs";
import { t11 } from "./content/t11.mjs";
import { t12 } from "./content/t12.mjs";
import { t13 } from "./content/t13.mjs";
import { t14 } from "./content/t14.mjs";
import { t15 } from "./content/t15.mjs";
import { t16 } from "./content/t16.mjs";
import { bosses, interview, glossary, certs } from "./content/extra.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = join(root, "campus", "data");
const tracks = [t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12, t13, t14, t15, t16];

async function dump(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

const catalog = {
  tracks: tracks.map((track) => ({
    id: track.id,
    title: track.title,
    blurb: track.blurb,
    level: track.level,
    lessons: track.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title })),
    counts: {
      lessons: track.lessons.length,
      quiz: track.lessons.reduce((sum, lesson) => sum + lesson.quiz.length, 0),
      labs: track.lessons.length,
      faults: track.lessons.length,
    },
  })),
};

const search = [];
for (const track of tracks) {
  for (const lesson of track.lessons) {
    search.push({
      title: lesson.title,
      summary: lesson.summary,
      keywords: [...lesson.objectives, ...lesson.cards.map((card) => card.front)].join(" "),
      trackTitle: track.title,
      trackId: track.id,
      lessonId: lesson.id,
    });
  }
}

const sources = Object.values(C).map(([label, url]) => ({ label, url }));

await dump(join(data, "catalog.json"), catalog);
await dump(join(data, "search.json"), search);
await dump(join(data, "sources.json"), sources);
await dump(join(data, "bosses.json"), bosses);
await dump(join(data, "interview.json"), interview);
await dump(join(data, "glossary.json"), glossary);
await dump(join(data, "certs.json"), certs);
for (const track of tracks) {
  await dump(join(data, "tracks", `${track.id}.json`), track);
}

const quiz = catalog.tracks.reduce((sum, track) => sum + track.counts.quiz, 0);
const lessons = catalog.tracks.reduce((sum, track) => sum + track.counts.lessons, 0);
console.log(`emitted ${catalog.tracks.length} tracks, ${lessons} lessons, ${quiz} questions, ${bosses.length} bosses`);
