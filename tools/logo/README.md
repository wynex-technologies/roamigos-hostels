# Logo pipeline

`Roamigos final.ai` is the brand master - one 160x160 Illustrator artboard, five
layers, PDF-1.6 compatible. `ai2logo.py` reads it directly (no Illustrator, no
Ghostscript, no Inkscape) and writes every logo variant out.

```sh
python tools/logo/ai2logo.py <outdir>              # <outdir>/svg, <outdir>/png, <outdir>/manifest.txt
python tools/logo/ai2logo.py <outdir> <file.ai>    # both arguments optional
```

Needs `pymupdf` and `fonttools`.

With no arguments it writes to `logo/` at the repo root. That folder is **scratch,
not something the repo keeps** - only the handful of files copied into `public/`
ship. The last full run was moved out to `C:\Customers\logo`; delete or move the
folder again after any rebuild.

## How it works

The page content stream is five `/OC ... BDC ... EMC` blocks, one per layer, so the
script walks the operators itself (`q/Q`, `cm`, the path operators, `cs/scn` colour,
`gs` alpha) and tags every shape with the layer it came from. The serif
"Travellers Hostel" in the script lockup is live Playfair Display text, not
outlines - `fontTools` pulls the embedded subset and converts those glyphs, run
through `Qu2CuPen(all_cubic=True)` so quadratics become cubics and one M/L/C/Z
grammar covers everything.

Each variant is then written twice from that single shape list: as SVG, and as a
rebuilt PDF content stream that PyMuPDF rasterises to PNG. Same data both ways, so
the SVG and the PNG cannot drift apart.

## What ships

`ai2logo.py` output is a build directory. The files the site loads are copied into
`public/` by hand:

| `public/` | from |
| --- | --- |
| `logo.svg`, `logo-512/1024/2048.png` | `roamigos-logo-stacked` - the official stacked lockup |
| `logo-mark.svg` | `roamigos-mark-flamingo` - the flamingo on its own |
| `logo-wordmark.svg` | `roamigos-wordmark-script` - script, rules and serif tagline |
| `logo-light.svg`, `logo-wordmark-light.svg` | the two above with `#951A16` swapped for `#FBF1E6` |

Stacked, the wordmark is unreadable inside an 80px header bar, so the header and
the footer set `logo-mark.svg` beside `logo-wordmark.svg` instead - the same
artwork, laid out horizontally. `logo.svg` is used where there is room for the
full lockup, like the 404 page.

The `-light` copies exist because the maroon script disappears on the footer
ground and on the hero photo. Only the script changes colour; the flamingo, the
mustard rules and the tagline are untouched.

`logo-wordmark.svg`, `favicon.svg` and `src/components/brand/Wordmark.tsx` still
come from the older `Roamigos 9.pdf` artwork via `pdf2svg.py`, `textpaths.py`,
`assemble.py` and `gen_wordmark.py`. That PDF is no longer in the repo, so those
four scripts cannot be re-run as they stand - they are kept for reference until
those three assets are regenerated from the `.ai`.
