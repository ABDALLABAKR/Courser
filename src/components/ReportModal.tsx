import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { reportUrl, type ReportType } from '../lib/report';
import { ckb as t } from '../i18n/ckb';

interface Props {
  open: boolean;
  onClose: () => void;
  initialWord: string;
  initialType: ReportType;
  context: string;
  onSent: () => void;
}

export function ReportModal({ open, onClose, initialWord, initialType, context, onSent }: Props) {
  const [type, setType] = useState<ReportType>(initialType);
  const [word, setWord] = useState(initialWord);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setType(initialType);
      setWord(initialWord);
      setNote('');
    }
  }, [open, initialType, initialWord]);

  const types: Array<[ReportType, string]> = [
    ['missing', t.reportTypeMissing],
    ['wrong', t.reportTypeWrong],
    ['definition', t.reportTypeDefinition],
  ];

  const send = () => {
    window.open(reportUrl(type, word.trim(), note.trim(), context), '_blank', 'noopener,noreferrer');
    onSent();
  };

  return (
    <Modal open={open} onClose={onClose} title={t.report} size="sm">
      <div className="flex flex-col gap-4 pt-1">
        <p className="text-sm text-muted">{t.reportIntro}</p>
        <fieldset className="flex flex-col gap-1.5">
          {types.map(([v, label]) => (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                type === v ? 'border-brand bg-brand/10' : 'border-line'
              }`}
            >
              <input type="radio" name="report-type" value={v} checked={type === v} onChange={() => setType(v)} className="accent-[var(--brand)]" />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.reportWord}
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            dir="rtl"
            lang="ckb"
            maxLength={40}
            className="focus-ring rounded-xl border border-line bg-surface-2 px-3 py-2 text-lg font-extrabold"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.reportNote}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            dir="auto"
            rows={2}
            maxLength={500}
            className="focus-ring rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm font-normal"
          />
        </label>
        <button
          type="button"
          disabled={!word.trim()}
          onClick={send}
          className="focus-ring h-12 rounded-2xl bg-brand font-extrabold text-white hover:brightness-110 disabled:opacity-50"
        >
          {t.reportSend}
        </button>
      </div>
    </Modal>
  );
}
