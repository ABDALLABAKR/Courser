import { createStore, useStore } from './store';
export const ui = createStore({ settingsOpen: false, howOpen: false });
export const useUi = <S,>(sel: (s: ReturnType<typeof ui.get>) => S) => useStore(ui, sel);
