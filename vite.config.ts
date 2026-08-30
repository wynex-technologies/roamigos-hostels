import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { headTags, robots, sitemap } from './src/lib/seoStatic'
import { rooms } from './src/data/rooms'

/**
 * Writes the share card, the canonical link and the site-wide schema into
 * `index.html`, and emits `robots.txt` and `sitemap.xml` alongside the build.
 *
 * All of it is generated from `src/data/`, so the brand name, address, phone
 * number and room list exist in exactly one place - a static second copy in
 * `index.html` would go stale the first time a room is renamed. The tags land
 * in dev too, so the marker never silently stops being replaced.
 */
/**
 * Answers `/admin` with a redirect to `/admin/`, the way the server will.
 *
 * Apache does this for free: `public_html/admin` is a real directory, so
 * mod_dir 301s to the trailing slash before anything else runs. Vite has no
 * such notion - the panel's dev server is mounted at `/admin/` and a request
 * for `/admin` is simply not it, so somebody typing the address the way they
 * naturally would got a 404 in development and a working panel in production.
 */
function adminTrailingSlash(): Plugin {
  return {
    name: 'roamigos-admin-trailing-slash',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const [path] = (request.url ?? '').split('?')
        if (path === '/admin') {
          response.writeHead(301, { Location: '/admin/' })
          response.end()
          return
        }
        next()
      })
    },
  }
}

function seo(): Plugin {
  return {
    name: 'roamigos-seo',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('<!--seo-->', headTags()),
    },
    generateBundle() {
      const slugs = rooms.map((room) => room.slug)
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(slugs) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo(), adminTrailingSlash()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  server: {
    port: 5173,

    /**
     * The panel, at /admin, on this same address.
     *
     * In production Apache does this - the site is `public_html/` and the panel
     * is `public_html/admin/`, one domain, one server. Development used to be
     * the odd one out: two Vite servers on two ports, so `/admin` locally meant
     * something different from `/admin` live.
     *
     * This closes that gap. `npm run dev` starts both, but only this one is
     * meant to be opened - anything under /admin is handed to the panel's
     * server behind it, which is invisible from the browser's side.
     *
     * `ws` is what keeps hot reload working through the proxy: the panel's HMR
     * socket connects to this origin, under its own base path, and would
     * otherwise be answered by the site's server instead of forwarded.
     */
    proxy: {
      '/admin': {
        target: 'http://localhost:5174',
        ws: true,
        // The panel is served from /admin at both ends, so the path is passed
        // through untouched. Rewriting it would break its asset URLs.
        changeOrigin: false,
      },
    },
  },
})
