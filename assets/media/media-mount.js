/* Mounts data/media.json into the open room or track.
   The shell may also read the manifest. This file stays standalone. */
(function () {
  "use strict";
  if (window.CANON_SHELL_MEDIA || document.getElementById("v4-sidebar")) return;
  var script = document.currentScript;
  if (!script || !document.body) return;
  var room = document.body.getAttribute("data-room") || document.body.getAttribute("data-track");
  if (!room) return;
  var root = new URL("../../", script.src);

  var style = document.createElement("style");
  style.setAttribute("data-canon-media", "");
  style.textContent = [
    ".canon-media{margin:1rem 0 1.35rem;clear:both}",
    ".canon-media .canon-media-frame svg{width:100%;height:auto;display:block;border-radius:18px;max-width:100%}",
    ".canon-media figcaption{margin:.55rem .1rem 0;font:500 .92rem/1.45 ui-sans-serif,system-ui,sans-serif}",
    ".canon-media figcaption strong{font-weight:700;margin-right:.35rem}",
    "@media (prefers-reduced-motion:reduce){",
    ".canon-media .pkt{display:none !important}",
    ".canon-media .pulse,.canon-media .march,.canon-media .ex-step,.canon-media .spin{animation:none !important;opacity:1 !important}",
    ".canon-media .march{stroke-dasharray:none !important}",
    "}"
  ].join("");
  document.head.appendChild(style);

  function anchor(section) {
    if (section) {
      var byId = document.getElementById(section);
      if (byId) return byId;
      try {
        var byClass = document.querySelector("." + section);
        if (byClass) return byClass;
      } catch (err) { /* ignore a bad selector */ }
    }
    return document.getElementById("main") || document.body;
  }

  function place(host, node, item) {
    if (item.type === "image") {
      var heading = host.querySelector("h1");
      if (heading && heading.parentNode === host) {
        heading.insertAdjacentElement("afterend", node);
        return;
      }
    }
    host.appendChild(node);
  }

  fetch(new URL("data/media.json", root).href)
    .then(function (response) {
      if (!response.ok) throw new Error("manifest");
      return response.json();
    })
    .then(function (data) {
      var items = data[room];
      if (!items || !items.length) return null;
      return Promise.all(items.map(function (item) {
        return fetch(new URL(item.src, root).href).then(function (response) {
          if (!response.ok) throw new Error(item.src);
          return response.text().then(function (text) {
            return { item: item, text: text };
          });
        });
      }));
    })
    .then(function (loaded) {
      if (!loaded) return;
      loaded.forEach(function (row) {
        var item = row.item;
        var fig = document.createElement("figure");
        fig.className = "canon-media";
        fig.setAttribute("data-media-type", item.type || "");
        var frame = document.createElement("div");
        frame.className = "canon-media-frame";
        frame.innerHTML = String(row.text).replace(/^\uFEFF?/, "").replace(/<\?xml[\s\S]*?\?>/, "");
        var cap = document.createElement("figcaption");
        if (item.title) {
          var strong = document.createElement("strong");
          strong.textContent = item.title;
          cap.appendChild(strong);
        }
        if (item.caption) cap.appendChild(document.createTextNode(item.caption));
        fig.appendChild(frame);
        fig.appendChild(cap);
        place(anchor(item.section), fig, item);
      });
    })
    .catch(function () { /* leave the room readable if media fails */ });
})();
