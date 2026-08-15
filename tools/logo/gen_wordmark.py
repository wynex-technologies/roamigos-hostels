import re, os

PUB = r"C:\Customers\Roamigos Hostel\roamigos-hostel\public"
DEST = r"C:\Customers\Roamigos Hostel\roamigos-hostel\src\components\brand\Wordmark.tsx"
os.makedirs(os.path.dirname(DEST), exist_ok=True)

svg = open(os.path.join(PUB, "logo-wordmark.svg"), encoding="utf-8").read()
paths = re.findall(r"<path [^>]*?/>", svg)
body = "\n      ".join(paths)

tsx = f'''// Generated from the source logo (Roamigos 9.pdf) — the script "Roamigos" lettering
// as vector outlines, so it renders identically without shipping the display font.
// Fills use currentColor: set the text colour on the parent to recolour the wordmark.
// Regenerate rather than hand-edit.

export function Wordmark({{ className }}: {{ className?: string }}) {{
  return (
    <svg
      viewBox="34 102 92 30"
      fill="none"
      role="img"
      aria-label="Roamigos"
      className={{className}}
    >
      {body}
    </svg>
  )
}}
'''
open(DEST, "w", encoding="utf-8").write(tsx)
print("wrote", DEST, os.path.getsize(DEST), "bytes,", len(paths), "paths")
