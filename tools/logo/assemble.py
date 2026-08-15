import re, os

SP = r"C:\Users\sawan\AppData\Local\Temp\claude\C--Customers-Roamigos-Hostel-roamigos-hostel\646860cd-730f-4626-a0be-5911e893256d\scratchpad"
OUT = r"C:\Customers\Roamigos Hostel\roamigos-hostel\public"
os.makedirs(OUT, exist_ok=True)

svg = open(os.path.join(SP, "logo-raw.svg"), encoding="utf-8").read()
paths = re.findall(r"<path [^>]*?/>", svg)
tagline = open(os.path.join(SP, "tagline.svgfrag"), encoding="utf-8").read().strip()

DISC, RING = paths[1], paths[2]
SCENE = paths[3:46]      # mountains, trees, birds, flamingo, backpack, shadow
WORD = paths[46:54]      # "Roamigos" script wordmark
DASHES = paths[54:56]    # the two mustard rules flanking the tagline

def wrap(vb, body, extra=""):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" fill="none"%s>\n%s\n</svg>\n'
            % (vb, extra, "\n".join(body)))

# 1. Full badge — exact reproduction of the source artwork, transparent outside the disc.
badge = wrap("0 0 160 160", [DISC, RING] + SCENE + WORD + DASHES + [tagline])
open(os.path.join(OUT, "logo-badge.svg"), "w", encoding="utf-8").write(badge)

# 2. Mark only — flamingo scene inside a tightened ring, for the compact header lockup.
#    r=64 is the smallest radius that still clears the bottom-left pine trees.
ring = '<circle cx="79" cy="72" r="64" fill="#FBF1E6" stroke="#A92727" stroke-width="1.3"/>'
mark = wrap("14 7 130 130", [ring] + SCENE)
open(os.path.join(OUT, "logo-mark.svg"), "w", encoding="utf-8").write(mark)

# 3. Wordmark only — the script "Roamigos" lettering, currentColor so it can invert in dark mode.
word_cc = [p.replace('fill="#951A16"', 'fill="currentColor"') for p in WORD]
open(os.path.join(OUT, "logo-wordmark.svg"), "w", encoding="utf-8").write(
    wrap("34 102 92 30", word_cc))

# 4. Favicon — flamingo only (mountains and trees turn to mush at 16px), on a maroon disc.
FLAMINGO = [paths[i] for i in
            (21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 44, 45)]
fav = wrap("29 24 94 94", ['<circle cx="76" cy="71" r="47" fill="#A92727"/>',
                           '<circle cx="76" cy="71" r="42.5" fill="#FBF1E6"/>'] + FLAMINGO)
open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8").write(fav)

for f in ("logo-badge.svg", "logo-mark.svg", "logo-wordmark.svg", "favicon.svg"):
    print(f, os.path.getsize(os.path.join(OUT, f)), "bytes")
