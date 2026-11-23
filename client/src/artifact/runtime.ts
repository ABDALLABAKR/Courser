/**
 * Artifact runtime: stands in for the Socket.IO server.
 *
 * The page that creates a room hosts it (HostServer runs the real game code). Other pages
 * reach that host over the encrypted Mesh. If the host leaves, the remaining players
 * elect the page with the lowest peer label as the new host. It reopens the same room
 * code (back in the lobby) and everyone's client rejoins automatically.
 */
import type { RoomView } from '@wene/shared';
import { bridge, bridgeActions } from './bridge';
import { HostServer } from './hostServer';
import { Mesh, type Peer } from './mesh';
import { Bot } from './bots';
import { roomCode } from './browserUtil';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ack = ((res: any) => void) | undefined;
type Fire = (ev: string, ...args: unknown[]) => void;


const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const gameName = (code: string) => `g-${code.toLowerCase()}`;
const PUBLIC_EVENTS = new Set(['draw:ops', 'draw:sync', 'reaction', 'chat:history']);
const ROUTED_LOCALLY = new Set(['room:create', 'room:quickplay', 'room:join', 'room:leave']);

class Runtime {
  private fire: Fire = () => {};
  private mesh: Mesh | null = null;
  private host: HostServer | null = null;
  private bots: Bot[] = [];
  private gameCode: string | null = null;
  private hostPeer: string | null = null;
  private wasPublic = false;
  private myPlayerId: string | null = null;
  private heldState: unknown[] | null = null;
  private acks = new Map<string, (res: unknown) => void>();
  private ackSeq = 0;
  private connected = false;
  private electionTimer: ReturnType<typeof setTimeout> | null = null;
  private outbox = new Map<string, { ev: string; args: unknown[]; targets: string[]; secret: boolean }>();
  private outboxQueued = false;
  private lastLobbyPresence = '';

  async start(fire: Fire) {
    this.fire = fire;
    this.mesh = await Mesh.create().catch(() => null);
    if (this.mesh) {
      const mesh = this.mesh;
      bridge.set({ multiplayer: true });
      mesh.onLobbyPeers = (peers) => this.fire('online', Math.max(1, peers.length));
      mesh.onMessage = (from, payload) => this.onMeshMessage(from, payload);
      mesh.onGamePeers = (c) => {
        if (this.host) for (const p of c.left) this.host.disconnect(p.peer);
        this.checkHost();
      };
    }
    this.setConnected(true);
    this.fire('online', 1);
  }

  private setConnected(v: boolean) {
    if (this.connected === v) return;
    this.connected = v;
    this.fire(v ? 'connect' : 'disconnect');
  }

  // ------------------------------------------------------------ client → server
  emit(ev: string, args: unknown[], ack: Ack) {
    if (ROUTED_LOCALLY.has(ev)) return void this.route(ev, args, ack);
    this.toHost(ev, args, ack);
  }

  private async route(ev: string, args: unknown[], ack: Ack) {
    const payload = (args[0] ?? {}) as any;
    if (ev === 'room:leave') {
      this.toHost('room:leave', [], undefined);
      await this.leaveGame();
      return;
    }
    if (ev === 'room:create') return this.hostNew(false, 'room:create', payload, ack);
    if (ev === 'room:quickplay') {
      const pub = this.findPublicGame();
      if (pub) return this.joinRemote(pub, { code: pub, profile: payload.profile, session: payload.session }, ack);
      return this.hostNew(true, 'room:quickplay', payload, ack);
    }
    if (ev === 'room:join') {
      const code = String(payload.code ?? '').trim().toUpperCase();
      if (this.host && this.host.code === code) return this.toHost(ev, args, ack);
      return this.joinRemote(code, payload, ack);
    }
  }

  /** Practice room with bots, hosted locally and kept off the shared channel. */
  async practice(profile: unknown, bots = 3) {
    bridge.set({ practice: true });
    const res = await new Promise<any>((ok) => this.hostNew(false, 'room:create', { profile }, ok, true));
    if (res?.ok) for (let i = 0; i < bots; i++) this.addBot();
    return res;
  }

  addBot() {
    if (!this.host || this.bots.length >= 5) return;
    const bot = new Bot(this.host, this.bots.length);
    this.bots.push(bot);
    bot.join();
    bridge.set({ bots: this.bots.length });
  }

  removeBots() {
    this.bots.forEach((b) => b.leave());
    this.bots = [];
    bridge.set({ bots: 0 });
  }

  private async hostNew(isPublic: boolean, ev: string, payload: unknown, ack: Ack, offline = false) {
    await this.leaveGame();
    const code = roomCode();
    this.startHost(code, isPublic);
    if (this.mesh && !offline) {
      try {
        await this.mesh.joinGame(gameName(code));
        await this.mesh.setGamePresence({ code, host: true, member: true, pub: isPublic });
      } catch { /* stays a local-only room */ }
    }
    this.gameCode = code;
    this.host!.prepareCode();
    this.toHost(ev, [payload], ack);
  }

  private startHost(code: string, isPublic: boolean) {
    this.host?.close();
    this.host = new HostServer(code, isPublic, (sid, ev, args) => this.deliver(sid, ev, args));
    this.wasPublic = isPublic;
    bridge.set({ isHost: true });
  }

  private async joinRemote(code: string, payload: any, ack: Ack) {
    if (!this.mesh) return ack?.({ ok: false, error: 'room_not_found' });
    if (!/^[A-Z0-9]{6}$/.test(code)) return ack?.({ ok: false, error: 'bad_code' });
    if (this.gameCode !== code) {
      await this.leaveGame();
      try { await this.mesh.joinGame(gameName(code)); } catch { return ack?.({ ok: false, error: 'room_not_found' }); }
      this.gameCode = code;
    }
    const host = await this.waitForHost(code, 4500);
    if (!host) {
      await this.leaveGame();
      return ack?.({ ok: false, error: 'room_not_found' });
    }
    this.hostPeer = host;
    this.toHost('room:join', [{ ...payload, code }], ack);
  }

  private waitForHost(code: string, ms: number): Promise<string | null> {
    const find = () => this.mesh?.gamePeers().find((p) => !p.sameTab && p.presence?.host === true && p.presence?.code === code && typeof p.presence?.pk === 'string')?.peer ?? null;
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const h = find();
        if (h || Date.now() - t0 > ms) return resolve(h);
        setTimeout(tick, 150);
      };
      tick();
    });
  }

  private toHost(ev: string, args: unknown[], ack: Ack) {
    const wrapped: Ack = ack && ((res: any) => {
      if (res?.ok && res.playerId) {
        this.myPlayerId = res.playerId;
        void this.mesh?.setGamePresence({ member: true });
        if (this.heldState) { const s = this.heldState; this.heldState = null; this.onServerEvent('state', s); }
      }
      ack(res);
    });
    if (this.host && this.host.code === this.gameCode) {
      const a = clone(args);
      queueMicrotask(() => this.host?.receive('local', ev, a, wrapped && ((r) => queueMicrotask(() => wrapped(clone(r))))));
      return;
    }
    if (!this.mesh || !this.hostPeer) return wrapped?.({ ok: false, error: 'not_in_room' });
    let k: string | undefined;
    if (wrapped) { k = (++this.ackSeq).toString(36); this.acks.set(k, wrapped); }
    // Drawing strokes are public anyway; everything else (guesses, chat, sessions) is encrypted.
    this.mesh.send([this.hostPeer], { c2s: 1, ev, a: args, k }, ev !== 'draw:ops');
  }

  // ------------------------------------------------------------ server → clients (host side)
  private deliver(socketId: string, ev: string, args: unknown[]) {
    if (socketId === 'local') {
      const a = clone(args);
      queueMicrotask(() => this.onServerEvent(ev, a));
      if (ev === 'state') this.updateLobbyPresence(args[0] as RoomView);
      return;
    }
    if (socketId.startsWith('bot-')) {
      const bot = this.bots.find((b) => b.id === socketId);
      const a = clone(args);
      if (bot) queueMicrotask(() => bot.receive(ev, a));
      return;
    }
    // Remote peers: group identical public payloads into one broadcast, encrypt private ones.
    let sendArgs = args;
    let secret = ev === '__ack' || ev === 'guess:result';
    if (ev === 'state') {
      const v = args[0] as RoomView;
      secret = !!(v.word || v.choices);
      if (!secret) sendArgs = [{ ...v, you: '' }];
    }
    if (ev === 'chat:msg') {
      const kind = (args[0] as any)?.kind;
      secret = kind === 'guessedChat' || kind === 'close';
    }
    const key = secret ? `${socketId}\u0000${ev}\u0000${Math.random()}` : `${ev}\u0000${JSON.stringify(sendArgs)}`;
    const entry = this.outbox.get(key) ?? { ev, args: sendArgs, targets: [], secret };
    entry.targets.push(socketId);
    this.outbox.set(key, entry);
    if (!this.outboxQueued) {
      this.outboxQueued = true;
      queueMicrotask(() => this.flushOutbox());
    }
  }

  private flushOutbox() {
    this.outboxQueued = false;
    const groups = [...this.outbox.values()];
    this.outbox.clear();
    const remote = [...(this.host?.io.sockets.sockets.keys() ?? [])].filter((id) => id !== 'local' && !id.startsWith('bot-')).length;
    for (const g of groups) {
      if (!this.mesh) break;
      // Plain text only when every remote player gets the same thing (or it is drawing data, which
      // everyone sees on screen anyway). Anything addressed to some players only is encrypted per
      // player: that covers a near-miss guess echoed to its author, acks, and states with the word.
      const toAll = g.targets.length >= remote;
      const secret = g.secret || (!toAll && !PUBLIC_EVENTS.has(g.ev));
      this.mesh.send(secret || !toAll ? g.targets : null, { ev: g.ev, a: g.args }, secret);
    }
  }

  private updateLobbyPresence(v: RoomView) {
    if (!this.mesh || !this.host?.isPublic || bridge.get().practice) return;
    const p = { pub: v.code, n: v.players.length, max: v.settings.maxPlayers, ph: v.phase };
    const s = JSON.stringify(p);
    if (s === this.lastLobbyPresence) return;
    this.lastLobbyPresence = s;
    void this.mesh.lobbyPresence(p);
  }

  private findPublicGame(): string | null {
    const peers = this.mesh?.lobbyPeers() ?? [];
    const open = peers
      .filter((p) => !p.sameTab && typeof p.presence?.pub === 'string' && (p.presence.n as number) < (p.presence.max as number) && p.presence.ph !== 'gameOver')
      .sort((a, b) => (a.presence.ph === 'lobby' ? 0 : 1) - (b.presence.ph === 'lobby' ? 0 : 1) || (b.presence.n as number) - (a.presence.n as number));
    return (open[0]?.presence.pub as string) ?? null;
  }

  // ------------------------------------------------------------ mesh inbound
  private onMeshMessage(from: string, payload: any) {
    if (!payload || typeof payload !== 'object' || typeof payload.ev !== 'string' || !Array.isArray(payload.a)) return;
    if (payload.c2s) {
      if (!this.host) return;
      const k = typeof payload.k === 'string' ? payload.k : undefined;
      this.host.receive(from, payload.ev, payload.a, k ? (res) => this.deliver(from, '__ack', [{ k, res }]) : undefined);
      return;
    }
    if (from !== this.hostPeer) return; // only the host speaks for the game
    if (payload.ev === '__ack') {
      const { k, res } = payload.a[0] ?? {};
      const fn = this.acks.get(k);
      this.acks.delete(k);
      fn?.(res);
      return;
    }
    this.onServerEvent(payload.ev, payload.a);
  }

  private onServerEvent(ev: string, args: unknown[]) {
    if (ev === 'state') {
      const v = args[0] as RoomView;
      if (!v.you) {
        if (!this.myPlayerId) { this.heldState = args; return; }
        v.you = this.myPlayerId;
      }
    }
    if (ev === 'kicked' && this.host == null) void this.leaveGame();
    this.fire(ev, ...args);
  }

  // ------------------------------------------------------------ host loss & election
  private checkHost() {
    if (!this.mesh || !this.gameCode || this.host) return;
    const peers = this.mesh.gamePeers();
    const hostThere = peers.some((p) => p.peer === this.hostPeer);
    if (this.hostPeer && hostThere) return;
    const newHost = peers.find((p) => !p.sameTab && p.presence?.host === true && p.presence?.code === this.gameCode);
    if (newHost) {
      this.hostPeer = newHost.peer;
      if (!this.connected) this.setConnected(true); // net.ts rejoins on connect
      return;
    }
    if (!this.myPlayerId) return; // not in the game yet: nothing to take over
    if (this.hostPeer) {
      this.hostPeer = null;
      this.setConnected(false);
    }
    if (this.electionTimer) return;
    this.electionTimer = setTimeout(() => {
      this.electionTimer = null;
      void this.elect();
    }, 1500);
  }

  private async elect() {
    if (!this.mesh || !this.gameCode || this.host || this.hostPeer) return;
    const members = this.mesh.gamePeers().filter((p: Peer) => p.presence?.member === true && p.presence?.code === this.gameCode || p.sameTab);
    const first = [...members].sort((a, b) => a.peer.localeCompare(b.peer))[0];
    if (!first?.sameTab) { this.checkHost(); return; }
    const code = this.gameCode;
    this.startHost(code, this.wasPublic);
    this.host!.recreate();
    await this.mesh.setGamePresence({ code, host: true, member: true, pub: this.wasPublic });
    this.myPlayerId = null;
    this.setConnected(true); // net.ts rejoins through the local host
  }

  private async leaveGame() {
    if (this.electionTimer) { clearTimeout(this.electionTimer); this.electionTimer = null; }
    this.removeBots();
    this.host?.close();
    this.host = null;
    this.hostPeer = null;
    this.gameCode = null;
    this.myPlayerId = null;
    this.heldState = null;
    this.acks.clear();
    this.lastLobbyPresence = '';
    bridge.set({ isHost: false, practice: false });
    if (this.mesh) {
      await this.mesh.leaveGame();
      void this.mesh.lobbyPresence({ pub: null, n: null, max: null, ph: null });
    }
  }
}

export const runtime = new Runtime();
bridgeActions.practice = (profile) => runtime.practice(profile);
bridgeActions.addBot = () => runtime.addBot();
bridgeActions.removeBots = () => runtime.removeBots();
