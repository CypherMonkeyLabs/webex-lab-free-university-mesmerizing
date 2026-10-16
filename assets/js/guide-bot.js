/* Guide Bot. Answers come from assets/data/guide-kb.json (mirrored on
   window.CANON_GUIDE_KB for file://). No request leaves the browser unless
   window.CANON_GUIDE_ENDPOINT or window.CANON_GUIDE.endpoint is set later. */
(function () {
  var KB = window.CANON_GUIDE_KB || { pages: [], quizzes: [], tours: [] };
  var QUICK = ["Where do I start?", "Explain this diagram", "Quiz me"];
  var STOP = { the: 1, a: 1, an: 1, to: 1, of: 1, and: 1, or: 1, in: 1, on: 1, for: 1, is: 1, this: 1, that: 1, i: 1, me: 1, my: 1, do: 1, how: 1, what: 1, where: 1, it: 1, be: 1 };
  var root = document.documentElement;
  var quiz = null;
  var tour = null;

  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    var mark = "assets/js/guide-bot.js";
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf(mark);
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  var rootPrefix = prefix();

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function abs(path) {
    if (!path) return "";
    if (/^(https?:|mailto:|#)/.test(path)) return path;
    return rootPrefix + String(path).replace(/^\.\//, "");
  }
  function motionReduced() {
    if (root.dataset.motion === "reduce") return true;
    if (root.dataset.motion === "full") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function fileName() {
    var path = location.pathname.split("/").pop() || "index.html";
    return path || "index.html";
  }
  function norm(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tokens(value) {
    return norm(value).split(" ").filter(function (word) {
      return word && !STOP[word] && word.length > 1;
    });
  }
  function pageById(id) {
    for (var i = 0; i < KB.pages.length; i++) {
      if (KB.pages[i].id === id) return KB.pages[i];
    }
    return null;
  }
  function pageByHref(href) {
    var file = String(href || "").split("#")[0].split("/").pop();
    for (var i = 0; i < KB.pages.length; i++) {
      var pageFile = String(KB.pages[i].href || "").split("#")[0].split("/").pop();
      if (pageFile === file) return KB.pages[i];
    }
    return null;
  }
  function answer(page) {
    return {
      kind: "answer",
      localOnly: true,
      text: page.title + ". " + page.summary,
      href: page.href,
      links: [{ href: page.href, title: page.title }]
    };
  }
  function fallback(page) {
    var target = page || pageById("start") || pageById("glossary");
    if (!target) {
      return { kind: "fallback", localOnly: true, text: "I don't know, try this page.", href: "start.html", links: [{ href: "start.html", title: "Start here" }] };
    }
    return {
      kind: "fallback",
      localOnly: true,
      text: "I don't know, try this page: " + target.title + ". " + target.summary,
      href: target.href,
      links: [{ href: target.href, title: target.title }]
    };
  }
  function scorePage(page, query) {
    var q = norm(query);
    var words = tokens(query);
    var score = 0;
    var hay = norm([page.title, page.summary].concat(page.keywords || []).join(" "));
    if (q && norm(page.title) === q) score += 10;
    (page.keywords || []).forEach(function (keyword) {
      if (norm(keyword) === q) score += 8;
    });
    (page.synonyms || []).forEach(function (synonym) {
      var phrase = norm(synonym);
      if (!phrase) return;
      if (q.indexOf(phrase) !== -1) score += 8;
      else if (phrase.indexOf(q) !== -1 && q.length > 4) score += 5;
    });
    words.forEach(function (word) {
      if (hay.indexOf(word) !== -1) score += 3;
      (page.keywords || []).forEach(function (keyword) {
        var key = norm(keyword);
        if (key && (key.indexOf(word) === 0 || word.indexOf(key) === 0)) score += 2;
      });
    });
    return score;
  }
  function explainDiagram() {
    var current = pageByHref(fileName());
    var diagramIds = { diagrams: 1, flows: 1, ecosystem: 1, "ecosystem-atlas": 1, charts: 1 };
    if (current && (diagramIds[current.id] || document.body.getAttribute("data-room"))) return answer(current);
    return fallback(pageById("diagrams"));
  }
  function bestPage(query) {
    var best = null;
    var bestScore = 0;
    KB.pages.forEach(function (page) {
      var score = scorePage(page, query);
      if (score > bestScore) {
        bestScore = score;
        best = page;
      }
    });
    return { page: best, score: bestScore };
  }
  function route(message) {
    var q = norm(message);
    if (!q) return fallback(pageById("start"));
    if (q.indexOf("tour") !== -1 || q.indexOf("show me around") !== -1 || q.indexOf("guide me") !== -1) {
      return { kind: "tour", localOnly: true, text: "Tour this page. Each stop names something already on the screen.", href: "", links: [] };
    }
    if (q === "quiz me" || q.indexOf("quiz me") !== -1) {
      return { kind: "quiz", localOnly: true, text: "", href: "", links: [] };
    }
    if (q.indexOf("explain this diagram") !== -1 || q.indexOf("explain the diagram") !== -1 || q === "this diagram") {
      return explainDiagram();
    }
    if (q.indexOf("where do i start") !== -1 || q === "getting started" || q === "start here") {
      var start = pageById("start");
      return start ? answer(start) : fallback(null);
    }
    var hit = bestPage(message);
    if (hit.page && hit.score >= 4) return answer(hit.page);
    return fallback(hit.page || pageById("glossary"));
  }

  function ask(message) {
    var local = route(message);
    var endpoint = window.CANON_GUIDE_ENDPOINT || (window.CANON_GUIDE && window.CANON_GUIDE.endpoint) || null;
    if (!endpoint || local.localOnly || local.kind === "quiz" || local.kind === "tour") return Promise.resolve(local);
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message, href: location.href })
    }).then(function (res) {
      if (!res.ok) throw new Error("guide endpoint");
      return res.json();
    }).then(function (data) {
      if (!data || typeof data.text !== "string" || !data.text) return local;
      var kind = data.kind;
      if (kind !== "answer" && kind !== "fallback" && kind !== "quiz" && kind !== "tour") kind = "answer";
      return {
        kind: kind,
        text: data.text,
        href: typeof data.href === "string" ? data.href : "",
        links: Array.isArray(data.links) ? data.links : []
      };
    }).catch(function () {
      return local;
    });
  }

  window.CANON_GUIDE = window.CANON_GUIDE || {};
  if (!window.CANON_GUIDE.endpoint) window.CANON_GUIDE.endpoint = window.CANON_GUIDE_ENDPOINT || null;
  window.CANON_GUIDE.askLocal = route;
  window.CANON_GUIDE.ask = ask;

  var launch = document.createElement("button");
  launch.type = "button";
  launch.className = "guide-launch";
  launch.setAttribute("aria-expanded", "false");
  launch.setAttribute("aria-controls", "guide-panel");
  launch.innerHTML = '<span class="guide-launch-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3l1.4 4.2L18 8.5l-4.6 1.6L12 14l-1.4-3.9L6 8.5l4.6-1.3z"/><path d="M6 16h12M8 19h8"/></svg></span><span>Guide</span>';
  var panel = document.createElement("section");
  panel.id = "guide-panel";
  panel.className = "guide-panel";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "guide-title");
  panel.innerHTML =
    '<div class="guide-bar"><h2 id="guide-title">Guide Bot</h2><button type="button" class="guide-close">Close</button></div>' +
    '<div class="guide-log" role="log" aria-relevant="additions"></div>' +
    '<div class="guide-chips" role="group" aria-label="Quick replies"></div>' +
    '<form class="guide-form"><input type="text" aria-label="Ask the Guide Bot" placeholder="Ask about a page in this lab" autocomplete="off"><button type="submit">Send</button></form>' +
    '<button type="button" class="guide-tour-btn" data-guide-tour>Tour this page</button>';
  var tourLayer = document.createElement("div");
  tourLayer.className = "guide-tour";
  tourLayer.hidden = true;
  tourLayer.innerHTML =
    '<div class="guide-tour-back" data-tour-end></div>' +
    '<div class="guide-spot"></div>' +
    '<div class="guide-callout" role="dialog" aria-label="Page tour"><p></p><div class="guide-callout-actions"><button type="button" data-tour-next>Next</button><button type="button" data-tour-end>Done</button></div></div>';
  document.body.appendChild(launch);
  document.body.appendChild(panel);
  document.body.appendChild(tourLayer);

  var log = panel.querySelector(".guide-log");
  var chipRow = panel.querySelector(".guide-chips");
  var form = panel.querySelector(".guide-form");
  var input = form.querySelector("input");
  var greeted = false;

  function scrollLog() {
    log.scrollTop = log.scrollHeight;
  }
  function linkList(links) {
    var usable = (links || []).filter(function (link) { return link && link.href; });
    if (!usable.length) return null;
    var nav = document.createElement("p");
    nav.className = "guide-links";
    usable.forEach(function (link, index) {
      if (index) nav.appendChild(document.createTextNode(" "));
      var anchor = document.createElement("a");
      anchor.href = abs(link.href);
      anchor.textContent = link.title || link.href;
      nav.appendChild(anchor);
    });
    return nav;
  }
  function say(text, links, who) {
    var bubble = document.createElement("div");
    bubble.className = "guide-bubble " + (who === "user" ? "is-user" : "is-bot");
    var body = document.createElement("p");
    bubble.appendChild(body);
    log.appendChild(bubble);
    scrollLog();
    function finish() {
      var extra = linkList(links);
      if (extra) bubble.appendChild(extra);
      scrollLog();
    }
    if (who === "user" || motionReduced()) {
      body.textContent = text;
      finish();
      return;
    }
    bubble.classList.add("is-typing");
    body.textContent = "…";
    window.setTimeout(function () {
      bubble.classList.remove("is-typing");
      var i = 0;
      var timer = window.setInterval(function () {
        i += Math.max(1, Math.round(text.length / 80));
        if (i > text.length) i = text.length;
        body.textContent = text.slice(0, i);
        scrollLog();
        if (i >= text.length) {
          window.clearInterval(timer);
          finish();
        }
      }, motionReduced() ? 0 : 16);
    }, motionReduced() ? 0 : 220);
  }
  function pushUser(text) {
    say(text, [], "user");
  }
  function setChips(labels, choiceMode) {
    chipRow.innerHTML = "";
    labels.forEach(function (label, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "guide-chip";
      button.textContent = label;
      button.addEventListener("click", function () {
        if (choiceMode) {
          pushUser(label);
          grade(index);
          return;
        }
        quiz = null;
        pushUser(label);
        ask(label).then(deliver);
      });
      chipRow.appendChild(button);
    });
    var stop = panel.querySelector("[data-quiz-stop]");
    if (choiceMode && !stop) {
      stop = document.createElement("button");
      stop.type = "button";
      stop.className = "guide-chip";
      stop.setAttribute("data-quiz-stop", "");
      stop.textContent = "Stop quiz";
      stop.addEventListener("click", function () {
        quiz = null;
        say("Quiz stopped.", []);
        setChips(QUICK, false);
      });
      chipRow.appendChild(stop);
    }
  }
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }
  function startQuiz() {
    if (!KB.quizzes.length) {
      deliver(fallback(pageById("quizzes")));
      return;
    }
    quiz = { items: shuffle(KB.quizzes).slice(0, 4), index: 0, correct: 0 };
    say("Quiz from this lab’s pages. Four questions.", []);
    showQuestion();
  }
  function showQuestion() {
    var item = quiz.items[quiz.index];
    say((quiz.index + 1) + "/" + quiz.items.length + ". " + item.question, []);
    setChips(item.choices, true);
  }
  function grade(index) {
    if (!quiz) return;
    var item = quiz.items[quiz.index];
    var right = index === item.answer;
    if (right) quiz.correct += 1;
    var lead = right ? "Correct. " : "Not this one. ";
    say(lead + item.why, [{ href: item.href, title: "Source" }]);
    quiz.index += 1;
    if (quiz.index >= quiz.items.length) {
      var links = [];
      var seen = {};
      quiz.items.forEach(function (question) {
        if (seen[question.href]) return;
        seen[question.href] = 1;
        var source = pageByHref(question.href);
        links.push({ href: question.href, title: source ? source.title : question.href });
      });
      say("Score: " + quiz.correct + "/" + quiz.items.length + ".", links);
      quiz = null;
      setChips(QUICK, false);
      return;
    }
    showQuestion();
  }
  function visible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    var rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return false;
    if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) return false;
    return true;
  }
  function tourSteps() {
    var file = fileName();
    var chosen = null;
    (KB.tours || []).forEach(function (item) {
      if (item.match === file) chosen = item;
    });
    if (!chosen) {
      (KB.tours || []).forEach(function (item) {
        if (item.match === "*") chosen = item;
      });
    }
    return ((chosen && chosen.steps) || []).filter(function (step) {
      return visible(document.querySelector(step.selector));
    });
  }
  function placeTour() {
    if (!tour) return;
    var step = tour.steps[tour.index];
    var el = document.querySelector(step.selector);
    if (!el) {
      tour.index += 1;
      if (tour.index >= tour.steps.length) endTour();
      else placeTour();
      return;
    }
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: motionReduced() ? "auto" : "smooth" });
    window.setTimeout(function () {
      if (!tour) return;
      var rect = el.getBoundingClientRect();
      var spot = tourLayer.querySelector(".guide-spot");
      var callout = tourLayer.querySelector(".guide-callout");
      spot.style.top = Math.max(8, rect.top - 6) + "px";
      spot.style.left = Math.max(8, rect.left - 6) + "px";
      spot.style.width = Math.min(rect.width + 12, window.innerWidth - 16) + "px";
      spot.style.height = Math.min(rect.height + 12, window.innerHeight - 16) + "px";
      callout.querySelector("p").textContent = step.text;
      var next = tourLayer.querySelector("[data-tour-next]");
      next.textContent = tour.index === tour.steps.length - 1 ? "Finish" : "Next";
      var top = rect.bottom + 12;
      if (top > window.innerHeight - 150) top = Math.max(12, rect.top - 150);
      callout.style.top = top + "px";
      callout.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 300)) + "px";
    }, motionReduced() ? 0 : 280);
  }
  function startTour() {
    var steps = tourSteps();
    if (!steps.length) {
      deliver(fallback(pageByHref(fileName()) || pageById("start")));
      return;
    }
    quiz = null;
    setChips(QUICK, false);
    tour = { steps: steps, index: 0 };
    tourLayer.hidden = false;
    placeTour();
  }
  function endTour() {
    tour = null;
    tourLayer.hidden = true;
  }
  function deliver(reply) {
    var kind = reply && reply.kind;
    switch (kind) {
      case "quiz":
        startQuiz();
        break;
      case "tour":
        say(reply.text, reply.links);
        startTour();
        break;
      case "answer":
      case "fallback":
        say(reply.text, reply.links);
        break;
      default: {
        var unknown = fallback(pageById("start"));
        say(unknown.text, unknown.links);
      }
    }
  }
  function openPanel() {
    panel.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      var home = pageById("index");
      say(home ? "Guide Bot only repeats this lab’s pages. " + home.summary : "Guide Bot only repeats this lab’s pages.", home ? [{ href: home.href, title: home.title }] : []);
      setChips(QUICK, false);
    }
    input.focus();
  }
  function closePanel() {
    panel.hidden = true;
    launch.setAttribute("aria-expanded", "false");
    launch.focus();
  }

  launch.addEventListener("click", function () {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  panel.querySelector(".guide-close").addEventListener("click", closePanel);
  panel.querySelector("[data-guide-tour]").addEventListener("click", function () {
    pushUser("Tour this page");
    ask("Tour this page").then(deliver);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    pushUser(text);
    if (quiz) {
      var item = quiz.items[quiz.index];
      var found = -1;
      item.choices.forEach(function (choice, index) {
        if (found !== -1) return;
        if (norm(choice) === norm(text) || norm(choice).indexOf(norm(text)) !== -1) found = index;
      });
      if (found === -1) {
        say("Pick one of the choices on the chips.", []);
        return;
      }
      grade(found);
      return;
    }
    ask(text).then(deliver);
  });
  tourLayer.querySelector("[data-tour-next]").addEventListener("click", function () {
    if (!tour) return;
    tour.index += 1;
    if (tour.index >= tour.steps.length) endTour();
    else placeTour();
  });
  tourLayer.querySelectorAll("[data-tour-end]").forEach(function (button) {
    button.addEventListener("click", endTour);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!tourLayer.hidden) endTour();
    else if (!panel.hidden) closePanel();
  });
  setChips(QUICK, false);
})();
