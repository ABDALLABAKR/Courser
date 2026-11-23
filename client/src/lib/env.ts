/** True when built as a single-file claude.ai Artifact (peer-hosted rooms, no backend). */
export const IS_ARTIFACT = import.meta.env.VITE_ARTIFACT === 'true';
/** The artifact's public URL, baked in at build time for invite links (optional). */
const ARTIFACT_URL = (import.meta.env.VITE_ARTIFACT_URL as string | undefined) ?? '';

/** Room code from the invite link: `?room=CODE` (web) or `#r-CODE` (artifact). */
export function invitedCode(): string {
  try {
    const q = new URLSearchParams(location.search).get('room');
    if (q) return q.toUpperCase();
    const m = /^#r-([A-Za-z0-9]{6})$/.exec(location.hash);
    return m ? m[1].toUpperCase() : '';
  } catch { return ''; }
}

/** Reflect the current room in the address bar so reloads and shared links keep it. */
export function setRoomInUrl(code: string | null) {
  try {
    if (IS_ARTIFACT) {
      const hash = code ? `#r-${code}` : '';
      if (location.hash !== hash) history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
      return;
    }
    const url = new URL(location.href);
    if (code) url.searchParams.set('room', code); else url.searchParams.delete('room');
    history.replaceState(null, '', url);
  } catch { /* sandboxed frames may refuse history changes */ }
}

export function inviteUrl(code: string): string {
  if (IS_ARTIFACT) return ARTIFACT_URL ? `${ARTIFACT_URL}#r-${code}` : '';
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set('room', code);
  return u.toString();
}
