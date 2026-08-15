"""Minimal PDF content-stream -> SVG converter for the Roamigos logo.
Handles: q/Q, cm, m/l/c/v/y/h/re, f/f*/b/B/S/n, W/W*, rg/RG/g/G/k/K, gs, Do (Form XObject).
Text (Tj) is skipped -- wordmark is rebuilt with a webfont.
"""
import re, zlib, sys

PDF = r"C:\Customers\Roamigos Hostel\roamigos-hostel\Roamigos 9.pdf"
data = open(PDF, "rb").read()

# ---- object table -------------------------------------------------------
raw_objs = {}
for m in re.finditer(rb"(?<![0-9])(\d+)\s+(\d+)\s+obj\b", data):
    num = int(m.group(1))
    start = m.end()
    end = data.find(b"endobj", start)
    raw_objs[num] = data[start:end]

def stream_of(num):
    body = raw_objs[num]
    i = body.find(b"stream")
    if i == -1:
        return None
    j = i + len(b"stream")
    if body[j:j+2] == b"\r\n": j += 2
    elif body[j:j+1] in (b"\n", b"\r"): j += 1
    k = body.rfind(b"endstream")
    raw = body[j:k]
    dic = body[:i]
    if b"/FlateDecode" in dic:
        try: return zlib.decompress(raw)
        except Exception: return zlib.decompressobj().decompress(raw)
    return raw

def dict_of(num):
    body = raw_objs[num]
    i = body.find(b"stream")
    return (body[:i] if i != -1 else body).decode("latin-1")

# ---- page ---------------------------------------------------------------
page = dict_of(6)
media = [float(x) for x in re.search(r"/MediaBox\[([^\]]+)\]", page).group(1).split()]
contents = [int(x) for x in re.findall(r"(\d+) 0 R", re.search(r"/Contents\[([^\]]+)\]", page).group(1))]
res_xobj = dict(re.findall(r"/(Fm\d+)\s+(\d+) 0 R", page))

content = b"\n".join(stream_of(n) for n in contents)

# ---- tokenizer ----------------------------------------------------------
TOK = re.compile(rb"""
    (?P<num>-?\d*\.?\d+)
  | (?P<name>/[^\s/\[\]<>(){}]+)
  | (?P<str>\((?:\\.|[^\\()])*\))
  | (?P<hex><[0-9A-Fa-f\s]*>)
  | (?P<arr>[\[\]])
  | (?P<dictop><<|>>)
  | (?P<op>[A-Za-z'\"*]+)
""", re.X)

def tokens(buf):
    for m in TOK.finditer(buf):
        kind = m.lastgroup
        yield kind, m.group()

def mat_mul(a, b):
    a0,a1,a2,a3,a4,a5 = a; b0,b1,b2,b3,b4,b5 = b
    return (a0*b0+a1*b2, a0*b1+a1*b3, a2*b0+a3*b2, a2*b1+a3*b3, a4*b0+a5*b2+b4, a4*b1+a5*b3+b5)

def apply(m, x, y):
    return (m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5])

def hexcol(r, g, b):
    return "#%02X%02X%02X" % (round(r*255), round(g*255), round(b*255))

def fnum(v):
    # 1 decimal is ~0.06% of the 160-unit artboard: visually lossless, ~40% smaller.
    s = ("%.1f" % v).rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"

ext_gs = dict(re.findall(r"/(GS\d+)\s+(\d+) 0 R", page))
gs_alpha = {}
for k, v in ext_gs.items():
    d = dict_of(int(v))
    m = re.search(r"/ca\s+([\d.]+)", d)
    gs_alpha[k] = float(m.group(1)) if m else 1.0

out = []

def run(buf, ctm, depth=0):
    stack = []
    st = {"ctm": ctm, "fill": "#000000", "stroke": "#000000", "lw": 1.0, "alpha": 1.0}
    ops = []
    path = []           # list of subpath strings in device space
    cur = None
    start = None
    pending_clip = False

    def d_of():
        return " ".join(path)

    def emit(fill, stroke):
        if not path: return
        a = st["alpha"]
        attrs = []
        attrs.append('fill="%s"' % (st["fill"] if fill else "none"))
        if fill and st.get("evenodd"): attrs.append('fill-rule="evenodd"')
        if stroke:
            attrs.append('stroke="%s"' % st["stroke"])
            sc = (abs(st["ctm"][0]) + abs(st["ctm"][3])) / 2 or 1
            attrs.append('stroke-width="%s"' % fnum(st["lw"] * sc))
        if a < 1: attrs.append('opacity="%s"' % fnum(a))
        out.append('<path %s d="%s"/>' % (" ".join(attrs), d_of()))

    for kind, tok in tokens(buf):
        if kind in ("num",):
            ops.append(float(tok)); continue
        if kind in ("name",):
            ops.append(tok.decode("latin-1")[1:]); continue
        if kind in ("str", "hex", "arr", "dictop"):
            ops.append(tok); continue
        op = tok.decode("latin-1")

        if op == "q":
            stack.append(dict(st)); ops = []
        elif op == "Q":
            if stack: st = stack.pop()
            ops = []
        elif op == "cm":
            st["ctm"] = mat_mul(tuple(ops[-6:]), st["ctm"]); ops = []
        elif op == "gs":
            st["alpha"] = gs_alpha.get(ops[-1], 1.0) if ops else 1.0; ops = []
        elif op == "w":
            st["lw"] = ops[-1]; ops = []
        elif op == "rg":
            st["fill"] = hexcol(*ops[-3:]); ops = []
        elif op == "RG":
            st["stroke"] = hexcol(*ops[-3:]); ops = []
        elif op == "g":
            v = ops[-1]; st["fill"] = hexcol(v, v, v); ops = []
        elif op == "G":
            v = ops[-1]; st["stroke"] = hexcol(v, v, v); ops = []
        elif op == "k":
            c, m_, y_, k_ = ops[-4:]
            st["fill"] = hexcol(max(0,1-min(1,c+k_)), max(0,1-min(1,m_+k_)), max(0,1-min(1,y_+k_))); ops = []
        elif op == "K":
            c, m_, y_, k_ = ops[-4:]
            st["stroke"] = hexcol(max(0,1-min(1,c+k_)), max(0,1-min(1,m_+k_)), max(0,1-min(1,y_+k_))); ops = []
        elif op == "m":
            x, y = apply(st["ctm"], ops[-2], ops[-1])
            path.append("M%s %s" % (fnum(x), fnum(y))); cur = (ops[-2], ops[-1]); start = cur; ops = []
        elif op == "l":
            x, y = apply(st["ctm"], ops[-2], ops[-1])
            path.append("L%s %s" % (fnum(x), fnum(y))); cur = (ops[-2], ops[-1]); ops = []
        elif op == "c":
            p = ops[-6:]
            a = apply(st["ctm"], p[0], p[1]); b = apply(st["ctm"], p[2], p[3]); c3 = apply(st["ctm"], p[4], p[5])
            path.append("C%s %s %s %s %s %s" % (fnum(a[0]), fnum(a[1]), fnum(b[0]), fnum(b[1]), fnum(c3[0]), fnum(c3[1])))
            cur = (p[4], p[5]); ops = []
        elif op == "v":
            p = ops[-4:]
            a = apply(st["ctm"], cur[0], cur[1]); b = apply(st["ctm"], p[0], p[1]); c3 = apply(st["ctm"], p[2], p[3])
            path.append("C%s %s %s %s %s %s" % (fnum(a[0]), fnum(a[1]), fnum(b[0]), fnum(b[1]), fnum(c3[0]), fnum(c3[1])))
            cur = (p[2], p[3]); ops = []
        elif op == "y":
            p = ops[-4:]
            a = apply(st["ctm"], p[0], p[1]); c3 = apply(st["ctm"], p[2], p[3])
            path.append("C%s %s %s %s %s %s" % (fnum(a[0]), fnum(a[1]), fnum(c3[0]), fnum(c3[1]), fnum(c3[0]), fnum(c3[1])))
            cur = (p[2], p[3]); ops = []
        elif op == "h":
            path.append("Z"); cur = start; ops = []
        elif op == "re":
            x, y, w, h = ops[-4:]
            pts = [apply(st["ctm"], x, y), apply(st["ctm"], x+w, y), apply(st["ctm"], x+w, y+h), apply(st["ctm"], x, y+h)]
            path.append("M%s %sL%s %sL%s %sL%s %sZ" % tuple(fnum(v) for p in pts for v in p))
            ops = []
        elif op in ("W", "W*"):
            pending_clip = True; ops = []
        elif op in ("f", "F", "f*", "b", "b*", "B", "B*", "S", "s", "n"):
            st["evenodd"] = op.endswith("*")
            if op in ("f", "F", "f*"): emit(True, False)
            elif op in ("B", "B*", "b", "b*"): emit(True, True)
            elif op in ("S", "s"): emit(False, True)
            path = []; pending_clip = False; ops = []
        elif op == "Do":
            name = ops[-1] if ops else None
            if name in res_xobj and depth < 6:
                num = int(res_xobj[name])
                d = dict_of(num)
                mm = re.search(r"/Matrix\[([^\]]+)\]", d)
                m6 = tuple(float(x) for x in mm.group(1).split()) if mm else (1,0,0,1,0,0)
                run(stream_of(num), mat_mul(m6, st["ctm"]), depth+1)
            ops = []
        elif op in ("BT",):
            ops = []
        elif op in ("ET",):
            ops = []
        else:
            ops = []

# flip y: PDF origin bottom-left -> SVG top-left
W = media[2] - media[0]; H = media[3] - media[1]
run(content, (1, 0, 0, -1, -media[0], media[3]))

svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" fill="none">\n' % (fnum(W), fnum(H))
       + "\n".join(out) + "\n</svg>\n")
open(sys.argv[1], "w", encoding="utf-8").write(svg)
print("paths:", len(out), "bytes:", len(svg))
