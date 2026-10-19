/* Factual answers for the existing Canon guide. Same-origin index only. */
import { createRetriever } from "../../shared/pybot-chat/engine.js";

const TOPICS = [
  "What is Control Hub?",
  "What is a local gateway?",
  "What is Webex Contact Center?",
  "What is Dedicated Instance?",
  "What is SIP?",
  "Where do I start?",
  "What can you help with?",
];

let retriever = null;
let loading = null;
let failed = false;

function load() {
  if (retriever || failed) return Promise.resolve(retriever);
  if (!loading) {
    const url = new URL("../../assets/data/wxbot-index.json", import.meta.url);
    loading = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("index");
        return res.json();
      })
      .then((data) => {
        retriever = createRetriever(data);
        return retriever;
      })
      .catch(() => {
        failed = true;
        retriever = null;
        return null;
      });
  }
  return loading;
}

export function topicChips() {
  return TOPICS.slice();
}

export function askWx(raw) {
  return load().then((engine) => {
    if (!engine) {
      return {
        kind: "fallback",
        text: "The room index did not load. I will not invent an answer.",
        links: [],
        chips: TOPICS.slice(),
        localOnly: true,
      };
    }
    const result = engine.ask(raw, {});
    const links = [];
    if (result.href && result.mode !== "fallback") {
      links.push({ href: result.href, title: result.link || "Open this page" });
    }
    const chips = result.followQ ? [result.followQ] : TOPICS.slice(0, 4);
    return {
      kind: result.mode === "fallback" ? "fallback" : "answer",
      text: result.text,
      links,
      chips,
      localOnly: true,
    };
  });
}
