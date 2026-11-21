/* ═══════════════════════════════════════════════════════════════════
 *  Grade 10 Physics — Snakes & Ladders Championship
 *  Pure browser game: no build step, no dependencies, works offline.
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';
(function () {

  /* ───────────────────────── Utilities ───────────────────────── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SPEED = /[?&]fast\b/.test(location.search) ? 0.04 : 1; // ?fast = test mode
  const sleep = ms => new Promise(r => setTimeout(r, ms * SPEED));
  const clone = o => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rand(n) {
    try { const a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] % n; }
    catch (e) { return Math.floor(Math.random() * n); }
  }
  const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const STORE = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const KEYS = { prefs: 'pslc.prefs.v1', bank: 'pslc.bank.v1', save: 'pslc.save.v1', bankVer: 'pslc.bankver' };

  /* ───────────────────────── Constants ───────────────────────── */
  // Topics come from the question bank file (book chapters), with a fallback.
  const CATS = window.BANK_TOPICS || {
    1: { name: 'Topic 1', icon: '📘' }, 2: { name: 'Topic 2', icon: '📗' }, 3: { name: 'Topic 3', icon: '📙' }, 4: { name: 'Topic 4', icon: '📕' },
    5: { name: 'Topic 5', icon: '📓' }, 6: { name: 'Topic 6', icon: '📔' }, 7: { name: 'Topic 7', icon: '📒' }, 8: { name: 'Topic 8', icon: '📚' }
  };
  const DIFF = { E: { name: 'Easy', icon: '🌱' }, M: { name: 'Moderate', icon: '🔥' }, C: { name: 'Challenging', icon: '💥' } };
  const TYPES = { mcq: 'Multiple Choice', tf: 'True or False', short: 'Short Answer', num: 'Numerical Problem', mistake: 'Identify the Mistake', reason: 'Reasoning & Prediction' };
  const POINTS = { E: 5, M: 10, C: 15, ladder: 15, snake: 15, final: 15, challenge: 10, bonus: 10 };

  const TEAMS = [
    { name: 'Group A', color: '#3b82f6', light: '#bfdbfe', icon: '⚛️', letter: 'A' },
    { name: 'Group B', color: '#ef4444', light: '#fecaca', icon: '🧲', letter: 'B' },
    { name: 'Group C', color: '#22c55e', light: '#bbf7d0', icon: '🌍', letter: 'C' },
    { name: 'Group D', color: '#eab308', light: '#fef08a', icon: '💡', letter: 'D' }
  ];

  // Snakes: head → tail. Ladders: foot → top. Special squares never coincide
  // with any snake/ladder end, square 1 or the final square.
  const BOARDS = {
    100: {
      size: 100, cols: 10, rows: 10,
      ladders: { 3: 22, 8: 30, 20: 41, 28: 55, 36: 57, 51: 72, 63: 81, 71: 92 },
      snakes: { 16: 6, 33: 13, 48: 26, 62: 38, 69: 49, 87: 65, 93: 73, 98: 79 },
      specials: {
        11: 'bonus', 58: 'bonus', 24: 'extra', 77: 'extra', 45: 'shield', 85: 'shield',
        15: 'forward5', 60: 'forward5', 39: 'swap', 89: 'swap', 18: 'double', 53: 'double',
        31: 'challenge', 75: 'challenge', 46: 'back3', 95: 'back3', 27: 'mystery', 66: 'mystery', 83: 'mystery'
      }
    },
    50: {
      size: 50, cols: 10, rows: 5,
      ladders: { 4: 25, 9: 31, 18: 38, 27: 46 },
      snakes: { 16: 6, 29: 12, 37: 23, 48: 33 },
      specials: { 7: 'bonus', 14: 'extra', 35: 'shield', 13: 'forward5', 42: 'swap', 11: 'double', 30: 'challenge', 44: 'back3', 21: 'mystery' }
    }
  };

  const SPECIALS = {
    bonus: { icon: '🎁', name: '+10 Bonus Points', color: '#f472b6', desc: 'Surprise gift! Your group instantly earns 10 bonus points.' },
    extra: { icon: '⚡', name: 'Extra Turn', color: '#facc15', desc: 'Full of energy! Your group gets another turn straight after this one.' },
    shield: { icon: '🛡️', name: 'Snake Protection', color: '#22d3ee', desc: 'A force-field shield! The next snake your group lands on cannot bite you.' },
    forward5: { icon: '🚀', name: 'Rocket Boost', color: '#fb923c', desc: 'Thrust! Your group blasts forward 5 squares.' },
    swap: { icon: '🔄', name: 'Swap Positions', color: '#a78bfa', desc: 'Choose any rival group and swap board positions with it — or keep your place.' },
    double: { icon: '💎', name: 'Double Points', color: '#38bdf8', desc: 'Your group’s next correct answer earns DOUBLE points.' },
    challenge: { icon: '🎯', name: 'Challenge a Group', color: '#f87171', desc: 'Pick a rival for a head-to-head question. Both groups lock in an answer — each correct group earns 10 points.' },
    back3: { icon: '⏪', name: 'Move Back 3', color: '#94a3b8', desc: 'Friction strikes! Your group slides back 3 squares.' },
    mystery: { icon: '❓', name: 'Mystery Square', color: '#e879f9', desc: 'A random power-up is about to be revealed…' }
  };
  const EFFECTS = ['bonus', 'extra', 'shield', 'forward5', 'swap', 'double', 'challenge', 'back3'];
  const DOODLES = ['⚛️', '🧲', '🔭', '🍎', '⚙️', '🔋', '🪐', '💡', '🌡️', '📡', '🧪', '🌍'];
  const ABORT = { abort: true };

  /* ───────────────────────── Preferences & bank ───────────────────────── */
  function defaultSetup() {
    return {
      names: TEAMS.map(t => t.name), members: ['', '', '', ''], sections: ['', '', '', ''], lifelines: 1, size: 100, minutes: 45,
      timers: { E: 30, M: 30, C: 30, LS: 30, F: 30 }, exactFinish: false, cats: [1, 2, 3, 4, 5, 6, 7, 8]
    };
  }
  const prefs = Object.assign({ sound: true, used: [] }, STORE.get(KEYS.prefs, {}));
  prefs.setup = Object.assign(defaultSetup(), prefs.setup || {});
  prefs.setup.timers = Object.assign(defaultSetup().timers, prefs.setup.timers || {});
  if (!prefs.timers30) {
    // One-time switch: every question timer is 30 seconds (also in an autosaved game).
    prefs.setup.timers = defaultSetup().timers; prefs.timers30 = true;
    const sv = STORE.get('pslc.save.v1', null);
    if (sv && sv.game && sv.game.settings) { sv.game.settings.timers = defaultSetup().timers; STORE.set('pslc.save.v1', sv); }
    STORE.set(KEYS.prefs, prefs);
  }
  const savePrefs = () => STORE.set(KEYS.prefs, prefs);
  prefs.used = (prefs.used || []).filter(id => !/^q\d+$/.test(id)); // drop ids of the old built-in bank

  let bank = STORE.get(KEYS.bank, null);
  if (!Array.isArray(bank)) bank = clone(window.DEFAULT_QUESTIONS || []);
  else if (STORE.get(KEYS.bankVer, 1) < 3) {
    // v3: built-in questions now come from the course book (Ch. 2 and Section 3-1).
    // Keep the teacher's own multiple-choice questions, replace the old built-ins.
    bank = clone(window.DEFAULT_QUESTIONS || []).concat(bank.filter(q => /^u/.test(q.id) && q.o && q.o.length >= 3 && q.a != null));
    STORE.set(KEYS.bank, bank);
  }
  STORE.set(KEYS.bankVer, 3);
  const saveBank = () => STORE.set(KEYS.bank, bank);

  /* ───────────────────────── Sound (Web Audio synth) ───────────────────────── */
  const SFX = {
    ctx: null, m: null,
    unlock() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.m = this.ctx.createGain(); this.m.gain.value = .9; this.m.connect(this.ctx.destination); } catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    ok() { return prefs.sound && this.ctx; },
    tone(f, d, o = {}) {
      if (!this.ok()) return;
      const c = this.ctx, t = c.currentTime + (o.at || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || .2, t + (o.attack || .01));
      g.gain.exponentialRampToValueAtTime(.0001, t + d);
      osc.connect(g); g.connect(this.m); osc.start(t); osc.stop(t + d + .05);
    },
    noise(d, o = {}) {
      if (!this.ok()) return;
      const c = this.ctx, t = c.currentTime + (o.at || 0);
      const len = Math.max(1, Math.floor(c.sampleRate * d)), buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.freq || 1500, t); f.Q.value = o.q || 1;
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d);
      const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || .2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      src.connect(f); f.connect(g); g.connect(this.m); src.start(t); src.stop(t + d + .05);
    },
    click() { this.tone(900, .05, { type: 'triangle', vol: .08 }); },
    roll() { for (let i = 0; i < 12; i++) this.noise(.05, { vol: .35, at: i * .09 + Math.random() * .03, freq: 1800 + Math.random() * 2200, q: 4 }); },
    land() { this.tone(160, .18, { type: 'sine', vol: .35, to: 80 }); this.noise(.08, { vol: .2, freq: 900 }); },
    step(i) { this.tone(480 + (i % 8) * 45, .11, { type: 'triangle', vol: .17 }); },
    correct() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .26, { type: 'triangle', vol: .2, at: i * .09 })); },
    wrong() { this.tone(240, .4, { type: 'sawtooth', vol: .11, to: 110 }); this.tone(190, .45, { type: 'square', vol: .06, at: .06, to: 85 }); },
    ladder() { for (let i = 0; i < 12; i++) this.tone(330 * Math.pow(2, i / 7), .16, { type: 'triangle', vol: .15, at: i * .09 }); },
    snake() { this.noise(1.3, { vol: .16, freq: 6000, type: 'highpass' }); this.tone(900, 1.5, { type: 'sawtooth', vol: .1, to: 60 }); this.tone(600, 1.5, { type: 'triangle', vol: .12, to: 50, at: .1 }); },
    hiss() { this.noise(.9, { vol: .14, freq: 5000, type: 'highpass' }); },
    special() { [1319, 1568, 2093, 1760, 2637].forEach((f, i) => this.tone(f, .3, { vol: .1, at: i * .07 })); },
    shield() { this.tone(300, .6, { type: 'sine', vol: .2, to: 900 }); this.tone(600, .6, { type: 'triangle', vol: .08, at: .1, to: 1500 }); },
    whoosh() { this.noise(.7, { vol: .25, freq: 400, to: 4000, q: 2 }); },
    tick() { this.tone(1100, .05, { type: 'square', vol: .07 }); },
    buzzer() { this.tone(150, .7, { type: 'square', vol: .12 }); this.tone(155, .7, { type: 'sawtooth', vol: .08 }); },
    drum() { for (let i = 0; i < 16; i++) this.noise(.06, { vol: .12 + i * .01, at: i * .06, freq: 300, q: 1 }); },
    gong() { this.tone(110, 2.5, { vol: .35 }); this.tone(220, 2, { vol: .12, at: .02 }); this.tone(331, 1.6, { vol: .06, at: .04 }); },
    win() {
      const n = [[523, 0, .15], [523, .16, .15], [523, .32, .15], [698, .5, .5], [784, 1.0, .2], [698, 1.2, .2], [784, 1.4, .2], [1047, 1.6, .9]];
      n.forEach(([f, at, d]) => { this.tone(f, d, { type: 'triangle', vol: .2, at }); this.tone(f / 2, d, { type: 'sine', vol: .12, at }); });
    }
  };

  /* ───────────────────────── Confetti ───────────────────────── */
  const Confetti = (() => {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    const colors = ['#fbbf24', '#22d3ee', '#a855f7', '#3b82f6', '#ef4444', '#22c55e', '#f472b6', '#ffffff'];
    let parts = [], raf = null;
    function resize() { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    function add(p) { parts.push(Object.assign({ rot: Math.random() * 6, vr: (Math.random() - .5) * .35, r: Math.random() * 6 + 5, c: colors[rand(colors.length)], s: rand(3), life: 0, max: 200 + Math.random() * 120 }, p)); }
    function burst(n = 140, x = innerWidth / 2, y = innerHeight / 2.6, power = 1) {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (Math.random() * 12 + 4) * power; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6 * power }); }
      run();
    }
    function rain(n = 220) { for (let i = 0; i < n; i++) add({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .6, vx: (Math.random() - .5) * 3, vy: Math.random() * 3 + 2, max: 420 }); run(); }
    function run() { if (!raf) raf = requestAnimationFrame(loop); }
    function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life < p.max && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vx *= .985; p.vy = p.vy * .985 + .32; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        ctx.save(); ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        if (p.s === 0) ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        else if (p.s === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r / 2.4, 0, 7); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(0, -p.r / 2); ctx.lineTo(p.r / 2, p.r / 2); ctx.lineTo(-p.r / 2, p.r / 2); ctx.fill(); }
        ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(loop); else { raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    addEventListener('resize', resize); resize();
    return { burst, rain };
  })();

  /* ───────────────────────── Game state ───────────────────────── */
  let game = null;           // current match (serialisable)
  let history = [];          // JSON snapshots for undo
  let flowToken = 0;         // invalidates running async turn flows
  const pending = new Set(); // rejecters of open flow prompts
  let flowKeys = null;       // keyboard handlers of the open flow prompt
  let setupOpen = false;
  let lastCat = 0;
  const override = {};       // token positions during slide animations

  const B = () => BOARDS[game ? game.size : prefs.setup.size];
  const cur = () => game.teams[game.turn];
  const timers = () => (game ? game.settings.timers : prefs.setup.timers);
  const studentOf = t => t.members[t.memberIdx % t.members.length];
  function parseMembers(s) {
    const list = String(s || '').split(/[\n,;]+/).map(x => x.trim()).filter(Boolean);
    return list.length ? list : ['Student 1', 'Student 2', 'Student 3', 'Student 4'];
  }

  function newGame(s) {
    return {
      v: 1, size: s.size,
      settings: { timers: Object.assign({}, s.timers), exactFinish: !!s.exactFinish, cats: s.cats.slice() },
      teams: TEAMS.map((d, i) => ({
        id: i, name: (String(s.names[i] || '').trim() || d.name).slice(0, 32), color: d.color, light: d.light, icon: d.icon, letter: d.letter,
        members: parseMembers(s.members[i]), section: String((s.sections || [])[i] || '').trim().slice(0, 30), lifelines: s.lifelines == null ? 1 : +s.lifelines, memberIdx: 0, pos: 1, points: 0, shields: 0, double: false, extraTurn: false, correct: 0, attempts: 0
      })),
      turn: 0, round: 1, phase: 'roll', paused: false,
      timeLimit: Math.round(s.minutes * 60), timeLeft: Math.round(s.minutes * 60),
      log: [], winner: null, endReason: null, lastRoll: null
    };
  }

  function pushSnapshot() { if (!game) return; history.push(JSON.stringify(game)); if (history.length > 60) history.shift(); }

  function log(msg, team) {
    if (!game) return;
    game.log.unshift({ m: msg, c: team ? team.color : null });
    if (game.log.length > 80) game.log.length = 80;
    renderLog();
  }

  function ranking() {
    return game.teams.slice().sort((a, b) => b.points - a.points || b.pos - a.pos || a.id - b.id);
  }
  function standings() {
    const r = ranking();
    if (game.endReason === 'win' && game.winner != null) {
      const w = r.findIndex(t => t.id === game.winner);
      if (w > 0) r.unshift(r.splice(w, 1)[0]);
    }
    return r;
  }

  /* ───────────────────────── Board ───────────────────────── */
  function center(n) {
    const b = B(), i = n - 1, rb = Math.floor(i / b.cols);
    const c = rb % 2 === 0 ? i % b.cols : b.cols - 1 - (i % b.cols);
    return { x: (c + .5) * 100, y: (b.rows - 1 - rb + .5) * 100 };
  }
  const pct = p => ({ x: p.x / B().cols, y: p.y / B().rows });

  function ladderSVG(a, b) {
    const p = center(a), q = center(b), dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
    const nx = -dy / L * 16, ny = dx / L * 16;
    const ex = dx / L * 8, ey = dy / L * 8; // extend slightly past centres
    const P = { x: p.x - ex, y: p.y - ey }, Q = { x: q.x + ex, y: q.y + ey };
    const line = (x1, y1, x2, y2, cls) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${cls}"/>`;
    let rungs = '', shadows = '';
    const n = Math.max(2, Math.floor((L + 36) / 34));
    for (let k = 1; k < n; k++) {
      const t = k / n, cx = P.x + (Q.x - P.x) * t, cy = P.y + (Q.y - P.y) * t;
      shadows += line(cx + nx, cy + ny, cx - nx, cy - ny, 'rs');
      rungs += line(cx + nx, cy + ny, cx - nx, cy - ny, 'rung');
    }
    return `<g class="ladder" id="ladder-${a}">
      <style>.rs{stroke:#3b1d04;stroke-width:9;stroke-linecap:round}.rung{stroke:#fcd34d;stroke-width:5.5;stroke-linecap:round}.rail-s{stroke:#3b1d04;stroke-width:12;stroke-linecap:round}.rail{stroke:#f59e0b;stroke-width:7;stroke-linecap:round}.rail-h{stroke:#fde68a;stroke-width:2;stroke-linecap:round;opacity:.8}</style>
      ${shadows}
      ${line(P.x + nx, P.y + ny, Q.x + nx, Q.y + ny, 'rail-s')}${line(P.x - nx, P.y - ny, Q.x - nx, Q.y - ny, 'rail-s')}
      ${rungs}
      ${line(P.x + nx, P.y + ny, Q.x + nx, Q.y + ny, 'rail')}${line(P.x - nx, P.y - ny, Q.x - nx, Q.y - ny, 'rail')}
      ${line(P.x + nx, P.y + ny, Q.x + nx, Q.y + ny, 'rail-h')}${line(P.x - nx, P.y - ny, Q.x - nx, Q.y - ny, 'rail-h')}
    </g>`;
  }

  const SNAKE_COLORS = [['#4ade80', '#166534'], ['#c084fc', '#581c87'], ['#fb923c', '#9a3412'], ['#f472b6', '#831843'], ['#2dd4bf', '#115e59'], ['#f87171', '#7f1d1d'], ['#a3e635', '#3f6212'], ['#38bdf8', '#075985']];
  function snakeSVG(h, t, i) {
    const p = center(h), q = center(t), dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L, k = Math.max(2, Math.round(L / 115)), amp = Math.min(32, 12 + L / 16) * (i % 2 ? 1 : -1);
    const N = 48, pts = [];
    for (let j = 0; j <= N; j++) {
      const s = j / N, off = amp * Math.sin(s * Math.PI * k);
      pts.push([p.x + dx * s + nx * off, p.y + dy * s + ny * off]);
    }
    const f = v => v.toFixed(1);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let j = 1; j < N; j++) d += ` Q${f(pts[j][0])} ${f(pts[j][1])} ${f((pts[j][0] + pts[j + 1][0]) / 2)} ${f((pts[j][1] + pts[j + 1][1]) / 2)}`;
    d += ` L${f(pts[N][0])} ${f(pts[N][1])}`;
    const [light, dark] = SNAKE_COLORS[i % SNAKE_COLORS.length];
    const ang = Math.atan2(pts[0][1] - pts[1][1], pts[0][0] - pts[1][0]) * 180 / Math.PI;
    const tailA = Math.atan2(pts[N][1] - pts[N - 1][1], pts[N][0] - pts[N - 1][0]) * 180 / Math.PI;
    return `<g class="snake" id="snakeg-${h}">
      <path d="${d}" fill="none" stroke="${dark}" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/>
      <path id="snake-${h}" d="${d}" fill="none" stroke="${light}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="scales" d="${d}" fill="none" stroke="${dark}" stroke-width="7" stroke-dasharray="4 17" stroke-linecap="round" opacity=".7"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="1 20" stroke-linecap="round" opacity=".35"/>
      <g transform="translate(${f(pts[N][0])} ${f(pts[N][1])}) rotate(${tailA.toFixed(0)})"><path d="M-4 -8 L18 0 L-4 8 Z" fill="${light}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/></g>
      <g transform="translate(${f(pts[0][0])} ${f(pts[0][1])}) rotate(${ang.toFixed(0)})">
        <path class="tongue" d="M24 0 H42 M42 0 l7 -6 M42 0 l7 6" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="4" cy="0" rx="27" ry="21" fill="${dark}"/>
        <ellipse cx="4" cy="0" rx="23" ry="17" fill="${light}"/>
        <circle cx="12" cy="-8.5" r="6.5" fill="#fff"/><circle cx="14.5" cy="-8.5" r="3.4" fill="#111"/>
        <circle cx="12" cy="8.5" r="6.5" fill="#fff"/><circle cx="14.5" cy="8.5" r="3.4" fill="#111"/>
        <circle cx="25" cy="-4" r="1.6" fill="${dark}"/><circle cx="25" cy="4" r="1.6" fill="${dark}"/>
      </g>
    </g>`;
  }

  function buildBoard() {
    const b = B(), board = $('#board');
    const ends = new Set([...Object.keys(b.ladders), ...Object.values(b.ladders), ...Object.keys(b.snakes), ...Object.values(b.snakes)].map(Number));
    let cells = '', nums = '';
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const rb = b.rows - 1 - r, n = rb * b.cols + (rb % 2 === 0 ? c + 1 : b.cols - c);
        const h = Math.round(228 + (rb / (b.rows - 1)) * 58);
        const cls = ['cell'], extra = [];
        let style = `--h:${h}`, inner = '', title = `Square ${n}`;
        nums += `<div${n === b.size ? ' class="fin"' : ''}><span class="num">${n}</span></div>`;
        if ((r + c) % 2) cls.push('alt');
        const sp = b.specials[n];
        if (n === 1) { cls.push('start'); inner += '<span class="label">START</span>'; }
        else if (n === b.size) { cls.push('finish'); inner += '<span class="sp-icon">🏆</span>'; title += ' — Final challenge'; }
        else if (sp) { cls.push('special'); style += `;--sc:${SPECIALS[sp].color}`; inner += `<span class="sp-icon">${SPECIALS[sp].icon}</span>`; title += ` — ${SPECIALS[sp].name}: ${SPECIALS[sp].desc}`; }
        else if (b.ladders[n]) { cls.push('ladder-foot'); title += ` — Ladder to ${b.ladders[n]}`; }
        else if (b.snakes[n]) { cls.push('snake-head'); title += ` — Snake down to ${b.snakes[n]}`; }
        else if (!ends.has(n) && n % 9 === 5) { inner += `<span class="doodle">${DOODLES[Math.floor(n / 9) % DOODLES.length]}</span>`; }
        cells += `<div class="${cls.join(' ')}" style="${style}" title="${esc(title)}" data-n="${n}"${extra.join('')}>${inner}</div>`;
      }
    }
    let svg = '';
    Object.entries(b.ladders).forEach(([a, t]) => { svg += ladderSVG(+a, t); });
    Object.entries(b.snakes).forEach(([h, t], i) => { svg += snakeSVG(+h, t, i); });
    board.innerHTML = `
      <div class="cells" style="grid-template-columns:repeat(${b.cols},1fr);grid-template-rows:repeat(${b.rows},1fr)">${cells}</div>
      <svg class="overlay" viewBox="0 0 ${b.cols * 100} ${b.rows * 100}" preserveAspectRatio="none">${svg}</svg>
      <div class="nums" style="grid-template-columns:repeat(${b.cols},1fr);grid-template-rows:repeat(${b.rows},1fr)">${nums}</div>
      <div class="tokens" id="tokens"></div>`;
    buildTokens();
    sizeBoard();
  }

  function buildTokens() {
    const layer = $('#tokens'); if (!layer) return;
    layer.innerHTML = game ? game.teams.map(t =>
      `<div class="token a${t.id}" id="tok-${t.id}" style="--c:${t.color};--l:${t.light}"><div class="tk">${t.icon}<b>${t.letter}</b></div></div>`).join('') : '';
    positionTokens();
  }

  function sizeBoard() {
    const b = B(), wrap = $('#boardWrap'), board = $('#board');
    const w = wrap.clientWidth - 20, h = wrap.clientHeight - 20;
    let cell = innerWidth <= 900 ? w / b.cols : Math.min(w / b.cols, h / b.rows);
    cell = Math.max(26, Math.floor(cell));
    board.style.width = cell * b.cols + 'px';
    board.style.height = cell * b.rows + 'px';
    board.style.setProperty('--cell', cell + 'px');
  }

  const OFFS = [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]];
  function positionTokens() {
    if (!game) return;
    const b = B(), groups = {};
    game.teams.forEach(t => { (groups[t.pos] = groups[t.pos] || []).push(t.id); });
    game.teams.forEach(t => {
      const el = $('#tok-' + t.id); if (!el) return;
      let p;
      if (override[t.id]) p = override[t.id];
      else {
        p = pct(center(t.pos));
        const g = groups[t.pos];
        if (g.length > 1) { const o = OFFS[g.indexOf(t.id)]; p = { x: p.x + o[0] * 100 / b.cols, y: p.y + o[1] * 100 / b.rows }; }
      }
      el.style.left = p.x + '%'; el.style.top = p.y + '%';
      el.classList.toggle('current', game.turn === t.id && game.phase !== 'over');
    });
  }

  function hop(id) { const el = $('#tok-' + id); if (!el) return; el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }

  /* ───────────────────────── Rendering ───────────────────────── */
  function render() {
    renderTurn(); renderScores(); renderLog(); renderClock(); positionTokens();
    $('#soundBtn').textContent = prefs.sound ? '🔊' : '🔇';
    $('#pauseOverlay').classList.toggle('show', !!(game && game.paused));
    if ($('#drawer').classList.contains('open')) renderDrawer();
  }

  function renderTurn() {
    const card = $('#turnCard'), btn = $('#rollBtn');
    if (!game) {
      $('#turnTeam').textContent = 'Welcome!'; $('#turnStudent').textContent = 'Set up the championship to begin.';
      $('#turnHint').textContent = ''; btn.disabled = true; btn.classList.remove('ready'); return;
    }
    const t = cur(), atFinal = t.pos === game.size;
    card.style.setProperty('--tc', t.color);
    $('#turnTeam').innerHTML = `<span class="mini">${t.icon}</span><span>${esc(t.name)}</span>`;
    $('#turnStudent').innerHTML = `🎓 Answering: <b>${esc(studentOf(t))}</b>`;
    btn.innerHTML = atFinal ? '🏆 Final Challenge' : '🎲 Roll';
    btn.classList.toggle('final', atFinal);
    btn.disabled = game.phase !== 'roll' || game.paused;
    btn.classList.toggle('ready', !btn.disabled);
    $('#turnHint').textContent = game.phase === 'over' ? '🏁 The championship is over.'
      : game.phase === 'busy' ? '⏳ Turn in progress…'
        : atFinal ? 'Answer the final challenge correctly to win!' : 'Press Space or click Roll';
    $('#roundPill').textContent = 'Round ' + game.round;
  }

  function renderScores() {
    const sb = $('#scoreboard');
    if (!game) { sb.innerHTML = '<div class="muted">No match yet.</div>'; return; }
    const first = new Map();
    $$('.score-row', sb).forEach(el => first.set(el.dataset.id, el.getBoundingClientRect().top));
    if (!$('.score-row', sb)) sb.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉', '4'];
    ranking().forEach((t, i) => {
      let el = sb.querySelector(`.score-row[data-id="${t.id}"]`);
      if (!el) { el = document.createElement('div'); el.className = 'score-row'; el.dataset.id = t.id; }
      el.style.cssText = `--c:${t.color};--l:${t.light}`;
      el.classList.toggle('current', game.turn === t.id && game.phase !== 'over');
      const badges = [];
      if (t.shields) badges.push(`<span title="Snake protection">🛡️${t.shields > 1 ? '×' + t.shields : ''}</span>`);
      if (t.lifelines > 0) badges.push(`<span title="Ask-the-Audience lifelines left">🙋${t.lifelines > 1 ? '×' + t.lifelines : ''}</span>`);
      if (t.double) badges.push('<span title="Double points on next correct answer">💎×2</span>');
      if (t.extraTurn) badges.push('<span title="Extra turn">⚡</span>');
      if (t.pos === game.size) badges.push('<span title="Waiting for the final challenge">🏁</span>');
      el.innerHTML = `<div class="rank">${medals[i]}</div><div class="tok">${t.icon}</div>
        <div style="min-width:0"><div class="nm">${esc(t.name)}</div>
        <div class="sub">${t.section ? `📣 ${esc(t.section)} · ` : ''}🎓 ${esc(studentOf(t))} · ✔ ${t.correct}/${t.attempts}</div>
        <div class="bar"><span style="width:${(t.pos / game.size * 100).toFixed(1)}%"></span></div></div>
        <div class="stat"><b>${t.pos}</b><small>square</small></div>
        <div class="stat pts"><b>${t.points}</b><small>points</small></div>
        <div class="badges">${badges.join('')}</div>`;
      sb.appendChild(el);
    });
    $$('.score-row', sb).forEach(el => {
      const f = first.get(el.dataset.id); if (f == null) return;
      const dy = f - el.getBoundingClientRect().top;
      if (Math.abs(dy) > 1 && el.animate) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.2,.8,.3,1)' });
    });
  }

  function floatPts(team, text) {
    const row = $(`.score-row[data-id="${team.id}"]`); if (!row) return;
    const s = document.createElement('span'); s.className = 'float-pts'; s.textContent = text; row.appendChild(s);
    setTimeout(() => s.remove(), 1700);
  }

  function renderLog() {
    const ul = $('#log');
    if (!game) { ul.innerHTML = ''; return; }
    ul.innerHTML = game.log.slice(0, 12).map(l => `<li style="${l.c ? '--c:' + l.c : ''}">${esc(l.m)}</li>`).join('');
  }

  function renderClock() {
    const el = $('#clock'), pill = $('#clockPill');
    if (!game || !game.timeLimit) { el.textContent = '∞'; pill.classList.remove('low'); return; }
    el.textContent = fmtTime(game.timeLeft);
    pill.classList.toggle('low', game.timeLeft <= 60 && game.phase !== 'over');
  }

  /* Die */
  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
  const dieRot = { x: -20, y: 25 };
  function buildDie() {
    $('#die').innerHTML = [1, 2, 3, 4, 5, 6].map(n => `<div class="face f${n}">${PIPS[n].map(p => `<span class="pip" style="grid-area:${Math.ceil(p / 3)}/${(p - 1) % 3 + 1}"></span>`).join('')}</div>`).join('');
    $('#die').style.transform = `rotateX(${dieRot.x}deg) rotateY(${dieRot.y}deg)`;
  }
  function spinTo(cur, target, extra) { const m = ((target - cur) % 360 + 360) % 360; return cur + extra + m; }
  async function rollDieAnim(n) {
    const [fx, fy] = FACE_ROT[n];
    dieRot.x = spinTo(dieRot.x, fx, 720); dieRot.y = spinTo(dieRot.y, fy, 360 * (2 + rand(2)));
    SFX.roll();
    const scene = $('.die-scene'); scene.animate && scene.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-26px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 1300 });
    $('#die').style.transform = `rotateX(${dieRot.x}deg) rotateY(${dieRot.y}deg)`;
    await sleep(1350); SFX.land();
  }

  /* ───────────────────────── Flow helpers ───────────────────────── */
  function chk(token) { if (token !== flowToken) throw ABORT; }
  const flowCard = () => $('#flowModal .modal-card');
  function openFlow(html, cls = '') {
    const m = $('#flowModal'), card = flowCard();
    card.className = 'modal-card ' + cls; card.innerHTML = html; card.scrollTop = 0;
    m.classList.add('show');
    return card;
  }
  function closeFlow() { $('#flowModal').classList.remove('show'); stopQTimer(); flowKeys = null; }
  const flowOpen = () => $('#flowModal').classList.contains('show');
  function waitChoice(token, setup) {
    return new Promise((res, rej) => {
      const entry = { rej };
      pending.add(entry);
      setup(v => { if (!pending.has(entry)) return; pending.delete(entry); res(v); });
    }).then(v => { chk(token); return v; });
  }
  function abortFlow() {
    flowToken++;
    pending.forEach(e => e.rej(ABORT)); pending.clear();
    closeFlow(); hideAnnounce();
    Object.keys(override).forEach(k => delete override[k]);
    $$('.token').forEach(t => t.classList.remove('flying', 'sliding'));
    $$('.ladder.active, .snake.active').forEach(e => e.classList.remove('active'));
  }

  let annId = 0;
  function announce({ icon = '', title = '', sub = '', color = '#fbbf24', ms = 1600 }) {
    const el = $('#announce'), id = ++annId;
    el.style.setProperty('--ac', color);
    el.innerHTML = `<div class="an-icon">${icon}</div><div class="an-title">${esc(title)}</div>${sub ? `<div class="an-sub">${esc(sub)}</div>` : ''}`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    return sleep(ms).then(() => { if (id === annId) el.classList.remove('show'); });
  }
  function hideAnnounce() { annId++; $('#announce').classList.remove('show'); }

  function toast(msg, ms = 2600) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    $('#toasts').appendChild(t); setTimeout(() => t.remove(), ms);
  }

  /* ───────────────────────── Questions ───────────────────────── */
  function activeBank() {
    const cats = game ? game.settings.cats : prefs.setup.cats;
    const list = bank.filter(q => cats.includes(q.c));
    return list.length ? list : bank;
  }
  function drawQuestion(prefDiffs, excludeId) {
    const all = activeBank();
    if (!all.length) return { id: 'none', c: 1, d: 'M', t: 'short', q: 'The question bank is empty — the teacher may ask a question of their choice!', ans: 'Teacher decides', x: '' };
    let used = new Set(prefs.used);
    let cand = all.filter(q => !used.has(q.id) && q.id !== excludeId);
    if (!cand.length) {
      const ids = new Set(all.map(q => q.id));
      prefs.used = prefs.used.filter(id => !ids.has(id));
      toast('♻️ Every question has been used — the bank has been reshuffled.');
      cand = all.filter(q => q.id !== excludeId);
      if (!cand.length) cand = all;
    }
    const byDiff = cand.filter(q => prefDiffs.includes(q.d)); if (byDiff.length) cand = byDiff;
    const fresh = cand.filter(q => q.c !== lastCat); if (fresh.length) cand = fresh;
    const q = cand[rand(cand.length)];
    prefs.used.push(q.id); lastCat = q.c; savePrefs();
    return shuffleOptions(q);
  }

  // Show the options in a fresh random order each time (correct answer moves around).
  function shuffleOptions(q) {
    if (!q.o || q.o.length < 2 || q.a == null) return q;
    const order = q.o.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = rand(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
    return Object.assign({}, q, { o: order.map(i => q.o[i]), a: order.indexOf(q.a) });
  }

  const QT = { left: 0, total: 0, iv: null, el: null, paused: false, onEnd: null };
  const CIRC = 2 * Math.PI * 52;
  function startQTimer(sec, el) {
    stopQTimer(); QT.left = QT.total = Math.max(5, sec | 0); QT.el = el; QT.paused = false; drawQT(); runQT();
  }
  function runQT() {
    clearInterval(QT.iv);
    QT.iv = setInterval(() => {
      if (QT.paused || (game && game.paused)) return;
      QT.left = Math.max(0, QT.left - 1);
      if (QT.left > 0 && QT.left <= 5) SFX.tick();
      if (QT.left === 0) { clearInterval(QT.iv); QT.iv = null; SFX.buzzer(); if (QT.onEnd) QT.onEnd(); }
      drawQT();
    }, 1000);
  }
  function drawQT() {
    const el = QT.el; if (!el || !el.isConnected) return;
    $('.prog', el).style.strokeDashoffset = (CIRC * (1 - QT.left / QT.total)).toFixed(1);
    el.classList.toggle('warn', QT.left <= 5 && QT.left > 0);
    el.classList.toggle('done', QT.left === 0);
    el.classList.toggle('paused', QT.paused);
    $('.t-num', el).innerHTML = QT.left === 0 ? 'TIME’S<br>UP!' : `${QT.left}<small>${QT.paused ? 'PAUSED' : 'SECONDS'}</small>`;
  }
  function stopQTimer() { clearInterval(QT.iv); QT.iv = null; }
  function toggleQTimer() { if (!QT.el || !QT.el.isConnected) return; QT.paused = !QT.paused; drawQT(); }
  function addQTime(s) {
    if (!QT.el || !QT.el.isConnected) return;
    QT.left += s; QT.total = Math.max(QT.total, QT.left); if (!QT.iv) runQT(); drawQT();
  }

  const KIND_LABEL = {
    normal: null, ladder: '🪜 Ladder Challenge', snake: '🐍 Snake Rescue', final: '🏆 Final Challenge', challenge: '🎯 Head-to-Head Challenge'
  };

  function questionHTML(q, o, student) {
    const t = o.team, kindChip = KIND_LABEL[o.kind] ? `<span class="chip kind ${o.kind}">${KIND_LABEL[o.kind]}</span>` : '';
    const cat = CATS[q.c] || CATS[1];
    const pts = o.kind === 'challenge' ? `+${o.points} pts for each correct group` : `+${o.points * (t.double ? 2 : 1)} pts${t.double ? ' 💎×2' : ''}`;
    const teamStrip = o.kind === 'challenge'
      ? `<div class="q-team" style="--c:${t.color}"><b>${esc(t.name)}</b> ⚔️ <b style="color:${o.rival.color}">${esc(o.rival.name)}</b><span class="student" data-prompt></span></div>`
      : `<div class="q-team" style="--c:${t.color}"><span style="font-size:30px">${t.icon}</span><b>${esc(t.name)}</b><span class="student">🎓 ${esc(student)}</span></div>`;
    const opts = `<div class="options">${q.o.map((x, i) =>
      `<button class="opt" data-i="${i}"><span class="letter">${'ABCD'[i] || i + 1}</span><span>${esc(x)}</span></button>`).join('')}</div>`;
    return `
      <div class="q-head">${kindChip}<span class="chip">${cat.icon} ${esc(cat.name)}</span>
        <span class="chip ${q.d}">${DIFF[q.d] ? DIFF[q.d].name : q.d}</span><span class="chip pts">${pts}</span></div>
      ${teamStrip}
      <div class="q-body">
        <div>
          <div class="q-text">${esc(q.q)}</div>
          ${opts}
          <div class="answer-slot"><div class="hidden-answer" data-hint>👆 Tap the group’s answer (or press A–D) — it is checked automatically.</div></div>
        </div>
        <div class="timer"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/><circle class="prog" cx="60" cy="60" r="52" stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="0"/></svg><div class="t-num"></div></div>
      </div>
      <div class="q-actions" data-pre>
        <button class="btn" data-act-q="timer" title="Pause / resume timer (P)">⏯ Pause timer</button>
        <button class="btn" data-act-q="more" title="Add 15 seconds (+)">+15 s</button>
        <button class="btn" data-act-q="replace" title="Replace with a new question (S)">↻ Replace question <kbd>S</kbd></button>
        ${o.kind !== 'challenge' && t.lifelines > 0 ? `<span class="spacer"></span><button class="btn big purple" data-act-q="audience" title="Ask the Audience (V)">🙋 Ask the Audience <kbd>V</kbd> <small>(${t.lifelines} left)</small></button>` : ''}
      </div>`;
  }

  /* Ask a multiple-choice question. Picking an option locks it in; the game then
   * reveals the answer and judges it automatically. Running out of time = wrong.
   * Normal questions resolve to true/false; a head-to-head resolves to {A, B}. */
  let curQ = null; // question on screen (used by automated tests)
  const AUTO_NEXT = 6; // seconds before the game moves on after the reveal
  function ask(o, token) {
    const team = o.team, duel = o.kind === 'challenge';
    let q = drawQuestion(o.prefs);
    const student = duel ? null : studentOf(team);
    let card, locked, picks, autoIv = null;
    return waitChoice(token, done => {
      const finish = v => { clearInterval(autoIv); stopQTimer(); QT.onEnd = null; flowKeys = null; done(v); };
      const prompt = () => {
        const el = $('[data-prompt]', card); if (!el) return;
        const who = picks.length === 0 ? team : o.rival;
        el.innerHTML = `<span style="color:${who.light}">${esc(who.name)}</span>, choose your answer${picks.length ? ` · ${esc(team.name)} 🔒 locked in` : ''}`;
      };
      const reveal = (timedOut) => {
        locked = true; stopQTimer(); QT.onEnd = null;
        $('[data-pre]', card).style.display = 'none';
        const opts = $$('.opt', card);
        opts.forEach((b, i) => { b.disabled = true; b.classList.toggle('right', i === q.a); b.classList.toggle('wrong', i !== q.a); });
        let head, result;
        if (duel) {
          const [pa, pb] = [picks[0], picks[1]];
          [[pa, team], [pb, o.rival]].forEach(([p, t]) => { if (p != null && p >= 0) { opts[p].classList.add('picked'); opts[p].insertAdjacentHTML('beforeend', `<span class="tag" style="background:${t.color}">${esc(t.letter)}</span>`); } });
          result = { A: pa === q.a, B: pb === q.a };
          head = result.A && result.B ? '🤝 Both groups are correct!' : result.A ? `🏅 ${esc(team.name)} is correct!` : result.B ? `🏅 ${esc(o.rival.name)} is correct!` : '❌ Neither group is correct.';
        } else {
          const p = picks[0];
          if (p != null && p >= 0) opts[p].classList.add('picked');
          result = p === q.a;
          head = result ? '✅ Correct!' : timedOut ? '⏰ Time’s up!' : '❌ Not quite!';
        }
        if (timedOut && duel) head = '⏰ Time’s up! ' + head;
        if ((duel ? result.A || result.B : result)) SFX.correct(); else SFX.wrong();
        $('.answer-slot', card).innerHTML = `<div class="answer-box ${(duel ? result.A || result.B : result) ? '' : 'bad'}">
          <div class="verdict-line">${head}</div><b>Answer:</b> ${'ABCD'[q.a]}) ${esc(q.o[q.a])}${q.x ? `<div class="why">💡 ${esc(q.x)}</div>` : ''}</div>
          <div class="q-actions"><span class="spacer"></span><button class="btn big gold" data-next>Continue <kbd>Enter</kbd> <span data-count>${AUTO_NEXT}</span></button></div>`;
        let left = AUTO_NEXT;
        autoIv = setInterval(() => {
          if (game && game.paused) return;
          left--; const c = $('[data-count]', card); if (c) c.textContent = left;
          if (left <= 0) finish(result);
        }, 1000 * SPEED);
        $('[data-next]', card).addEventListener('click', () => finish(result));
        flowKeys = { enter: () => finish(result), ' ': () => finish(result), _replace: null };
      };
      const pick = i => {
        if (locked || i < 0 || i >= q.o.length) return;
        picks.push(i); SFX.click();
        if (duel && picks.length === 1) {
          $$('.opt', card)[i].classList.add('locked-a');
          setTimeout(() => $$('.opt', card).forEach(b => b.classList.remove('locked-a')), 350);
          prompt(); return;
        }
        reveal(false);
      };
      const show = () => {
        locked = false; picks = []; curQ = q;
        card = openFlow(questionHTML(q, o, student), 'q-wide');
        $$('.opt', card).forEach(b => b.addEventListener('click', () => pick(+b.dataset.i)));
        $$('[data-act-q]', card).forEach(b => b.addEventListener('click', () => actions[b.dataset.actQ]()));
        prompt();
        startQTimer(o.seconds, $('.timer', card));
        QT.onEnd = () => { if (!locked) { while (picks.length < (duel ? 2 : 1)) picks.push(-1); reveal(true); } };
        setKeys();
      };
      const askAudience = () => {
        if (locked || duel || !(team.lifelines > 0)) return;
        team.lifelines--; renderScores(); log(`🙋 ${team.name} asked the audience`, team);
        QT.paused = true; drawQT(); SFX.drum();
        const btn = $('[data-act-q="audience"]', card); if (btn) btn.remove();
        const slot = $('.answer-slot', card);
        slot.innerHTML = `<div class="aud-banner"><div class="ab-title">🙋 AUDIENCE VOTE!</div>
          <div class="ab-sub">Audience: raise your hand for <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b> — the timer is paused.</div>
          <div class="ab-count" data-c>10</div><button class="btn gold" data-resume>▶ Resume timer <kbd>Enter</kbd></button></div>`;
        let n = 10;
        const iv = setInterval(() => { n--; const c = $('[data-c]', card); if (!c || n < 0) { clearInterval(iv); return; } c.textContent = n > 0 ? n : '🗳️ Count the hands!'; if (n > 0 && n <= 3) SFX.tick(); }, 1000 * SPEED);
        const resume = () => {
          clearInterval(iv); if (locked) return;
          slot.innerHTML = '<div class="hidden-answer">👆 Tap the group’s answer (or press A–D) — it is checked automatically.</div>';
          QT.paused = false; drawQT(); delete flowKeys.enter; delete flowKeys[' '];
        };
        $('[data-resume]', slot).addEventListener('click', resume);
        flowKeys.enter = resume; flowKeys[' '] = resume;
      };
      const actions = {
        audience: askAudience,
        timer: toggleQTimer, more: () => addQTime(15),
        replace: () => { if (locked || picks.length) return; q = drawQuestion(o.prefs, q.id); toast('↻ Question replaced'); show(); }
      };
      const setKeys = () => {
        flowKeys = { s: actions.replace, '+': actions.more, '=': actions.more, p: toggleQTimer, v: askAudience, _replace: actions.replace };
        ['a', 'b', 'c', 'd'].forEach((k, i) => { flowKeys[k] = () => pick(i); flowKeys[String(i + 1)] = () => pick(i); });
      };
      show();
    }).then(v => {
      closeFlow();
      if (!duel) { team.attempts++; team.memberIdx++; }
      return v;
    });
  }

  function award(team, base, allowDouble = true) {
    let pts = base;
    if (allowDouble && team.double) { pts *= 2; team.double = false; log(`💎 Double points used by ${team.name}!`, team); }
    team.points += pts; team.correct += allowDouble ? 1 : 0;
    renderScores(); floatPts(team, '+' + pts);
    return pts;
  }

  async function verdict(ok, team, base, token, label) {
    if (ok) {
      const pts = award(team, base);
      Confetti.burst(70, innerWidth / 2, innerHeight / 2.4, .8);
      log(`✔ ${team.name} answered ${label} correctly (+${pts})`, team);
      await announce({ icon: '✅', title: 'CORRECT!', sub: `+${pts} points for ${team.name}`, color: '#22c55e', ms: 1200 });
    } else {
      log(`✘ ${team.name} missed ${label}`, team);
      await announce({ icon: '❌', title: 'Not quite!', sub: label === 'the question' ? `${team.name} stays on square ${team.pos}` : '', color: '#ef4444', ms: 1300 });
    }
    chk(token);
    return ok;
  }

  /* ───────────────────────── Movement ───────────────────────── */
  async function walk(team, steps, token) {
    const dir = Math.sign(steps);
    for (let i = 0; i < Math.abs(steps); i++) {
      team.pos = clamp(team.pos + dir, 1, game.size);
      positionTokens(); hop(team.id); SFX.step(i);
      await sleep(290); chk(token);
    }
    renderScores();
  }
  async function climb(team, to, token) {
    const el = $('#tok-' + team.id), lad = $('#ladder-' + team.pos);
    lad && lad.classList.add('active'); el.classList.add('flying'); SFX.ladder();
    team.pos = to; positionTokens();
    await sleep(1350);
    el.classList.remove('flying'); lad && lad.classList.remove('active');
    chk(token); renderScores();
  }
  function slide(team, head, tail, token) {
    const path = $('#snake-' + head), el = $('#tok-' + team.id), g = $('#snakeg-' + head);
    const b = B(), dur = 1900 * SPEED, start = performance.now(), L = path.getTotalLength();
    el.classList.add('sliding'); g && g.classList.add('active'); SFX.snake();
    return new Promise(res => {
      const frame = now => {
        if (token !== flowToken) { res(); return; }
        const k = Math.min(1, (now - start) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const pt = path.getPointAtLength(e * L);
        override[team.id] = { x: pt.x / b.cols, y: pt.y / b.rows }; positionTokens();
        if (k < 1) requestAnimationFrame(frame); else res();
      };
      requestAnimationFrame(frame);
    }).then(() => {
      delete override[team.id]; el.classList.remove('sliding'); g && g.classList.remove('active');
      chk(token); team.pos = tail; positionTokens(); renderScores();
    });
  }

  /* ───────────────────────── Turn flow ───────────────────────── */
  async function onRoll() {
    if (!game || game.phase !== 'roll' || game.paused || setupOpen || flowOpen()) return;
    SFX.unlock();
    pushSnapshot();
    const token = ++flowToken;
    game.phase = 'busy'; render();
    const team = cur();
    try {
      if (team.pos === game.size) {
        await finalChallenge(team, token);
      } else {
        const roll = 1 + rand(6);
        await rollDieAnim(roll); chk(token);
        game.lastRoll = roll;
        log(`🎲 ${team.name} rolled a ${roll}`, team);
        const diff = await chooseDifficulty(team, roll, token);
        const ok = await ask({ kind: 'normal', team, prefs: [diff], points: POINTS[diff], seconds: timers()[diff] }, token);
        await verdict(ok, team, POINTS[diff], token, 'the question');
        if (ok) {
          let target = team.pos + roll;
          if (target > game.size) {
            if (game.settings.exactFinish) { log(`🎯 ${team.name} needs exactly ${game.size - team.pos} to finish — no move`, team); target = team.pos; toast(`Exact roll needed: ${game.size - team.pos}`); }
            else target = game.size;
          }
          if (target !== team.pos) {
            await walk(team, target - team.pos, token);
            log(`➡️ ${team.name} moved to square ${team.pos}`, team);
            await resolveLanding(team, token, true);
          }
        }
      }
      endTurn();
    } catch (e) {
      if (e !== ABORT) { console.error(e); toast('⚠️ Something went wrong — the turn was reset.'); if (game && game.phase === 'busy') { game.phase = 'roll'; render(); } }
    }
  }

  // The die decides the difficulty: 1–2 Easy, 3–4 Moderate, 5–6 Challenging.
  const diffForRoll = roll => (roll <= 2 ? 'E' : roll <= 4 ? 'M' : 'C');
  function chooseDifficulty(team, roll, token) {
    const d = diffForRoll(roll);
    return announce({
      icon: DIFF[d].icon, title: `${DIFF[d].name} question!`,
      sub: `Rolled ${roll} → +${POINTS[d] * (team.double ? 2 : 1)} points · move ${roll} if correct`,
      color: d === 'E' ? '#22c55e' : d === 'M' ? '#f59e0b' : '#ef4444', ms: 1700
    }).then(() => { chk(token); return d; });
  }

  async function resolveLanding(team, token, allowSpecial) {
    const b = B(), pos = team.pos;
    if (pos === game.size) { await finalChallenge(team, token); return; }
    if (b.ladders[pos]) {
      const top = b.ladders[pos];
      $('#ladder-' + pos) && $('#ladder-' + pos).classList.add('active');
      SFX.drum();
      await announce({ icon: '🪜', title: 'LADDER!', sub: `Answer the bonus question to climb to square ${top}`, color: '#fbbf24', ms: 1700 }); chk(token);
      const ok = await ask({ kind: 'ladder', team, prefs: ['M', 'C'], points: POINTS.ladder, seconds: timers().LS }, token);
      $('#ladder-' + pos) && $('#ladder-' + pos).classList.remove('active');
      await verdict(ok, team, POINTS.ladder, token, 'the ladder challenge');
      if (ok) {
        await climb(team, top, token);
        log(`🪜 ${team.name} climbed from ${pos} to ${top}!`, team);
        Confetti.burst(120);
        await announce({ icon: '🧗', title: 'CLIMBED!', sub: `${team.name} is now on square ${top}`, color: '#fbbf24', ms: 1300 }); chk(token);
        if (team.pos === game.size) await finalChallenge(team, token);
      } else log(`🪜 ${team.name} stays at the bottom of the ladder (${pos})`, team);
      return;
    }
    if (b.snakes[pos]) {
      const tail = b.snakes[pos], g = $('#snakeg-' + pos);
      if (team.shields > 0) {
        team.shields--; SFX.shield(); renderScores();
        log(`🛡️ ${team.name}'s shield blocked the snake on ${pos}!`, team);
        await specialCard(token, { icon: '🛡️', title: 'Shield Activated!', color: '#22d3ee', tag: 'Snake protection', desc: `The snake on square ${pos} bounces off ${esc(team.name)}’s force-field. You are safe!` });
        return;
      }
      g && g.classList.add('active'); SFX.hiss();
      await announce({ icon: '🐍', title: 'SNAKE!', sub: `Answer the rescue question or slide down to ${tail}`, color: '#22c55e', ms: 1700 }); chk(token);
      g && g.classList.remove('active');
      const ok = await ask({ kind: 'snake', team, prefs: ['M', 'C'], points: POINTS.snake, seconds: timers().LS }, token);
      await verdict(ok, team, POINTS.snake, token, 'the snake rescue');
      if (ok) {
        log(`🦸 ${team.name} escaped the snake on ${pos}!`, team);
        await announce({ icon: '🦸', title: 'RESCUED!', sub: `${team.name} escapes the snake`, color: '#22d3ee', ms: 1300 }); chk(token);
      } else {
        await slide(team, pos, tail, token);
        log(`🐍 ${team.name} slid down from ${pos} to ${tail}`, team);
      }
      return;
    }
    if (allowSpecial && b.specials[pos]) await applySpecial(team, b.specials[pos], token);
  }

  function specialCard(token, { icon, title, desc, color, tag, btn = 'Continue' }, extraHTML = '', bind) {
    return waitChoice(token, done => {
      const card = openFlow(`<div class="special-card" style="--sc:${color}"><div class="rays"></div>
          <div class="sp-tag">${esc(tag || '')}</div><div class="sp-big">${icon}</div>
          <div class="sp-title">${esc(title)}</div><div class="sp-desc">${desc}</div>${extraHTML}
          ${btn ? `<div class="row center"><button class="btn big gold" data-go>${btn} <kbd>Enter</kbd></button></div>` : ''}</div>`, 'has-rays');
      const go = $('[data-go]', card);
      if (go) go.addEventListener('click', () => done(null));
      flowKeys = btn ? { enter: () => done(null), ' ': () => done(null) } : {};
      if (bind) bind(card, done);
    }).then(v => { closeFlow(); return v; });
  }

  function teamPickHTML(list, sub) {
    return `<div class="team-pick">${list.map(t => `<button style="--c:${t.color}" data-team="${t.id}">${t.icon} ${esc(t.name)}<small>${sub(t)}</small></button>`).join('')}</div>`;
  }

  async function applySpecial(team, type, token) {
    if (type === 'mystery') {
      SFX.drum();
      await waitChoice(token, done => {
        const card = openFlow(`<div class="special-card" style="--sc:${SPECIALS.mystery.color}"><div class="rays"></div><div class="sp-tag">Mystery square</div>
          <div class="sp-big" id="mysIcon">❓</div><div class="sp-title">Mystery Square!</div><div class="sp-desc">Revealing your power-up…</div></div>`, 'has-rays');
        let i = 0; const icon = $('#mysIcon', card);
        const iv = setInterval(() => { icon.textContent = SPECIALS[EFFECTS[i++ % EFFECTS.length]].icon; SFX.tick(); }, 110);
        setTimeout(() => { clearInterval(iv); done(); }, 1900 * SPEED);
      });
      closeFlow();
      type = EFFECTS[rand(EFFECTS.length)];
      log(`❓ Mystery square revealed: ${SPECIALS[type].name}`, team);
    }
    const sp = SPECIALS[type], others = game.teams.filter(t => t.id !== team.id);
    const base = { icon: sp.icon, title: sp.name, color: sp.color, tag: `${team.name} · square ${team.pos}` };
    SFX.special();
    switch (type) {
      case 'bonus':
        team.points += POINTS.bonus; renderScores(); floatPts(team, '+10');
        Confetti.burst(100);
        log(`🎁 ${team.name} earned +10 bonus points`, team);
        await specialCard(token, Object.assign(base, { desc: sp.desc }));
        break;
      case 'extra':
        team.extraTurn = true; renderScores();
        log(`⚡ ${team.name} earned an extra turn`, team);
        await specialCard(token, Object.assign(base, { desc: sp.desc }));
        break;
      case 'shield':
        team.shields++; renderScores(); SFX.shield();
        log(`🛡️ ${team.name} picked up snake protection`, team);
        await specialCard(token, Object.assign(base, { desc: sp.desc }));
        break;
      case 'double':
        team.double = true; renderScores();
        log(`💎 ${team.name}'s next correct answer earns double points`, team);
        await specialCard(token, Object.assign(base, { desc: sp.desc }));
        break;
      case 'forward5': {
        await specialCard(token, Object.assign(base, { desc: sp.desc, btn: '🚀 Blast off!' }));
        SFX.whoosh();
        const to = Math.min(game.size, team.pos + 5);
        await walk(team, to - team.pos, token);
        log(`🚀 ${team.name} boosted to square ${team.pos}`, team);
        await resolveLanding(team, token, false);
        break;
      }
      case 'back3': {
        await specialCard(token, Object.assign(base, { desc: sp.desc, btn: '⏪ Slide back' }));
        const to = Math.max(1, team.pos - 3);
        await walk(team, to - team.pos, token);
        log(`⏪ ${team.name} moved back to square ${team.pos}`, team);
        await resolveLanding(team, token, false);
        break;
      }
      case 'swap': {
        const pick = await specialCard(token, Object.assign(base, { desc: sp.desc, btn: null }),
          teamPickHTML(others, t => `on square ${t.pos}`) + `<div class="row center"><button class="btn big" data-keep>🙅 Keep my position (square ${team.pos})</button></div>`,
          (card, done) => {
            $$('[data-team]', card).forEach(b => b.addEventListener('click', () => done(+b.dataset.team)));
            $('[data-keep]', card).addEventListener('click', () => done(-1));
          });
        if (pick != null && pick >= 0) {
          const other = game.teams[pick];
          const a = team.pos; team.pos = other.pos; other.pos = a;
          [team, other].forEach(t => $('#tok-' + t.id).classList.add('flying'));
          SFX.whoosh(); positionTokens();
          await sleep(1350);
          [team, other].forEach(t => $('#tok-' + t.id).classList.remove('flying'));
          chk(token); renderScores();
          log(`🔄 ${team.name} (now ${team.pos}) swapped with ${other.name} (now ${other.pos})`, team);
          await announce({ icon: '🔄', title: 'SWAPPED!', sub: `${team.name} ↔ ${other.name}`, color: sp.color, ms: 1300 }); chk(token);
          if (team.pos === game.size) await finalChallenge(team, token);
        } else log(`🔄 ${team.name} chose to keep its position`, team);
        break;
      }
      case 'challenge': {
        const rid = await specialCard(token, Object.assign(base, { desc: sp.desc, btn: null }),
          teamPickHTML(others, t => `${t.points} points`),
          (card, done) => $$('[data-team]', card).forEach(b => b.addEventListener('click', () => done(+b.dataset.team))));
        const rival = game.teams[rid];
        await announce({ icon: '⚔️', title: 'HEAD TO HEAD!', sub: `${team.name} vs ${rival.name}`, color: sp.color, ms: 1500 }); chk(token);
        const res = await ask({ kind: 'challenge', team, rival, prefs: ['M'], points: POINTS.challenge, seconds: timers().M }, token);
        const winners = [res.A && team, res.B && rival].filter(Boolean);
        if (winners.length) {
          winners.forEach(w => { award(w, POINTS.challenge, false); log(`🎯 ${w.name} answered the challenge correctly (+${POINTS.challenge})`, w); });
          Confetti.burst(90);
          await announce({ icon: '🏅', title: winners.length === 2 ? 'Both score!' : `${winners[0].name} wins!`, sub: `+${POINTS.challenge} points${winners.length === 2 ? ' each' : ''}`, color: winners[0].color, ms: 1500 });
        } else {
          log(`🎯 Challenge ${team.name} vs ${rival.name}: no winner`, team);
          await announce({ icon: '🤝', title: 'No winner', sub: 'Nobody scores this time', color: '#94a3b8', ms: 1300 });
        }
        chk(token);
        break;
      }
    }
  }

  async function finalChallenge(team, token) {
    SFX.drum();
    await announce({ icon: '🏆', title: 'FINAL CHALLENGE', sub: `${team.name} must answer correctly to become champion!`, color: '#e879f9', ms: 2000 }); chk(token);
    const ok = await ask({ kind: 'final', team, prefs: ['C'], points: POINTS.final, seconds: timers().F }, token);
    if (ok) {
      award(team, POINTS.final);
      log(`🏆 ${team.name} answered the final challenge and WON!`, team);
      game.phase = 'over'; game.endReason = 'win'; game.winner = team.id;
      saveAuto(); render();
      await celebrate(team);
    } else {
      log(`😮 ${team.name} missed the final challenge — stays on ${game.size}, tries again next turn`, team);
      await announce({ icon: '😮', title: 'So close!', sub: `${team.name} stays on ${game.size} and tries again next turn`, color: '#ef4444', ms: 1800 });
      chk(token);
    }
  }

  function endTurn() {
    if (!game || game.phase === 'over') return;
    const t = cur();
    if (t.extraTurn) {
      t.extraTurn = false;
      log(`⚡ ${t.name} takes an extra turn!`, t);
      announce({ icon: '⚡', title: 'EXTRA TURN!', sub: `${t.name} rolls again`, color: '#facc15', ms: 1300 });
    } else {
      game.turn = (game.turn + 1) % game.teams.length;
      if (game.turn === 0) { game.round++; if (game.round % 3 === 1) toast('🎤 Good moment for an audience question — press Q or the 🎤 button', 4500); }
    }
    game.phase = 'roll';
    saveAuto(); render();
  }

  /* ───────────────────────── Game control ───────────────────────── */
  function startGame(g, opts = {}) {
    abortFlow();
    game = g; history = opts.keepHistory ? history : [];
    if (game.phase === 'busy') game.phase = 'roll';
    game.teams.forEach(t => { if (t.lifelines == null) t.lifelines = 1; if (t.section == null) t.section = ''; });
    game.paused = false;
    hidePodium(); closeTool(); setupOpen = false;
    buildBoard(); render(); saveAuto();
    if (opts.announce !== false && game.phase !== 'over') {
      SFX.special();
      announce({ icon: '🎲', title: opts.title || 'LET’S PLAY!', sub: `${cur().name} goes first · Good luck, physicists!`, color: '#22d3ee', ms: 2000 });
    }
    if (game.phase === 'over') showPodium(false);
  }

  function saveAuto() {
    if (!game) return;
    let g = game;
    if (game.phase === 'busy' && history.length) { g = JSON.parse(history[history.length - 1]); g.timeLeft = game.timeLeft; }
    STORE.set(KEYS.save, { game: g, used: prefs.used, savedAt: Date.now() });
  }

  function togglePause() {
    if (!game || game.phase === 'over') return;
    game.paused = !game.paused;
    log(game.paused ? '⏸ Game paused' : '▶ Game resumed');
    render();
  }

  function undo() {
    if (!history.length) { toast('Nothing to undo'); return; }
    const tl = game ? game.timeLeft : 0;
    abortFlow();
    game = JSON.parse(history.pop());
    if (game.phase === 'busy') game.phase = 'roll';
    game.timeLeft = tl; game.paused = false;
    hidePodium(); buildTokens(); render(); saveAuto();
    toast('↶ Undone — back to the start of the last turn');
  }

  function skipTurn() {
    if (!game || game.phase === 'over') return;
    abortFlow();
    log(`⏭ ${cur().name}'s turn was skipped`, cur());
    cur().extraTurn = false;
    game.phase = 'busy'; endTurn();
  }

  async function timeUp() {
    if (!game || game.phase === 'over') return;
    abortFlow();
    game.phase = 'over'; game.endReason = 'time';
    game.winner = ranking()[0].id;
    log('⏰ Time is up! Winner decided by points.');
    saveAuto(); render(); SFX.gong();
    await announce({ icon: '⏰', title: 'TIME’S UP!', sub: 'Most points wins — board position breaks ties', color: '#ef4444', ms: 2600 });
    if (game && game.phase === 'over') showPodium(true);
  }

  function endNow() {
    if (!game || game.phase === 'over') return;
    confirmBox('End the championship now? The group with the most points wins (board position breaks ties).', 'End & crown winner').then(ok => { if (ok) { pushSnapshot(); timeUp(); } });
  }

  async function celebrate(team) {
    SFX.win(); Confetti.burst(220); Confetti.rain(200);
    await announce({ icon: '🏆', title: 'CHAMPIONS!', sub: `${team.name} wins the Physics Championship!`, color: team.color, ms: 2600 });
    if (game && game.phase === 'over') showPodium(true);
  }

  function star(cx, cy, R, r) {
    let p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1)); }
    return p.join(' ');
  }
  const TROPHY = `<svg class="trophy" viewBox="0 0 200 230" aria-label="Trophy">
    <defs><linearGradient id="tgG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#92400e"/><stop offset=".35" stop-color="#fde68a"/><stop offset=".55" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient>
    <clipPath id="tgClip"><path d="M50 18h100v42c0 42-22 68-50 72c-28-4-50-30-50-72z"/></clipPath></defs>
    <path d="M52 34H24c-4 34 12 54 36 58" fill="none" stroke="url(#tgG)" stroke-width="11" stroke-linecap="round"/>
    <path d="M148 34h28c4 34-12 54-36 58" fill="none" stroke="url(#tgG)" stroke-width="11" stroke-linecap="round"/>
    <path d="M50 18h100v42c0 42-22 68-50 72c-28-4-50-30-50-72z" fill="url(#tgG)"/>
    <g clip-path="url(#tgClip)"><g class="shine"><rect x="40" y="0" width="26" height="160" fill="rgba(255,255,255,.55)" transform="skewX(-20)"/></g></g>
    <polygon points="${star(100, 62, 22, 9)}" fill="#fff7d6" opacity=".95"/>
    <rect x="88" y="130" width="24" height="34" fill="url(#tgG)"/>
    <path d="M62 164h76l10 24H52z" fill="url(#tgG)"/>
    <rect x="42" y="188" width="116" height="30" rx="6" fill="#4c1d95" stroke="#fbbf24" stroke-width="3"/>
    <text x="100" y="209" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" fill="#fde68a" font-weight="700" letter-spacing="2">CHAMPIONS</text></svg>`;

  function showPodium(withFx = true) {
    if (!game) return;
    const st = standings(), w = st[0];
    const pod = (t, place) => t ? `<div class="pod p${place}" style="--c:${t.color};--l:${t.light}">
        <div class="p-tok">${t.icon}</div><div class="p-name">${esc(t.name)}</div>
        <div class="p-stats">⭐ ${t.points} pts · 📍 ${t.pos}</div><div class="block">${place}</div></div>` : '';
    const reason = game.endReason === 'win' ? `${w.name} reached square ${game.size} and solved the final challenge!`
      : game.endReason === 'time' ? 'Time is up — ranked by points, board position breaks ties.' : '';
    $('#podium').innerHTML = `<div class="p-rays"></div>
      <h1>🏆 Physics Champions 🏆</h1><div class="p-reason">${esc(reason)}</div>
      <div class="trophy-wrap">${TROPHY}</div>
      <div class="winner-name" style="--c:${w.color}">${w.icon} ${esc(w.name)}</div>
      <div class="podium">${pod(st[1], 2)}${pod(st[0], 1)}${pod(st[2], 3)}</div>
      ${st[3] ? `<div class="fourth" style="--c:${st[3].color}">4th · ${st[3].icon} ${esc(st[3].name)} — ⭐ ${st[3].points} pts · 📍 square ${st[3].pos}</div>` : ''}
      <table class="standings"><tr><th>Place</th><th>Group</th><th>Points</th><th>Square</th><th>Correct</th><th>Accuracy</th></tr>
        ${st.map((t, i) => `<tr><td>${['🥇', '🥈', '🥉', '4th'][i]}</td><td style="color:${t.light}">${t.icon} ${esc(t.name)}</td><td>${t.points}</td><td>${t.pos}</td><td>${t.correct}/${t.attempts}</td><td>${t.attempts ? Math.round(t.correct / t.attempts * 100) : 0}%</td></tr>`).join('')}
      </table>
      <div class="podium-actions">
        <button class="btn big" data-act="podium-close">📋 View board</button>
        <button class="btn big cyan" data-act="results">⬇ Results (CSV)</button>
        <button class="btn big purple" data-act="rematch">🔁 Rematch</button>
        <button class="btn big gold" data-act="setup">🆕 New championship</button>
      </div>`;
    $('#podium').classList.add('show');
    if (withFx) { SFX.win(); Confetti.rain(260); setTimeout(() => Confetti.burst(160, innerWidth * .3, innerHeight * .4), 600); setTimeout(() => Confetti.burst(160, innerWidth * .7, innerHeight * .4), 1100); }
  }
  function hidePodium() { $('#podium').classList.remove('show'); }

  function download(name, text, type = 'application/json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const csvCell = v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);

  function exportResults() {
    if (!game) return;
    const rows = [['Place', 'Group', 'Points', 'Square', 'Correct', 'Attempts', 'Students']];
    standings().forEach((t, i) => rows.push([i + 1, t.name, t.points, t.pos, t.correct, t.attempts, t.members.join('; ')]));
    download(`physics-championship-results-${stamp()}.csv`, rows.map(r => r.map(csvCell).join(',')).join('\n'), 'text/csv');
  }
  function exportSave() {
    if (!game) { toast('No game to export'); return; }
    saveAuto();
    download(`physics-championship-save-${stamp()}.json`, JSON.stringify(STORE.get(KEYS.save, { game, used: prefs.used }), null, 1));
  }
  function validGame(g) {
    return g && BOARDS[g.size] && Array.isArray(g.teams) && g.teams.length === 4 && g.teams.every(t => typeof t.pos === 'number' && t.pos >= 1 && t.pos <= g.size && Array.isArray(t.members) && t.members.length) && g.settings && g.settings.timers;
  }
  function loadSaveObj(obj) {
    if (!obj || !validGame(obj.game)) { toast('⚠️ That file is not a valid saved game.'); return false; }
    if (Array.isArray(obj.used)) { prefs.used = obj.used; savePrefs(); }
    startGame(obj.game, { title: 'WELCOME BACK!' });
    toast('📂 Game loaded');
    return true;
  }

  /* ───────────────────────── File input ───────────────────────── */
  let fileHandler = null;
  function pickFile(accept, fn) {
    const inp = $('#fileInput'); inp.value = ''; inp.accept = accept; fileHandler = fn; inp.click();
  }
  $('#fileInput').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f || !fileHandler) return;
    const r = new FileReader(); const fn = fileHandler;
    r.onload = () => fn(String(r.result), f.name);
    r.readAsText(f);
  });

  /* ───────────────────────── Tool modal / dialog ───────────────────────── */
  function openTool(html, cls = '') {
    const m = $('#toolModal'), old = $('.modal-card', m), c = old.cloneNode(false); // fresh node drops old listeners
    old.replaceWith(c);
    c.className = 'modal-card ' + cls; c.innerHTML = html; m.classList.add('show');
    return c;
  }
  function closeTool() {
    $('#toolModal').classList.remove('show'); if (setupOpen && game) setupOpen = false;
    if (audienceOpen) { audienceOpen = false; stopQTimer(); QT.onEnd = null; }
    toolKeys = null;
  }
  const toolOpen = () => $('#toolModal').classList.contains('show');

  let dialogDone = null;
  function confirmBox(msg, okLabel = 'OK', cancelLabel = 'Cancel') {
    return new Promise(res => {
      const m = $('#dialog'), c = $('.modal-card', m);
      c.innerHTML = `<h2 style="font-size:26px">Please confirm</h2><p style="font-size:19px">${esc(msg)}</p>
        <div class="row end">${cancelLabel ? `<button class="btn" data-dlg="0">${esc(cancelLabel)}</button>` : ''}<button class="btn gold" data-dlg="1">${esc(okLabel)}</button></div>`;
      m.classList.add('show');
      dialogDone = v => { m.classList.remove('show'); dialogDone = null; res(v); };
      $$('[data-dlg]', c).forEach(b => b.addEventListener('click', () => dialogDone(b.dataset.dlg === '1')));
    });
  }

  /* ───────────────────────── Setup screen ───────────────────────── */
  function openSetup() {
    setupOpen = true;
    const s = prefs.setup, saved = STORE.get(KEYS.save, null);
    const canResume = saved && validGame(saved.game);
    const savedInfo = canResume ? `${saved.game.teams.map(t => t.name).join(', ')} · ${new Date(saved.savedAt).toLocaleString()}${saved.game.phase === 'over' ? ' (finished)' : ''}` : '';
    const card = openTool(`
      <div class="setup-hero"><div class="logo"><span>🐍</span><span>🎲</span><span>🪜</span></div>
        <h1>Physics Snakes &amp; Ladders Championship</h1>
        <p>Grade 10 Physics · four groups · answer to move · first to the top who solves the final challenge wins!</p></div>
      ${canResume ? `<div class="panel" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px;border-color:var(--gold)">
        <div style="flex:1;min-width:200px"><b style="font-size:18px">💾 Saved game found</b><div class="muted">${esc(savedInfo)}</div></div>
        <button class="btn big gold" data-s="resume">▶ Resume saved game</button></div>` : ''}
      <h3>👥 The four groups</h3>
      <div class="teams-setup">${TEAMS.map((t, i) => `<div class="team-setup" style="--c:${t.color};--l:${t.light}">
        <div class="ts-head"><span class="tok">${t.icon}</span> Group ${t.letter}</div>
        <div class="field">Group name<input class="inp" data-name="${i}" maxlength="32" value="${esc(s.names[i] || t.name)}"></div>
        <div class="field" style="margin-top:6px">Supporters’ section in the hall<input class="inp" data-sec="${i}" maxlength="30" placeholder="e.g. Left side, front rows" value="${esc((s.sections || [])[i] || '')}"></div>
        <div class="field" style="margin-top:6px">Students (one per line — they take turns answering)<textarea data-mem="${i}" placeholder="Leave empty for Student 1–4">${esc(s.members[i] || '')}</textarea></div>
      </div>`).join('')}</div>
      <h3>⚙️ Match settings</h3>
      <div class="settings-grid">
        <div class="field">Board<div class="seg" data-seg="size"><button data-v="100" class="${s.size === 100 ? 'on' : ''}">100 squares</button><button data-v="50" class="${s.size === 50 ? 'on' : ''}">50 squares</button></div></div>
        <div class="field">Competition time limit (minutes, 0 = none)<input class="inp" type="number" min="0" max="300" data-f="minutes" value="${s.minutes}"></div>
        <div class="field">Question difficulty<div style="color:var(--text);font-size:15px">🎲 Set by the die: 1–2 Easy · 3–4 Moderate · 5–6 Challenging</div></div>
        <div class="field">🙋 Ask-the-Audience lifelines per group<input class="inp" type="number" min="0" max="3" data-f="lifelines" value="${s.lifelines == null ? 1 : s.lifelines}"></div>
        <div class="field">Finishing<label class="check"><input type="checkbox" data-f="exactFinish" ${s.exactFinish ? 'checked' : ''}> Exact roll needed to reach the last square</label></div>
      </div>
      <div class="field" style="margin-top:12px">Question timers (seconds)
        <div class="timers-row">
          ${[['E', '🌱 Easy'], ['M', '🔥 Moderate'], ['C', '💥 Challenging'], ['LS', '🪜🐍 Ladder/Snake'], ['F', '🏆 Final']].map(([k, l]) => `<label class="field">${l}<input class="inp" type="number" min="5" max="600" data-t="${k}" value="${s.timers[k]}"></label>`).join('')}
        </div></div>
      <h3>📚 Topics in play <small class="muted" style="font-size:14px">(${bank.length} questions in the bank)</small></h3>
      <div class="cat-list">${Object.entries(CATS).map(([k, c]) => `<label class="check"><input type="checkbox" data-cat="${k}" ${s.cats.includes(+k) ? 'checked' : ''}> ${c.icon} ${esc(c.name)} <span class="muted">(${bank.filter(q => q.c === +k).length})</span></label>`).join('')}</div>
      <div class="setup-actions">
        ${game ? '<button class="btn big" data-s="cancel">✕ Back to current game</button>' : ''}
        <button class="btn big" data-s="bank">📚 Question bank</button>
        <button class="btn big" data-s="load">📂 Load save file</button>
        <button class="btn big" data-s="help">❓ How to play</button>
        <button class="btn big" data-s="welcome">📺 Preview welcome screen</button>
        <button class="btn big gold" data-s="start">🚀 Start championship</button>
      </div>`, 'setup');

    const read = () => {
      const n = {
        names: TEAMS.map((t, i) => $(`[data-name="${i}"]`, card).value.trim() || t.name),
        members: TEAMS.map((t, i) => $(`[data-mem="${i}"]`, card).value),
        sections: TEAMS.map((t, i) => $(`[data-sec="${i}"]`, card).value.trim()),
        lifelines: clamp(+$('[data-f="lifelines"]', card).value || 0, 0, 3),
        size: +$('[data-seg="size"] .on', card).dataset.v,
        minutes: clamp(+$('[data-f="minutes"]', card).value || 0, 0, 300),
        exactFinish: $('[data-f="exactFinish"]', card).checked,
        timers: {}, cats: $$('[data-cat]', card).filter(x => x.checked).map(x => +x.dataset.cat)
      };
      ['E', 'M', 'C', 'LS', 'F'].forEach(k => { n.timers[k] = clamp(+$(`[data-t="${k}"]`, card).value || 30, 5, 600); });
      if (!n.cats.length) n.cats = [1, 2, 3, 4, 5, 6, 7, 8];
      return n;
    };
    $$('[data-seg] button', card).forEach(b => b.addEventListener('click', () => {
      $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b));
      if (!game) { prefs.setup.size = +b.dataset.v; buildBoard(); }
    }));
    card.addEventListener('input', () => { prefs.setup = read(); savePrefs(); });
    $$('[data-s]', card).forEach(b => b.addEventListener('click', async () => {
      const a = b.dataset.s;
      if (a === 'start') {
        prefs.setup = read(); savePrefs();
        if (game && game.phase !== 'over' && !(await confirmBox('Start a NEW championship? The current match will be replaced.', 'Start new'))) return;
        startGame(newGame(prefs.setup), { announce: false });
        openWelcome(true);
      } else if (a === 'resume') loadSaveObj(STORE.get(KEYS.save, null));
      else if (a === 'load') pickFile('.json,application/json', txt => { try { loadSaveObj(JSON.parse(txt)); } catch (e) { toast('⚠️ Could not read that file.'); } });
      else if (a === 'bank') { prefs.setup = read(); savePrefs(); openBank(true); }
      else if (a === 'help') openHelp(true);
      else if (a === 'welcome') { prefs.setup = read(); savePrefs(); openWelcome(false); }
      else if (a === 'cancel') { setupOpen = false; closeTool(); }
    }));
  }

  /* ───────────────────────── Audience question ───────────────────────── */
  let audienceOpen = false, toolKeys = null;
  function openAudienceQ() {
    if (!game) { toast('Start the championship first.'); return; }
    if (game.phase === 'busy' || flowOpen()) { toast('Finish the current turn first — then ask the audience.'); return; }
    toggleDrawer(false);
    let q, locked;
    const show = () => {
      q = drawQuestion(['E', 'M']); locked = false; audienceOpen = true;
      const cat = CATS[q.c] || CATS[1];
      const card = openTool(`
        <div class="q-head"><span class="chip kind" style="background:linear-gradient(90deg,#ec4899,#7c3aed)">🎤 Audience Question</span>
          <span class="chip">${cat.icon} ${esc(cat.name)}</span><span class="chip ${q.d}">${DIFF[q.d].name}</span><span class="chip pts">🎁 Prize question</span></div>
        <div class="q-team" style="--c:#ec4899"><span style="font-size:30px">🙋</span><b>Audience</b><span class="student">First correct hand wins!</span></div>
        <div class="q-body"><div>
          <div class="q-text">${esc(q.q)}</div>
          <div class="options">${q.o.map((x, i) => `<button class="opt" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${esc(x)}</span></button>`).join('')}</div>
          <div class="answer-slot"><div class="hidden-answer">👆 Choose a student with a raised hand, then tap their answer (or press A–D).</div></div>
        </div>
        <div class="timer"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/><circle class="prog" cx="60" cy="60" r="52" stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="0"/></svg><div class="t-num"></div></div></div>
        <div class="q-actions">
          <button class="btn" data-aq="show">👁 Show answer</button><button class="btn" data-aq="next">↻ Another audience question</button>
          <span class="spacer"></span><button class="btn big gold" data-aq="close">🎲 Back to the game <kbd>Esc</kbd></button></div>`, 'q-wide');
      const reveal = p => {
        if (locked) return; locked = true; stopQTimer(); QT.onEnd = null;
        const ok = p === q.a;
        $$('.opt', card).forEach((b, i) => { b.disabled = true; b.classList.toggle('right', i === q.a); b.classList.toggle('wrong', i !== q.a); b.classList.toggle('picked', i === p); });
        if (p != null) { if (ok) { SFX.correct(); Confetti.burst(120); } else SFX.wrong(); } else SFX.special();
        const head = p == null ? '📢 The answer is…' : ok ? '🎉 Correct — a prize for that student!' : '❌ Not quite — anyone else?';
        $('.answer-slot', card).innerHTML = `<div class="answer-box ${p == null || ok ? '' : 'bad'}"><div class="verdict-line">${head}</div><b>Answer:</b> ${'ABCD'[q.a]}) ${esc(q.o[q.a])}${q.x ? `<div class="why">💡 ${esc(q.x)}</div>` : ''}</div>`;
      };
      $$('.opt', card).forEach(b => b.addEventListener('click', () => reveal(+b.dataset.i)));
      $$('[data-aq]', card).forEach(b => b.addEventListener('click', () => ({ show: () => reveal(null), next: show, close: closeTool })[b.dataset.aq]()));
      startQTimer(Math.max(15, timers().E), $('.timer', card));
      QT.onEnd = () => reveal(null);
      toolKeys = { n: show, enter: closeTool };
      ['a', 'b', 'c', 'd'].forEach((k, i) => { toolKeys[k] = () => reveal(i); toolKeys[String(i + 1)] = () => reveal(i); });
      SFX.special();
    };
    show();
  }

  /* ───────────────────────── Welcome / rules slideshow ───────────────────────── */
  let welcomeOpen = false, welcomeIv = null, welcomeSlide = 0, welcomeStart = false;
  function welcomeSlides() {
    const teams = game ? game.teams : TEAMS.map((t, i) => Object.assign({}, t, { name: prefs.setup.names[i] || t.name, section: (prefs.setup.sections || [])[i] || '' }));
    const size = game ? game.size : prefs.setup.size;
    return [
      `<div class="w-kicker">Welcome to the</div><h1 class="w-title">Grade 10 Physics<br>Snakes &amp; Ladders Championship</h1>
       <div class="w-teams">${teams.map(t => `<div class="w-team" style="--c:${t.color};--l:${t.light}"><div class="w-tok">${t.icon}</div><div class="w-name">${esc(t.name)}</div>${t.section ? `<div class="w-sec">📣 Supporters: ${esc(t.section)}</div>` : ''}</div>`).join('')}</div>
       <div class="w-foot">🎲 Four groups · 🧠 Physics questions · 🏆 One champion</div>`,
      `<h2 class="w-h">🎲 How to play</h2><ul class="w-list">
        <li>Groups take turns rolling the die.</li>
        <li>The roll decides the question: <b class="tE">1–2 Easy · 5 pts</b>, <b class="tM">3–4 Moderate · 10 pts</b>, <b class="tC">5–6 Challenging · 15 pts</b></li>
        <li>✅ Correct answer → earn the points and move forward by the roll.</li>
        <li>❌ Wrong answer or time runs out → stay where you are.</li>
        <li>🏆 Reach square ${size} and answer the <b>Final Challenge</b> to win!</li></ul>`,
      `<h2 class="w-h">🪜 Snakes, ladders &amp; power-ups</h2>
       <div class="w-two"><div class="w-card" style="--c:#fbbf24">🪜 <b>Ladder</b><br>Answer a bonus question to climb up (+15)</div><div class="w-card" style="--c:#22c55e">🐍 <b>Snake</b><br>Answer a rescue question or slide down (+15)</div></div>
       <div class="w-specials">${Object.values(SPECIALS).map(sp => `<div style="--c:${sp.color}"><span>${sp.icon}</span>${esc(sp.name)}</div>`).join('')}</div>`,
      `<h2 class="w-h">📣 Audience rules</h2><ul class="w-list">
        <li>📣 Cheer loudly for your group!</li>
        <li>🤫 <b>Never shout out answers</b> — the question will be replaced.</li>
        <li>🙋 Each group has an <b>Ask the Audience</b> lifeline — when it is used, raise your hand for A, B, C or D.</li>
        <li>🎤 Watch out for <b>audience questions</b> — the first correct hand wins a prize!</li></ul>`
    ];
  }
  function openWelcome(startAfter) {
    if (!startAfter && flowOpen()) { toast('Finish the current turn first.'); return; }
    welcomeOpen = true; welcomeStart = !!startAfter; welcomeSlide = 0;
    toggleDrawer(false);
    const el = $('#welcome'), slides = welcomeSlides();
    el.innerHTML = `<div class="w-rays"></div><div class="w-stage">${slides.map((h, i) => `<section class="w-slide ${i === 0 ? 'on' : ''}">${h}</section>`).join('')}</div>
      <div class="w-bar"><button class="btn" data-w="prev">←</button><div class="w-dots">${slides.map((_, i) => `<i data-dot="${i}" class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div><button class="btn" data-w="next">→</button>
      <span class="spacer"></span><button class="btn big gold" data-w="go">${startAfter ? '🎬 Start the show' : '🎲 Back to the game'} <kbd>Enter</kbd></button></div>`;
    el.classList.add('show');
    $$('[data-w]', el).forEach(b => b.addEventListener('click', () => ({ prev: () => goSlide(-1), next: () => goSlide(1), go: closeWelcome })[b.dataset.w]()));
    $$('[data-dot]', el).forEach(d => d.addEventListener('click', () => goSlide(+d.dataset.dot - welcomeSlide)));
    clearInterval(welcomeIv); welcomeIv = setInterval(() => goSlide(1), 12000);
  }
  function goSlide(d) {
    const el = $('#welcome'), sl = $$('.w-slide', el), n = sl.length;
    welcomeSlide = ((welcomeSlide + d) % n + n) % n;
    sl.forEach((x, i) => x.classList.toggle('on', i === welcomeSlide));
    $$('[data-dot]', el).forEach((x, i) => x.classList.toggle('on', i === welcomeSlide));
  }
  function closeWelcome() {
    if (!welcomeOpen) return;
    welcomeOpen = false; clearInterval(welcomeIv); $('#welcome').classList.remove('show');
    if (welcomeStart && game) {
      welcomeStart = false; SFX.special(); Confetti.burst(160);
      announce({ icon: '🎲', title: 'LET’S PLAY!', sub: `${cur().name} goes first · Good luck, physicists!`, color: '#22d3ee', ms: 2000 });
    }
  }

  /* ───────────────────────── Help ───────────────────────── */
  function openHelp(fromSetup) {
    const b = B();
    const card = openTool(`<h2>❓ How to play</h2>
      <ol style="font-size:19px;line-height:1.5;margin-top:0">
        <li>Groups take turns. The teacher rolls the die (<b>Space</b>).</li>
        <li>The roll sets the question: <b>1–2 Easy</b> (5 pts), <b>3–4 Moderate</b> (10 pts), <b>5–6 Challenging</b> (15 pts). A rotating student answers the multiple-choice question (with help from the group) before the timer ends.</li>
        <li>Tap the option the group chooses. The game checks it automatically and shows the correct answer. Correct = earn points and move forward by the roll. Wrong (or time runs out) = stay put.</li>
        <li><b>Ladder foot 🪜</b>: answer a bonus question to climb. <b>Snake head 🐍</b>: answer a rescue question or slide down.</li>
        <li>Reaching square ${b.size} triggers the <b>Final Challenge</b>. Miss it? Stay on ${b.size} and try again next turn.</li>
        <li>If the competition clock runs out, the group with the most points wins (board position breaks ties).</li>
      </ol>
      <div class="row" style="align-items:flex-start;gap:28px">
        <div><h3>⭐ Points</h3><table class="pts"><tr><th>Question</th><th>Points</th></tr>
          <tr><td>🌱 Easy</td><td>5</td></tr><tr><td>🔥 Moderate</td><td>10</td></tr><tr><td>💥 Challenging</td><td>15</td></tr>
          <tr><td>🪜 Ladder Challenge</td><td>15</td></tr><tr><td>🐍 Snake Rescue</td><td>15</td></tr><tr><td>🏆 Final Challenge</td><td>15</td></tr><tr><td>🎯 Head-to-head win</td><td>10</td></tr></table></div>
        <div><h3>⌨️ Teacher shortcuts</h3><div class="help-grid">
          <kbd>Space</kbd><span>Roll the die / continue</span><kbd>1–4</kbd><span>Same as A–D</span>
          <kbd>A B C D</kbd><span>Lock in the group’s answer</span><kbd>Enter</kbd><span>Continue after the answer</span>
          <kbd>S</kbd><span>Replace question</span><kbd>+</kbd><span>Add 15 s to the timer</span><kbd>P</kbd><span>Pause game</span>
          <kbd>V</kbd><span>Ask the Audience (during a question)</span><kbd>Q</kbd><span>Audience question (between turns)</span><kbd>W</kbd><span>Welcome / rules slideshow</span><kbd>U</kbd><span>Undo last move</span><kbd>T</kbd><span>Teacher panel</span><kbd>F</kbd><span>Full-screen</span><kbd>M</kbd><span>Sound on/off</span></div></div>
      </div>
      <h3>✨ Special squares</h3>
      <div class="legend">${Object.values(SPECIALS).map(s => `<div><span>${s.icon}</span><div><b>${s.name}</b><br><span class="muted">${s.desc}</span></div></div>`).join('')}</div>
      <p class="muted">Movement caused by a special square can trigger a snake or ladder, but never another special square — so effects cannot loop.</p>
      <div class="row end"><button class="btn big gold" data-close>${fromSetup ? '← Back' : 'Close'}</button></div>`);
    $('[data-close]', card).addEventListener('click', () => (fromSetup ? openSetup() : closeTool()));
  }

  /* ───────────────────────── Question bank editor ───────────────────────── */
  const bankView = { cat: 0, diff: '', text: '' };
  function openBank(fromSetup) {
    const usedSet = new Set(prefs.used);
    const card = openTool(`<h2>📚 Question Bank</h2>
      <div class="bank-stats">
        <span class="chip">Total: ${bank.length}</span>
        ${['E', 'M', 'C'].map(d => `<span class="chip ${d}">${DIFF[d].name}: ${bank.filter(q => q.d === d).length}</span>`).join('')}
        <span class="chip">Used this cycle: ${bank.filter(q => usedSet.has(q.id)).length}</span>
      </div>
      <div class="bank-tools">
        <select class="inp" data-b="cat"><option value="0">All topics</option>${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${bankView.cat === +k ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select>
        <select class="inp" data-b="diff"><option value="">All levels</option>${['E', 'M', 'C'].map(d => `<option value="${d}" ${bankView.diff === d ? 'selected' : ''}>${DIFF[d].name}</option>`).join('')}</select>
        <input class="inp" data-b="text" placeholder="🔍 Search questions…" value="${esc(bankView.text)}">
      </div>
      <div class="bank-tools">
        <button class="btn gold" data-bk="add">➕ Add question</button>
        <button class="btn" data-bk="import">⬆ Import (JSON / CSV)</button>
        <button class="btn" data-bk="export">⬇ Export JSON</button>
        <button class="btn" data-bk="template">⬇ CSV template</button>
        <button class="btn" data-bk="resetUsed">♻️ Reset “used”</button>
        <button class="btn red" data-bk="defaults">↺ Restore 100 defaults</button>
      </div>
      <div class="bank-list" id="bankList"></div>
      <div class="row end" style="margin-top:14px"><button class="btn big gold" data-bk="close">${fromSetup ? '← Back to setup' : 'Close'}</button></div>`, 'bank');

    const list = $('#bankList', card);
    const paint = () => {
      const t = bankView.text.toLowerCase();
      const items = bank.filter(q => (!bankView.cat || q.c === bankView.cat) && (!bankView.diff || q.d === bankView.diff) && (!t || (q.q + ' ' + (q.ans || '') + ' ' + (q.o || []).join(' ')).toLowerCase().includes(t)));
      list.innerHTML = items.length ? items.map(q => `<div class="bank-item ${usedSet.has(q.id) ? 'used' : ''}">
          <span class="chip cat" title="${esc((CATS[q.c] || {}).name)}">${(CATS[q.c] || {}).icon || '?'}</span><span class="chip ${q.d}">${q.d}</span>
          <div class="bi-q">${esc(q.q)}<small>${esc(TYPES[q.t] || q.t)} · ${esc(q.o && q.a != null ? q.o[q.a] : q.ans || '')}${usedSet.has(q.id) ? ' · used' : ''}</small></div>
          <div class="row" style="flex-wrap:nowrap"><button class="btn sm" data-edit="${esc(q.id)}" title="Edit">✏️</button><button class="btn sm" data-del="${esc(q.id)}" title="Delete">🗑</button></div></div>`).join('')
        : '<div class="muted" style="padding:20px;text-align:center">No questions match.</div>';
    };
    paint();
    $('[data-b="cat"]', card).addEventListener('change', e => { bankView.cat = +e.target.value; paint(); });
    $('[data-b="diff"]', card).addEventListener('change', e => { bankView.diff = e.target.value; paint(); });
    $('[data-b="text"]', card).addEventListener('input', e => { bankView.text = e.target.value; paint(); });
    list.addEventListener('click', async e => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) openEditor(bank.find(q => q.id === ed.dataset.edit), fromSetup);
      if (del) {
        const q = bank.find(x => x.id === del.dataset.del);
        if (q && await confirmBox(`Delete this question?\n“${q.q.slice(0, 120)}”`, 'Delete')) { bank = bank.filter(x => x !== q); saveBank(); openBank(fromSetup); toast('🗑 Question deleted'); }
      }
    });
    $$('[data-bk]', card).forEach(b => b.addEventListener('click', async () => {
      const a = b.dataset.bk;
      if (a === 'close') fromSetup ? openSetup() : closeTool();
      else if (a === 'add') openEditor(null, fromSetup);
      else if (a === 'export') download(`physics-question-bank-${stamp()}.json`, JSON.stringify(bank, null, 1));
      else if (a === 'template') download('question-bank-template.csv',
        'category,difficulty,type,question,optionA,optionB,optionC,optionD,answer,explanation\n' +
        '5,Easy,mcq,What is the unit of stress?,N,m,N/m² (Pa),no unit,C,σ = T ÷ A\n' +
        '8,Challenging,mcq,"An object weighs 10 N in air and 6 N in water. What is the buoyant force?",16 N,6 N,4 N,10 N,C,FB = 10 − 6 = 4 N\n', 'text/csv');
      else if (a === 'resetUsed') { prefs.used = []; savePrefs(); toast('♻️ All questions are available again'); openBank(fromSetup); }
      else if (a === 'defaults') {
        if (await confirmBox('Replace the whole bank with the 100 built-in questions? Your custom questions will be removed.', 'Restore defaults')) {
          bank = clone(window.DEFAULT_QUESTIONS); saveBank(); prefs.used = []; savePrefs(); openBank(fromSetup); toast('↺ Default questions restored');
        }
      } else if (a === 'import') pickFile('.json,.csv,application/json,text/csv', (txt, name) => importQuestions(txt, name, fromSetup));
    }));
  }

  function openEditor(q, fromSetup) {
    const isNew = !q;
    q = q ? clone(q) : { c: bankView.cat || 1, d: bankView.diff || 'M', t: 'mcq', q: '', o: ['', '', '', ''], a: 0, ans: '', x: '' };
    const opts = (q.o && q.o.length ? q.o : ['', '', '', '']).concat(['', '', '', '']).slice(0, 4);
    const card = openTool(`<h2>${isNew ? '➕ Add question' : '✏️ Edit question'}</h2>
      <div class="editor-grid">
        <label class="field">Topic<select class="inp" data-e="c">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${q.c === +k ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select></label>
        <label class="field">Difficulty<select class="inp" data-e="d">${['E', 'M', 'C'].map(d => `<option value="${d}" ${q.d === d ? 'selected' : ''}>${DIFF[d].name}</option>`).join('')}</select></label>
        <div class="field">Type<div style="color:var(--text);font-size:16px;padding:9px 0">Multiple choice (4 options)</div></div>
        <label class="field wide">Question<textarea data-e="q" rows="3">${esc(q.q)}</textarea></label>
        <div class="field wide">Options (tick the correct one)
          <div class="opts-grid">${opts.map((o, i) => `<label class="check" style="gap:8px"><input type="radio" name="corr" value="${i}" ${q.a === i ? 'checked' : ''}><b>${'ABCD'[i]}</b><input class="inp" style="flex:1" data-o="${i}" value="${esc(o)}"></label>`).join('')}</div></div>
        <label class="field wide">Explanation (shown after reveal, optional)<textarea data-e="x" rows="2">${esc(q.x || '')}</textarea></label>
      </div>
      <div class="row end" style="margin-top:14px"><button class="btn big" data-ed="cancel">Cancel</button><button class="btn big gold" data-ed="save">💾 Save question</button></div>`, 'bank');
    $('[data-ed="cancel"]', card).addEventListener('click', () => openBank(fromSetup));
    $('[data-ed="save"]', card).addEventListener('click', () => {
      const n = { id: isNew ? 'u' + Date.now().toString(36) + rand(1000) : q.id, c: +$('[data-e="c"]', card).value, d: $('[data-e="d"]', card).value, t: 'mcq', q: $('[data-e="q"]', card).value.trim(), x: $('[data-e="x"]', card).value.trim() };
      if (!n.q) { toast('⚠️ Please type the question.'); return; }
      const raw = [0, 1, 2, 3].map(i => $(`[data-o="${i}"]`, card).value.trim());
      const sel = $('input[name="corr"]:checked', card);
      if (raw.some(v => !v)) { toast('⚠️ Please fill in all four options.'); return; }
      if (!sel) { toast('⚠️ Tick the correct option.'); return; }
      n.o = raw; n.a = +sel.value;
      if (isNew) bank.push(n); else bank[bank.findIndex(x => x.id === q.id)] = n;
      saveBank(); toast(isNew ? '➕ Question added' : '💾 Question saved'); openBank(fromSetup);
    });
  }

  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim()));
  }

  function normQ(o, i) {
    const s = v => (v == null ? '' : String(v)).trim();
    let c = s(o.c != null ? o.c : o.category != null ? o.category : o.topic);
    if (!/^\d$/.test(c)) { const lc = c.toLowerCase(); const f = Object.entries(CATS).find(([, v]) => lc && v.name.toLowerCase().includes(lc.split(/[ &,]/)[0])); c = f ? f[0] : ''; }
    c = +c; if (!CATS[c]) return null;
    const dRaw = s(o.d != null ? o.d : o.difficulty != null ? o.difficulty : o.level).toLowerCase();
    const d = /^e/.test(dRaw) ? 'E' : /^(m|med)/.test(dRaw) ? 'M' : /^(c|h)/.test(dRaw) ? 'C' : null;
    if (!d) return null;
    const text = s(o.q != null ? o.q : o.question); if (!text) return null;
    let opts = Array.isArray(o.o) ? o.o : Array.isArray(o.options) ? o.options : [o.optionA, o.optionB, o.optionC, o.optionD];
    opts = opts.map(s).filter(Boolean);
    const ansRaw = s(o.ans != null ? o.ans : o.answer);
    const n = { id: 'u' + Date.now().toString(36) + '_' + i, c, d, t: 'mcq', q: text, x: s(o.x != null ? o.x : o.explanation) };
    if (opts.length < 3 || opts.every(x => /^(true|false)$/i.test(x))) return null; // multiple choice only
    let a = o.a != null ? +o.a : o.correct != null && /^\d+$/.test(String(o.correct)) ? +o.correct : -1;
    if (a < 0 && /^[A-Da-d]$/.test(ansRaw)) a = 'abcd'.indexOf(ansRaw.toLowerCase());
    if (a < 0) a = opts.findIndex(x => x.toLowerCase() === ansRaw.toLowerCase());
    if (!(a >= 0 && a < opts.length)) return null;
    n.o = opts; n.a = a;
    return n;
  }

  async function importQuestions(txt, name, fromSetup) {
    let raw = [];
    try {
      if (/\.json$/i.test(name) || /^\s*[[{]/.test(txt)) {
        const j = JSON.parse(txt); raw = Array.isArray(j) ? j : Array.isArray(j.questions) ? j.questions : [];
      } else {
        const rows = parseCSV(txt);
        if (rows.length && /categ|topic/i.test(rows[0][0] || '')) rows.shift();
        raw = rows.map(r => ({ category: r[0], difficulty: r[1], type: r[2], question: r[3], optionA: r[4], optionB: r[5], optionC: r[6], optionD: r[7], answer: r[8], explanation: r[9] }));
      }
    } catch (e) { toast('⚠️ Could not read that file.'); return; }
    const good = raw.map(normQ).filter(Boolean), bad = raw.length - good.length;
    if (!good.length) { toast('⚠️ No valid multiple-choice questions found. Check the CSV template.'); return; }
    const replace = await confirmBox(`Found ${good.length} valid question(s)${bad ? ` (${bad} skipped)` : ''}. Add them to the bank, or replace the whole bank?`, 'Replace bank', 'Add to bank');
    if (replace) { bank = good; prefs.used = []; savePrefs(); } else bank = bank.concat(good);
    saveBank(); toast(`⬆ Imported ${good.length} question(s)`); openBank(fromSetup);
  }

  /* ───────────────────────── Teacher drawer ───────────────────────── */
  function toggleDrawer(force) {
    const d = $('#drawer'), open = force != null ? force : !d.classList.contains('open');
    d.classList.toggle('open', open); d.setAttribute('aria-hidden', String(!open));
    if (open) renderDrawer();
  }
  function renderDrawer() {
    const body = $('#drawerBody'), active = document.activeElement;
    if (active && body.contains(active) && /INPUT|SELECT/.test(active.tagName)) return; // don't clobber typing
    const g = game, s = g ? g.settings : prefs.setup;
    body.innerHTML = `
      <section><h3>🎮 Game</h3><div class="grid3">
        <button class="btn ${g && g.paused ? 'gold' : ''}" data-d="pause">${g && g.paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button class="btn" data-d="restart">⟲ Restart</button>
        <button class="btn" data-d="setup">🆕 New / setup</button>
        <button class="btn" data-d="save">💾 Save</button>
        <button class="btn" data-d="export">⬇ Export save</button>
        <button class="btn" data-d="load">📂 Load save</button>
      </div></section>
      <section><h3>🎲 Current turn ${g ? `— <span style="color:${cur().color}">${esc(cur().name)}</span>` : ''}</h3><div class="grid3">
        <button class="btn gold" data-d="roll">🎲 Roll</button>
        <button class="btn" data-d="replace">↻ Replace Q</button>
        <button class="btn" data-d="skip">⏭ Skip turn</button>
        <button class="btn" data-d="undo">↶ Undo (${history.length})</button>
        <button class="btn" data-d="qtimer">⏯ Q-timer</button>
        <button class="btn" data-d="qmore">+15 s</button>
      </div>
      ${g ? `<div class="row" style="margin-top:8px"><span class="muted">Turn order:</span><select class="inp" data-d-set="turn">${g.teams.map(t => `<option value="${t.id}" ${g.turn === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>` : ''}
      </section>
      <section><h3>🏅 Scores &amp; positions</h3>
        ${g ? g.teams.map(t => `<div class="adj-row" style="--c:${t.color}"><div class="an">${t.icon} ${esc(t.name)}</div>
          <div class="grp"><button class="btn sm" data-adj="pts" data-t="${t.id}" data-v="-5">−5</button><span>${t.points}<br><small>pts</small></span><button class="btn sm" data-adj="pts" data-t="${t.id}" data-v="5">+5</button></div>
          <div class="grp"><button class="btn sm" data-adj="pos" data-t="${t.id}" data-v="-1">−1</button><span>${t.pos}<br><small>sq</small></span><button class="btn sm" data-adj="pos" data-t="${t.id}" data-v="1">+1</button></div></div>`).join('') + '<button class="btn" data-d="adjust" style="width:100%">✏️ Edit exact values, shields &amp; power-ups…</button>' : '<div class="muted">Start a match first.</div>'}
      </section>
      <section><h3>⏱ Timers</h3>
        <div class="row" style="margin-bottom:8px"><span>Competition clock: <b>${g && g.timeLimit ? fmtTime(g.timeLeft) : '∞ (no limit)'}</b></span></div>
        <div class="grid3"><button class="btn" data-d="clock-5">−5 min</button><button class="btn" data-d="clock+5">+5 min</button><button class="btn" data-d="clockOff">∞ No limit</button></div>
        <div class="row" style="margin-top:8px"><input class="inp" type="number" min="1" max="300" style="width:90px" data-d-set="clockMin" placeholder="min"><button class="btn" data-d="clockSet">Set clock</button><button class="btn red" data-d="endNow">🏁 End now</button></div>
        <div class="field" style="margin-top:10px">Question timers (seconds)
          <div class="grid3">${[['E', 'Easy'], ['M', 'Moderate'], ['C', 'Challenging'], ['LS', 'Ladder/Snake'], ['F', 'Final']].map(([k, l]) => `<label class="field">${l}<input class="inp" type="number" min="5" max="600" data-qt="${k}" value="${s.timers[k]}"></label>`).join('')}</div></div>
      </section>
      <section><h3>⚙️ Options</h3>
        <label class="check"><input type="checkbox" data-opt="sound" ${prefs.sound ? 'checked' : ''}> Sound effects</label><br>
        <label class="check"><input type="checkbox" data-opt="exact" ${s.exactFinish ? 'checked' : ''}> Exact roll needed to finish</label>
      </section>
      <section><h3>🧰 Tools</h3><div class="grid3">
        <button class="btn" data-d="audienceQ">🎤 Audience Q</button><button class="btn" data-d="welcome">📺 Welcome / rules</button>
        <button class="btn" data-d="bank">📚 Questions</button><button class="btn" data-d="help">❓ Rules / keys</button><button class="btn" data-d="fullscreen">⛶ Full-screen</button>
      </div></section>`;
  }

  $('#drawerBody').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    b.blur();
    if (b.dataset.adj) {
      if (!game) return;
      const t = game.teams[+b.dataset.t], v = +b.dataset.v;
      pushSnapshot();
      if (b.dataset.adj === 'pts') { t.points = Math.max(0, t.points + v); log(`✏️ Teacher adjusted ${t.name}'s points to ${t.points}`, t); }
      else { t.pos = clamp(t.pos + v, 1, game.size); log(`✏️ Teacher moved ${t.name} to square ${t.pos}`, t); }
      saveAuto(); render(); return;
    }
    const a = b.dataset.d, fk = flowKeys || {};
    const need = fn => fn ? fn() : toast('No question is open right now.');
    switch (a) {
      case 'pause': togglePause(); break;
      case 'restart': restart(); break;
      case 'setup': toggleDrawer(false); openSetup(); break;
      case 'save': manualSave(); break;
      case 'export': exportSave(); break;
      case 'load': pickFile('.json,application/json', txt => { try { loadSaveObj(JSON.parse(txt)); } catch (err) { toast('⚠️ Could not read that file.'); } }); break;
      case 'roll': if (game && game.phase === 'roll') { toggleDrawer(false); onRoll(); } else toast('Cannot roll right now.'); break;
      case 'replace': need(fk._replace); break;
      case 'skip': skipTurn(); break;
      case 'undo': undo(); break;
      case 'qtimer': toggleQTimer(); break;
      case 'qmore': addQTime(15); break;
      case 'adjust': openAdjust(); break;
      case 'clock-5': case 'clock+5':
        if (game) { if (!game.timeLimit) { game.timeLimit = game.timeLeft = 0; } game.timeLeft = Math.max(10, game.timeLeft + (a === 'clock+5' ? 300 : -300)); game.timeLimit = Math.max(game.timeLimit, game.timeLeft); renderClock(); renderDrawer(); saveAuto(); }
        break;
      case 'clockOff': if (game) { game.timeLimit = 0; game.timeLeft = 0; renderClock(); renderDrawer(); saveAuto(); toast('⏱ No time limit'); } break;
      case 'clockSet': {
        const m = +$('[data-d-set="clockMin"]').value;
        if (game && m > 0) { game.timeLimit = game.timeLeft = Math.round(m * 60); renderClock(); renderDrawer(); saveAuto(); toast(`⏱ Clock set to ${m} min`); }
        break;
      }
      case 'endNow': endNow(); break;
      case 'bank': openBank(false); break;
      case 'audienceQ': openAudienceQ(); break;
      case 'welcome': openWelcome(false); break;
      case 'help': openHelp(false); break;
      case 'fullscreen': toggleFullscreen(); break;
    }
  });
  $('#drawerBody').addEventListener('change', e => {
    const el = e.target, s = game ? game.settings : prefs.setup;
    if (el.dataset.qt) { s.timers[el.dataset.qt] = clamp(+el.value || 30, 5, 600); if (game) prefs.setup.timers[el.dataset.qt] = s.timers[el.dataset.qt]; savePrefs(); saveAuto(); toast('⏱ Timer updated'); }
    else if (el.dataset.opt === 'sound') toggleSound(el.checked);
    else if (el.dataset.opt === 'exact') { s.exactFinish = el.checked; saveAuto(); }
    else if (el.dataset.dSet === 'turn' && game) {
      if (game.phase !== 'roll') { toast('Finish the current turn first (or Skip turn).'); renderDrawer(); return; }
      pushSnapshot(); game.turn = +el.value; log(`✏️ Teacher passed the turn to ${cur().name}`, cur()); saveAuto(); render();
    }
  });

  function openAdjust() {
    if (!game) return;
    const card = openTool(`<h2>✏️ Adjust groups</h2>
      <p class="muted">Changes apply immediately and can be undone with ↶ Undo. Manual moves never trigger snakes, ladders or special squares.</p>
      <div style="overflow:auto"><table class="standings" style="width:100%;margin:0">
        <tr><th>Group</th><th>Name</th><th>Square</th><th>Points</th><th>🛡️ Shields</th><th>💎 Double</th><th>⚡ Extra turn</th><th>Next student</th><th>🙋 Lifelines</th><th>📣 Supporters</th></tr>
        ${game.teams.map(t => `<tr style="--c:${t.color}"><td style="font-size:26px">${t.icon}</td>
          <td><input class="inp" data-a="name" data-t="${t.id}" value="${esc(t.name)}" maxlength="32" style="width:150px"></td>
          <td><input class="inp" type="number" min="1" max="${game.size}" data-a="pos" data-t="${t.id}" value="${t.pos}" style="width:80px"></td>
          <td><input class="inp" type="number" min="0" data-a="points" data-t="${t.id}" value="${t.points}" style="width:90px"></td>
          <td><input class="inp" type="number" min="0" max="9" data-a="shields" data-t="${t.id}" value="${t.shields}" style="width:70px"></td>
          <td><input type="checkbox" data-a="double" data-t="${t.id}" ${t.double ? 'checked' : ''}></td>
          <td><input type="checkbox" data-a="extraTurn" data-t="${t.id}" ${t.extraTurn ? 'checked' : ''}></td>
          <td><select class="inp" data-a="memberIdx" data-t="${t.id}">${t.members.map((m, i) => `<option value="${i}" ${t.memberIdx % t.members.length === i ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></td>
          <td><input class="inp" type="number" min="0" max="3" data-a="lifelines" data-t="${t.id}" value="${t.lifelines || 0}" style="width:70px"></td>
          <td><input class="inp" data-a="section" data-t="${t.id}" value="${esc(t.section || '')}" maxlength="30" style="width:150px"></td></tr>`).join('')}
      </table></div>
      <div class="field" style="margin-top:12px">Students (one line per group, comma-separated)
        ${game.teams.map(t => `<input class="inp" data-a="members" data-t="${t.id}" value="${esc(t.members.join(', '))}" style="margin-top:4px">`).join('')}</div>
      <div class="row end" style="margin-top:14px"><button class="btn big" data-x="cancel">Cancel</button><button class="btn big gold" data-x="apply">✔ Apply</button></div>`, 'bank');
    $('[data-x="cancel"]', card).addEventListener('click', closeTool);
    $('[data-x="apply"]', card).addEventListener('click', () => {
      pushSnapshot();
      game.teams.forEach(t => {
        const v = k => $(`[data-a="${k}"][data-t="${t.id}"]`, card);
        t.name = v('name').value.trim().slice(0, 32) || t.name;
        t.pos = clamp(Math.round(+v('pos').value || 1), 1, game.size);
        t.points = Math.max(0, Math.round(+v('points').value || 0));
        t.shields = clamp(Math.round(+v('shields').value || 0), 0, 9);
        t.double = v('double').checked; t.extraTurn = v('extraTurn').checked;
        const mem = parseMembers(v('members').value);
        const idx = +v('memberIdx').value;
        t.members = mem; t.memberIdx = idx < mem.length ? idx : 0;
        t.lifelines = clamp(Math.round(+v('lifelines').value || 0), 0, 3); t.section = v('section').value.trim().slice(0, 30);
      });
      log('✏️ Teacher edited group details'); closeTool(); saveAuto(); render(); toast('✔ Changes applied');
    });
  }

  function restart() {
    if (!game) { openSetup(); return; }
    confirmBox('Restart the championship with the same groups and settings? All positions and points reset to zero.', 'Restart').then(ok => {
      if (!ok) return;
      const s = Object.assign({}, prefs.setup, {
        size: game.size, names: game.teams.map(t => t.name), sections: game.teams.map(t => t.section || ''), members: game.teams.map(t => t.members.join('\n')),
        minutes: Math.round(game.timeLimit / 60) || 0, timers: game.settings.timers,
        exactFinish: game.settings.exactFinish, cats: game.settings.cats
      });
      startGame(newGame(s), { title: 'NEW MATCH!' });
    });
  }
  function manualSave() { if (!game) { toast('No game to save'); return; } saveAuto(); toast('💾 Game saved on this computer — it can be resumed from the start screen'); }
  function toggleSound(v) { prefs.sound = v != null ? v : !prefs.sound; savePrefs(); SFX.unlock(); if (prefs.sound) SFX.click(); render(); toast(prefs.sound ? '🔊 Sound on' : '🔇 Sound off', 1200); }
  function toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement) (d.documentElement.requestFullscreen ? d.documentElement.requestFullscreen() : Promise.reject()).catch(() => toast('Full-screen not available — try F11'));
    else d.exitFullscreen();
  }

  /* ───────────────────────── Global actions & keys ───────────────────────── */
  const ACTIONS = {
    roll: onRoll, pause: togglePause, audience: openAudienceQ, welcome: () => openWelcome(false), undo, save: manualSave, sound: () => toggleSound(), fullscreen: toggleFullscreen,
    panel: () => toggleDrawer(), setup: () => { hidePodium(); openSetup(); },
    'podium-close': hidePodium, results: exportResults, rematch: () => { hidePodium(); restart(); }
  };
  document.addEventListener('click', e => {
    SFX.unlock();
    const b = e.target.closest('[data-act]');
    if (b && ACTIONS[b.dataset.act]) { if (e.detail) b.blur(); ACTIONS[b.dataset.act](); }
    else { const btn = e.target.closest('button'); if (btn && e.detail) btn.blur(); }
  });

  document.addEventListener('keydown', e => {
    SFX.unlock();
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') { if (e.key === 'Escape') e.target.blur(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key === ' ' ? ' ' : e.key.toLowerCase();
    if (dialogDone) { if (k === 'escape') dialogDone(false); else if (k === 'enter') { e.preventDefault(); dialogDone(true); } return; }
    if (welcomeOpen) {
      if (k === 'arrowright') goSlide(1); else if (k === 'arrowleft') goSlide(-1);
      else if (k === 'enter' || k === ' ' || k === 'escape') { e.preventDefault(); closeWelcome(); }
      return;
    }
    if (toolOpen() && toolKeys && toolKeys[k]) { e.preventDefault(); toolKeys[k](); return; }
    if (toolOpen()) { if (k === 'escape' && !(setupOpen && !game)) { closeTool(); setupOpen = false; } return; }
    if (k === 'escape') { toggleDrawer(false); hidePodium(); return; }
    if (k === 'p' && !(flowKeys && flowOpen() && QT.el && QT.el.isConnected)) { togglePause(); return; }
    if (game && game.paused) { if (k === ' ' || k === 'enter') { e.preventDefault(); togglePause(); } return; }
    if (flowKeys) {
      const fn = flowKeys[k === ' ' ? ' ' : k] || (k === 'enter' && flowKeys.enter);
      if (fn) { e.preventDefault(); fn(); return; }
    }
    switch (k) {
      case ' ': case 'enter': case 'r': if (!flowOpen()) { e.preventDefault(); onRoll(); } break;
      case 'u': undo(); break;
      case 'f': toggleFullscreen(); break;
      case 't': toggleDrawer(); break;
      case 'm': toggleSound(); break;
      case 'h': case '?': openHelp(false); break;
      case 'q': openAudienceQ(); break;
      case 'w': openWelcome(false); break;
    }
  });

  // Competition clock
  setInterval(() => {
    if (!game || game.phase === 'over' || game.paused || !game.timeLimit || setupOpen || welcomeOpen || audienceOpen) return;
    game.timeLeft = Math.max(0, game.timeLeft - 1);
    renderClock();
    if (game.timeLeft === 60) { toast('⏰ One minute left in the championship!'); SFX.tick(); }
    if (game.timeLeft % 15 === 0) saveAuto();
    if (game.timeLeft <= 0) timeUp();
  }, 1000);

  addEventListener('resize', () => { sizeBoard(); positionTokens(); });
  document.addEventListener('fullscreenchange', () => setTimeout(() => { sizeBoard(); positionTokens(); }, 120));
  addEventListener('beforeunload', saveAuto);

  /* ───────────────────────── Boot ───────────────────────── */
  buildDie();
  buildBoard();
  render();
  openSetup();

  // Small debugging hook (handy for teachers' IT staff; harmless otherwise)
  window.PSL = { get game() { return game; }, get answer() { return curQ && flowOpen() ? curQ.a : null; }, BOARDS, SPECIALS, bankSize: () => bank.length };
})();
