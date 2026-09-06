# Guest submissions into a Google Sheet

The fourth copy. WhatsApp is the conversation, the table row is what the panel
shows, the email is what gets noticed on a phone, and this is the spreadsheet
the owner already keeps.

One spreadsheet, two kinds. Bookings land on a tab per month - `Sep-2026`,
`Oct-2026` - and contact enquiries on a single `Enquiries` tab. They are
different shapes, one carrying money and a room and the other a question, so
sharing a table would leave half the columns blank on every row and no way to
total a month.

Every tab is created the first time something needs it, header and all. The
month tab is worked out from today's date on each submission, so the new one
appears by itself when the first booking of the month lands: nothing runs at
midnight, nothing has to be rolled over, and a quiet month simply has no tab.

`Code.gs` is a bound Apps Script: it lives inside the sheet, runs as the person
who owns the sheet, and needs no key. The `intake` edge function posts to it as
a booking or an enquiry is saved.

## Why not the Sheets API

It would need a Google Cloud project, a service account, a JSON key and a JWT
signed on every call - and that key would be a second credential with wide
access to keep out of the bundle and off the web server. This needs a URL and a
shared word. For one line appended per booking, that trade is not close.

## Setup, once

1. Open the sheet the submissions should land in. A blank one is fine - each
   tab is created with its header the first time something of that kind
   arrives.

2. **Extensions -> Apps Script**. Delete whatever is in `Code.gs` and paste this
   folder's `Code.gs` over it.

3. Make up a long random word and put it at the top of the script, replacing
   `PASTE_THE_SAME_TOKEN_HERE`. Anything unguessable works:

   ```sh
   openssl rand -hex 24
   ```

4. Save, then **Deploy -> New deployment**, and set:

   | | |
   | --- | --- |
   | Type | Web app |
   | Execute as | **Me** |
   | Who has access | **Anyone** |

   "Anyone" is required and is why the token exists: an edge function arrives
   with no Google session, so there is nobody for Google to authorise. Access
   control is the token check in `doPost`, not Google's.

   Google asks to authorise the script on the first deployment, and warns that
   it is unverified. It is your own script in your own sheet; continue past it.

5. Copy the web app URL. It ends in `/exec`.

6. Give both to Supabase, using the same token as step 3:

   ```sh
   npx supabase secrets set SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/…/exec"
   npx supabase secrets set SHEETS_WEBHOOK_TOKEN="the same word"
   npx supabase functions deploy intake
   ```

Unset either secret and nothing is sent, silently - the site, the panel and the
email carry on exactly as before.

## Monthly tabs

`monthly` in `SHEETS` is what splits a kind by month. It is on for bookings and
off for enquiries: a month of bookings is a figure somebody totals, while
enquiries are a list to work through. Flip either flag and the change takes
effect on the next submission.

The month is read in the **spreadsheet's** timezone, not the script's. That
matters at the one moment it is hardest to notice: a booking taken at half past
eleven on the night of the 30th belongs to that month, and reading the clock in
UTC would quietly file it under the next one.

## Changing the columns

The sheet's own header row decides the order, so a column dragged around in the
spreadsheet keeps getting the right values, and a column added by hand is left
alone rather than overwritten.

To add a field, add a line to that kind's `columns` in `Code.gs` **and** put the
same heading in that tab's first row. A field the script knows about but the
sheet has no column for is simply not written; a column the script does not
know about is left blank. Neither shifts anything, which is the failure a
positional list of cells gives you and which nobody notices for a month.

## Redeploying the script

Editing `Code.gs` is not enough on its own. **Deploy -> Manage deployments ->**
the pencil **-> Version: New version -> Deploy**. The URL stays the same, so
nothing needs changing on the Supabase side.

## When it does not work

The script's own **Executions** list (left rail in the Apps Script editor) shows
every call and its error. Nothing listed at all means the request never arrived:
check the URL ends in `/exec` and that the deployment is "Anyone".

`no` returned to the caller means the tokens do not match. The edge function
logs its side as `[intake] sheet not updated: …`.

Nothing here can hold up a booking. A sheet that is unreachable costs a line in
a spreadsheet; the guest still reaches WhatsApp, the panel still has the row and
the desk still gets the email.
