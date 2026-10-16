#!/usr/bin/env python3
"""Study drawings for the atlas. Each caption says it is a drawing, not a vendor limit."""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "diagrams" / "university"
PAGES = ROOT / "downloads" / "diagrams"

FLOWS = {
    "queue-routing": ("Queue routing", ["Entry point", "Queue", "Skill group", "Agent"], "A study drawing of a contact-center path. Not a vendor limit."),
    "agent-state": ("Agent state", ["Available", "Reserved", "Connected", "Wrap-up"], "State names used in the agent-desktop rooms. Confirm the live article before you treat one as a product state."),
    "wxcc-callback": ("Callback path", ["Queue", "Offer", "Callback", "Agent"], "Study drawing of a callback idea. The room states which article offers it."),
    "wxcc-ivr": ("Flow menu", ["Caller", "Flow", "Menu", "Queue"], "Study drawing. A menu here is not a published activity list."),
    "wxcc-recording": ("Recording path", ["Call", "Policy", "Store", "Review"], "Study drawing. Recording rules stay in the room that cites them."),
    "wxcce-bridge": ("Enterprise bridge", ["Caller", "CVP", "ICM", "Agent"], "Study drawing of an enterprise contact-center path. Not a sizing guide."),
    "cucm-bridge": ("CUCM bridge", ["Phone", "CUCM", "Local Gateway", "Webex Calling"], "Study drawing of a migration bridge. Trunk details stay in the cited room."),
    "dial-plan": ("Dial plan", ["Digits", "Route", "Trunk", "PSTN"], "Study drawing. Wildcard rules are not copied from a live dial plan."),
    "location-gateway": ("Location gateway", ["Location", "Gateway", "Trunk", "Carrier"], "Study drawing. Not a carrier design."),
    "voicemail-path": ("Voicemail path", ["No answer", "Pilot", "Store", "Lamp"], "Study drawing of a no-answer idea. Confirm the voicemail article."),
    "hunt-group": ("Hunt group", ["Caller", "Hunt", "Member", "Answer"], "Study drawing. Member order is not a product default."),
    "call-queue": ("Call queue", ["Caller", "Queue", "Music", "Agent"], "Study drawing. Wait music is not a measured delay."),
    "consult-transfer": ("Consult transfer", ["Agent", "Consult", "Target", "Complete"], "Study drawing of a consult. The feature list stays in the cited room."),
    "contact-entry": ("Contact entry", ["Channel", "Entry", "Flow", "Queue"], "Study drawing. Channel names are labels, not a SKU."),
    "barge-path": ("Supervisor barge", ["Supervisor", "Monitor", "Barge", "Call"], "Study drawing. Barge availability is whatever the cited article says."),
    "callback-offer": ("Callback offer", ["Wait", "Offer", "Accept", "Return"], "Study drawing. Not an estimated wait time."),
}

ARCH = {
    "meetings-media": ("Meetings media", ["Client", "Media node", "Meeting", "Far end"], "Study drawing of a meetings media path. Ports stay on the ports page."),
    "messaging-space": ("Messaging space", ["Person", "Space", "File", "App"], "Study drawing. Not a retention policy."),
    "devices-board": ("Devices", ["Board", "Desk phone", "Control Hub", "User"], "Study drawing of device claim. Activation codes stay in the cited room."),
    "calling-plan": ("Calling plan", ["User", "Number", "Location", "PSTN"], "Study drawing. Not a licence count."),
    "number-inventory": ("Number inventory", ["Carrier", "Port", "Inventory", "User"], "Study drawing. Porting steps stay in the cited room."),
    "user-license": ("User and licence", ["Directory", "User", "Licence", "Service"], "Study drawing. SKU names stay in the room that cites them."),
    "workspace-device": ("Workspace", ["Place", "Device", "Schedule", "Calling"], "Study drawing. Not a workspace API schema."),
    "analytics-loop": ("Analytics loop", ["Call", "Record", "Report", "Reader"], "Study drawing. Retention numbers stay in the cited article."),
    "security-baseline": ("Security baseline", ["Identity", "SSO", "Role", "Audit"], "Study drawing. Not a compliance certificate."),
    "cert-study-path": ("Cert study path", ["Room", "Notes", "Quiz", "Review"], "A study path through this lab. Not a Cisco exam map."),
    "room-os": ("Room OS", ["Navigator", "Codec", "Control Hub", "Meeting"], "Study drawing. Firmware steps stay in the cited room."),
    "webex-app-stack": ("Webex app", ["App", "Identity", "Calling", "Meetings"], "Study drawing of the app beside Calling and Meetings. Not a client build."),
    "contact-center-stack": ("Contact center stack", ["Channel", "Flow", "Queue", "Desktop"], "Study drawing shared by the contact-center tracks. Product limits stay cited."),
    "dedicated-instance-map": ("Dedicated Instance", ["Peering", "CUCM", "Calling", "PSTN"], "Study drawing. Peering details stay in the Dedicated Instance rooms."),
    "troubleshooting-ladder": ("Troubleshooting ladder", ["Symptom", "Layer", "Tool", "Cite"], "A study ladder. It is not a TAC process."),
    "pstn-gateway": ("PSTN gateway", ["Carrier", "SBC", "Local Gateway", "Calling"], "Study drawing of a PSTN choice. The three choices are explained in the Calling rooms."),
}

PALETTES = [
    ("#7c2d12", "#b45309", "#9f1239", "#fdba74", "#fecdd3", "#fde68a", "#fb7185"),
    ("#1e3a8a", "#0369a1", "#0f766e", "#67e8f9", "#a5b4fc", "#99f6e4", "#22d3ee"),
    ("#4c1d95", "#7e22ce", "#9d174d", "#e9d5ff", "#fbcfe8", "#fde68a", "#c084fc"),
]


def drawing(stem, title, hops, caption, palette):
    a, b, c, h1, h2, h3, packet = palette
    sid = stem.replace("-", "")
    xs = [260, 480, 720, 960]
    ys = [250, 400, 550, 700]
    path = " ".join(("M " if i == 0 else "L ") + str(xs[i]) + " " + str(ys[i]) for i in range(4))
    boxes = []
    fills = [h1, h2, h3, packet]
    for i, hop in enumerate(hops):
        x, y = xs[i], ys[i]
        boxes.append(
            f'<g class="hop"><rect x="{x-117}" y="{y-36}" width="250" height="96" rx="18" fill="#020617" opacity="0.42"/>'
            f'<rect x="{x-125}" y="{y-48}" width="250" height="96" rx="20" fill="{fills[i]}"/>'
            f'<rect x="{x-125}" y="{y-48}" width="250" height="24" rx="12" fill="#ffffff" opacity="0.28"/>'
            f'<text x="{x}" y="{y+6}" text-anchor="middle" fill="#082f49" font-size="20" font-family="system-ui,sans-serif" font-weight="800">{hop}</text>'
            f'<text x="{x}" y="{y+30}" text-anchor="middle" fill="#082f49" font-size="13" font-family="system-ui,sans-serif" font-weight="700">Hop {i+1}</text></g>'
        )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="{title}">
<defs>
<linearGradient id="{sid}sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="0.55" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>
<filter id="{sid}glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1200" height="900" fill="url(#{sid}sky)"/>
<text x="64" y="68" fill="#f8fafc" font-size="40" font-family="system-ui,sans-serif" font-weight="800">{title}</text>
<text x="64" y="104" fill="#e0f2fe" font-size="18" font-family="system-ui,sans-serif">{caption}</text>
<path d="{path}" fill="none" stroke="{packet}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
{''.join(boxes)}
<g filter="url(#{sid}glow)">
<animateMotion dur="6.6s" repeatCount="indefinite" path="{path}"/>
<circle r="16" fill="{packet}" opacity="0.55"/>
<circle r="7" fill="#ffffff"/>
</g>
<text x="64" y="860" fill="#bae6fd" font-size="16" font-family="system-ui,sans-serif">Study drawing. Not a vendor limit.</text>
</svg>
'''


def page(stem, title, svg_rel):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<style>body{{font:18px/1.5 system-ui,sans-serif;margin:24px;background:#f8f5ff;color:#1b1340}}svg,object{{width:min(100%,960px);height:auto}}footer{{margin-top:24px;padding:16px;border:2px solid #0f766e;border-radius:16px;background:#ecfdf5}}</style>
</head><body>
<h1>{title}</h1>
<p>Study drawing. Not a vendor limit.</p>
<object type="image/svg+xml" data="{svg_rel}" aria-label="{title}"></object>
<footer data-canon-footer>
<p>This is an <strong>independent, free, learning-only student project</strong>. It respects every company and vendor, and every trademark belongs to its owner. It is <strong>not affiliated with or endorsed by</strong> any of them.</p>
<p>If anyone has a concern, the content will be removed or corrected promptly: please write via <a href="https://cyphermonkeylabs.com/#contact">https://cyphermonkeylabs.com/#contact</a>.</p>
<p>CypherMonkey Labs</p>
<p>© 2026 CypherMonkeyLabs 🐒</p>
<p><a href="https://cyphermonkeylabs.com">CypherMonkey Labs</a> · <a href="https://github.com/CypherMonkeyLabs">GitHub organization</a> · <a href="https://linktr.ee/cyphermonkey">Linktree</a></p>
</footer></body></html>
'''


def png(path, size):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            dx = x - size / 2
            dy = y - size / 2 + size * 0.04
            if dx * dx + dy * dy < (size * 0.28) ** 2:
                raw.extend((255, 214, 102, 255))
            else:
                raw.extend((124, 58, 237, 255))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    blob = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(blob)


def rebuild_atlas():
    flows = set(FLOWS) | {
        "calling-registration", "certificate-trunk", "registration-trunk", "lgw-media", "app-media",
        "device-media", "e911-held", "recording-path", "e2ee-path", "flow-designer", "ai-handoff",
        "migration", "number-port", "nat-sip", "firewall-lanes", "survivability", "wxcc-path",
        "crm-pop", "identity-sync", "cscan", "pstn-choices", "di-peering", "wfm-loop",
    }
    files = sorted(p for p in OUT.glob("*.svg"))
    animated = sum(1 for p in files if "animateMotion" in p.read_text())
    flow_n = sum(1 for p in files if p.stem in flows)

    def cards(only_flows):
        bits = []
        for path in files:
            stem = path.stem
            is_flow = stem in flows
            if only_flows and not is_flow:
                continue
            kind = "Animated flow" if is_flow else "Animated architecture"
            bits.append(
                f'<article class="atlas-card" data-animated="1" data-flow="{1 if is_flow else 0}">'
                f"<h2>{stem.replace('-', ' ')}</h2><p>{kind}</p>"
                f'<object type="image/svg+xml" data="assets/diagrams/university/{stem}.svg" width="640" height="480" aria-label="{stem}"></object>'
                f'<p><a href="assets/diagrams/university/{stem}.svg">SVG file</a> · '
                f'<a href="downloads/diagrams/{stem}.html">Standalone HTML</a></p></article>'
            )
        return '<div class="atlas-grid">' + "".join(bits) + "</div>"

    def swap(page, lede, only_flows):
        text = page.read_text()
        start = text.find('<p class="lede">')
        grid = text.find('<div class="atlas-grid">', start)
        end = text.find("</div>", grid)
        if start < 0 or grid < 0 or end < 0:
            raise SystemExit("atlas markup missing in " + page.name)
        replacement = f'<p class="lede">{lede}</p>' + cards(only_flows)
        page.write_text(text[:start] + replacement + text[end + len("</div>"):])

    swap(
        ROOT / "diagrams.html",
        f"{len(files)} custom SVGs. {animated} use animateMotion. {flow_n} are tagged as call, signal, or data flows. SMIL runs when the file is embedded as an object. Each card is a study drawing, not a vendor limit.",
        False,
    )
    swap(
        ROOT / "flows.html",
        f"{flow_n} call, signal, and data flows. Each one is a custom SVG with a moving packet. Architecture diagrams stay on the atlas. These are study drawings, not vendor limits.",
        True,
    )
    print(f"atlas {len(files)} diagrams, {animated} animated, {flow_n} flows")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PAGES.mkdir(parents=True, exist_ok=True)
    items = list(FLOWS.items()) + list(ARCH.items())
    for index, (stem, (title, hops, caption)) in enumerate(items):
        svg = drawing(stem, title, hops, caption, PALETTES[index % len(PALETTES)])
        (OUT / f"{stem}.svg").write_text(svg)
        (PAGES / f"{stem}.html").write_text(page(stem, title, f"../../assets/diagrams/university/{stem}.svg"))
    for path in OUT.glob("*.svg"):
        dest = PAGES / f"{path.stem}.html"
        if dest.exists():
            continue
        dest.write_text(page(path.stem, path.stem.replace("-", " "), f"../../assets/diagrams/university/{path.name}"))
    icons = ROOT / "assets" / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    png(icons / "icon-192.png", 192)
    png(icons / "icon-512.png", 512)
    rebuild_atlas()


if __name__ == "__main__":
    main()
