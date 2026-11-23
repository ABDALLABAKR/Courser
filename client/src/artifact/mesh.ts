/**
 * Encrypted messaging between the pages that have this artifact open, on top of the
 * claude.ai `room` capability.
 *
 * - The lobby (the artifact's main room) carries presence only: who is online and
 *   which public games are looking for players.
 * - Each game uses a named room `g-<code>`. One page in it is the host and runs the
 *   authoritative game logic; everyone else talks to the host through topic `m`.
 * - Every page publishes an ECDH P-256 public key in its presence. Messages to one
 *   peer are AES-GCM encrypted with the pair's shared key, so other players' pages
 *   never receive the secret word, word choices, correct guesses or session tokens.
 *   Only data that every player may see goes out unencrypted, once, to the whole room.
 * - Room events are capped at 4 KiB, so larger payloads are split into chunks.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;
export interface Peer { peer: string; isMe: boolean; sameTab: boolean; presence: Record<string, Json> }
interface Msg { peer: string; sameTab: boolean; data?: Json }
interface PeersChange { peers: readonly Peer[]; joined: readonly Peer[]; left: readonly Peer[]; updated: readonly Peer[] }
interface Channel {
  emit(topic: string, data?: Json): Promise<void>;
  on(topic: string, fn: (m: Msg) => void, onError?: (e: { code: string }) => void): () => void;
  presence(patch: Record<string, Json>): Promise<void>;
  peers(): readonly Peer[];
  onPeers(fn: (c: PeersChange) => void, onError?: (e: { code: string }) => void): () => void;
}
interface NamedRoom extends Channel { readonly name: string; leave(): Promise<void> }
interface RoomApi extends Channel { join(name: string): Promise<NamedRoom>; connected(): boolean }

const TOPIC = 'm';
const CHUNK = 3000;

const enc = new TextEncoder();
const dec = new TextDecoder();
const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Sends at a polite pace: the platform drops emits past about 40 a second per page. */
class Pacer {
  private q: (() => Promise<void>)[] = [];
  private running = false;
  private tokens = 20;
  private last = performance.now();
  push(job: () => Promise<void>) { this.q.push(job); void this.run(); }
  private async run() {
    if (this.running) return;
    this.running = true;
    while (this.q.length) {
      const t = performance.now();
      this.tokens = Math.min(20, this.tokens + ((t - this.last) / 1000) * 28);
      this.last = t;
      if (this.tokens < 1) { await new Promise((r) => setTimeout(r, 40)); continue; }
      this.tokens -= 1;
      try { await this.q.shift()!(); } catch { /* a dropped moment; the game resyncs from later state */ }
    }
    this.running = false;
  }
}

export class Mesh {
  myPeer = '';
  game: NamedRoom | null = null;
  onMessage: (from: string, payload: Json) => void = () => {};
  onGamePeers: (c: PeersChange) => void = () => {};
  onLobbyPeers: (peers: readonly Peer[]) => void = () => {};

  private keys = new Map<string, Promise<CryptoKey>>();
  private chunks = new Map<string, { parts: string[]; got: number }>();
  private inbound = new Map<string, Promise<void>>();
  private pacer = new Pacer();
  private outChain: Promise<unknown> = Promise.resolve();
  private seq = 0;
  private unsub: (() => void)[] = [];
  private gamePresence: Record<string, Json> = {};

  private constructor(private room: RoomApi, private kp: CryptoKeyPair, readonly pk: string) {}

  static async create(): Promise<Mesh | null> {
    const claude = (window as any).claude;
    if (!claude?.use) return null;
    let room: RoomApi | null = null;
    try { room = await claude.use('room'); } catch { room = null; }
    if (!room || !crypto?.subtle) return null;
    const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']) as CryptoKeyPair;
    const pk = toB64(await crypto.subtle.exportKey('raw', kp.publicKey));
    const mesh = new Mesh(room, kp, pk);
    room.onPeers((c) => {
      const me = c.peers.find((p) => p.sameTab);
      if (me) mesh.myPeer = me.peer;
      mesh.onLobbyPeers(c.peers);
    }, () => {});
    return mesh;
  }

  lobbyPeers() { return this.room.peers(); }
  lobbyPresence(patch: Record<string, Json>) { return this.room.presence(patch).catch(() => {}); }
  gamePeers(): readonly Peer[] { return this.game?.peers() ?? []; }

  async joinGame(name: string) {
    if (this.game?.name === name) return;
    await this.leaveGame();
    const g = await this.room.join(name);
    this.game = g;
    this.gamePresence = {};
    this.unsub.push(g.on(TOPIC, (m) => this.receive(m), () => {}));
    this.unsub.push(g.onPeers((c) => {
      const me = c.peers.find((p) => p.sameTab);
      if (me) this.myPeer = me.peer;
      for (const p of c.left) this.keys.delete(p.peer);
      this.onGamePeers(c);
    }, () => {}));
    await this.setGamePresence({ pk: this.pk });
  }

  async leaveGame() {
    this.unsub.forEach((u) => u());
    this.unsub = [];
    const g = this.game;
    this.game = null;
    this.keys.clear();
    this.chunks.clear();
    if (g) await g.leave().catch(() => {});
  }

  setGamePresence(patch: Record<string, Json>) {
    this.gamePresence = { ...this.gamePresence, ...patch };
    return this.game?.presence(patch).catch(() => {}) ?? Promise.resolve();
  }

  private keyFor(peer: string): Promise<CryptoKey> | null {
    const cached = this.keys.get(peer);
    if (cached) return cached;
    const pkB64 = this.gamePeers().find((p) => p.peer === peer)?.presence?.pk;
    if (typeof pkB64 !== 'string') return null;
    const k = (async () => {
      const pub = await crypto.subtle.importKey('raw', fromB64(pkB64), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
      return crypto.subtle.deriveKey({ name: 'ECDH', public: pub }, this.kp.privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    })();
    this.keys.set(peer, k);
    return k;
  }

  /**
   * Send `payload` to `targets` (null = everyone in the game room). With `secret`, it is
   * encrypted separately for each target. Ordering per sender is preserved.
   */
  send(targets: string[] | null, payload: Json, secret: boolean) {
    const g = this.game;
    if (!g) return;
    const text = JSON.stringify(payload);
    const job = async () => {
      if (!secret) return this.emitChunks(g, { t: targets ?? undefined, k: 'p' }, text);
      for (const peer of targets ?? []) {
        const key = this.keyFor(peer);
        if (!key) continue; // no key yet: the peer's next state update will carry the same information
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key, enc.encode(text));
        this.emitChunks(g, { t: [peer], k: 'e', iv: toB64(iv) }, toB64(ct));
      }
    };
    this.outChain = this.outChain.then(job, job);
  }

  private emitChunks(g: NamedRoom, head: Record<string, Json>, body: string) {
    const n = Math.ceil(body.length / CHUNK) || 1;
    const id = (++this.seq).toString(36);
    for (let i = 0; i < n; i++) {
      const env = n === 1 ? { ...head, d: body } : { ...head, d: body.slice(i * CHUNK, (i + 1) * CHUNK), c: [id, i, n] };
      this.pacer.push(() => g.emit(TOPIC, env));
    }
  }

  private receive(m: Msg) {
    if (m.sameTab) return;
    const env = m.data;
    if (!env || typeof env !== 'object' || typeof env.d !== 'string') return;
    if (Array.isArray(env.t) && !env.t.includes(this.myPeer)) return;
    let body: string = env.d;
    if (Array.isArray(env.c)) {
      const [id, i, n] = env.c as [string, number, number];
      if (typeof n !== 'number' || n > 200 || i >= n) return;
      const key = `${m.peer}:${id}`;
      const entry = this.chunks.get(key) ?? { parts: new Array(n), got: 0 };
      if (entry.parts[i] === undefined) { entry.parts[i] = body; entry.got++; }
      this.chunks.set(key, entry);
      if (entry.got < n) return;
      this.chunks.delete(key);
      body = entry.parts.join('');
    }
    const prev = this.inbound.get(m.peer) ?? Promise.resolve();
    const next = prev.then(async () => {
      let text = body;
      if (env.k === 'e') {
        const key = this.keyFor(m.peer);
        if (!key || typeof env.iv !== 'string') return;
        try {
          text = dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(env.iv) }, await key, fromB64(body)));
        } catch { return; }
      }
      let payload: Json;
      try { payload = JSON.parse(text); } catch { return; }
      this.onMessage(m.peer, payload);
    });
    this.inbound.set(m.peer, next.catch(() => {}));
  }
}
