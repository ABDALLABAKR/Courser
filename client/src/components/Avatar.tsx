import { useId } from 'react';
import type { Avatar as A } from '@wene/shared';

export const SKINS = ['#FFE0C7', '#F6C9A0', '#E4A97B', '#C68A5E', '#9C6644', '#6F4A33'];
export const COLORS = ['#20C5C5', '#FFCA45', '#FF746A', '#3A86FF', '#2B9348', '#9B5DE5', '#F15BB5', '#FF9F1C', '#4CC9F0', '#8D6346'];

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

const NAVY = '#18243B';

function Eyes({ v }: { v: number }) {
  const s = { stroke: NAVY, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };
  switch (v % 6) {
    case 0: return <g fill={NAVY}><circle cx="39" cy="47" r="3.6" /><circle cx="61" cy="47" r="3.6" /></g>;
    case 1: return <g {...s}><path d="M34 48q5-6 10 0" /><path d="M56 48q5-6 10 0" /></g>;
    case 2: return <g><circle cx="39" cy="46" r="6" fill="#fff" stroke={NAVY} strokeWidth="2" /><circle cx="61" cy="46" r="6" fill="#fff" stroke={NAVY} strokeWidth="2" /><circle cx="40" cy="47" r="3" fill={NAVY} /><circle cx="62" cy="47" r="3" fill={NAVY} /><circle cx="41" cy="45.5" r="1" fill="#fff" /><circle cx="63" cy="45.5" r="1" fill="#fff" /></g>;
    case 3: return <g><circle cx="39" cy="47" r="3.6" fill={NAVY} /><path d="M56 47h10" {...s} /></g>;
    case 4: return <g {...s}><path d="M34 46q5 4 10 0" /><path d="M56 46q5 4 10 0" /></g>;
    default: return <g fill={NAVY}><path d="M39 41l1.6 4 4 .3-3 2.6 1 4-3.6-2.2-3.6 2.2 1-4-3-2.6 4-.3z" /><path d="M61 41l1.6 4 4 .3-3 2.6 1 4-3.6-2.2-3.6 2.2 1-4-3-2.6 4-.3z" /></g>;
  }
}

function Mouth({ v }: { v: number }) {
  const s = { stroke: NAVY, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };
  switch (v % 6) {
    case 0: return <path d="M42 59q8 7 16 0" {...s} />;
    case 1: return <path d="M40 57q10 0 20 0q-2 11-10 11t-10-11z" fill={NAVY} stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />;
    case 2: return <ellipse cx="50" cy="61" rx="4.5" ry="5" fill={NAVY} />;
    case 3: return <g><path d="M42 58q8 6 16 0" {...s} /><path d="M47 61q3 6 6 0" fill="#FF746A" stroke={NAVY} strokeWidth="2" /></g>;
    case 4: return <path d="M43 61q7 2 14-4" {...s} />;
    default: return <g><path d="M40 57h20q-1 10-10 10t-10-10z" fill="#fff" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" /><path d="M40.5 60h19" stroke={NAVY} strokeWidth="1.5" /></g>;
  }
}

function Accessory({ v, color, uid }: { v: number; color: string; uid: string }) {
  switch (v % 8) {
    case 1: // Newroz flower crown
      return (
        <g>
          <path d="M22 34q28-16 56 0" stroke="#2B9348" strokeWidth="4" fill="none" strokeLinecap="round" />
          {[[24, 33, '#FF746A'], [35, 26, '#FFCA45'], [50, 23, '#F15BB5'], [65, 26, '#FFCA45'], [76, 33, '#FF746A']].map(([x, y, c], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={+x + 4 * Math.cos((a * Math.PI) / 180)} cy={+y + 4 * Math.sin((a * Math.PI) / 180)} r="3.4" fill={String(c)} />
              ))}
              <circle cx={+x} cy={+y} r="2.4" fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 2: // Jamana — patterned scarf wrapped as a head-wrap
      return (
        <g>
          <defs>
            <pattern id={`jm${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#F4F1EA" />
              <rect width="3" height="3" fill={NAVY} />
            </pattern>
          </defs>
          <path d="M19 40q2-24 31-24t31 24q-16-7-31-7t-31 7z" fill={`url(#jm${uid})`} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 40q31-12 62 0" stroke={NAVY} strokeWidth="2.5" fill="none" />
          <path d="M80 36l8 10-3 3-7-6" fill={`url(#jm${uid})`} stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    case 3: // Colourful headscarf with coin fringe
      return (
        <g>
          <path d="M16 62q-2-46 34-46t34 46q-4-24-34-26t-34 26z" fill={shade(color, -10)} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
          {[[34, 24], [50, 20], [66, 24], [26, 36], [74, 36]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#fff" opacity=".85" />)}
          {[30, 37, 44, 51, 58, 65, 72].map((x, i) => <circle key={x} cx={x} cy={35 + Math.abs(i - 3) * 0.9} r="2.2" fill="#FFCA45" stroke="#C9971B" strokeWidth=".8" />)}
        </g>
      );
    case 4: // Winter knit hat with pompom
      return (
        <g>
          <circle cx="50" cy="12" r="6" fill="#fff" stroke={NAVY} strokeWidth="2.5" />
          <path d="M20 38q0-24 30-24t30 24z" fill={shade(color, -20)} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="18" y="33" width="64" height="9" rx="4.5" fill="#fff" stroke={NAVY} strokeWidth="2.5" />
          <path d="M30 20l4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6" stroke="#fff" strokeWidth="2" fill="none" opacity=".8" />
        </g>
      );
    case 5: // glasses
      return (
        <g stroke={NAVY} strokeWidth="2.6" fill="rgba(255,255,255,.25)">
          <circle cx="39" cy="47" r="8.5" /><circle cx="61" cy="47" r="8.5" /><path d="M47.5 47h5" fill="none" />
        </g>
      );
    case 6: // sun headband (Newroz sun)
      return (
        <g>
          <path d="M21 36q29-13 58 0" stroke="#FF746A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <g transform="translate(50 22)">
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0-13l2.4 6h-4.8z" fill="#FFCA45" transform={`rotate(${i * 30})`} />)}
            <circle r="7.5" fill="#FFCA45" stroke="#E0A820" strokeWidth="1.5" />
          </g>
        </g>
      );
    case 7: // headphones
      return (
        <g>
          <path d="M20 50q0-34 30-34t30 34" stroke={NAVY} strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="13" y="44" width="11" height="18" rx="5" fill={shade(color, -30)} stroke={NAVY} strokeWidth="2.5" />
          <rect x="76" y="44" width="11" height="18" rx="5" fill={shade(color, -30)} stroke={NAVY} strokeWidth="2.5" />
        </g>
      );
    default:
      return (
        // simple hair tuft
        <path d="M30 26q8-12 20-8q10-8 20 4q-10-2-20 2q-10-4-20 2z" fill={NAVY} opacity=".85" />
      );
  }
}

export function Avatar({ a, size = 56, className = '', ring }: { a: A; size?: number; className?: string; ring?: string }) {
  const uid = useId().replace(/:/g, '');
  const skin = SKINS[a.skin % SKINS.length];
  const color = COLORS[a.color % COLORS.length];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden="true"
      style={ring ? { filter: `drop-shadow(0 0 0 ${ring})` } : undefined}>
      <circle cx="50" cy="50" r="48" fill={color} />
      <circle cx="50" cy="50" r="48" fill="url(#none)" stroke={shade(color, -35)} strokeWidth="3" />
      <clipPath id={`clip${uid}`}><circle cx="50" cy="50" r="46.5" /></clipPath>
      <g clipPath={`url(#clip${uid})`}>
        <path d="M14 100q2-24 36-24t36 24z" fill={shade(color, -40)} />
        <path d="M38 78q12 8 24 0" stroke={shade(color, 30)} strokeWidth="3" fill="none" />
      </g>
      <circle cx="50" cy="50" r="30" fill={skin} stroke={shade(skin.startsWith('#') ? skin : '#C68A5E', -50)} strokeWidth="2.5" />
      <circle cx="33" cy="57" r="4.5" fill="#FF746A" opacity=".35" />
      <circle cx="67" cy="57" r="4.5" fill="#FF746A" opacity=".35" />
      <Eyes v={a.eyes} />
      <Mouth v={a.mouth} />
      <Accessory v={a.acc} color={color} uid={uid} />
    </svg>
  );
}
