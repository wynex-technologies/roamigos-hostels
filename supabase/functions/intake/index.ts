/**
 * Guest submissions: a booking request, a contact enquiry, or a chat opened.
 *
 * The site still opens WhatsApp, and that chat is still the real conversation.
 * This only gives the desk its own copy, so a request is not lost when somebody
 * closes their phone half way through sending it, and so the panel has
 * something to show. The site calls it and does not wait for the answer - if
 * this endpoint is down, the guest never finds out and WhatsApp opens anyway.
 *
 * It writes with the service_role key rather than letting the browser insert,
 * because the anon key is in the bundle: with an insert policy, anyone could
 * fill the desk's inbox from a script. Here the payload has to get past the
 * validation below first.
 *
 * Egress: the request is about a kilobyte and the answer has no body at all.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { date, empty, int, preflight, str } from '../_shared/http.ts'
import { afterResponse, notify } from '../_shared/mail.ts'
import { appendBooking, appendEnquiry } from '../_shared/sheet.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

/** Two minutes. Long enough to swallow a double tap, short enough to allow a
    guest who really is booking a second room straight after the first. */
const DEDUPE_WINDOW_MS = 2 * 60 * 1000

/**
 * Thirty seconds for a bare chat, which is a different problem.
 *
 * A booking carries an email, so two rows can be told apart by who sent them.
 * A chat carries nothing - just which button, on which page - so the only
 * thing dedupe can match on is the button itself, and two different visitors
 * pressing the same one would collapse into a single row. Short enough that
 * only a double tap is caught, and a second person a minute later is not.
 */
const CHAT_DEDUPE_WINDOW_MS = 30 * 1000

/** Rupees, grouped the Indian way, so the figure reads like the site's. */
function inr(value: number | null) {
  return `Rs ${(value ?? 0).toLocaleString('en-IN')}`
}

/**
 * The booking, as an email the desk can act on without opening anything.
 *
 * Deliberately plain text. It is read on a phone, usually in a notification
 * preview, and the first two lines are what decides whether somebody opens it -
 * so the room and the dates come before anything else.
 */
function bookingEmail(row: Record<string, unknown>) {
  const lines = [
    `${row.room_name ?? 'No room'}  -  ${row.check_in ?? 'no date'} to ${row.check_out ?? 'no date'}`,
    `${row.nights} night(s), ${row.guests} guest(s)`,
    '',
    'GUEST',
    `Name   ${row.guest_name}`,
    `Phone  ${row.guest_phone}`,
    `Email  ${row.guest_email}`,
    '',
    'MONEY',
    `Subtotal  ${inr(row.subtotal as number)}`,
  ]

  if (row.coupon_code) {
    lines.push(`Coupon    ${row.coupon_code} (${row.coupon_percent}% off)`)
    lines.push(`Discount  -${inr(row.discount as number)}`)
  }

  lines.push(`Total     ${inr(row.total as number)}`)

  if (row.note) lines.push('', 'REQUEST', String(row.note))

  lines.push(
    '',
    'The guest has been sent to WhatsApp with this same request. This is the',
    'desk copy - it is also on the panel under Bookings.',
  )

  return lines.join('\n')
}

/**
 * The same booking, designed.
 *
 * Email is not the web and this markup is deliberately old fashioned: tables
 * for layout, every style inline, no flexbox, no grid, no `<style>` block worth
 * relying on. Outlook renders with Word's engine and Gmail strips a stylesheet
 * it does not like, so anything clever here degrades into an unreadable mess on
 * the one client the owner actually uses.
 *
 * The colours are the brand sheet's, used the way the sheet has them: Sand for
 * the header ground the way the site's own bar is, maroon leading, mustard
 * supporting, green only on the confirmation dot. The faces are the one place
 * this cannot follow the site - Playfair and Poppins are webfonts and a mail
 * client will not fetch them, so the display line falls back to Georgia, which
 * is the closest thing to Playfair that is already on every machine.
 *
 * Every value that came off the wire goes through `esc`. A guest called
 * `<script>` is not a threat to a mailbox, but a guest whose special request
 * contains an angle bracket would otherwise silently lose half the sentence.
 */
function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const INK = '#262626'
const MAROON = '#B3313A'
const MUSTARD = '#D9A328'
const GREEN = '#355E3B'
const CREAM = '#F8F5EE'
const SAND = '#E8DDCB'
const MUTED = '#6B6560'

const SANS = "'Poppins',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const DISPLAY = "'Playfair Display',Georgia,'Times New Roman',serif"

/** A label / value line in the guest block. */
function detail(label: string, value: string, strong = false) {
  return `<tr>
    <td style="padding:7px 0;font:400 11px/1.4 ${SANS};letter-spacing:.12em;text-transform:uppercase;color:${MUTED};white-space:nowrap;vertical-align:top;width:96px">${esc(label)}</td>
    <td style="padding:7px 0;font:${strong ? '600' : '400'} 15px/1.5 ${SANS};color:${INK};vertical-align:top">${value}</td>
  </tr>`
}

/** A money line. Figures are right aligned and tabular so they stack up. */
function money(label: string, value: string, opts: { total?: boolean; off?: boolean } = {}) {
  const size = opts.total ? '19px' : '15px'
  const weight = opts.total ? '700' : '400'
  const colour = opts.total ? MAROON : opts.off ? GREEN : INK
  const face = opts.total ? DISPLAY : SANS
  return `<tr>
    <td style="padding:${opts.total ? '14px 0 0' : '5px 0'};font:400 14px/1.5 ${SANS};color:${opts.total ? INK : MUTED}">${esc(label)}</td>
    <td align="right" style="padding:${opts.total ? '14px 0 0' : '5px 0'};font:${weight} ${size}/1.4 ${face};color:${colour};white-space:nowrap;font-variant-numeric:tabular-nums">${esc(value)}</td>
  </tr>`
}

/**
 * The card every one of these emails is printed on.
 *
 * A booking and an enquiry are the same object to the person reading them: one
 * thing that came in, from one person, that somebody at the desk has to answer.
 * So they get one chrome - the Sand bar, the white card, the eyebrow, the
 * display headline, the footer that says where else this landed - and differ
 * only in the blocks stacked in the middle. Two hand-maintained copies of this
 * markup would have drifted the first time a colour changed.
 */
function page(o: {
  preheader: string
  eyebrow: string
  title: string
  lines: string[]
  blocks: string
  cta?: { href: string; label: string }
  footer: string
}) {
  const lines = o.lines
    .filter(Boolean)
    .map((line, index) =>
      index === 0
        ? `<p style="margin:0;font:500 15px/1.6 ${SANS};color:${INK}">${line}</p>`
        : `<p style="margin:4px 0 0;font:400 14px/1.6 ${SANS};color:${MUTED}">${line}</p>`,
    )
    .join('')

  const cta = o.cta
    ? `<tr><td style="padding:0 32px 30px">
      <a href="${o.cta.href}" style="display:inline-block;background:${MUSTARD};color:${INK};font:600 15px/1 ${SANS};text-decoration:none;padding:14px 24px;border-radius:10px">${o.cta.label}</a>
    </td></tr>`
    : ''

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(o.eyebrow)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM}">
<tr><td align="center" style="padding:28px 12px">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid ${SAND};border-radius:16px;overflow:hidden">

    <tr><td style="background:${SAND};padding:16px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font:700 15px/1 ${DISPLAY};letter-spacing:.02em;color:${INK}">Roamigos</td>
        <td align="right" style="font:600 10px/1 ${SANS};letter-spacing:.16em;text-transform:uppercase;color:${MAROON}">Front desk</td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:30px 32px 0">
      <p style="margin:0 0 10px;font:600 11px/1 ${SANS};letter-spacing:.14em;text-transform:uppercase;color:${GREEN}">
        <span style="display:inline-block;width:7px;height:7px;background:${GREEN};border-radius:50%;margin-right:7px"></span>${esc(o.eyebrow)}
      </p>
      <h1 style="margin:0 0 6px;font:700 27px/1.25 ${DISPLAY};color:${MAROON};font-variant-numeric:lining-nums">${esc(o.title)}</h1>
      ${lines}
    </td></tr>

    <tr><td style="padding:24px 32px 0"><div style="height:1px;background:${SAND}"></div></td></tr>

    ${o.blocks}

    ${cta}

    <tr><td style="background:${SAND};padding:18px 32px">
      <p style="margin:0;font:400 12px/1.65 ${SANS};color:${MUTED}">${o.footer}</p>
    </td></tr>

  </table>

</td></tr></table>
</body></html>`
}

/** The who-it-came-from block. Phone and email are live links, so a phone can act on them. */
function whoBlock(rows: string) {
  return `<tr><td style="padding:18px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>`
}

/** A cream panel with a mustard edge, for the free text a guest wrote themselves. */
function quoteBlock(label: string, body: unknown) {
  if (!body) return ''
  return `<tr><td style="padding:22px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};border-left:3px solid ${MUSTARD};border-radius:0 10px 10px 0">
        <tr><td style="padding:16px 18px">
          <p style="margin:0 0 6px;font:600 11px/1.4 ${SANS};letter-spacing:.12em;text-transform:uppercase;color:${MUTED}">${esc(label)}</p>
          <p style="margin:0;font:400 15px/1.6 ${SANS};color:${INK};white-space:pre-line">${esc(body)}</p>
        </td></tr>
      </table>
    </td></tr>`
}

function tel(value: unknown) {
  return `<a href="tel:${esc(value)}" style="color:${MAROON};text-decoration:none">${esc(value)}</a>`
}

function mailto(value: unknown) {
  return `<a href="mailto:${esc(value)}" style="color:${MAROON};text-decoration:none">${esc(value)}</a>`
}

/** `wa.me` wants digits only, so a number typed with spaces or a plus still works. */
function waLink(phone: unknown) {
  return `https://wa.me/${String(phone ?? '').replace(/\D/g, '')}`
}

function firstName(value: unknown) {
  return esc(String(value ?? '').split(' ')[0] || 'the guest')
}

function bookingEmailHtml(r: Record<string, unknown>) {
  const discount = r.coupon_code
    ? money(
        `Coupon ${String(r.coupon_code)} (${r.coupon_percent}% off)`,
        `- ${inr(r.discount as number)}`,
        { off: true },
      )
    : ''

  const moneyBlock = `<tr><td style="padding:22px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};border-radius:12px">
        <tr><td style="padding:18px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${money('Subtotal', inr(r.subtotal as number))}
            ${discount}
            <tr><td colspan="2" style="padding:12px 0 0"><div style="height:1px;background:${SAND}"></div></td></tr>
            ${money('Estimated total', inr(r.total as number), { total: true })}
          </table>
        </td></tr>
      </table>
    </td></tr>`

  return page({
    preheader: `${r.room_name ?? 'Booking'}, ${r.check_in ?? ''}, ${r.nights} night(s), ${inr(r.total as number)}`,
    eyebrow: 'New booking request',
    title: String(r.room_name ?? 'No room selected'),
    lines: [
      `${esc(r.check_in ?? 'no date')} <span style="color:${MUSTARD}">&rarr;</span> ${esc(r.check_out ?? 'no date')}`,
      `${esc(r.nights)} night(s) &middot; ${esc(r.guests)} guest(s)`,
    ],
    blocks:
      whoBlock(
        detail('Guest', esc(r.guest_name), true) +
          detail('Phone', tel(r.guest_phone)) +
          detail('Email', mailto(r.guest_email)),
      ) +
      moneyBlock +
      quoteBlock('Special request', r.note) +
      '<tr><td style="height:26px"></td></tr>',
    cta: { href: waLink(r.guest_phone), label: `Message ${firstName(r.guest_name)} on WhatsApp` },
    footer:
      'The guest has been sent to WhatsApp with this same request, so expect a chat as well. ' +
      `This copy is also on the panel under <strong style="color:${INK}">Bookings</strong>.`,
  })
}

/**
 * An enquiry is a question, not a booking, and the email says so.
 *
 * The topic leads, because that is the whole reason somebody wrote in. The
 * dates and the guest count are printed only when they gave any: the contact
 * form does not insist on them the way the booking dialog does, and an empty
 * range rendered as `no date to no date` reads like something went wrong.
 */
function enquiryEmailHtml(r: Record<string, unknown>) {
  const dates =
    r.check_in || r.check_out
      ? `${esc(r.check_in ?? 'open')} <span style="color:${MUSTARD}">&rarr;</span> ${esc(r.check_out ?? 'open')}`
      : ''

  const guests = r.guests ? `${esc(r.guests)} guest(s)` : ''

  return page({
    preheader: `${r.topic ?? 'Enquiry'} from ${r.name ?? 'a visitor'}`,
    eyebrow: 'New enquiry',
    title: String(r.topic ?? 'General enquiry'),
    lines: [dates, guests].filter(Boolean),
    blocks:
      whoBlock(
        detail('From', esc(r.name), true) +
          detail('Phone', tel(r.phone)) +
          (r.source ? detail('Page', esc(r.source)) : ''),
      ) +
      quoteBlock('Message', r.message) +
      '<tr><td style="height:26px"></td></tr>',
    cta: { href: waLink(r.phone), label: `Reply to ${firstName(r.name)} on WhatsApp` },
    footer:
      'The visitor was sent to WhatsApp with this same message. ' +
      `This copy is also on the panel under <strong style="color:${INK}">Enquiries</strong>.`,
  })
}

/** The enquiry as plain text, which is what a phone notification shows. */
function enquiryEmail(r: Record<string, unknown>) {
  const lines = [String(r.topic ?? 'General enquiry'), '']

  if (r.check_in || r.check_out) {
    lines.push(`Dates  ${r.check_in ?? 'open'} to ${r.check_out ?? 'open'}`)
  }
  if (r.guests) lines.push(`Guests ${r.guests}`)
  if (r.check_in || r.check_out || r.guests) lines.push('')

  lines.push('FROM', `Name   ${r.name}`, `Phone  ${r.phone}`)
  if (r.source) lines.push(`Page   ${r.source}`)

  if (r.message) lines.push('', 'MESSAGE', String(r.message))

  lines.push(
    '',
    'The visitor was sent to WhatsApp with this same message. This is the',
    'desk copy - it is also on the panel under Enquiries.',
  )

  return lines.join('\n')
}


Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (request.method !== 'POST') return empty(request, 405)

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return empty(request, 400)
  }

  const kind = payload.kind
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString()

  // ------------------------------------------------------------- booking ---
  if (kind === 'booking') {
    const guestName = str(payload.guestName, 120)
    const guestPhone = str(payload.guestPhone, 40)
    const guestEmail = str(payload.guestEmail, 160)

    // The same three the dialog will not send without. A row missing any of
    // them is not a booking the desk could act on.
    if (!guestName || !guestPhone || !guestEmail) return empty(request, 400)

    const roomSlug = str(payload.roomSlug, 120)

    // A guest who taps Send twice gets one row, not two. `is` rather than `eq`
    // for the slug, because `eq` against null matches nothing in PostgREST and
    // the guard would quietly stop working for a booking with no room on it.
    const query = supabase
      .from('bookings')
      .select('id')
      .eq('guest_email', guestEmail)
      .gte('created_at', since)
      .limit(1)

    const { data: recent } = await (roomSlug
      ? query.eq('room_slug', roomSlug)
      : query.is('room_slug', null))

    if (recent?.length) return empty(request, 202)

    const row = {
      room_slug: roomSlug,
      room_name: str(payload.roomName, 160),
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      check_in: date(payload.checkIn),
      check_out: date(payload.checkOut),
      nights: int(payload.nights, 0, 365),
      guests: int(payload.guests, 1, 64),
      coupon_code: str(payload.couponCode, 40),
      coupon_percent: int(payload.couponPercent, 0, 100),
      subtotal: int(payload.subtotal, 0, 10_000_000),
      discount: int(payload.discount, 0, 10_000_000),
      total: int(payload.total, 0, 10_000_000),
      note: str(payload.note, 2000),
    }

    const { error } = await supabase.from('bookings').insert(row)

    // The row is the record; the email and the spreadsheet line are courtesies
    // on top of it. Both run only once the insert has actually succeeded, and
    // neither can turn a saved booking into a 500 - each swallows its own
    // failure, and `allSettled` means a mail server being down cannot stop the
    // sheet from being written, or the other way round.
    if (!error) {
      const pending = afterResponse(
        Promise.allSettled([
          notify(
            `New booking: ${row.guest_name}, ${row.room_name ?? 'no room'}`,
            bookingEmail(row),
            bookingEmailHtml(row),
            row.guest_email,
          ),
          appendBooking(row),
        ]),
      )
      if (pending) await pending
    }

    return empty(request, error ? 500 : 204)
  }

  // ------------------------------------------------------------ enquiry ----
  if (kind === 'enquiry') {
    const name = str(payload.name, 120)
    const phone = str(payload.phone, 40)
    const topic = str(payload.topic, 120)

    if (!name || !phone || !topic) return empty(request, 400)

    const { data: recent } = await supabase
      .from('enquiries')
      .select('id')
      .eq('phone', phone)
      .gte('created_at', since)
      .limit(1)

    if (recent?.length) return empty(request, 202)

    const row = {
      name,
      phone,
      topic,
      // The contact form has a page of its own; nothing to disambiguate.
      source: null,
      check_in: date(payload.checkIn),
      check_out: date(payload.checkOut),
      guests: str(payload.guests, 20),
      message: str(payload.message, 4000),
    }

    const { error } = await supabase.from('enquiries').insert(row)

    // Same rule as a booking: the row is the record, the email and the
    // spreadsheet line are courtesies. Both run only after the insert has
    // succeeded, both swallow their own failures, and `allSettled` keeps one
    // being down from stopping the other.
    if (!error) {
      const pending = afterResponse(
        Promise.allSettled([
          notify(
            `New enquiry: ${row.topic}, ${row.name}`,
            enquiryEmail(row),
            enquiryEmailHtml(row),
            // A contact enquiry carries no email address - the form asks for a
            // phone, because the reply goes back over WhatsApp. So there is
            // nothing to set Reply-To to, and the desk answers from the card.
            null,
          ),
          appendEnquiry(row),
        ]),
      )
      if (pending) await pending
    }

    return empty(request, error ? 500 : 204)
  }

  // --------------------------------------------------------------- chat ----
  // A WhatsApp button pressed anywhere on the site. No name, no number - those
  // arrive in the chat itself. What is worth having is that somebody is on
  // their way and what they were looking at when they left.
  if (kind === 'chat') {
    const topic = str(payload.topic, 200)
    if (!topic) return empty(request, 400)

    const source = str(payload.source, 200)
    const since = new Date(Date.now() - CHAT_DEDUPE_WINDOW_MS).toISOString()

    const query = supabase
      .from('enquiries')
      .select('id')
      .is('name', null)
      .eq('topic', topic)
      .gte('created_at', since)
      .limit(1)

    const { data: recent } = await (source
      ? query.eq('source', source)
      : query.is('source', null))

    if (recent?.length) return empty(request, 202)

    const { error } = await supabase.from('enquiries').insert({
      name: null,
      phone: null,
      topic,
      source,
      message: str(payload.message, 1000),
    })

    return empty(request, error ? 500 : 204)
  }

  return empty(request, 400)
})
