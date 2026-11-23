/**
 * Replaces `socket.io-client` in the artifact build (see vite.artifact.config.ts).
 * Exposes the small part of the Socket API that lib/net.ts uses, backed by the runtime.
 */
import { runtime } from './runtime';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn = (...args: any[]) => void;

class ArtifactSocket {
  connected = false;
  private listeners = new Map<string, Set<Fn>>();
  constructor() {
    void runtime.start((ev, ...args) => {
      if (ev === 'connect') this.connected = true;
      if (ev === 'disconnect') this.connected = false;
      for (const fn of [...(this.listeners.get(ev) ?? [])]) {
        try { fn(...args); } catch (e) { console.error(e); }
      }
    });
  }
  on(ev: string, fn: Fn) {
    if (!this.listeners.has(ev)) this.listeners.set(ev, new Set());
    this.listeners.get(ev)!.add(fn);
    return this;
  }
  off(ev: string, fn?: Fn) {
    if (fn) this.listeners.get(ev)?.delete(fn); else this.listeners.delete(ev);
    return this;
  }
  emit(ev: string, ...args: any[]) {
    const ack = typeof args[args.length - 1] === 'function' ? (args.pop() as Fn) : undefined;
    runtime.emit(ev, args, ack);
    return this;
  }
  connect() { return this; }
  disconnect() { return this; }
}

let instance: ArtifactSocket | null = null;
export function io(..._args: unknown[]) {
  instance ??= new ArtifactSocket();
  return instance;
}
export default io;
