/**
 * Runs the real server game code (server/src/socket.ts + game/Room.ts) inside the hosting
 * page. A minimal Socket.IO-shaped adapter stands in for the network.
 */
import type { RoomSettings } from '@wene/shared';
import { attachSocketHandlers } from '../../../server/src/socket';
import { RoomManager } from '../../../server/src/game/RoomManager';
import { pickWords, type WordEntry } from '../../../server/src/game/words';
import { Moderation } from '../../../server/src/moderation';
import { defaultTiming } from '../../../server/src/config';
import { DEMO_CATEGORIES, DEMO_WORDS } from '../../../server/src/data/demo-words';
import { setNextRoomCode } from './browserUtil';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler = (...args: any[]) => void;
export type Deliver = (socketId: string, event: string, args: unknown[]) => void;

export const WORDS: WordEntry[] = DEMO_WORDS.map(([word, meaning, difficulty, category], i) => ({ id: i + 1, word, meaning, difficulty, category }));

class ServerSocket {
  data: any = {};
  handshake: { headers: Record<string, string>; address: string };
  private handlers = new Map<string, Handler[]>();
  constructor(readonly id: string, private deliver: Deliver) {
    this.handshake = { headers: {}, address: id };
  }
  on(ev: string, fn: Handler) { this.handlers.set(ev, [...(this.handlers.get(ev) ?? []), fn]); return this; }
  emit(ev: string, ...args: unknown[]) { this.deliver(this.id, ev, args); return true; }
  join() {}
  leave() {}
  fire(ev: string, args: unknown[]) { for (const h of this.handlers.get(ev) ?? []) h(...args); }
  disconnect() { this.fire('disconnect', []); }
}

class FakeIO {
  sockets = { sockets: new Map<string, ServerSocket>() };
  engine = { clientsCount: 0 };
  private mws: ((s: ServerSocket, next: (e?: Error) => void) => void)[] = [];
  private onConn: ((s: ServerSocket) => void)[] = [];
  constructor(private deliver: Deliver) {}
  use(fn: (s: ServerSocket, next: (e?: Error) => void) => void) { this.mws.push(fn); }
  on(ev: string, fn: (s: ServerSocket) => void) { if (ev === 'connection') this.onConn.push(fn); }
  emit() { /* global broadcasts (online count) come from the lobby presence instead */ }
  to(id: string) { return { emit: (ev: string, ...args: unknown[]) => this.deliver(id, ev, args) }; }
  connect(id: string) {
    const s = new ServerSocket(id, this.deliver);
    let ok = true;
    for (const mw of this.mws) mw(s, (e) => { if (e) ok = false; });
    if (!ok) return null;
    this.sockets.sockets.set(id, s);
    this.engine.clientsCount = this.sockets.sockets.size;
    // socket.disconnect(true) from the duplicate-session logic
    (s as any).disconnect = () => this.drop(id);
    this.onConn.forEach((f) => f(s));
    return s;
  }
  drop(id: string) {
    const s = this.sockets.sockets.get(id);
    if (!s) return;
    this.sockets.sockets.delete(id);
    this.engine.clientsCount = this.sockets.sockets.size;
    s.fire('disconnect', []);
  }
}

export class HostServer {
  readonly io: FakeIO;
  readonly manager: RoomManager;
  constructor(readonly code: string, readonly isPublic: boolean, deliver: Deliver) {
    this.io = new FakeIO(deliver);
    this.manager = new RoomManager(defaultTiming, {
      emit: (socketId, event, ...args) => deliver(socketId, event, args),
      words: { pick: (n: number, s: RoomSettings, ex: Set<string>) => pickWords(WORDS, n, s, ex) },
    });
    const db = {
      categoryExists: (id: string) => DEMO_CATEGORIES.some((c) => c.id === id),
      addReport: () => { /* no moderation backend in the artifact build */ },
    };
    attachSocketHandlers(this.io as any, { manager: this.manager, moderation: new Moderation(() => []), db: db as any, trustProxy: false });
  }

  /** Make the next room this host creates use its channel's code. */
  prepareCode() { setNextRoomCode(this.code); }

  /** Re-create the room (same code) after taking over from a host that left. */
  recreate(settings?: Partial<RoomSettings>) {
    this.prepareCode();
    this.manager.create(this.isPublic, settings);
  }

  get room() { return this.manager.get(this.code); }

  receive(socketId: string, ev: string, args: unknown[], ack?: (res: unknown) => void) {
    const s = this.io.sockets.sockets.get(socketId) ?? this.io.connect(socketId);
    if (!s) return ack?.({ ok: false, error: 'rate_limited' });
    s.fire(ev, ack ? [...args, ack] : args);
  }

  disconnect(socketId: string) { this.io.drop(socketId); }

  close() { this.manager.close(); }
}
