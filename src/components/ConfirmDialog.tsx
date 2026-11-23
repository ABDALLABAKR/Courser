import { Modal } from './Modal';
import { ckb as t } from '../i18n/ckb';

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" hideClose>
      <p className="pb-5 text-[0.95rem] leading-relaxed text-muted">{body}</p>
      <div className="flex gap-2">
        <button type="button" data-autofocus onClick={onCancel} className="focus-ring h-11 flex-1 rounded-2xl bg-surface-2 font-bold hover:brightness-95">
          {t.cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`focus-ring h-11 flex-1 rounded-2xl font-extrabold text-white hover:brightness-110 ${danger ? 'bg-red-600' : 'bg-brand'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
