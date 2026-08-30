<?php
/**
 * Publish: writes the content file the site reads.
 *
 * The site is static files on shared hosting - there is no build to trigger and
 * no deploy hook to fire. So the panel sends the finished content here and this
 * writes it next to index.html. The site fetches it on boot, so an edit made in
 * the panel is live on the next page load.
 *
 * ---------------------------------------------------------------------------
 * There is no service_role key in this file, and there must never be one.
 * ---------------------------------------------------------------------------
 *
 * The panel is already signed in, and every row it can read is already governed
 * by the database's own access rules - so the panel reads the content and sends
 * it. This script's only jobs are to prove the sender is a real admin and to
 * write the bytes. Everything it uses to do that is public: the project URL and
 * the anon key, which grant nothing on their own.
 *
 * That matters on shared hosting. A key that bypasses every access rule, in a
 * PHP file, in a web root, is one misconfigured server away from being handed
 * to whoever asks for it. This design has nothing worth stealing.
 *
 * Two checks, and both have to pass:
 *
 *   1. The bearer token is a valid, unexpired Supabase session.
 *   2. That user has a row in `admin_users`.
 *
 * The second is asked using the caller's *own* token, so the database answers
 * it under the same rules the panel runs under. A signed-in guest who is not on
 * the allowlist gets an empty answer and is refused.
 */

declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ------------------------------------------------------------------ cors --- */
// In production the panel is served from /admin on this same domain, so no
// preflight happens at all. This is here for developing the panel locally
// against the live server.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Headers: authorization, content-type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function fail(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'POST only.');
}

/* ----------------------------------------------------------------- token --- */
// getallheaders() is not available under every SAPI, so the Apache-provided
// variable is the fallback. Some hosts strip Authorization entirely unless the
// .htaccess rewrite that carries it is in place - see hostinger/.htaccess.
$auth = '';
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        if (strcasecmp($name, 'Authorization') === 0) {
            $auth = $value;
            break;
        }
    }
}
if ($auth === '') {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
}

if (!preg_match('/^Bearer\s+(.+)$/i', trim($auth), $matches)) {
    fail(401, 'Not signed in.');
}
$token = $matches[1];

/* ------------------------------------------------------------ supabase ----- */
function supabaseGet(string $path, string $token): array
{
    $ch = curl_init(SUPABASE_URL . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_ANON_KEY,
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
        ],
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false) {
        fail(502, 'Could not reach Supabase.');
    }

    return [$status, json_decode((string) $body, true)];
}

// 1. Is the token a real session?
[$status, $user] = supabaseGet('/auth/v1/user', $token);
if ($status !== 200 || empty($user['id'])) {
    fail(401, 'Session expired. Sign in again.');
}

// 2. Is that user an admin? Asked with their own token, so the database's
//    access rules answer it rather than this script deciding for itself.
[$status, $admin] = supabaseGet(
    '/rest/v1/admin_users?select=id&id=eq.' . urlencode((string) $user['id']),
    $token
);
if ($status !== 200 || !is_array($admin) || count($admin) === 0) {
    fail(403, 'Not an admin.');
}

/* ------------------------------------------------------------- payload ----- */
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) === 0) {
    fail(400, 'Empty body.');
}
if (strlen($raw) > 4 * 1024 * 1024) {
    fail(413, 'Content is unexpectedly large.');
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    fail(400, 'Body is not JSON.');
}

// The site refuses a file with no rooms in it, and so does this: a publish that
// blanks the listing is far more likely to be a bug than an intention.
if (empty($payload['rooms']) || !is_array($payload['rooms'])) {
    fail(400, 'Refusing to publish content with no rooms.');
}

/* --------------------------------------------------------------- write ----- */
// Written to a temp file and renamed, because rename is atomic on the same
// filesystem. A visitor mid-request either gets the whole old file or the whole
// new one, never half of either.
$target = CONTENT_PATH;
$temp = $target . '.' . bin2hex(random_bytes(4)) . '.tmp';

$encoded = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($encoded === false) {
    fail(500, 'Could not encode the content.');
}

if (file_put_contents($temp, $encoded) === false) {
    fail(500, 'Could not write the content file. Check the folder is writable.');
}

// Keep the copy that was live before this one. If a publish ever goes wrong,
// renaming this back is the whole recovery.
if (is_file($target)) {
    @copy($target, $target . '.bak');
}

if (!rename($temp, $target)) {
    @unlink($temp);
    fail(500, 'Could not replace the content file.');
}

@chmod($target, 0644);

echo json_encode([
    'ok' => true,
    'publishedAt' => gmdate('c'),
    'rooms' => count($payload['rooms']),
    'bytes' => strlen($encoded),
]);
