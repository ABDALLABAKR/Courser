import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { Tile } from './Board';
import { LogoMark } from './Logo';
import type { LetterState } from '../game/evaluate';
import { graphemes } from '../game/kurdish';
import { ckb as t } from '../i18n/ckb';

function Example({ word, at, state, text }: { word: string; at: number; state: LetterState; text: string }) {
  const letters = graphemes(word);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid w-[230px] max-w-full grid-cols-5 gap-1.5 tile-grid [container-type:inline-size]" dir="rtl">
        {letters.map((l, i) => (
          <Tile key={i} letter={l} index={0} state={i === at ? state : 'filled'} anim={i === at ? 'flip' : 'none'} />
        ))}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

const ex = {
  correct: { word: 'باران', at: 0 },
  present: { word: 'دەریا', at: 2 },
  absent: { word: 'هەنار', at: 3 },
};
const letterAt = (w: string, i: number) => graphemes(w)[i];

function sections(): Array<{ key: string; body: ReactNode }> {
  return [
    {
      key: 'welcome',
      body: (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <LogoMark size={64} />
          <h3 className="text-xl font-extrabold">{t.welcome}</h3>
          <p className="text-muted">{t.welcomeBody}</p>
        </div>
      ),
    },
    {
      key: 'rules',
      body: (
        <div className="flex flex-col gap-3">
          <p className="text-[1.02rem] font-bold">{t.helpIntro}</p>
          <ul className="list-disc space-y-1.5 ps-5 text-[0.95rem]">
            <li>{t.helpRule1}</li>
            <li>{t.helpRule2}</li>
            <li>{t.helpRtl}</li>
          </ul>
        </div>
      ),
    },
    {
      key: 'examples',
      body: (
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold">{t.helpExamples}</h3>
          <Example {...ex.correct} state="correct" text={t.helpCorrect(letterAt(ex.correct.word, ex.correct.at))} />
          <Example {...ex.present} state="present" text={t.helpPresent(letterAt(ex.present.word, ex.present.at))} />
          <Example {...ex.absent} state="absent" text={t.helpAbsent(letterAt(ex.absent.word, ex.absent.at))} />
        </div>
      ),
    },
    {
      key: 'letters',
      body: (
        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold">{t.helpLettersTitle}</h3>
          <p className="text-[0.95rem] leading-relaxed">{t.helpLetters}</p>
          <div className="flex flex-wrap justify-center gap-2" dir="rtl" aria-hidden>
            {[['ر', 'ڕ'], ['ل', 'ڵ'], ['و', 'ۆ'], ['ی', 'ێ'], ['ه', 'ە']].map(([a, b]) => (
              <span key={a} className="flex items-center gap-1 rounded-xl bg-surface-2 px-3 py-1.5 text-xl font-extrabold">
                {a}<span className="text-sm text-muted">≠</span>{b}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted">{t.helpKeyboard}</p>
        </div>
      ),
    },
    {
      key: 'modes',
      body: (
        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold">{t.helpModesTitle}</h3>
          <p className="text-[0.95rem] leading-relaxed">📅 {t.helpDaily}</p>
          <p className="text-[0.95rem] leading-relaxed">♾️ {t.helpUnlimited}</p>
        </div>
      ),
    },
  ];
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** First-run: show a paged tutorial instead of the full reference page. */
  onboarding: boolean;
}

export function HelpModal({ open, onClose, onboarding }: Props) {
  const [step, setStep] = useState(0);
  const all = sections();

  if (!onboarding) {
    return (
      <Modal open={open} onClose={onClose} title={t.helpTitle}>
        <div className="flex flex-col gap-6 divide-line pt-1">
          {all.slice(1).map((s) => (
            <section key={s.key}>{s.body}</section>
          ))}
        </div>
      </Modal>
    );
  }

  const last = step === all.length - 1;
  const finish = () => {
    setStep(0);
    onClose();
  };
  return (
    <Modal open={open} onClose={finish} title={t.helpTitle} size="sm">
      <div className="flex min-h-[340px] flex-col gap-5 pt-1">
        <div className="flex-1" key={step}>{all[step].body}</div>
        <div className="flex justify-center gap-1.5" aria-hidden>
          {all.map((s, i) => (
            <span key={s.key} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-brand' : 'w-1.5 bg-line'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="focus-ring h-11 rounded-2xl px-4 font-bold text-muted hover:bg-surface-2">
              {t.back}
            </button>
          ) : (
            <button type="button" onClick={finish} className="focus-ring h-11 rounded-2xl px-4 font-bold text-muted hover:bg-surface-2">
              {t.skip}
            </button>
          )}
          <button
            type="button"
            data-autofocus
            onClick={() => (last ? finish() : setStep(step + 1))}
            className="focus-ring h-11 flex-1 rounded-2xl bg-brand font-extrabold text-white hover:brightness-110"
          >
            {last ? t.start : t.next}
          </button>
        </div>
      </div>
    </Modal>
  );
}
