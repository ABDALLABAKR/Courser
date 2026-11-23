/** Light link between the UI and the artifact runtime; safe to import from the regular web build. */
import { createStore, useStore } from '../lib/store';

export const bridge = createStore({ isHost: false, multiplayer: false, bots: 0, practice: false });
export const useBridge = <S,>(sel: (s: ReturnType<typeof bridge.get>) => S) => useStore(bridge, sel);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const bridgeActions: {
  practice: (profile: unknown) => Promise<any>;
  addBot: () => void;
  removeBots: () => void;
} = {
  practice: async () => ({ ok: false, error: 'generic' }),
  addBot: () => {},
  removeBots: () => {},
};
