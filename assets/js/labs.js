/* Zero-key labs. Study models only. No network. */
(function () {
  var panels = document.querySelectorAll("[data-lab-panel]");
  document.querySelectorAll("[data-lab-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-lab-tab");
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-lab-panel") !== id;
      });
      document.querySelectorAll("[data-lab-tab]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  var digits = document.querySelector("[data-digits]");
  var cc = document.querySelector("[data-cc]");
  var prefix = document.querySelector("[data-prefix]");
  var dialOut = document.querySelector("[data-dial-out]");
  function translate() {
    var raw = (digits.value || "").replace(/[^\d+]/g, "");
    var country = (cc.value || "1").replace(/\D/g, "") || "1";
    var nat = (prefix.value || "").replace(/\D/g, "");
    var lines = [];
    lines.push("Study model of help.webex article 32gfts: the Unified CM dial plan normalizes numbers as +E.164.");
    lines.push("Webex Calling sends unmatched calls, including extensions it cannot see, to the Local Gateway.");
    lines.push("Input: " + (raw || "(empty)"));
    if (!raw) {
      dialOut.textContent = lines.concat(["Enter digits."]).join("\n");
      return;
    }
    if (raw.charAt(0) === "+") {
      lines.push("Already in a plus form: " + raw);
      lines.push("This box does not check whether the country code is valid.");
      dialOut.textContent = lines.join("\n");
      return;
    }
    if (raw.length <= 6) {
      lines.push("Treated as an extension (" + raw.length + " digits). Not rewritten to +E.164 in this model.");
      lines.push("During a phased move, Webex Calling cannot see Unified CM extensions until the gateway route exists.");
      dialOut.textContent = lines.join("\n");
      return;
    }
    var national = raw;
    if (nat && national.indexOf(nat) === 0) national = national.slice(nat.length);
    lines.push("Stripped national prefix '" + (nat || "(none)") + "' → " + national);
    lines.push("Result: +" + country + national);
    lines.push("Article example of the same idea, from Flow Designer (nhovcy4), for an E.164-only entry point: 5550101234 is presented as +15550101234.");
    dialOut.textContent = lines.join("\n");
  }
  var dialBtn = document.querySelector("[data-dial-run]");
  if (dialBtn) dialBtn.addEventListener("click", translate);

  var flowNodes = [{ id: "start", type: "Start Flow", locked: true }];
  var canvas = document.querySelector("[data-flow-canvas]");
  var flowOut = document.querySelector("[data-flow-out]");
  var piq = document.querySelector("[data-piq]");
  var ewt = document.querySelector("[data-ewt]");
  var pri = document.querySelector("[data-priority]");
  var skilled = document.querySelector("[data-skilled]");
  var validate = document.querySelector("[data-validate]");
  var publish = document.querySelector("[data-publish]");
  function renderFlow() {
    if (!canvas) return;
    canvas.innerHTML = "";
    flowNodes.forEach(function (node, index) {
      var div = document.createElement("div");
      div.className = "sim-node";
      div.textContent = (index + 1) + ". " + node.type + (node.locked ? " · cannot delete" : "");
      if (!node.locked) {
        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "ghost";
        rm.textContent = "Remove";
        rm.addEventListener("click", function () {
          flowNodes.splice(index, 1);
          renderFlow();
        });
        div.appendChild(rm);
      }
      canvas.appendChild(div);
    });
    var validOn = validate && validate.checked;
    var errors = [];
    if (!validOn) errors.push("Validation is off, so this model hides errors and keeps Publish disabled.");
    else {
      var types = flowNodes.map(function (n) { return n.type; });
      for (var i = 0; i < types.length - 1; i++) {
        if (types[i] === "Queue Contact" && types[i + 1] === "HTTP Request") {
          errors.push("HTTP Request sits immediately after Queue Contact. Insert Play Message or Play Music.");
        }
      }
      if (types.indexOf("Queue Contact") === -1) errors.push("No Queue Contact activity.");
    }
    if (publish) publish.disabled = errors.length > 0;
    if (flowOut && !flowOut.dataset.ran) {
      flowOut.textContent = errors.length
        ? errors.join("\n")
        : "Validation is on and this model sees no error. Publish is enabled. Run the trace to see branches.";
    }
  }
  document.querySelectorAll("[data-add-node]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      flowNodes.push({ id: String(Date.now()), type: btn.getAttribute("data-add-node"), locked: false });
      if (flowOut) delete flowOut.dataset.ran;
      renderFlow();
    });
  });
  if (validate) validate.addEventListener("change", function () { if (flowOut) delete flowOut.dataset.ran; renderFlow(); });
  var run = document.querySelector("[data-flow-run]");
  if (run) run.addEventListener("click", function () {
    var p = Number(piq && piq.value);
    var e = Number(ewt && ewt.value);
    var priority = Number(pri && pri.value);
    var lines = [];
    if (skilled && skilled.checked) {
      lines.push("Team assignment with skills assigned in the flow: EWT does not apply. Output forced to -1.");
      e = -1;
    }
    var branch = "Failure (this model: PIQ is not a positive number, or the inputs are empty).";
    if (p > 0 && e > 0) branch = "Success. Both EWT and PIQ are positive.";
    else if (p > 0 && e === -1) branch = "Insufficient Information. PIQ is valid and EWT is -1. Use PIQ. Do not announce a calculated wait.";
    lines.push("Get Queue Info → " + branch);
    if (priority >= 1 && priority <= 9) lines.push("Queue priority " + priority + " is inside 1–9.");
    else lines.push("Queue priority " + (pri && pri.value ? pri.value : "(empty)") + " is outside 1–9. Default priority is 10.");
    var types = flowNodes.map(function (n) { return n.type; });
    for (var i = 0; i < types.length - 1; i++) {
      if (types[i] === "Queue Contact" && types[i + 1] === "HTTP Request") {
        lines.push("HTTP Request may not retrieve data. Put Play Message or Play Music between the activities.");
      }
    }
    if (document.querySelector("[data-dnis]") && document.querySelector("[data-dnis]").checked) {
      lines.push("Entry point has E.164 and an extension. Caller dialed 1234. DNIS presented is the E.164 number, for example +15550101234. Not 1234.");
    }
    if (!(validate && validate.checked)) lines.push("Publish stays disabled until validation is on and errors are fixed.");
    else if (publish && publish.disabled) lines.push("Publish stays disabled until the errors above are cleared.");
    else lines.push("Publish is enabled in this model.");
    if (flowOut) {
      flowOut.dataset.ran = "1";
      flowOut.textContent = lines.join("\n");
    }
  });
  renderFlow();

  var cssPick = document.querySelector("[data-css]");
  var cssDigits = document.querySelector("[data-css-digits]");
  var cssOut = document.querySelector("[data-css-out]");
  var patterns = {
    "PT-Emergency": [{ label: "911", re: /^911$/, ex: 3 }, { label: "933", re: /^933$/, ex: 3 }],
    "PT-Internal": [{ label: "1XXX", re: /^1\d{3}$/, ex: 1 }],
    "PT-Local": [{ label: "XXXXXXX", re: /^\d{7}$/, ex: 0 }],
    "PT-LD": [{ label: "NXX-XXXXXXX", re: /^\d{10}$/, ex: 0 }, { label: "1NXX-XXXXXXX", re: /^1\d{10}$/, ex: 1 }],
    "PT-A": [{ label: "1XXX", re: /^1\d{3}$/, ex: 1 }, { label: "23XX", re: /^23\d{2}$/, ex: 2 }],
    "PT-B": [{ label: "12XX", re: /^12\d{2}$/, ex: 2 }, { label: "23XX", re: /^23\d{2}$/, ex: 2 }]
  };
  var nullPatterns = [{ label: "0000", re: /^0000$/, ex: 4 }];
  var cssMap = {
    "CSS-Lobby": ["PT-Emergency", "PT-Internal"],
    "CSS-Executive": ["PT-Emergency", "PT-Internal", "PT-Local", "PT-LD"],
    "CSS-SRND": ["PT-A", "PT-B"],
    "CSS-OrderTrap": ["PT-Internal", "PT-Emergency"]
  };
  function walkCss() {
    var name = cssPick ? cssPick.value : "CSS-Lobby";
    var d = (cssDigits && cssDigits.value || "").replace(/\D/g, "");
    var order = cssMap[name] || [];
    var lines = [];
    lines.push("Cisco CallManager System Guide 4.0(1): search every partition, keep the best match, use partition order only when two matches are equal. Null partition is last.");
    lines.push("CUCM 12.5(1) Troubleshooting Guide, Dial Plans and Routing Issues, restates the same rule. This box is that rule on a fixed pattern set, not a live publisher.");
    lines.push(name + " order: " + order.join(" → ") + " → <null>");
    var hits = [];
    order.forEach(function (part, index) {
      (patterns[part] || []).forEach(function (pat) {
        if (pat.re.test(d)) hits.push({ part: part, label: pat.label, ex: pat.ex, index: index });
      });
    });
    nullPatterns.forEach(function (pat) {
      if (pat.re.test(d)) hits.push({ part: "<null>", label: pat.label, ex: pat.ex, index: 999 });
    });
    if (!hits.length) {
      lines.push("No pattern in this CSS, including the null partition, matches " + (d || "(empty)") + ". Blocked in this model.");
    } else {
      var best = hits.reduce(function (m, h) { return h.ex > m ? h.ex : m; }, 0);
      var tied = hits.filter(function (h) { return h.ex === best; });
      tied.sort(function (a, b) { return a.index - b.index; });
      var winner = tied[0];
      hits.forEach(function (h) {
        lines.push("match " + h.label + " in " + h.part + " · explicit " + h.ex + (h === winner ? " · chosen" : h.ex === best ? " · equal, later in the CSS" : " · weaker"));
      });
      lines.push("Closest match: " + winner.part + " pattern " + winner.label + " for " + d + ".");
    }
    if (cssOut) cssOut.textContent = lines.join("\n");
  }
  var cssBtn = document.querySelector("[data-css-run]");
  if (cssBtn) cssBtn.addEventListener("click", walkCss);

  var cubePeers = [
    { id: 100, via: "", request: "dtg=webex", to: "", from: "", called: "", answer: "", dest: "BAD.BAD", pref: 0, explicit: 0 },
    { id: 200, via: "", request: "", to: "", from: "", called: "9T", answer: "", dest: "9T", pref: 1, explicit: 1 },
    { id: 210, via: "", request: "", to: "", from: "", called: "9555", answer: "", dest: "9555....", pref: 0, explicit: 4 },
    { id: 300, via: "", request: "", to: "", from: "", called: "", answer: "408555", dest: "", pref: 0, explicit: 6 }
  ];
  function cubeMatch(value, pattern) {
    if (!pattern) return false;
    if (pattern === "9T") return /^9\d+$/.test(value);
    if (pattern === "9555....") return /^9555\d{4}$/.test(value);
    if (pattern === "408555") return value.indexOf("408555") === 0;
    if (pattern === "dtg=webex") return value.indexOf("dtg=webex") !== -1;
    if (pattern === "BAD.BAD") return false;
    return value === pattern;
  }
  function cubeRun() {
    var dir = document.querySelector("[data-cube-dir]").value;
    var called = (document.querySelector("[data-cube-called]").value || "").replace(/\D/g, "");
    var calling = (document.querySelector("[data-cube-calling]").value || "").replace(/\D/g, "");
    var uri = document.querySelector("[data-cube-uri]").value || "";
    var huntstop = document.querySelector("[data-cube-huntstop]").checked;
    var lines = ["Study model of Cisco document 211306. Not a CUBE."];
    if (dir === "in") {
      var steps = [
        ["URI via", function (p) { return false; }],
        ["URI request", function (p) { return cubeMatch(uri, p.request); }],
        ["URI to", function (p) { return false; }],
        ["URI from", function (p) { return false; }],
        ["called number", function (p) { return cubeMatch(called, p.called); }],
        ["calling number / answer-address", function (p) { return cubeMatch(calling, p.answer); }],
        ["destination-pattern on the ANI", function (p) { return cubeMatch(calling, p.dest); }]
      ];
      var found = null;
      steps.forEach(function (step) {
        if (found) return;
        var hits = cubePeers.filter(step[1]);
        lines.push(step[0] + ": " + (hits.length ? hits.map(function (p) { return p.id; }).join(", ") : "none"));
        if (hits.length) found = hits.sort(function (a, b) { return b.explicit - a.explicit || a.pref - b.pref; })[0];
      });
      lines.push(found ? "Inbound peer " + found.id + "." : "No peer. The default dial peer 0 would be next, and this model stops.");
    } else {
      var outs = cubePeers.filter(function (p) { return cubeMatch(called, p.dest) || cubeMatch(called, p.called); });
      outs.sort(function (a, b) { return b.explicit - a.explicit || a.pref - b.pref; });
      lines.push("Hunt 0 candidates: " + (outs.map(function (p) { return p.id + " (explicit " + p.explicit + ", pref " + p.pref + ")"; }).join("; ") || "none"));
      if (!outs.length) lines.push("No outbound peer. 211306 says the call fails. There is no default outbound peer.");
      else {
        lines.push("First choice: peer " + outs[0].id + ".");
        if (huntstop) lines.push("huntstop is set. A failure on this peer does not try " + (outs[1] ? outs[1].id : "another peer") + ".");
        else if (outs[1]) lines.push("If peer " + outs[0].id + " fails, hunt continues to peer " + outs[1].id + ". debug voip ccapi inout is the command 211306 prints for that failure. jr1i3r wants DS 64224 so 75% CPU disables debugs.");
      }
    }
    document.querySelector("[data-cube-out]").textContent = lines.join("\n");
  }
  var cubeBtn = document.querySelector("[data-cube-run]");
  if (cubeBtn) cubeBtn.addEventListener("click", cubeRun);

  function erlangC(a, n) {
    if (n <= 0) return 1;
    if (a >= n) return 1;
    var sum = 0;
    var term = 1;
    for (var k = 0; k <= n; k++) {
      if (k > 0) term *= a / k;
      if (k < n) sum += term;
    }
    var b = term;
    var erlangB = b / (sum + b);
    return (n * erlangB) / (n - a * (1 - erlangB));
  }
  var circleCursor = 0;
  function queueRun() {
    var type = document.querySelector("[data-q-type]").value;
    var pattern = document.querySelector("[data-q-pattern]").value;
    var n = Math.max(1, Math.min(40, parseInt(document.querySelector("[data-q-agents]").value, 10) || 1));
    var cph = Math.max(0, parseFloat(document.querySelector("[data-q-cph]").value) || 0);
    var aht = Math.max(1, parseFloat(document.querySelector("[data-q-aht]").value) || 1);
    var open = document.querySelector("[data-q-open]").checked;
    var allowed = {
      team: ["Longest Available"],
      agent: ["Longest Available", "Circular", "Top-down"],
      skill: ["Longest Available", "Best Available"]
    };
    var agents = [];
    for (var i = 0; i < Math.min(n, 6); i++) {
      agents.push({ name: "A" + (i + 1), idle: 10 + i * 7, score: 5 + ((i * 3) % 5), free: i !== 1 });
    }
    var lines = [];
    lines.push("Routing strategy: " + (open ? "the window covers now, so the flow may queue." : "outside the 0000–2400 window you marked. This model does not run a pattern."));
    if (!open) {
      document.querySelector("[data-q-out]").textContent = lines.join("\n");
      return;
    }
    var defaults = { team: "Longest Available", agent: "Circular", skill: "Longest Available" };
    lines.push("ubg5qd default for this queue type: " + defaults[type] + ". You asked for " + pattern + ".");
    if (allowed[type].indexOf(pattern) === -1) {
      lines.push("Refused. np2fdx does not offer " + pattern + " on this queue type.");
      lines.push("Allowed here: " + allowed[type].join(", ") + ".");
    } else {
      var pool = agents.filter(function (a) { return a.free; });
      var chosen = null;
      if (!pool.length) {
        lines.push("Nobody free. Team queues can expand through a call distribution group. Agent-assignment queues park. This model has no second group.");
      } else if (pattern === "Longest Available") {
        chosen = pool.slice().sort(function (a, b) { return b.idle - a.idle; })[0];
        lines.push("Longest idle among the free agents.");
      } else if (pattern === "Best Available") {
        chosen = pool.slice().sort(function (a, b) { return b.score - a.score; })[0];
        lines.push("Highest study-model score. np2fdx scores proficiency and can invert a ≤ skill. These scores are stand-ins, not that formula.");
      } else if (pattern === "Top-down") {
        chosen = pool[0];
        lines.push("Top-down restarts at A1 every time and takes the first free agent.");
      } else {
        var spins = 0;
        while (spins < agents.length) {
          var candidate = agents[circleCursor % agents.length];
          circleCursor = (circleCursor + 1) % agents.length;
          spins += 1;
          if (candidate.free) { chosen = candidate; break; }
        }
        lines.push("Circular continues after the previous selection. Run again to see the cursor move.");
      }
      if (chosen) lines.push("Selected " + chosen.name + " · idle " + chosen.idle + " · score " + chosen.score + ".");
    }
    var a = (cph / 3600) * aht;
    lines.push("Offered load A = " + a.toFixed(2) + " erlangs (" + cph + " calls/hour × " + aht + " s).");
    if (a >= n) {
      lines.push("Study-model wait: not finite. Offered load meets or exceeds the agents.");
    } else {
      var pw = erlangC(a, n);
      var wait = pw * (aht / (n - a));
      lines.push("Erlang C probability of waiting ≈ " + pw.toFixed(3) + ". Mean wait ≈ " + wait.toFixed(1) + " seconds.");
    }
    lines.push("This wait is a textbook Erlang C study model. nhovcy4 estimated wait is computed from samples and is −1 when it does not apply. Do not announce this number as Webex Contact Center EWT.");
    document.querySelector("[data-q-out]").textContent = lines.join("\n");
  }
  var qBtn = document.querySelector("[data-q-run]");
  if (qBtn) qBtn.addEventListener("click", queueRun);
})();
