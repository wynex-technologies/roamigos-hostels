/**
 * Serves `deploy/` the way Hostinger will, so the upload can be checked before
 * it goes anywhere.
 *
 *   npm run build:hostinger
 *   npm run preview:hostinger
 *
 * It follows the same three rules as `hostinger/.htaccess`, in the same order,
 * because those are the ones worth getting wrong quietly: a real file wins,
 * then /admin gets the panel's index.html, then everything else gets the site's.
 * A deep link like /rooms/deluxe-private or /admin/bookings should work here
 * exactly as it will on the server.
 *
 * What it cannot do is run PHP, so Publish will fail against this with a 501 -
 * that one only works on the real server. Everything else is faithful.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../deploy')
const PORT = 4173

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
}

async function fileAt(path: string) {
  try {
    const info = await stat(path)
    if (info.isFile()) return path
    if (info.isDirectory()) {
      const index = join(path, 'index.html')
      return (await stat(index)).isFile() ? index : null
    }
  } catch {
    return null
  }
  return null
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)
  // The URL path stays a URL path - forward slashes, always. Running it through
  // `path.normalize` first turns it into `\admin\bookings` on Windows, and then
  // every `startsWith('/admin')` below silently stops matching: the preview
  // routes the panel to the site, on one developer's machine only.
  //
  // Traversal is handled instead by resolving against the root and checking the
  // result is still inside it, which is what the check below does.
  const pathname = decodeURIComponent(url.pathname)
  const target = resolve(root, `.${pathname}`)

  if (!target.startsWith(root)) {
    response.writeHead(403).end('Forbidden')
    return
  }

  if (pathname.endsWith('.php')) {
    response.writeHead(501, { 'Content-Type': 'application/json' }).end(
      JSON.stringify({ error: 'No PHP in the preview. Publish only works on the server.' }),
    )
    return
  }

  // 1. A real file wins.
  let file = await fileAt(target)

  // 2. Then /admin, before the catch-all could take it.
  if (!file && pathname.startsWith('/admin')) file = join(root, 'admin/index.html')

  // 3. Then the site.
  if (!file) file = join(root, 'index.html')

  try {
    const body = await readFile(file)
    const type = TYPES[extname(file)] ?? 'application/octet-stream'
    const cache = file.endsWith('index.html') || file.endsWith('content.json')
      ? 'no-cache'
      : 'public, max-age=31536000, immutable'

    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache }).end(body)
  } catch {
    response.writeHead(404).end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`
  Serving deploy/ as Hostinger would.

  Site   http://localhost:${PORT}/
  Panel  http://localhost:${PORT}/admin

  Publish will fail here (no PHP). Everything else is the real thing.
`)
})
