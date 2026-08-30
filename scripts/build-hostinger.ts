/**
 * Builds the site and the panel and lays them out exactly as `public_html/`
 * should look on Hostinger.
 *
 * There is no deploy pipeline here on purpose. This produces one folder; you
 * upload its contents once, and after that the desk publishes content from the
 * panel without anybody touching the server again. You only come back to this
 * script when the code changes, not when the content does.
 *
 *   npm run build:hostinger
 *
 * The result:
 *
 *   deploy/
 *     index.html  assets/  favicon.svg  logo-*.svg  sitemap.xml  robots.txt
 *     content.json          <- the starting content; the panel rewrites it
 *     .htaccess             <- routing for both apps
 *     admin/
 *       index.html  assets/  .htaccess
 *     api/
 *       publish.php
 *       config.php          <- only if you have made one; see config.example.php
 */
import { cp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'deploy')

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  )

function run(command: string, args: string[], cwd: string) {
  console.log(`\n> ${command} ${args.join(' ')}  (in ${cwd.replace(root, '.')})`)
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    console.error(`\nFailed: ${command} ${args.join(' ')}`)
    process.exit(result.status ?? 1)
  }
}

/* ------------------------------------------------------------- the builds --- */

run('npm', ['run', 'build'], root)

if (!(await exists(resolve(root, 'admin/node_modules')))) {
  console.log('\n[deploy] admin dependencies missing, installing them.')
  run('npm', ['install'], resolve(root, 'admin'))
}
run('npm', ['run', 'build'], resolve(root, 'admin'))

/* -------------------------------------------------------------- assembly --- */

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

await cp(resolve(root, 'dist'), out, { recursive: true })
await cp(resolve(root, 'admin/dist'), resolve(out, 'admin'), { recursive: true })
await cp(resolve(root, 'hostinger/.htaccess'), resolve(out, '.htaccess'))
await cp(resolve(root, 'hostinger/admin.htaccess'), resolve(out, 'admin/.htaccess'))

await mkdir(resolve(out, 'api'), { recursive: true })
await cp(resolve(root, 'hostinger/api/publish.php'), resolve(out, 'api/publish.php'))
await cp(
  resolve(root, 'hostinger/api/config.example.php'),
  resolve(out, 'api/config.example.php'),
)

// A local `hostinger/api/config.php` is yours and is gitignored. Copying it
// saves renaming a file in the File Manager after every upload.
const localConfig = resolve(root, 'hostinger/api/config.php')
if (await exists(localConfig)) {
  await cp(localConfig, resolve(out, 'api/config.php'))
  console.log('[deploy] api/config.php included.')
} else {
  console.log('[deploy] no hostinger/api/config.php - rename config.example.php on the server.')
}

/**
 * The starting content file.
 *
 * The site fetches this on boot, and the panel overwrites it on every publish.
 * Seeding it from the build's own copy means the site is correct the moment it
 * is uploaded, before anybody has pressed Publish even once.
 *
 * It is only ever written when the build actually synced something. Uploading
 * an empty `{}` over a live server's content file would blank the site, so a
 * build with no credentials deliberately ships no file at all and lets the copy
 * already on the server stand.
 */
const baked = JSON.parse(await readFile(resolve(root, 'src/data/generated/content.json'), 'utf8'))

if (baked.syncedAt && Array.isArray(baked.rooms) && baked.rooms.length > 0) {
  await writeFile(resolve(out, 'content.json'), JSON.stringify(baked), 'utf8')
  console.log(`[deploy] content.json seeded with ${baked.rooms.length} rooms.`)
} else {
  console.log(
    '[deploy] no synced content - content.json left out, so an upload cannot blank a live site.',
  )
}

console.log(`
[deploy] ready: ${out}

Upload everything INSIDE that folder into public_html/ - the contents, not the
folder itself. Hidden files count: .htaccess has to go up too, and the File
Manager needs "show hidden files" turned on to see it.
`)
