<?php
/**
 * Copy this to `config.php` on the server and fill it in.
 *
 * Everything here is public. The project URL and the anon key are already in
 * the panel's JavaScript, which anyone can read - they grant nothing on their
 * own, because every table is closed to them.
 *
 * The service_role key does NOT belong here, or anywhere else on this server.
 * If you ever find yourself pasting it into a PHP file, stop: `publish.php` is
 * built specifically so it is not needed.
 */

declare(strict_types=1);

const SUPABASE_URL = 'https://sfolclcnfpxirlojembb.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmb2xjbGNuZnB4aXJsb2plbWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjQ2NjYsImV4cCI6MjEwMzY0MDY2Nn0.yJ2DnAJCQk7EvjfYLLfmMEoBtnteDeGbpUpCsPIPbLM';

/**
 * Where the published content file goes. It sits next to index.html, because
 * that is where the site fetches it from: /content.json
 */
const CONTENT_PATH = __DIR__ . '/../content.json';

/**
 * Origins allowed to POST here.
 *
 * In production the panel is at /admin on this same domain, so no preflight
 * happens and this list is not consulted. It only matters when running the
 * panel locally against the live server.
 */
const ALLOWED_ORIGINS = [
    'http://localhost:5174',
];
