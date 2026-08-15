# Logo pipeline

The brand assets in `public/` and `src/components/brand/Wordmark.tsx` are **generated**
from the source artwork `Roamigos 9.pdf` (Adobe Illustrator, pure vector — no raster layers).
Do not hand-edit the generated files; re-run the pipeline instead.

## What comes out

| File | Contents |
| --- | --- |
| `public/logo-badge.svg` | The complete circular badge: disc, ring, flamingo scene, script wordmark, mustard rules, "Travellers Hostel" tagline |
| `public/logo-mark.svg` | Flamingo scene inside a tightened ring — the compact header mark |
| `public/logo-wordmark.svg` | The script "Roamigos" lettering only, `fill="currentColor"` |
| `public/favicon.svg` | Flamingo only on a maroon disc (the mountains and trees turn to mush at 16px) |
| `src/components/brand/Wordmark.tsx` | The wordmark inlined as a React component, so `currentColor` actually inherits (an `<img>`-loaded SVG cannot) |

## Running it

Requires Python 3 and `fonttools` (`pip install fonttools`).

```sh
python pdf2svg.py logo-raw.svg   # PDF content streams -> one flat SVG (56 paths)
python textpaths.py > tagline.svgfrag   # "Travellers Hostel" -> glyph outlines
python assemble.py               # slices logo-raw.svg into the four public/ assets
python gen_wordmark.py           # emits src/components/brand/Wordmark.tsx
```

`pdf2svg.py` interprets the PDF page's content streams directly: `q/Q`, `cm`, the path
operators, `rg/k/g` colour operators, `gs` alpha and `Do` form XObjects. It skips text —
`textpaths.py` handles the one text run by pulling the embedded Playfair Display subset out
of the PDF and converting its glyphs to outlines, so the tagline renders identically without
depending on a webfont having loaded.

`assemble.py` splits `logo-raw.svg` by path index (established once by inspecting each
path's bounding box and fill). If the source artwork ever changes, those index ranges are
the first thing to re-check.

## Colours found in the source

`#951A16` `#A92727` `#D9A328` `#D78A26` `#FBF1E6` `#E4C8AC` `#F47F72` `#364733` `#3F5B3C` `#252522`

These are the exact fills Illustrator wrote — they are the authority for the palette in
`src/index.css`. See `CLAUDE.md` for how each one is used.
