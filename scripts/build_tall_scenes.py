#!/usr/bin/env python3
"""Redraw university diagrams as tall 4:3 scenes. Keeps the cited caption and hop labels."""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "assets" / "diagrams" / "university"
COLORS = ["#22d3ee", "#a5b4fc", "#fbbf24", "#fb7185", "#34d399", "#f0abfc"]


def hops_from(text):
    labels = [html.unescape(item).strip() for item in re.findall(r"<text[^>]*>([^<]*)</text>", text)]
    labels = [item for item in labels if item]
    title = labels[0] if labels else "Diagram"
    caption = labels[1] if len(labels) > 1 else ""
    nodes = labels[2:] if len(labels) > 2 else [title]
    # Keep the drawing readable. Four to six hops fill a tall scene.
    if len(nodes) > 6:
        nodes = nodes[:6]
    return title, caption, nodes


def scene(title, caption, nodes):
    n = len(nodes)
    positions = []
    for i in range(n):
        col = i % 2
        row = i // 2
        x = 250 + col * 500
        y = 230 + row * 210
        positions.append((x, y))
    parts = []
    cursor = None
    path_cmds = []
    for index, (x, y) in enumerate(positions):
        if cursor is None:
            path_cmds.append("M {0} {1}".format(x, y + 36))
        else:
            path_cmds.append("C {0} {1} {2} {3} {4} {5}".format(
                cursor[0], cursor[1] + 90, x, y - 70, x, y + 36
            ))
        cursor = (x, y + 36)
    motion = " ".join(path_cmds)
    cards = []
    for index, (x, y) in enumerate(positions):
        color = COLORS[index % len(COLORS)]
        label = nodes[index]
        cards.append(
            '<g class="hop">'
            '<rect x="{x}" y="{sy}" width="300" height="108" rx="22" fill="#020617" opacity="0.45"/>'
            '<rect x="{x}" y="{y}" width="300" height="108" rx="22" fill="{color}"/>'
            '<rect x="{ix}" y="{iy}" width="300" height="28" rx="14" fill="#ffffff" opacity="0.28"/>'
            '<text x="{tx}" y="{ty}" text-anchor="middle" fill="#082f49" font-size="20" font-family="system-ui,sans-serif" font-weight="800">{label}</text>'
            '<text x="{nx}" y="{ny}" text-anchor="middle" fill="#082f49" font-size="13" font-family="system-ui,sans-serif" font-weight="700">Hop {num}</text>'
            "</g>".format(
                x=x - 170, sy=y + 18, y=y, color=color, ix=x - 170, iy=y,
                tx=x - 20, ty=y + 62, label=html.escape(label),
                nx=x - 20, ny=y + 86, num=index + 1,
            )
        )
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="{title}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#082f49"/><stop offset="0.5" stop-color="#312e81"/><stop offset="1" stop-color="#701a75"/></linearGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1200" height="900" fill="url(#sky)"/>
<g opacity="0.55">
<animateTransform attributeName="transform" type="translate" values="0 0; 0 18; 0 0" dur="14s" repeatCount="indefinite"/>
<circle cx="180" cy="160" r="90" fill="#22d3ee" opacity="0.25"/>
<circle cx="980" cy="220" r="120" fill="#f472b6" opacity="0.2"/>
<circle cx="640" cy="760" r="140" fill="#fbbf24" opacity="0.16"/>
</g>
<g opacity="0.35" stroke="#67e8f9" stroke-width="1">
<animateTransform attributeName="transform" type="translate" values="0 0; -12 8; 0 0" dur="18s" repeatCount="indefinite"/>
{grid}
</g>
<text x="64" y="72" fill="#f8fafc" font-size="40" font-family="system-ui,sans-serif" font-weight="800">{title}</text>
<text x="64" y="112" fill="#e0f2fe" font-size="18" font-family="system-ui,sans-serif">{caption}</text>
<path d="{motion}" fill="none" stroke="#fde68a" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
{cards}
<g filter="url(#glow)">
<animateMotion dur="6.5s" repeatCount="indefinite" path="{motion}"/>
<circle r="18" fill="#fde68a" opacity="0.45"/>
<circle r="8" fill="#ffffff"/>
</g>
<text x="64" y="860" fill="#bae6fd" font-size="16" font-family="system-ui,sans-serif">Study drawing. Read the room before you treat a hop as a product limit.</text>
</svg>
""".format(
        title=html.escape(title),
        caption=html.escape(caption[:150]),
        motion=html.escape(motion),
        cards="\n".join(cards),
        grid="\n".join(
            '<line x1="{0}" y1="140" x2="{1}" y2="820" />'.format(80 + i * 70, 40 + i * 78)
            for i in range(16)
        ),
    )


def main():
    count = 0
    for path in sorted(DIR.glob("*.svg")):
        raw = path.read_text(encoding="utf-8")
        if 'viewBox="0 0 1200 900"' in raw:
            continue
        title, caption, nodes = hops_from(raw)
        path.write_text(scene(title, caption, nodes), encoding="utf-8")
        count += 1
    print("scenes", count)


if __name__ == "__main__":
    main()
