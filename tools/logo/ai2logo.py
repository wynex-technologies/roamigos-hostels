"""Roamigos final.ai -> per-layer SVG/PNG.

The .ai is PDF-1.6 compatible: one 160x160 page whose content stream is five
/OC ... BDC ... EMC blocks, one per Illustrator layer, all pure vector paths.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "Roamigos final.ai")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "logo")

data = open(SRC, "rb").read()

# ---- objects ------------------------------------------------------------
import zlib
raw = {}
for m in re.finditer(rb"(?<![0-9])(\d+)\s+(\d+)\s+obj\b", data):
    raw[int(m.group(1))] = data[m.end():data.find(b"endobj", m.end())]

def stream_of(num):
    body = raw[num]
    i = body.find(b"stream")
    j = i + 6
    if body[j:j+2] == b"\r\n": j += 2
    elif body[j:j+1] in (b"\n", b"\r"): j += 1
    s = body[j:body.rfind(b"endstream")]
    return zlib.decompress(s) if b"/FlateDecode" in body[:i] else s

# page 6? find the /Type/Page object
page_num = next(n for n, b in raw.items() if re.search(rb"/Type\s*/Page(?![a-zA-Z])", b) and b"/MediaBox" in b)
page = raw[page_num].decode("latin-1")
media = [float(x) for x in re.search(r"/MediaBox\s*\[([^\]]+)\]", page).group(1).split()]
contents = [int(x) for x in re.findall(r"(\d+)\s+0\s+R", re.search(r"/Contents\s*(\d+\s+0\s+R|\[[^\]]+\])", page).group(1))]
props = dict((k, int(v)) for k, v in re.findall(r"/(MC\d+)\s+(\d+)\s+0\s+R", page))
content = b"\n".join(stream_of(n) for n in contents)

# OCG name per xref
ocg_name = {}
for n, b in raw.items():
    t = b.decode("latin-1", "replace")
    if "/Type/OCG" in t.replace(" ", ""):
        m = re.search(r"/Name\s*\(([^)]*)\)", t)
        if m: ocg_name[n] = m.group(1)
layer_of = {mc: ocg_name.get(x, mc) for mc, x in props.items()}

# ---- tokenizer ----------------------------------------------------------
TOK = re.compile(rb"""
    (?P<num>-?\d*\.?\d+)
  | (?P<name>/[^\s/\[\]<>(){}]+)
  | (?P<str>\((?:\.|[^\()])*\))
  | (?P<arr>[\[\]])
  | (?P<op>[A-Za-z'"*]+)
""", re.X)

def mul(a, b):
    return (a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3],
            a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5])

def ap(m, x, y):
    return (m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5])

def hexc(vals):
    if len(vals) >= 4:
        c, mg, y, k = vals[-4:]
        rgb = (1-min(1, c+k), 1-min(1, mg+k), 1-min(1, y+k))
    elif len(vals) == 3:
        rgb = tuple(vals)
    elif len(vals) == 1:
        rgb = (vals[0],)*3
    else:
        rgb = (0, 0, 0)
    return "#%02X%02X%02X" % tuple(round(max(0, min(1, v))*255) for v in rgb)

def fn(v):
    s = ("%.2f" % v).rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"

# ---- interpret ----------------------------------------------------------
shapes = []          # {oc, d, fill, stroke, sw, op, eo, bbox}
FLIP = (1, 0, 0, -1, -media[0], media[3])

def bez(p0, p1, p2, p3, box):
    for i in range(0, 25):
        t = i/24.0; u = 1-t
        x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0]
        y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]
        box[0] = min(box[0], x); box[1] = min(box[1], y)
        box[2] = max(box[2], x); box[3] = max(box[3], y)

alpha_of = {}
for k, v in re.findall(r"/(GS\d+)\s+(\d+)\s+0\s+R", page):
    d = raw[int(v)].decode("latin-1")
    m = re.search(r"/ca\s+([\d.]+)", d)
    alpha_of[k] = float(m.group(1)) if m else 1.0


# ---- embedded fonts (Illustrator leaves the tagline as live text) --------
import io as _io
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.qu2cuPen import Qu2CuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

fonts = {}
for fname, fnum in re.findall(r"/(TT\d+|T\d+_\d+|F\d+)\s+(\d+)\s+0\s+R", page):
    fd = raw[int(fnum)].decode("latin-1")
    m = re.search(r"/FontDescriptor\s+(\d+)\s+0\s+R", fd)
    if not m:
        continue
    desc = raw[int(m.group(1))].decode("latin-1")
    m2 = re.search(r"/FontFile2?3?\s+(\d+)\s+0\s+R", desc)
    if not m2:
        continue
    tt = TTFont(_io.BytesIO(stream_of(int(m2.group(1)))))
    fonts[fname] = {"gs": tt.getGlyphSet(), "upem": tt["head"].unitsPerEm,
                    "cmap": tt.getBestCmap(), "hmtx": tt["hmtx"]}
print("fonts:", list(fonts))

ts = {"tm": (1, 0, 0, 1, 0, 0), "font": None, "size": 1.0}

def unesc(b):
    s = b[1:-1]
    out, i = bytearray(), 0
    while i < len(s):
        c = s[i]
        if c == 0x5C and i+1 < len(s):
            n = s[i+1]
            out.append({0x6E: 10, 0x72: 13, 0x74: 9}.get(n, n)); i += 2
        else:
            out.append(c); i += 1
    return out.decode("cp1252", "replace")

def draw_text(items):
    """TrueType glyph outlines -> the same M/L/C/Z path grammar the vector paths use.

    Qu2CuPen(all_cubic=True) turns the quadratics into cubics so the SVG and the
    PDF re-render below can share one parser.
    """
    f = fonts.get(ts["font"])
    if not f:
        return
    gs_, upem, cmap, hmtx = f["gs"], f["upem"], f["cmap"], f["hmtx"]
    size = ts["size"]
    base = mul(ts["tm"], st["ctm"])
    pen_x = 0.0
    d_all, bb = [], newbox()

    def note(x, y):
        bb[0] = min(bb[0], x); bb[1] = min(bb[1], y)
        bb[2] = max(bb[2], x); bb[3] = max(bb[3], y)

    for it in items:
        if isinstance(it, float):
            pen_x -= it/1000.0*size
            continue
        if not (isinstance(it, bytes) and it.startswith(b"(")):
            continue
        for ch in unesc(it):
            g = cmap.get(ord(ch))
            if g is None:
                pen_x += 0.25*size
                continue
            k = size/upem
            t = Transform(*mul((k, 0, 0, k, pen_x, 0), base))
            rec = RecordingPen()
            gs_[g].draw(TransformPen(Qu2CuPen(rec, 0.001, all_cubic=True), t))
            cur = None
            for verb, args in rec.value:
                if verb == "moveTo":
                    x, y = args[0]; note(x, y)
                    d_all.append("M%s %s" % (fn(x), fn(y))); cur = (x, y)
                elif verb == "lineTo":
                    x, y = args[0]; note(x, y)
                    d_all.append("L%s %s" % (fn(x), fn(y))); cur = (x, y)
                elif verb == "curveTo":
                    a, b_, c_ = args[-3:]
                    if cur: bez(cur, a, b_, c_, bb)
                    d_all.append("C%s %s %s %s %s %s" % (fn(a[0]), fn(a[1]), fn(b_[0]),
                                                         fn(b_[1]), fn(c_[0]), fn(c_[1])))
                    cur = c_
                elif verb == "closePath":
                    d_all.append("Z")
            pen_x += hmtx[g][0]/upem*size
    if d_all:
        shapes.append({"oc": oc, "d": "".join(d_all), "fill": st["fill"], "stroke": None,
                       "sw": 0, "a": st["a"], "eo": False, "bbox": bb})

st = {"ctm": FLIP, "fill": "#000000", "stroke": "#000000", "lw": 1.0, "a": 1.0}
stack, ops = [], []
path, box, cur, start = [], None, None, None
oc = None
eo = False

def newbox():
    return [1e9, 1e9, -1e9, -1e9]

def pt(x, y):
    p = ap(st["ctm"], x, y)
    box[0] = min(box[0], p[0]); box[1] = min(box[1], p[1])
    box[2] = max(box[2], p[0]); box[3] = max(box[3], p[1])
    return p

def emit(fill, stroke):
    if not path or box[2] < box[0]:
        return
    sc = (abs(st["ctm"][0]) + abs(st["ctm"][3]))/2 or 1
    sw = st["lw"]*sc
    b = list(box)
    if stroke:
        b = [b[0]-sw/2, b[1]-sw/2, b[2]+sw/2, b[3]+sw/2]
    shapes.append({"oc": oc, "d": "".join(path), "fill": st["fill"] if fill else None,
                   "stroke": st["stroke"] if stroke else None, "sw": sw,
                   "a": st["a"], "eo": eo, "bbox": b})

box = newbox()
for m in TOK.finditer(content):
    kind, tok = m.lastgroup, m.group()
    if kind == "num":
        ops.append(float(tok)); continue
    if kind == "name":
        ops.append(tok.decode("latin-1")[1:]); continue
    if kind in ("str", "arr"):
        ops.append(tok); continue
    op = tok.decode("latin-1")
    if op == "BDC":
        oc = ops[-1] if ops and isinstance(ops[-1], str) else oc; ops = []
    elif op == "EMC":
        oc = None; ops = []
    elif op == "q":
        stack.append(dict(st)); ops = []
    elif op == "Q":
        if stack: st = stack.pop()
        ops = []
    elif op == "cm":
        st["ctm"] = mul(tuple(ops[-6:]), st["ctm"]); ops = []
    elif op == "gs":
        st["a"] = alpha_of.get(ops[-1], 1.0) if ops else 1.0; ops = []
    elif op == "w":
        st["lw"] = ops[-1]; ops = []
    elif op in ("scn", "sc", "rg", "g", "k"):
        nums = [o for o in ops if isinstance(o, float)]
        if nums: st["fill"] = hexc(nums)
        ops = []
    elif op in ("SCN", "SC", "RG", "G", "K"):
        nums = [o for o in ops if isinstance(o, float)]
        if nums: st["stroke"] = hexc(nums)
        ops = []
    elif op == "m":
        p = pt(ops[-2], ops[-1]); path.append("M%s %s" % (fn(p[0]), fn(p[1])))
        cur = (ops[-2], ops[-1]); start = cur; ops = []
    elif op == "l":
        p = pt(ops[-2], ops[-1]); path.append("L%s %s" % (fn(p[0]), fn(p[1])))
        cur = (ops[-2], ops[-1]); ops = []
    elif op in ("c", "v", "y"):
        if op == "c":
            a, b_, c_ = (ops[-6], ops[-5]), (ops[-4], ops[-3]), (ops[-2], ops[-1])
        elif op == "v":
            a, b_, c_ = cur, (ops[-4], ops[-3]), (ops[-2], ops[-1])
        else:
            a, b_, c_ = (ops[-4], ops[-3]), (ops[-2], ops[-1]), (ops[-2], ops[-1])
        A, B, C = ap(st["ctm"], *a), ap(st["ctm"], *b_), ap(st["ctm"], *c_)
        bez(ap(st["ctm"], *cur), A, B, C, box)
        path.append("C%s %s %s %s %s %s" % (fn(A[0]), fn(A[1]), fn(B[0]), fn(B[1]), fn(C[0]), fn(C[1])))
        cur = c_; ops = []
    elif op == "h":
        path.append("Z"); cur = start; ops = []
    elif op == "re":
        x, y, w, h = ops[-4:]
        q = [pt(x, y), pt(x+w, y), pt(x+w, y+h), pt(x, y+h)]
        path.append("M%s %sL%s %sL%s %sL%s %sZ" % tuple(fn(v) for p in q for v in p))
        cur = (x, y); start = cur; ops = []
    elif op in ("W", "W*"):
        ops = []
    elif op in ("f", "F", "f*", "b", "b*", "B", "B*", "S", "s", "n"):
        eo = op.endswith("*")
        if op in ("f", "F", "f*"): emit(True, False)
        elif op in ("B", "B*", "b", "b*"): emit(True, True)
        elif op in ("S", "s"): emit(False, True)
        path, box, cur = [], newbox(), None
        ops = []
    elif op == "BT":
        ts["tm"] = (1, 0, 0, 1, 0, 0); ops = []
    elif op == "Tf":
        ts["font"], ts["size"] = ops[-2], ops[-1]; ops = []
    elif op == "Tm":
        ts["tm"] = tuple(ops[-6:]); ops = []
    elif op in ("Td", "TD"):
        ts["tm"] = mul((1, 0, 0, 1, ops[-2], ops[-1]), ts["tm"]); ops = []
    elif op in ("Tj", "TJ", "'", '"'):
        if op == "TJ":
            i = max(j for j, o in enumerate(ops) if o == b"[") if b"[" in ops else -1
            items = ops[i+1:]
        else:
            items = [ops[-1]]
        draw_text(items)
        ops = []
    else:
        ops = []


# ------------------------------------------------------------------ parts
W, H = media[2] - media[0], media[3] - media[1]

for i, s in enumerate(shapes):
    s["i"] = i
    lyr = layer_of.get(s["oc"], s["oc"])
    if lyr == "Layer 6":
        # the first cream fill is the full-bleed artboard square, not the disc
        s["part"] = "bg" if (s["bbox"][0] <= 0.01 and s["bbox"][2] >= W - 0.01) else "disc"
    elif lyr == "Flamingo":
        s["part"] = "flamingo"
    elif lyr == "Roamigos Font 2":
        s["part"] = "script"
    elif lyr == "ROAMIGOS FONT 1":
        s["part"] = "block"
    else:  # Travellers hostel font 1 - the pin is the tittle of the block wordmark
        s["part"] = "pin" if s["bbox"][3] < 120 else "tagline"

from collections import Counter
print("shapes:", len(shapes), dict(Counter(s["part"] for s in shapes)))
print("colours:", sorted({s["fill"] or s["stroke"] for s in shapes}))

# ---------------------------------------------------------------- compose
import fitz

VARIANTS = [
    ("roamigos-logo-primary",       ["disc", "flamingo", "script"],           True,
     "Final lockup - ring, flamingo, script wordmark, serif tagline"),
    ("roamigos-logo-primary-cream", ["bg", "disc", "flamingo", "script"],     True,
     "Final lockup on the solid cream square"),
    ("roamigos-logo-block",         ["disc", "flamingo", "block", "pin", "tagline"], True,
     "Same badge with the bold ROAMIGOS wordmark"),
    ("roamigos-logo-stacked",       ["flamingo", "script"],                   False,
     "Flamingo over the script wordmark, no ring"),
    ("roamigos-logo-stacked-block", ["flamingo", "block", "pin", "tagline"],  False,
     "Flamingo over the bold wordmark, no ring"),
    ("roamigos-badge-flamingo",     ["disc", "flamingo"],                     True,
     "Flamingo inside the ring - avatar / app-icon mark"),
    ("roamigos-mark-flamingo",      ["flamingo"],                             False,
     "Flamingo with backpack, nothing else"),
    ("roamigos-wordmark-script",    ["script"],                               False,
     "Script Roamigos, mustard rules, serif tagline"),
    ("roamigos-wordmark-block",     ["block", "pin"],                         False,
     "ROAMIGOS in bold sans with the pin tittle"),
    ("roamigos-tagline",            ["tagline"],                              False,
     "Travellers Hostel on its own"),
    ("roamigos-badge-ring",         ["disc"],                                 True,
     "Empty cream disc with the maroon hairline ring"),
]

os.makedirs(os.path.join(OUT, "svg"), exist_ok=True)
os.makedirs(os.path.join(OUT, "png"), exist_ok=True)

PATH_TOK = re.compile(r"([MLCZ])([-\d. ]*)")

def to_pdf_path(d):
    out = []
    for op, args in PATH_TOK.findall(d):
        v = [float(x) for x in args.split()]
        if op == "M":
            out.append("%s %s m" % (fn(v[0]), fn(media[3]-v[1])))
        elif op == "L":
            out.append("%s %s l" % (fn(v[0]), fn(media[3]-v[1])))
        elif op == "C":
            out.append("%s %s %s %s %s %s c" % (fn(v[0]), fn(media[3]-v[1]), fn(v[2]),
                                                fn(media[3]-v[3]), fn(v[4]), fn(media[3]-v[5])))
        else:
            out.append("h")
    return "\n".join(out)

def rgb(hx):
    return " ".join(fn(int(hx[i:i+2], 16)/255.0) for i in (1, 3, 5))

def to_pdf_stream(picked):
    out = []
    for s in picked:
        out.append("q")
        if s["fill"]: out.append("%s rg" % rgb(s["fill"]))
        if s["stroke"]:
            out.append("%s RG" % rgb(s["stroke"]))
            out.append("%s w" % fn(s["sw"]))
            out.append("1 j")
        out.append(to_pdf_path(s["d"]))
        out.append(("f*" if s["eo"] else "f") if s["fill"] and not s["stroke"]
                   else ("S" if s["stroke"] and not s["fill"] else "B"))
        out.append("Q")
    return ("\n".join(out) + "\n").encode("latin-1")

def viewbox(picked, square):
    if square:
        return (0, 0, W, H)
    x0 = min(s["bbox"][0] for s in picked); y0 = min(s["bbox"][1] for s in picked)
    x1 = max(s["bbox"][2] for s in picked); y1 = max(s["bbox"][3] for s in picked)
    pad = 1.0
    return (x0-pad, y0-pad, (x1-x0)+2*pad, (y1-y0)+2*pad)

def to_svg(picked, vb):
    body = []
    for s in picked:
        a = ['fill="%s"' % (s["fill"] or "none")]
        if s["fill"] and s["eo"]: a.append('fill-rule="evenodd"')
        if s["stroke"]:
            a += ['stroke="%s"' % s["stroke"], 'stroke-width="%s"' % fn(s["sw"]),
                  'stroke-linejoin="round"']
        if s["a"] < 1: a.append('opacity="%s"' % fn(s["a"]))
        body.append('  <path %s d="%s"/>' % (" ".join(a), s["d"]))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s %s %s %s" width="%s" '
            'height="%s" fill="none">\n%s\n</svg>\n'
            % (fn(vb[0]), fn(vb[1]), fn(vb[2]), fn(vb[3]), fn(vb[2]), fn(vb[3]),
               "\n".join(body)))

rows = []
for name, parts, square, note in VARIANTS:
    picked = [s for s in shapes if s["part"] in parts]
    vb = viewbox(picked, square)
    open(os.path.join(OUT, "svg", name + ".svg"), "w", encoding="utf-8").write(to_svg(picked, vb))

    doc = fitz.open(SRC)
    doc.update_stream(contents[0], to_pdf_stream(picked))
    pg = doc[0]
    # PyMuPDF rectangles are top-left origin, which is exactly the SVG viewBox space
    pg.set_cropbox(fitz.Rect(vb[0], vb[1], vb[0]+vb[2], vb[1]+vb[3]))
    opaque = "bg" in parts
    for px in (512, 1024, 2048):
        z = px / max(vb[2], vb[3])
        pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=not opaque).save(
            os.path.join(OUT, "png", "%s-%d.png" % (name, px)))
    doc.close()
    rows.append((name, "%s x %s" % (fn(vb[2]), fn(vb[3])), note))
    print("%-30s %s" % (name, note))

open(os.path.join(OUT, "manifest.txt"), "w", encoding="utf-8").write(
    "".join("%-30s %-16s %s\n" % r for r in rows))
