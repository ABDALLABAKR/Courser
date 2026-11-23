import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';
import { Board } from '../src/components/Board';
import { newGame, submitGuess, addText } from '../src/game/engine';
import { dailyEntry, dailyNumber } from '../src/game/daily';

beforeAll(() => {
  // jsdom lacks matchMedia; report "reduced motion" so reveals are instant.
  window.matchMedia = ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wusha:v1:onboarded', 'true');
  localStorage.setItem('wusha:v1:settings', JSON.stringify({ sound: false }));
});
afterEach(cleanup);

describe('RTL board', () => {
  it('renders rows right-to-left with the first letter as the first tile', () => {
    const g = submitGuess(addText(newGame('daily', 1, 'باران'), 'هاوین'));
    if (!g.ok) throw new Error();
    render(<Board game={g.state} revealRow={null} shakeRow={false} winBounce={false} />);
    const rows = screen.getAllByRole('group').filter((el) => el.classList.contains('board-row'));
    expect(rows).toHaveLength(6);
    rows.forEach((r) => expect(r.getAttribute('dir')).toBe('rtl'));
    const tiles = within(rows[0]).getAllByRole('img');
    expect(tiles.map((t) => t.textContent)).toEqual(['ه', 'ا', 'و', 'ی', 'ن']);
    expect(tiles[1].getAttribute('data-state')).toBe('correct');
  });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });

describe('App integration', () => {
  it('sets the document up for Sorani', () => {
    render(<App />);
    expect(screen.getByRole('group', { name: 'تەختەکلیلی کوردی' })).toBeTruthy();
  });

  it('plays a full daily game with the physical keyboard and records stats', async () => {
    render(<App />);
    const answer = dailyEntry(dailyNumber()).letters;

    // An invalid word is rejected with a Kurdish message.
    for (const l of 'ببببب') key(l);
    key('Enter');
    expect(await screen.findByText('ئەم وشەیە لە فەرهەنگەکەدا نییە')).toBeTruthy();
    for (let i = 0; i < 5; i++) key('Backspace');

    for (const l of answer) key(l);
    await act(async () => {
      key('Enter');
      await new Promise((r) => setTimeout(r, 50));
    });

    const stats = JSON.parse(localStorage.getItem('wusha:v1:stats')!);
    expect(stats.daily.played).toBe(1);
    expect(stats.daily.wins).toBe(1);
    expect(stats.daily.distribution[0]).toBe(1);
    expect(stats.unlimited.played).toBe(0);

    const saved = JSON.parse(localStorage.getItem('wusha:v1:daily')!);
    expect(saved.status).toBe('won');
  });

  it('does not allow replaying a finished daily challenge after reload', () => {
    const { unmount } = render(<App />);
    for (const l of dailyEntry(dailyNumber()).letters) key(l);
    act(() => key('Enter'));
    unmount();
    render(<App />);
    key('ب');
    const saved = JSON.parse(localStorage.getItem('wusha:v1:daily')!);
    expect(saved.status).toBe('won');
    expect(saved.current).toEqual([]);
  });

  it('does not drop letters typed in a burst before React re-renders', () => {
    render(<App />);
    act(() => {
      for (const k of 'باران') window.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    });
    const tiles = document.querySelectorAll('.board-row')[0].querySelectorAll('.tile');
    expect([...tiles].map((t) => t.textContent).join('')).toBe('باران');
  });

  it('accepts pasted text and Latin-layout keys', () => {
    render(<App />);
    fireEvent(window, Object.assign(new Event('paste'), { clipboardData: { getData: () => '‏با' } }));
    key('r'); // → ر on the Central Kurdish layout
    const board = document.querySelector('.board')!;
    const firstRow = board.querySelectorAll('.board-row')[0];
    expect([...firstRow.querySelectorAll('.tile')].map((t) => t.textContent)).toEqual(['ب', 'ا', 'ر', '', '']);
  });
});
