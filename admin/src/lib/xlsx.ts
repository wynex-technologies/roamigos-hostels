import { isoDate } from './db'

/**
 * A real `.xlsx`, written by hand, with no dependency.
 *
 * The two maintained spreadsheet writers cost between four hundred kilobytes
 * and a megabyte in the bundle, and the one on npm under the obvious name is
 * deprecated there with open advisories against the version it still installs.
 * For eighteen columns of bookings, neither is a trade worth making.
 *
 * So this writes the file. An `.xlsx` is a zip of XML parts, and the minimum
 * Excel will open is small: a content-type map, two relationship files, a
 * workbook, a styles table and one worksheet. The zip entries are *stored*
 * rather than deflated, which is a legal zip and skips needing a compressor -
 * the file is a few times larger than it would be and still smaller than the
 * library that would have shrunk it.
 *
 * What the desk gets out of it, over the CSV this replaced: real date cells
 * that sort and filter as dates, real numbers that sum, a bold frozen header
 * row, an autofilter already on, and column widths that fit - none of which a
 * CSV can carry.
 */

/* -------------------------------------------------------------------- zip --- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let value = i
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

interface Entry {
  name: string
  bytes: Uint8Array
}

/**
 * The archive. Entries are stored uncompressed (method 0), so each one needs
 * only its CRC and its length - there is no compressor here and none needed.
 *
 * DOS date and time are written as a fixed, valid pair rather than the real
 * clock: nothing reads them, and a wrong one is the sort of thing that makes a
 * file open with a warning.
 */
function zip(entries: Entry[]) {
  const chunks: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  const encoder = new TextEncoder()

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const crc = crc32(entry.bytes)
    const size = entry.bytes.length

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true) // local file header
    local.setUint16(4, 20, true) // version needed
    local.setUint16(6, 0, true) // flags
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, 0, true) // time
    local.setUint16(12, 0x21, true) // date: 1 Jan 1980
    local.setUint32(14, crc, true)
    local.setUint32(18, size, true)
    local.setUint32(22, size, true)
    local.setUint16(26, name.length, true)
    local.setUint16(28, 0, true) // extra length

    chunks.push(new Uint8Array(local.buffer), name, entry.bytes)

    const dir = new DataView(new ArrayBuffer(46))
    dir.setUint32(0, 0x02014b50, true) // central directory header
    dir.setUint16(4, 20, true) // version made by
    dir.setUint16(6, 20, true) // version needed
    dir.setUint16(8, 0, true)
    dir.setUint16(10, 0, true)
    dir.setUint16(12, 0, true)
    dir.setUint16(14, 0x21, true)
    dir.setUint32(16, crc, true)
    dir.setUint32(20, size, true)
    dir.setUint32(24, size, true)
    dir.setUint16(28, name.length, true)
    dir.setUint16(30, 0, true)
    dir.setUint16(32, 0, true)
    dir.setUint16(34, 0, true)
    dir.setUint16(36, 0, true)
    dir.setUint32(38, 0, true)
    dir.setUint32(42, offset, true)

    central.push(new Uint8Array(dir.buffer), name)
    offset += 30 + name.length + size
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0)

  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true) // end of central directory
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)

  const parts = [...chunks, ...central, new Uint8Array(end.buffer)]
  const total = parts.reduce((sum, part) => sum + part.length, 0)

  const out = new Uint8Array(total)
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

/* -------------------------------------------------------------------- xml --- */

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // A control character is not valid in XML at all and Excel refuses the
    // whole file over one. Guest notes are typed by people, so they happen.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

/** 0 -> A, 25 -> Z, 26 -> AA. */
function columnLetter(index: number) {
  let letters = ''
  let n = index
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return letters
}

/**
 * Excel counts days from 30 December 1899, which is one day earlier than it
 * looks - the format carries a deliberate bug from Lotus 1-2-3, where 1900 is
 * treated as a leap year. Everything since has kept it for compatibility.
 */
const EPOCH = Date.UTC(1899, 11, 30)

function serialDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(iso)
  if (!match) return null

  const [, y, m, d, hh, mm, ss] = match
  const days = (Date.UTC(Number(y), Number(m) - 1, Number(d)) - EPOCH) / 86_400_000
  const seconds = Number(hh ?? 0) * 3600 + Number(mm ?? 0) * 60 + Number(ss ?? 0)

  return days + seconds / 86_400
}

/* ----------------------------------------------------------------- sheets --- */

export type CellType = 'text' | 'number' | 'money' | 'date' | 'datetime'

export interface Column<Row> {
  /** The heading, written the way it should read in the sheet. */
  header: string
  value: (row: Row) => string | number | null | undefined
  /** Text unless said otherwise. Wrong here means a date that will not sort. */
  type?: CellType
  /** Characters, roughly. Left alone and Excel uses its default. */
  width?: number
}

/** Style indexes, matching the `cellXfs` order in `STYLES` below. */
const STYLE = { plain: 0, header: 1, date: 2, datetime: 3, money: 4 } as const

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="3">
<numFmt numFmtId="164" formatCode="yyyy\\-mm\\-dd"/>
<numFmt numFmtId="165" formatCode="yyyy\\-mm\\-dd\\ hh:mm"/>
<numFmt numFmtId="166" formatCode="#,##0"/>
</numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F0EA"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

function cellXml(ref: string, raw: unknown, type: CellType, style?: number) {
  if (raw === null || raw === undefined || raw === '') return `<c r="${ref}"/>`

  if (type === 'number' || type === 'money') {
    const number = Number(raw)
    if (!Number.isFinite(number)) return `<c r="${ref}" t="inlineStr"><is><t>${esc(String(raw))}</t></is></c>`
    const style = type === 'money' ? STYLE.money : STYLE.plain
    return `<c r="${ref}" s="${style}"><v>${number}</v></c>`
  }

  if (type === 'date' || type === 'datetime') {
    const serial = serialDate(String(raw))
    // An unparseable date is written as the text it was, rather than dropped -
    // seeing something odd in the cell beats a blank nobody can explain.
    if (serial === null) return `<c r="${ref}" t="inlineStr"><is><t>${esc(String(raw))}</t></is></c>`
    const style = type === 'date' ? STYLE.date : STYLE.datetime
    return `<c r="${ref}" s="${style}"><v>${serial}</v></c>`
  }

  // `xml:space="preserve"` so a note that starts or ends with a space keeps it.
  const s = style === undefined ? '' : ` s="${style}"`
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(String(raw))}</t></is></c>`
}

function sheetXml<Row>(columns: Column<Row>[], rows: Row[]) {
  const lastColumn = columnLetter(columns.length - 1)
  const lastRow = rows.length + 1

  const cols = columns
    .map((column, index) =>
      column.width
        ? `<col min="${index + 1}" max="${index + 1}" width="${column.width}" customWidth="1"/>`
        : '',
    )
    .join('')

  const header = columns
    .map((column, index) => cellXml(`${columnLetter(index)}1`, column.header, 'text', STYLE.header))
    .join('')

  const body = rows
    .map((row, rowIndex) => {
      const number = rowIndex + 2
      const cells = columns
        .map((column, index) =>
          cellXml(`${columnLetter(index)}${number}`, column.value(row), column.type ?? 'text'),
        )
        .join('')
      return `<row r="${number}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${lastColumn}${lastRow}"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0">
<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
${cols ? `<cols>${cols}</cols>` : ''}
<sheetData><row r="1">${header}</row>${body}</sheetData>
<autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`
}

/* ------------------------------------------------------------------ build --- */

export function buildXlsx<Row>(sheetName: string, columns: Column<Row>[], rows: Row[]) {
  const encoder = new TextEncoder()
  const part = (name: string, xml: string) => ({ name, bytes: encoder.encode(xml) })

  // Excel is strict about the sheet name: 31 characters, and none of these.
  const safeName = esc(sheetName.replace(/[\\/*?:[\]]/g, ' ').slice(0, 31)) || 'Sheet1'

  return zip([
    part(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    ),
    part(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    ),
    part(
      'xl/workbook.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    ),
    part(
      'xl/_rels/workbook.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    ),
    part('xl/styles.xml', STYLES),
    part('xl/worksheets/sheet1.xml', sheetXml(columns, rows)),
  ])
}

export function downloadXlsx<Row>(
  filename: string,
  sheetName: string,
  columns: Column<Row>[],
  rows: Row[],
) {
  const blob = new Blob([buildXlsx(sheetName, columns, rows) as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ------------------------------------------------------------------ dates --- */

export { isoDate as isoToday } from './db'

/** The first of the current month, which is what an export usually wants. */
export function isoMonthStart() {
  const now = new Date()
  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

/** `2026-08-01` and `2026-08-31` become `2026-08-01_to_2026-08-31`, so a folder
    of exports sorts and reads without opening any of them. */
export const rangeLabel = (from: string, to: string) => `${from}_to_${to}`
