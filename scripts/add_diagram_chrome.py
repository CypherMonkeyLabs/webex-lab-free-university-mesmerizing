#!/usr/bin/env python3
"""Give every standalone diagram page (downloads/diagrams/*.html) the lab chrome:
large top bar + menu, sidebar, footer, and the Guide Bot (loaded by shell.js).
Chrome is cut from a built track page so the links stay in step with the site.
Idempotent: pages that already carry the chrome are skipped."""
import glob
import io
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
SRC = io.open(ROOT + "/tracks/T1/index.html", encoding="utf-8").read()

head_src = SRC[SRC.index("<head>") + 6:SRC.index("</head>")]
head_src = re.sub(r"<meta property=\"og:(title|description)\"[^>]*>\n?", "", head_src)
head_src = re.sub(r"<title>.*?</title>\n?", "", head_src, flags=re.S)
head_src = re.sub(r'<meta charset[^>]*>\n?', "", head_src, flags=re.I)
head_src = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?', "", head_src)
head_src = re.sub(r'<script src="[^"]*theme-boot(?:-lite)?\.js"></script>\n?', "", head_src)
header = SRC[SRC.index('<header class="topbar"'):SRC.index("</header>") + len("</header>")]
footer = SRC[SRC.index('<footer class="site-footer'):SRC.index("</footer>") + len("</footer>")]
scripts = "".join(re.findall(r'<script defer src="\.\./\.\./assets/js/[^"]+"></script>\n', SRC))

STYLE = """<style>
.dg-main{display:grid;gap:16px;justify-items:center;padding-top:20px;padding-bottom:28px}
.dg-main h1{margin:0;font-size:clamp(1.2rem,3vw,1.8rem);text-align:center}
.dg-main .frame{width:min(1100px,100%);border-radius:22px;padding:6px;background:conic-gradient(from 0deg,#22d3ee,#a78bfa,#f472b6,#fde047,#22d3ee);box-shadow:0 0 40px #a78bfa88,0 0 80px #22d3ee44}
.dg-main .frame svg{display:block;width:100%;height:auto;border-radius:17px}
.dg-main article{width:min(1100px,100%)}
@media(prefers-reduced-motion:no-preference){.dg-main .frame{animation:dgfloat 7s ease-in-out infinite}}
@keyframes dgfloat{50%{transform:translateY(-6px)}}
</style>"""


def convert(html):
    if 'class="topbar"' in html:
        return html
    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
    h1 = re.search(r"<h1>.*?</h1>", html, re.S).group(0)
    start = html.index('<div class="frame">')
    art_end = html.index("</article>") + len("</article>")
    body_core = html[start:art_end]
    own_scripts = "".join(re.findall(r"<script(?![^>]*src)[^>]*>.*?</script>", html, re.S))
    return (
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' blob: data:; font-src \'self\' data:; connect-src \'self\'; worker-src \'self\' blob:; object-src \'none\'; base-uri \'self\'; form-action \'self\'">\n'
        '<script src="../../assets/js/theme-boot.js"></script>\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta property="og:title" content="%s">\n<meta property="og:image" content="../../assets/og-card.svg">\n'
        "<title>%s</title>%s\n%s\n</head>\n"
        '<body class="v4" data-room="diagram">\n<a class="skip" href="#main">Skip to content</a>\n'
        '<div class="v4-app"><aside class="v4-sidebar" id="v4-sidebar" data-sidebar></aside><div class="v4-stage">\n'
        "%s\n"
        '<main id="main" class="wrap dg-main">\n%s\n%s\n</main>\n%s\n'
        '<aside class="v4-toc" id="v4-toc" aria-label="On this page"></aside></div></div>\n'
        "%s%s</body></html>\n"
    ) % (title, title, head_src, STYLE, header, h1, body_core, footer, scripts, own_scripts)


count = 0
for path in sorted(glob.glob(ROOT + "/downloads/diagrams/*.html")):
    old = io.open(path, encoding="utf-8").read()
    new = convert(old)
    if new != old:
        io.open(path, "w", encoding="utf-8").write(new)
        count += 1
print("converted", count)
