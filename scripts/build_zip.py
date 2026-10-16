#!/usr/bin/env python3
"""Zip the whole site for offline use. Run after build-downloads.mjs."""
import zipfile, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
dest = root / "downloads/webex-university-offline.zip"
skip = {".git", "node_modules", ".github"}
skip_dirs = ("docs/screenshots",)
with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(root.rglob("*")):
        rel = p.relative_to(root)
        if p.is_dir() or rel.parts[0] in skip or p == dest or str(rel).startswith(skip_dirs):
            continue
        z.write(p, str(rel))
print(dest.stat().st_size, "bytes")
