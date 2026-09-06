/**
 * Roamigos - booking rows into a Google Sheet.
 *
 * Paste this into the sheet's own Apps Script project and deploy it as a web
 * app. The `intake` edge function posts a booking here as it is saved, and this
 * appends one line. Nothing else calls it and it answers nothing useful to
 * anybody who has not got the token.
 *
 * Setup lives in README.md next to this file.
 */

/** Must match SHEETS_WEBHOOK_TOKEN on the Supabase project. Change both together. */
var TOKEN = 'PASTE_THE_SAME_TOKEN_HERE';

/** The tab the rows go on. Created on first use if it is not there. */
var TAB = 'Bookings';

/**
 * The columns, in order, and where each one gets its value.
 *
 * The header row in the sheet is written from this list the first time the tab
 * is created, and after that the sheet's own header is what decides the order -
 * see `headerOf`. So somebody can drag a column in the spreadsheet and the rows
 * keep landing in the right place, which is the whole reason this maps by name
 * instead of pushing an array of cells.
 */
var COLUMNS = [
  ['Received', function (r) { return new Date(); }],
  ['Guest', function (r) { return r.guest_name; }],
  ['Phone', function (r) { return r.guest_phone; }],
  ['Email', function (r) { return r.guest_email; }],
  ['Room', function (r) { return r.room_name; }],
  ['Check in', function (r) { return r.check_in; }],
  ['Check out', function (r) { return r.check_out; }],
  ['Nights', function (r) { return r.nights; }],
  ['Guests', function (r) { return r.guests; }],
  ['Coupon', function (r) { return r.coupon_code || ''; }],
  ['Discount %', function (r) { return r.coupon_percent || ''; }],
  ['Subtotal', function (r) { return r.subtotal; }],
  ['Discount', function (r) { return r.discount; }],
  ['Total', function (r) { return r.total; }],
  ['Request', function (r) { return r.note || ''; }],
  ['Status', function (r) { return 'new'; }]
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // The only guard there is. A web app deployed as "anyone" is a public
    // address, so without this any passer-by could write the hostel's books.
    if (body.token !== TOKEN) {
      return ContentService.createTextOutput('no').setMimeType(ContentService.MimeType.TEXT);
    }

    if (body.kind !== 'booking') {
      return ContentService.createTextOutput('ignored').setMimeType(ContentService.MimeType.TEXT);
    }

    appendRow_(body.row || {});

    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // Logged into the script's own executions list, where the owner can see it.
    console.error(err);
    return ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * One booking, one line.
 *
 * A lock is taken because two guests pressing Send in the same second would
 * otherwise both read the same "last row" and one would overwrite the other.
 * It is a hostel, so that is rare - and it is exactly the kind of rare that is
 * impossible to explain afterwards when a booking is simply missing.
 */
function appendRow_(row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    var sheet = tab_();
    var header = headerOf_(sheet);

    var byName = {};
    for (var i = 0; i < COLUMNS.length; i++) byName[COLUMNS[i][0]] = COLUMNS[i][1];

    var line = header.map(function (name) {
      var read = byName[name];
      // A column somebody added by hand is left alone rather than overwritten.
      return read ? read(row) : '';
    });

    sheet.appendRow(line);
  } finally {
    lock.releaseLock();
  }
}

function tab_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(TAB);
  if (sheet) return sheet;

  sheet = book.insertSheet(TAB);
  var header = COLUMNS.map(function (c) { return c[0]; });

  sheet.appendRow(header);
  sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  return sheet;
}

/** The sheet's own header row, which is what decides column order. */
function headerOf_(sheet) {
  var width = sheet.getLastColumn();
  if (width === 0) return COLUMNS.map(function (c) { return c[0]; });

  return sheet.getRange(1, 1, 1, width).getValues()[0].map(function (v) {
    return String(v).trim();
  });
}
