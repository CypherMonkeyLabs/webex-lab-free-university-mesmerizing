#!/usr/bin/env python3
"""Generate university pages, diagrams, and cheat sheets. Static output. No network."""
from pathlib import Path
import json
import html

ROOT = Path(__file__).resolve().parents[1]

FOOTER = """
<footer class="site-footer lab-footer wrap">
<p class="lab-sign">CypherMonkey · Webex Lab Free University</p>
<p>Independent educational project. Not affiliated with or endorsed by Cisco or any other vendor. Trademarks belong to their owners. MIT code. CC BY-NC-SA content.</p>
<p class="lab-actions">
<a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> <a href="https://github.com/CypherMonkeyLabs">github.com/CypherMonkeyLabs</a> <a href="https://linktr.ee/cyphermonkey">linktr.ee/cyphermonkey</a>
<a href="https://cyphermonkeylabs.com">Report a concern / takedown</a>
<a href="https://cyphermonkeylabs.com">Work with us</a>
</p>
</footer>
"""

CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' blob: data:; font-src \'self\' data:; connect-src \'self\'; worker-src \'self\' blob:; object-src \'none\'; base-uri \'self\'; form-action \'self\'">'


def page(title, body, depth=""):
    pre = "../" * depth.count("/") if False else depth
    # depth is prefix like "" or "../" or "../../"
    p = depth
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
{CSP_META}
<script src="{p}assets/js/theme-boot.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)} · Webex Lab</title>
<link rel="stylesheet" href="{p}assets/css/canon.css">
<link rel="stylesheet" href="{p}assets/css/shell.css">
<link rel="stylesheet" href="{p}assets/css/university.css">
<link rel="icon" href="{p}assets/mark.svg">
</head>
<body class="v4">
<a class="skip" href="#main">Skip to content</a>
<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">
<nav class="lab-links" aria-label="CypherMonkey">
<a href="https://cyphermonkeylabs.com">Labs home</a> <a href="https://github.com/CypherMonkeyLabs">Labs org</a> <a href="https://linktr.ee/cyphermonkey">Linktree</a>
<button type="button" data-offline-save>Save for offline</button>
<a href="{p}downloads/webex-university-offline.zip">Offline bundle</a>
</nav>
<header class="topbar" data-chrome="v4">
<div class="bar-inner">
<a class="brand" href="{p}index.html"><span class="brand-name">Webex Lab<small>University</small></span></a>
<nav class="nav-quick" aria-label="Primary">
<a class="nav-icon" href="{p}index.html" title="Home"><span aria-hidden="true">🏠</span><span class="sr">Home</span></a>
<a class="nav-icon" href="{p}start.html" title="Start"><span aria-hidden="true">🚀</span><span class="sr">Start</span></a>
<a class="nav-icon" href="{p}mastery.html" title="Mastery"><span aria-hidden="true">🧭</span><span class="sr">Mastery</span></a>
<a class="nav-icon" href="{p}play.html" title="Play"><span aria-hidden="true">🎮</span><span class="sr">Play</span></a>
<a class="nav-icon" href="{p}downloads.html" title="Cheat Codes"><span aria-hidden="true">⬇️</span><span class="sr">Downloads</span></a>
</nav>
<form class="nav-search" role="search" action="#">
<input class="nav-q" type="search" placeholder="Search" aria-label="Search rooms and glossary" data-nav-search autocomplete="off">
</form>
<button type="button" class="icon-btn" data-theme-toggle aria-label="Choose a theme">◐</button>
<button type="button" class="icon-btn nav-toggle" aria-expanded="false" aria-controls="canon-nav" aria-label="More">⋯</button>
<nav id="canon-nav" class="nav-panel nav-more" aria-label="More" hidden>
<a href="{p}ecosystem-atlas.html">Ecosystem atlas</a>
<a href="{p}ports.html">Ports and protocols</a>
<a href="{p}labs.html">Hands-on labs</a>
<a href="{p}certs.html">Certifications</a>
<a href="{p}glossary.html">Glossary</a>
</nav>
</div>
</header>
<main id="main"><div class="wrap">
{body}
</div></main>
{FOOTER}
<aside class="v4-toc" id="v4-toc" aria-label="On this page"></aside></div></div>
<script src="{p}assets/js/search-index.js"></script>
<script src="{p}assets/js/canon.js"></script>
<script src="{p}assets/js/redesign.js"></script>
<script src="{p}assets/js/study-index.js"></script>
<script src="{p}assets/js/shell.js"></script>
</body></html>
"""


DIAGRAMS = [
    ("calling-registration", "Calling registration", ["Phone", "DNS / SRV", "Webex Calling", "Control Hub"], "SIP TLS toward the cloud. Endpoints do not register through the Local Gateway."),
    ("certificate-trunk", "Certificate trunk", ["CUBE", "mTLS", "TCP 5062", "Webex Calling"], "Certificate-based trunks use destination TCP 5062. The FQDN must match the certificate."),
    ("registration-trunk", "Registration trunk", ["CUBE", "REGISTER", "TCP 8934", "Webex Calling"], "Registration-based trunks use destination TCP 8934. The Canon records a 250-call CUBE cap for that mode."),
    ("pstn-choices", "Three PSTN choices", ["Location", "Cisco Calling Plan", "Cloud Connected PSTN", "Premises / LGW"], "One PSTN choice per location. Premises PSTN uses a Local Gateway."),
    ("lgw-media", "Local Gateway media", ["LGW UDP 8000-48199", "SRTP", "5004 / 9000", "8500-8699 / 19560-65535"], "Outbound media from the local gateway. UDP is the production transport. TCP media is not supported."),
    ("app-media", "Webex App optimized media", ["App audio 8500-8599", "ICE success", "App video 8600-8699", "Peer app"], "When ICE succeeds inside the org, media can go direct on these ranges."),
    ("device-media", "Device optimized media", ["MPP / Room", "ICE", "UDP 19560-19661", "Peer device"], "Devices send direct media on 19560-19661 when optimization succeeds. Room Series uses its own ranges."),
    ("e911-held", "Emergency HELD", ["Phone or app", "TCP 443", "api.wxc.e911cloud.com", "wxc.e911cloud.com"], "RedSky. 933 does not alert public safety. Kari's Law email is a separate Control Hub setting."),
    ("recording-path", "Call recording", ["Call", "Provider", "Webex or Dubber", "Media processed"], "Choose the provider before you enable users. Processing media disables Calling end-to-end encryption."),
    ("e2ee-path", "Calling encryption", ["SRTP", "E2EE toggle", "Client support", "Downgrade"], "E2EE is opportunistic and off by default. Recording, auto attendant, and a mixer drop it."),
    ("control-hub", "Control Hub", ["Admin", "Organization", "Users and roles", "Services"], "The organization is the boundary. People you add start without admin rights."),
    ("identity-sync", "Identity", ["Directory Connector", "SCIM 2.0", "SSO uid", "Webex user"], "Org SSO maps an attribute to uid. Partner SSO uses mail, not uid."),
    ("device-claim", "Device onboarding", ["MAC or code", "activate.cisco.com", "TCP 443", "Firmware"], "Firmware and activation also use 6970 and, for older MIC renewal, port 80 to sudirenewal.cisco.com."),
    ("meetings-split", "Meetings beside Calling", ["Calling port ref", "Suite services", "Meetings article", "Do not merge ACLs"], "b2exve tells suite customers to also allow the Meetings network-requirements article. This drawing does not copy that matrix."),
    ("wxcc-path", "WxCC voice path", ["Entry point", "Flow", "Queue", "Agent"], "Multi-tenant contact center. The flow is not a Unified CM dial plan."),
    ("flow-designer", "Flow Designer", ["Start Flow", "Menu / Play", "Queue Contact", "Disconnect"], "Start Flow cannot be removed. Validation starts off. Publish waits for a clean check."),
    ("ai-handoff", "AI agent handoff", ["Caller", "Virtual agent", "AGENT_TRANSFER", "Human queue"], "Bring-your-own virtual agent must escalate with AGENT_TRANSFER."),
    ("wfm-loop", "WFM study loop", ["History", "Forecast", "Schedule", "Adhere"], "Orientation for workforce management. SKU scope in py6u9h is Enterprise, CCE, and CCX. Multi-tenant fit stays unverified."),
    ("analyzer", "Analyzer clocks", ["Events", "Real-time", "Historical", "Desktop widget"], "Keep Analyzer's clocks apart from the desktop widget. The rooms record a 5-second default versus 60 seconds on the widget."),
    ("crm-pop", "CRM screen pop", ["Task", "Connector", "Salesforce / Dynamics / ServiceNow", "Agent desktop"], "Salesforce is Lightning only. On-premises Dynamics is unsupported on the connector article. Chat and email are not on these connectors."),
    ("migration", "Migration order", ["Assess", "Pilot", "Cutover", "Validate"], "Canon study order, not a Cisco runbook. Calling migration and contact-center migration are different projects."),
    ("number-port", "Number move", ["Losing carrier", "FOC", "Control Hub", "Test 933"], "Do not edit a port order after FOC. Test emergency with 933 before you call the public network."),
    ("di-peering", "Dedicated Instance", ["Customer edge", "Two links", "DI applications", "Webex Calling interop"], "Dedicated Instance is not multi-tenant Calling. Interop trunks are certificate trunks."),
    ("survivability", "Survivability", ["Cloud mode", "Outage", "Survivability Gateway", "Return"], "Site survivability is a gateway mode. It is not a second Webex cloud."),
    ("qos", "QoS marks", ["App audio EF 46", "App video AF41 34", "Signaling", "Device CS3 24"], "b2exve QoS table. Windows source-port split for audio versus video needs the port-range feature enabled."),
    ("firewall-lanes", "Firewall lanes", ["HTTPS domains", "SIP TLS", "SRTP UDP", "DNS and NTP"], "Filter HTTPS by domain. Filter signaling and media by port and the article's IP subnets. Do not paste subnets from memory."),
    ("nat-sip", "NAT and SIP ALG", ["Overlapping 5060-5280", "PAT", "Unique source", "SIP ALG off"], "Phones may reuse SIP source ports. Strict source-port preservation breaks registration. Turn SIP ALG off."),
    ("cscan", "CScan", ["Browser", "TCP 8934 and 443", "UDP 19569-19760", "Readiness"], "cscan.webex.com is a pre-check. It is not a substitute for a live call."),
]


def svg_for(slug, title, nodes, caption):
    colors = ["#22d3ee", "#a5b4fc", "#fbbf24", "#fb7185"]
    boxes = []
    for i, label in enumerate(nodes):
        x = 36 + i * 230
        boxes.append(
            f'<rect x="{x}" y="78" width="200" height="72" rx="16" fill="{colors[i % 4]}"/>'
            f'<text x="{x + 100}" y="120" text-anchor="middle" fill="#0b1020" font-size="15" font-family="system-ui,sans-serif" font-weight="700">{html.escape(label)}</text>'
        )
        if i:
            boxes.append(f'<path d="M{x - 30} 114 H{x}" stroke="#e2e8f0" stroke-width="3" fill="none"/>')
    lane = "M136 114 H266 V114 H496 V114 H726"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 240" role="img" aria-label="{html.escape(title)}">
<rect width="980" height="240" rx="20" fill="#0b1020"/>
<text x="28" y="40" fill="#f8fafc" font-size="22" font-family="system-ui,sans-serif" font-weight="700">{html.escape(title)}</text>
<text x="28" y="64" fill="#94a3b8" font-size="13" font-family="system-ui,sans-serif">{html.escape(caption)}</text>
{''.join(boxes)}
<circle r="7" fill="#fde68a">
<animateMotion dur="4.8s" repeatCount="indefinite" path="{lane}"/>
</circle>
</svg>
'''


CARDS = [
    ["Certificate trunk destination", "TCP 5062 toward Webex Calling.", "help.webex.com article b2exve, retrieved 2026-10-15"],
    ["Registration trunk destination", "TCP 8934 toward Webex Calling.", "b2exve, retrieved 2026-10-15"],
    ["Phone SIP source ports", "5060–5280. Expanded from 5060–5080 on September 07, 2026.", "b2exve revision history"],
    ["Local gateway media source", "UDP 8000–48199 toward 5004, 9000, 8500–8699, and 19560–65535.", "b2exve"],
    ["Optimized Webex App media", "Audio UDP 8500–8599. Video UDP 8600–8699, when ICE succeeds.", "b2exve"],
    ["Optimized device media", "UDP 19560–19661 between devices when ICE succeeds.", "b2exve"],
    ["Room Series media", "Audio UDP 52050–52099. Video UDP 52200–52299.", "b2exve"],
    ["VG400 ATA media", "UDP 19560–19849.", "b2exve"],
    ["RedSky hosts", "api.wxc.e911cloud.com and wxc.e911cloud.com, port 443.", "b2exve and the emergency calling article av6oo3"],
    ["933", "US and Canada test number. It does not alert public safety.", "Canon room T2-R06, citing the emergency articles"],
    ["SIP ALG", "Turn it off for Webex Calling.", "b2exve"],
    ["Calling media transport", "UDP with SRTP. TCP and TLS media are not supported in production.", "b2exve"],
    ["DNS and NTP", "DNS UDP and TCP 53. Device NTP UDP 123 to the Calling subnets. App NTP UDP 123.", "b2exve"],
    ["App configuration ports", "TCP 443 and 8443. 8443 is for the Webex App on a Unified CM setup that also uses Calling.", "b2exve"],
    ["Device firmware ports", "TCP 443, 6970, and 80. Port 80 is called out for older MPP MIC renewal on sudirenewal.cisco.com.", "b2exve"],
    ["CScan", "TCP 8934 and 443, plus UDP 19569–19760.", "b2exve"],
    ["QoS audio", "Webex App audio DSCP EF 46 on 8500–8599.", "b2exve"],
    ["QoS video", "Webex App video DSCP AF41 34 on 8600–8699.", "b2exve"],
    ["Three PSTN choices", "Cisco Calling Plan, Cloud Connected PSTN, or premises PSTN on a Local Gateway. Per location.", "help.webex.com article t9xctu, as used in the Canon"],
    ["Endpoints and the gateway", "Phones do not register through the Local Gateway.", "Canon T2-R02, citing the local-gateway getting-started article"],
    ["Calling E2EE", "Opportunistic and off by default. Recording disables it.", "help.webex.com article 5h5d8ab, as used in T2-R06"],
    ["SRTP suite named for Calling", "AES_CM_128_HMAC_SHA1_80 in the SIP security article.", "help.webex.com article jwkbt2"],
    ["Webex recording retention", "One year and 100 GB per organization in the Calling recording article.", "help.webex.com article nhvl4hw"],
    ["Dubber Go", "30 days, user access in the Dubber portal.", "nhvl4hw"],
    ["Edge SRV versus trunk", "The security article's SRV example uses 5061 for endpoint discovery. That is not trunk 5062 or 8934.", "jwkbt2 and b2exve"],
    ["Org SSO claim", "Map an attribute to uid, matching one of the user's emails.", "help.webex.com article lfu88u"],
    ["Partner SSO claim", "Uses mail, not uid.", "lfu88u, as recorded in the Canon"],
    ["New Control Hub user", "Starts with no administrative privileges.", "Control Hub article nuylwki, as recorded in T1-R01"],
    ["BYO virtual agent", "Escalate with AGENT_TRANSFER.", "developer.webex.com bring-your-own-virtual-agent"],
    ["Salesforce connector", "Lightning only. Chat and email are not supported on that connector.", "help.webex.com article dyidod"],
    ["Dynamics connector", "CIF 1 single-session, CIF 2 multi-session. On-premises Dynamics is unsupported.", "help.webex.com article n1lsqvu"],
    ["WFO SKU scope", "Article py6u9h is scoped to Webex Contact Center Enterprise, Contact Center Enterprise, and Contact Center Express. Multi-tenant use is unverified.", "help.webex.com article py6u9h"],
    ["Troubleshooting history", "The Canon records 21 days for the Calling troubleshooting view.", "Room T1-R06. Re-check the live article before you quote a retention number in a design."],
    ["Start Flow", "Cannot be removed. Validation starts off.", "Flow Designer article nhovcy4, as taught in the labs"],
    ["MTU", "Keep the default 1500 bytes.", "b2exve"],
    ["IP filtering alone", "Not supported for Calling, because some pools change. Do not filter by region.", "b2exve"],
]


def sheet(title, paragraphs, table_rows, back="../../"):
    rows = "".join(
        "<tr>" + "".join(f"<td>{html.escape(cell)}</td>" for cell in row) + "</tr>"
        for row in table_rows
    )
    body = f"<h1>{html.escape(title)}</h1>" + "".join(f"<p>{p}</p>" for p in paragraphs)
    body += f"<table><thead><tr><th>Item</th><th>What to remember</th><th>Source</th></tr></thead><tbody>{rows}</tbody></table>"
    body += f'<p><a href="{back}index.html">Back to the lab</a></p>'
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">{CSP_META}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 24px; color: #142033; }}
h1 {{ font-size: 1.6rem; margin-bottom: 0.2rem; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
td, th {{ border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; font-size: 0.92rem; }}
th {{ background: #e0f2fe; text-align: left; }}
footer {{ margin-top: 18px; font-size: 0.8rem; color: #334155; }}
footer a {{ color: #0f766e; }}
@media print {{ a {{ color: inherit; }} }}
</style></head><body>
<nav aria-label="CypherMonkey">
<a href="https://cyphermonkeylabs.com">Labs home</a> · <a href="https://github.com/CypherMonkeyLabs">Labs org</a> ·
</nav>
{body}
<footer>
<p><strong>CypherMonkey · Webex Lab Free University</strong></p>
<p>Independent educational project. Not affiliated with or endorsed by any vendor. Trademarks belong to their owners. MIT code. CC BY-NC-SA content. Study notes, not a firewall ticket.</p>
<p>
<a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> · <a href="https://github.com/CypherMonkeyLabs">github.com/CypherMonkeyLabs</a> ·
<a href="https://cyphermonkeylabs.com">Report a concern</a> ·
<a href="https://cyphermonkeylabs.com">Work with us</a>
</p>
</footer>
</body></html>
"""


SHEETS = {
    "ports-protocols": (
        "Ports and protocols",
        ["One page for the Calling firewall conversation. IP subnets change. Open the live article before you write an ACL. Retrieved 2026-10-15 from help.webex.com article b2exve."],
        [
            ["TCP 5062", "Certificate-based trunk signaling destination", "b2exve"],
            ["TCP 8934", "Registration-based trunk signaling destination", "b2exve"],
            ["5060–5280", "Phone SIP signaling source ports", "b2exve, 2026-09-07"],
            ["UDP 8000–48199", "Local gateway media source", "b2exve"],
            ["UDP 5004, 9000, 8500–8699, 19560–65535", "Media destinations toward Calling", "b2exve"],
            ["TCP 443", "RedSky hosts and most HTTPS signaling", "b2exve"],
            ["UDP/TCP 53 and UDP 123", "DNS and NTP", "b2exve"],
        ],
    ),
    "call-flows": (
        "Call flows",
        ["Four flows you should be able to draw without opening a tenant."],
        [
            ["On-net app to app", "Register to Calling. If ICE succeeds, media can go direct.", "b2exve"],
            ["Outbound PSTN", "Location routing choice, then Cisco Calling Plan, CCP, or the Local Gateway.", "t9xctu"],
            ["Contact center", "Entry point, flow, queue, agent. Not a CUCM route pattern.", "utqcm7"],
            ["Emergency", "Phone or app to RedSky on 443, then the emergency network. Test with 933.", "av6oo3"],
        ],
    ),
    "config-checklist": (
        "Configuration checklist",
        ["A study checklist. It does not provision a tenant."],
        [
            ["Organization", "Name the full administrator and confirm new users have no admin role.", "nuylwki"],
            ["Identity", "Directory Connector or SCIM, then SSO. Do not run both creators for the same people.", "zqvufbb, lfu88u"],
            ["Location", "Address, main number, PSTN connection, emergency address.", "T1-R04"],
            ["Trunk", "Certificate or registration. FQDN matches the certificate. SIP ALG off.", "b2exve, t9xctu"],
            ["Users", "License, number, device claim, recording provider chosen first.", "nhvl4hw"],
        ],
    ),
    "troubleshooting": (
        "Troubleshooting tree",
        ["Separate signaling, media, identity, and emergency. The troubleshooting view is not Analyzer."],
        [
            ["Registers, no audio", "SRTP path and UDP ports. Not a SIP 200 problem.", "b2exve"],
            ["No registration", "NAT source-port preservation, SIP ALG, or DNS.", "b2exve"],
            ["933 fails, calls work", "TCP 443 to both RedSky hosts.", "av6oo3, b2exve"],
            ["One department only", "Location PSTN connection and dial plan, not a global outage.", "T2-R03"],
            ["Contact center idle", "Agent state, team, and queue skill. Not the Calling trunk.", "T3-R03"],
        ],
    ),
    "glossary": (
        "Glossary",
        ["Short definitions used in this lab. Rooms hold the longer form."],
        [
            ["Control Hub", "The organization console.", "nuylwki"],
            ["Local Gateway", "Customer edge for premises PSTN. Not a phone registrar.", "t9xctu"],
            ["Entry point", "Where a contact-center call arrives.", "utqcm7"],
            ["Dedicated Instance", "Customer UC applications in Webex, not multi-tenant Calling.", "T5-R01"],
            ["HELD", "The location request phones use toward RedSky.", "av6oo3"],
        ],
    ),
    "e911": (
        "E911 and emergency calling",
        ["Teach the test number and the two host names. Do not place a real 911 call from a lab."],
        [
            ["Hosts", "api.wxc.e911cloud.com and wxc.e911cloud.com", "b2exve"],
            ["Port", "443 from the phone and the Webex client", "b2exve"],
            ["933", "Test. Does not alert public safety in the US and Canada.", "T2-R06"],
            ["Kari's Law", "Notification email exists and is not the same setting as RedSky routing.", "av6oo3"],
            ["RAY BAUM", "Dispatchable location for nomadic users. Phase 2 is January 2022 in the Canon.", "av6oo3"],
        ],
    ),
    "recording-qm": (
        "Recording and quality",
        ["Recording and quality management are different products. Do not collapse them into one toggle."],
        [
            ["Calling provider", "Select Webex or Dubber before enabling users.", "nhvl4hw"],
            ["Webex storage", "1 year, 100 GB per organization, compliance officers.", "nhvl4hw"],
            ["Dubber Go", "30 days in the Dubber portal.", "nhvl4hw"],
            ["E2EE", "Recording disables Calling end-to-end encryption.", "5h5d8ab"],
            ["WxCC QM", "AI QM add-ons are taught in T3-R09. Confirm the SKU on the live order guide.", "T3-R09"],
        ],
    ),
    "wfm": (
        "Workforce management",
        ["Forecast, schedule, adhere. This page does not invent a formula Cisco did not publish here."],
        [
            ["Study room", "T3-R09 covers WFO and AI features named in the articles.", "T3-R09"],
            ["SKU article", "py6u9h scopes listed WFO SKUs to Enterprise, CCE, and CCX.", "py6u9h"],
            ["Multi-tenant", "Unverified. Do not apply an Enterprise SKU from habit.", "py6u9h"],
            ["Basic WFM", "The room describes forecasting coverage. Re-check nmzg380 before a design.", "T3-R09"],
            ["Not Analyzer", "A schedule is not a historical report.", "T3-R07"],
        ],
    ),
    "pstn-byoc": (
        "PSTN, BYOC, and trunks",
        ["Bring-your-own carrier in this lab means premises PSTN on a Local Gateway, or Cloud Connected PSTN where a partner is the carrier. It is not a fourth mystery option."],
        [
            ["Per location", "One connection type.", "t9xctu"],
            ["Cisco Calling Plan", "Cisco is the carrier.", "T2-R02"],
            ["Cloud Connected PSTN", "A certified partner carrier.", "T2-R02"],
            ["Premises", "Your trunk, your carrier, CUBE as the usual local gateway.", "t9xctu"],
            ["Registration cap", "The Canon records 250 concurrent calls and CUBE only for registration trunks.", "T2-R02"],
        ],
    ),
    "ai-agents": (
        "AI agents and bots",
        ["Name the product. Scripted and autonomous agents are not the same object as Calling's auto attendant."],
        [
            ["Virtual Agent–Voice", "IVR with a CCAI connector. Dialogflow CX, ES, or bring-your-own.", "n6gaghu"],
            ["Handoff", "BYO must send AGENT_TRANSFER.", "developer.webex.com"],
            ["AI Assistant", "Control Hub add-on: summaries, wellness, Auto CSAT, transcription, Real-Time Assist.", "n9lk3t6"],
            ["AI Agent Studio", "Taught in T8-R05 and T8-R03. Re-check the live what's-new page.", "T8-R05"],
            ["WFO Agent Assist", "Schedule assistant noted on the agent what's-new page. Not the same SKU as Enterprise WFO.", "n3v7ldh"],
        ],
    ),
    "migration-cutover": (
        "Migration cutover",
        ["Calling moves and contact-center moves use different tools. This is a study checklist, not a change window."],
        [
            ["Calling from Unified CM", "Prepare, migrate devices and features, Migration Insights.", "nbedetf and the rooms in T6"],
            ["BroadWorks / BroadCloud", "Separate article from Unified CM.", "n1ku0vfb"],
            ["Contact center", "CCX discovery tool is not a UCCE import.", "T6-R04"],
            ["Numbers", "Port orders, FOC, then test. 933 before agents take live emergency calls.", "T6-R06"],
            ["Rollback", "Know which system still owns the number before you power anything off.", "T6-R01"],
        ],
    ),
    "licensing-certs": (
        "Licensing and certifications",
        ["Exam names were checked in the Canon on 2026-10-14. Prices on that page are Cisco's printed prices that day. Re-check before you pay."],
        [
            ["Calling licenses", "Professional, Standard, Workspace. Features differ. See n1qbbp7.", "T1-R03"],
            ["CCNP Collaboration", "350-801 CLCOR plus one concentration.", "Cisco certification page"],
            ["CLACC", "300-815. CLACCM retired February 2, 2026.", "Cisco exam pages"],
            ["CLHCT", "300-820. CLCEI retired February 2, 2026.", "Cisco exam pages"],
            ["CLCCE", "300-830 contact-center concentration.", "Cisco exam pages"],
        ],
    ),
    "crm-apis": (
        "CRM and APIs",
        ["Connectors are not parity charts. Webhooks are not a license to store recordings in a random bucket."],
        [
            ["Salesforce", "Lightning connector. No chat or email on that article.", "dyidod"],
            ["Dynamics", "CIF 1 or CIF 2. Not Dynamics 365 Contact Center the product.", "n1lsqvu"],
            ["ServiceNow", "Desktop launches inside ServiceNow.", "ny83tx0"],
            ["Recording webhooks", "telephony_calls events and convergedRecordings. Scope spark-admin:calls_read.", "developer.webex.com call control"],
            ["Personal webhook cap", "The Canon quotes 30,000 personal webhooks per user and an org-wide limit of 1. That is the Webhooks guide, not a WxCC task quota.", "T8-R03"],
        ],
    ),
    "security": (
        "Security and compliance",
        ["TLS version, SRTP suite, and end-to-end encryption are three different sentences."],
        [
            ["TLS", "1.2 and 1.3 for secure SIP.", "jwkbt2"],
            ["Certificates", "Server Authentication EKU. CN or SAN matches Control Hub without the port.", "jwkbt2"],
            ["SRTP", "AES_CM_128_HMAC_SHA1_80.", "jwkbt2"],
            ["E2EE", "Off by default. Not for PSTN. Recording disables it.", "5h5d8ab"],
            ["Proxy inspection", "Apps trust an OS CA. Room devices and MPP phones need TAC to install a custom CA.", "b2exve"],
        ],
    ),
}


def main():
    diag_dir = ROOT / "assets" / "diagrams" / "university"
    diag_dir.mkdir(parents=True, exist_ok=True)
    for slug, title, nodes, caption in DIAGRAMS:
        (diag_dir / f"{slug}.svg").write_text(svg_for(slug, title, nodes, caption), encoding="utf-8")

    sheet_dir = ROOT / "downloads" / "sheets"
    sheet_dir.mkdir(parents=True, exist_ok=True)
    for slug, (title, paragraphs, rows) in SHEETS.items():
        (sheet_dir / f"{slug}.html").write_text(sheet(title, paragraphs, rows), encoding="utf-8")
        lines = "".join(
            f'<text x="36" y="{120 + i * 28}" fill="#e2e8f0" font-size="16" font-family="system-ui,sans-serif">{html.escape(row[0])} — {html.escape(row[1])}</text>'
            for i, row in enumerate(rows[:8])
        )
        height = 160 + len(rows[:8]) * 28
        (sheet_dir / f"{slug}.svg").write_text(
            f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 {height}" role="img" aria-label="{html.escape(title)}">
<rect width="980" height="{height}" fill="#0b1020"/>
<text x="36" y="48" fill="#f8fafc" font-size="28" font-family="system-ui,sans-serif" font-weight="700">{html.escape(title)}</text>
<text x="36" y="78" fill="#94a3b8" font-size="14" font-family="system-ui,sans-serif">CypherMonkey · Webex Lab · not a vendor document</text>
{lines}
</svg>''',
            encoding="utf-8",
        )

    (ROOT / "downloads" / "flashcards.json").write_text(
        json.dumps({"deck": "webex-university", "cards": [
            {"front": a, "back": b, "source": c} for a, b, c in CARDS
        ]}, indent=2),
        encoding="utf-8",
    )
    cards_html = "".join(
        f"<article class='card'><h2>{html.escape(a)}</h2><p>{html.escape(b)}</p><p class='src'>{html.escape(c)}</p></article>"
        for a, b, c in CARDS
    )
    (ROOT / "downloads" / "flashcards-print.html").write_text(
        """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">""" + CSP_META + """<title>Webex flashcards</title>
<style>
body { font-family: system-ui, sans-serif; margin: 16px; }
.card { break-inside: avoid; border: 1px solid #94a3b8; border-radius: 12px; padding: 12px; margin: 0 0 12px; }
.src { color: #475569; font-size: 0.85rem; }
</style></head><body><h1>Webex Lab flashcards</h1>"""
        + cards_html
        + sheet("Sources", ["Print this page. The JSON beside it is the same deck."], []).split("<h1>")[0]
        + "</body></html>",
        encoding="utf-8",
    )
    # The split above is clumsy if sheet() changes. Write a clean print file instead.
    (ROOT / "downloads" / "flashcards-print.html").write_text(
        f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">{CSP_META}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Webex flashcards</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 16px; color: #142033; }}
.card {{ break-inside: avoid; border: 1px solid #94a3b8; border-radius: 12px; padding: 12px; margin: 0 0 12px; }}
.src {{ color: #475569; font-size: 0.85rem; }}
footer {{ margin-top: 16px; font-size: 0.8rem; }}
</style></head><body>
<h1>Printable flashcards</h1>
<p>{len(CARDS)} cards with answers. Same data as flashcards.json.</p>
{cards_html}
<footer>
<p><strong>CypherMonkey · Webex Lab Free University</strong></p>
<p>Independent educational project. Not affiliated with or endorsed by any vendor. Trademarks belong to their owners. MIT code. CC BY-NC-SA content.</p>
<p><a href="https://cyphermonkeylabs.com">cyphermonkeylabs.com</a> · <a href="https://github.com/CypherMonkeyLabs">github.com/CypherMonkeyLabs</a> · <a href="https://cyphermonkeylabs.com">Report a concern</a> · <a href="https://cyphermonkeylabs.com">Work with us</a></p>
</footer></body></html>""",
        encoding="utf-8",
    )

    objects = "\n".join(
        f'<figure class="atlas-card"><iframe src="assets/diagrams/university/{slug}.svg" title="{html.escape(title)}"></iframe><figcaption>{html.escape(caption)}</figcaption></figure>'
        for slug, title, nodes, caption in DIAGRAMS
    )
    atlas = f"""
<p class="crumbs"><a href="index.html">Lab</a> / Ecosystem atlas</p>
<h1>Ecosystem atlas</h1>
<p class="lede">Calling, Contact Center, Meetings, Devices, Control Hub, workforce management, recording, emergency calling, analytics, and AI agents. Diagrams are study drawings. They are not Cisco architecture posters.</p>
<div class="atlas-grid">{objects}</div>
<h2>Control Hub</h2>
<p>The organization is the boundary for users, roles, locations, and services. A person you add starts without administrative privileges. <a href="rooms/T1-R01-control-hub-foundations.html">T1-R01</a>. <a href="https://help.webex.com/en-us/article/nuylwki/Control-Hub">Control Hub article</a>.</p>
<h2>Webex Calling</h2>
<p>Each location picks Cisco Calling Plan, Cloud Connected PSTN, or premises PSTN on a Local Gateway. Phones do not register through that gateway. <a href="rooms/T2-R01-calling-architecture.html">T2-R01</a> <a href="rooms/T2-R02-local-gateway-pstn.html">T2-R02</a>.</p>
<h2>Devices</h2>
<p>Claim by MAC or activation code. Firmware and activation use the device-configuration ports in the Calling port reference, including TCP 443 and 6970. <a href="rooms/T2-R04-devices-provisioning.html">T2-R04</a>.</p>
<h2>Meetings</h2>
<p>The Calling port reference tells suite customers to also allow the separate network-requirements article for Meetings and messaging. This atlas does not copy that matrix. <mark class="unverified">Meeting UDP ranges are not restated here.</mark> <a href="https://help.webex.com/article/b2exve">b2exve</a>.</p>
<h2>Webex Contact Center</h2>
<p>Multi-tenant: entry point, flow, queue, team. Enterprise is a different product with Router, Logger, PG, and CUIC. <a href="rooms/T3-R01-wxcc-multitenant-overview.html">T3-R01</a> <a href="rooms/T4-R01-wxcc-enterprise-overview.html">T4-R01</a>.</p>
<h2>Workforce management</h2>
<p>Forecast, schedule, and adherence live with WFO, not with Calling CDR. Article py6u9h scopes the listed WFO SKUs to Enterprise, CCE, and CCX. <mark class="unverified">Multi-tenant applicability is unverified.</mark> <a href="rooms/T3-R09-wfo-ai-features.html">T3-R09</a>.</p>
<h2>Recording and quality</h2>
<p>Select the Calling provider before you enable users. Webex recordings: one year, 100 GB. Dubber Go: 30 days. Recording disables Calling end-to-end encryption. Quality-management SKUs are a contact-center add-on, not that toggle. <a href="rooms/T2-R06-calling-security-compliance.html">T2-R06</a>.</p>
<h2>E911</h2>
<p>Port 443 to api.wxc.e911cloud.com and wxc.e911cloud.com. Test with 933. Do not prove the design by calling emergency services. <a href="ports.html">Ports page</a>.</p>
<h2>Analytics</h2>
<p>Control Hub analytics retention and the Calling troubleshooting view are different clocks. The Canon records a 21-day troubleshooting window and a longer analytics window for Pro Pack. <mark class="unverified">Re-check both live articles before you quote a retention number in a design.</mark> <a href="rooms/T1-R06-analytics-troubleshooting.html">T1-R06</a> <a href="rooms/T2-R08-calling-analytics-cdr.html">T2-R08</a> <a href="rooms/T3-R07-analyzer-reporting.html">T3-R07</a>.</p>
<h2>AI agents</h2>
<p>Virtual Agent–Voice, AI Assistant, and AI Agent Studio are different surfaces. A bring-your-own virtual agent escalates with <code>AGENT_TRANSFER</code>. <a href="rooms/T8-R05-ai-wxcc.html">T8-R05</a>.</p>
<h2>Integrations and future hooks</h2>
<p>Published connectors: Salesforce Lightning, Dynamics CIF, ServiceNow. No customer logo wall is drawn here, because this lab does not invent deployments. A future hook is a webhook or connector you have not turned on: recording events, Connect flows, and CRM screen pop. Build from the article, not from a peer-product column. <a href="rooms/T8-R03-apis-webhooks-connect.html">T8-R03</a> <a href="rooms/T8-R04-crm-integrations.html">T8-R04</a>.</p>
<h2 id="cites">Sources</h2>
<ul>
<li><a href="https://help.webex.com/article/b2exve">Port Reference for Cisco Webex Calling</a>, retrieved 2026-10-15. Revision history includes September 07, 2026.</li>
<li><a href="https://help.webex.com/article/av6oo3">Enhanced emergency calling for Webex Calling</a>.</li>
<li><a href="https://help.webex.com/article/nhvl4hw">Manage call recording for Webex Calling</a>.</li>
<li><a href="https://help.webex.com/article/5h5d8ab">End-to-end encryption for Webex Meetings and Webex Calling</a>.</li>
<li><a href="https://help.webex.com/article/n6gaghu">Configure Virtual Agent-Voice</a> and <a href="https://developer.webex.com/webex-contact-center/docs/bring-your-own-virtual-agent">bring your own virtual agent</a>.</li>
<li><a href="https://help.webex.com/article/py6u9h">Webex WFO feature-specific SKUs</a>.</li>
</ul>
"""
    (ROOT / "ecosystem-atlas.html").write_text(page("Ecosystem atlas", atlas), encoding="utf-8")

    gaps = """
<p class="crumbs"><a href="index.html">Lab</a> / Mastery map</p>
<h1>Mastery map</h1>
<p class="lede">Fundamentals through the hard edges. Every row has a place to read. Anything this lab will not pretend to know is marked unverified.</p>
<div class="table-wrap"><table>
<thead><tr><th>Section</th><th>Where</th><th>Status</th></tr></thead>
<tbody>
<tr><td>Fundamentals to advanced</td><td><a href="start.html">Start here</a> and tracks T1–T11</td><td>78 written rooms</td></tr>
<tr><td>Architecture</td><td><a href="rooms/T2-R01-calling-architecture.html">Calling</a>, <a href="rooms/T3-R01-wxcc-multitenant-overview.html">WxCC</a>, <a href="rooms/T4-R02-core-components.html">Enterprise</a>, <a href="rooms/T5-R02-di-architecture-peering.html">Dedicated Instance</a></td><td>In the rooms</td></tr>
<tr><td>Deployment</td><td><a href="rooms/T3-R02-tenant-provisioning-setup.html">WxCC setup</a>, <a href="rooms/T5-R03-connectivity-options.html">DI connectivity</a></td><td>In the rooms</td></tr>
<tr><td>Migration and cutover</td><td><a href="rooms/T6-R02-cucm-to-webex-calling.html">T6</a> and <a href="downloads/sheets/migration-cutover.html">checklist</a></td><td>Study checklist, not a runbook</td></tr>
<tr><td>Configuration walkthroughs</td><td>Each room's Config section, plus <a href="archive/webex-lab-v1/campus/index.html">archive studio</a></td><td>Archive keeps the click-path console</td></tr>
<tr><td>Troubleshooting</td><td><a href="drills.html">Cases</a>, <a href="downloads/sheets/troubleshooting.html">tree</a></td><td>Cited fixes</td></tr>
<tr><td>Ports and protocols</td><td><a href="ports.html">Mastery</a> and <a href="play.html">the port game</a></td><td>Checked against b2exve on 2026-10-15</td></tr>
<tr><td>BYOC, SIP trunks, PSTN</td><td><a href="rooms/T2-R02-local-gateway-pstn.html">T2-R02</a>, <a href="rooms/T7-R04-sip-trunk-design.html">T7-R04</a></td><td>Three location choices</td></tr>
<tr><td>WFM</td><td><a href="rooms/T3-R09-wfo-ai-features.html">T3-R09</a>, <a href="downloads/sheets/wfm.html">sheet</a></td><td>Multi-tenant SKU unverified</td></tr>
<tr><td>Recording and QM</td><td><a href="rooms/T2-R06-calling-security-compliance.html">T2-R06</a></td><td>Provider, retention, E2EE</td></tr>
<tr><td>E911</td><td><a href="ports.html#e911">Ports</a>, <a href="downloads/sheets/e911.html">sheet</a></td><td>Hosts and 933</td></tr>
<tr><td>Reporting and analytics</td><td><a href="rooms/T1-R06-analytics-troubleshooting.html">T1-R06</a>, <a href="rooms/T2-R08-calling-analytics-cdr.html">T2-R08</a>, <a href="rooms/T3-R07-analyzer-reporting.html">Analyzer</a>, <a href="rooms/T4-R07-reporting-cuic.html">CUIC</a></td><td>Clocks differ</td></tr>
<tr><td>CRM and APIs</td><td><a href="rooms/T8-R03-apis-webhooks-connect.html">T8-R03</a>, <a href="rooms/T8-R04-crm-integrations.html">T8-R04</a></td><td>Connectors cited</td></tr>
<tr><td>AI agents</td><td><a href="rooms/T8-R05-ai-wxcc.html">T8-R05</a></td><td>AGENT_TRANSFER</td></tr>
<tr><td>Security and compliance</td><td><a href="rooms/T1-R07-data-residency-security.html">T1-R07</a>, <a href="rooms/T2-R06-calling-security-compliance.html">T2-R06</a></td><td>TLS, SRTP, E2EE</td></tr>
<tr><td>Licensing and certifications</td><td><a href="certs.html">Cert tracker</a>, <a href="rooms/T1-R03-licensing-subscriptions.html">T1-R03</a></td><td>Names as of 2026-10-14</td></tr>
<tr><td>Roadmap, 2026</td><td><a href="rooms/T8-R08-latest-features-radar.html">T8-R08</a></td><td>Re-check the live what's-new page</td></tr>
<tr><td>Customer integrations</td><td><a href="ecosystem-atlas.html">Atlas</a></td><td>Patterns only. No invented customers.</td></tr>
<tr><td>Interview and career</td><td><a href="interviews.html">Interview prep</a>, <a href="certs.html">certs</a></td><td>Not a promise of a job or a score</td></tr>
</tbody></table></div>
<h2>Career path, without a salary myth</h2>
<p>A calling administrator who can defend a trunk, a dial plan, and 933 is useful on a Calling project. A contact-center engineer adds flows, queues, and Analyzer. Enterprise adds ICM script sense and CUIC. Dedicated Instance adds peering. Certifications are optional evidence. The Canon cert page records CLCOR plus one of CLACC, CLHCT, or CLCCE. Domain weights are not printed, because memorizing a percent is not the skill.</p>
"""
    (ROOT / "mastery.html").write_text(page("Mastery map", gaps), encoding="utf-8")

    ports_body = """
<p class="crumbs"><a href="index.html">Lab</a> / Ports</p>
<h1>Ports and protocols</h1>
<p class="lede">Taken from the Webex Calling port reference on 2026-10-15. The article's revision history shows the phone source range moving to 5060–5280 on September 07, 2026. IP subnets are intentionally not copied. They change, and the article says filtering by region can hurt the service.</p>
<div class="diagram"><iframe src="assets/diagrams/university/firewall-lanes.svg" title="Firewall lanes"></iframe></div>
<h2>Signaling</h2>
<div class="table-wrap"><table>
<thead><tr><th>Purpose</th><th>Source ports</th><th>Protocol</th><th>Destination ports</th></tr></thead>
<tbody>
<tr><td>Local gateway, devices, and the app toward Calling</td><td>Gateway 8000–65535. Phones 5060–5280. Room Series and the app are ephemeral.</td><td>TCP</td><td>5062 certificate trunk. 8934 registration trunk.</td></tr>
<tr><td>Calling back to a certificate local gateway</td><td>8934</td><td>TCP</td><td>The port you chose on the gateway.</td></tr>
<tr><td>Gateway toward your PSTN or Unified CM</td><td>8000–65535</td><td>TCP</td><td>Depends on that peer. The article's example is 5060 or 5061 for Unified CM.</td></tr>
</tbody></table></div>
<h2>Media</h2>
<div class="table-wrap"><table>
<thead><tr><th>Who</th><th>Source</th><th>Toward Calling</th></tr></thead>
<tbody>
<tr><td>Local gateway</td><td>UDP 8000–48199</td><td>5004, 9000, 8500–8699, 19560–65535</td></tr>
<tr><td>Devices, optimized</td><td>UDP 19560–19661</td><td>Same cloud destinations, or direct if ICE succeeds</td></tr>
<tr><td>Room Series</td><td>Audio 52050–52099. Video 52200–52299.</td><td>Cloud destinations</td></tr>
<tr><td>VG400 ATA</td><td>UDP 19560–19849</td><td>Cloud destinations</td></tr>
<tr><td>Webex App, optimized</td><td>Audio 8500–8599. Video 8600–8699.</td><td>Direct when ICE succeeds</td></tr>
</tbody></table></div>
<p>UDP with SRTP is the production media transport. The article says TCP and TLS media are not supported in production. The PSTN media row's example cell repeats 5060 and 5061. Those are signaling ports in the row above. <mark class="unverified">Do not open 5060 as RTP because that cell says so. Use the customer's media range and re-read the live row.</mark></p>
<h2 id="e911">Emergency, DNS, time, readiness</h2>
<ul>
<li>RedSky: port 443 to api.wxc.e911cloud.com and wxc.e911cloud.com.</li>
<li>DNS: UDP and TCP 53. NTP: UDP 123.</li>
<li>CScan: TCP 8934 and 443, UDP 19569–19760.</li>
<li>App configuration: TCP 443 and 8443. Device configuration and firmware: TCP 443, 6970, and 80.</li>
</ul>
<h2>Ladder</h2>
<div class="diagram"><iframe src="assets/diagrams/university/calling-registration.svg" title="Registration ladder"></iframe></div>
<div class="diagram"><iframe src="assets/diagrams/university/e911-held.svg" title="Emergency ladder"></iframe></div>
<p>SIP ALG off. NAT must translate overlapping phone source ports in 5060–5280. Default MTU 1500. <a href="play.html">Practice the ports</a>. <a href="https://help.webex.com/article/b2exve">Open the live article</a>.</p>
"""
    (ROOT / "ports.html").write_text(page("Ports and protocols", ports_body), encoding="utf-8")

    cards_js = json.dumps([{"q": a, "a": b, "s": c} for a, b, c in CARDS])
    play = f"""
<p class="crumbs"><a href="index.html">Lab</a> / Play</p>
<h1>Play lab</h1>
<p class="lede">A port game, a flow map, a call-flow sandbox, a daily question, badges, and a card you can save. Scores stay in this browser.</p>
<div class="play-grid">
<section class="play-card" id="ports-game">
<h2>Port match</h2>
<p class="score-line" data-port-score>0 / 8</p>
<div data-port-q></div>
<div class="choice-row" data-port-choices></div>
</section>
<section class="play-card" id="daily">
<h2>Daily challenge</h2>
<p data-daily-q></p>
<div class="choice-row" data-daily-choices></div>
<p data-daily-result></p>
</section>
<section class="play-card">
<h2>Badges</h2>
<div class="badge-grid" data-badges></div>
</section>
<section class="play-card">
<h2>Share card</h2>
<p>The image names this lab and links the reader to cyphermonkeylabs.com.</p>
<canvas id="share-card" width="1200" height="630" hidden></canvas>
<button type="button" data-share>Download result card</button>
</section>
</div>
<h2>Flow map</h2>
<div class="map-explorer" id="flow-map"></div>
<p data-map-note>Choose a node.</p>
<h2>Build a call flow</h2>
<p>Start Flow stays first. End on Queue Contact or Disconnect. A Menu needs a node after it.</p>
<div class="flow-palette choice-row">
<button type="button" data-add="Play Message">Play Message</button>
<button type="button" data-add="Menu">Menu</button>
<button type="button" data-add="Queue Contact">Queue Contact</button>
<button type="button" data-add="Disconnect">Disconnect</button>
<button type="button" data-flow-reset>Reset</button>
<button type="button" data-flow-check>Check</button>
</div>
<div class="flow-lane" data-flow-lane></div>
<p data-flow-result></p>
<script>
(function () {{
  var bank = {cards_js};
  var quiz = bank.slice(0, 8);
  var score = 0;
  var qAt = 0;
  var qEl = document.querySelector("[data-port-q]");
  var cEl = document.querySelector("[data-port-choices]");
  var sEl = document.querySelector("[data-port-score]");
  function award(id) {{
    if (window.CANON_UNIVERSITY) window.CANON_UNIVERSITY.award(id);
  }}
  function ask() {{
    var item = quiz[qAt];
    qEl.textContent = item.q;
    var options = [item.a, "UDP 5060 only", "TCP 80 to the PSAP", "A Control Hub theme"].sort(function () {{ return Math.random() - 0.5; }});
    cEl.innerHTML = "";
    options.forEach(function (label) {{
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function () {{
        var ok = label === item.a;
        b.classList.add(ok ? "is-right" : "is-wrong");
        if (ok) {{
          Array.prototype.forEach.call(cEl.querySelectorAll("button"), function (btn) {{ btn.disabled = true; }});
          score += 1;
          sEl.textContent = score + " / " + quiz.length;
          qAt += 1;
          if (qAt >= quiz.length) {{
            qEl.textContent = "Set complete. Source: " + item.s;
            cEl.innerHTML = "";
            if (score === quiz.length) award("ports-perfect");
            award("ports-played");
            paintBadges();
          }} else setTimeout(ask, 400);
        }}
      }});
      cEl.appendChild(b);
    }});
  }}
  ask();
  var day = Math.floor(Date.now() / 86400000);
  var daily = bank[day % bank.length];
  document.querySelector("[data-daily-q]").textContent = daily.q;
  var wrongs = ["Not in the article", "A LinkedIn setting", "Port 0"];
  var choices = [daily.a].concat(wrongs);
  var seed = day;
  function rand() {{ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }}
  for (var i = choices.length - 1; i > 0; i--) {{
    var j = Math.floor(rand() * (i + 1));
    var tmp = choices[i];
    choices[i] = choices[j];
    choices[j] = tmp;
  }}
  var dEl = document.querySelector("[data-daily-choices]");
  choices.forEach(function (label) {{
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", function () {{
      var ok = label === daily.a;
      document.querySelector("[data-daily-result]").textContent = ok ? "Correct. " + daily.s : "Answer: " + daily.a + " (" + daily.s + ")";
      if (ok) award("daily");
      paintBadges();
    }});
    dEl.appendChild(b);
  }});
  var nodes = [
    ["Phone", "Registers to Webex Calling. It does not register through the Local Gateway."],
    ["Control Hub", "Where the location, number, and trunk exist."],
    ["Local Gateway", "Premises PSTN edge. Certificate TCP 5062 or registration TCP 8934."],
    ["PSTN", "Cisco Calling Plan, Cloud Connected PSTN, or your carrier."],
    ["RedSky", "TCP 443 to the two emergency hosts. 933 is the test."]
  ];
  var map = document.getElementById("flow-map");
  var note = document.querySelector("[data-map-note]");
  var svg = '<svg viewBox="0 0 980 220" role="img" aria-label="Clickable calling map">';
  svg += '<rect width="980" height="220" rx="16" fill="#0b1020"/>';
  nodes.forEach(function (node, i) {{
    var x = 30 + i * 190;
    svg += '<a href="#flow-map" data-i="' + i + '"><rect x="' + x + '" y="70" width="170" height="64" rx="14" fill="#22d3ee"/><text x="' + (x + 85) + '" y="108" text-anchor="middle" fill="#082f49" font-size="16" font-family="system-ui,sans-serif">' + node[0] + '</text></a>';
  }});
  svg += "</svg>";
  map.innerHTML = svg;
  map.querySelectorAll("a").forEach(function (a) {{
    a.addEventListener("click", function (event) {{
      event.preventDefault();
      note.textContent = nodes[Number(a.getAttribute("data-i"))][1];
      award("map");
      paintBadges();
    }});
  }});
  var flow = ["Start Flow"];
  var lane = document.querySelector("[data-flow-lane]");
  function paintFlow() {{
    lane.innerHTML = flow.map(function (name) {{ return '<span class="flow-node">' + name + '</span>'; }}).join("");
  }}
  paintFlow();
  document.querySelectorAll("[data-add]").forEach(function (btn) {{
    btn.addEventListener("click", function () {{
      flow.push(btn.getAttribute("data-add"));
      paintFlow();
    }});
  }});
  document.querySelector("[data-flow-reset]").addEventListener("click", function () {{
    flow = ["Start Flow"];
    paintFlow();
    document.querySelector("[data-flow-result]").textContent = "";
  }});
  document.querySelector("[data-flow-check]").addEventListener("click", function () {{
    var end = flow[flow.length - 1];
    var menuAt = flow.indexOf("Menu");
    var ok = flow[0] === "Start Flow" && (end === "Queue Contact" || end === "Disconnect") && (menuAt === -1 || menuAt < flow.length - 1);
    document.querySelector("[data-flow-result]").textContent = ok ? "The sandbox accepts this trace. It is still not a published Flow Designer flow." : "Keep Start Flow first, put something after a Menu, and end on Queue Contact or Disconnect.";
    if (ok) {{ award("flow"); paintBadges(); }}
  }});
  var catalog = [
    ["first-room", "Opened a room"],
    ["ten-rooms", "Ten rooms"],
    ["all-rooms", "All 78 rooms"],
    ["ports-played", "Played the port set"],
    ["ports-perfect", "Port set, no miss"],
    ["daily", "Daily challenge"],
    ["map", "Used the flow map"],
    ["flow", "Built a valid sandbox flow"],
    ["offline", "Saved pages offline"],
    ["konami", "Banana trunk"]
  ];
  function paintBadges() {{
    var bag = {{}};
    try {{ bag = JSON.parse(localStorage.getItem("canon-badges") || "{{}}"); }} catch (e) {{}}
    document.querySelector("[data-badges]").innerHTML = catalog.map(function (item) {{
      var on = bag[item[0]] ? " is-on" : "";
      return '<article class="badge' + on + '"><strong>' + item[1] + '</strong><small>' + (bag[item[0]] ? "Earned" : "Locked") + '</small></article>';
    }}).join("");
  }}
  paintBadges();
  document.addEventListener("canon-badge", paintBadges);
  document.querySelector("[data-share]").addEventListener("click", function () {{
    var canvas = document.getElementById("share-card");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#07111f";
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(0, 0, 16, 630);
    ctx.fillStyle = "#e8f4ff";
    ctx.font = "700 64px system-ui,sans-serif";
    ctx.fillText("Webex Lab", 64, 180);
    ctx.font = "36px system-ui,sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Port score " + score + " / " + quiz.length, 64, 280);
    ctx.fillText("cyphermonkeylabs.com", 64, 420);
    ctx.fillText("Independent study lab. Not a Cisco product.", 64, 480);
    var link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "webex-lab-result.png";
    link.click();
    award("share");
    paintBadges();
  }});
}})();
"""
    play_html, play_js = play.split("<script>\n", 1)
    (ROOT / "assets/js/play.js").write_text(play_js, encoding="utf-8")
    play = play_html + '<script src="assets/js/play.js"></script>\n'
    (ROOT / "play.html").write_text(page("Play lab", play), encoding="utf-8")

    sheet_links = "".join(
        f'<article class="sheet-card"><h2>{html.escape(title)}</h2><p><a href="downloads/sheets/{slug}.html">HTML</a> · <a href="downloads/sheets/{slug}.svg">SVG</a> · <a href="downloads/sheets/{slug}.pdf">PDF</a> · <a href="downloads/sheets/{slug}.png">PNG</a></p></article>'
        for slug, (title, paragraphs, rows) in SHEETS.items()
    )
    downloads = f"""
<p class="crumbs"><a href="index.html">Lab</a> / Cheat Codes</p>
<h1>Cheat Codes</h1>
<p class="lede">One-page sheets, a printable flashcard deck, and a zip of this site. Nothing here is hosted on a vendor CDN. Print a sheet to PDF from the browser if you need a PDF. SVG is the image form of the same page.</p>
<p class="lab-actions"><a class="ghost" href="downloads/webex-university-offline.zip">Full offline bundle</a> <a class="ghost" href="downloads/flashcards.json">Flashcards JSON</a> <a class="ghost" href="downloads/flashcards-print.html">Printable flashcards</a></p>
<div class="sheet-grid">{sheet_links}</div>
<h2>What is not in the bundle</h2>
<p>Cisco help articles and Cisco Live PDFs stay on Cisco's sites. These sheets paraphrase and link. They do not reproduce those documents.</p>
"""
    (ROOT / "downloads.html").write_text(page("Cheat Codes", downloads), encoding="utf-8")

    manifest = [
        "index.html", "start.html", "mastery.html", "ports.html", "play.html",
        "downloads.html", "ecosystem.html", "ecosystem-atlas.html", "labs.html",
        "glossary.html", "flashcards.html", "quizzes.html", "certs.html",
        "assets/css/canon.css", "assets/css/shell.css", "assets/css/university.css",
        "assets/js/shell.js", "assets/js/canon.js", "assets/js/university.js",
        "assets/js/search-index.js", "assets/js/study-index.js", "assets/js/redesign.js",
        "sw.js",
    ]
    manifest += [f"assets/diagrams/university/{slug}.svg" for slug, *_ in DIAGRAMS]
    manifest += [f"downloads/sheets/{slug}.html" for slug in SHEETS]
    (ROOT / "downloads" / "cache-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    old = 'if(t!=="aurora"&&t!=="neon"&&t!=="sunset"&&t!=="paper")t="aurora";'
    new = 'if(t!=="aurora"&&t!=="futuristic"&&t!=="gaming"&&t!=="neon"&&t!=="sunset"&&t!=="paper")t="aurora";'
    for path in ROOT.rglob("*.html"):
        if "archive" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        if old in text:
            path.write_text(text.replace(old, new), encoding="utf-8")

    eco = ROOT / "ecosystem.html"
    eco_text = eco.read_text(encoding="utf-8")
    needle = '<div class="orientation">'
    insert = '<p><a class="btn" href="ecosystem-atlas.html">Open the university atlas</a> Calling, Contact Center, Meetings, Devices, Control Hub, WFM, recording, E911, analytics, and AI agents, with animated diagrams.</p>\n'
    if "ecosystem-atlas.html" not in eco_text and needle in eco_text:
        eco.write_text(eco_text.replace(needle, insert + needle, 1), encoding="utf-8")

    home = ROOT / "index.html"
    home_text = home.read_text(encoding="utf-8")
    if "mastery.html" not in home_text:
        home_text = home_text.replace(
            '<a class="ghost" href="ecosystem.html">🌐 Ecosystem Map</a>',
            '<a class="ghost" href="ecosystem.html">🌐 Ecosystem Map</a> <a class="ghost" href="mastery.html">🧭 Mastery</a> <a class="ghost" href="play.html">🎮 Play</a> <a class="ghost" href="downloads.html">⬇️ Cheat Codes</a>',
        )
        home.write_text(home_text, encoding="utf-8")
    print(f"diagrams {len(DIAGRAMS)} sheets {len(SHEETS)} cards {len(CARDS)}")


if __name__ == "__main__":
    main()
