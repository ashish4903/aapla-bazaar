import qrcode from 'qrcode-generator';

const QUIET = 4; // blank modules a scanner needs around the code

/** A QR code as one SVG path: { size, path }, in modules including the quiet zone */
export function qrPath(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  let path = '';
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) path += `M${col + QUIET} ${row + QUIET}h1v1h-1z`;
    }
  }
  return { size: count + 2 * QUIET, path };
}
