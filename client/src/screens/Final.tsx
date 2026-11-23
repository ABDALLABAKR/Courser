import { motion } from 'motion/react';
import type { RoomView } from '@wene/shared';
import { actions } from '../lib/net';
import { useT } from '../lib/i18n';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { Confetti } from '../game/widgets';
import { IconCrown, IconLogout, IconPlay } from '../components/Icons';

export function FinalResults({ view }: { view: RoomView }) {
  const t = useT();
  const ranked = [...view.players].sort((a, b) => b.score - a.score);
  const rankOf = (score: number) => ranked.filter((p) => p.score > score).length + 1;
  const winners = ranked.filter((p) => p.score === ranked[0]?.score);
  const podium = [ranked[1], ranked[0], ranked[2]]; // 2nd, 1st, 3rd (visual order)
  const heights = ['h-24', 'h-36', 'h-16'];
  const isHost = view.hostId === view.you;
  return (
    <div className="mx-auto flex min-h-[var(--vvh)] max-w-xl flex-col items-center gap-5 p-4">
      <Confetti count={90} duration={3.5} />
      <motion.h1 className="pt-4 text-center text-3xl font-black sm:text-4xl" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        {t('finalResults')}
      </motion.h1>
      <motion.div className="text-center text-2xl font-black text-coral" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        {winners.length > 1 ? t('itsATie') : t('winnerIs', { name: winners[0]?.name ?? '' })} 🎉
      </motion.div>

      <div className="flex w-full items-end justify-center gap-2 sm:gap-4" dir="ltr">
        {podium.map((p, i) => p ? (
          <motion.div key={p.id} className="flex w-1/3 max-w-[150px] flex-col items-center"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + [0.3, 0.6, 0][i], type: 'spring', stiffness: 160, damping: 14 }}>
            {i === 1 && <span className="anim-bob text-sun"><IconCrown size={40} /></span>}
            <Avatar a={p.avatar} size={i === 1 ? 92 : 68} />
            <div className="mt-1 w-full truncate text-center font-extrabold" dir="auto">{p.name}</div>
            <div className="text-sm font-black text-teal-dark dark:text-teal">{t('pts', { n: p.score })}</div>
            <div className={`mt-1 flex w-full items-start justify-center rounded-t-2xl pt-2 text-3xl font-black text-white ${heights[i]} ${['bg-[#A8B5C8]', 'bg-sun', 'bg-[#C08552]'][i]}`}>
              {t.n(rankOf(p.score))}
            </div>
          </motion.div>
        ) : <div key={i} className="w-1/3 max-w-[150px]" />)}
      </div>

      <ul className="card w-full space-y-1 p-3">
        {ranked.map((p) => (
          <li key={p.id} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${p.id === view.you ? 'bg-teal/10' : ''}`}>
            <span className="w-6 text-center font-black">{t.n(rankOf(p.score))}</span>
            <Avatar a={p.avatar} size={36} />
            <span className="min-w-0 flex-1 truncate font-bold">{p.name}{p.id === view.you ? ` (${t('you')})` : ''}</span>
            <span className="font-black">{t.n(p.score)}</span>
          </li>
        ))}
      </ul>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        {isHost
          ? <Button size="lg" variant="teal" onClick={() => actions.playAgain()}><IconPlay /> {t('playAgain')}</Button>
          : <div className="text-muted flex items-center justify-center text-center font-bold">{t('waitingPlayAgain')}</div>}
        <Button size="lg" variant="ghost" onClick={() => actions.leave()}><IconLogout /> {t('backHome')}</Button>
      </div>
    </div>
  );
}
