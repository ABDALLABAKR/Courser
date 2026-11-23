import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
} as const;

export const HelpIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9.5" /><path d="M9.6 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.6 2.3-2.6 3.8" /><circle cx="12" cy="17.2" r=".6" fill="currentColor" /></svg>
);
export const StatsIcon = (p: P) => (
  <svg {...base} {...p}><path d="M5 20V11M12 20V4M19 20v-6" /></svg>
);
export const SettingsIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const SunIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.6 6.6 0 0 0 11 11z" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
/** Backspace arrow pointing LEFT — in RTL text the caret deletes the leftmost glyph. */
export const BackspaceIcon = (p: P) => (
  <svg {...base} width={26} height={26} {...p}><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" /><path d="m12 9 6 6M18 9l-6 6" /></svg>
);
export const ShareIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>
);
export const CopyIcon = (p: P) => (
  <svg {...base} {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
);
export const RefreshIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const InfinityIcon = (p: P) => (
  <svg {...base} {...p}><path d="M7 16c-2.2 0-4-1.8-4-4s1.8-4 4-4c4 0 6 8 10 8 2.2 0 4-1.8 4-4s-1.8-4-4-4c-4 0-6 8-10 8z" /></svg>
);

/** Brand glyphs (simplified, monochrome). */
export const WhatsAppIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" /></svg>
);
export const TelegramIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13.2 1.9 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z" /></svg>
);
export const FacebookIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" /></svg>
);
export const LightbulbIcon = (p: P) => (
  <svg {...base} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" /></svg>
);
export const ArchiveIcon = (p: P) => (
  <svg {...base} {...p}><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" /><path d="M3 4v4.5h4.5M12 7.5V12l3 2" /></svg>
);
export const TrophyIcon = (p: P) => (
  <svg {...base} {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7M10 17h4" /></svg>
);
export const ImageIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="m20.5 16-5-5-8 8.5" /></svg>
);
export const FlagWordIcon = (p: P) => (
  <svg {...base} {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
);
