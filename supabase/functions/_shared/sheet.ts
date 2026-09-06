/**
 * The desk's fourth copy of a booking: a row in a Google Sheet.
 *
 * The other three each answer a different question. WhatsApp is the
 * conversation. The `bookings` row is what the panel shows. The email is what
 * gets noticed on a phone. This one is the spreadsheet the owner already keeps
 * - for a month's total, for handing to an accountant, for sorting by date the
 * way a spreadsheet lets you and a panel does not.
 *
 * Like the email, it is allowed to fail. It runs after the row is written, it
 * never throws into the request, and a sheet that is unreachable costs a line
 * in a spreadsheet and never a booking.
 *
 * Why an Apps Script web app rather than the Sheets API: the API needs a Google
 * Cloud project, a service account, a JSON key and a JWT signed on every call,
 * and the key would then be a second all-powerful credential to keep out of the
 * bundle. A bound Apps Script is a dozen lines the owner pastes into their own
 * sheet, runs as them, and needs no key at all - only a URL and a shared word
 * that proves the caller is us. See `google-sheet/README.md`.
 */

/** The deployed web app. Unset and nothing is sent, silently and by design. */
const URL_ = Deno.env.get('SHEETS_WEBHOOK_URL')

/**
 * Proves the caller is this function and not somebody who found the URL.
 *
 * An Apps Script web app deployed as "anyone" is a public address: no password,
 * no CORS to hide behind, and it appends whatever it is given. This word is
 * checked inside the script before it writes a row, so a stranger who guesses
 * the URL still cannot put a line in the hostel's books.
 */
const TOKEN = Deno.env.get('SHEETS_WEBHOOK_TOKEN')

/** A sheet that does not answer must not hold the function open indefinitely. */
const TIMEOUT_MS = 10_000

export function sheetReady() {
  return Boolean(URL_ && TOKEN)
}

/**
 * Appends one submission to the tab its kind belongs on.
 *
 * `kind` is what the script routes on: a booking lands on `Bookings` and an
 * enquiry on `Enquiries`, in the same spreadsheet. They are different shapes -
 * one carries money and a room, the other a question - and sharing a table
 * would mean half the columns blank on every row.
 *
 * The payload is an object, not an array of cells, and the script maps it onto
 * the header row it finds in the sheet. That is deliberate: the two sides can
 * then be changed one at a time. A field added here and not yet in the sheet is
 * ignored rather than shifting every column one to the right, which is the
 * failure a positional array gives you and which nobody notices for a month.
 *
 * A script that has not been redeployed yet answers `ignored` for a kind it
 * does not know, which is a 200 and therefore silent. That is the right way
 * round: the site must not start failing because a spreadsheet is behind.
 */
async function append(kind: 'booking' | 'enquiry', row: Record<string, unknown>) {
  if (!sheetReady()) return

  try {
    const response = await fetch(URL_!, {
      method: 'POST',
      // Apps Script hands `doPost` the raw body regardless of this, and
      // text/plain avoids a preflight on any path that might care.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: TOKEN, kind, row }),
      // A web app answers with a 302 to googleusercontent.com. `fetch` follows
      // it; without that the call looks like it worked and writes nothing.
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error(`[intake] sheet not updated (${kind}): HTTP ${response.status}`)
    }
  } catch (error) {
    // Logged, never thrown. The row is already saved and the guest is already
    // in WhatsApp - a spreadsheet is not worth failing any of that for.
    console.error(
      `[intake] sheet not updated (${kind}):`,
      error instanceof Error ? error.message : error,
    )
  }
}

export function appendBooking(row: Record<string, unknown>) {
  return append('booking', row)
}

export function appendEnquiry(row: Record<string, unknown>) {
  return append('enquiry', row)
}
