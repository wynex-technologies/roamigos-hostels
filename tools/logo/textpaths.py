import re, zlib, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

PDF = r"C:\Customers\Roamigos Hostel\roamigos-hostel\Roamigos 9.pdf"
data = open(PDF, "rb").read()
objs = {}
for m in re.finditer(rb"(?<![0-9])(\d+)\s+(\d+)\s+obj\b", data):
    n = int(m.group(1)); s = m.end(); e = data.find(b"endobj", s); objs[n] = data[s:e]

def stream(n):
    b = objs[n]; i = b.find(b"stream"); j = i + 6
    if b[j:j+2] == b"\r\n": j += 2
    elif b[j:j+1] in (b"\n", b"\r"): j += 1
    k = b.rfind(b"endstream")
    raw = b[j:k]
    return zlib.decompress(raw) if b"/FlateDecode" in b[:i] else raw

font = TTFont(io.BytesIO(stream(18)))   # FontFile2
gs = font.getGlyphSet()
upem = font["head"].unitsPerEm
cmap = font.getBestCmap()

text = "Travellers Hostel"
kern_after = {2: 5, 3: 9, 6: 10, 11: 17.9}   # index -> extra advance removed (TJ, thousandths)
# TJ: [(Tra)5 (v)9 (ell)10 (H)17.9 ...] -> value SUBTRACTED after that run
runs = [("Tra", 5), ("v", 9), ("ell", 10), ("ers H", 17.9), ("ostel", 0)]

size = 8.9011
x0, y0 = 45.6104, 22.3262
PAGE_H = 160.0

hmtx = font["hmtx"]
parts = []
pen_x = 0.0   # in text-space thousandths

for run, adj in runs:
    for ch in run:
        gname = cmap.get(ord(ch))
        if gname is None:
            pen_x += 250; continue
        # transform: glyph units -> text space (size/upem), then flip y for SVG, then translate
        scale = size / upem
        t = (Transform()
             .translate(x0 + pen_x / 1000.0 * size, PAGE_H - y0)   # place baseline (SVG y down)
             .scale(scale, -scale))
        pen = SVGPathPen(gs, ntos=lambda v: ("%.2f" % v).rstrip("0").rstrip("."))
        tpen = TransformPen(pen, t)
        gs[gname].draw(tpen)
        d = pen.getCommands()
        if d.strip():
            parts.append(d)
        pen_x += hmtx[gname][0] / upem * 1000.0
    pen_x -= adj

print('<g fill="#D9A328">')
for d in parts:
    print('<path d="%s"/>' % d)
print("</g>")
