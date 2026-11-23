import { useId } from 'react';

/**
 * Flag of Kurdistan: red, white and green horizontal stripes with a golden
 * sun of 21 rays (Rojî Kurdistan) in the centre. Drawn as inline SVG (no
 * image download), with a soft fabric shading and an optional slow shimmer.
 */
const RAYS = 21;
const CX = 450;
const CY = 300;
const R_OUT = 135;
const R_IN = 72;
const HALF = Math.PI / RAYS / 1.15;

const rayPath = (() => {
  let d = '';
  for (let i = 0; i < RAYS; i++) {
    const a = (i * 2 * Math.PI) / RAYS - Math.PI / 2;
    const p = (ang: number, r: number) =>
      `${(CX + r * Math.cos(ang)).toFixed(2)},${(CY + r * Math.sin(ang)).toFixed(2)}`;
    d += `M${p(a, R_OUT)}L${p(a - HALF, R_IN)}L${p(a + HALF, R_IN)}Z`;
  }
  return d;
})();

interface Props {
  /** Width in px; height is 2/3 of it. */
  width?: number;
  /** Slow light sweep across the fabric (disabled when motion is off). */
  shimmer?: boolean;
  className?: string;
  title?: string;
}

export function KurdistanFlag({ width = 36, shimmer = false, className = '', title = 'ئاڵای کوردستان' }: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={width}
      height={(width * 2) / 3}
      viewBox="0 0 900 600"
      role="img"
      aria-label={title}
      className={`kurdistan-flag shrink-0 ${className}`}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width="900" height="600" rx="70" />
        </clipPath>
        {/* gentle vertical folds, like cloth */}
        <linearGradient id={`${id}-folds`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".10" />
          <stop offset=".22" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".45" stopColor="#000" stopOpacity=".07" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#FFD54A" />
          <stop offset="1" stopColor="#FEBD11" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="900" height="200" fill="#ED2024" />
        <rect y="200" width="900" height="200" fill="#FFFFFF" />
        <rect y="400" width="900" height="200" fill="#278E43" />
        <path d={rayPath} fill={`url(#${id}-sun)`} />
        <circle cx={CX} cy={CY} r={R_IN + 6} fill={`url(#${id}-sun)`} />
        <rect width="900" height="600" fill={`url(#${id}-folds)`} />
        {shimmer && (
          <rect className="flag-sweep" x="-450" width="450" height="600" fill={`url(#${id}-sweep)`} />
        )}
      </g>
      <rect width="900" height="600" rx="70" fill="none" stroke="#000" strokeOpacity=".14" strokeWidth="10" />
    </svg>
  );
}
