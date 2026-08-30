import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  /**
   * The panel is served from a subdirectory of the site, not its own domain -
   * one Hostinger account, `public_html/` for the site and `public_html/admin/`
   * for this. So every asset URL it emits has to be prefixed, or the panel
   * loads at /admin and then asks for /assets/index.js, which is the site's.
   *
   * The router is told the same thing separately, in `main.tsx`.
   */
  base: '/admin/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The row-to-site mapping, shared with `scripts/sync-content.ts` so the
      // Publish button and the build can never produce different shapes.
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },

  // `@shared` lives above this app's root, which the dev server blocks by default.
  server: { fs: { allow: ['..'] } },
})
