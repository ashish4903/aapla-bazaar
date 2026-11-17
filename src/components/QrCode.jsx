import { useMemo } from 'react';
import { qrPath } from '../lib/qr';

/** Always black on white, in any theme, so every scanner reads it */
export default function QrCode({ text, label }) {
  const { size, path } = useMemo(() => qrPath(text), [text]);
  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
