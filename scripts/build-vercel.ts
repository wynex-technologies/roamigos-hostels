/**
 * Builds both apps into one folder for Vercel: the site at the root, the panel
 * at `/admin`.
 *
 * This exists because `npm run build` builds only the site. The panel is its
 * own app with its own `package.json` and its own build, which is deliberate -
 * its code must never end up in the bundle a visitor downloads. So something
 * has to run the second build and put its output where `/admin` will find it,
 * and on Hostinger that is `build-hostinger.ts`. This is the same job for a
 * platform that serves static files rather than Apache:
 *
 *   dist/
 *     index.html  assets/  ...      the site
 *     admin/
 *       index.html  assets/         the panel
 *
 * What Apache did with `.htaccess`, `vercel.json` does with rewrites - both
 * apps are single-page, so `/rooms/deluxe-private` and `/admin/bookings` have
 * to be answered with the right `index.html` rather than a 404.
 *
 * Two things are worth knowing before deploying here.
 *
 * **Publish does not work on Vercel.** The button posts to `api/publish.php`,
 * which is PHP on the same disk as `index.html` - there is no PHP here and no
 * disk to write to. Everything else in the panel works, because it talks to
 * Supabase directly; what is lost is the step that pushes saved content onto
 * the live site without a rebuild. On Vercel that step is a redeploy: the
 * `prebuild` sync pulls the same rows into the bundle. Hostinger remains the
 * deployment the panel was built around.
 *
 * **The panel needs its two variables at build time.** `admin/.env` is
 * gitignored, so `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` have to be
 * set as environment variables on the platform or the panel builds pointed at
 * nothing and shows its setup screen. Both are public and safe in a bundle;
 * the service_role key is not, and does not belong on any deploy platform that
 * builds a browser bundle - see `.env.example`.
 */
import { access, cp, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const admin = resolve(root, 'admin')
const out = resolve(root, 'dist/admin')

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

// The site first, because this writes `dist/` and would wipe the panel out of
// it if it ran second.
run('npm', ['run', 'build'], root)

// A fresh checkout on a build machine has no `admin/node_modules`. `ci` rather
// than `install`, so the build gets the locked versions and never resolves a
// different tree than the one that was tested.
if (!(await exists(resolve(admin, 'node_modules')))) {
  console.log('\n[vercel] admin dependencies missing, installing them.')
  run('npm', ['ci'], admin)
}
run('npm', ['run', 'build'], admin)

/* -------------------------------------------------------------- assembly --- */

await rm(out, { recursive: true, force: true })
await cp(resolve(admin, 'dist'), out, { recursive: true })

console.log('\n[vercel] site at /, panel at /admin, both in dist/.')
