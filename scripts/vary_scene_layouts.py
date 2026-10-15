#!/usr/bin/env python3
"""Give each tall diagram its own layout. Reads the title, caption, and hop labels already in the file."""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "assets" / "diagrams" / "university"

LAYOUTS = [
    ("corners", [(300, 300), (900, 300), (300, 680), (900, 680)]),
    ("diamond", [(600, 230), (920, 470), (600, 720), (280, 470)]),
    ("spine", [(600, 240), (600, 400), (600, 560), (600, 720)]),
    ("stairs-right", [(260, 250), (480, 400), (720, 550), (960, 700)]),
    ("stairs-left", [(960, 250), (720, 400), (480, 550), (260, 700)]),
    ("hub", [(600, 470), (300, 270), (900, 270), (600, 720)]),
    ("arc", [(240, 640), (430, 320), (770, 320), (960, 640)]),
    ("cascade", [(280, 280), (500, 400), (720, 520), (940, 660)]),
    ("left-rail", [(280, 250), (280, 410), (280, 570), (280, 730)]),
    ("right-rail", [(920, 250), (920, 410), (920, 570), (920, 730)]),
    ("zigzag", [(300, 270), (900, 390), (300, 530), (900, 700)]),
    ("n-path", [(280, 260), (280, 700), (920, 260), (920, 700)]),
    ("z-path", [(280, 270), (920, 270), (280, 700), (920, 700)]),
    ("plus", [(600, 240), (300, 480), (900, 480), (600, 720)]),
    ("funnel", [(250, 260), (950, 260), (420, 700), (780, 700)]),
    ("fan", [(260, 700), (460, 520), (700, 380), (960, 250)]),
    ("spiral", [(760, 280), (940, 520), (560, 720), (280, 460)]),
    ("wave", [(230, 420), (470, 270), (730, 560), (980, 340)]),
    ("layers", [(340, 620), (520, 500), (700, 380), (880, 260)]),
    ("ellipse", [(860, 360), (700, 680), (340, 620), (280, 340)]),
    ("pairs", [(340, 300), (860, 300), (340, 660), (860, 660)]),
    ("pyramid", [(600, 240), (400, 500), (800, 500), (600, 720)]),
    ("slash", [(280, 300), (500, 420), (720, 540), (940, 680)]),
    ("clock", [(600, 230), (900, 470), (600, 720), (300, 470)]),
    ("river", [(260, 300), (800, 380), (340, 560), (900, 700)]),
    ("column-split", [(600, 240), (360, 480), (840, 480), (600, 720)]),
    ("shelf", [(280, 660), (500, 660), (720, 660), (960, 420)]),
    ("constellation", [(250, 340), (620, 220), (980, 420), (540, 700)]),
]

PALETTES = [
    ("#082f49", "#312e81", "#701a75", "#22d3ee", "#a5b4fc", "#fbbf24", "#fb7185", "#67e8f9"),
    ("#134e4a", "#0f766e", "#854d0e", "#5eead4", "#fde68a", "#86efac", "#fcd34d", "#99f6e4"),
    ("#4c1d95", "#6d28d9", "#9d174d", "#c4b5fd", "#f9a8d4", "#fde68a", "#fb7185", "#e9d5ff"),
    ("#7c2d12", "#b45309", "#9f1239", "#fdba74", "#fecdd3", "#fde68a", "#fb7185", "#fed7aa"),
    ("#1e3a8a", "#0369a1", "#0f766e", "#7dd3fc", "#5eead4", "#fef08a", "#2dd4bf", "#bae6fd"),
    ("#365314", "#166534", "#854d0e", "#bef264", "#86efac", "#fde047", "#facc15", "#d9f99d"),
    ("#831843", "#9d174d", "#6b21a8", "#f9a8d4", "#e9d5ff", "#fde68a", "#d8b4fe", "#fbcfe8"),
    ("#0c4a6e", "#155e75", "#9a3412", "#67e8f9", "#fdba74", "#fef08a", "#fb923c", "#a5f3fc"),
    ("#3b0764", "#6d28d9", "#0e7490", "#d8b4fe", "#22d3ee", "#fde68a", "#a78bfa", "#99f6e4"),
    ("#1c1917", "#44403c", "#9f1239", "#fcd34d", "#fb7185", "#e7e5e4", "#f97316", "#fecdd3"),
    ("#042f2e", "#115e59", "#1d4ed8", "#2dd4bf", "#93c5fd", "#fef08a", "#38bdf8", "#99f6e4"),
    ("#451a03", "#9a3412", "#7c2d12", "#fdba74", "#fca5a5", "#fde68a", "#fb7185", "#fed7aa"),
    ("#172554", "#1e40af", "#6d28d9", "#60a5fa", "#c4b5fd", "#fde68a", "#818cf8", "#bfdbfe"),
    ("#3f6212", "#4d7c0f", "#0f766e", "#a3e635", "#5eead4", "#fef08a", "#34d399", "#d9f99d"),
    ("#4a044e", "#86198f", "#9f1239", "#f0abfc", "#fb7185", "#fde68a", "#e879f9", "#fbcfe8"),
    ("#082f49", "#0e7490", "#a16207", "#22d3ee", "#facc15", "#fef9c3", "#f59e0b", "#a5f3fc"),
    ("#111827", "#1f2937", "#0369a1", "#38bdf8", "#f472b6", "#fde68a", "#818cf8", "#7dd3fc"),
    ("#14532d", "#166534", "#1e3a8a", "#4ade80", "#93c5fd", "#fde68a", "#22d3ee", "#bbf7d0"),
    ("#7f1d1d", "#b91c1c", "#9a3412", "#fca5a5", "#fdba74", "#fde68a", "#fb7185", "#fecaca"),
    ("#1e1b4b", "#3730a3", "#0f766e", "#a5b4fc", "#5eead4", "#fde68a", "#22d3ee", "#c7d2fe"),
    ("#3f3f46", "#52525b", "#a21caf", "#e4e4e7", "#e879f9", "#fde68a", "#f472b6", "#f5d0fe"),
    ("#134e4a", "#155e75", "#7c2d12", "#2dd4bf", "#fdba74", "#fef08a", "#fb923c", "#99f6e4"),
    ("#312e81", "#4338ca", "#9d174d", "#818cf8", "#fb7185", "#fde68a", "#c084fc", "#c7d2fe"),
    ("#064e3b", "#047857", "#854d0e", "#34d399", "#fbbf24", "#fef9c3", "#f59e0b", "#a7f3d0"),
    ("#0f172a", "#1e293b", "#0369a1", "#38bdf8", "#f8fafc", "#fbbf24", "#22d3ee", "#bae6fd"),
    ("#581c87", "#7e22ce", "#0e7490", "#d8b4fe", "#22d3ee", "#fde68a", "#a78bfa", "#e9d5ff"),
    ("#713f12", "#a16207", "#9f1239", "#fcd34d", "#fb7185", "#fef3c7", "#f97316", "#fde68a"),
    ("#0c4a6e", "#1d4ed8", "#6d28d9", "#38bdf8", "#818cf8", "#f0abfc", "#fde68a", "#bfdbfe"),
]


def read_labels(text):
    title = ""
    caption = ""
    hops = []
    for attrs, body in re.findall(r"<text([^>]*)>([^<]*)</text>", text):
        size_match = re.search(r'font-size="(\d+)"', attrs)
        size = int(size_match.group(1)) if size_match else 0
        body = html.unescape(body).strip()
        if size >= 32 and not title:
            title = body
        elif size >= 17 and not caption and "Study drawing" not in body and not body.startswith("Hop "):
            caption = body
        elif body.startswith("Hop ") or "Study drawing" in body:
            continue
        elif size >= 15:
            hops.append(body)
    return title or "Diagram", caption, hops[:4]


def motif(index, accent):
    kind = index % 7
    if kind == 0:
        lines = "\n".join(
            '<line x1="{0}" y1="150" x2="{1}" y2="820" />'.format(60 + i * 80, 20 + i * 86)
            for i in range(14)
        )
        return '<g opacity="0.28" stroke="{0}" stroke-width="1">{1}</g>'.format(accent, lines)
    if kind == 1:
        dots = "\n".join(
            '<circle cx="{0}" cy="{1}" r="3" fill="{2}"/>'.format(80 + (i % 12) * 90, 180 + (i // 12) * 90, accent)
            for i in range(60)
        )
        return '<g opacity="0.35">{0}</g>'.format(dots)
    if kind == 2:
        rings = "\n".join(
            '<ellipse cx="600" cy="500" rx="{0}" ry="{1}" fill="none" stroke="{2}" stroke-width="2"/>'.format(80 + i * 70, 50 + i * 46, accent)
            for i in range(6)
        )
        return '<g opacity="0.35">{0}</g>'.format(rings)
    if kind == 3:
        beams = "\n".join(
            '<line x1="0" y1="{0}" x2="1200" y2="{1}" />'.format(i * 90, 200 + i * 70)
            for i in range(10)
        )
        return '<g opacity="0.22" stroke="{0}" stroke-width="8">{1}</g>'.format(accent, beams)
    if kind == 4:
        return (
            '<g opacity="0.3" fill="none" stroke="{0}" stroke-width="3">'
            '<path d="M600 180 L980 420 L820 780 L380 780 L220 420 Z"/>'
            '<path d="M600 260 L860 430 L760 700 L440 700 L340 430 Z"/>'
            "</g>"
        ).format(accent)
    if kind == 5:
        bands = "\n".join(
            '<rect x="0" y="{0}" width="1200" height="18" fill="{1}"/>'.format(200 + i * 80, accent)
            for i in range(7)
        )
        return '<g opacity="0.16">{0}</g>'.format(bands)
    spokes = "\n".join(
        '<line x1="600" y1="480" x2="{0}" y2="{1}" />'.format(600 + int(520 * __import__("math").cos(i)), 480 + int(340 * __import__("math").sin(i)))
        for i in [n * 0.52 for n in range(12)]
    )
    return '<g opacity="0.28" stroke="{0}" stroke-width="2">{1}</g>'.format(accent, spokes)


def card(cx, cy, label, num, fill, wide):
    width = 340 if wide else 250
    height = 96
    x = cx - width / 2
    y = cy - height / 2
    size = 15 if len(label) > 24 else 17 if len(label) > 16 else 20
    return (
        '<g class="hop">'
        '<rect x="{sx}" y="{sy}" width="{w}" height="{h}" rx="18" fill="#020617" opacity="0.42"/>'
        '<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="{fill}"/>'
        '<rect x="{x}" y="{y}" width="{w}" height="24" rx="12" fill="#ffffff" opacity="0.28"/>'
        '<text x="{cx}" y="{ty}" text-anchor="middle" fill="#082f49" font-size="{fs}" font-family="system-ui,sans-serif" font-weight="800">{label}</text>'
        '<text x="{cx}" y="{hy}" text-anchor="middle" fill="#082f49" font-size="13" font-family="system-ui,sans-serif" font-weight="700">Hop {num}</text>'
        "</g>"
    ).format(
        sx=x + 8, sy=y + 12, x=x, y=y, w=width, h=height, fill=fill,
        cx=cx, ty=y + 54, fs=size, label=html.escape(label), hy=y + 78, num=num,
    )


def caption_lines(caption):
    text = " ".join(caption.split())
    if len(text) <= 88:
        return [text]
    cut = text.rfind(" ", 0, 88)
    if cut < 36:
        cut = 88
    second = text[cut:].strip()
    if len(second) > 88:
        second = second[:85].rstrip() + "..."
    return [text[:cut], second]


def scene(index, title, caption, hops):
    name, points = LAYOUTS[index]
    sky = PALETTES[index]
    wide = name in ("spine", "left-rail", "right-rail")
    while len(hops) < 4:
        hops.append("Hop")
    hops = hops[:4]
    centers = []
    cards = []
    fills = sky[3:7]
    for i, (cx, cy) in enumerate(points):
        centers.append((cx, cy))
        cards.append(card(cx, cy, hops[i], i + 1, fills[i], wide))
    commands = ["M {0} {1}".format(centers[0][0], centers[0][1])]
    for cx, cy in centers[1:]:
        commands.append("L {0} {1}".format(cx, cy))
    motion = " ".join(commands)
    drift_y = 12 + (index % 5) * 4
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" data-layout="{name}" role="img" aria-label="{title}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{s0}"/><stop offset="0.55" stop-color="{s1}"/><stop offset="1" stop-color="{s2}"/></linearGradient>
<filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1200" height="900" fill="url(#sky)"/>
<g opacity="0.5">
<animateTransform attributeName="transform" type="translate" values="0 0; 0 {drift}; 0 0" dur="{dur}s" repeatCount="indefinite"/>
<circle cx="{c1x}" cy="150" r="110" fill="{a}" opacity="0.22"/>
<circle cx="{c2x}" cy="240" r="80" fill="{b}" opacity="0.2"/>
<circle cx="640" cy="780" r="130" fill="{c}" opacity="0.14"/>
</g>
<g>
<animateTransform attributeName="transform" type="translate" values="0 0; -16 10; 0 0" dur="18s" repeatCount="indefinite"/>
{motif}
</g>
<text x="64" y="68" fill="#f8fafc" font-size="40" font-family="system-ui,sans-serif" font-weight="800">{title}</text>
{caption_svg}
<path d="{motion}" fill="none" stroke="{packet}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
{cards}
<g filter="url(#glow)">
<animateMotion dur="{speed}s" repeatCount="indefinite" path="{motion}"/>
<circle r="16" fill="{packet}" opacity="0.55"/>
<circle r="7" fill="#ffffff"/>
</g>
<text x="64" y="860" fill="#bae6fd" font-size="16" font-family="system-ui,sans-serif">Study drawing. Read the room before you treat a hop as a product limit.</text>
</svg>
""".format(
        name=name,
        title=html.escape(title),
        caption_svg="\n".join(
            '<text x="64" y="{y}" fill="#e0f2fe" font-size="18" font-family="system-ui,sans-serif">{line}</text>'.format(
                y=104 + i * 24, line=html.escape(line)
            )
            for i, line in enumerate(caption_lines(caption))
        ),
        s0=sky[0], s1=sky[1], s2=sky[2],
        a=sky[3], b=sky[4], c=sky[5], packet=sky[6],
        drift=drift_y,
        dur=11 + (index % 6),
        c1x=140 + (index * 37) % 280,
        c2x=860 + (index * 23) % 220,
        motif=motif(index, sky[7]),
        motion=html.escape(motion),
        cards="\n".join(cards),
        speed=4.5 + (index % 5) * 0.7,
    )


def main():
    paths = sorted(DIR.glob("*.svg"))
    if len(paths) != len(LAYOUTS):
        raise SystemExit("expected {0} diagrams, found {1}".format(len(LAYOUTS), len(paths)))
    motions = set()
    for index, path in enumerate(paths):
        title, caption, hops = read_labels(path.read_text(encoding="utf-8"))
        if len(hops) < 4:
            raise SystemExit("short hops in {0}: {1}".format(path.name, hops))
        drawn = scene(index, title, caption, hops)
        motion = re.search(r'<animateMotion[^>]* path="([^"]+)"', drawn).group(1)
        if motion in motions:
            raise SystemExit("duplicate motion " + path.name)
        motions.add(motion)
        if "animateMotion" not in drawn or 'viewBox="0 0 1200 900"' not in drawn:
            raise SystemExit("missing scene parts " + path.name)
        path.write_text(drawn, encoding="utf-8")
    print("layouts", len(paths), "unique", len(motions))


if __name__ == "__main__":
    main()
