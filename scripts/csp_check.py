#!/usr/bin/env python3
"""CSP readiness check for the Webex lab.

Fails (exit 1) if a loaded URL (script/img/iframe/src, stylesheet, css url(),
js import/fetch/Worker) points off-origin. Ordinary <a href> citations are not loads.
Archive snapshots and node_modules are out of scope.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SKIP = {"archive", "node_modules", ".git"}
fail = []
load_patterns = [
    (r'<(?:script|img|iframe|source|video|audio)[^>]+\bsrc="(https?://[^"]+)"', "html src"),
    (r'<link[^>]+href="(https?://[^"]+)"', "html link"),
    (r'url\(\s*["\']?(https?://[^)"\']+)', "css url()"),
    (r'@import\s+["\'](https?://[^"\']+)', "css @import"),
    (r'\bimport\s*(?:\(|[^;]*from\s*)["\'](https?://[^"\']+)', "js import"),
    (r'\bfetch\(\s*["\'`](https?://[^"\'`]+)', "js fetch"),
    (r'new (?:Worker|WebSocket|EventSource)\(\s*["\'`](https?://[^"\'`]+)', "js net"),
]

files = []
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if any(part in SKIP for part in path.relative_to(ROOT).parts):
        continue
    if path.suffix.lower() not in {".html", ".css", ".js", ".mjs"}:
        continue
    files.append(path)

for f in files:
    text = f.read_text(errors="replace")
    for pat, kind in load_patterns:
        for match in re.finditer(pat, text):
            fail.append(f"{f.relative_to(ROOT)}: off-origin {kind}: {match.group(1)}")

print("files scanned:", len(files))
for item in fail:
    print("FAIL", item)
print("csp_check:", len(fail), "off-origin loads")
sys.exit(1 if fail else 0)
