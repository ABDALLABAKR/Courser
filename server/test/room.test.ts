import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { answerKey, type RoomView } from '@wene/shared';
import { makeRoom, avatar } from './helpers';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

function setup(n = 3, timing = {}) {
  const r = makeRoom({ timing });
  const players = Array.from({ length: n }, (_, i) => r.room.addPlayer(`Player${i}`, avatar, `s${i}`));
  return { ...r, players };
}
const lastState = (to: ReturnType<typeof setup>['to'], sid: string) => to(sid, 'state').at(-1)!.args[0] as RoomView;

describe('Room lifecycle', () => {
  it('makes the first player host and requires 2 players to start', () => {
    const r = makeRoom();
    const a = r.room.addPlayer('Ana', avatar, 's0');
    expect(r.room.hostId).toBe(a.id);
    expect(r.room.start(a.id)).toBe('not_enough_players');
    const b = r.room.addPlayer('Bawan', avatar, 's1');
    expect(r.room.start(b.id)).toBe('not_host');
    expect(r.room.start(a.id)).toBeNull();
    expect(r.room.phase).toBe('choosing');
  });

  it('deduplicates nicknames within a room', () => {
    const r = makeRoom();
    r.room.addPlayer('Ana', avatar, 's0');
    const b = r.room.addPlayer('ana', avatar, 's1');
    expect(b.name).not.toBe('ana');
    expect(b.name).toMatch(/2$/);
  });

  it('enforces room capacity', () => {
    const r = makeRoom();
    r.room.settings.maxPlayers = 2;
    r.room.addPlayer('A1', avatar, 's0');
    expect(r.room.isFull()).toBe(false);
    r.room.addPlayer('B1', avatar, 's1');
    expect(r.room.isFull()).toBe(true);
  });

  it('rotates artists in join order and advances rounds', () => {
    const { room, players } = setup(3, { turnEndMs: 1000, chooseMs: 1000, drawMsOverride: 5000 });
    room.start(players[0].id);
    const artists: string[] = [];
    for (let turn = 0; turn < 6; turn++) {
      expect(room.phase).toBe('choosing');
      artists.push(room.artistId!);
      room.chooseWord(room.artistId!, 0);
      vi.advanceTimersByTime(5000); // time up
      expect(room.phase).toBe('turnEnd');
      vi.advanceTimersByTime(1000);
    }
    const ids = players.map((p) => p.id);
    expect(artists).toEqual([...ids, ...ids]);
    expect(room.phase).toBe('gameOver');
  });

  it('auto-picks a word if the artist does not choose within the time limit', () => {
    const { room, players } = setup(2, { chooseMs: 15000 });
    room.start(players[0].id);
    expect(room.phase).toBe('choosing');
    vi.advanceTimersByTime(14_999);
    expect(room.phase).toBe('choosing');
    vi.advanceTimersByTime(2);
    expect(room.phase).toBe('drawing');
    expect(room.secretWord).toBeTruthy();
  });

  it('ends the turn when the drawing timer expires', () => {
    const { room, players } = setup(2);
    room.start(players[0].id);
    room.chooseWord(room.artistId!, 0);
    vi.advanceTimersByTime(80_000 - 1);
    expect(room.phase).toBe('drawing');
    vi.advanceTimersByTime(1);
    expect(room.phase).toBe('turnEnd');
  });
});

describe('Guessing & scoring', () => {
  it('awards time-based points once, artist bonus, and ends early when all guessed', () => {
    const { room, players, to } = setup(3);
    room.start(players[0].id);
    const artist = players.find((p) => p.id === room.artistId)!;
    const [g1, g2] = players.filter((p) => p !== artist);
    room.chooseWord(artist.id, 0);
    const word = room.secretWord!;
    vi.advanceTimersByTime(20_000); // 60s of 80s left
    expect(room.chat(g1.id, word)).toBeNull();
    expect(g1.score).toBe(400);
    expect(g1.guessed).toBe(true);
    // Repeating the answer does not score again and is not shown to unguessed players.
    room.chat(g1.id, word);
    expect(g1.score).toBe(400);
    const g2Msgs = to(g2.socketId!, 'chat:msg').map((m) => JSON.stringify(m.args));
    expect(g2Msgs.some((m) => m.includes(word))).toBe(false);
    vi.advanceTimersByTime(40_000);
    room.chat(g2.id, ` ${word} `);
    expect(g2.score).toBe(200);
    expect(room.phase).toBe('turnEnd');
    expect(artist.score).toBe(400);
  });

  it('the artist cannot guess or reveal the word in chat', () => {
    const { room, players } = setup(2);
    room.start(players[0].id);
    const artist = players.find((p) => p.id === room.artistId)!;
    room.chooseWord(artist.id, 0);
    expect(room.chat(artist.id, `it is ${room.secretWord}`)).toBe('no_reveal');
    expect(artist.score).toBe(0);
  });

  it('sends near-miss feedback only to the guesser', () => {
    const { room, players, to } = setup(3);
    room.settings.categories = ['animals']; // only 'پشیلە'
    room.start(players[0].id);
    const artist = players.find((p) => p.id === room.artistId)!;
    const [g1, g2] = players.filter((p) => p !== artist);
    room.chooseWord(artist.id, 0);
    expect(room.secretWord).toBe('پشیلە');
    room.chat(g1.id, 'پشیله');
    expect(to(g1.socketId!, 'guess:result').at(-1)!.args[0]).toEqual({ result: 'close' });
    expect(to(g2.socketId!, 'chat:msg').some((m) => JSON.stringify(m.args).includes('پشیله'))).toBe(false);
    expect(g1.guessed).toBe(false);
  });

  it('rejects spam (same message repeated)', () => {
    const { room, players } = setup(2);
    room.chat(players[0].id, 'hello');
    room.chat(players[0].id, 'hello');
    room.chat(players[0].id, 'hello');
    expect(room.chat(players[0].id, 'hello')).toBe('spam');
  });
});

describe('Secret word privacy', () => {
  it('never includes the word or choices in any message to guessers before they guess', () => {
    const { room, players, sent } = setup(3);
    room.start(players[0].id);
    const artist = players.find((p) => p.id === room.artistId)!;
    const choices = room.choiceWords;
    room.chooseWord(artist.id, 1);
    const word = room.secretWord!;
    vi.advanceTimersByTime(70_000); // hints are revealed along the way
    const guesserSockets = players.filter((p) => p !== artist).map((p) => p.socketId);
    for (const m of sent.filter((m) => guesserSockets.includes(m.to))) {
      const json = JSON.stringify(m.args);
      for (const c of choices) expect(json.includes(`"${c}"`)).toBe(false);
      expect(json.includes(word)).toBe(false);
    }
    // the artist does see it
    expect(lastState(makeRoomTo(sent), artist.socketId!).word).toBe(word);
    // hidden mask keeps length & spaces but at most 2 letters revealed
    const g = players.find((p) => p !== artist)!;
    const mask = lastState(makeRoomTo(sent), g.socketId!).wordMask!;
    expect(mask.length).toBe([...word].length);
    expect(mask.filter((c) => c !== '_' && c !== ' ').length).toBeLessThanOrEqual(2);
  });
});
function makeRoomTo(sent: ReturnType<typeof setup>['sent']) {
  return (sid: string, ev?: string) => sent.filter((m) => m.to === sid && (!ev || m.event === ev));
}

describe('Drawing authorization', () => {
  it('only the current artist may draw, only while drawing, with validated ops', () => {
    const { room, players, to } = setup(2);
    expect(room.draw(players[0].id, [{ t: 'clear' }])).toBe(false); // lobby
    room.start(players[0].id);
    const artist = players.find((p) => p.id === room.artistId)!;
    const other = players.find((p) => p !== artist)!;
    expect(room.draw(artist.id, [{ t: 'begin', id: 1, c: '#18243B', s: 10, e: 0, x: 1, y: 1 }])).toBe(false); // choosing
    room.chooseWord(artist.id, 0);
    expect(room.draw(other.id, [{ t: 'begin', id: 1, c: '#18243B', s: 10, e: 0, x: 1, y: 1 }])).toBe(false);
    expect(room.draw(artist.id, [{ t: 'begin', id: 1, c: '#18243B', s: 10, e: 0, x: 1, y: 1 }, { t: 'pts', id: 1, p: [5, 5, 10, 10] }])).toBe(true);
    expect(room.draw(artist.id, [{ t: 'begin', id: 2, c: '#123456', s: 10, e: 0, x: 1, y: 1 }])).toBe(false); // colour not in palette
    expect(room.draw(artist.id, [{ t: 'begin', id: 3, c: '#18243B', s: 999, e: 0, x: 1, y: 1 }])).toBe(false); // bad size
    expect(room.draw(artist.id, [{ t: 'pts', id: 1, p: [99999, 1] }])).toBe(false); // out of range
    expect(room.strokeCount).toBe(1);
    expect(to(other.socketId!, 'draw:ops').length).toBe(1);
    expect(room.draw(artist.id, [{ t: 'undo' }])).toBe(true);
    expect(room.strokeCount).toBe(0);
    expect(room.draw(artist.id, [{ t: 'redo' }])).toBe(true);
    expect(room.strokeCount).toBe(1);
  });

  it('restores the current canvas for a player who joins mid-turn', () => {
    const { room, players, to } = setup(2);
    room.start(players[0].id);
    room.chooseWord(room.artistId!, 0);
    room.draw(room.artistId!, [{ t: 'begin', id: 1, c: '#18243B', s: 10, e: 0, x: 1, y: 1 }]);
    room.addPlayer('Late', avatar, 'late');
    const sync = to('late', 'draw:sync').at(-1)!.args[0] as unknown[];
    expect(sync.length).toBe(1);
  });
});

describe('Reconnection & host migration', () => {
  it('keeps score and identity when a player reconnects within the grace period', () => {
    const { room, players } = setup(2, { disconnectGraceMs: 30_000 });
    const p = players[1];
    p.score = 777;
    room.disconnect(p.id, 's1');
    expect(p.connected).toBe(false);
    vi.advanceTimersByTime(20_000);
    room.reconnect(p, 's1b');
    expect(p.connected).toBe(true);
    expect(room.players.get(p.id)!.score).toBe(777);
    vi.advanceTimersByTime(60_000);
    expect(room.players.has(p.id)).toBe(true);
  });

  it('removes players who do not come back', () => {
    const { room, players } = setup(3, { disconnectGraceMs: 30_000 });
    room.disconnect(players[2].id, 's2');
    vi.advanceTimersByTime(30_001);
    expect(room.players.has(players[2].id)).toBe(false);
  });

  it('transfers host to the longest-connected player when the host disconnects', () => {
    const { room, players } = setup(3);
    expect(room.hostId).toBe(players[0].id);
    room.disconnect(players[0].id, 's0');
    expect(room.hostId).toBe(players[1].id);
    room.removePlayer(players[1].id, 'left');
    expect(room.hostId).toBe(players[2].id);
  });

  it('ends the turn if the artist leaves, and returns to lobby if too few players remain', () => {
    const { room, players } = setup(3, { notEnoughPlayersMs: 5000, artistGraceMs: 3000 });
    room.start(players[0].id);
    const artist = room.artistId!;
    room.chooseWord(artist, 0);
    room.disconnect(artist, players.find((p) => p.id === artist)!.socketId!);
    vi.advanceTimersByTime(3001);
    expect(room.phase).toBe('turnEnd');
    const remaining = players.filter((p) => p.id !== artist);
    room.removePlayer(remaining[0].id, 'left');
    vi.advanceTimersByTime(5001);
    expect(room.phase).toBe('lobby');
  });

  it('kicked players are banned from rejoining with the same session', () => {
    const { room, players } = setup(3);
    room.kick(players[0].id, players[2].id);
    expect(room.players.has(players[2].id)).toBe(false);
    expect(room.isBanned(players[2].session)).toBe(true);
  });
});

describe('Late joiners', () => {
  it('start with zero points and are added to the current round queue', () => {
    const { room, players } = setup(2, { turnEndMs: 100, drawMsOverride: 1000 });
    room.start(players[0].id);
    room.chooseWord(room.artistId!, 0);
    const late = room.addPlayer('Late', avatar, 'late');
    expect(late.score).toBe(0);
    const seen: string[] = [room.artistId!];
    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(100);
      seen.push(room.artistId!);
      room.chooseWord(room.artistId!, 0);
    }
    expect(seen).toContain(late.id);
    expect(room.round).toBe(1);
    void answerKey;
  });
});
