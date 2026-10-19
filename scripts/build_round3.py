#!/usr/bin/env python3
"""Round 3 university layer: atlas pages, charts, careers, cheat sheets, flashcard deck."""
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOMS = ROOT / "rooms"
SHEETS = ROOT / "downloads" / "sheets"

FLOW = {
    "calling-registration", "certificate-trunk", "registration-trunk", "lgw-media",
    "app-media", "device-media", "e911-held", "recording-path", "e2ee-path",
    "flow-designer", "ai-handoff", "migration", "number-port", "nat-sip",
    "firewall-lanes", "survivability", "wxcc-path", "crm-pop", "identity-sync",
    "cscan", "pstn-choices", "di-peering", "wfm-loop",
}

NEW_SHEETS = [
    ("devices-provisioning", "Devices and provisioning", ["T2-R04-devices-provisioning.html"]),
    ("dial-plan", "Dial plans and routing", ["T2-R03-dial-plans-pstn-routing.html"]),
    ("survivability", "Survivability gateway", ["T2-R07-survivability-gateway.html"]),
    ("dedicated-instance", "Dedicated Instance", ["T5-R01-what-dedicated-instance-is.html", "T5-R02-di-architecture-peering.html"]),
    ("wxcc-routing", "Contact center routing", ["T3-R03-entry-points-queues-routing.html"]),
    ("control-hub-roles", "Control Hub roles", ["T1-R01-control-hub-foundations.html", "T1-R05-admin-roles-partner.html"]),
    ("media-nat", "Media, NAT, and QoS", ["T7-R03-codecs-media-nat.html"]),
    ("flow-designer", "Flow Designer", ["T8-R01-flow-designer-essentials.html"]),
    ("number-porting", "Number porting and cutover", ["T6-R06-number-porting-cutover.html"]),
    ("analyzer-reports", "Analyzer and CUIC", ["T3-R07-analyzer-reporting.html", "T4-R07-reporting-cuic.html"]),
    ("identity-sync", "Identity and directory sync", ["T1-R02-identity-directory-sync.html"]),
    ("careers-certs", "Careers and certifications", []),
]

COLORS = {
    "T1": "#3ecfb2", "T2": "#7eb6ff", "T3": "#f0b429", "T4": "#ff8b9a",
    "T5": "#c4b5fd", "T6": "#c6e27a", "T7": "#ffb067", "T8": "#f0a0ff",
    "T9": "#34d399", "T10": "#a78bfa", "T11": "#38bdf8",
}


def strip_tags(value):
    text = re.sub(r"<[^>]+>", " ", value)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def pairs_from_html(text):
    found = []
    for match in re.finditer(
        r'<summary><span class="lvl">[^<]*</span>(.*?)</summary>\s*<p class="answer">(.*?)</p>',
        text,
        re.S,
    ):
        front, back = strip_tags(match.group(1)), strip_tags(match.group(2))
        if len(front) > 8 and len(back) > 16:
            found.append((front, back, "ladder"))
    for match in re.finditer(r'<article class="qcard">(.*?)</article>', text, re.S):
        block = match.group(1)
        question = re.search(r"<p>(.*?)</p>", block, re.S)
        answer = re.search(r'<details class="reveal">.*?<p>(.*?)</p>', block, re.S)
        if not question or not answer:
            continue
        front, back = strip_tags(question.group(1)), strip_tags(answer.group(1))
        if len(front) > 8 and len(back) > 8:
            found.append((front, back, "quiz"))
    return found


def harvest():
    cards = []
    by_track_quiz = {key: 0 for key in COLORS}
    by_track_ladder = {key: 0 for key in COLORS}
    seen = set()
    prior = json.loads((ROOT / "downloads" / "flashcards.json").read_text())
    for card in prior["cards"]:
        key = card["front"].strip().lower()
        if key in seen:
            continue
        seen.add(key)
        cards.append(card)
    for path in sorted(ROOMS.glob("*.html")):
        track = path.name[:2]
        for front, back, kind in pairs_from_html(path.read_text(encoding="utf-8")):
            key = front.lower()
            if key in seen:
                continue
            seen.add(key)
            if kind == "quiz":
                by_track_quiz[track] = by_track_quiz.get(track, 0) + 1
            else:
                by_track_ladder[track] = by_track_ladder.get(track, 0) + 1
            cards.append({
                "front": front[:280],
                "back": back[:520],
                "source": "Canon room " + path.name + " " + kind + ". Citations stay in that room.",
                "room": path.name,
            })
    return cards, by_track_quiz, by_track_ladder


def sheet_footer():
    return """<footer>
<p><strong>CypherMonkey · Webex Lab Free University</strong></p>
<p>Independent educational project. Not affiliated with or endorsed by any vendor. Trademarks belong to their owners. MIT code. CC BY-NC-SA content. Study notes, not a vendor document.</p>
<p>
<a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> · <a href="https://github.com/CypherMonkeyLabs">github.com/CypherMonkeyLabs</a> · <a href="https://linktr.ee/cyphermonkey">linktr.ee/cyphermonkey</a> ·
<a href="https://cyphermonkeylabs.com">Report a concern</a> ·
<a href="https://cyphermonkeylabs.com">Work with us</a>
</p>
<p>Other labs:
<a href="https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/">UC</a> ·
<a href="https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/">AI</a> ·
<a href="https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/">SIP Universe</a> ·
<a href="https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/">Microsoft Voice</a> ·
<a href="https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/">Amazon Connect</a> ·
<a href="https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/">Genesys Cloud</a> ·
<a href="https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/">Five9</a> ·
<a href="https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/">NICE CXone</a>
</p>
</footer>"""


def write_sheet(slug, title, rows):
    body_rows = []
    svg_rows = []
    for index, (front, back, source) in enumerate(rows[:7], start=1):
        body_rows.append(
            "<tr><td>" + html.escape(front) + "</td><td>" + html.escape(back[:240])
            + "</td><td>" + html.escape(source) + "</td></tr>"
        )
        y = 78 + (index - 1) * 28
        svg_rows.append(
            f'<text x="24" y="{y}" fill="#0f172a" font-size="13" font-family="system-ui,sans-serif">'
            + html.escape(front[:72]) + "</text>"
        )
    page = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 24px; color: #142033; }}
h1 {{ font-size: 1.5rem; margin-bottom: 0.2rem; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
td, th {{ border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; font-size: 0.88rem; }}
th {{ background: #e0f2fe; text-align: left; }}
footer {{ margin-top: 18px; font-size: 0.78rem; color: #334155; }}
footer a {{ color: #0f766e; }}
@media print {{ a {{ color: inherit; }} }}
</style></head><body>
<nav aria-label="CypherMonkey">
<a href="https://cyphermonkeylabs.com">Labs home</a> · <a href="https://linktr.ee/cyphermonkey">Linktree</a> · <a href="https://github.com/CypherMonkeyLabs">Labs org</a> ·
</nav>
<h1>{html.escape(title)}</h1>
<p>One page pulled from the Canon rooms named in the source column. Open the room before you quote a number in a design. This is not a copy of a Cisco document.</p>
<table><thead><tr><th>Check</th><th>What the room says</th><th>Source</th></tr></thead><tbody>
{''.join(body_rows)}
</tbody></table>
<p><a href="../../index.html">Back to the lab</a> · <a href="../../downloads.html">Cheat Codes</a></p>
{sheet_footer()}
</body></html>"""
    (SHEETS / f"{slug}.html").write_text(page, encoding="utf-8")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" role="img">
<rect width="800" height="320" fill="#f8fafc"/>
<text x="24" y="36" fill="#0f172a" font-size="22" font-family="system-ui,sans-serif" font-weight="700">{html.escape(title)}</text>
<text x="24" y="58" fill="#475569" font-size="12" font-family="system-ui,sans-serif">CypherMonkey · cyphermonkeylabs.com · not a vendor document</text>
{''.join(svg_rows)}
</svg>"""
    (SHEETS / f"{slug}.svg").write_text(svg, encoding="utf-8")


def page(title, body, effects=False):
    fx = '<script type="module" src="assets/js/effects.js"></script>' if effects else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'">
<script src="assets/js/theme-boot.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)} · Webex Lab</title>
<link rel="stylesheet" href="assets/css/canon.css">
<link rel="stylesheet" href="assets/css/shell.css">
<link rel="stylesheet" href="assets/css/university.css">
<link rel="icon" href="assets/mark.svg">
</head>
<body class="v4" data-effects="1">
<a class="skip" href="#main">Skip to content</a>
<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">
<nav class="lab-links" aria-label="CypherMonkey">
<a href="https://cyphermonkeylabs.com">Labs home</a> <a href="https://github.com/CypherMonkeyLabs">Labs org</a> <a href="https://linktr.ee/cyphermonkey">Linktree</a>
<button type="button" data-offline-save>Save for offline</button>
<a href="downloads/webex-university-offline.zip">Offline bundle</a>
</nav>
<nav class="uni-menu" aria-label="University">
<a href="diagrams.html">Diagrams</a>
<a href="flows.html">Flows</a>
<a href="charts.html">Charts</a>
<a href="downloads.html">Cheat Codes</a>
<a href="play.html">Play</a>
<a href="ecosystem.html">Ecosystem</a>
<a href="downloads.html">Downloads</a>
<a href="careers.html">Careers</a>
</nav>
<header class="topbar" data-chrome="v4">
<div class="bar-inner">
<a class="brand" href="index.html"><span class="brand-name">Webex Lab<small>University</small></span></a>
<button type="button" class="icon-btn" data-theme-toggle aria-label="Choose a theme">◐</button>
</div>
</header>
<main id="main"><div class="wrap">
{body}
</div></main>
<footer class="site-footer lab-footer wrap"><p>CypherMonkey · Webex Lab Free University</p></footer>
<aside class="v4-toc" id="v4-toc" aria-label="On this page"></aside></div></div>
<script src="assets/js/search-index.js"></script>
<script src="assets/js/canon.js"></script>
<script src="assets/js/redesign.js"></script>
<script src="assets/js/study-index.js"></script>
<script src="assets/js/shell.js"></script>
{fx}
</body></html>
"""


def bar_svg(title, rows, label_key, value_key):
    max_value = max((row[value_key] for row in rows), default=1) or 1
    parts = [f'<svg class="lab-chart" data-chart="{html.escape(title)}" viewBox="0 0 640 220" role="img" aria-label="{html.escape(title)}">']
    parts.append(f'<title>{html.escape(title)}</title>')
    parts.append('<rect width="640" height="220" rx="12" fill="#0b1020"/>')
    parts.append(f'<text x="16" y="24" fill="#f8fafc" font-size="14" font-family="system-ui,sans-serif">{html.escape(title)}</text>')
    width = 560 / max(len(rows), 1)
    for index, row in enumerate(rows):
        value = row[value_key]
        height = 140 * value / max_value
        x = 40 + index * width
        y = 180 - height
        parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{max(width - 10, 8):.1f}" height="{height:.1f}" fill="{row.get("color", "#22d3ee")}"/>')
        parts.append(f'<text x="{x + 4:.1f}" y="198" fill="#cbd5e1" font-size="11" font-family="system-ui,sans-serif">{html.escape(str(row[label_key]))}</text>')
        parts.append(f'<text x="{x + 4:.1f}" y="{max(y - 4, 36):.1f}" fill="#f8fafc" font-size="11" font-family="system-ui,sans-serif">{value}</text>')
    parts.append("</svg>")
    return "".join(parts)


def fold_html(diagrams, cards, quizzes):
    canon_rooms = len(list(ROOMS.glob("*.html")))
    return f"""<section class="uni-fold" id="uni-fold" aria-label="University front door">
<nav class="uni-menu" aria-label="University">
<a href="diagrams.html">Diagrams</a>
<a href="flows.html">Flows</a>
<a href="charts.html">Charts</a>
<a href="downloads.html">Cheat Codes</a>
<a href="play.html">Play</a>
<a href="ecosystem.html">Ecosystem</a>
<a href="downloads.html">Downloads</a>
<a href="careers.html">Careers</a>
</nav>
<div class="fold-grid">
<div class="fold-hero">
<svg viewBox="0 0 360 96" role="img" aria-label="Animated path from a phone through Control Hub toward the PSTN">
<rect width="360" height="96" rx="16" fill="#0b1020"/>
<rect x="16" y="28" width="72" height="40" rx="10" fill="#67e8f9"/>
<text x="52" y="52" text-anchor="middle" fill="#083344" font-size="11" font-family="system-ui,sans-serif" font-weight="700">Phone</text>
<rect x="144" y="28" width="72" height="40" rx="10" fill="#a5b4fc"/>
<text x="180" y="52" text-anchor="middle" fill="#1e1b4b" font-size="11" font-family="system-ui,sans-serif" font-weight="700">Hub</text>
<rect x="272" y="28" width="72" height="40" rx="10" fill="#fbbf24"/>
<text x="308" y="52" text-anchor="middle" fill="#422006" font-size="11" font-family="system-ui,sans-serif" font-weight="700">PSTN</text>
<path id="fold-lane" d="M88 48 H144 M216 48 H272" fill="none" stroke="#22d3ee" stroke-width="3"/>
<circle r="5" fill="#fde68a"><animateMotion dur="3.2s" repeatCount="indefinite" path="M88 48 H272"/></circle>
<circle data-anime-dot="1" r="4" cx="88" cy="48" fill="#ffffff"/>
</svg>
</div>
<div class="fold-side">
<div class="fold-counts" aria-label="Live counters">
<span><b data-count="{canon_rooms}">{canon_rooms}</b> rooms</span>
<span><b data-count="{quizzes}">{quizzes}</b> practice prompts</span>
<span><b data-count="{cards}">{cards}</b> cheat-code cards</span>
<span><b data-count="{diagrams}">{diagrams}</b> diagrams</span>
<span class="cube-scene" aria-hidden="true"><span class="cube-3d"><i></i><i></i><i></i><i></i><i></i><i></i></span></span>
<span data-three aria-hidden="true"></span>
</div>
<div class="theme-switch" role="group" aria-label="Theme switcher">
<button type="button" data-set-theme="aurora">Aurora</button>
<button type="button" data-set-theme="futuristic">Futuristic</button>
<button type="button" data-set-theme="gaming">Gaming</button>
<button type="button" data-set-theme="neon">Neon</button>
<button type="button" data-set-theme="sunset">Sunset</button>
<button type="button" data-set-theme="paper">Light</button>
</div>
<div class="mascot-row" aria-label="Mascot variations">
<svg viewBox="0 0 80 96" aria-hidden="true"><circle cx="40" cy="42" r="22" fill="#fbbf24"/><circle cx="32" cy="40" r="3" fill="#1c1917"/><circle cx="48" cy="40" r="3" fill="#1c1917"/><path d="M28 54 Q40 66 52 54" fill="none" stroke="#1c1917" stroke-width="2"/></svg>
<svg viewBox="0 0 80 96" aria-hidden="true"><circle cx="40" cy="42" r="22" fill="#f59e0b"/><circle cx="32" cy="40" r="3" fill="#1c1917"/><circle cx="48" cy="40" r="3" fill="#1c1917"/><path d="M30 58 H50" fill="none" stroke="#1c1917" stroke-width="2"/></svg>
<svg viewBox="0 0 80 96" aria-hidden="true"><circle cx="40" cy="42" r="22" fill="#fde68a"/><circle cx="32" cy="40" r="3" fill="#1c1917"/><circle cx="48" cy="40" r="3" fill="#1c1917"/><path d="M26 52 Q40 68 54 52" fill="none" stroke="#1c1917" stroke-width="2"/></svg>
<svg viewBox="0 0 80 96" aria-hidden="true"><circle cx="40" cy="42" r="22" fill="#fbbf24"/><circle cx="32" cy="38" r="3" fill="#1c1917"/><circle cx="48" cy="38" r="3" fill="#1c1917"/><path d="M32 56 Q40 52 48 56" fill="none" stroke="#1c1917" stroke-width="2"/></svg>
</div>
</div>
</div>
</section>
"""


def atlas_cards(kind):
    cards = []
    for path in sorted((ROOT / "assets" / "diagrams" / "university").glob("*.svg")):
        slug = path.stem
        text = path.read_text(encoding="utf-8")
        animated = "animateMotion" in text or "animate " in text
        is_flow = slug in FLOW
        if kind == "flow" and not is_flow:
            continue
        label = "Animated flow" if is_flow else "Animated architecture"
        if not animated:
            label = "Static diagram"
        cards.append(
            f'<article class="atlas-card" data-animated="{1 if animated else 0}" data-flow="{1 if is_flow else 0}">'
            f"<h2>{html.escape(slug.replace('-', ' '))}</h2><p>{label}</p>"
            f'<iframe src="assets/diagrams/university/{slug}.svg" title="{html.escape(slug)}" width="640" height="480"></iframe>'
            f'<p><a href="assets/diagrams/university/{slug}.svg">SVG file</a></p></article>'
        )
    return "\n".join(cards)


def main():
    cards, quiz_counts, ladder_counts = harvest()
    if len(cards) < 200:
        raise SystemExit("flashcard harvest below 200: " + str(len(cards)))
    (ROOT / "downloads" / "flashcards.json").write_text(
        json.dumps({"deck": "webex-university", "cards": cards}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print_cards = []
    for card in cards:
        print_cards.append(
            "<article class=\"card\"><h2>" + html.escape(card["front"]) + "</h2><p>"
            + html.escape(card["back"]) + "</p><p class=\"src\">" + html.escape(card["source"]) + "</p></article>"
        )
    (ROOT / "downloads" / "flashcards-print.html").write_text(
        """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'"><title>Webex flashcards</title>
<style>
body { font-family: system-ui, sans-serif; margin: 16px; color: #142033; }
.card { break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 10px; margin: 0 0 8px; }
h2 { font-size: 1rem; margin: 0 0 4px; }
p { margin: 0 0 4px; }
.src { color: #475569; font-size: 0.78rem; }
@media print { .card { break-inside: avoid; } }
</style></head><body>
<h1>Webex Lab flashcards</h1>
<p>Harvested from Canon room ladders and quizzes, plus the ports deck. Open the named room before you quote a figure.</p>
""" + "\n".join(print_cards) + sheet_footer() + "</body></html>",
        encoding="utf-8",
    )

    career_rows = [
        ("CCNP Collaboration shape", "350-801 CLCOR plus one of 300-815 CLACC, 300-820 CLHCT, or 300-830 CLCCE, as printed in certs.html.", "certs.html, Canon text dated 2026-10-14, not re-fetched"),
        ("CLCOR sitting", "certs.html prints 120 minutes and $US400 for 350-801. Re-check the Cisco exam page before you pay.", "certs.html"),
        ("CLACC", "certs.html prints 90 minutes and $US300. It says CLACCM retired February 2, 2026.", "certs.html"),
        ("CLHCT title", "certs.html says the overview sentence and the title line do not match. Quote the sentence you are looking at.", "certs.html"),
        ("Study path", "Control Hub, then Calling, then the contact-center track you actually operate. The archive studio still has the dial-plan and flow labs.", "This lab"),
        ("What this page is not", "No salary, no hiring claim, and no customer logo. Interview prompts live on interviews.html.", "Careers page"),
        ("Next lab", "Sibling labs are separate GitHub Pages sites. This sheet does not rank them.", "Footer links"),
    ]
    for slug, title, files in NEW_SHEETS:
        if slug == "careers-certs":
            rows = career_rows
        else:
            rows = []
            for name in files:
                rows.extend(
                    (front, back, name)
                    for front, back, _kind in pairs_from_html((ROOMS / name).read_text(encoding="utf-8"))
                )
        write_sheet(slug, title, rows[:7])

    tracks = []
    canon_rooms = len(list(ROOMS.glob("*.html")))
    for track_id, color in COLORS.items():
        page_path = ROOT / "tracks" / track_id / "index.html"
        text = page_path.read_text(encoding="utf-8")
        rooms = len(re.findall(r"<tr data-title", text))
        tracks.append({"id": track_id, "rooms": rooms, "color": color, "quizzes": quiz_counts.get(track_id, 0), "ladders": ladder_counts.get(track_id, 0)})
        if "track-spark" in text:
            continue
        spark = (
            '<section class="track-spark" aria-label="Track counters"><div class="spark-row">'
            '<span class="cube-scene" aria-hidden="true"><span class="cube-3d"><i></i><i></i><i></i><i></i><i></i><i></i></span></span>'
            '<svg class="spark-icon" data-depth="0.45" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" fill="#22d3ee"/>'
            '<path d="M24 6v8M24 34v8M6 24h8M34 24h8" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/></svg>'
            f'<p><b data-count="{rooms}">{rooms}</b> <span>rooms on this track</span> · <b data-count="{canon_rooms}">{canon_rooms}</b> <span>Canon rooms</span></p>'
            "</div></section>\n"
        )
        page_path.write_text(text.replace("<main id=\"main\" class=\"wrap\">", "<main id=\"main\" class=\"wrap\">\n" + spark, 1), encoding="utf-8")

    diagrams = list((ROOT / "assets" / "diagrams" / "university").glob("*.svg"))
    animated = sum(1 for path in diagrams if "animateMotion" in path.read_text(encoding="utf-8"))
    flows = sum(1 for path in diagrams if path.stem in FLOW)
    (ROOT / "diagrams.html").write_text(page(
        "Diagram atlas",
        "<p class=\"crumbs\"><a href=\"index.html\">Home</a> / Diagrams</p><h1>Diagram atlas</h1>"
        f"<p class=\"lede\">{len(diagrams)} custom SVGs. {animated} use animateMotion. {flows} are tagged as call, signal, or data flows. SMIL runs when the file is embedded as an object.</p>"
        "<div class=\"atlas-grid\">" + atlas_cards("all") + "</div>",
        effects=True,
    ), encoding="utf-8")
    (ROOT / "flows.html").write_text(page(
        "Animated flows",
        "<p class=\"crumbs\"><a href=\"index.html\">Home</a> / Flows</p><h1>Animated flows</h1>"
        f"<p class=\"lede\">{flows} call, signal, and data flows. Each one is a custom SVG with a moving packet. Architecture diagrams stay on the atlas.</p>"
        "<div class=\"atlas-grid\">" + atlas_cards("flow") + "</div>",
    ), encoding="utf-8")

    chart_rows = "".join([
        '<article class="chart-card"><h2>Rooms per track</h2>' + bar_svg("Rooms per track, counted from track tables", tracks, "id", "rooms") + "<p>Counted from each track table in this repository.</p></article>",
        '<article class="chart-card"><h2>Quiz cards harvested</h2>' + bar_svg("Quiz answers harvested per track", [{"id": row["id"], "color": row["color"], "n": row["quizzes"]} for row in tracks], "id", "n") + "<p>Unique quiz answers read out of room HTML. A repeated question is counted once.</p></article>",
        '<article class="chart-card"><h2>Ladder answers harvested</h2>' + bar_svg("Ladder answers harvested per track", [{"id": row["id"], "color": row["color"], "n": row["ladders"]} for row in tracks], "id", "n") + "<p>Unique self-question answers from the room ladders.</p></article>",
        '<article class="chart-card"><h2>Diagram kinds</h2>' + bar_svg("Diagram kinds", [{"id": "Flows", "color": "#22d3ee", "n": flows}, {"id": "Other", "color": "#fbbf24", "n": len(diagrams) - flows}], "id", "n") + "<p>Flow tags are the call, signal, and data drawings. The rest are architecture maps. All of them animate.</p></article>",
        '<article class="chart-card"><h2>D3 rooms</h2><div data-d3 class="lab-chart" data-chart="d3 rooms"></div><p>The same room counts, drawn with the vendored D3 build.</p></article>',
        '<article class="chart-card"><h2>Canvas quiz counts</h2><canvas class="lab-chart" data-chart="canvas quizzes" data-canvas-chart width="640" height="220" aria-label="Quiz cards per track"></canvas><p>Canvas chart of the harvested quiz counts.</p></article>',
        '<article class="chart-card"><h2>Rough frame</h2><svg data-rough viewBox="0 0 320 100" class="lab-chart" data-chart="rough frame" role="img" aria-label="Rough.js frame"></svg><p>rough.js draws this frame in the browser. The library is vendored.</p></article>',
    ])
    chart_json = json.dumps({
        "tracks": tracks,
        "quizzes": [{"id": row["id"], "n": row["quizzes"], "color": row["color"]} for row in tracks],
    })
    (ROOT / "charts.html").write_text(page(
        "Charts",
        "<p class=\"crumbs\"><a href=\"index.html\">Home</a> / Charts</p><h1>Charts</h1>"
        "<p class=\"lede\">Counts from this repository. No traffic, no revenue, and no invented adoption numbers.</p>"
        f'<script type="application/json" id="chart-data">{chart_json}</script>'
        f'<div class="chart-grid">{chart_rows}</div>'
        '<p><a href="diagrams.html">Diagram atlas</a> · <a href="downloads.html">Cheat Codes</a></p>',
        effects=True,
    ), encoding="utf-8")

    mind = {
        "content": "Webex study paths",
        "children": [
            {"content": "Control Hub admin", "children": [{"content": "T1 rooms", "children": []}]},
            {"content": "Calling engineer", "children": [{"content": "Gateway, dial plan, devices", "children": []}]},
            {"content": "Contact center", "children": [{"content": "Multi-tenant WxCC", "children": []}, {"content": "Enterprise and CUIC", "children": []}]},
            {"content": "Dedicated Instance", "children": []},
            {"content": "Migration", "children": []},
            {"content": "Certifications", "children": [{"content": "350-801 plus one concentration", "children": []}, {"content": "Prices not re-fetched", "children": []}]},
        ],
    }
    (ROOT / "careers.html").write_text(page(
        "Careers",
        "<p class=\"crumbs\"><a href=\"index.html\">Home</a> / Careers</p><h1>Careers</h1>"
        "<p class=\"lede\">Study paths through this Canon. Job titles here are study labels, not Cisco requisitions. No salaries.</p>"
        f'<svg id="mindmap"></svg><script type="application/json" id="mindmap-data">{json.dumps(mind)}</script>'
        """<div class="career-grid">
<article><h2>Control Hub</h2><p>Start with T1. Roles, locations, and identity are the admin job before any dial plan.</p><p><a href="tracks/T1/index.html">T1</a></p></article>
<article><h2>Calling</h2><p>T2 and T7 cover the local gateway, the three PSTN choices, devices, and SIP. The archive studio still runs the dial-plan simulator.</p><p><a href="tracks/T2/index.html">T2</a> · <a href="archive/webex-lab-v1/campus/index.html">Archive studio</a></p></article>
<article><h2>Contact center</h2><p>Multi-tenant WxCC is T3. Enterprise routing, CUIC, and Finesse are T4. Do not answer one with the other's limits.</p><p><a href="tracks/T3/index.html">T3</a> · <a href="tracks/T4/index.html">T4</a></p></article>
<article><h2>Dedicated Instance and migration</h2><p>T5 is the private UC app pair. T6 is cutover, number moves, and coexistence. Re-check live help before a window.</p><p><a href="tracks/T5/index.html">T5</a> · <a href="tracks/T6/index.html">T6</a></p></article>
<article><h2>Certifications</h2><p>certs.html prints CCNP Collaboration as 350-801 CLCOR plus one of 300-815 CLACC, 300-820 CLHCT, or 300-830 CLCCE. It prints CLACCM and CLCEI as retired February 2, 2026. Minutes and dollar amounts on that page were not re-fetched for this pass.</p><p><a href="certs.html">Certifications</a> · <a href="https://www.cisco.com/site/us/en/learn/training-certifications/exams/clcor.html">Cisco CLCOR page</a></p></article>
<article><h2>Interview practice</h2><p>The interview set is scenarios from the rooms. It is not a leaked exam and not a promise of a role.</p><p><a href="interviews.html">Interview prep</a> · <a href="downloads/sheets/careers-certs.html">Careers sheet</a></p></article>
</div>
<script src="vendor/d3.min.js"></script>
<script src="vendor/markmap-view.js"></script>
<script src="assets/js/careers-mindmap.js"></script>""",
        effects=True,
    ), encoding="utf-8")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if "id=\"uni-fold\"" not in index:
        practice = len(re.findall(r'\["B\d+",', (ROOT / "assets" / "js" / "study-index.js").read_text(encoding="utf-8")))
        block = fold_html(len(diagrams), len(cards), practice)
        index = index.replace("<main id=\"main\">", "<main id=\"main\">\n" + block, 1)
        if "assets/js/effects.js" not in index:
            index = index.replace("</body>", '<script type="module" src="assets/js/effects.js"></script>\n</body>', 1)
        (ROOT / "index.html").write_text(index, encoding="utf-8")

    downloads = (ROOT / "downloads.html").read_text(encoding="utf-8")
    items = []
    for path in sorted(SHEETS.glob("*.html")):
        slug = path.stem
        label = slug.replace("-", " ")
        items.append(
            f'<article class="sheet-card"><h2>{html.escape(label)}</h2><p>'
            f'<a href="downloads/sheets/{slug}.html">HTML</a> · '
            f'<a href="downloads/sheets/{slug}.svg">SVG</a> · '
            f'<a href="downloads/sheets/{slug}.pdf">PDF</a> · '
            f'<a href="downloads/sheets/{slug}.png">PNG</a></p></article>'
        )
    downloads = re.sub(
        r'<div class="sheet-grid">.*?</div>',
        '<div class="sheet-grid">' + "".join(items) + "</div>",
        downloads,
        count=1,
        flags=re.S,
    )
    downloads = downloads.replace(
        "One-page sheets, a printable flashcard deck, and a zip of this site.",
        f"One-page sheets ({len(items)} topics), a {len(cards)}-card deck harvested from the rooms, and a zip of this site.",
    )
    (ROOT / "downloads.html").write_text(downloads, encoding="utf-8")

    archive = ROOT / "archive" / "webex-lab-v1" / "campus" / "index.html"
    text = archive.read_text(encoding="utf-8")
    if "uni-menu" not in text:
        menu = """
  <nav class="uni-menu" aria-label="University" style="display:flex;gap:8px;overflow-x:auto;padding:8px 12px;background:#04261c">
    <a href="../../../diagrams.html">Diagrams</a>
    <a href="../../../flows.html">Flows</a>
    <a href="../../../charts.html">Charts</a>
    <a href="../../../downloads.html">Cheat Codes</a>
    <a href="../../../play.html">Play</a>
    <a href="../../../ecosystem.html">Ecosystem</a>
    <a href="../../../downloads.html">Downloads</a>
    <a href="../../../careers.html">Careers</a>
    <a href="../../../index.html">Canon home</a>
  </nav>
  <p style="margin:0;padding:6px 12px;background:#07120f;color:#d1fae5;display:flex;gap:12px;align-items:center">
    <span style="width:28px;height:28px;display:inline-block;perspective:200px"><span style="display:inline-block;width:18px;height:18px;background:#34d399;transform:rotateX(18deg) rotateY(24deg)"></span></span>
    Archived studio. The Canon university is the front door. 78 rooms stay on the Canon. This console keeps the dial plan, flow designer, and topology.
  </p>
"""
        text = text.replace('<div class="app">', menu + '  <div class="app">', 1)
        archive.write_text(text, encoding="utf-8")

    manifest_path = ROOT / "downloads" / "cache-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    for extra in ["diagrams.html", "flows.html", "charts.html", "careers.html", "assets/js/effects.js", "vendor/d3.min.js", "vendor/confetti.browser.js"]:
        if extra not in manifest:
            manifest.append(extra)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("cards", len(cards), "diagrams", len(diagrams), "animated", animated, "flows", flows, "sheets", len(list(SHEETS.glob('*.html'))))


if __name__ == "__main__":
    main()
