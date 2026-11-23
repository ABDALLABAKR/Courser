import { memo } from 'react';
import type { LetterState } from '../game/evaluate';
import type { GameState } from '../game/engine';
import { MAX_GUESSES, WORD_LENGTH } from '../data/dictionary';
import { ckb as t } from '../i18n/ckb';
import { kuNum } from '../i18n';

type TileState = LetterState | 'empty' | 'filled';
type TileAnim = 'none' | 'pop' | 'flip' | 'bounce';

const STATE_LABEL: Record<LetterState, string> = {
  correct: t.stateCorrect,
  present: t.statePresent,
  absent: t.stateAbsent,
};

interface TileProps {
  letter?: string;
  state: TileState;
  anim: TileAnim;
  index: number;
}

export const Tile = memo(function Tile({ letter, state, anim, index }: TileProps) {
  const label = letter
    ? state === 'correct' || state === 'present' || state === 'absent'
      ? `${letter}، ${STATE_LABEL[state]}`
      : letter
    : t.emptyTile;
  return (
    <div
      className="tile"
      data-state={state}
      data-anim={anim}
      style={{ ['--i' as string]: index }}
      role="img"
      aria-label={label}
    >
      {/* Each tile shows one isolated letter; lang+dir keep shaping correct. */}
      <span lang="ckb" dir="rtl" aria-hidden>
        {letter}
      </span>
    </div>
  );
});

interface BoardProps {
  game: GameState;
  revealRow: number | null;
  shakeRow: boolean;
  winBounce: boolean;
}

/**
 * Six rows × five tiles. Rows use dir="rtl" so the FIRST letter of a word is
 * rendered in the RIGHT-most tile, exactly as Kurdish is read.
 */
export function Board({ game, revealRow, shakeRow, winBounce }: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, r) => r);
  const currentRow = game.guesses.length;

  return (
    <div className="board" role="group" aria-label={t.board} dir="rtl">
      {rows.map((r) => {
        const guess = game.guesses[r];
        const isCurrent = r === currentRow && game.status === 'playing';
        const letters = guess ? guess.letters : isCurrent ? game.current : [];
        const rowLabel = `${t.row(kuNum(r + 1))}${guess ? `: ${guess.letters.join('')}` : ''}`;
        const isWinningRow = winBounce && game.status === 'won' && r === game.guesses.length - 1;

        return (
          <div
            key={r}
            className="board-row"
            dir="rtl"
            role="group"
            aria-label={rowLabel}
            data-shake={isCurrent && shakeRow ? 'true' : 'false'}
          >
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const letter = letters[i];
              let state: TileState = letter ? 'filled' : 'empty';
              let anim: TileAnim = 'none';
              if (guess) {
                state = guess.states[i];
                if (revealRow === r) anim = 'flip';
                else if (isWinningRow) anim = 'bounce';
              } else if (isCurrent && letter) {
                anim = 'pop';
              }
              return <Tile key={i} index={i} letter={letter} state={state} anim={anim} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
