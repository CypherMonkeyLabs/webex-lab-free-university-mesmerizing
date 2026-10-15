/** Sound effects and narration. Voices load on voiceschanged. */

const SETTINGS_KEY = "webexlab.settings";

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

let audioCtx = null;

function context() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

export function playTone(kind) {
  const settings = readSettings();
  if (settings.sound === false) return;
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  const notes = {
    nav: [520, 0.05],
    ok: [660, 0.08],
    bad: [220, 0.12],
    step: [480, 0.04],
  };
  const [freq, dur] = notes[kind] || notes.nav;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind === "bad" ? "triangle" : "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function voiceScore(voice) {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  let score = 0;
  const lang = (voice.lang || "").toLowerCase();
  if (lang.startsWith("en")) score += 30;
  else score -= 20;
  if (/natural|premium|enhanced|neural/.test(name)) score += 50;
  if (/google/.test(name)) score += 18;
  if (/samantha|alex|karen|moira|fiona|daniel|serena/.test(name)) score += 16;
  const roboticEdge = /microsoft (david|zira|mark|hazel)|microsoft david|microsoft zira/.test(name) && !/natural|neural/.test(name);
  if (roboticEdge) score -= 80;
  if (/edge/.test(name) && !/natural|neural|premium/.test(name)) score -= 40;
  return score;
}

export function chooseVoice(voices, preferredURI) {
  if (!voices.length) return null;
  if (preferredURI) {
    const saved = voices.find((voice) => voice.voiceURI === preferredURI);
    if (saved && voiceScore(saved) > -40) return saved;
  }
  const ranked = [...voices].sort((a, b) => voiceScore(b) - voiceScore(a));
  const best = ranked[0];
  if (!best || voiceScore(best) < 0) return null;
  return best;
}

export function loadVoices() {
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve([]);
  const existing = synth.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      const list = synth.getVoices();
      if (!list.length || settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", finish);
      resolve(list);
    };
    synth.addEventListener("voiceschanged", finish);
    window.setTimeout(() => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", finish);
      resolve(synth.getVoices());
    }, 1800);
  });
}

export function speak(text) {
  const settings = readSettings();
  const synth = window.speechSynthesis;
  if (!synth || settings.narration !== true || !text) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Number(settings.rate) || 1;
  const voices = synth.getVoices();
  const voice = chooseVoice(voices, settings.voiceURI);
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeech() {
  window.speechSynthesis?.cancel();
}
