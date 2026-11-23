import { usePrefs, type Scene } from '../lib/prefs';

/**
 * Decorative, low-contrast scene illustrations drawn as simple original SVG shapes.
 * They suggest places rather than depict people, to avoid caricature.
 */
function Mountains() {
  return (
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <circle cx="1120" cy="120" r="60" fill="#FFCA45" opacity=".55" />
      <path d="M0 300 L180 150 L300 240 L470 90 L640 260 L800 140 L980 280 L1160 110 L1300 230 L1440 160 V400 H0z" fill="#20C5C5" opacity=".18" />
      <path d="M470 90 L520 140 L495 135 L470 155 L445 132 L425 138z M1160 110 L1205 150 L1182 148 L1160 165 L1140 146 L1118 150z" fill="#fff" opacity=".7" />
      <path d="M0 340 L220 220 L380 300 L560 200 L760 320 L940 230 L1120 320 L1300 240 L1440 300 V400 H0z" fill="#2B9348" opacity=".16" />
      <path d="M0 380 Q360 330 720 370 T1440 360 V400 H0z" fill="#2B9348" opacity=".22" />
    </svg>
  );
}

function Newroz() {
  return (
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <g transform="translate(1150 110)" opacity=".5">
        {Array.from({ length: 21 }, (_, i) => <path key={i} d="M0-80l9 26h-18z" fill="#FFCA45" transform={`rotate(${(i * 360) / 21})`} />)}
        <circle r="48" fill="#FFCA45" />
      </g>
      <path d="M0 330 Q300 250 620 320 T1440 290 V400 H0z" fill="#2B9348" opacity=".24" />
      <path d="M0 370 Q400 320 820 360 T1440 350 V400 H0z" fill="#80B918" opacity=".26" />
      {/* bonfire */}
      <g transform="translate(260 330)" opacity=".7">
        <path d="M-40 18 L40 -2 M-40 -2 L40 18" stroke="#8D6346" strokeWidth="10" strokeLinecap="round" />
        <path className="anim-flicker" d="M0 -110 C 30 -60 50 -40 34 0 H -34 C -50 -40 -20 -50 0 -110z" fill="#FF746A" />
        <path className="anim-flicker" d="M2 -70 C 20 -40 26 -24 18 0 H -16 C -26 -24 -10 -34 2 -70z" fill="#FFCA45" />
      </g>
      {/* spring flowers */}
      {[[120, 372], [420, 352], [560, 366], [880, 360], [1010, 372], [1300, 352]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity=".7">
          <path d="M0 0v18" stroke="#2B9348" strokeWidth="3" />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={7 * Math.cos((a * Math.PI) / 180)} cy={7 * Math.sin((a * Math.PI) / 180)} r="6" fill={i % 2 ? '#FF746A' : '#FFCA45'} />)}
          <circle r="4" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

function Village() {
  const houses = [[160, 250], [240, 270], [330, 240], [420, 265], [980, 255], [1070, 235], [1160, 260], [1250, 245]];
  return (
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <path d="M0 290 L300 200 L640 300 L1000 190 L1440 280 V400 H0z" fill="#C08552" opacity=".18" />
      {houses.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity=".55">
          <rect width="70" height="50" fill="#F4D6B0" stroke="#8D6346" strokeWidth="3" />
          <rect x="-6" y="-6" width="82" height="8" fill="#8D6346" />
          <rect x="12" y="16" width="14" height="14" fill="#20C5C5" stroke="#8D6346" strokeWidth="2" />
          <rect x="40" y="22" width="16" height="28" fill="#5B3A29" />
        </g>
      ))}
      <path d="M0 360 Q360 310 720 350 T1440 340 V400 H0z" fill="#2B9348" opacity=".22" />
      {[[700, 300], [760, 315], [1350, 300]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity=".5"><rect x="-4" y="0" width="8" height="40" fill="#8D6346" /><circle cy="-6" r="26" fill="#2B9348" /></g>
      ))}
    </svg>
  );
}

function Bazaar() {
  return (
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <g opacity=".22" fill="#C08552">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${i * 170 - 10} 400 V230 Q${i * 170 + 70} 120 ${i * 170 + 150} 230 V400 H${i * 170 + 130} V240 Q${i * 170 + 70} 160 ${i * 170 + 10} 240 V400z`} />
        ))}
      </g>
      {/* hanging lanterns & striped awnings */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${85 + i * 170} 170)`} opacity=".6">
          <path d="M0 -60v40" stroke="#5B3A29" strokeWidth="2" />
          <path d="M-12 -20h24l-6 34h-12z" fill={i % 2 ? '#FF746A' : '#FFCA45'} />
          <circle cy="20" r="4" fill="#FFCA45" />
        </g>
      ))}
      <rect x="0" y="372" width="1440" height="28" fill="#FF746A" opacity=".18" />
    </svg>
  );
}

const SCENES: Record<Exclude<Scene, 'none'>, () => React.JSX.Element> = { mountains: Mountains, newroz: Newroz, village: Village, bazaar: Bazaar };

export function Backdrop() {
  const scene = usePrefs((p) => p.scene);
  const S = scene !== 'none' ? SCENES[scene] : null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(32,197,197,.16),transparent_45%),radial-gradient(circle_at_90%_10%,rgba(255,202,69,.18),transparent_40%)]" />
      {/* faint kilim diamond lattice */}
      <svg className="absolute inset-0 h-full w-full opacity-[.05] dark:opacity-[.07]">
        <defs>
          <pattern id="lattice" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4 52 28 28 52 4 28z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M28 18 38 28 28 38 18 28z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lattice)" />
      </svg>
      {S && <div className="absolute inset-x-0 bottom-0 h-[42vh] max-h-[420px] dark:opacity-70"><S /></div>}
    </div>
  );
}
