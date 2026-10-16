#!/usr/bin/env python3
"""Palette-quantize the diagram PNGs so the downloads stay light. Run after build-downloads.mjs."""
import pathlib
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
for p in sorted((root / "downloads/diagrams").glob("*.png")):
    im = Image.open(p).convert("RGB")
    im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(p, optimize=True)
