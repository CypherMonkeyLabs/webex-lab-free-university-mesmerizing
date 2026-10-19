
(function () {
  var note = document.getElementById("node-note");
  var labels = {
    phone: "Simulation label: the phone or app is where you imagine the request starts. No device was contacted.",
    gateway: "Simulation label: the local gateway is the premises bridge in the lab notes. No router was configured.",
    cloud: "Simulation label: the calling service is the cloud side of the drawing. No tenant was queried."
  };
  document.querySelectorAll("[data-node]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-node]").forEach(function (other) { other.setAttribute("aria-pressed", "false"); });
      button.setAttribute("aria-pressed", "true");
      note.textContent = labels[button.getAttribute("data-node")] || "";
    });
  });
  document.getElementById("sip-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(event.target);
    var method = String(data.get("method") || "INVITE");
    var uri = String(data.get("uri") || "").replace(/[\r\n]/g, "");
    var from = String(data.get("from") || "").replace(/[\r\n]/g, "");
    var to = String(data.get("to") || "").replace(/[\r\n]/g, "");
    var callId = "sim-" + Math.random().toString(16).slice(2, 10) + "@example.invalid";
    var text = [
      "SIMULATION — not sent",
      method + " " + uri + " SIP/2.0",
      "Via: SIP/2.0/TLS sim.example.invalid;branch=z9hG4bK-sim",
      "From: <" + from + ">;tag=simfrom",
      "To: <" + to + ">",
      "Call-ID: " + callId,
      "CSeq: 1 " + method,
      "Max-Forwards: 70",
      "Content-Length: 0",
      "",
      "This text was assembled in the browser. example.invalid is a reserved practice name. No SIP stack ran."
    ].join("\n");
    document.getElementById("sip-out").textContent = text;
  });
})();
