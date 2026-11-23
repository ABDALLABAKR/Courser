import { useCallback, useEffect, useState } from 'react';
import { API_BASE } from '../lib/api';
import { Button, Segmented, inputCls } from '../components/ui';

type Status = 'pending' | 'approved' | 'rejected';
interface Word { id: number; word: string; meaning: string; difficulty: 'easy' | 'medium' | 'hard'; category: string; status: Status; source: string; notes: string; times_played: number; times_guessed: number }
interface Cat { id: string; name_ckb: string; name_en: string; word_count: number }
interface Report { id: number; room_code: string; reporter_name: string; reported_name: string; reason: string; context: string; status: string; created_at: number }

async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${API_BASE}/api/admin${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'x-requested-with': 'wene-admin', ...(init.body && typeof init.body === 'string' && !init.headers ? { 'content-type': 'application/json' } : {}), ...init.headers },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((data as { error?: string }).error ?? r.statusText), { status: r.status });
  return data as T;
}

const STATUS_STYLE: Record<Status, string> = { pending: 'bg-sun/30', approved: 'bg-leaf/20 text-leaf', rejected: 'bg-coral/20 text-coral' };

function Login({ onDone, configured }: { onDone: () => void; configured: boolean }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  return (
    <form className="card mx-auto mt-20 max-w-sm space-y-4 p-6" onSubmit={async (e) => {
      e.preventDefault();
      try { await api('/login', { method: 'POST', body: JSON.stringify({ password: pw }) }); onDone(); }
      catch (x) { setErr((x as Error).message); }
    }}>
      <h1 className="text-2xl font-black">Admin · وێنە بکێشە</h1>
      {!configured && <p className="rounded-xl bg-coral/15 p-3 text-sm font-bold text-coral">Admin login is disabled: set ADMIN_PASSWORD_HASH on the server (run <code>npm run hash-password</code>).</p>}
      <input type="password" className={inputCls} autoComplete="current-password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p className="text-sm font-bold text-coral">{err === 'bad_password' ? 'Wrong password' : err}</p>}
      <Button className="w-full" type="submit" disabled={!configured}>Sign in</Button>
    </form>
  );
}

function Stats() {
  const [s, setS] = useState<Record<string, any> | null>(null);
  useEffect(() => { api<Record<string, any>>('/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <p>Loading…</p>;
  const tiles: [string, number | string][] = [
    ['Live players', s.live.players], ['Live rooms', s.live.rooms], ['Rooms in game', s.live.roomsInGame],
    ['Games (total)', s.gamesTotal], ['Games completed', s.gamesCompleted], ['Games (24h)', s.games24h], ['Avg players/game', s.avgPlayers],
    ['Turns played', s.turnsPlayed], ['Turns guessed', s.turnsGuessed],
    ['Words approved', s.wordsApproved], ['Words pending', s.wordsPending], ['Words rejected', s.wordsRejected], ['Open reports', s.reportsOpen],
  ];
  return (
    <div className="space-y-4">
      {s.allowUnreviewedWords && <p className="rounded-xl bg-sun/30 p-3 text-sm font-bold">ALLOW_UNREVIEWED_WORDS is ON: pending (unverified) words can appear in games. Turn it off for production.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([k, v]) => <div key={k} className="card p-4"><div className="text-muted text-xs font-bold">{k}</div><div className="text-2xl font-black">{v}</div></div>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[['Most played words', s.topWords], ['Hardest words (lowest guess rate, ≥3 plays)', s.hardestWords]].map(([title, rows]) => (
          <div key={title as string} className="card p-4">
            <h3 className="mb-2 font-extrabold">{title as string}</h3>
            <table className="w-full text-sm"><tbody>
              {(rows as any[]).map((w) => <tr key={w.word} className="border-t border-line"><td className="py-1 font-bold" dir="rtl">{w.word}</td><td className="text-muted">{w.meaning}</td><td className="text-end">{w.times_guessed}/{w.times_played}</td></tr>)}
              {!(rows as any[]).length && <tr><td className="text-muted">No data yet</td></tr>}
            </tbody></table>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordForm({ cats, initial, onSave, onCancel }: { cats: Cat[]; initial?: Partial<Word>; onSave: (w: Partial<Word>) => Promise<void>; onCancel?: () => void }) {
  const [w, setW] = useState<Partial<Word>>({ difficulty: 'medium', category: cats[0]?.id, status: 'pending', word: '', meaning: '', ...initial });
  const [err, setErr] = useState('');
  return (
    <form className="grid gap-2 sm:grid-cols-6" onSubmit={async (e) => {
      e.preventDefault();
      try { await onSave(w); setErr(''); if (!initial) setW({ ...w, word: '', meaning: '' }); } catch (x) { setErr((x as Error).message); }
    }}>
      <input className={`${inputCls} sm:col-span-2`} dir="rtl" placeholder="وشە (Kurdish word)" required value={w.word} onChange={(e) => setW({ ...w, word: e.target.value })} />
      <input className={`${inputCls} sm:col-span-2`} placeholder="English meaning" value={w.meaning} onChange={(e) => setW({ ...w, meaning: e.target.value })} />
      <select className={inputCls} value={w.difficulty} onChange={(e) => setW({ ...w, difficulty: e.target.value as Word['difficulty'] })}>
        <option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option>
      </select>
      <select className={inputCls} value={w.category} onChange={(e) => setW({ ...w, category: e.target.value })}>
        {cats.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
      </select>
      <select className={`${inputCls} sm:col-span-2`} value={w.status} onChange={(e) => setW({ ...w, status: e.target.value as Status })}>
        <option value="pending">pending review</option><option value="approved">approved (verified)</option><option value="rejected">rejected</option>
      </select>
      <input className={`${inputCls} sm:col-span-2`} placeholder="Notes (e.g. reviewer)" value={w.notes ?? ''} onChange={(e) => setW({ ...w, notes: e.target.value })} />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" className="flex-1">{initial ? 'Save' : 'Add word'}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
      {err && <p className="text-sm font-bold text-coral sm:col-span-6">{err === 'duplicate' ? 'That word already exists' : err}</p>}
    </form>
  );
}

function Words({ cats }: { cats: Cat[] }) {
  const [status, setStatus] = useState<'' | Status>('pending');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState<{ total: number; rows: Word[] }>({ total: 0, rows: [] });
  const [editing, setEditing] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const load = useCallback(() => {
    const p = new URLSearchParams({ status, category, q, limit: '300' });
    api<{ total: number; rows: Word[] }>(`/words?${p}`).then(setData).catch(() => {});
  }, [status, category, q]);
  useEffect(load, [load]);

  const setStatusFor = async (ids: number[], s: Status) => { await api('/words/bulk-status', { method: 'POST', body: JSON.stringify({ ids, status: s }) }); setSelected(new Set()); load(); };
  return (
    <div className="space-y-4">
      <div className="card p-4"><h3 className="mb-2 font-extrabold">Add a word</h3>
        <WordForm cats={cats} onSave={async (w) => { await api('/words', { method: 'POST', body: JSON.stringify(w) }); load(); }} />
      </div>
      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[280px]"><Segmented value={status} onChange={setStatus} options={[{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: '', label: 'All' }]} /></div>
          <select className={`${inputCls} !w-auto`} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
          </select>
          <input className={`${inputCls} !w-auto flex-1`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="text-muted text-sm font-bold">{data.total} words</span>
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-teal/10 p-2">
            <span className="font-bold">{selected.size} selected:</span>
            <Button size="sm" variant="leaf" onClick={() => setStatusFor([...selected], 'approved')}>Approve</Button>
            <Button size="sm" variant="coral" onClick={() => setStatusFor([...selected], 'rejected')}>Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatusFor([...selected], 'pending')}>Mark pending</Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-muted text-start">
              <th className="p-1"><input type="checkbox" aria-label="select all" checked={selected.size > 0 && selected.size === data.rows.length} onChange={(e) => setSelected(e.target.checked ? new Set(data.rows.map((w) => w.id)) : new Set())} /></th>
              <th className="p-1 text-start">Word</th><th className="p-1 text-start">Meaning</th><th className="p-1">Diff.</th><th className="p-1">Category</th><th className="p-1">Status</th><th className="p-1">Source</th><th className="p-1">Guessed/played</th><th className="p-1" />
            </tr></thead>
            <tbody>
              {data.rows.map((w) => editing === w.id ? (
                <tr key={w.id}><td colSpan={9} className="p-2"><WordForm cats={cats} initial={w} onCancel={() => setEditing(null)}
                  onSave={async (x) => { await api(`/words/${w.id}`, { method: 'PATCH', body: JSON.stringify({ word: x.word, meaning: x.meaning, difficulty: x.difficulty, category: x.category, status: x.status, notes: x.notes }) }); setEditing(null); load(); }} /></td></tr>
              ) : (
                <tr key={w.id} className="border-t border-line">
                  <td className="p-1"><input type="checkbox" aria-label={`select ${w.word}`} checked={selected.has(w.id)} onChange={(e) => { const s = new Set(selected); if (e.target.checked) s.add(w.id); else s.delete(w.id); setSelected(s); }} /></td>
                  <td className="p-1 text-lg font-bold" dir="rtl">{w.word}</td>
                  <td className="p-1">{w.meaning}</td>
                  <td className="p-1 text-center">{w.difficulty}</td>
                  <td className="p-1 text-center">{w.category}</td>
                  <td className="p-1 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[w.status]}`}>{w.status}</span></td>
                  <td className="text-muted p-1 text-center text-xs">{w.source}</td>
                  <td className="p-1 text-center">{w.times_guessed}/{w.times_played}</td>
                  <td className="p-1">
                    <div className="flex justify-end gap-1">
                      {w.status !== 'approved' && <button className="rounded-lg bg-leaf/20 px-2 py-1 text-xs font-bold text-leaf" onClick={() => setStatusFor([w.id], 'approved')}>Approve</button>}
                      {w.status !== 'rejected' && <button className="rounded-lg bg-coral/20 px-2 py-1 text-xs font-bold text-coral" onClick={() => setStatusFor([w.id], 'rejected')}>Reject</button>}
                      <button className="surface-2 rounded-lg px-2 py-1 text-xs font-bold" onClick={() => setEditing(w.id)}>Edit</button>
                      <button className="rounded-lg px-2 py-1 text-xs font-bold text-coral" onClick={async () => { if (confirm(`Delete “${w.word}”?`)) { await api(`/words/${w.id}`, { method: 'DELETE' }); load(); } }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Import({ cats }: { cats: Cat[] }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string>('');
  return (
    <div className="card space-y-3 p-4">
      <h3 className="font-extrabold">Import CSV</h3>
      <p className="text-muted text-sm">Columns: <code>word,meaning,difficulty,category[,status]</code>. Header row optional. Difficulty: easy/medium/hard. Category ids: {cats.map((c) => c.id).join(', ')}. Imported words default to <b>pending</b> unless status says otherwise.</p>
      <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); }} />
      <textarea className={`${inputCls} min-h-40 py-2 font-mono text-sm`} value={text} onChange={(e) => setText(e.target.value)} placeholder={'word,meaning,difficulty,category\nسێو,apple,easy,food'} />
      <div className="flex gap-2">
        <Button onClick={async () => {
          try {
            const r = await api<{ added: number; errorCount: number; errors: { line: number; error: string }[] }>('/words/import', { method: 'POST', body: text, headers: { 'content-type': 'text/csv' } });
            setResult(`Added ${r.added}. ${r.errorCount} rows skipped${r.errors.length ? ': ' + r.errors.slice(0, 10).map((e) => `line ${e.line} (${e.error})`).join(', ') : ''}`);
          } catch (x) { setResult((x as Error).message); }
        }}>Import</Button>
        <a className="btn3d surface-2 inline-flex min-h-12 items-center px-5 font-bold" href={`${API_BASE}/api/admin/words/export`}>Export all as CSV</a>
      </div>
      {result && <p className="font-bold">{result}</p>}
    </div>
  );
}

function Categories({ cats, reload }: { cats: Cat[]; reload: () => void }) {
  const [c, setC] = useState({ id: '', name_ckb: '', name_en: '' });
  const [err, setErr] = useState('');
  return (
    <div className="card space-y-3 p-4">
      <h3 className="font-extrabold">Categories</h3>
      <table className="w-full text-sm"><tbody>
        {cats.map((x) => (
          <tr key={x.id} className="border-t border-line">
            <td className="p-1 font-mono">{x.id}</td><td className="p-1 font-bold" dir="rtl">{x.name_ckb}</td><td className="p-1">{x.name_en}</td><td className="p-1">{x.word_count} words</td>
            <td className="p-1 text-end"><button className="text-xs font-bold text-coral" onClick={async () => { try { await api(`/categories/${x.id}`, { method: 'DELETE' }); reload(); } catch (e) { setErr((e as Error).message === 'in_use' ? 'Category still has words' : (e as Error).message); } }}>Delete</button></td>
          </tr>
        ))}
      </tbody></table>
      <form className="grid gap-2 sm:grid-cols-4" onSubmit={async (e) => { e.preventDefault(); try { await api(`/categories/${c.id}`, { method: 'PUT', body: JSON.stringify({ name_ckb: c.name_ckb, name_en: c.name_en }) }); setC({ id: '', name_ckb: '', name_en: '' }); reload(); } catch (x) { setErr((x as Error).message); } }}>
        <input className={inputCls} placeholder="id (e.g. music)" pattern="[a-z0-9-]{2,32}" required value={c.id} onChange={(e) => setC({ ...c, id: e.target.value })} />
        <input className={inputCls} dir="rtl" placeholder="ناوی کوردی" required value={c.name_ckb} onChange={(e) => setC({ ...c, name_ckb: e.target.value })} />
        <input className={inputCls} placeholder="English name" required value={c.name_en} onChange={(e) => setC({ ...c, name_en: e.target.value })} />
        <Button type="submit">Add / update</Button>
      </form>
      {err && <p className="text-sm font-bold text-coral">{err}</p>}
    </div>
  );
}

function Moderation() {
  const [status, setStatus] = useState('open');
  const [reports, setReports] = useState<Report[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [term, setTerm] = useState('');
  const load = useCallback(() => {
    api<Report[]>(`/reports?status=${status}`).then(setReports).catch(() => {});
    api<string[]>('/blocked-terms').then(setTerms).catch(() => {});
  }, [status]);
  useEffect(load, [load]);
  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="card space-y-3 p-4">
        <div className="flex items-center justify-between gap-2"><h3 className="font-extrabold">Player reports</h3>
          <div className="w-72"><Segmented value={status} onChange={setStatus} options={[{ value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]} /></div>
        </div>
        {reports.length === 0 && <p className="text-muted">No reports.</p>}
        {reports.map((r) => (
          <div key={r.id} className="surface-2 space-y-1 rounded-2xl p-3 text-sm">
            <div><b>{r.reporter_name}</b> reported <b>{r.reported_name}</b> in room <code>{r.room_code}</code> · {new Date(r.created_at).toLocaleString()}</div>
            {r.reason && <div>Reason: <bdi>{r.reason}</bdi></div>}
            <div className="text-muted">Recent messages: {(JSON.parse(r.context) as string[]).map((m, i) => <bdi key={i} className="me-2 rounded bg-black/5 px-1">{m}</bdi>)}</div>
            {r.status === 'open' && <div className="flex gap-2 pt-1">
              <Button size="sm" variant="leaf" onClick={async () => { await api(`/reports/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) }); load(); }}>Resolve</Button>
              <Button size="sm" variant="ghost" onClick={async () => { await api(`/reports/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'dismissed' }) }); load(); }}>Dismiss</Button>
            </div>}
          </div>
        ))}
      </div>
      <div className="card space-y-3 p-4">
        <h3 className="font-extrabold">Blocked terms</h3>
        <p className="text-muted text-sm">Names containing these are refused; chat messages containing them are masked. A small English list is built in; add Kurdish terms here.</p>
        <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!term.trim()) return; await api('/blocked-terms', { method: 'POST', body: JSON.stringify({ term }) }); setTerm(''); load(); }}>
          <input className={inputCls} dir="auto" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="term" />
          <Button type="submit">Add</Button>
        </form>
        <div className="flex flex-wrap gap-1">{terms.map((x) => <span key={x} className="surface-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm"><bdi>{x}</bdi><button aria-label="remove" className="text-coral" onClick={async () => { await api(`/blocked-terms/${encodeURIComponent(x)}`, { method: 'DELETE' }); load(); }}>×</button></span>)}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState<{ authenticated: boolean; configured: boolean } | null>(null);
  const [tab, setTab] = useState<'stats' | 'words' | 'import' | 'categories' | 'moderation'>('words');
  const [cats, setCats] = useState<Cat[]>([]);
  const check = () => api<{ authenticated: boolean; configured: boolean }>('/me').then(setAuth).catch(() => setAuth({ authenticated: false, configured: false }));
  const loadCats = () => api<Cat[]>('/categories').then(setCats).catch(() => {});
  useEffect(() => { document.documentElement.dir = 'ltr'; void check(); }, []);
  useEffect(() => { if (auth?.authenticated) void loadCats(); }, [auth?.authenticated]);
  if (!auth) return null;
  if (!auth.authenticated) return <Login configured={auth.configured} onDone={check} />;
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4" dir="ltr">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">وێنە بکێشە · Admin</h1>
        <div className="flex gap-2">
          <a href="/" className="surface-2 inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-bold">Game</a>
          <Button size="sm" variant="ghost" onClick={async () => { await api('/logout', { method: 'POST' }); void check(); }}>Sign out</Button>
        </div>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'stats', label: 'Statistics' }, { value: 'words', label: 'Words' }, { value: 'import', label: 'Import / Export' }, { value: 'categories', label: 'Categories' }, { value: 'moderation', label: 'Moderation' }]} />
      {tab === 'stats' && <Stats />}
      {tab === 'words' && <Words cats={cats} />}
      {tab === 'import' && <Import cats={cats} />}
      {tab === 'categories' && <Categories cats={cats} reload={loadCats} />}
      {tab === 'moderation' && <Moderation />}
    </div>
  );
}
