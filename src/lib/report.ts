/**
 * "Report a word" destination. No server and no tracking: the report opens
 * the player's own email app (when VITE_REPORT_EMAIL is set at build time)
 * or a pre-filled GitHub issue otherwise.
 */
export type ReportType = 'missing' | 'wrong' | 'definition';

const EMAIL: string | undefined = import.meta.env.VITE_REPORT_EMAIL || undefined;
const REPO_ISSUES = 'https://github.com/ABDALLABAKR/Courser/issues/new';

const TYPE_LABEL: Record<ReportType, string> = {
  missing: 'وشەی نوێ / Missing word',
  wrong: 'وشەی هەڵە / Wrong word',
  definition: 'واتای هەڵە / Wrong definition',
};

export function reportUrl(type: ReportType, word: string, note: string, context: string): string {
  const title = `[${TYPE_LABEL[type]}] ${word}`.trim();
  const body = [`Type: ${TYPE_LABEL[type]}`, `Word: ${word}`, note && `Note: ${note}`, `Context: ${context}`]
    .filter(Boolean)
    .join('\n');
  if (EMAIL) {
    return `mailto:${EMAIL}?subject=${encodeURIComponent(`WUSHA ${title}`)}&body=${encodeURIComponent(body)}`;
  }
  return `${REPO_ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=dictionary`;
}
