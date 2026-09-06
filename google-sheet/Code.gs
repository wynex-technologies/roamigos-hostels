/**
 * Roamigos - guest submissions into a Google Sheet.
 *
 * Paste this into the sheet's own Apps Script project and deploy it as a web
 * app. The `intake` edge function posts here as a booking or an enquiry is
 * saved, and this appends one line to the tab that kind belongs on.
 *
 * Setup lives in README.md next to this file.
 */

/** Must match SHEETS_WEBHOOK_TOKEN on the Supabase project. Change both together. */
var TOKEN = 'PASTE_THE_SAME_TOKEN_HERE';

/**
 * One tab per kind of submission, and the columns each one gets.
 *
 * A booking and an enquiry are different shapes - one has money and a room, the
 * other has a question - so they do not belong in the same table. Mixing them
 * would mean half the columns blank on every row and no way to total a month.
 *
 * The header row is written from this list the first time a tab is created.
 * After that the sheet's own header decides the order, so a column dragged
 * around in the spreadsheet keeps getting the right values - see `headerOf_`.
 */
var SHEETS = {
  booking: {
    tab: 'Bookings',
    columns: [
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
    ]
  },

  enquiry: {
    tab: 'Enquiries',
    columns: [
      ['Received', function (r) { return new Date(); }],
      ['Name', function (r) { return r.name; }],
      ['Phone', function (r) { return r.phone; }],
      ['Topic', function (r) { return r.topic; }],
      ['Check in', function (r) { return r.check_in || ''; }],
      ['Check out', function (r) { return r.check_out || ''; }],
      ['Guests', function (r) { return r.guests || ''; }],
      ['Message', function (r) { return r.message || ''; }],
      ['Status', function (r) { return 'new'; }]
    ]
  }
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // The only guard there is. A web app deployed as "anyone" is a public
    // address, so without this any passer-by could write the hostel's books.
    if (body.token !== TOKEN) {
      return text_('no');
    }

    var config = SHEETS[body.kind];
    if (!config) return text_('ignored');

    appendRow_(config, body.row || {});

    return text_('ok');
  } catch (err) {
    // Logged into the script's own executions list, where the owner can see it.
    console.error(err);
    return text_('error');
  }
}

function text_(value) {
  return ContentService.createTextOutput(value).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * One submission, one line.
 *
 * A lock is taken because two guests pressing Send in the same second would
 * otherwise both read the same "last row" and one would overwrite the other.
 * It is a hostel, so that is rare - and it is exactly the kind of rare that is
 * impossible to explain afterwards when a booking is simply missing.
 */
function appendRow_(config, row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    var sheet = tab_(config);
    var header = headerOf_(sheet, config);

    var byName = {};
    for (var i = 0; i < config.columns.length; i++) {
      byName[config.columns[i][0]] = config.columns[i][1];
    }

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

function tab_(config) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(config.tab);
  if (sheet) return sheet;

  sheet = book.insertSheet(config.tab);
  var header = config.columns.map(function (c) { return c[0]; });

  sheet.appendRow(header);
  sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  return sheet;
}

/** The sheet's own header row, which is what decides column order. */
function headerOf_(sheet, config) {
  var width = sheet.getLastColumn();
  if (width === 0) return config.columns.map(function (c) { return c[0]; });

  return sheet.getRange(1, 1, 1, width).getValues()[0].map(function (v) {
    return String(v).trim();
  });
}
