import type { Avatar, RoomSettings } from '@wene/shared';
import type { Timing } from '../config';
import { roomCode, now } from '../util';
import { DEFAULT_SETTINGS, Room, type RoomHooks } from './Room';

export class RoomManager {
  rooms = new Map<string, Room>();
  private sweeper: NodeJS.Timeout;

  constructor(private timing: Timing, private hooks: Omit<RoomHooks, 'onEmpty'>) {
    this.sweeper = setInterval(() => this.sweep(), 30_000);
    this.sweeper.unref();
  }

  create(isPublic: boolean, settings: Partial<RoomSettings> = {}): Room {
    let code = roomCode();
    while (this.rooms.has(code)) code = roomCode();
    const room = new Room(code, isPublic, { ...DEFAULT_SETTINGS, ...settings }, this.timing, {
      ...this.hooks,
      onEmpty: (r) => this.rooms.delete(r.code),
    });
    this.rooms.set(code, room);
    return room;
  }

  get(code: string) { return this.rooms.get(code); }

  /** Find a public room with space, preferring ones in the lobby or with more players. */
  findPublic(): Room | undefined {
    const open = [...this.rooms.values()].filter((r) => r.isPublic && !r.isFull() && r.phase !== 'gameOver' && r.connectedPlayers.length > 0);
    open.sort((a, b) => (a.phase === 'lobby' ? 0 : 1) - (b.phase === 'lobby' ? 0 : 1) || b.size - a.size);
    return open[0];
  }

  findSession(session: string): { room: Room; playerId: string } | null {
    for (const room of this.rooms.values()) {
      const p = room.findBySession(session);
      if (p) return { room, playerId: p.id };
    }
    return null;
  }

  stats() {
    let players = 0;
    let inGame = 0;
    for (const r of this.rooms.values()) {
      players += r.connectedPlayers.length;
      if (r.phase !== 'lobby' && r.phase !== 'gameOver') inGame++;
    }
    return { rooms: this.rooms.size, roomsInGame: inGame, players };
  }

  private sweep() {
    const t = now();
    for (const room of this.rooms.values()) {
      const nobody = room.connectedPlayers.length === 0;
      if ((nobody && t - room.lastActivity > this.timing.emptyRoomTtlMs) || t - room.lastActivity > this.timing.idleRoomTtlMs) {
        for (const p of room.players.values()) if (p.socketId) this.hooks.emit(p.socketId, 'kicked', 'expired');
        room.destroy();
        this.rooms.delete(room.code);
      }
    }
  }

  close() {
    clearInterval(this.sweeper);
    for (const r of this.rooms.values()) r.destroy();
    this.rooms.clear();
  }
}

export type { Avatar };
