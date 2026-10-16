import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createGuide, mergeKb, blankSession } from "./engine.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const kbDir = join(dir, "kb");

function loadKb() {
  const parts = {};
  readdirSync(kbDir).filter((name) => name.endsWith(".json")).forEach((name) => {
    parts[name] = JSON.parse(readFileSync(join(kbDir, name), "utf8"));
  });
  parts.index = parts["index.json"];
  parts.rooms = parts["rooms.json"];
  parts.quizzes = parts["quizzes.json"];
  parts.cards = parts["cards.json"];
  parts.lessons = parts["lessons.json"];
  parts.tours = parts["tours.json"];
  (parts.index.factFiles || []).forEach((name) => {
    parts[name] = parts[name];
  });
  return mergeKb(parts);
}

const kb = loadKb();
const guide = createGuide(kb, { rng: () => 0 });

test("knowledge base is built from the rooms", () => {
  assert.ok(kb.facts.length > 400);
  assert.ok(kb.quizzes.length > 40);
  assert.ok(kb.rooms.length >= 60);
  assert.equal(kb.facts.every((fact) => fact.text && fact.href && fact.cite), true);
});

test("quiz intent deals a cited question and scores the right choice", () => {
  const started = guide.route("quiz me", blankSession(), { page: "index.html", today: "2026-10-16" });
  assert.equal(started.reply.kind, "quiz");
  assert.ok(started.reply.question.choices.length >= 2);
  assert.equal("answer" in started.reply.question, false);
  const item = started.session.quiz.items[0];
  const graded = guide.route(item.choices[item.answer], started.session, {});
  assert.equal(graded.reply.correct, true);
  assert.match(graded.reply.text, /From /);
  assert.match(graded.reply.text, new RegExp(item.room));
});

test("a wrong quiz choice is marked wrong and still cites the room", () => {
  const started = guide.route("test me", blankSession(), { page: "quizzes.html" });
  const item = started.session.quiz.items[0];
  const wrong = (item.answer + 1) % item.choices.length;
  const graded = guide.route(item.choices[wrong], started.session, {});
  assert.equal(graded.reply.correct, false);
  assert.match(graded.reply.text, /Not this one/);
  assert.match(graded.reply.text, /From /);
});

test("unknown questions fall back without inventing an answer", () => {
  const out = guide.route("sourdough starter hydration percentage", blankSession(), { page: "index.html" });
  assert.equal(out.reply.kind, "fallback");
  assert.match(out.reply.text, /don't know/);
  assert.match(out.reply.text, /won't guess/);
  assert.equal(/paris|hydration|starter/i.test(out.reply.text), false);
});

test("where do I start cites the start page", () => {
  const out = guide.route("where do I start?", blankSession(), { page: "index.html" });
  assert.equal(out.reply.kind, "answer");
  assert.match(out.reply.href, /start\.html/);
  assert.match(out.reply.text, /From /);
});

test("a fuzzy certificate-trunk question cites a real note", () => {
  const out = guide.route("certifcate trunk", blankSession(), {});
  assert.equal(out.reply.kind, "answer");
  assert.match(out.reply.text, /5062|certificate/i);
  assert.match(out.reply.text, /From /);
  assert.ok(out.reply.links.length >= 1);
});

test("tell me more continues the same room with a different note", () => {
  const first = guide.route("What is Control Hub?", blankSession(), { room: "T1-R01", page: "T1-R01-control-hub-foundations.html" });
  assert.equal(first.reply.kind, "answer");
  assert.match(first.reply.text, /T1-R01|Control Hub/);
  const more = guide.route("tell me more", first.session, { room: "T1-R01" });
  assert.equal(more.reply.kind, "answer");
  assert.notEqual(more.reply.text, first.reply.text);
  assert.match(more.reply.text, /From /);
});

test("how do I use this follows the open room and section", () => {
  const out = guide.route("How do I use this?", blankSession(), {
    room: "T1-R01",
    page: "T1-R01-control-hub-foundations.html",
    section: "quiz"
  });
  assert.equal(out.reply.kind, "answer");
  assert.match(out.reply.text, /quiz/i);
  assert.match(out.reply.text, /T1-R01/);
});

test("the page mounts this guide and not the old bot", () => {
  const uni = readFileSync(join(dir, "..", "assets", "js", "university.js"), "utf8");
  assert.match(uni, /guide\/guide\.js/);
  assert.equal(uni.includes("guide-bot.js"), false);
  assert.equal(uni.includes("guide-kb.js"), false);
});

test("teach me opens a lesson for that room", () => {
  const out = guide.route("teach me local gateway", blankSession(), { page: "index.html" });
  assert.equal(out.reply.kind, "lesson");
  assert.match(out.reply.text, /Local Gateway|T2-R02/);
  assert.match(out.reply.text, /From /);
});

test("the 1-hour course walks tracks and checkpoints from the notes", () => {
  const started = guide.route("Start the 1-hour course", blankSession(), { page: "index.html" });
  assert.equal(started.reply.kind, "course");
  assert.match(started.reply.text, /1-hour course/);
  assert.match(started.reply.text, /8 tracks|tracks/);
  assert.ok(started.reply.follow);
  assert.match(started.reply.follow.text, /From /);
  assert.match(started.reply.follow.text, /Track 1 of /);
  const seen = new Set([started.reply.follow.text]);
  let session = started.session;
  let checks = 0;
  for (let step = 0; step < 12; step += 1) {
    const beat = guide.route("Next", session, { page: "index.html" });
    assert.equal(beat.reply.kind, "course");
    assert.notEqual(beat.reply.text, "");
    if (beat.reply.chips && beat.reply.chips[0] !== "Next" && beat.reply.chips[0] !== "My progress") {
      const choice = beat.reply.chips[0];
      const graded = guide.route(choice, beat.session, { page: "index.html" });
      assert.match(graded.reply.text, /From /);
      assert.match(graded.reply.text, /That's the one in the notes|Not this one/);
      session = graded.session;
      checks += 1;
      break;
    }
    assert.equal(seen.has(beat.reply.text), false);
    seen.add(beat.reply.text);
    session = beat.session;
  }
  assert.ok(checks >= 1);
  assert.ok(seen.size >= 3);
});
