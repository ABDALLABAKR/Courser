import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import type { ClientToServer, ServerToClient, RoomView, ChatMessage, Stroke, DrawOp } from '@wene/shared';
import { createApp, type App } from '../src/app';
import { loadConfig, defaultTiming } from '../src/config';

type C = Socket<ServerToClient, ClientToServer>;
let app: App;
let url = '';
const clients: C[] = [];

beforeAll(async () => {
  const config = { ...loadConfig({ NODE_ENV: 'test' }), dbPath: ':memory:', serveClient: null, host: '127.0.0.1',
    timing: { ...defaultTiming, chooseMs: 1500, turnEndMs: 400, drawMsOverride: 3000, disconnectGraceMs: 3000, artistGraceMs: 1000 } };
  app = createApp(config);
  const port = await app.listen(0);
  url = `http://127.0.0.1:${port}`;
});
afterAll(async () => {
  clients.forEach((c) => c.disconnect());
  await app.close();
});

interface Tracked { s: C; state: RoomView | null; chat: ChatMessage[]; ops: DrawOp[][]; sync: Stroke[] | null; raw: string[]; kicked: string | null }
function client(): Promise<Tracked> {
  const s: C = connect(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  clients.push(s);
  const t: Tracked = { s, state: null, chat: [], ops: [], sync: null, raw: [], kicked: null };
  s.onAny((ev, ...args) => t.raw.push(`${ev} ${JSON.stringify(args)}`));
  s.on('state', (v) => { t.state = v; });
  s.on('chat:msg', (m) => t.chat.push(m));
  s.on('draw:ops', (o) => t.ops.push(o));
  s.on('draw:sync', (st) => { t.sync = st; });
  s.on('kicked', (r) => { t.kicked = r; });
  return new Promise((ok) => s.on('connect', () => ok(t)));
}
const profile = (name: string) => ({ name, avatar: { skin: 1, color: 2, eyes: 0, mouth: 1, acc: 3 } });
const call = <T,>(fn: (ack: (r: any) => void) => void) => new Promise<T>((ok) => fn(ok));
const until = async (cond: () => boolean, ms = 4000) => {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error('timeout waiting for condition');
    await new Promise((r) => setTimeout(r, 15));
  }
};

describe('multiplayer over Socket.IO', () => {
  it('two players create/join, play a turn with drawing & a correct guess, without leaking the word', async () => {
    const a = await client();
    const b = await client();
    const created = await call<any>((ack) => a.s.emit('room:create', { profile: profile('Ashti') }, ack));
    expect(created.ok).toBe(true);
    expect(created.code).toMatch(/^[A-Z2-9]{6}$/);
    const joined = await call<any>((ack) => b.s.emit('room:join', { code: created.code.toLowerCase(), profile: profile('Bawan') }, ack));
    expect(joined.ok).toBe(true);
    await until(() => a.state?.players.length === 2 && b.state?.players.length === 2);
    expect(a.state!.hostId).toBe(created.playerId);

    // only the host may start
    const notHost = await call<any>((ack) => b.s.emit('room:start', ack));
    expect(notHost).toEqual({ ok: false, error: 'not_host' });
    const started = await call<any>((ack) => a.s.emit('room:start', ack));
    expect(started.ok).toBe(true);
    await until(() => a.state?.phase === 'choosing' && b.state?.phase === 'choosing');

    const artist = a.state!.artistId === created.playerId ? a : b;
    const guesser = artist === a ? b : a;
    expect(artist.state!.choices?.length).toBe(3);
    expect(guesser.state!.choices).toBeNull();
    const choices = artist.state!.choices!.map((c) => c.word);
    artist.s.emit('word:choose', 0);
    await until(() => guesser.state?.phase === 'drawing' && !!artist.state?.word);
    const word = artist.state!.word!;
    expect(word).toBe(choices[0]);
    expect(guesser.state!.word).toBeNull();
    expect(guesser.state!.wordMask!.length).toBe([...word].length);

    // guesser can't draw; artist can
    guesser.s.emit('draw:ops', [{ t: 'begin', id: 1, c: '#18243B', s: 10, e: 0, x: 10, y: 10 }]);
    artist.s.emit('draw:ops', [{ t: 'begin', id: 7, c: '#FF746A', s: 20, e: 0, x: 5000, y: 5000 }, { t: 'pts', id: 7, p: [5100, 5100, 5200, 5300] }]);
    await until(() => guesser.ops.length === 1);
    expect(guesser.ops[0][0]).toMatchObject({ t: 'begin', id: 7 });
    expect(artist.ops.length).toBe(0);

    // wrong guess is public; correct guess is hidden
    await call((ack) => guesser.s.emit('chat:send', 'نازانم', ack));
    await until(() => artist.chat.some((m) => m.text === 'نازانم'));
    const res = await call<any>((ack) => guesser.s.emit('chat:send', word, ack));
    expect(res.ok).toBe(true);
    await until(() => artist.state?.phase === 'turnEnd');
    expect(artist.chat.some((m) => m.text === word)).toBe(false);
    const me = guesser.state!.players.find((p) => p.id === guesser.state!.you)!;
    expect(me.score).toBeGreaterThanOrEqual(400);
    expect(guesser.state!.lastTurn!.word).toBe(word);

    // Before the turn ended, the guesser never received the secret or the choices.
    const beforeReveal = guesser.raw.slice(0, guesser.raw.findIndex((r) => r.includes('"correct"')));
    for (const line of beforeReveal) {
      for (const c of choices) expect(line.includes(`"${c}"`)).toBe(false);
    }
  });

  it('rejects bad room codes, unknown rooms, bad names and full rooms', async () => {
    const a = await client();
    expect(await call<any>((ack) => a.s.emit('room:join', { code: '12', profile: profile('Zana') }, ack))).toEqual({ ok: false, error: 'bad_code' });
    expect(await call<any>((ack) => a.s.emit('room:join', { code: 'ZZZZZZ', profile: profile('Zana') }, ack))).toEqual({ ok: false, error: 'room_not_found' });
    expect(await call<any>((ack) => a.s.emit('room:create', { profile: profile('x') }, ack))).toEqual({ ok: false, error: 'bad_name' });
    const r = await call<any>((ack) => a.s.emit('room:create', { profile: profile('Zana'), settings: { maxPlayers: 2 } }, ack));
    const b = await client();
    expect((await call<any>((ack) => b.s.emit('room:join', { code: r.code, profile: profile('Rêbaz') }, ack))).ok).toBe(true);
    const c = await client();
    expect(await call<any>((ack) => c.s.emit('room:join', { code: r.code, profile: profile('Shilan') }, ack))).toEqual({ ok: false, error: 'room_full' });
  });

  it('only the host can change settings; invalid settings are rejected', async () => {
    const a = await client();
    const b = await client();
    const r = await call<any>((ack) => a.s.emit('room:create', { profile: profile('Host') }, ack));
    await call((ack) => b.s.emit('room:join', { code: r.code, profile: profile('Guest') }, ack));
    expect(await call<any>((ack) => b.s.emit('room:settings', { rounds: 5 }, ack))).toEqual({ ok: false, error: 'not_host' });
    expect(await call<any>((ack) => a.s.emit('room:settings', { rounds: 4 }, ack))).toEqual({ ok: false, error: 'bad_settings' });
    expect(await call<any>((ack) => a.s.emit('room:settings', { rounds: 5, drawTime: 120 }, ack))).toEqual({ ok: true });
    await until(() => b.state?.settings.rounds === 5 && b.state.settings.drawTime === 120);
  });

  it('reconnects with the same session, keeps identity and migrates host', async () => {
    const a = await client();
    const b = await client();
    const r = await call<any>((ack) => a.s.emit('room:create', { profile: profile('Dilan') }, ack));
    const j = await call<any>((ack) => b.s.emit('room:join', { code: r.code, profile: profile('Hêmin') }, ack));
    await until(() => b.state?.players.length === 2);
    a.s.disconnect();
    await until(() => b.state?.hostId === j.playerId && b.state.players.find((p) => p.id === r.playerId)?.connected === false);
    const a2 = await client();
    const back = await call<any>((ack) => a2.s.emit('room:join', { code: r.code, profile: profile('Dilan'), session: r.session }, ack));
    expect(back).toMatchObject({ ok: true, playerId: r.playerId });
    await until(() => !!a2.state && a2.state.players.length === 2 && a2.state.players.every((p) => p.connected));
    // duplicate tab with same session replaces the older socket
    const a3 = await client();
    await call((ack) => a3.s.emit('room:join', { code: r.code, profile: profile('Dilan'), session: r.session }, ack));
    await until(() => a2.kicked === 'replaced');
    expect(a3.state!.players.length).toBe(2);
  });

  it('quick play matches two players into the same public room and auto-start is scheduled', async () => {
    const a = await client();
    const b = await client();
    const r1 = await call<any>((ack) => a.s.emit('room:quickplay', { profile: profile('Rojin') }, ack));
    const r2 = await call<any>((ack) => b.s.emit('room:quickplay', { profile: profile('Soran') }, ack));
    expect(r1.code).toBe(r2.code);
    await until(() => !!b.state?.autoStartAt);
    expect(b.state!.isPublic).toBe(true);
  });

  it('exposes health and public categories, and protects admin routes', async () => {
    expect(await (await fetch(`${url}/api/health`)).json()).toEqual({ ok: true });
    const cats = await (await fetch(`${url}/api/categories`)).json();
    expect(cats.length).toBeGreaterThanOrEqual(8);
    expect((await fetch(`${url}/api/admin/words`)).status).toBe(401);
    expect((await fetch(`${url}/api/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"password":"x"}' })).status).toBe(503);
  });
});
