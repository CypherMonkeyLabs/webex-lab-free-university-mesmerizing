#!/usr/bin/env python3
"""Add T9–T11 from pages opened in 2026-10. Does not invent URLs."""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKED = "2026-10"

SOURCES = [
    ("Wikipedia", "Workforce management (Wikipedia)", "https://en.wikipedia.org/wiki/Workforce_management"),
    ("Wikipedia", "Call centre (Wikipedia)", "https://en.wikipedia.org/wiki/Call_centre"),
    ("Vendor doc", "Basic WFM and QM on Webex WFO (nmzg380)", "https://help.webex.com/article/nmzg380"),
    ("Vendor doc", "Webex WFO feature-specific SKUs (py6u9h)", "https://help.webex.com/article/py6u9h"),
    ("Vendor doc", "Enable AI Quality Management (6m6r3fb)", "https://help.webex.com/article/6m6r3fb"),
    ("Vendor doc", "Get started with AI Quality Management (nvtdfxk)", "https://help.webex.com/article/nvtdfxk"),
    ("Vendor doc", "Analyzer reports for AI Quality Management (n4jc67x)", "https://help.webex.com/article/n4jc67x"),
    ("Vendor doc", "Sentiment analysis in AI Quality Management (voh2oeb)", "https://help.webex.com/article/voh2oeb"),
    ("Vendor doc", "Coaching insights (i8lp6i)", "https://help.webex.com/article/i8lp6i"),
    ("Vendor doc", "Cisco AI Assistant (nvvv1zb)", "https://help.webex.com/article/nvvv1zb"),
    ("Vendor doc", "Use AI agents for customer interactions (s0qro1)", "https://help.webex.com/article/s0qro1"),
    ("Vendor doc", "AI Agent Studio administration guide (ncs9r37)", "https://help.webex.com/article/ncs9r37"),
    ("Vendor doc", "Configure Virtual Agent-Voice (n6gaghu)", "https://help.webex.com/article/n6gaghu"),
    ("Vendor doc", "Unified CM to Webex Calling introduction (nbedetf)", "https://help.webex.com/article/nbedetf"),
    ("Vendor doc", "Dedicated Instance contact center integration (nmhk7ve)", "https://help.webex.com/article/nmhk7ve"),
    ("Vendor doc", "Migrate Unified CCX to Webex Contact Center (0hd75db)", "https://help.webex.com/article/0hd75db"),
    ("Vendor doc", "Webex CCE tenant data migration tool (n2puc5z)", "https://help.webex.com/article/n2puc5z"),
    ("Vendor doc", "Webex Contact Center architecture (utqcm7)", "https://help.webex.com/article/utqcm7"),
    ("Vendor doc", "Get started with Local Gateway (t9xctu)", "https://help.webex.com/article/t9xctu"),
    ("DevDocs", "Bring your own virtual agent", "https://developer.webex.com/webex-contact-center/docs/bring-your-own-virtual-agent"),
    ("Sibling lab", "UC Lab", "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/"),
    ("Sibling lab", "AI Lab", "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/"),
    ("Sibling lab", "Amazon Connect Lab", "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/"),
    ("Sibling lab", "Microsoft Voice Lab", "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/"),
    ("Sibling lab", "Five9 Lab", "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/"),
    ("Sibling lab", "Genesys Cloud Lab", "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/"),
    ("Sibling lab", "NICE CXone Lab", "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/"),
    ("Sibling lab", "SIP Universe", "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/"),
    ("Brand", "CypherMonkey Labs on GitHub", "https://github.com/CypherMonkeyLabs"),
]
CONFIRMS = [
    "Wikipedia title Cisco Unified Communications Manager (the request returned 404)",
    "wfohelp.com pages named by article nmzg380",
    "Collaboration ordering guides page named by article nmzg380",
    "Supported languages and voices article named by article s0qro1",
    "Webex WFO user-guide PDF for New WFM",
]

CITE = {
    1: "Workforce management (Wikipedia), opened 2026-10. WFM is an institutional process that aims to optimize productivity, competency, and engagement. The page says it typically includes human resource management, performance and training, budgeting, forecasting, and scheduling, and that it generally relies on software rather than only a spreadsheet.",
    2: "Call centre (Wikipedia), opened 2026-10. The page describes a call centre as an office dealing with a large volume of enquiries by telephone.",
    3: "Basic WFM and QM Offerings on Webex WFO, help.webex article nmzg380, header August 13, 2025. Basic WFM and Basic QM. Forecasting across voice, digital, and back-office. MyTime, shift bidding, multi-skill scheduling, intraday, real-time adherence, and the QM table that compares Basic QM with existing QM.",
    4: "Webex WFO: Feature Specific SKUs, help.webex article py6u9h, header June 09, 2026. The article says it covers minimum required SKUs for Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express. Basic WFM and QM row: A-FLEX-WFO-NFMB, A-FLEX-WFO-NQMB, A-FLEX-WFO-CR, A-FLEX-WFO-NWFA, and the sentence that this SKU does not include the Real-time Adherence connector and Historical Data Connector.",
    5: "Enable AI Quality Management Features in Control Hub, help.webex article 6m6r3fb, header July 24, 2026. Path: Services, Contact Center, AI Features under Desktop Experience. Org, queue, and agent scopes. SKUs A-FLEX-AI-QM and A-FLEX-AI-QMMB.",
    6: "Get Started with AI Quality Management, help.webex article nvtdfxk, header July 24, 2026. Paid add-on. English only in the FAQ on that page. Auto CSAT and real-time transcriptions are included in the AI Quality Management SKU.",
    7: "Use Analyzer Reports for Webex AI Quality Management, help.webex article n4jc67x, header March 26, 2026. CSR and ASR. Sentiment score from -100 to +100. Greater than +45 positive, less than -45 negative, between -45 and +45 neutral.",
    8: "Understand Sentiment Analysis, help.webex article voh2oeb, header March 26, 2026. The opened page lists scoring, Control Hub enablement, Supervisor Desktop, and filtering.",
    9: "Use Coaching Insights, help.webex article i8lp6i, header March 26, 2026. Insights come from historical interaction data, quality results, and performance metrics.",
    10: "Cisco AI Assistant for Webex Contact Center, help.webex article nvvv1zb, header October 06, 2026. Summaries, wellness breaks, real-time transcripts, Auto CSAT, Topic Analytics, Real-time Assist, and sentiment analysis are named on the page.",
    11: "Use AI agents for customer interactions, help.webex article s0qro1, header August 25, 2026. Virtual Agent V2 outcomes Handled, Escalated, and Errored. Autonomous voice is limited to specific customers. Six digital channels. Custom events are voice only. onTimeOut: the agent has not responded in not more than 15 seconds.",
    12: "Webex AI Agent Studio Administration guide, help.webex article ncs9r37, opened 2026-10. The page is the Studio administration guide. This chapter does not copy limits that were not in the opened body beyond the guide’s existence and the integration steps s0qro1 points at it for.",
    13: "Configure Virtual Agent-Voice, help.webex article n6gaghu, header July 17, 2026. The page says Virtual Agent–Voice integrates the IVR with cloud-based AI services from third-party vendors, and it points Webex AI Agent voice setup to the use-AI-agents article.",
    14: "Introduction, Unified CM to Webex Calling, help.webex article nbedetf, header January 14, 2026. The guide is Unified CM to Webex Calling multi-tenant only. Local Gateway is described as a bridge. PPDIO is Prepare, Plan, Design, Implement, Optimize.",
    15: "Webex Dedicated Instance Contact Center integration, help.webex article nmhk7ve, header June 27, 2025. UCCX, CCE, Webex CCE, and WxCC models. UCCX to Unified CM RTT less than 60 ms. WxCC with Dedicated Instance uses certificate-based trunks. Codec order G.711 U-Law, G.711 A-Law, then OPUS.",
    16: "Migrate Cisco Unified Contact Center Express to Webex Contact Center, help.webex article 0hd75db, header June 27, 2025. Discovery tool, Java 8 or above, bulk CSV import order, and a 5000-row limit on a bulk import CSV.",
    17: "Webex CCE Tenant Data Migration Tool Guide, help.webex article n2puc5z, header August 26, 2026. The tool transfers Webex Contact Center Enterprise Administration Portal data between tenants.",
    18: "Webex Contact Center Architecture, help.webex article utqcm7, header September 03, 2026. The contents list Workforce Optimization among the functional areas.",
    19: "Get started with Local Gateway, help.webex article t9xctu, header September 10, 2026. The opened page is the administrator guide for Local Gateway trunking models, supported session border controllers, and third-party Local Gateway.",
    20: "Bring your own virtual agent, developer.webex.com, opened 2026-10. This chapter does not quote a payload from that page.",
    21: "Sibling labs opened 2026-10 at cyphermonkeylabs.com. UC Lab, AI Lab, Amazon Connect, Microsoft Voice, Five9, Genesys Cloud, NICE CXone, and SIP Universe.",
}


def cite(n):
    return f'<a class="cite" href="#cite-{n}">[cite:{n}]</a>'


def sources_html(json_href):
    items = []
    for kind, label, href in SOURCES:
        items.append(
            f'<li><span class="src-kind" style="font-weight:800">{kind}</span> '
            f'<a href="{href}" style="color:#134e4a">{label}</a> '
            f'<span class="src-checked">last checked {CHECKED}</span></li>'
        )
    for label in CONFIRMS:
        items.append(
            f'<li><span class="src-kind" style="font-weight:800">Confirm</span> {label} '
            f'<span class="src-checked">confirm</span></li>'
        )
    extra = f'<p><a href="{json_href}">sources.json</a> for this page.</p>' if json_href else ""
    return (
        '<section id="go-deeper" class="go-deeper" style="margin:28px 0;padding:16px 18px;border:2px solid #134e4a;border-radius:16px;background:#f0fdfa;color:#042f2e">'
        '<h2 style="margin:0 0 8px;color:#042f2e">Sources and go deeper</h2>'
        "<p>Checked links were opened this month. A confirm row has no address because that page was not opened.</p><ul>"
        + "".join(items)
        + "</ul>"
        + extra
        + "</section>"
    )


def sources_md():
    lines = [
        "## Sources and go deeper",
        "",
        "Checked links were opened this month. A confirm row has no address because that page was not opened.",
        "",
    ]
    for kind, label, href in SOURCES:
        lines.append(f"- {kind}: [{label}]({href}) — last checked {CHECKED}")
    for label in CONFIRMS:
        lines.append(f"- Confirm: {label} — confirm")
    return "\n".join(lines) + "\n"


def sources_json(doc_id, title):
    items = []
    for kind, label, href in SOURCES:
        items.append({
            "kind": kind.lower().replace(" ", ""),
            "label": label,
            "href": href,
            "status": "checked",
            "lastChecked": CHECKED,
        })
    for label in CONFIRMS:
        items.append({"kind": "confirm", "label": label, "status": "confirm"})
    return {"id": doc_id, "title": title, "checked": CHECKED, "items": items}


CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' blob: data:; font-src \'self\' data:; connect-src \'self\'; worker-src \'self\' blob:; object-src \'none\'; base-uri \'self\'; form-action \'self\'">'


def footer():
    src = (ROOT / "rooms/T8-R05-ai-wxcc.html").read_text(encoding="utf-8")
    start = src.index('<footer class="site-footer')
    end = src.index("</footer>") + len("</footer>")
    block = src[start:end]
    needle = "It is <strong>not affiliated with or endorsed by</strong> any of them.</p>"
    extra = needle + "<p>Chapters on workforce and quality, AI agents and voice, and platform bridges quote public pages opened in October 2026. A sources row marked confirm has no address.</p>"
    return block.replace(needle, extra, 1)


FOOTER = footer()
SCRIPTS_ROOM = """<script defer src="../assets/js/search-index.js"></script>
<script defer src="../assets/js/canon.js"></script>
<script defer src="../assets/js/redesign.js"></script>
<script defer src="../assets/js/study-index.js"></script>
<script defer src="../assets/js/shell.js"></script>
<script defer src="../assets/js/brand.js"></script>
<script defer src="../assets/js/polish.js"></script>
"""
SCRIPTS_TRACK = SCRIPTS_ROOM.replace("../", "../../")
SCRIPTS_ROOT = SCRIPTS_ROOM.replace("../", "")


def header(depth, brand_small, title_home="Home. Eleven tracks and your progress"):
    d = depth
    return f"""<header class="topbar" data-chrome="v4">
<div class="bar-inner">
<a class="brand" href="{d}index.html"><svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true"><defs><linearGradient id="gem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#6366f1"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="36" height="36" rx="10" fill="url(#gem)"/><path d="M18 7l7.2 5.2L18 29 10.8 12.2z" fill="#fff"/></svg><span class="brand-name">Canon<small>{brand_small}</small></span></a>
<nav class="nav-quick" aria-label="Primary"><a class="nav-icon" href="{d}index.html" title="{title_home}"><span aria-hidden="true">🏠</span><span class="sr">Home</span></a><a class="nav-icon" href="{d}start.html" title="Start Here. Prerequisites and the first rooms"><span aria-hidden="true">🚀</span><span class="sr">Start Here</span></a><a class="nav-icon" href="{d}index.html#rooms" title="All Rooms. Every room on the map"><span aria-hidden="true">🗂️</span><span class="sr">All Rooms</span></a><a class="nav-icon" href="{d}quizzes.html" title="Practice Quiz. 483 questions besides the room quizzes"><span aria-hidden="true">✅</span><span class="sr">Practice Quiz</span></a><a class="nav-icon" href="{d}flashcards.html" title="Flashcards. 842 know-or-again cards in this browser"><span aria-hidden="true">🃏</span><span class="sr">Flashcards</span></a></nav>
<form class="nav-search" role="search" action="#">
<input class="nav-q" type="search" placeholder="Search" aria-label="Search rooms and glossary" data-nav-search autocomplete="off">
</form>
<button type="button" class="icon-btn" data-theme-toggle aria-label="Switch to dark mode" title="Light or dark">🌙</button>
<button type="button" class="icon-btn nav-toggle" aria-expanded="false" aria-controls="canon-nav" aria-label="More">⋯</button>
<nav id="canon-nav" class="nav-panel nav-more" aria-label="More" hidden>
<a href="{d}tracks/T9/index.html" title="Forecasts, schedules, and quality reviews"><span class="nav-ico" aria-hidden="true">📋</span><span class="nav-text"><span class="nav-label">Workforce &amp; Quality</span><span class="nav-sub">Forecasts, schedules, and quality reviews</span></span></a><a href="{d}tracks/T10/index.html" title="Studio agents, voice, and six digital channels"><span class="nav-ico" aria-hidden="true">🎙️</span><span class="nav-text"><span class="nav-label">AI Agents &amp; Voice</span><span class="nav-sub">Studio agents, voice, and six digital channels</span></span></a><a href="{d}tracks/T11/index.html" title="Unified CM, Dedicated Instance, and UCCX"><span class="nav-ico" aria-hidden="true">🌉</span><span class="nav-text"><span class="nav-label">Platform Bridges</span><span class="nav-sub">Unified CM, Dedicated Instance, and UCCX</span></span></a><a href="{d}glossary.html" title="Terms collected from the written rooms"><span class="nav-ico" aria-hidden="true">📖</span><span class="nav-text"><span class="nav-label">Glossary</span><span class="nav-sub">Terms collected from the written rooms</span></span></a><a href="{d}ecosystem.html" title="Glossary, mind map, sisters, and sibling labs"><span class="nav-ico" aria-hidden="true">🌐</span><span class="nav-text"><span class="nav-label">Ecosystem Map</span><span class="nav-sub">Glossary, mind map, sisters, and sibling labs</span></span></a>
</nav>
</div>
</header>"""


def head(depth, title, og):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
{CSP_META}
<script src="{depth}assets/js/theme-boot.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:title" content="{og}">
<meta property="og:description" content="CypherWebex Canon. Offline study for Webex Calling, Control Hub, and contact center.">
<meta property="og:image" content="{depth}assets/og-card.svg">
<title>{title}</title>
<link rel="stylesheet" href="{depth}assets/css/canon.css">
<link rel="stylesheet" href="{depth}assets/css/shell.css">
<link rel="icon" href="{depth}favicon.svg" type="image/svg+xml"><link rel="icon" href="{depth}favicon.ico" sizes="any">
<link rel="stylesheet" href="{depth}assets/css/polish.css">
<link rel="stylesheet" href="{depth}assets/css/footer.css">
</head>"""


def banner(room, title, color, hops):
    boxes = []
    x = 48
    for hop in hops:
        boxes.append(
            f'<g><rect x="{x}" y="228" width="168" height="40" rx="12" fill="#fff" opacity=".94"/>'
            f'<text x="{x+84}" y="254" text-anchor="middle" fill="#083344" font-size="15" font-family="system-ui,sans-serif" font-weight="800">{hop}</text></g>'
        )
        x += 220
    return f"""<div class="canon-visuals" data-canon-visuals>
<figure class="room-banner">
<svg class="illu" viewBox="0 0 980 300" role="img" aria-label="Illustrated scene for {title}">
<defs><linearGradient id="{room}sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{color}"/><stop offset="1" stop-color="#0b1020"/></linearGradient></defs>
<rect width="980" height="300" fill="url(#{room}sky)"/>
<circle cx="860" cy="58" r="40" fill="#fff" opacity=".88"/>
<rect x="118" y="92" width="210" height="128" rx="18" fill="#f8fafc"/>
<rect x="138" y="110" width="170" height="18" rx="6" fill="#0f172a"/>
<rect x="138" y="140" width="120" height="12" rx="6" fill="#c7d2fe"/>
<rect x="420" y="128" width="64" height="108" rx="14" fill="#0f172a"/>
<rect x="430" y="140" width="44" height="70" rx="6" fill="#67e8f9"/>
<text x="36" y="46" fill="#0b1020" font-size="28" font-family="system-ui,sans-serif" font-weight="800">{title[:42]}</text>
<text x="36" y="72" fill="#0b1020" font-size="14" font-family="system-ui,sans-serif" opacity=".8">{room}</text>
{''.join(boxes)}
</svg>
<figcaption>Illustrated scene for {title}. Original drawing, not a product screenshot.</figcaption>
</figure>
</div>"""


def glossary_html(terms):
    bits = []
    for term, definition in terms:
        bits.append(f'<div class="term"><dt>{term}</dt><dd>{definition}</dd></div>')
    return '<dl class="glossary">' + "".join(bits) + "</dl>"


def table(headers, rows):
    th = "".join(f"<th>{h}</th>" for h in headers)
    body = []
    for row in rows:
        body.append("<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>")
    return f'<div class="table-wrap"><table><thead><tr>{th}</tr></thead><tbody>{"".join(body)}</tbody></table></div>'


def room_page(room):
    code = room["code"]
    title = room["title"]
    hops = room["hops"]
    takes = "".join(f"<li>{item}</li>" for item in room["takes"])
    terms = glossary_html(room["terms"])
    quizzes = []
    for i, item in enumerate(room["quiz"], 1):
        if not isinstance(item, tuple) or len(item) != 2:
            raise SystemExit(f"{room['code']} quiz {i} has {item!r}")
        q, a = item
        quizzes.append(
            f'<article class="qcard"><header><strong>Q{i}</strong><span class="kind">Check</span></header><p>{q}</p>'
            f'<details><summary>Answer</summary><p class="answer">{a}</p></details></article>'
        )
    ladder = []
    for i, (q, a) in enumerate(room["ladder"], 1):
        ladder.append(
            f'<details class="qnode"><summary><span class="lvl">L{i}</span>{q}</summary><p class="answer">{a}</p></details>'
        )
    cites = "".join(f'<li id="cite-{n}">{CITE[n]}</li>' for n in room["cites"])
    prev = room.get("prev")
    nxt = room.get("next")
    if prev:
        prev_html = f'<a class="prev" href="{prev[0]}"><span>Previous</span><strong>{prev[1]}</strong><em>{prev[2]}</em></a>'
    else:
        prev_html = '<span class="prev edge">Start of this chapter</span>'
    if nxt:
        next_html = f'<a class="next" href="{nxt[0]}"><span>Next</span><strong>{nxt[1]}</strong><em>{nxt[2]}</em></a>'
    else:
        next_html = '<span class="next edge">End of this chapter</span>'
    flow = "".join(f"<li>{step}</li>" for step in room["flow"])
    article = f"""
<section id="hdr"><p class="sec-kicker">00 · Header</p><h1>{title}</h1>
{banner(code.replace('-', ''), title, room['color'], hops)}
<p class="lede">{room['lede']}</p>
<div class="meta-row"><span class="meta-chip read-chip">Reading <strong>{room['mins']} min</strong></span><span class="meta-chip">Written</span><span class="meta-chip">Study notes</span></div>
<aside class="takeaways" aria-label="Key takeaways"><h2>Key takeaways</h2><ul>{takes}</ul></aside></section>
<section id="tldr"><p class="sec-kicker">01 · TL;DR</p><h2>Five lines, then why it matters</h2><ul>{takes}</ul></section>
<section id="map"><p class="sec-kicker">02 · Map</p><h2>{room['map_title']}</h2><p>{room['map']}</p></section>
<section id="core"><p class="sec-kicker">03 · Core</p><h2>What the opened pages say</h2>{room['core']}</section>
<section id="eco"><p class="sec-kicker">04 · Ecosystem</p><h2>Ecosystem and sister technologies</h2>
{terms}
<h3>Sister-technology matrix</h3>
{table(['Sister','What the opened page supports','Why it matters here','Cite'], room['sisters'])}
<h3>Integration edges</h3>
{table(['From','To','Mechanism','Cite'], room['edges'])}
</section>
<section id="flow"><p class="sec-kicker">05 · Flow</p><h2>Order of operations</h2><ol>{flow}</ol></section>
<section id="config"><p class="sec-kicker">06 · Config</p><h2>Clicks the articles print</h2>{room['config']}</section>
<section id="limits"><p class="sec-kicker">07 · Limits</p><h2>Limits the articles state</h2>
{table(['Item','Value','Source'], room['limits'])}
</section>
<section id="trouble"><p class="sec-kicker">08 · Trouble</p><h2>Trouble</h2>
{table(['Symptom','What the article supports','Do this','Cite'], room['trouble'])}
</section>
<section id="selfq"><p class="sec-kicker">09 · Self-question</p><h2>Oral ladder</h2>{''.join(ladder)}</section>
<section id="lab"><p class="sec-kicker">10 · Lab</p><h2>Read it back</h2><ul>{''.join(f'<li><label><input type="checkbox"> {item}</label></li>' for item in room['lab'])}</ul></section>
<section id="quiz"><p class="sec-kicker">11 · Quiz</p><h2>Quiz</h2><div class="qgrid" id="quiz">{''.join(quizzes)}</div></section>
<section id="audio"><p class="sec-kicker">12 · Audio</p><h2>Read-along uses the page</h2>
<div class="audio-slot"><audio controls preload="none"><p>No recording in this slot yet. The guide reads the takeaways aloud.</p></audio></div></section>
<section id="interview"><p class="sec-kicker">13 · Interview</p><h2>Oral-ready</h2>
<p><strong>30 seconds.</strong> {room['sec30']}</p>
<p><strong>2 minutes.</strong> {room['sec120']}</p></section>
<section id="cites"><p class="sec-kicker">14 · Citations</p><h2>Ledger</h2>
<p>Opened 2026-10. Mirrors <a href="../cites/{code}.md">cites/{code}.md</a>.</p>
<ol class="cite-list">{cites}</ol></section>
<section id="reeng"><p class="sec-kicker">15 · Re-engineer later</p><h2>Open</h2><ul>{''.join(f'<li>{item}</li>' for item in room['open'])}</ul></section>
{sources_html(f'sources/{code}/sources.json')}
<nav class="room-pager" aria-label="Adjacent rooms">{prev_html}{next_html}</nav>
"""
    toc = """<nav class="toc" aria-label="Room sections"><ol>
<li><a href="#hdr"><span class="n">00</span>Header</a></li>
<li><a href="#tldr"><span class="n">01</span>TL;DR</a></li>
<li><a href="#map"><span class="n">02</span>Map</a></li>
<li><a href="#core"><span class="n">03</span>Core</a></li>
<li><a href="#eco"><span class="n">04</span>Ecosystem</a></li>
<li><a href="#flow"><span class="n">05</span>Flow</a></li>
<li><a href="#config"><span class="n">06</span>Config</a></li>
<li><a href="#limits"><span class="n">07</span>Limits</a></li>
<li><a href="#trouble"><span class="n">08</span>Trouble</a></li>
<li><a href="#selfq"><span class="n">09</span>Self-question</a></li>
<li><a href="#lab"><span class="n">10</span>Lab</a></li>
<li><a href="#quiz"><span class="n">11</span>Quiz</a></li>
<li><a href="#audio"><span class="n">12</span>Audio</a></li>
<li><a href="#interview"><span class="n">13</span>Interview</a></li>
<li><a href="#cites"><span class="n">14</span>Cites</a></li>
<li><a href="#reeng"><span class="n">15</span>Re-engineer</a></li>
<li><a href="#go-deeper"><span class="n">+</span>Sources</a></li></ol></nav>"""
    html = f"""{head('../', f"{code} · {title} · CypherWebex Canon", f"{code} · {title}")}
<body data-track="{room['track']}" data-room="{code}" data-room-title="{title}" class="v4">
<a class="skip" href="#main">Skip to content</a>
<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">
{header('../', room['track'])}
<main id="main" class="wrap room-shell">
{toc}
<article class="room-main">
{article}
</article>
</main>
{FOOTER}
<aside class="v4-toc" id="v4-toc" aria-label="On this page"></aside></div></div>
{SCRIPTS_ROOM}</body></html>
"""
    return html


def link_rooms(rooms):
    for i, room in enumerate(rooms):
        if i:
            p = rooms[i - 1]
            room["prev"] = (p["file"], p["code"], p["title"])
        if i + 1 < len(rooms):
            n = rooms[i + 1]
            room["next"] = (n["file"], n["code"], n["title"])
    return rooms


def R(**kwargs):
    return kwargs


# --- room facts ---

def build_rooms():
    c9, c10, c11 = "#34d399", "#a78bfa", "#38bdf8"
    t9 = [
        R(code="T9-R01", file="T9-R01-wfm-qm-foundations.html", track="T9", color=c9, mins=8,
          title="Workforce and quality, in plain words",
          blurb="What forecasting, scheduling, and evaluation mean before a SKU.",
          hops=["Demand", "Schedule", "Adhere", "Evaluate"],
          lede="T9-R01. Fundamentals. A call centre handles a large volume of telephone enquiries. Workforce management plans the people. Quality management reviews the work. Webex splits those jobs across WFO packages and an AI quality add-on. " + cite(1) + " " + cite(2) + " " + cite(3),
          takes=[
              "Wikipedia describes workforce management as forecasting and scheduling, plus performance, training, and budgeting, usually with software rather than only a spreadsheet. " + cite(1),
              "The same encyclopedia describes a call centre as an office dealing with a large volume of enquiries by telephone. " + cite(2),
              "Webex WFO’s basic packages focus on core scheduling, forecasting, and evaluation. " + cite(3),
              "The architecture article lists Workforce Optimization as its own functional area, separate from routing. " + cite(18),
              "This room does not copy a formula the opened pages do not print.",
          ],
          map_title="Four words before any product name",
          map="Demand is what you expect. A schedule is who covers it. Adherence is whether the person did the scheduled task. Evaluation is a review of the interaction. nmzg380’s basic packages are built around scheduling, forecasting, and evaluation. " + cite(3),
          core="<p>The Wikipedia page on workforce management says the process aims to optimize productivity, competency, and engagement, and that it typically includes human resource management, performance and training management, budgeting, forecasting, and scheduling. It says the process generally relies on software to plan business needs more effectively than through a spreadsheet. " + cite(1) + "</p><p>The call centre page’s short description is an office dealing with a large volume of enquiries by telephone. That is the workplace the later Webex articles assume. " + cite(2) + "</p><p>Article nmzg380 says Webex WFO launched Basic WFM and Basic QM for customers who were using spreadsheets for scheduling or basic call recording. The lighter offerings focus on core scheduling, forecasting, and evaluation. " + cite(3) + "</p><p>Article utqcm7’s contents list Workforce Optimization beside interaction management, routing, and reporting. This room does not invent the paragraph under that heading. " + cite(18) + "</p>",
          terms=[
              ("Workforce management", "An institutional process aimed at productivity, competency, and engagement, typically including forecasting and scheduling. " + cite(1)),
              ("Call centre", "An office dealing with a large volume of enquiries by telephone. " + cite(2)),
              ("Basic WFM", "The Webex WFO package whose opened article centers on forecasting, scheduling, and agent self-service. " + cite(3)),
              ("Basic QM", "The Webex WFO package whose opened article centers on recording and evaluation. " + cite(3)),
          ],
          sisters=[
              ["Wikipedia WFM", "Forecasting, scheduling, performance, training, budgeting.", "The vocabulary before a Cisco SKU.", cite(1)],
              ["Webex WFO basic", "Scheduling, forecasting, evaluation.", "The product package that matches those words.", cite(3)],
              ["Analyzer", "A reporting surface, taught in T3-R07.", "A schedule is not a historical report.", cite(7)],
              ["AI Quality Management", "A separate paid add-on, taught in T9-R04.", "Do not rename Basic QM as the AI add-on.", cite(6)],
          ],
          edges=[
              ["Forecast", "Schedule", "Basic WFM lists forecasting, then scheduling tools.", cite(3)],
              ["Recording", "Evaluation", "Basic QM lists call recording and evaluation forms.", cite(3)],
              ["Architecture page", "WFO", "utqcm7 lists Workforce Optimization as a functional area.", cite(18)],
          ],
          flow=[
              "Name the workplace with the call-centre description. " + cite(2),
              "Name forecasting and scheduling as workforce management. " + cite(1),
              "Point those words at Basic WFM and Basic QM, not at a dial plan. " + cite(3),
              "Leave Analyzer clocks in T3-R07. This room does not merge them.",
          ],
          config="<ul><li>No Control Hub click is printed on the Wikipedia pages.</li><li>Ordering is named by nmzg380 as relevant SKUs plus provisioning information. The ordering-guide address itself was not opened, so it stays a confirm row. " + cite(3) + "</li></ul>",
          limits=[
              ["Spreadsheet versus software", "Wikipedia says WFM generally uses software rather than only a spreadsheet.", cite(1)],
              ["Basic package focus", "Core scheduling, forecasting, and evaluation.", cite(3)],
              ["Erlang formula", "Not printed on the pages opened for this room.", "Do not invent one"],
          ],
          trouble=[
              ["Someone quotes an Erlang formula from memory", "These opened pages do not print that formula.", "Refuse the number.", cite(1)],
              ["A schedule is treated as an Analyzer report", "nmzg380 describes scheduling applications and built-in WFO reports.", "Keep Analyzer in T3-R07.", cite(3)],
          ],
          ladder=[
              ("What does the workforce-management page say WFM includes?", "Human resource management, performance and training, budgeting, forecasting, and scheduling. " + cite(1)),
              ("What is a call centre on that Wikipedia page?", "An office dealing with a large volume of enquiries by telephone. " + cite(2)),
              ("What do the basic Webex WFO packages focus on?", "Core scheduling, forecasting, and evaluation. " + cite(3)),
          ],
          lab=[
              "Write forecast, schedule, adhere, and evaluate on four lines.",
              "Put Basic WFM on the first three and Basic QM on evaluate, then check nmzg380 before you add a feature the table does not list.",
          ],
          quiz=[
              ("Workforce management, on the Wikipedia page, generally relies on what?", "Software, to plan business needs more effectively than through a spreadsheet. " + cite(1)),
              ("Which Webex article introduces Basic WFM and Basic QM?", "nmzg380, header August 13, 2025. " + cite(3)),
              ("Where does the architecture article place Workforce Optimization?", "In the functional-area list on utqcm7. The body of that heading is not copied here. " + cite(18)),
          ],
          sec30="Workforce management is forecasting and scheduling, plus the related people processes Wikipedia names. " + cite(1) + " Webex WFO’s basic packages cover scheduling, forecasting, and evaluation. " + cite(3),
          sec120="A call centre, on the encyclopedia page, is an office dealing with a large volume of telephone enquiries. " + cite(2) + " I do not invent a staffing formula. The architecture page lists Workforce Optimization separately from routing. " + cite(18) + " The next room reads the basic feature lists.",
          open=["The wfohelp.com pages linked from nmzg380 were not opened. They stay confirm rows.", "A numeric service-level formula is not on these pages."],
          cites=[1, 2, 3, 18]),
        R(code="T9-R02", file="T9-R02-basic-wfm.html", track="T9", color=c9, mins=10,
          title="Basic workforce management on Webex WFO",
          blurb="Forecast, MyTime, shift bidding, intraday, and adherence as nmzg380 lists them.",
          hops=["Forecast", "Bid", "Intraday", "Adhere"],
          lede="T9-R02. Article nmzg380 lists what Basic WFM includes. Article py6u9h then says the Basic WFM and QM SKU does not include the Real-time Adherence connector. Both sentences stay. " + cite(3) + " " + cite(4),
          takes=[
              "Basic WFM forecasts voice, digital, and back-office demand. " + cite(3),
              "Agents use MyTime on web and mobile, and they can bid for shifts under pre-defined rules. " + cite(3),
              "Supervisors get scheduling and editing, intraday dashboards, and real-time adherence in the basic feature list. " + cite(3),
              "py6u9h says the Basic WFM and QM SKU does not include the Real-time Adherence connector or the Historical Data Connector. Those are separate add-ons. " + cite(4),
              "The SKU article’s scope line is Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express. " + cite(4),
          ],
          map_title="Feature list versus connector SKU",
          map="nmzg380’s Basic WFM column includes real-time agent adherence management. py6u9h’s Basic WFM and QM row says that SKU does not include the Real-time Adherence connector. Read both before you tell someone adherence is included. " + cite(3) + " " + cite(4),
          core="<p>nmzg380’s Basic WFM list includes forecasting across voice, digital, and back-office channels, the MyTime web and mobile apps, shift bidding, multi-skill scheduling, long-term staff budgeting, a drag-and-drop scheduling application, intraday management, real-time adherence management, a mobile app for schedules and shift trades and time-off requests, standard built-in reporting, gamification, schedule-change notifications, and meetings and offline activities. " + cite(3) + "</p><p>Table 2 on that page says existing workforce management is all of Basic WFM plus notification advanced, vacation planner, overtime manager, open integrations (API), Grant Chat Bot, self-scheduling, insights payroll integrations, and one historical and one realtime connector. " + cite(3) + "</p><p>py6u9h’s table is scoped to Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express. The Basic WFM and QM row names A-FLEX-WFO-NFMB, A-FLEX-WFO-NQMB, A-FLEX-WFO-CR, and A-FLEX-WFO-NWFA, and it says this SKU does not include the Real-time Adherence connector and Historical Data Connector, which must be purchased separately. " + cite(4) + "</p>",
          terms=[
              ("MyTime", "Web and mobile apps where agents view, manage, and request schedule changes. " + cite(3)),
              ("Shift bidding", "Agents bid for preferred shifts based on pre-defined rules and fairness settings. " + cite(3)),
              ("Intraday management", "Dashboards to monitor the day and adapt staffing. " + cite(3)),
              ("Real-time adherence", "The basic feature list tracks activity against scheduled tasks. The SKU row says the connector is a separate add-on. " + cite(3) + " " + cite(4)),
              ("A-FLEX-WFO-NFMB", "Named on the Basic WFM and QM SKU row in py6u9h. " + cite(4)),
          ],
          sisters=[
              ["Full WFM", "py6u9h names A-FLEX-WFO-NWFM2 as the minimum for WFM Agent Assist.", "Agent Assist is not the basic package.", cite(4)],
              ["WFO bundle", "Trending topics, Vacation Planner Pro, and Insights Data Export need the bundle plus the 100-interaction analytics add-on.", "Those are A-FLEX-WFO-NWFB and A-FLEX-WFO-I100.", cite(4)],
              ["Multi-tenant WxCC", "py6u9h’s opening sentence does not name multi-tenant Webex Contact Center.", "Do not apply the Enterprise SKU line from habit.", cite(4)],
          ],
          edges=[
              ["Forecast", "Multi-skill schedule", "The article says WFO schedules agents from their skill sets.", cite(3)],
              ["Planner", "Agent", "Notifications of schedule changes go by web or mobile.", cite(3)],
              ["Basic SKU", "Adherence connector", "Purchased separately, in py6u9h’s words.", cite(4)],
          ],
          flow=[
              "Read the Basic WFM bullets on nmzg380 before you promise a feature.",
              "Check Table 2 before you call vacation planner or the API a basic feature. They are on the existing-WFM side.",
              "Read the py6u9h scope sentence before you paste a SKU onto multi-tenant Webex Contact Center.",
              "If adherence is the question, quote both the feature bullet and the connector sentence.",
          ],
          config="<ul><li>nmzg380 says you place an order with the relevant SKUs and provide provisioning information. " + cite(3) + "</li><li>The ordering-guide page it names was not opened. It is a confirm row.</li></ul>",
          limits=[
              ["SKU scope", "Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express.", cite(4)],
              ["Basic adherence connector", "Not included. Separate add-on.", cite(4)],
              ["Vacation planner", "Listed with existing WFM, not in the Basic column of Table 2.", cite(3)],
              ["Multi-tenant applicability", "Not stated in py6u9h’s opening sentence.", cite(4)],
          ],
          trouble=[
              ["Adherence is missing after a basic order", "py6u9h says the Real-time Adherence connector is separate.", "Check whether the connector was ordered. Do not only re-read the feature bullet.", cite(4)],
              ["A multi-tenant tenant is given A-FLEX-WFO-NFMB from memory", "The SKU article’s scope line names Enterprise, CCE, and CCX.", "Re-read that sentence before you order.", cite(4)],
          ],
          ladder=[
              ("Name three Basic WFM capabilities from nmzg380.", "Forecasting across voice, digital, and back office; shift bidding; intraday management. " + cite(3)),
              ("Which connectors does the basic SKU row exclude?", "The Real-time Adherence connector and the Historical Data Connector. " + cite(4)),
              ("Which products does py6u9h say the SKU table is for?", "Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express. " + cite(4)),
          ],
          lab=[
              "Copy Table 2’s two columns onto paper. Circle anything you were about to call basic that sits only on the right.",
              "Write the adherence feature bullet and the connector sentence on the same card.",
          ],
          quiz=[
              ("MyTime is for whom?", "Agents, on web and mobile, to view and request schedule changes. " + cite(3)),
              ("Is vacation planner in the Basic WFM column of Table 2?", "No. It is listed with existing workforce management. " + cite(3)),
              ("What does py6u9h say about the Real-time Adherence connector on the basic SKU?", "It is not included and must be purchased separately as an add-on. " + cite(4)),
          ],
          sec30="Basic WFM on nmzg380 is forecasting, scheduling, bidding, intraday, and the agent apps. " + cite(3) + " The basic SKU still excludes the adherence connector and the historical connector. " + cite(4),
          sec120="I keep the feature list and the SKU row apart. Multi-skill scheduling and long-term budgeting are on the basic list. Vacation planner, overtime manager, and the API are on the existing-WFM side of Table 2. " + cite(3) + " The SKU article’s scope is Enterprise, CCE, and CCX. I do not silently extend it. " + cite(4),
          open=["Multi-tenant Webex Contact Center applicability of these SKUs is not in the py6u9h opening sentence."],
          cites=[3, 4]),
        R(code="T9-R03", file="T9-R03-basic-qm.html", track="T9", color=c9, mins=9,
          title="Basic quality management and recording",
          blurb="What Basic QM records and evaluates, and what stays on the full QM list.",
          hops=["Record", "Search", "Form", "Review"],
          lede="T9-R03. Basic QM is recording plus evaluation. The existing QM column adds workflows, calibration, appeals, and live screen monitoring. " + cite(3),
          takes=[
              "Basic QM includes call recording, evaluation across voice and digital, search and playback, text search, screen recording, and evaluation forms. " + cite(3),
              "Existing QM adds insights reporting, workflows, custom metadata, live screen monitoring, calibration, appeals, and HR or training tagging. " + cite(3),
              "py6u9h names A-FLEX-WFO-NQM as a full QM SKU used by Performance Management, Enterprise Analytics, and Insights. " + cite(4),
              "Calling recording retention in T2-R06 is a different article. This room does not copy those clocks onto WFO.",
          ],
          map_title="Basic QM is not the AI add-on",
          map="nmzg380’s quality package is recording and forms. nvtdfxk’s AI Quality Management is a later, paid add-on with its own SKUs. Keep the names apart. " + cite(3) + " " + cite(6),
          core="<p>Basic QM on nmzg380: call recording, evaluate contacts across voice and digital, view search playback and delete, text search in the body of a text, email, chat, or SMS, interaction contact details export, screen recording, create and edit evaluation forms, standard evaluation viewing, and contact import. " + cite(3) + "</p><p>Table 1 says existing quality management is all of that plus interaction export, insights reporting, QM workflows, custom metadata, QM views, contact queue, live screen monitoring, evaluation calibration, evaluation appeal, and HR/training contact tagging. " + cite(3) + "</p><p>py6u9h’s Performance Management row accepts full WFM, full QM, or the WFO bundle. The full QM name printed there is A-FLEX-WFO-NQM. " + cite(4) + "</p>",
          terms=[
              ("Text search", "Filters contacts based on text in a text, email, chat, or SMS body. " + cite(3)),
              ("Screen recording", "Captures agent screen activity alongside audio. " + cite(3)),
              ("Evaluation form", "Built and edited in Basic QM to match quality standards. " + cite(3)),
              ("Calibration", "Listed on the existing QM side of Table 1, not in the Basic column. " + cite(3)),
              ("A-FLEX-WFO-NQM", "The full QM SKU name printed on py6u9h. " + cite(4)),
          ],
          sisters=[
              ["AI Quality Management", "Separate add-on A-FLEX-AI-QM or the bundle A-FLEX-AI-QMMB.", "Do not tell a basic QM buyer they already have automated evaluations.", cite(6)],
              ["Calling recording", "T2-R06 quotes a different article for Webex and Dubber retention.", "Do not paste those clocks onto this WFO list.", cite(3)],
              ["Contact import", "Basic QM can bring in external contact data.", "That is not a CUCM migration.", cite(3)],
          ],
          edges=[
              ["Recording", "Evaluation form", "Both are in the Basic QM list.", cite(3)],
              ["Basic QM", "Live screen monitoring", "Monitoring is on the existing QM side.", cite(3)],
              ["Full QM SKU", "Performance Management", "A-FLEX-WFO-NQM is one accepted minimum.", cite(4)],
          ],
          flow=[
              "List Basic QM from Table 1 before you design a scorecard.",
              "If the ask is calibration or appeals, you are on the existing QM column.",
              "If the ask is automated AI scoring, leave this room and open T9-R04.",
          ],
          config="<ul><li>The article says teams create and edit evaluation forms. It does not print the click path inside the WFO client. " + cite(3) + "</li><li>The wfohelp.com pages it links were not opened.</li></ul>",
          limits=[
              ["Live screen monitoring", "Existing QM, not the Basic column.", cite(3)],
              ["Evaluation appeal", "Existing QM, not the Basic column.", cite(3)],
              ["AI automated evaluations", "Not in the nmzg380 Basic QM list.", cite(3)],
          ],
          trouble=[
              ["Calibration is missing on a basic order", "Table 1 puts calibration on existing QM.", "Do not debug it as a playback bug.", cite(3)],
              ["Someone expects Auto CSAT from Basic QM", "Auto CSAT is described on the AI quality pages, not in this basic list.", "Open nvtdfxk.", cite(6)],
          ],
          ladder=[
              ("Name four Basic QM capabilities.", "Call recording, screen recording, evaluation forms, text search. " + cite(3)),
              ("Where does live screen monitoring sit?", "Existing quality management, Table 1. " + cite(3)),
              ("Which SKU string is full QM on py6u9h?", "A-FLEX-WFO-NQM. " + cite(4)),
          ],
          lab=[
              "Mark each QM feature basic or existing from Table 1.",
              "Write AI Quality Management on a separate card so it cannot be merged into Basic QM.",
          ],
          quiz=[
              ("Text search looks in what?", "The body of a text, email, chat, or SMS message. " + cite(3)),
              ("Is evaluation appeal a Basic QM feature on Table 1?", "No. It is on the existing quality management side. " + cite(3)),
              ("Full QM SKU printed for Performance Management?", "A-FLEX-WFO-NQM, or full WFM, or the bundle. " + cite(4)),
          ],
          sec30="Basic QM records and evaluates. Calibration, appeals, and live screen monitoring are on the existing QM list. " + cite(3),
          sec120="Text search, screen recording, contact import, and evaluation forms are basic. Insights reporting and workflows are not. Full QM’s printed SKU is A-FLEX-WFO-NQM. The AI add-on is a different purchase, in the next room. " + cite(4) + " " + cite(6),
          open=["The WFO client click path for a form is not in nmzg380."],
          cites=[3, 4, 6]),
        R(code="T9-R04", file="T9-R04-ai-quality-management.html", track="T9", color=c9, mins=12,
          title="AI Quality Management in Control Hub",
          blurb="The paid add-on: evaluations, sentiment, coaching, and where to turn it on.",
          hops=["SKU", "Control Hub", "Queue", "Coach"],
          lede="T9-R04. AI Quality Management is a paid add-on. Administrators turn features on under Contact Center, AI Features. The FAQ on the getting-started page says English only for now. " + cite(5) + " " + cite(6),
          takes=[
              "Required SKUs printed on both articles: A-FLEX-AI-QM, or the bundle A-FLEX-AI-QMMB. " + cite(5) + " " + cite(6),
              "Features can be organization, queue, or agent scoped. " + cite(5),
              "The getting-started page lists automated evaluations, sentiment, coaching insights, an agent performance dashboard, and Analyzer reports. " + cite(6),
              "The FAQ says the features are visible only to customers who paid, and an administrator can leave a feature off. " + cite(6),
              "That same FAQ says AI Quality Management supports English only for now. " + cite(6),
          ],
          map_title="Add-on, then a toggle",
          map="Purchase, then Services, Contact Center, AI Features under Desktop Experience. Users also need AI Assistant in the desktop experience of their user profile. " + cite(5),
          core="<p>6m6r3fb says features are configured at organization, queue, or agent level. Prerequisites are the add-on SKU and AI Assistant access on the user profile’s Desktop Experience. " + cite(5) + "</p><p>The feature table: Evaluation and Speech Analytics is organization scope. Coaching Insights is organization scope. Sentiment analysis, marked as also part of the AI Assistant SKU, is queue scope and classifies completed interactions as positive, neutral, or negative. Auto CSAT is agent scope. Real-time transcriptions are queue scope. The asterisk says those three are part of the AI Assistant SKU as well. " + cite(5) + "</p><p>nvtdfxk says Auto CSAT and real-time transcriptions are included in the AI Quality Management SKU and can be enabled from Control Hub. The FAQ says if the organization subscribed and a feature is still missing, the administrator may have left it off. Language: English only for now. " + cite(6) + "</p><p>Coaching insights, on i8lp6i, are generated from historical interaction data, quality results, and performance metrics so a supervisor can prepare a coaching discussion. " + cite(9) + "</p><p>The Assistant article nvvv1zb also names sentiment analysis. It is a desktop add-on article, not this quality-form article. T8-R05 already separates the icon from the agent. " + cite(10) + "</p>",
          terms=[
              ("A-FLEX-AI-QM", "The AI Quality Management add-on SKU printed on 6m6r3fb and nvtdfxk. " + cite(5)),
              ("A-FLEX-AI-QMMB", "The AI Quality Management and AI Assistant bundled SKU. " + cite(6)),
              ("Sentiment class", "Positive, neutral, or negative for a completed interaction, in the enablement table. " + cite(5)),
              ("Coaching insights", "Recommendations from historical interaction data, quality results, and performance metrics. " + cite(9)),
              ("English only", "The getting-started FAQ’s current language line. " + cite(6)),
          ],
          sisters=[
              ["Basic QM", "Recording and manual forms.", "AI evaluations are the add-on, not Table 1 of nmzg380.", cite(3)],
              ["AI Assistant", "nvvv1zb. Sentiment, Auto CSAT, and transcriptions are also on that SKU.", "The asterisk on 6m6r3fb says so.", cite(5) + " " + cite(10)],
              ["User profile", "AI Assistant must be in Desktop Experience.", "A missing feature can be a profile, not a broken queue.", cite(5)],
          ],
          edges=[
              ["Control Hub", "Org toggle", "Evaluations and speech analytics, then Save.", cite(5)],
              ["Control Hub", "Queue", "Sentiment analysis and real-time transcriptions.", cite(5)],
              ["Transcription", "Flow", "All-queues path adds Start Media Stream after the AgentAnswered event, then save and publish.", cite(5)],
              ["Custom layout", "Assistant icon", "Add comp ai-assistant in advancedHeader.", cite(5)],
          ],
          flow=[
              "Confirm the SKU. " + cite(6),
              "Open Services, Contact Center, AI Features. " + cite(5),
              "Turn on the org features you mean to use, then Save.",
              "For transcription on every queue in a flow, add Start Media Stream after AgentAnswered and publish. " + cite(5),
              "For a custom layout, add the ai-assistant component. Global layout already shows the Assistant. " + cite(5),
          ],
          config="<ul><li>Evaluations: Org level settings, turn on Evaluations and speech analytics, Save. " + cite(5) + "</li><li>Coaching insights: Org level settings, turn on, Save. Supervisors then enable teams and KPI thresholds. " + cite(5) + "</li><li>Sentiment: Queue level settings. The same numbered steps also mention applying to all queues or selected queues and a generate-summaries toggle. This room does not rename that toggle. " + cite(5) + "</li><li>Auto CSAT: enable call recording first. Queue level settings. Experience Management surveys or a global variable can train the model. " + cite(5) + "</li><li>Real-time transcription on a custom layout needs visibility RT_TRANSCRIPT for agent, supervisor, and agent-supervisor. " + cite(5) + "</li></ul>",
          limits=[
              ["Language", "English only, for now, on the nvtdfxk FAQ.", cite(6)],
              ["Visibility", "Paid customers. Administrator can leave a feature off.", cite(6)],
              ["Sentiment classes", "Positive, neutral, or negative.", cite(5)],
              ["Transcription activity", "Start Media Stream after AgentAnswered for the all-queues path.", cite(5)],
              ["Score bands", "The numeric bands are on n4jc67x, next room, not on this enablement page.", cite(7)],
          ],
          trouble=[
              ["The supervisor cannot see AI quality", "The FAQ says the add-on is paid and the administrator can leave features off.", "Ask which toggles are on, and whether the profile includes AI Assistant.", cite(5) + " " + cite(6)],
              ["A non-English queue expects sentiment", "The getting-started FAQ says English only for now.", "Do not promise other languages from this page.", cite(6)],
              ["Transcription never starts", "The flow must start media streaming. All-queues uses Start Media Stream after AgentAnswered, then publish.", "Check the flow, not only the toggle.", cite(5)],
          ],
          ladder=[
              ("Which two SKUs enable AI Quality Management?", "A-FLEX-AI-QM or A-FLEX-AI-QMMB. " + cite(6)),
              ("Where is the Control Hub page?", "Services, Contact Center, AI Features under Desktop Experience. " + cite(5)),
              ("What language does the FAQ name?", "English only for now. " + cite(6)),
              ("What must a custom layout add for the Assistant?", "A component whose comp is ai-assistant, inside advancedHeader. " + cite(5)),
          ],
          lab=[
              "Write the Control Hub path from memory, then check 6m6r3fb.",
              "List org-scoped versus queue-scoped features from the table.",
              "Find AgentAnswered on a practice flow sketch and place Start Media Stream after it. Do not publish against a live tenant from this lab.",
          ],
          quiz=[
              ("Who can see AI Quality Management features?", "Customers who paid for the add-on, and only the features an administrator left on. " + cite(6)),
              ("Sentiment scope in the enablement table?", "Queue. Classification is positive, neutral, or negative. " + cite(5)),
              ("Coaching insights are generated from what, on i8lp6i?", "Historical interaction data, quality results, and performance metrics. " + cite(9)),
              ("Global desktop layout and the Assistant?", "The Assistant is available automatically. A custom layout needs the component added. " + cite(5)),
          ],
          sec30="AI Quality Management is the paid add-on A-FLEX-AI-QM or the bundle. Turn it on under Contact Center, AI Features. English only, for now. " + cite(5) + " " + cite(6),
          sec120="Evaluations and coaching are organization settings. Sentiment and transcription are queue settings. Auto CSAT needs recording. A custom layout needs the ai-assistant component and, for transcripts, RT_TRANSCRIPT. I do not treat a missing icon as a broken phone. " + cite(5),
          open=["The sentiment enablement steps mention a generate-summaries control. This room does not reinterpret that control.", "Non-English support is described as coming later. No date is copied because the FAQ does not print one."],
          cites=[3, 5, 6, 9, 10]),
        R(code="T9-R05", file="T9-R05-qm-analyzer.html", track="T9", color=c9, mins=11,
          title="Quality reports in Analyzer",
          blurb="CSR and ASR, the sentiment bands, and what a score is not.",
          hops=["Enable", "CSR", "ASR", "Coach"],
          lede="T9-R05. Advanced reporting. Analyzer can show AI quality metrics on a customer-session report and an agent report. The sentiment number has printed bands. " + cite(7),
          takes=[
              "Two custom report types: interaction-level QM metrics (CSR) and agent performance by team (ASR). " + cite(7),
              "Customer Sentiment Score runs from -100 to +100. Above +45 is positive, below -45 is negative, and the band between is neutral. " + cite(7),
              "CSR fields include evaluation score, cross talk, dead air, word ratio, Auto CSAT, transfers, and consults. " + cite(7),
              "If an agent worked on more than one team, ASR shows a row per agent and team. " + cite(7),
              "Reports only help after the features they measure are enabled. " + cite(7) + " " + cite(5),
          ],
          map_title="A report is not the toggle",
          map="n4jc67x says some values depend on the features enabled for the interaction, queue, or agent. Build the report after T9-R04’s toggles. " + cite(7),
          core="<p>Open Analyzer, create a custom CSR or ASR visualization, pick the interval and filters, then drill into agent, team, queue, or interaction. " + cite(7) + "</p><p>The QM for Interactions report is the interaction view. Channel values named on the field list: telephony, email, chat, or social. Direction is inbound or outbound. Sentiment bands are printed on the Customer Sentiment Score field. " + cite(7) + "</p><p>The Human Agent Performance report averages evaluation score and operational measures. Filters are agent, team, duration, and channel. " + cite(7) + "</p><p>voh2oeb’s opened outline covers how scoring works, Control Hub, Supervisor Desktop, and filtering. The numeric bands used in this room are the ones printed on n4jc67x. " + cite(8) + " " + cite(7) + "</p>",
          terms=[
              ("CSR", "The interaction-level custom report: customer interactions and their QM metrics. " + cite(7)),
              ("ASR", "The agent report: agents by team and operational plus QM metrics. " + cite(7)),
              ("Dead air", "Time in the connected portion when neither customer nor agent is speaking. " + cite(7)),
              ("Cross talk", "Time the agent spoke over the customer. " + cite(7)),
              ("Neutral band", "Sentiment from -45 through +45, inclusive of the between wording on n4jc67x. " + cite(7)),
          ],
          sisters=[
              ["Coaching", "Use hold, transfer, consult, cross talk, word ratio, and dead air when a behavior needs review.", "The ASR how-to says so.", cite(7)],
              ["Supervisor desktop", "voh2oeb is the sentiment article whose sections include Supervisor Desktop.", "The score bands stay with n4jc67x.", cite(8)],
              ["T3-R07", "Analyzer’s own refresh clocks live in that room.", "A sentiment band is not a refresh interval.", cite(7)],
          ],
          edges=[
              ["Enabled QM feature", "Report value", "Some values depend on what is enabled.", cite(7)],
              ["Interaction id or ANI", "One contact", "The CSR how-to names both for a specific interaction.", cite(7)],
              ["Agent on two teams", "Two ASR rows", "One row per agent and team combination.", cite(7)],
          ],
          flow=[
              "Enable the QM features the report will read. " + cite(5),
              "Create the CSR when the question is one interaction.",
              "Create the ASR when the question is an agent across a period.",
              "Apply the sentiment bands only to the field that prints them.",
          ],
          config="<ul><li>Sign in to Webex Contact Center and open Analyzer. " + cite(7) + "</li><li>Create the custom report from the available metrics. The article does not name a hidden template id. " + cite(7) + "</li></ul>",
          limits=[
              ["Sentiment range", "-100 to +100.", cite(7)],
              ["Positive", "Greater than +45.", cite(7)],
              ["Negative", "Less than -45.", cite(7)],
              ["Neutral", "Between -45 and +45.", cite(7)],
              ["CSR channel", "Telephony, email, chat, or social.", cite(7)],
              ["ASR grain", "Separate rows when the agent worked on more than one team.", cite(7)],
          ],
          trouble=[
              ["Sentiment is blank", "The before-you-begin list says the feature has to be enabled, and real-time transcription is a prerequisite on the sentiment article’s enablement sibling.", "Check the queue toggle and the flow. Do not average a blank into zero.", cite(7) + " " + cite(5)],
              ["An agent total looks doubled", "ASR emits a row per team.", "Do not sum the rows without noticing the team column.", cite(7)],
              ["A +40 score is called positive", "Positive is greater than +45.", "Call +40 neutral.", cite(7)],
          ],
          ladder=[
              ("What does CSR stand for in this article’s usage?", "The interaction-level report of customer interactions and QM metrics. The article also expands the idea as a list of interactions, and it labels the report QM for Interactions. " + cite(7)),
              ("State the three sentiment bands.", "Above +45 positive, below -45 negative, between -45 and +45 neutral. " + cite(7)),
              ("When does ASR split an agent?", "When the agent worked on more than one team in the interval. " + cite(7)),
          ],
          lab=[
              "Classify scores +60, +40, -50, and 0 using only the printed bands.",
              "Pick CSR or ASR for the question “which calls failed evaluation yesterday?”",
          ],
          quiz=[
              ("Dead air is what?", "Connected time when neither party is speaking. " + cite(7)),
              ("Is +45 itself described as positive?", "The page says greater than +45 is positive. +45 sits in the between band as printed. " + cite(7)),
              ("Which report compares agents?", "The Human Agent Performance report, ASR. " + cite(7)),
          ],
          sec30="Analyzer’s AI quality reports are an interaction report and an agent report. Sentiment runs from -100 to +100, with breaks at 45. " + cite(7),
          sec120="I use CSR for one contact and ASR for a person over time. I do not add an agent’s team rows into one score. I do not call a score positive unless it is above +45. Empty values can mean the feature was off. " + cite(7) + " " + cite(5),
          open=["The article says CSR and ASR as the report types. It does not spell those acronyms out in the sentences I quoted, beyond the report names."],
          cites=[5, 7, 8]),
    ]
    t10 = [
        R(code="T10-R01", file="T10-R01-three-ai-names.html", track="T10", color=c10, mins=9,
          title="Three AI names in Webex Contact Center",
          blurb="Assistant, Studio agents, and Virtual Agent–Voice are different surfaces.",
          hops=["Assistant", "Studio", "Voice", "Human"],
          lede="T10-R01. Fundamentals for the AI chapter. The Assistant is a desktop add-on. Studio agents attach to voice with Virtual Agent V2. Virtual Agent–Voice is also the name of the third-party IVR connector article. " + cite(10) + " " + cite(11) + " " + cite(13),
          takes=[
              "nvvv1zb, header October 06, 2026, is the Cisco AI Assistant article: summaries, wellness, transcripts, Auto CSAT, topics, Real-time Assist, and sentiment. " + cite(10),
              "s0qro1 says you create agents in AI Agent Studio, then integrate them. Autonomous voice is limited to specific customers. " + cite(11),
              "n6gaghu says Virtual Agent–Voice integrates the IVR with third-party cloud AI, and it sends Webex AI Agent voice setup to s0qro1. " + cite(13),
              "T8-R05 already holds the long Assistant-versus-agent room. This track is the path from fundamentals to the voice and digital edges.",
          ],
          map_title="Do not swap the names",
          map="If the icon is missing, you are in the Assistant article. If the flow activity is Virtual Agent V2, you are in s0qro1. If the connector is a third-party CCAI service, you are in n6gaghu. " + cite(10) + " " + cite(11) + " " + cite(13),
          core="<p>The Assistant page lists AI-generated summaries, wellness breaks, real-time transcripts, Auto CSAT, Topic Analytics, Real-time Assist, and sentiment analysis, plus a privacy section. " + cite(10) + "</p><p>s0qro1 is the end-to-end integration after the agent exists in Studio. It has a voice half and a digital half. " + cite(11) + "</p><p>n6gaghu’s first job is third-party Virtual Agent–Voice. The page tells you to use the AI-agents article when the voice agent is a Webex AI Agent. " + cite(13) + "</p><p>The Studio administration guide ncs9r37 is the build guide s0qro1 points to for scripted and autonomous setup. This room does not paste unpublished caps from memory. " + cite(12) + "</p>",
          terms=[
              ("Cisco AI Assistant", "The desktop capability described on nvvv1zb. " + cite(10)),
              ("AI Agent Studio", "Where scripted and autonomous agents are created before s0qro1 attaches them. " + cite(11)),
              ("Virtual Agent V2", "The Flow Designer activity for speech-based AI conversations. " + cite(11)),
              ("Virtual Agent–Voice", "The IVR integration with third-party cloud AI on n6gaghu. " + cite(13)),
          ],
          sisters=[
              ["T8-R05", "The existing long room on Assistant and agents.", "Use it when you need the quote-level Assistant limits.", cite(10)],
              ["T9 AI QM", "Quality scoring and coaching.", "A quality form is not Virtual Agent V2.", cite(6)],
              ["Bring your own", "The developer page opened. No payload is quoted from it here.", "Do not invent an event name.", cite(20)],
          ],
          edges=[
              ["Studio", "Published agent", "s0qro1 starts after create and configure.", cite(11)],
              ["n6gaghu", "s0qro1", "The third-party article redirects Webex AI Agent voice to s0qro1.", cite(13)],
              ["Control Hub", "Assistant icon", "T9-R04 quotes the layout component. The feature list is nvvv1zb.", cite(10)],
          ],
          flow=[
              "Say which of the three names you mean.",
              "Open only that article.",
              "If the design uses a third-party bot and a Webex AI Agent, draw two boxes.",
          ],
          config="<ul><li>No single toggle turns on all three. " + cite(10) + " " + cite(11) + " " + cite(13) + "</li></ul>",
          limits=[
              ["Autonomous voice", "Limited to specific customers. Contact Cisco support, s0qro1 says.", cite(11)],
              ["Assistant article date", "Header October 06, 2026.", cite(10)],
              ["Third-party versus Webex agent", "n6gaghu keeps them in different sentences.", cite(13)],
          ],
          trouble=[
              ["A flow is named AI Assistant", "The Assistant article describes desktop features, not Virtual Agent V2.", "Rename the design to the activity you actually configured.", cite(10) + " " + cite(11)],
              ["Autonomous voice is promised to every tenant", "s0qro1 says access is limited to specific customers.", "Stop the promise.", cite(11)],
          ],
          ladder=[
              ("Which article is the Assistant?", "nvvv1zb. " + cite(10)),
              ("Which activity attaches a Webex AI Agent to voice?", "Virtual Agent V2, on s0qro1. " + cite(11)),
              ("What does n6gaghu tell you to read for Webex AI Agents?", "The use-AI-agents article. " + cite(13)),
          ],
          lab=[
              "Label three boxes: Assistant, Studio agent, third-party Virtual Agent–Voice.",
              "Draw an arrow only where an opened article describes one.",
          ],
          quiz=[
              ("Is the Assistant the same object as Virtual Agent V2?", "No. Different articles. " + cite(10) + " " + cite(11)),
              ("Where are agents created before integration?", "Webex AI Agent Studio. " + cite(11)),
              ("Who is autonomous voice for, today, in s0qro1?", "Specific customers. Others are told to contact Cisco support. " + cite(11)),
          ],
          sec30="Assistant, Studio agent, and third-party Virtual Agent–Voice are three articles. I do not merge them. " + cite(10) + " " + cite(11) + " " + cite(13),
          sec120="The Assistant page is summaries and desktop help. Studio agents join a voice flow through Virtual Agent V2, and autonomous voice is not generally available to every customer on that page. The third-party connector has its own article. " + cite(11) + " " + cite(13),
          open=["Studio numeric caps stay in T8-R05 when that room quotes ncs9r37. This track repeats a cap only when this pass’s opened body printed it."],
          cites=[6, 10, 11, 12, 13, 20]),
        R(code="T10-R02", file="T10-R02-virtual-agent-v2.html", track="T10", color=c10, mins=12,
          title="Voice path: Virtual Agent V2",
          blurb="Entry point, flow, published agent, and the three outcomes.",
          hops=["Entry", "Flow", "VAV2", "Outcome"],
          lede="T10-R02. Voice. Drag Virtual Agent V2 onto the flow, pick a published scripted or autonomous agent, and handle Handled, Escalated, or Errored. " + cite(11),
          takes=[
              "Prerequisites: the agent exists, the voice entry point exists, a flow is assigned, and the flow is set up. " + cite(11),
              "Scripted: Contact Center AI Config is Webex AI Agent Scripted, then a published scripted agent. " + cite(11),
              "Autonomous: Webex AI Agent Autonomous, then a published autonomous agent. Voice access is limited. " + cite(11),
              "Outcomes are Handled, Escalated, and Errored. " + cite(11),
              "VirtualAgentV2.TranscriptURL and VirtualAgentV2.MetaData are output variables the article names. " + cite(11),
          ],
          map_title="Speech in, one of three paths out",
          map="The caller speaks. The activity matches speech to an intent and continues the IVR. Completion, escalation, and errors are different legs. " + cite(11),
          core="<p>s0qro1 says to drag Virtual Agent V2 from the activity library. General settings take a label and a description. Conversational experience selects the config and a published agent. " + cite(11) + "</p><p>Handled means virtual-agent execution completed. Escalated means the call must go to a human. Errored is any error during the conversation. " + cite(11) + "</p><p>Escalation metadata examples on the page include escalation_type custom or system, and escalation_trigger such as agent_transfer for the system example. " + cite(11) + "</p><p>Enable voice recording is an advanced checkbox. Recordings show on the Sessions page in AI Agent Studio. The article warns that automated PCI-pattern detection can miss unprompted card disclosure, weak speech-to-text, or a call that ends before analysis. " + cite(11) + "</p>",
          terms=[
              ("Handled", "Virtual agent execution completed. " + cite(11)),
              ("Escalated", "The call must go to a human agent. " + cite(11)),
              ("Errored", "Any error between the virtual agent and the caller. " + cite(11)),
              ("TranscriptURL", "Output variable pointing at the transcript. " + cite(11)),
              ("MetaData", "JSON received from the agent for fulfillment, a custom event, or a transfer. " + cite(11)),
          ],
          sisters=[
              ["Flow Designer", "T8-R01 is the activity canvas.", "This room only adds Virtual Agent V2.", cite(11)],
              ["Recording detection", "Not a guarantee. The article lists three miss cases.", "Do not tell security the checkbox is a PCI program.", cite(11)],
              ["Human queue", "Escalated is the leg that needs a person.", "Draw it. Do not end the flow on the activity.", cite(11)],
          ],
          edges=[
              ["Entry point", "Flow", "Assign the routing flow to the voice entry point.", cite(11)],
              ["VAV2", "Handled / Escalated / Errored", "Three outcomes.", cite(11)],
              ["Recording checkbox", "Studio Sessions", "Where recordings appear.", cite(11)],
          ],
          flow=[
              "Create the agent in Studio. " + cite(12),
              "Create the voice entry point and assign the flow. " + cite(11),
              "Drop Virtual Agent V2 and select a published agent.",
              "Wire all three outcomes.",
              "Decide whether the recording checkbox matches the compliance ask, given the detection limits.",
          ],
          config="<ul><li>Activity library, Virtual Agent V2, main canvas. " + cite(11) + "</li><li>Contact Center AI Config: Webex AI Agent Scripted or Webex AI Agent Autonomous. " + cite(11) + "</li><li>Virtual Agent drop-down: a published agent of that type. " + cite(11) + "</li></ul>",
          limits=[
              ["Autonomous voice availability", "Specific customers.", cite(11)],
              ["Outcome names", "Handled, Escalated, Errored.", cite(11)],
              ["PCI detection", "Can miss unprompted disclosure, bad transcripts, or early disconnects.", cite(11)],
          ],
          trouble=[
              ["The drop-down has no agent", "The article says to select a published agent.", "Publish it in Studio before you blame the flow.", cite(11)],
              ["Escalated calls disappear", "Escalated is a separate outcome.", "Connect that leg to a queue.", cite(11)],
              ["A recorded card number was visible", "Detection is not complete. The article lists miss cases.", "Treat the checkbox as a control with gaps.", cite(11)],
          ],
          ladder=[
              ("Name the three outcomes.", "Handled, Escalated, Errored. " + cite(11)),
              ("What does MetaData hold?", "JSON from fulfillment, a custom event, or a transfer. " + cite(11)),
              ("Where do recordings appear?", "The Sessions page in AI Agent Studio. " + cite(11)),
          ],
          lab=[
              "Sketch the three legs and name the human queue on Escalated.",
              "Write one sentence you will not say about PCI detection.",
          ],
          quiz=[
              ("Which config value selects a scripted Webex agent?", "Webex AI Agent Scripted. " + cite(11)),
              ("System transfer example trigger on the page?", "agent_transfer, with escalation_type system. " + cite(11)),
              ("What must exist before the activity?", "A created agent, a voice entry point, an assigned flow. " + cite(11)),
          ],
          sec30="Virtual Agent V2 plays a published Studio agent. The call leaves through Handled, Escalated, or Errored. " + cite(11),
          sec120="I pick scripted or autonomous in Contact Center AI Config. Autonomous voice is limited. I wire the human on the escalated leg. I do not describe the recording checkbox as complete card-data protection. " + cite(11),
          open=["The example JSON on the page is an illustration. This room does not treat those booking fields as required."],
          cites=[11, 12]),
        R(code="T10-R03", file="T10-R03-language-voice-events.html", track="T10", color=c10, mins=10,
          title="Language, voice, and custom events",
          blurb="Global variables, the error path, and voice-only events.",
          hops=["Language", "Voice", "Event", "Error"],
          lede="T10-R03. Override language and voice with flow variables set before Virtual Agent V2. A voice the engine does not support takes the error path. Custom events are voice only. " + cite(11),
          takes=[
              "Set Global_Language to a language code such as fr-CA before the activity. " + cite(11),
              "Set Global_VoiceName to a voice code such as en-US-Jennifer. " + cite(11),
              "If the voice is not supported by the agent’s engine, the call exits the error path. " + cite(11),
              "State events use Event Name and Event Data. Expressions use the article’s double-brace syntax. " + cite(11),
              "Custom events are supported for scripted and autonomous agents through the voice channel only. " + cite(11),
          ],
          map_title="Set the variable, then the activity",
          map="The article says to put Set Variable activities before Virtual Agent V2 when you override Studio defaults. " + cite(11),
          core="<p>The example custom welcome uses Event Name CustomWelcome and Event Data as a JSON object with a Name field. Event name and data may be static or an expression. " + cite(11) + "</p><p>VirtualAgentV2.StateEventName stores the custom event name received back after the flow triggers one. " + cite(11) + "</p><p>The supported-languages article is named but was not opened. This room does not copy a language matrix. The fr-CA and en-US-Jennifer strings are the examples s0qro1 itself prints. " + cite(11) + "</p>",
          terms=[
              ("Global_Language", "Flow variable that overrides the Studio input language. Example on the page: fr-CA. " + cite(11)),
              ("Global_VoiceName", "Flow variable that overrides the output voice. Example: en-US-Jennifer. " + cite(11)),
              ("State event", "Event Name plus Event Data sent to the agent’s handler. " + cite(11)),
              ("Voice-only custom events", "The article’s current line for scripted and autonomous agents. " + cite(11)),
          ],
          sisters=[
              ["Studio defaults", "Used when the flow variables are absent.", "Override only when you set them earlier.", cite(11)],
              ["Error path", "Unsupported voice.", "Not the same as Escalated.", cite(11)],
              ["Digital channels", "Next room. Custom events are not claimed there.", cite(11)],
          ],
          edges=[
              ["Set Variable", "Global_Language", "Before VAV2.", cite(11)],
              ["Set Variable", "Global_VoiceName", "Before VAV2.", cite(11)],
              ["Unsupported voice", "Errored", "The call leaves on the error path.", cite(11)],
          ],
          flow=[
              "Decide whether Studio defaults are acceptable.",
              "If not, set Global_Language and Global_VoiceName first.",
              "Use a voice the agent’s engine supports. The matrix article was not opened, so confirm it before a design review.",
              "Add a state event only on the voice flow.",
          ],
          config="<ul><li>Set Variable, name Global_Language, value a code the article exemplifies as fr-CA. " + cite(11) + "</li><li>Set Variable, name Global_VoiceName. " + cite(11) + "</li><li>State Event columns: Event Name, Event Data. Expression form uses double braces around the variable, as the article prints. " + cite(11) + "</li></ul>",
          limits=[
              ["Custom events", "Voice channel only, scripted and autonomous.", cite(11)],
              ["Bad voice", "Error path of VAV2.", cite(11)],
              ["Language matrix", "Named, not opened. Confirm.", "No URL in the confirm row"],
          ],
          trouble=[
              ["Every override hits Errored", "The voice may be unsupported by that engine.", "Check the supported list. This lab did not open that article.", cite(11)],
              ("A digital flow uses a custom event", "Custom events are voice only in s0qro1.", "Move that mechanism to voice or drop it.", cite(11)),
          ],
          ladder=[
              ("Which variable overrides language?", "Global_Language. " + cite(11)),
              ("What happens with an unsupported voice?", "The call exits the error path. " + cite(11)),
              ("Where do custom events work?", "Voice only. " + cite(11)),
          ],
          lab=[
              "Place two Set Variable steps above a VAV2 box.",
              "Mark the language-list article as confirm until you open it.",
          ],
          quiz=[
              ("Example language code printed on s0qro1?", "fr-CA. " + cite(11)),
              ("Example voice code printed there?", "en-US-Jennifer. " + cite(11)),
              ("Can you put a custom event on digital, according to that article?", "No. Voice only. " + cite(11)),
          ],
          sec30="Language and voice overrides are Global_Language and Global_VoiceName, set before Virtual Agent V2. A bad voice takes the error path. Custom events stay on voice. " + cite(11),
          sec120="I use the article’s own examples, not a matrix I did not open. Expressions use the double-brace form the page prints. StateEventName is how the flow sees the event that came back. " + cite(11),
          open=["Supported languages and voices article: confirm, no URL, because it was not opened."],
          cites=[11]),
        R(code="T10-R04", file="T10-R04-digital-ai-channels.html", track="T10", color=c10, mins=11,
          title="Digital AI agents and the six channels",
          blurb="Webex Connect’s AI Agent node, and the channels the article names.",
          hops=["Channel", "Connect", "Agent", "Handover"],
          lede="T10-R04. Digital. Six channels: WhatsApp, SMS, Email, Facebook Messenger, Apple Messages for Business, and Live Chat. The node’s timeout phrase is not more than 15 seconds. " + cite(11),
          takes=[
              "Webex Connect integration currently supports those six channels, header August 25, 2026. " + cite(11),
              "The AI Agent node has Process Message and Close session. " + cite(11),
              "onTimeOut is when the agent has not responded in not more than 15 seconds. " + cite(11),
              "onAgentHandover is the success-side outcome when the agent requests a human. " + cite(11),
              "Custom parameters are only for scripted agents on digital, in that article. " + cite(11),
          ],
          map_title="A node, not Virtual Agent V2",
          map="Voice uses Flow Designer. Digital uses a Webex Connect flow and the AI Agent node. " + cite(11),
          core="<p>Process Message inputs include agent type, agent, message, language, channel, and user identifier. Language is disabled for a single-language agent. Custom parameters are optional and, currently, only for scripted agents. Keys are described as available later as consumer data. Message parameters are for the next response only. " + cite(11) + "</p><p>Outputs include TextResponse, which returns the first text item and only when no rich element is present, plus FullResponse, Datastore, TransactionId, SessionId, and ConsumerId. MessageMetadata and SessionMetadata are scripted-only on digital. " + cite(11) + "</p><p>Close session takes the agent and the session id from Process Message. " + cite(11) + "</p><p>Outcomes: onError when there is no message, onInvalidCustomerID, onInvalidMessage, onSuccess, onAgentHandover, and onTimeOut. " + cite(11) + "</p>",
          terms=[
              ("Six channels", "WhatsApp, SMS, Email, Facebook Messenger, Apple Messages for Business, Live Chat. " + cite(11)),
              ("Process Message", "Sends the customer message and returns the agent response. " + cite(11)),
              ("Close session", "Closes the AI agent session. Inactive sessions can close automatically. " + cite(11)),
              ("onAgentHandover", "The agent raised a request to hand over to human agents. " + cite(11)),
              ("onTimeOut", "The agent has not responded in not more than 15 seconds. " + cite(11)),
          ],
          sisters=[
              ["Virtual Agent V2", "Voice activity.", "Do not drop it onto a Connect digital flow.", cite(11)],
              ["Custom events", "Voice only.", "Digital uses custom parameters, and only for scripted agents.", cite(11)],
              ["T8-R03", "Webex Connect as a product surface.", "This room is only the AI Agent node.", cite(11)],
          ],
          edges=[
              ["Channel asset", "Connect flow", "Six named channels.", cite(11)],
              ["Process Message", "TextResponse or FullResponse", "TextResponse is first text only, and only without rich elements.", cite(11)],
              ["Agent", "Human", "onAgentHandover.", cite(11)],
          ],
          flow=[
              "Confirm the channel is one of the six.",
              "Create the Connect flow and drop the AI Agent node.",
              "Map Process Message inputs, including a real user identifier.",
              "Handle handover and the timeout leg.",
              "Close the session when you need a new one.",
          ],
          config="<ul><li>Agent type and agent come from Studio agents you can access. " + cite(11) + "</li><li>Language drop-down follows the agent’s languages and is disabled when there is one. " + cite(11) + "</li></ul>",
          limits=[
              ["Channel count", "Six, listed by name.", cite(11)],
              ["Timeout phrase", "Not more than 15 seconds. The outcomes list does not print a separate timer field.", cite(11)],
              ["Custom parameters", "Scripted agents on digital only.", cite(11)],
              ["TextResponse", "First text item, and only if no rich element is present.", cite(11)],
          ],
          trouble=[
              ["The node times out", "onTimeOut uses the article’s 15-second phrase.", "Look at agent response time. Do not invent a settings field the list does not show.", cite(11)],
              ["TextResponse is empty but the agent sent buttons", "TextResponse does not return rich elements.", "Read FullResponse.", cite(11)],
              ["A custom event was copied from voice", "Custom events are voice only.", "Use message or custom parameters on digital, within the scripted limit.", cite(11)],
          ],
          ladder=[
              ("Name the six channels.", "WhatsApp, SMS, Email, Facebook Messenger, Apple Messages for Business, Live Chat. " + cite(11)),
              ("What is onTimeOut?", "The agent has not responded in not more than 15 seconds. " + cite(11)),
              ("Who can receive custom parameters?", "Scripted agents, on digital. " + cite(11)),
          ],
          lab=[
              "Write the six channel names without looking, then check s0qro1.",
              "Pick FullResponse when the reply can contain more than plain text.",
          ],
          quiz=[
              ("Which node method returns SessionId?", "Process Message. Close session consumes that id. " + cite(11)),
              ("onInvalidCustomerID means what?", "A customer identifier is missing. " + cite(11)),
              ("Is the 15-second line a field the article shows you editing?", "The page states the phrase. It does not print a timer field in the outcomes list. " + cite(11)),
          ],
          sec30="Digital AI agents sit on a Connect node and six named channels. Handover and a 15-second timeout phrase are separate outcomes. " + cite(11),
          sec120="I do not reuse Virtual Agent V2 for WhatsApp. I do not expect TextResponse to carry buttons. Custom events stay on voice. Custom parameters on digital are scripted-only. " + cite(11),
          open=["Channel asset setup steps are named, not copied. Open that article before a build."],
          cites=[11]),
        R(code="T10-R05", file="T10-R05-voice-ai-limits.html", track="T10", color=c10, mins=9,
          title="What the public AI pages will not support",
          blurb="Limits, a different third-party article, and claims this lab will not make.",
          hops=["Limit", "Article", "Sibling", "Confirm"],
          lede="T10-R05. Advanced. Public pages contradict a few popular claims. This room keeps the contradictions. " + cite(11) + " " + cite(13) + " " + cite(6),
          takes=[
              "Autonomous voice is not described as available to every customer. " + cite(11),
              "AI Quality Management’s getting-started FAQ says English only for now. That line is about quality management, not proof of the agent language list. " + cite(6),
              "n6gaghu is the third-party Virtual Agent–Voice article. It is not a second copy of Studio. " + cite(13),
              "The bring-your-own developer page opened. This room does not quote a payload from it. " + cite(20),
              "Sibling AI Lab is a separate study site. It is not Cisco documentation. " + cite(21),
          ],
          map_title="Claim, then the page that allows it",
          map="If you cannot point at an opened page, the claim stays off the diagram. Confirm rows have no address. " + cite(11),
          core="<p>s0qro1’s autonomous-voice sentence and the six-channel sentence are dated by the article header August 25, 2026, and they were opened again in October 2026. Re-open the live page before you repeat them in a design. " + cite(11) + "</p><p>ncs9r37 was opened. It is the Studio administration guide, including knowledge sources in its contents. This pass does not add file-size numbers beyond what s0qro1 and the Assistant pages printed, because those numbers were not in the portion used for a new claim here. T8-R05 remains the room that quoted the Studio caps on an earlier retrieval. " + cite(12) + "</p><p>The AI lab at cyphermonkeylabs.com describes itself as a free learning lab on programming, models, retrieval, agents, and voice. It is a sibling classroom, not a Webex SKU. " + cite(21) + "</p>",
          terms=[
              ("Specific customers", "The availability line for autonomous voice. " + cite(11)),
              ("English only", "AI Quality Management FAQ, not the Studio language matrix. " + cite(6)),
              ("Confirm", "A sources row with no URL, used when a page was not opened."),
              ("Sibling lab", "A CypherMonkey Labs study site that opened in 2026-10. " + cite(21)),
          ],
          sisters=[
              ["T8-R05", "Earlier quoted Studio limits.", "Re-read ncs9r37 before you teach a cap from memory.", cite(12)],
              ["AI Lab", "Agents and voice as general study.", "Not a Webex admin guide.", cite(21)],
              ["Quality English line", "nvtdfxk.", "Do not paste it onto Virtual Agent V2.", cite(6)],
          ],
          edges=[
              ["Unopened language matrix", "Confirm row", "No URL.", cite(11)],
              ["Developer BYO page", "Opened, not quoted", "No invented event.", cite(20)],
              ["s0qro1", "Design review", "Re-open before you freeze a channel list.", cite(11)],
          ],
          flow=[
              "Write the claim.",
              "Write the article id under it.",
              "If the article was not opened, write confirm and stop.",
          ],
          config="<ul><li>There is no extra toggle in this room. The work is to refuse an unsupported sentence. " + cite(11) + "</li></ul>",
          limits=[
              ["Autonomous voice", "Specific customers.", cite(11)],
              ["Digital channels", "Six, as of the opened s0qro1.", cite(11)],
              ["QM language", "English only for now, on nvtdfxk.", cite(6)],
              ["BYO payload", "Not quoted.", cite(20)],
          ],
          trouble=[
              ["A slide says autonomous voice is GA for all tenants", "s0qro1 does not say that.", "Replace the slide.", cite(11)],
              ["A BYO diagram invents an event name", "This pass did not quote the developer page’s payload.", "Open the page and copy the printed name, or leave the box blank.", cite(20)],
          ],
          ladder=[
              ("What will you not say about autonomous voice?", "That every tenant has it. " + cite(11)),
              ("Is the AI Lab a Cisco document?", "No. It is a sibling study lab that opened at cyphermonkeylabs.com. " + cite(21)),
              ("Where do Studio build steps live?", "ncs9r37, which s0qro1 cites for setup. " + cite(12)),
          ],
          lab=[
              "Red-pen a fake slide that says “autonomous voice, all customers, 12 channels.”",
              "Replace it with the sentences you can cite.",
          ],
          quiz=[
              ("Which header date is on the AI-agents integration article?", "August 25, 2026. " + cite(11)),
              ("Does this room quote a bring-your-own JSON event?", "No. The page was opened and not quoted. " + cite(20)),
              ("English-only applies, in this chapter, to which FAQ?", "AI Quality Management on nvtdfxk, not automatically to every agent voice. " + cite(6)),
          ],
          sec30="I will not call autonomous voice universal, I will not add a seventh digital channel, and I will not invent a bring-your-own event. " + cite(11) + " " + cite(20),
          sec120="Quality management’s English line stays on the quality FAQ. Studio caps stay where a retrieval actually printed them. The sibling AI lab is for general agent study. Cisco’s pages remain the Webex claims. " + cite(6) + " " + cite(21),
          open=["Re-open s0qro1, nvvv1zb, and ncs9r37 before any design that depends on availability or a file cap."],
          cites=[6, 11, 12, 13, 20, 21]),
    ]
    t11 = [
        R(code="T11-R01", file="T11-R01-bridge-is-not-a-cutover.html", track="T11", color=c11, mins=9,
          title="A bridge is not a cutover",
          blurb="Why Unified CM can stay, and what Webex Calling means in the migration guide.",
          hops=["Stay", "Bridge", "Move", "Check"],
          lede="T11-R01. Fundamentals. The Unified CM migration guide is about Webex Calling multi-tenant. It also lists reasons to keep call control on premises. A bridge is one of those designs, not a finished move. " + cite(14),
          takes=[
              "In nbedetf, Webex Calling always means Webex Calling multi-tenant. " + cite(14),
              "Local Gateway is a bridge between the on-premises network and Webex Calling, for PSTN and for calling between Unified CM and cloud endpoints. " + cite(14),
              "The guide lists reasons a customer may keep call control on premises, including unsupported phones, a complex dial plan, and a contact center that is not moving yet. " + cite(14),
              "PPDIO is Prepare, Plan, Design, Implement, and Optimize. " + cite(14),
              "T6 is the migration track. This chapter is the bridge view.",
          ],
          map_title="Two honest outcomes",
          map="Move the calling workload, or keep Unified CM and connect it. The article says the choice follows functionality, and it names customers who should consider staying. " + cite(14),
          core="<p>nbedetf is for teams who already administer Unified CM and Cisco endpoints. It explains components, PSTN options, supported endpoints, and security, using PPDIO. " + cite(14) + "</p><p>Before, the on-premises picture is Unified CM, Expressway-C/E for mobile and remote access and business-to-business, optional meetings and Unity Connection, and Cisco phones and Jabber. " + cite(14) + "</p><p>Reasons to consider staying include unsupported phone models, complex integrations, a complex dial plan or granular classes of service, poor internet, strict data-ownership rules, on-premises recording requirements, third-party integrations without a Webex alternative, and contact-center integrations where the contact center is not moving yet. " + cite(14) + "</p><p>After, the new pieces include Webex Calling, Directory Connector or the Entra ID Wizard, Local Gateway, Survivability Gateway, Cisco Calling Plan or Cloud Connect PSTN, and Webex App. " + cite(14) + "</p>",
          terms=[
              ("Webex Calling, in nbedetf", "Multi-tenant only. The guide says the term always means that. " + cite(14)),
              ("Local Gateway", "A bridge for PSTN and for calls between Unified CM registered and cloud registered endpoints. " + cite(14)),
              ("PPDIO", "Prepare, Plan, Design, Implement, Optimize. " + cite(14)),
              ("Stay case", "A listed reason to keep on-premises call control, including a contact center that is not moving. " + cite(14)),
          ],
          sisters=[
              ["Dedicated Instance", "A different calling home. T5 and T11-R03.", "nbedetf is not the Dedicated Instance guide.", cite(14)],
              ["T6 cutover", "The migration rooms.", "A bridge can be a phase, which the Local Gateway sentence allows.", cite(14)],
              ["Survivability Gateway", "Fallback for on-site Webex Calling endpoints during a network outage.", "Not the same box as Local Gateway.", cite(14)],
          ],
          edges=[
              ["Unified CM", "Webex Calling", "Local Gateway, including a phased migration.", cite(14)],
              ["Contact center still on premises", "Decision to stay", "Named in the stay list.", cite(14)],
              ["Active Directory", "Webex", "Directory Connector, or Entra ID Wizard if identity already moved.", cite(14)],
          ],
          flow=[
              "Say whether the guide’s Webex Calling is the product you mean. It is multi-tenant.",
              "Check the stay list before you promise a full move.",
              "If the contact center stays, draw a bridge and open T11-R03.",
              "Name Local Gateway and Survivability Gateway as different boxes.",
          ],
          config="<ul><li>The guide points to Webex migration tools in Control Hub, certified migration providers, and Webex Setup Assist. It does not make those three the same thing. " + cite(14) + "</li></ul>",
          limits=[
              ["Scope", "Unified CM to Webex Calling multi-tenant only.", cite(14)],
              ["Local Gateway role", "PSTN and on-premises to cloud calling integration.", cite(14)],
              ["Phones through the gateway", "The article describes endpoint registration on Webex Calling, and Local Gateway as the bridge. It does not say phones register through the gateway.", cite(14)],
          ],
          trouble=[
              ["Dedicated Instance is designed from nbedetf alone", "That guide defines Webex Calling as multi-tenant.", "Use the Dedicated Instance article for DI.", cite(14)],
              ["The contact center is still on UCCE and the plan deletes Unified CM first", "A contact center that is not moving is a listed reason to reconsider.", "Keep call control until the contact-center design says otherwise.", cite(14)],
          ],
          ladder=[
              ("What does Webex Calling mean inside nbedetf?", "Webex Calling multi-tenant. " + cite(14)),
              ("What is Local Gateway in that guide?", "A bridge for PSTN and between Unified CM and cloud endpoints. " + cite(14)),
              ("Name two reasons the guide says you might stay.", "Unsupported phones, a complex dial plan, poor internet, or a contact center that is not moving. Any two. " + cite(14)),
          ],
          lab=[
              "Write stay or move next to each reason in the stay list for a fictional site. Do not invent a customer.",
              "Label Local Gateway and Survivability Gateway on two boxes.",
          ],
          quiz=[
              ("Is nbedetf a Dedicated Instance guide?", "No. It says Webex Calling in the document always means multi-tenant. " + cite(14)),
              ("What does PPDIO stand for?", "Prepare, Plan, Design, Implement, Optimize. " + cite(14)),
              ("Which new box is the outage fallback for Webex Calling phones on site?", "Survivability Gateway. " + cite(14)),
          ],
          sec30="The migration guide moves Unified CM to multi-tenant Webex Calling, and it also tells some customers to keep call control. Local Gateway is the bridge. " + cite(14),
          sec120="I check unsupported phones, dial plan, internet, recording, and whether the contact center is moving. Directory Connector and the Entra wizard are identity, not the trunk. Survivability Gateway is the outage box. " + cite(14),
          open=["Preferred Architecture PDFs named by the guide were not opened in this pass."],
          cites=[14]),
        R(code="T11-R02", file="T11-R02-local-gateway-bridge.html", track="T11", color=c11, mins=10,
          title="Local Gateway as the calling bridge",
          blurb="Platforms that can be a Local Gateway, and what the admin guide is for.",
          hops=["Unified CM", "LGW", "Cloud", "PSTN"],
          lede="T11-R02. nbedetf names the platforms that can be a Local Gateway. t9xctu is the administrator article for trunking models and third-party session border controllers. " + cite(14) + " " + cite(19),
          takes=[
              "Local Gateway can be on premises or partner hosted. " + cite(14),
              "Named Cisco platforms: ISR 1100 and 4000, Catalyst 8200 and 8300, and Catalyst 8000V, plus certified third-party SBCs. " + cite(14),
              "It is for a phased migration as well as PSTN. " + cite(14),
              "t9xctu, header September 10, 2026, covers trunking models, supported SBCs, capacity, connectivity, configuration, TLS troubleshooting, and third-party Local Gateway. " + cite(19),
              "This room does not invent a dial-peer. T7 is the SIP track.",
          ],
          map_title="One bridge, two jobs",
          map="Job one is PSTN for cloud-registered endpoints. Job two is calling between Unified CM endpoints and cloud endpoints. " + cite(14),
          core="<p>The after table calls Local Gateway the bridge between the customer’s on-premises unified communications network and Webex Calling. Cisco IOS-XE routers and certified third-party SBCs can be that gateway for a phased approach. " + cite(14) + "</p><p>PSTN can instead be Cisco Calling Plan or Cloud Connect, with no on-premises equipment. That is a different choice from Local Gateway. " + cite(14) + "</p><p>The Local Gateway getting-started page was opened. Its contents include trunking models and support for a third-party Local Gateway. This room does not copy command lines from it. " + cite(19) + "</p>",
          terms=[
              ("Phased migration", "The reason the guide allows an on-premises Local Gateway while both systems exist. " + cite(14)),
              ("Certified third-party SBC", "Allowed as a Local Gateway, beside the named Cisco routers. " + cite(14)),
              ("Cloud PSTN", "Cisco Calling Plan or Cloud Connect, no on-premises gear. " + cite(14)),
              ("Trunking model", "A section on the Local Gateway getting-started page. Details stay in that article. " + cite(19)),
          ],
          sisters=[
              ["T7 SIP", "Trunk design and traces.", "This room names the bridge. It does not replace a trace lab.", cite(19)],
              ["T2 calling", "The three PSTN choices.", "Local Gateway is the premises choice in that track.", cite(14)],
              ["SIP Universe lab", "Sibling lab for SIP itself, opened 2026-10.", "Not a Webex dial plan.", cite(21)],
          ],
          edges=[
              ["Unified CM", "Local Gateway", "Integration path in the migration guide.", cite(14)],
              ["Local Gateway", "Webex Calling", "Registration of endpoints is on the Webex Calling service, not described as proxied registration.", cite(14)],
              ["Partner", "Hosted Local Gateway", "Allowed.", cite(14)],
          ],
          flow=[
              "Choose premises PSTN or a cloud PSTN option. They are different rows.",
              "If premises, pick a named Cisco platform or a certified third-party SBC.",
              "Read t9xctu before you configure.",
              "Keep T7 open for the SIP details this room does not copy.",
          ],
          config="<ul><li>Platform list from nbedetf: ISR 1100 and 4000 series, Catalyst 8200/8300, Catalyst 8000V, certified third-party SBCs. " + cite(14) + "</li><li>Configuration steps live in t9xctu. " + cite(19) + "</li></ul>",
          limits=[
              ["Cloud PSTN gear", "None on premises, for Calling Plan or Cloud Connect.", cite(14)],
              ["Command lines", "Not copied in this room.", cite(19)],
              ["Third-party SBC", "Must be a certified Local Gateway. The guide says certified. It does not paste a vendor matrix here.", cite(14)],
          ],
          trouble=[
              ["Phones are pointed at the Local Gateway as their registrar", "The guide gives registration to the Webex Calling service and uses Local Gateway as the bridge.", "Re-read the after table before you change the phone’s call-control home.", cite(14)],
              ["An uncertified firewall is called a Local Gateway", "The article says certified third-party SBCs.", "Do not assume every SBC qualifies.", cite(14)],
          ],
          ladder=[
              ("Name two Cisco platforms that can be a Local Gateway.", "ISR 1100 or 4000, Catalyst 8200 or 8300, or Catalyst 8000V. " + cite(14)),
              ("What article is the admin starting point?", "t9xctu, header September 10, 2026. " + cite(19)),
              ("What is the no-premises PSTN alternative?", "Cisco Calling Plan or Cloud Connect. " + cite(14)),
          ],
          lab=[
              "Draw Unified CM, Local Gateway, and Webex Calling. Put PSTN on the gateway only if you chose premises PSTN.",
              "Write “certified” next to any third-party box.",
          ],
          quiz=[
              ("Can a partner host the Local Gateway?", "Yes. The guide says on premises or hosted by a partner. " + cite(14)),
              ("Is Survivability Gateway the same row?", "No. It is a separate product in the after table. " + cite(14)),
              ("Does this room include dial-peer syntax?", "No. t9xctu and T7 hold the configuration depth. " + cite(19)),
          ],
          sec30="Local Gateway bridges PSTN and Unified CM to multi-tenant Webex Calling. Named Cisco routers and certified third-party SBCs can be that box. " + cite(14),
          sec120="Cloud PSTN skips the box. A phased move keeps it. I configure from t9xctu, and I do not paste dial-peers I did not read. The SIP sibling lab is for the protocol, not for this product choice. " + cite(19) + " " + cite(21),
          open=["The certified-SBC matrix inside t9xctu was not copied. Open it before you name a vendor."],
          cites=[14, 19, 21]),
        R(code="T11-R03", file="T11-R03-di-contact-center.html", track="T11", color=c11, mins=12,
          title="Dedicated Instance and contact-center bridges",
          blurb="UCCX latency, CCE SIP trunks, and the WxCC codec list.",
          hops=["UCCX", "CCE", "Trunk", "WxCC"],
          lede="T11-R03. Article nmhk7ve is the Dedicated Instance contact-center article. It is not a cutover guide. It is a set of deployment models. " + cite(15),
          takes=[
              "Supported solutions named: UCCX, UCCE, PCCE, Webex CCE, and Webex Contact Center. HCS Contact Center is out of scope. " + cite(15),
              "UCCX to the Unified CM it uses for call control needs round-trip time under 60 milliseconds. " + cite(15),
              "On-premises CCE and Webex CCE connect to Dedicated Instance with a SIP trunk. Webex CCE and DI are separate systems, and the trunk traverses the customer network. " + cite(15),
              "WxCC with Dedicated Instance must use certificate-based trunks. Registration-based trunks are no longer supported. " + cite(15),
              "For WxCC, put G.711 U-Law, then G.711 A-Law, then OPUS at the top of the codec list. " + cite(15),
          ],
          map_title="Agents and knowledge workers can be on different clusters",
          map="Several models put agents on one Unified CM and back-office phones on another, with a SIP trunk between them. Group features such as call park stay inside one cluster. " + cite(15),
          core="<p>UCCX on premises with Unified CM on premises, plus DI for back office: the inter-cluster SIP trunk connects the two Unified CM clusters. A variation puts phones on DI and treats agents as Home Agents through Extend and Connect. Silent monitoring is not available to those Home Agents. The article says silent monitoring is supported in UCCX Premium and Enhanced, not in the Unified IP IVR package. " + cite(15) + "</p><p>UCCX on premises with call control only in DI is supported when RTT is under 60 ms. The article says that is unlikely for many customers in AMER because of observed latency. UCCX in DI IaaS co-locates the applications and meets the latency need. " + cite(15) + "</p><p>WxCC option 1 puts the agent phone on multi-tenant Webex Calling and the back office on Dedicated Instance, using the default inter-op SIP trunk. Option 2 puts the agent phone on Dedicated Instance. PSTN can be a DI Local Gateway or Cloud Connected PSTN. Inbound numbers route to WxCC and back to the agent. " + cite(15) + "</p><p>Codec work is only for the WxCC integration: copy Factory Default Lossy, move G.711 U-Law, G.711 A-Law, and OPUS to the top, and assign that list between the CTI device pool, the endpoint region, and the SIP trunk region. " + cite(15) + "</p>",
          terms=[
              ("60 ms RTT", "The UCCX to Unified CM JTAPI limit printed on nmhk7ve. " + cite(15)),
              ("Home Agent variation", "DI phones, on-premises UCCX, Extend and Connect. No silent monitoring. " + cite(15)),
              ("Certificate trunk", "Required for Dedicated Instance to Webex Calling Contact Center. Registration-based trunks are no longer supported. " + cite(15)),
              ("Inter-op SIP trunk", "The default trunk the article says Cisco creates between the calling platforms. " + cite(15)),
              ("HCS Contact Center", "Named as not covered. " + cite(15)),
          ],
          sisters=[
              ["T5 Dedicated Instance", "What DI is.", "This room is only the contact-center attachment.", cite(15)],
              ["T4 Enterprise", "CCE components.", "nmhk7ve points at the CCE design guide rather than restating it.", cite(15)],
              ["Multi-tenant calling", "Agent phones in WxCC option 1.", "Back office can remain on DI.", cite(15)],
          ],
          edges=[
              ["On-premises UCCX", "DI Unified CM", "JTAPI, under 60 ms, or do not use that model.", cite(15)],
              ["Webex CCE", "DI", "SIP trunk across the customer network. Partner coordinates the two services.", cite(15)],
              ["DI agent", "WxCC", "Certificate trunk, then the codec list.", cite(15)],
          ],
          flow=[
              "Pick the product: UCCX, CCE, Webex CCE, or WxCC.",
              "Place call control and measure the constraint the table prints.",
              "For WxCC, stop if the trunk is still registration-based.",
              "Change the codec list only for the WxCC case, in the order the article prints.",
          ],
          config="<ul><li>System, Region Information, Audio Codec Preference Lists. Copy Factory Default Lossy. " + cite(15) + "</li><li>Order: G.711 U-Law, G.711 A-Law, OPUS. " + cite(15) + "</li><li>Assign across CTI device pool, endpoint region, and SIP trunk region. " + cite(15) + "</li></ul>",
          limits=[
              ["UCCX RTT", "Less than 60 ms to the Unified CM it uses.", cite(15)],
              ["AMER on-premises UCCX to DI", "The article says the RTT constraint cannot be met for most customers, from observed latency.", cite(15)],
              ["Silent monitoring", "Not available in the Home Agent variation.", cite(15)],
              ["WxCC trunk", "Certificate-based. Registration-based no longer supported.", cite(15)],
              ["Codec order", "G.711 U-Law, G.711 A-Law, OPUS. Only for WxCC.", cite(15)],
              ["HCS", "Not covered.", cite(15)],
          ],
          trouble=[
              ["UCCX features misbehave with DI call control", "JTAPI is sensitive to latency. The limit is under 60 ms.", "Measure RTT before you open a desktop defect.", cite(15)],
              ["WxCC audio fails from DI agents", "The default inter-op trunk region needs the WxCC codec order.", "Copy Factory Default Lossy and reorder. Do not do this for unrelated trunks.", cite(15)],
              ["Hunt group between an agent phone and a knowledge worker", "Group features work inside one cluster. Only inter-cluster features cross.", "Do not promise park or hunt across the trunk.", cite(15)],
          ],
          ladder=[
              ("What is the UCCX RTT number?", "Less than 60 milliseconds. " + cite(15)),
              ("Which trunks does WxCC with DI require?", "Certificate-based. Registration-based are no longer supported. " + cite(15)),
              ("Codec order for WxCC?", "G.711 U-Law, then G.711 A-Law, then OPUS. " + cite(15)),
          ],
          lab=[
              "Pick one table row from nmhk7ve and write its constraint in the margin.",
              "Draw two clusters and mark which features die at the trunk.",
          ],
          quiz=[
              ("Is HCS Contact Center in this article?", "No. The article says it is not covered. " + cite(15)),
              ("Silent monitoring for the Home Agent variation?", "Not available. " + cite(15)),
              ("Who coordinates Webex CCE and Dedicated Instance?", "The partner, the article says. " + cite(15)),
          ],
          sec30="Dedicated Instance meets contact center through the models in nmhk7ve. UCCX needs under 60 ms. WxCC needs a certificate trunk and a specific codec order. " + cite(15),
          sec120="Agents and knowledge workers can sit on different Unified CM clusters. Park and hunt do not cross. The Home Agent trick drops silent monitoring. I do not use the WxCC codec change on every trunk. " + cite(15),
          open=["The inter-op activation article and the voice-channel article are named, not opened, in this pass."],
          cites=[15]),
        R(code="T11-R04", file="T11-R04-uccx-to-wxcc.html", track="T11", color=c11, mins=11,
          title="UCCX discovery into Webex Contact Center",
          blurb="The jar, the spreadsheet, the 5000-row cap, and what the tool does not claim.",
          hops=["CCX", "Jar", "Sheet", "Bulk"],
          lede="T11-R04. The public migration guide is UCCX to Webex Contact Center, using a discovery tool and bulk operations. It is a manual migration. The tool may not support every new feature. " + cite(16),
          takes=[
              "Prepare a WxCC tenant, Control Hub users, and contact-center synchronized users before the tool. " + cite(16),
              "The prose says download discovery tool v3.5. The printed jar command uses uccx-to-webexcc-v3.4.jar. Both strings are on the page. " + cite(16),
              "Java 8 or above, access to the CCX server, and the CCX administrator credentials are required. " + cite(16),
              "A bulk import CSV is limited to 5000 rows. " + cite(16),
              "The article prints a recommended CSV import order, starting with MultimediaProfiles.csv and ending with Users.csv. " + cite(16),
          ],
          map_title="Extract, edit, zip, import",
          map="The tool writes a spreadsheet and a prompts zip. You edit the sheets to match the Webex Contact Center design, then import with bulk operations. " + cite(16),
          core="<p>Run java -jar uccx-to-webexcc-v3.4.jar -extract. If you omit the port, the console uses 443. The tool writes application-pro.yml, then WebexCC_Bulk_Upload.xlsx and WebexCC_Bulk_Upload_Prompts.zip. A second command with -zip builds WebexCC_Bulk_Upload.zip. " + cite(16) + "</p><p>The page says the tool is evolving and may not support all the latest features. Macintosh file names are case-sensitive. " + cite(16) + "</p><p>Queue routing types for telephony are longest available agent or skill based. Skill types are text, boolean, enum, or proficiency. User profile types include administrator, supervisor, administrator only, premium agent, and standard agent. The sheet sample for administrator is printed with a missing R in one cell. The accepted-values line spells ADMINISTRATOR. Trust the accepted-values line when they differ, and re-read the live page. " + cite(16) + "</p><p>This is not the CCE tenant-to-tenant tool. That tool, n2puc5z, moves Webex Contact Center Enterprise Administration Portal data between tenants. " + cite(17) + "</p>",
          terms=[
              ("Discovery tool", "The UCCX extraction jar described on 0hd75db. " + cite(16)),
              ("5000 rows", "The bulk-operations limit for one import CSV. Split the file if it is larger. " + cite(16)),
              ("Skip prompts", "application-pro.yml can set skipPrompts. The default extracts prompts. " + cite(16)),
              ("Tenant data tool", "n2puc5z. Enterprise admin-portal data between tenants. Not the UCCX jar. " + cite(17)),
          ],
          sisters=[
              ["T6-R04", "The existing migration room.", "This chapter repeats only what was re-opened.", cite(16)],
              ["n2puc5z", "A different tool and a different product.", "Do not point the UCCX jar at a CCE tenant move.", cite(17)],
              ["Bulk operations", "Control Hub import, then check the tenant.", "Sign-in host printed: admin.webex.com.", cite(16)],
          ],
          edges=[
              ["CCX server", "Jar", "Java 8, admin credentials, port 443 if omitted.", cite(16)],
              ["Spreadsheet", "Bulk CSV", "Recommended order is printed on the page.", cite(16)],
              ["Prompts zip", "Bulk audio import", "Separate from the CSV order.", cite(16)],
          ],
          flow=[
              "Create the WxCC tenant and the users first.",
              "Extract. Edit every sheet against the device-discovery table.",
              "Zip. Split any CSV over 5000 rows.",
              "Import in the printed order. Check the objects in Control Hub.",
          ],
          config="<ul><li>Command printed for extract: java -jar uccx-to-webexcc-v3.4.jar -extract. " + cite(16) + "</li><li>Command printed for zip: java -jar uccx-to-webexcc-v3.4.jar -zip. " + cite(16) + "</li><li>Import order begins MultimediaProfiles.csv, Site.csv, UserProfiles.csv, and ends Users.csv. The full list is on the article. " + cite(16) + "</li></ul>",
          limits=[
              ["CSV size", "5000 rows.", cite(16)],
              ["Default port", "443.", cite(16)],
              ["Feature coverage", "The tool may not support every latest feature.", cite(16)],
              ["Jar name versus download prose", "v3.5 in the download sentence, v3.4 in the jar command.", cite(16)],
              ["Outdial queue routing", "Only longest available agent.", cite(16)],
          ],
          trouble=[
              ["Import fails on dependencies", "The article says to follow the recommended CSV order to prevent dependency errors.", "Re-import in that order.", cite(16)],
              ["The sheet and the jar version disagree", "The page prints both v3.5 and v3.4.", "Use the file you downloaded and re-read the live command.", cite(16)],
              ["Someone uses this jar for UCCE", "The title is Unified CCX.", "Stop. UCCE is not this procedure.", cite(16)],
          ],
          ladder=[
              ("What must you set up before the tool?", "The WxCC tenant, Control Hub users, and synchronized contact-center users. " + cite(16)),
              ("What is the CSV row cap?", "5000. " + cite(16)),
              ("What does n2puc5z move?", "Webex CCE Administration Portal data between tenants. " + cite(17)),
          ],
          lab=[
              "Write the extract command from memory and compare it to the page, including the jar version.",
              "Circle Users.csv as last in the recommended order.",
          ],
          quiz=[
              ("Default port if you omit it?", "443. " + cite(16)),
              ("Java requirement?", "Java 8 or above. " + cite(16)),
              ("Is this a UCCE-to-WxCC converter?", "No. The article is Unified CCX. " + cite(16)),
          ],
          sec30="UCCX moves toward Webex Contact Center with a discovery jar and bulk CSV files, 5000 rows at a time. The page itself prints two version strings. " + cite(16),
          sec120="I edit the sheets before import, I keep the printed order, and I do not confuse this with the CCE tenant-to-tenant tool. The tool may lag the product. I say that out loud. " + cite(16) + " " + cite(17),
          open=["Sample host passwords are on the article as placeholders. This room does not repeat a live secret."],
          cites=[16, 17]),
        R(code="T11-R05", file="T11-R05-other-platforms.html", track="T11", color=c11, mins=10,
          title="Other platforms, without a fake bridge",
          blurb="Where Cisco’s opened pages stop, and which sibling labs opened.",
          hops=["Cisco", "Gap", "Sibling", "Confirm"],
          lede="T11-R05. Advanced. The opened Cisco pages document Unified CM, Local Gateway, Dedicated Instance, UCCX, and a CCE admin-portal tenant move. They do not document a Webex button that imports Amazon Connect, Genesys, Five9, or NiCE. Those studies live in sibling labs that opened. " + cite(14) + " " + cite(16) + " " + cite(21),
          takes=[
              "nbedetf’s documented calling move is Unified CM to multi-tenant Webex Calling. " + cite(14),
              "0hd75db’s documented contact-center move in this pass is UCCX to Webex Contact Center. " + cite(16),
              "n2puc5z moves Webex CCE admin data between tenants. It is not a foreign-platform importer. " + cite(17),
              "Eight sibling labs returned a page in October 2026. Each one describes its own classroom. " + cite(21),
              "A parity matrix was not on the Cisco pages opened for this chapter.",
          ],
          map_title="Study the other product in its lab",
          map="Use this lab for the Cisco bridge that was published. Use the sibling lab for the other product’s own objects. Do not draw a connector that neither site printed. " + cite(21),
          core="<p>The UC Lab that opened is a free study lab for SIP, CUCM, CUBE, SRST, Expressway, voice QoS, UCCE, and a careful move toward Webex Calling. " + cite(21) + "</p><p>The Amazon Connect lab that opened teaches flows, queues, routing profiles, and bridges from Cisco UCCE, Genesys, and Webex as study notes. It is not a Cisco import tool. " + cite(21) + "</p><p>The Microsoft Voice lab that opened names Teams Phone, Operator Connect, Direct Routing, and Dynamics 365 Contact Center. " + cite(21) + "</p><p>The Five9 lab that opened says it is a student’s open lab and that citations stay on the page. " + cite(21) + "</p><p>The Genesys Cloud lab that opened names Architect, bullseye routing, and BYOC, and it says the lab does not sign in to an organization. " + cite(21) + "</p><p>The NICE CXone page that opened says Contact Path is free study material and is not affiliated with NiCE. " + cite(21) + "</p><p>The SIP Universe lab that opened is SIP study, from the first INVITE through media. " + cite(21) + "</p><p>The AI lab that opened is general agent study, not a Webex admin guide. " + cite(21) + "</p>",
          terms=[
              ("Documented calling bridge", "Unified CM to Webex Calling multi-tenant, with Local Gateway. " + cite(14)),
              ("Documented CCX bridge", "Discovery tool and bulk operations into Webex Contact Center. " + cite(16)),
              ("Not a bridge", "n2puc5z, tenant to tenant inside Webex CCE admin data. " + cite(17)),
              ("Sibling lab", "A cyphermonkeylabs.com classroom that returned HTTP 200 in this pass. " + cite(21)),
          ],
          sisters=[
              ["UC Lab", "CUCM, CUBE, UCCE, and a careful Webex Calling move.", "Use it beside T11-R01.", cite(21)],
              ["Amazon Connect lab", "Its own flows and queues.", "Not a WxCC import.", cite(21)],
              ["Genesys lab", "Architect and BYOC as that lab teaches them.", "Not a Local Gateway cert.", cite(21)],
              ["Microsoft Voice lab", "Teams Phone and Direct Routing.", "Not nbedetf.", cite(21)],
          ],
          edges=[
              ["This lab", "UC Lab", "Both discuss CUCM and Webex. The UC lab is the broader UC classroom.", cite(21)],
              ["This lab", "SIP Universe", "Protocol study when T7 is not enough.", cite(21)],
              ["Unopened vendor bridge", "Confirm", "No URL, no drawing.", cite(14)],
          ],
          flow=[
              "Ask which Cisco article names the source platform.",
              "If none of the opened articles do, stop the Cisco diagram.",
              "Open the sibling lab for that product’s own vocabulary.",
              "Keep trademarks on their owners. These labs are not those vendors.",
          ],
          config="<ul><li>There is no Control Hub import for the other platforms in the pages this chapter opened. " + cite(14) + " " + cite(16) + "</li></ul>",
          limits=[
              ["Unified CM guide scope", "Multi-tenant Webex Calling.", cite(14)],
              ["CCX guide scope", "Unified CCX to Webex Contact Center.", cite(16)],
              ["Other CCaaS importers", "Not in the opened Cisco pages.", cite(21)],
              ["Sibling labs", "Study sites. They do not change a tenant.", cite(21)],
          ],
          trouble=[
              ["A worksheet says “migrate Genesys with the UCCX jar”", "The jar article is Unified CCX.", "Stop. Use the Genesys lab for Genesys objects, and do not invent a Cisco importer.", cite(16) + " " + cite(21)],
              ["Teams Direct Routing is drawn as a Local Gateway", "Local Gateway is the Webex Calling bridge in nbedetf. Direct Routing is named on the Microsoft Voice lab, not in that Cisco guide.", "Keep the products apart.", cite(14) + " " + cite(21)],
          ],
          ladder=[
              ("Which opened Cisco article moves UCCX?", "0hd75db. " + cite(16)),
              ("What does the Amazon Connect sibling say it is?", "A study lab for Amazon Connect, including bridges as study notes. It is not a Cisco product. " + cite(21)),
              ("What should you do with a platform Cisco’s opened pages do not mention?", "Leave it off the Cisco diagram. Confirm, with no URL, until a page is opened. " + cite(14)),
          ],
          lab=[
              "List the eight sibling labs you can actually open from the sources block.",
              "Write one sentence this chapter refuses.",
          ],
          quiz=[
              ("Is n2puc5z an Amazon Connect migration?", "No. It moves Webex CCE Administration Portal data between tenants. " + cite(17)),
              ("Did the Genesys lab page open?", "Yes, in October 2026. It says the lab does not sign in to an organization. " + cite(21)),
              ("Where do CUCM dial-plan rooms live if you want more than this bridge?", "The UC Lab sibling, plus this Canon’s T5 and T6. " + cite(21)),
          ],
          sec30="Cisco’s opened bridge pages are Unified CM, Local Gateway, Dedicated Instance contact center, and UCCX. Other platforms stay in the sibling labs, without a fake importer. " + cite(14) + " " + cite(16) + " " + cite(21),
          sec120="I can name what each sibling lab said about itself because those pages opened. I cannot name a Webex SKU that swallows Five9 or NiCE. The confirm rows are the pages I did not open. " + cite(21),
          open=["A future hook is a Cisco page that actually names one of those platforms. Until it is opened, the hook has no URL."],
          cites=[14, 16, 17, 21]),
    ]
    return link_rooms(t9), link_rooms(t10), link_rooms(t11)


def mindmap(track, title, color, rooms):
    blocks = []
    for i, room in enumerate(rooms):
        col = 0 if i < 3 else 1
        row = i if i < 3 else i - 3
        x = 28 if col == 0 else 620
        y = 88 + row * 140
        blocks.append(
            f'<rect x="{x}" y="{y}" width="312" height="72" rx="12" fill="#14110c" stroke="{color}"/>'
            f'<text x="{x+14}" y="{y+28}" fill="{color}" font-family="Segoe UI, sans-serif" font-size="14">{room["code"]}</text>'
            f'<text x="{x+14}" y="{y+50}" fill="#efe7d6" font-family="Segoe UI, sans-serif" font-size="12">{room["title"][:42]}</text>'
        )
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" role="img" aria-label="{track} mind map">
<rect width="960" height="560" fill="#0c121c"/>
<text x="28" y="36" fill="{color}" font-family="Georgia, serif" font-size="22">{track} · {title}</text>
<text x="28" y="58" fill="#8d8476" font-family="Segoe UI, sans-serif" font-size="13">Study map. Facts stay in the rooms.</text>
{''.join(blocks)}
</svg>
'''


def track_page(track, num, emoji, name, lede, note, color, rooms):
    rows = []
    for room in rooms:
        rows.append(
            f'<tr data-title="{room["title"]}" data-code="{room["code"]}"><td class="room-code">{room["code"]}</td>'
            f'<td><a href="../../rooms/{room["file"]}">{room["title"]}</a><div class="room-blurb">{room["blurb"]}</div></td>'
            f'<td><span class="badge written">written</span></td></tr>'
        )
    n = len(rooms)
    body = f"""{head('../../', f"{track} · {name}", f"{track} · {name}")}
<body data-track="{track}" class="v4">
<a class="skip" href="#main">Skip to content</a>
<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">
{header('../../', track)}
<main id="main" class="wrap">
<section class="track-spark" aria-label="Track counters"><div class="spark-row"><span class="cube-scene" aria-hidden="true"><span class="cube-3d"><i></i><i></i><i></i><i></i><i></i><i></i></span></span><svg class="spark-icon" data-depth="0.45" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" fill="#22d3ee"/><path d="M24 6v8M24 34v8M6 24h8M34 24h8" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/></svg><p><b data-count="{n}">{n}</b> <span>rooms on this track</span> · <b data-count="78">78</b> <span>Canon rooms</span></p></div></section>
<p class="crumbs"><a href="../../index.html">Home</a> / {track}</p>
<section class="track-hero">
<div class="track-banner">
<div class="num-badge">{num}</div>
<p class="kicker">{emoji} {track}</p>
<h1>{name}</h1>
<p class="lede">{lede}</p>
<p>{note}</p>
</div>
<figure class="mindmap-figure">
<img class="mindmap" width="960" height="560" src="../../assets/diagrams/{track}/mindmap.svg" alt="{track} mind map">
</figure>
</section>
<div class="search-row">
<input data-canon-search type="search" placeholder="Filter titles in {track}" autocomplete="off" aria-label="Filter room titles">
<div class="search-meta" data-search-count>{n} rooms</div>
</div>
<p class="empty-search" data-empty-search>No title in this track matches.</p>
<table class="room-table">
<thead><tr><th>Code</th><th>Room</th><th>Status</th></tr></thead>
<tbody>
{''.join(rows)}
</tbody>
</table>
{sources_html('sources.json')}
<p><a href="chapter.md">Chapter notes (Markdown)</a></p>
<p><a href="../../downloads/chapters/{track.lower()}.html">Chapter download</a></p>
</main>
{FOOTER}
<aside class="v4-toc" id="v4-toc" aria-label="On this page"></aside></div></div>
{SCRIPTS_TRACK}</body></html>
"""
    return body


def chapter_download(track, name, lede, rooms):
    lis = "".join(
        f"<li><a href=\"../../rooms/{room['file']}\">{room['code']} · {room['title']}</a> — {room['blurb']}</li>"
        for room in rooms
    )
    return f"""{head('../../', f"{name} download", name)}
<body class="v4">
<a class="skip" href="#main">Skip to content</a>
<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">
{header('../../', '78 rooms')}
<main id="main" class="wrap">
<p class="crumbs"><a href="../../downloads.html">Downloads</a> / {track}</p>
<h1>{name}</h1>
<p class="lede">{lede}</p>
<ol>{lis}</ol>
<p>This download is a reading list. It does not change a tenant.</p>
{sources_html('')}
</main>
{FOOTER}
</div></div>
{SCRIPTS_TRACK}</body></html>
"""


def write_rooms(rooms):
    for room in rooms:
        path = ROOT / "rooms" / room["file"]
        path.write_text(room_page(room), encoding="utf-8")
        src = ROOT / "rooms" / "sources" / room["code"]
        src.mkdir(parents=True, exist_ok=True)
        (src / "sources.json").write_text(json.dumps(sources_json(room["code"], room["title"]), indent=2) + "\n", encoding="utf-8")
        cite_lines = [f"# {room['code']} {room['title']}", "", "Opened 2026-10.", ""]
        for n in room["cites"]:
            cite_lines.append(f"{n}. {CITE[n]}")
        cite_lines.append("")
        cite_lines.append(sources_md())
        (ROOT / "cites" / f"{room['code']}.md").write_text("\n".join(cite_lines), encoding="utf-8")


def patch_index(tracks):
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    tiles = []
    cards = []
    icons = {
        "T9": '<svg viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="16" fill="#064e3b"/><rect x="16" y="18" width="40" height="28" rx="4" fill="#ecfdf5"/><path d="M22 34h20M22 40h12" stroke="#059669" stroke-width="3"/><circle cx="50" cy="48" r="8" fill="#34d399"/></svg>',
        "T10": '<svg viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="16" fill="#2e1065"/><circle cx="36" cy="30" r="12" fill="#ddd6fe"/><path d="M24 50c3-8 21-8 24 0" fill="#c4b5fd"/><circle cx="52" cy="20" r="5" fill="#a78bfa"/></svg>',
        "T11": '<svg viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="16" fill="#082f49"/><rect x="12" y="30" width="18" height="16" rx="3" fill="#e0f2fe"/><rect x="42" y="30" width="18" height="16" rx="3" fill="#7dd3fc"/><path d="M30 38h12" stroke="#fff" stroke-width="3"/></svg>',
    }
    for meta in tracks:
        tiles.append(
            f'<a class="track-tile tilt" href="tracks/{meta["id"]}/index.html" style="--card:{meta["color"]}">'
            f'<span class="tile-art" aria-hidden="true">{icons[meta["id"]]}</span>'
            f'<span class="tile-num">{meta["num"]}</span>'
            f'<svg class="tile-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" class="ring-track"/><circle cx="18" cy="18" r="15" class="ring-value" data-tile-ring="{meta["id"]}"/></svg>'
            f'<h3>{meta["emoji"]} {meta["short"]}</h3>'
            f'<p>{meta["one"]}</p></a>'
        )
        rows = "".join(
            f'<li class="room-row" data-title="{room["title"]}" data-code="{room["code"]}"><span class="room-code">{room["code"]}</span>'
            f'<a class="room-title" href="rooms/{room["file"]}">{room["title"]}</a><span class="badge written">written</span></li>'
            for room in meta["rooms"]
        )
        cards.append(
            f'<article class="track-card" style="--card:{meta["color"]}"><header><div><p class="track-code">{meta["emoji"]} {meta["id"]}</p>'
            f'<h2><a href="tracks/{meta["id"]}/index.html">{meta["name"]}</a></h2></div></header>'
            f'<p class="purpose">{meta["purpose"]}</p><ol class="room-list">{rows}</ol></article>'
        )
    needle = "<h3>✨ Flows, Integrations &amp; Latest</h3>\n<p>8 rooms</p>\n</a></div>"
    if needle not in text:
        raise SystemExit("tile anchor missing")
    text = text.replace(needle, "<h3>✨ Flows, Integrations &amp; Latest</h3>\n<p>8 rooms</p>\n</a>" + "".join(tiles) + "</div>", 1)
    card_needle = "Latest Features Radar</a><span class=\"badge written\">written</span></li></ol>\n</article>\n</div>"
    if card_needle not in text:
        raise SystemExit("card anchor missing")
    text = text.replace(card_needle, card_needle.replace("</div>", "".join(cards) + "</div>"), 1)
    tonight = "<ul><li>A persistent track sidebar"
    insert = "<ul><li>Three chapters: workforce and quality, AI agents and voice, and platform bridges. Eleven tracks, 78 written rooms.</li><li>A persistent track sidebar"
    if tonight not in text:
        raise SystemExit("tonight anchor missing")
    text = text.replace(tonight, insert, 1)
    path.write_text(text, encoding="utf-8")


def patch_search(tracks):
    path = ROOT / "assets/js/search-index.js"
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw.split("=", 1)[1].strip().rstrip(";"))
    for meta in tracks:
        data["tracks"].append({
            "id": meta["id"],
            "name": meta["name"],
            "color": meta["color"],
            "rooms": [
                {"code": room["code"], "title": room["title"], "href": "rooms/" + room["file"], "status": "written"}
                for room in meta["rooms"]
            ],
        })
        for room in meta["rooms"]:
            for term, definition in room["terms"]:
                data["terms"].append({
                    "term": term,
                    "def": re.sub(r"<[^>]+>", "", definition),
                    "room": room["code"],
                    "href": f"rooms/{room['file']}#eco",
                })
    path.write_text("window.CANON_INDEX = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")


def patch_counts(files_glob_skip=("archive", "vendor", "node_modules", ".git")):
    replacements = [
        ("Home. Eight tracks and your progress", "Home. Eleven tracks and your progress"),
        ("Eight tracks. Open a written room from the map.", "Eleven tracks. Open a written room from the map."),
        ("Sixty-three rooms. Read offline. Claims stay cited.", "Seventy-eight rooms. Read offline. Claims stay cited."),
        ("Sixty-three rooms. Read offline. Product claims stay cited.", "Seventy-eight rooms. Read offline. Product claims stay cited."),
        ("Sixty-three rooms. Watch the call path, then open a track.", "Seventy-eight rooms. Watch the call path, then open a track."),
        ("Webex study · 8 tracks · offline", "Webex study · 11 tracks · offline"),
        ("Eight colorful paths", "Eleven colorful paths"),
        ("all eight tracks", "all eleven tracks"),
        ("eight tracks, 63 written rooms", "eleven tracks, 78 written rooms"),
        ("Eight tracks, one private Canon", "Eleven tracks, one private Canon"),
        ("study notes · 63/63", "study notes · 78/78"),
        ("All 63 rooms are written, T1-R01 through T8-R08.", "78 rooms are written, T1-R01 through T11-R05."),
        ("All 63 rooms are written.", "All 78 rooms are written."),
        ("data-count=\"63\"", "data-count=\"78\""),
        (">63 rooms<", ">78 rooms<"),
        ("63 rooms", "78 rooms"),
        ("written rooms of 63", "written rooms of 78"),
        ("Canon<small>8 tracks</small>", "Canon<small>11 tracks</small>"),
        ("The written curriculum is the CypherWebex Canon: 8 tracks and 63 rooms.", "The written curriculum is the CypherWebex Canon: 11 tracks and 78 rooms."),
        ("This lab has eight written tracks: Control Hub, Webex Calling, multi-tenant contact center, Contact Center Enterprise, Dedicated Instance, migrations, SIP and queues, then flows and troubleshooting.",
         "This lab has eleven written tracks: Control Hub, Webex Calling, multi-tenant contact center, Contact Center Enterprise, Dedicated Instance, migrations, SIP and queues, flows and troubleshooting, then workforce and quality, AI agents and voice, and platform bridges."),
    ]
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in files_glob_skip]
        if any(skip in Path(dirpath).parts for skip in files_glob_skip):
            continue
        for name in filenames:
            if not name.endswith((".html", ".js", ".md", ".py")):
                continue
            path = Path(dirpath) / name
            if path.name == "emit_new_chapters.py":
                continue
            text = path.read_text(encoding="utf-8")
            new = text
            for old, repl in replacements:
                new = new.replace(old, repl)
            if new != text:
                path.write_text(new, encoding="utf-8")


def patch_menus():
    frame = ROOT / "assets/js/frame.js"
    text = frame.read_text(encoding="utf-8")
    needle = '{ id: "ecosystem", label: "Ecosystem", href: "ecosystem.html", icon: "globe", desc: "A curriculum mind map, then a cross-lab concept map." },'
    insert = needle + """
    { id: "t9", label: "Workforce & Quality", href: "tracks/T9/index.html", icon: "headset", desc: "Forecasts, schedules, and quality reviews on the public Webex pages." },
    { id: "t10", label: "AI Agents & Voice", href: "tracks/T10/index.html", icon: "spark", desc: "Studio agents, Virtual Agent V2, and the six digital channels." },
    { id: "t11", label: "Platform Bridges", href: "tracks/T11/index.html", icon: "link", desc: "Unified CM, Dedicated Instance, UCCX, and where other platforms stop." },"""
    if needle not in text:
        raise SystemExit("frame menu anchor missing")
    frame.write_text(text.replace(needle, insert, 1), encoding="utf-8")
    phone = ROOT / "assets/js/phone-nav.js"
    text = phone.read_text(encoding="utf-8")
    needle = '{ key: "ecosystem", label: "Ecosystem", href: "ecosystem.html", icon: "globe", desc: "A curriculum mind map, then a cross-lab concept map." },'
    insert = needle + """
    { key: "t9", label: "Workforce & Quality", href: "tracks/T9/index.html", icon: "headset", desc: "Forecasts, schedules, and quality reviews on the public Webex pages." },
    { key: "t10", label: "AI Agents & Voice", href: "tracks/T10/index.html", icon: "spark", desc: "Studio agents, Virtual Agent V2, and the six digital channels." },
    { key: "t11", label: "Platform Bridges", href: "tracks/T11/index.html", icon: "link", desc: "Unified CM, Dedicated Instance, UCCX, and where other platforms stop." },"""
    if needle not in text:
        raise SystemExit("phone menu anchor missing")
    phone.write_text(text.replace(needle, insert, 1), encoding="utf-8")
    shell = ROOT / "assets/js/shell.js"
    text = shell.read_text(encoding="utf-8")
    text = text.replace(
        'var TRACK_ICON = { T1: "hub", T2: "phone", T3: "headset", T4: "building", T5: "lock", T6: "truck", T7: "radio", T8: "spark" };',
        'var TRACK_ICON = { T1: "hub", T2: "phone", T3: "headset", T4: "building", T5: "lock", T6: "truck", T7: "radio", T8: "spark", T9: "headset", T10: "spark", T11: "link" };',
    )
    text = text.replace(
        'T8: "Flows & Tools"\n  };',
        'T8: "Flows & Tools",\n    T9: "Workforce & Quality",\n    T10: "AI & Voice",\n    T11: "Bridges"\n  };',
    )
    shell.write_text(text, encoding="utf-8")
    icons = ROOT / "assets/js/track-icons.js"
    text = icons.read_text(encoding="utf-8")
    text = text.replace(
        'var TRACKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];',
        'var TRACKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"];',
    )
    text = text.replace(
        "T8: 0xf0a0ff\n};",
        "T8: 0xf0a0ff,\n  T9: 0x34d399,\n  T10: 0xa78bfa,\n  T11: 0x38bdf8\n};",
    )
    text = text.replace(
        'if (id === "T8") return new THREE.TetrahedronGeometry(0.86, 0);\n  return new THREE.TetrahedronGeometry(0.86, 0);',
        'if (id === "T8") return new THREE.TetrahedronGeometry(0.86, 0);\n  if (id === "T9") return new THREE.SphereGeometry(0.62, 20, 16);\n  if (id === "T10") return new THREE.ConeGeometry(0.55, 1.15, 18);\n  if (id === "T11") return new THREE.TorusGeometry(0.48, 0.16, 12, 24);\n  return new THREE.TetrahedronGeometry(0.86, 0);',
    )
    icons.write_text(text, encoding="utf-8")


def patch_charts():
    path = ROOT / "charts.html"
    text = path.read_text(encoding="utf-8")
    start = text.index('<script type="application/json" id="chart-data">') + len('<script type="application/json" id="chart-data">')
    end = text.index("</script>", start)
    data = json.loads(text[start:end])
    extra = [
        {"id": "T9", "rooms": 5, "color": "#34d399", "quizzes": 16, "ladders": 16},
        {"id": "T10", "rooms": 5, "color": "#a78bfa", "quizzes": 16, "ladders": 16},
        {"id": "T11", "rooms": 5, "color": "#38bdf8", "quizzes": 15, "ladders": 15},
    ]
    # quizzes/ladders filled after rooms exist; placeholder corrected by caller
    data["tracks"].extend(extra)
    if "quizzes" in data and isinstance(data["quizzes"], list):
        data["quizzes"].extend([
            {"id": "T9", "n": 16, "color": "#34d399"},
            {"id": "T10", "n": 16, "color": "#a78bfa"},
            {"id": "T11", "n": 15, "color": "#38bdf8"},
        ])
    path.write_text(text[:start] + json.dumps(data) + text[end:], encoding="utf-8")


def recount_charts(groups):
    path = ROOT / "charts.html"
    text = path.read_text(encoding="utf-8")
    start = text.index('<script type="application/json" id="chart-data">') + len('<script type="application/json" id="chart-data">')
    end = text.index("</script>", start)
    data = json.loads(text[start:end])
    counts = {}
    for rooms in groups:
        html = "\n".join(room_page(room) for room in rooms)
        # count from data, not html, to avoid double work
        tid = rooms[0]["track"]
        counts[tid] = (sum(len(r["quiz"]) for r in rooms), sum(len(r["ladder"]) for r in rooms), len(rooms))
    for track in data["tracks"]:
        if track["id"] in counts:
            q, ladders, rooms = counts[track["id"]]
            track["quizzes"] = q
            track["ladders"] = ladders
            track["rooms"] = rooms
    if isinstance(data.get("quizzes"), list):
        for row in data["quizzes"]:
            if row.get("id") in counts:
                row["n"] = counts[row["id"]][0]
    path.write_text(text[:start] + json.dumps(data) + text[end:], encoding="utf-8")


def patch_ecosystem():
    path = ROOT / "ecosystem.html"
    text = path.read_text(encoding="utf-8")
    block = """
<h2 id="new-chapters">Chapters added for workforce, AI, and bridges</h2>
<p>T1 through T8 stay in the drawing above. T9, T10, and T11 are the new chapters. Counts on this page say 78 written rooms.</p>
<div class="diagram" role="img" aria-label="Mind map of tracks T9 T10 and T11">
<svg viewBox="0 0 1100 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mind map of the new chapters">
<rect width="1100" height="280" fill="#0c121c"/>
<text x="28" y="36" fill="#e0b07a" font-family="Georgia, serif" font-size="22">Three more chapters</text>
<a href="tracks/T9/index.html"><rect x="28" y="70" width="320" height="160" rx="16" fill="#064e3b" stroke="#34d399"/><text x="44" y="110" fill="#34d399" font-family="Segoe UI, sans-serif" font-size="18">T9 · Workforce and quality</text><text x="44" y="140" fill="#ecfdf5" font-family="Segoe UI, sans-serif" font-size="14">Forecast, schedule, evaluate</text><text x="44" y="164" fill="#a7f3d0" font-family="Segoe UI, sans-serif" font-size="13">Basic WFM, Basic QM, AI quality</text><text x="44" y="188" fill="#a7f3d0" font-family="Segoe UI, sans-serif" font-size="13">Analyzer CSR and ASR</text></a>
<a href="tracks/T10/index.html"><rect x="390" y="70" width="320" height="160" rx="16" fill="#2e1065" stroke="#a78bfa"/><text x="406" y="110" fill="#a78bfa" font-family="Segoe UI, sans-serif" font-size="18">T10 · AI agents and voice</text><text x="406" y="140" fill="#ede9fe" font-family="Segoe UI, sans-serif" font-size="14">Assistant, Studio, Virtual Agent V2</text><text x="406" y="164" fill="#ddd6fe" font-family="Segoe UI, sans-serif" font-size="13">Six digital channels</text><text x="406" y="188" fill="#ddd6fe" font-family="Segoe UI, sans-serif" font-size="13">Public limits only</text></a>
<a href="tracks/T11/index.html"><rect x="752" y="70" width="320" height="160" rx="16" fill="#082f49" stroke="#38bdf8"/><text x="768" y="110" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="18">T11 · Platform bridges</text><text x="768" y="140" fill="#e0f2fe" font-family="Segoe UI, sans-serif" font-size="14">Unified CM and Local Gateway</text><text x="768" y="164" fill="#bae6fd" font-family="Segoe UI, sans-serif" font-size="13">Dedicated Instance contact center</text><text x="768" y="188" fill="#bae6fd" font-family="Segoe UI, sans-serif" font-size="13">UCCX discovery, then a stop line</text></a>
</svg>
</div>

<h2 id="glossary-add">Glossary additions</h2>
<p>These terms are also in the glossary index, each pointing at the room that defines it.</p>
<ul>
<li><a href="rooms/T9-R01-wfm-qm-foundations.html#eco">Workforce management</a> — forecasting and scheduling, from the Wikipedia page opened for T9-R01.</li>
<li><a href="rooms/T9-R02-basic-wfm.html#eco">Real-time adherence</a> — a basic feature bullet and a separate connector SKU.</li>
<li><a href="rooms/T9-R04-ai-quality-management.html#eco">A-FLEX-AI-QM</a> — the AI Quality Management add-on named on the Control Hub article.</li>
<li><a href="rooms/T10-R02-virtual-agent-v2.html#eco">Virtual Agent V2</a> — the voice activity with Handled, Escalated, and Errored.</li>
<li><a href="rooms/T11-R01-bridge-is-not-a-cutover.html#eco">Local Gateway</a> — the bridge in the Unified CM migration guide.</li>
<li><a href="glossary.html">Open the full glossary</a></li>
</ul>

<h2 id="sisters">Sister technologies for the new chapters</h2>
<div class="table-wrap"><table class="sister"><thead><tr><th>Sister</th><th>What opened</th><th>Room</th></tr></thead><tbody>
<tr><td>Webex WFO basic packages</td><td>Scheduling, forecasting, evaluation. nmzg380.</td><td><a href="rooms/T9-R02-basic-wfm.html">T9-R02</a></td></tr>
<tr><td>AI Quality Management</td><td>Paid add-on, English only for now on the FAQ. nvtdfxk.</td><td><a href="rooms/T9-R04-ai-quality-management.html">T9-R04</a></td></tr>
<tr><td>AI Agent Studio</td><td>Build, then attach with Virtual Agent V2 or the Connect node. s0qro1.</td><td><a href="rooms/T10-R02-virtual-agent-v2.html">T10-R02</a></td></tr>
<tr><td>Third-party Virtual Agent–Voice</td><td>A different article from Studio. n6gaghu.</td><td><a href="rooms/T10-R01-three-ai-names.html">T10-R01</a></td></tr>
<tr><td>Dedicated Instance</td><td>Contact-center models, 60 ms, certificate trunks. nmhk7ve.</td><td><a href="rooms/T11-R03-di-contact-center.html">T11-R03</a></td></tr>
</tbody></table></div>

<h2 id="integration-map">Integration map</h2>
<div class="table-wrap"><table class="edges"><thead><tr><th>From</th><th>To</th><th>What the opened page allows</th><th>Room</th></tr></thead><tbody>
<tr><td>Unified CM</td><td>Webex Calling multi-tenant</td><td>Local Gateway bridge, or a full move. nbedetf.</td><td><a href="rooms/T11-R01-bridge-is-not-a-cutover.html">T11-R01</a></td></tr>
<tr><td>Dedicated Instance</td><td>Webex Contact Center</td><td>Certificate trunk and a G.711 then OPUS codec list. nmhk7ve.</td><td><a href="rooms/T11-R03-di-contact-center.html">T11-R03</a></td></tr>
<tr><td>Unified CCX</td><td>Webex Contact Center</td><td>Discovery jar and bulk CSV, 5000 rows. 0hd75db.</td><td><a href="rooms/T11-R04-uccx-to-wxcc.html">T11-R04</a></td></tr>
<tr><td>Webex CCE admin portal</td><td>Another Webex CCE tenant</td><td>Tenant data tool. Not a foreign PBX. n2puc5z.</td><td><a href="rooms/T11-R04-uccx-to-wxcc.html">T11-R04</a></td></tr>
<tr><td>Studio agent</td><td>Voice or six digital channels</td><td>Virtual Agent V2, or the Connect AI Agent node. s0qro1.</td><td><a href="rooms/T10-R04-digital-ai-channels.html">T10-R04</a></td></tr>
</tbody></table></div>

<h2 id="future-hooks">Future hooks</h2>
<ul>
<li>Ordering guides named by the WFO article. Confirm. No address until that page is opened.</li>
<li>The supported-voices article named by the AI-agent guide. Confirm.</li>
<li>A Cisco page that names Amazon Connect, Genesys, Five9, or NiCE as a Webex importer. None of the Cisco pages opened for T11 did. The sibling labs are the study rooms until that page exists.</li>
<li>Re-open s0qro1 before you repeat the six channels or the autonomous-voice limit. Header on the opened copy: August 25, 2026.</li>
</ul>

<h2 id="sibling-labs">Sibling labs</h2>
<p>These addresses opened in October 2026. Each line is what that page said about itself.</p>
<ul>
<li><a href="https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/">UC Lab</a> — SIP, CUCM, CUBE, UCCE, and a careful move toward Webex Calling.</li>
<li><a href="https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/">AI Lab</a> — programming, models, retrieval, agents, and voice. Not a Webex SKU.</li>
<li><a href="https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/">Amazon Connect</a> — flows, queues, and study notes that mention Cisco, Genesys, and Webex bridges.</li>
<li><a href="https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/">Microsoft Voice</a> — Teams Phone, Operator Connect, Direct Routing, and Dynamics 365 Contact Center.</li>
<li><a href="https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/">Five9</a> — a student’s open lab. Citations stay on that site.</li>
<li><a href="https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/">Genesys Cloud</a> — Architect, bullseye routing, and BYOC. The page says it does not sign in.</li>
<li><a href="https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/">NICE CXone</a> — Contact Path, independent study, not affiliated with NiCE.</li>
<li><a href="https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/">SIP Universe</a> — SIP from the first INVITE through media.</li>
</ul>
"""
    needle = "<h2>How to use this page</h2>"
    if needle not in text:
        raise SystemExit("ecosystem anchor missing")
    text = text.replace(needle, block + needle, 1)
    if "Sources and go deeper" not in text:
        text = text.replace("</main>", sources_html("") + "</main>", 1)
    path.write_text(text, encoding="utf-8")


def add_sources_to_pages():
    block = sources_html("")
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in ("archive", "vendor", "node_modules", ".git")]
        for name in filenames:
            if not name.endswith(".html"):
                continue
            path = Path(dirpath) / name
            if "downloads/diagrams" in str(path):
                continue
            text = path.read_text(encoding="utf-8")
            if "Sources and go deeper" in text or "</main>" not in text:
                continue
            path.write_text(text.replace("</main>", block + "</main>", 1), encoding="utf-8")


def patch_verify():
    path = ROOT / "scripts/verify-university.mjs"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        'for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {',
        'for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"]) {',
    )
    text = text.replace(
        'for (const track of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {',
        'for (const track of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"]) {',
    )
    path.write_text(text, encoding="utf-8")


def disclaimer_everywhere():
    needle = "It is <strong>not affiliated with or endorsed by</strong> any of them.</p>"
    extra = needle + "<p>Chapters on workforce and quality, AI agents and voice, and platform bridges quote public pages opened in October 2026. A sources row marked confirm has no address.</p>"
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in ("archive", "vendor", "node_modules", ".git")]
        for name in filenames:
            if not name.endswith(".html"):
                continue
            path = Path(dirpath) / name
            text = path.read_text(encoding="utf-8")
            if needle in text and "quote public pages opened in October 2026" not in text:
                path.write_text(text.replace(needle, extra), encoding="utf-8")


def main():
    t9, t10, t11 = build_rooms()
    write_rooms(t9 + t10 + t11)
    metas = [
        {"id": "T9", "num": "09", "emoji": "📋", "color": "#34d399", "short": "Workforce &amp; Quality",
         "name": "Workforce and Quality Management", "one": "5 rooms. Forecast, schedule, and evaluate.",
         "purpose": "From the words forecast and evaluate to Webex WFO packages, AI quality, and Analyzer bands.",
         "lede": "Forecast, schedule, adhere, and evaluate, then the Webex pages that name those jobs.",
         "note": "Start at T9-R01. T9-R02 and T9-R03 are the basic packages. T9-R04 is the AI add-on. T9-R05 is the Analyzer report.",
         "rooms": t9},
        {"id": "T10", "num": "10", "emoji": "🎙️", "color": "#a78bfa", "short": "AI Agents &amp; Voice",
         "name": "AI Agents and Voice AI", "one": "5 rooms. Assistant, Studio, and voice.",
         "purpose": "Public Webex pages only: Assistant, Virtual Agent V2, six digital channels, and the limits those pages print.",
         "lede": "Keep the Assistant, Studio agents, and third-party Virtual Agent–Voice apart, then attach a voice agent.",
         "note": "T8-R05 remains the earlier long room. This track walks the same public articles from fundamentals to the claims they refuse.",
         "rooms": t10},
        {"id": "T11", "num": "11", "emoji": "🌉", "color": "#38bdf8", "short": "Platform Bridges",
         "name": "Bridges from CUCM and UCCE", "one": "5 rooms. Unified CM, DI, and UCCX.",
         "purpose": "Published bridges into Webex, and a stop line where another platform has no opened Cisco importer.",
         "lede": "A bridge can leave Unified CM in place. A cutover is a different decision.",
         "note": "T6 is the migration track. T11 reads the bridge articles again and then points at sibling labs for other products.",
         "rooms": t11},
    ]
    for meta in metas:
        track_dir = ROOT / "tracks" / meta["id"]
        track_dir.mkdir(parents=True, exist_ok=True)
        (track_dir / "index.html").write_text(
            track_page(meta["id"], meta["num"], meta["emoji"], meta["name"], meta["lede"], meta["note"], meta["color"], meta["rooms"]),
            encoding="utf-8",
        )
        (track_dir / "chapter.md").write_text(
            f"# {meta['id']} {meta['name']}\n\n{meta['lede']}\n\n{sources_md()}",
            encoding="utf-8",
        )
        (track_dir / "sources.json").write_text(
            json.dumps(sources_json(meta["id"], meta["name"]), indent=2) + "\n",
            encoding="utf-8",
        )
        diagram = ROOT / "assets" / "diagrams" / meta["id"]
        diagram.mkdir(parents=True, exist_ok=True)
        (diagram / "mindmap.svg").write_text(mindmap(meta["id"], meta["name"], meta["color"], meta["rooms"]), encoding="utf-8")
        (ROOT / "downloads" / "chapters").mkdir(parents=True, exist_ok=True)
        (ROOT / "downloads" / "chapters" / f"{meta['id'].lower()}.html").write_text(
            chapter_download(meta["id"], meta["name"], meta["lede"], meta["rooms"]),
            encoding="utf-8",
        )
    patch_index(metas)
    patch_search(metas)
    patch_menus()
    patch_charts()
    recount_charts([t9, t10, t11])
    patch_ecosystem()
    patch_counts()
    disclaimer_everywhere()
    add_sources_to_pages()
    patch_verify()
    print("rooms", 15, "tracks", 3)


if __name__ == "__main__":
    main()
