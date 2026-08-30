/**
 * One command, one address, both apps.
 *
 *   npm run dev   ->   http://localhost:5173        the site
 *                      http://localhost:5173/admin  the panel
 *
 * They are still two separate Vite apps and two separate builds - the panel's
 * code must never end up in the bundle a visitor downloads. What this does is
 * make the *addresses* match production, where Apache serves the site from
 * `public_html/` and the panel from `public_html/admin/` on one domain.
 *
 * The panel's own server runs on 5174 and the site's proxies `/admin` to it
 * (see `server.proxy` in vite.config.ts). 5174 still answers directly if you
 * want it, but there is no longer any reason to open it: a link, a redirect or
 * a router path that works at :5173/admin works the same way live, which is
 * exactly what was easy to get wrong before.
 *
 * Both children share this terminal. Ctrl+C stops both.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const adminDir = resolve(root, 'admin')

if (!existsSync(resolve(adminDir, 'node_modules'))) {
  console.error(`
  The panel's dependencies are not installed, so /admin would 502.

      cd admin && npm install
`)
  process.exit(1)
}

const children: ChildProcess[] = []

/** Prefixes each line so two servers in one terminal stay readable. */
function start(name: string, cwd: string, args: string[], colour: string) {
  const child = spawn('npm', args, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
  const tag = `${colour}[${name}][0m`

  const pipe = (stream: NodeJS.ReadableStream) => {
    stream.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n')) {
        if (line.trim()) console.log(`${tag} ${line}`)
      }
    })
  }

  pipe(child.stdout!)
  pipe(child.stderr!)

  child.on('exit', (code) => {
    // If one server dies the other is useless, so the pair goes down together
    // rather than leaving a half-working setup that 502s on /admin.
    if (code !== 0 && code !== null) {
      console.error(`${tag} exited with ${code}. Stopping the other one too.`)
      stop()
      process.exit(code)
    }
  })

  children.push(child)
  return child
}

function stop() {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
}

process.on('SIGINT', () => {
  stop()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stop()
  process.exit(0)
})

// The panel first, so it is listening by the time the site starts proxying to it.
start('panel', adminDir, ['run', 'dev'], '[35m')
start('site', root, ['run', 'dev:site'], '[36m')

console.log(`
  [36mSite[0m   http://localhost:5173
  [35mPanel[0m  http://localhost:5173/admin

  Same addresses as production. Ctrl+C stops both.
`)
