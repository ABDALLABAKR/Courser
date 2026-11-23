import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useGame } from './lib/net';
import { useT } from './lib/i18n';
import { Backdrop } from './components/Backdrop';
import { Home } from './screens/Home';
import { Lobby } from './screens/Lobby';
import { GameScreen } from './screens/Game';
import { FinalResults } from './screens/Final';
import { HowToModal, SettingsModal } from './screens/Modals';

const Admin = lazy(() => import('./admin/Admin'));

function Toast() {
  const t = useT();
  const notice = useGame((g) => g.notice);
  const [shown, setShown] = useState(notice);
  useEffect(() => {
    if (!notice) return;
    setShown(notice);
    const id = setTimeout(() => setShown(null), 3200);
    return () => clearTimeout(id);
  }, [notice]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4" aria-live="assertive">
      <AnimatePresence>
        {shown && (
          <motion.div key={shown.ts} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="rounded-2xl bg-navy px-5 py-3 text-center font-bold text-white shadow-2xl dark:bg-white dark:text-navy" role="status">
            {t(shown.key)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConnectionBanner() {
  const t = useT();
  const connected = useGame((g) => g.connected);
  const ever = useGame((g) => g.everConnected);
  const inRoom = useGame((g) => !!g.view);
  if (connected || !ever || !inRoom) return null;
  return <div className="fixed inset-x-0 top-0 z-[70] bg-coral py-1.5 text-center text-sm font-bold text-white" role="alert">{t('reconnecting')}</div>;
}

export function App() {
  const view = useGame((g) => g.view);
  if (location.pathname.startsWith('/admin')) {
    return <Suspense fallback={null}><Admin /></Suspense>;
  }
  let screen;
  if (!view) screen = <Home key="home" />;
  else if (view.phase === 'lobby') screen = <Lobby key="lobby" view={view} />;
  else if (view.phase === 'gameOver') screen = <FinalResults key="final" view={view} />;
  else screen = <GameScreen key="game" view={view} />;
  return (
    <>
      <Backdrop />
      <ConnectionBanner />
      {screen}
      <SettingsModal />
      <HowToModal />
      <Toast />
    </>
  );
}
