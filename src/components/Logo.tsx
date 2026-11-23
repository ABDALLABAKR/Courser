/**
 * WUSHA identity: a rounded "tile" mark carrying a stylised sun (a nod to the
 * Kurdish sun motif) above the wordmark وشە with the Latin transliteration.
 */
export function LogoMark({ size = 34 }: { size?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="wusha-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FBF80" />
          <stop offset="1" stopColor="#178A5A" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#wusha-g)" />
      <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="#000" strokeOpacity=".08" />
      <g transform="translate(20 20)">
        {rays.map((a) => (
          <rect key={a} x="-1.3" y="-14" width="2.6" height="5" rx="1.3" fill="#F2B929" transform={`rotate(${a})`} />
        ))}
        <circle r="6.6" fill="#F2B929" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="وشە — WUSHA">
      <LogoMark />
      <div className="flex flex-col leading-none">
        <span className="text-[1.6rem] font-extrabold tracking-tight text-fg" style={{ lineHeight: 1.05 }}>
          وشە
        </span>
        <span className="latin text-[0.62rem] font-bold tracking-[0.42em] text-muted">WUSHA</span>
      </div>
    </div>
  );
}
