import type { GameState } from './engine';
import type { Stats } from './stats';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  test: (stats: Stats, game: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win', icon: '🌱', title: 'یەکەم بردنەوە',
    description: 'یەکەم وشەت دۆزییەوە',
    test: (s) => s.daily.wins + s.unlimited.wins >= 1,
  },
  {
    id: 'one-shot', icon: '🎯', title: 'تیری ڕاست',
    description: 'وشەکەت لە یەکەم هەوڵدا دۆزییەوە',
    test: (_s, g) => g.status === 'won' && g.guesses.length === 1,
  },
  {
    id: 'lightning', icon: '⚡', title: 'بروسکە',
    description: 'لە دوو هەوڵدا بردتەوە',
    test: (_s, g) => g.status === 'won' && g.guesses.length <= 2,
  },
  {
    id: 'clutch', icon: '😮‍💨', title: 'دوا هەناسە',
    description: 'لە شەشەمین هەوڵدا بردتەوە',
    test: (_s, g) => g.status === 'won' && g.guesses.length === 6,
  },
  {
    id: 'no-yellow', icon: '🟩', title: 'ڕێگای ڕاست',
    description: 'بەبێ هیچ خانەیەکی زەرد بردتەوە',
    test: (_s, g) =>
      g.status === 'won' && g.guesses.length > 1 &&
      g.guesses.every((r) => r.states.every((st) => st !== 'present')),
  },
  {
    id: 'streak-3', icon: '🔥', title: 'سێ ڕۆژ لەسەر یەک',
    description: 'زنجیرەیەکی ڕۆژانەی ٣ ڕۆژە',
    test: (s) => s.daily.maxStreak >= 3,
  },
  {
    id: 'streak-7', icon: '☀️', title: 'هەفتەیەکی تەواو',
    description: 'زنجیرەیەکی ڕۆژانەی ٧ ڕۆژە',
    test: (s) => s.daily.maxStreak >= 7,
  },
  {
    id: 'streak-30', icon: '🏔️', title: 'مانگێکی تەواو',
    description: 'زنجیرەیەکی ڕۆژانەی ٣٠ ڕۆژە',
    test: (s) => s.daily.maxStreak >= 30,
  },
  {
    id: 'daily-10', icon: '📅', title: 'میوانی هەمیشەیی',
    description: '١٠ ئاڵنگاریی ڕۆژانەت تەواو کرد',
    test: (s) => s.daily.played >= 10,
  },
  {
    id: 'unlimited-10', icon: '📚', title: 'تینووی وشە',
    description: '١٠ جار لە یاریی بێسنووردا بردتەوە',
    test: (s) => s.unlimited.wins >= 10,
  },
];

/** IDs that are satisfied now but were not unlocked before. */
export function newlyUnlocked(stats: Stats, game: GameState, unlocked: readonly string[]): Achievement[] {
  const have = new Set(unlocked);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.test(stats, game));
}
