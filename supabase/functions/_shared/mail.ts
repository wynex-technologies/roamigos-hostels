/**
 * The desk's email copy of a guest submission.
 *
 * This is the third copy of the same booking, and it is deliberately the least
 * important of the three. The WhatsApp message is the booking. The `bookings`
 * row is what the panel shows. This is the one that arrives in a mailbox the
 * owner already reads on their phone, so a request is noticed when nobody has
 * the panel open.
 *
 * Because it is the least important, it is also the one allowed to fail. The
 * row is already written by the time this runs, so a mailbox that is full, a
 * host that is refusing connections or a password that was rotated last week
 * costs the desk an email and never a booking. Nothing here throws into the
 * request, and the guest is never told any of it happened.
 *
 * Unset the credentials - a fresh project, a local `supabase functions serve`,
 * a fork - and nothing is sent, silently and by design, exactly the way the
 * whole intake path already behaves when its endpoint is missing.
 *
 * Why SMTP and not a REST mail API: the hostel already owns a mailbox on its
 * own domain, so mail leaves as `stay@roamigoshostel.com` from the server that
 * is authoritative for that domain. No second vendor, no domain to verify, no
 * free tier to outgrow. Supabase's edge runtime allows outbound TCP, which is
 * what makes this possible at all.
 */
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

/**
 * Every one of these is required. One missing and the whole thing is off -
 * a half-configured mailer that connects and then cannot authenticate is a
 * worse failure than one that never tries, because it costs the function a
 * connection timeout on every booking.
 */
const HOSTNAME = Deno.env.get('SMTP_HOSTNAME')
const USERNAME = Deno.env.get('SMTP_USERNAME')
const PASSWORD = Deno.env.get('SMTP_PASSWORD')

/** Where the copy lands. Comma separated, so the desk can add a second reader. */
const TO = (Deno.env.get('NOTIFY_EMAIL') ?? '')
  .split(',')
  .map((address) => address.trim())
  .filter(Boolean)

/**
 * 465 is implicit TLS - the socket is encrypted before a byte of SMTP is
 * spoken. That is what the mailbox advertises, and it is the port to keep:
 * 587 would need STARTTLS and a different `tls` flag below.
 */
const PORT = Number(Deno.env.get('SMTP_PORT') ?? '465')

/** Shared hosts reject a From that is not the mailbox that authenticated. */
const FROM = Deno.env.get('SMTP_FROM') ?? USERNAME ?? ''

export function mailerReady() {
  return Boolean(HOSTNAME && USERNAME && PASSWORD && FROM && TO.length)
}

/**
 * Both body parts are base64, and that is a bug fix, not a preference.
 *
 * Handing denomailer `content` and `html` makes it quoted-printable encode
 * them, and its encoder in 1.6.0 gets it wrong in a way that lands in the
 * mailbox as visible junk. Two faults, both reachable from ordinary HTML:
 *
 *   1. It rewrites a space before a newline to `=20`, and only *then* runs the
 *      pass that escapes `=` to `=3D`. So its own `=20` gets escaped into
 *      `=3D20`, which the mail client faithfully decodes back to a literal
 *      `=20` printed on the page. That is exactly the marker that showed up.
 *   2. Its soft line break loop slices at fixed 74 character boundaries and
 *      then shifts the start of the next slice without shifting its end, so on
 *      a long line - and inline styles make every line long - characters are
 *      dropped or repeated outright.
 *
 * Base64 has neither problem: it is a fixed alphabet with no escape character
 * to mis-order and no line-ending rule to get wrong. `mimeContent` is passed
 * through by the library untouched, which is what lets us sidestep its encoder
 * entirely while still getting a proper multipart/alternative message.
 *
 * The 76 character wrap is RFC 2045's, and it is ours to do here because the
 * library writes this string to the socket exactly as given.
 */
function base64Part(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/(.{76})/g, '$1\r\n')
}

/**
 * Sends one message and resolves either way.
 *
 * The client is built per call rather than kept alive between them. An edge
 * isolate is frozen between requests and a pooled SMTP socket would be dead by
 * the next booking anyway, so a fresh connection is the honest version of what
 * is already happening.
 */
export async function notify(
  subject: string,
  text: string,
  html?: string | null,
  replyTo?: string | null,
) {
  if (!mailerReady()) return

  const client = new SMTPClient({
    connection: {
      hostname: HOSTNAME!,
      port: PORT,
      // Implicit TLS on 465. See the note on PORT above.
      tls: true,
      auth: { username: USERNAME!, password: PASSWORD! },
    },
  })

  try {
    await client.send({
      from: FROM,
      to: TO,
      subject,
      // Both parts, so the message goes out as multipart/alternative: the
      // designed version where it can be rendered, and the plain one for a
      // watch, a notification preview or a client with images and styling off.
      // The text part is not a formality here - it is what most people actually
      // see first, on a phone, before they open anything.
      //
      // Built by hand rather than through `content` / `html`, to keep the
      // library's quoted-printable encoder out of the path - see `base64Part`.
      // The plain part comes first because a client picks the *last* part it
      // can render, and the designed one should win wherever it is understood.
      mimeContent: [
        {
          mimeType: 'text/plain; charset="utf-8"',
          content: base64Part(text),
          transferEncoding: 'base64',
        },
        ...(html
          ? [
              {
                mimeType: 'text/html; charset="utf-8"',
                content: base64Part(html),
                transferEncoding: 'base64',
              },
            ]
          : []),
      ],
      // The guest's own address, so hitting Reply in the mailbox answers the
      // guest rather than the hostel's own inbox.
      ...(replyTo ? { replyTo } : {}),
    })
  } catch (error) {
    // Logged, not thrown. The booking is already saved and the guest is already
    // in WhatsApp; this line is for whoever reads the function's logs later.
    console.error('[intake] email not sent:', error instanceof Error ? error.message : error)
  } finally {
    try {
      await client.close()
    } catch {
      // A socket that already went away. Nothing to do and nothing to report.
    }
  }
}

/**
 * Runs the send after the response has gone back, where the runtime allows it.
 *
 * The site never reads this response - `intake` is called with `keepalive` and
 * the tab is on its way to WhatsApp - but an SMTP round trip is seconds, and
 * holding the isolate open for it would make every booking pay for the desk's
 * mail server being slow. `waitUntil` is the runtime's own way of saying "keep
 * this alive after the response", and awaiting is the correct fallback when it
 * is not there: slower, but never a message dropped on the floor.
 */
export function afterResponse(work: Promise<unknown>) {
  const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
    .EdgeRuntime

  if (typeof runtime?.waitUntil === 'function') {
    runtime.waitUntil(work)
    return null
  }

  return work
}
