import type { Server, Socket } from 'socket.io';
import type { ClientToServer, ServerToClient, Profile, JoinResult } from '@wene/shared';
import type { RoomManager } from './game/RoomManager';
import type { Room } from './game/Room';
import type { Moderation } from './moderation';
import type { Db } from './db';
import { TokenBucket, KeyedLimiter } from './rateLimit';
import {
  drawOpsSchema, profileSchema, reactionSchema, reportSchema, roomCodeSchema, sessionSchema, settingsSchema,
} from './validation';
import { token } from './util';

interface SocketData {
  code?: string;
  playerId?: string;
  session?: string;
  ip: string;
  limits: Record<'chat' | 'draw' | 'react' | 'misc', TokenBucket>;
}
type IOServer = Server<ClientToServer, ServerToClient, {}, SocketData>;
type IOSocket = Socket<ClientToServer, ServerToClient, {}, SocketData>;
type AckFn = ((r: any) => void) | undefined;

const fail = (ack: AckFn, error: string) => { if (typeof ack === 'function') ack({ ok: false, error }); };

export function attachSocketHandlers(io: IOServer, deps: { manager: RoomManager; moderation: Moderation; db: Db; trustProxy: boolean }) {
  const { manager, moderation, db } = deps;
  const joinLimiter = new KeyedLimiter(30, 0.5); // 30 burst, then 1 every 2s per IP (households share IPs)
  const connLimiter = new KeyedLimiter(30, 0.5);

  let onlineTimer: NodeJS.Timeout | null = null;
  const broadcastOnline = () => {
    if (onlineTimer) return;
    onlineTimer = setTimeout(() => { onlineTimer = null; io.emit('online', io.engine.clientsCount); }, 1000);
  };

  io.use((socket, next) => {
    const fwd = deps.trustProxy ? String(socket.handshake.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
    const ip = fwd || socket.handshake.address;
    if (!connLimiter.take(ip)) return next(new Error('rate_limited'));
    socket.data.ip = ip;
    socket.data.limits = {
      chat: new TokenBucket(5, 1.2),
      draw: new TokenBucket(60, 30),
      react: new TokenBucket(4, 1),
      misc: new TokenBucket(10, 2),
    };
    next();
  });

  io.on('connection', (socket: IOSocket) => {
    broadcastOnline();
    socket.emit('online', io.engine.clientsCount);

    const current = (): { room: Room; playerId: string } | null => {
      const { code, playerId } = socket.data;
      if (!code || !playerId) return null;
      const room = manager.get(code);
      if (!room || !room.players.has(playerId)) return null;
      return { room, playerId };
    };

    const leaveCurrent = () => {
      const c = current();
      if (c) {
        socket.leave(c.room.code);
        c.room.removePlayer(c.playerId, 'left');
      }
      socket.data.code = socket.data.playerId = undefined;
    };

    const validProfile = (raw: unknown): Profile | string => {
      const parsed = profileSchema.safeParse(raw);
      if (!parsed.success) return 'bad_profile';
      const name = moderation.cleanName(parsed.data.name);
      if (!name) return 'bad_name';
      return { name, avatar: parsed.data.avatar };
    };

    /** Join `room` as a new player or resume an existing session in it. */
    const enter = (room: Room, profile: Profile, sessionRaw: unknown, ack: AckFn) => {
      const session = sessionSchema.safeParse(sessionRaw).success ? (sessionRaw as string | undefined) : undefined;
      if (session && room.isBanned(session)) return fail(ack, 'banned');
      const existing = session ? room.findBySession(session) : undefined;
      // Already in another room with this socket? Leave it first.
      if (socket.data.code && socket.data.code !== room.code) leaveCurrent();
      let result: JoinResult;
      if (existing) {
        const replaced = room.reconnect(existing, socket.id);
        if (replaced) {
          io.to(replaced).emit('kicked', 'replaced');
          io.sockets.sockets.get(replaced)?.disconnect(true);
        }
        result = { code: room.code, session: existing.session, playerId: existing.id };
      } else {
        if (room.isFull()) return fail(ack, 'room_full');
        // A session may only be in one room at a time.
        if (session) {
          const other = manager.findSession(session);
          if (other && other.room !== room) {
            const p = other.room.players.get(other.playerId);
            if (p?.socketId && p.socketId !== socket.id) io.to(p.socketId).emit('kicked', 'replaced');
            other.room.removePlayer(other.playerId, 'left');
          }
        }
        const newSession = session ?? token();
        const p = room.addPlayer(profile.name, profile.avatar, socket.id, newSession);
        result = { code: room.code, session: newSession, playerId: p.id };
      }
      socket.join(room.code);
      socket.data.code = room.code;
      socket.data.playerId = result.playerId;
      socket.data.session = result.session;
      if (typeof ack === 'function') ack({ ok: true, ...result });
    };

    socket.on('room:create', (payload, ack) => {
      if (!joinLimiter.take(socket.data.ip)) return fail(ack, 'rate_limited');
      const profile = validProfile(payload?.profile);
      if (typeof profile === 'string') return fail(ack, profile);
      let settings = {};
      if (payload?.settings) {
        const s = settingsSchema.safeParse(payload.settings);
        if (!s.success) return fail(ack, 'bad_settings');
        settings = s.data;
      }
      const room = manager.create(false, settings);
      enter(room, profile, payload?.session, ack);
    });

    socket.on('room:join', (payload, ack) => {
      if (!joinLimiter.take(socket.data.ip)) return fail(ack, 'rate_limited');
      const code = roomCodeSchema.safeParse(payload?.code);
      if (!code.success) return fail(ack, 'bad_code');
      const room = manager.get(code.data);
      if (!room) return fail(ack, 'room_not_found');
      const profile = validProfile(payload?.profile);
      if (typeof profile === 'string') return fail(ack, profile);
      enter(room, profile, payload?.session, ack);
    });

    socket.on('room:quickplay', (payload, ack) => {
      if (!joinLimiter.take(socket.data.ip)) return fail(ack, 'rate_limited');
      const profile = validProfile(payload?.profile);
      if (typeof profile === 'string') return fail(ack, profile);
      const room = manager.findPublic() ?? manager.create(true);
      enter(room, profile, payload?.session, ack);
    });

    socket.on('room:leave', () => leaveCurrent());

    socket.on('room:settings', (patch, ack) => {
      const c = current();
      if (!c) return fail(ack, 'not_in_room');
      if (!socket.data.limits.misc.take()) return fail(ack, 'rate_limited');
      const s = settingsSchema.safeParse(patch);
      if (!s.success) return fail(ack, 'bad_settings');
      if (s.data.categories) s.data.categories = s.data.categories.filter((id) => db.categoryExists(id));
      const err = c.room.updateSettings(c.playerId, s.data);
      if (err) return fail(ack, err);
      if (typeof ack === 'function') ack({ ok: true });
    });

    socket.on('room:ready', (ready) => {
      const c = current();
      if (c && socket.data.limits.misc.take()) c.room.setReady(c.playerId, ready === true);
    });

    socket.on('room:start', (ack) => {
      const c = current();
      if (!c) return fail(ack, 'not_in_room');
      const err = c.room.start(c.playerId);
      if (err) return fail(ack, err);
      if (typeof ack === 'function') ack({ ok: true });
    });

    socket.on('room:kick', (playerId) => {
      const c = current();
      if (c && typeof playerId === 'string') c.room.kick(c.playerId, playerId);
    });

    socket.on('room:playAgain', () => {
      const c = current();
      if (c) c.room.playAgain(c.playerId);
    });

    socket.on('word:choose', (index) => {
      const c = current();
      if (c && Number.isInteger(index)) c.room.chooseWord(c.playerId, index);
    });

    socket.on('draw:ops', (ops) => {
      const c = current();
      if (!c) return;
      const parsed = drawOpsSchema.safeParse(ops);
      if (!parsed.success) return;
      if (!socket.data.limits.draw.take(Math.max(1, Math.ceil(parsed.data.length / 4)))) return;
      c.room.draw(c.playerId, parsed.data);
    });

    socket.on('chat:send', (text, ack) => {
      const c = current();
      if (!c) return fail(ack, 'not_in_room');
      if (!socket.data.limits.chat.take()) return fail(ack, 'rate_limited');
      const clean = moderation.cleanChat(text);
      if (!clean) return fail(ack, 'bad_message');
      const err = c.room.chat(c.playerId, moderation.maskChat(clean));
      if (err) return fail(ack, err);
      if (typeof ack === 'function') ack({ ok: true });
    });

    socket.on('reaction:send', (id) => {
      const c = current();
      const r = reactionSchema.safeParse(id);
      if (c && r.success && socket.data.limits.react.take()) c.room.reaction(c.playerId, r.data as never);
    });

    socket.on('report', (payload, ack) => {
      const c = current();
      if (!c) return fail(ack, 'not_in_room');
      if (!joinLimiter.take(socket.data.ip, 2)) return fail(ack, 'rate_limited');
      const r = reportSchema.safeParse(payload);
      if (!r.success) return fail(ack, 'bad_report');
      const target = c.room.players.get(r.data.playerId);
      const me = c.room.players.get(c.playerId);
      if (!target || !me || target.id === me.id) return fail(ack, 'bad_report');
      db.addReport({
        room_code: c.room.code, reporter_name: me.name, reported_name: target.name,
        reason: moderation.cleanChat(r.data.reason) ?? '', context: JSON.stringify(c.room.recentMessagesOf(target.id)),
      });
      if (typeof ack === 'function') ack({ ok: true });
    });

    socket.on('disconnect', () => {
      broadcastOnline();
      const c = current();
      if (c) c.room.disconnect(c.playerId, socket.id);
    });
  });
}
