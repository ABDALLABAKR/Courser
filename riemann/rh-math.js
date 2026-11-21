'use strict';
/* =====================================================================
   Small typesetter for real mathematical notation (EB Garamond).
   An expression is an array of items:
     '1', '+', '=', '(' …         upright Garamond
     {i:'s'}                      italic Garamond (variables, ζ, ρ)
     {sup:[…]}, {sub:[…]}         attached to the preceding item
     {frac:[num…], den:[…]}       stacked fraction with rule
     {sq:[…]}                     square root with overbar
     {sans:'FOR EVERY'}           small Inter caps
   Any item may carry c (rgb) and a (alpha multiplier, used for reveals).
   ===================================================================== */
const MATHF = '"EB Garamond", Georgia, serif';
const OPS = new Set(['+', '−', '=', '<', '>', '·', '×', '→', '≈', ',']);
function mFont(g, it, size) {
  if (typeof it === 'string' || it.r !== undefined) g.font = `400 ${size * S}px ${MATHF}`;
  else if (it.i) g.font = `italic 400 ${size * S}px ${MATHF}`;
  else if (it.sans) g.font = `300 ${size * 0.5 * S}px ${SANS}`;
}
function mText(it) { return typeof it === 'string' ? it : it.r ?? it.i ?? it.sans; }
const isOp = it => OPS.has(typeof it === 'string' ? it : it.r);
function mMeasure(g, items, size) {
  items = items.map(it => typeof it === 'string' ? { r: it } : it);
  let w = 0;
  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    if (it.sup || it.sub) { w += mMeasure(g, it.sup || it.sub, size * 0.6) + size * 0.04 * S; continue; }
    if (it.frac) { w += Math.max(mMeasure(g, it.frac, size * 0.78), mMeasure(g, it.den, size * 0.78)) + size * 0.22 * S; continue; }
    if (it.sq) { w += mMeasure(g, it.sq, size) + size * 0.62 * S; continue; }
    mFont(g, it, size); if (it.sans) g.letterSpacing = `${(0.18 * size * 0.5 * S).toFixed(2)}px`;
    const s = mText(it); let ww = g.measureText(s).width; g.letterSpacing = '0px';
    if (isOp(it)) ww += size * (s === ',' ? 0.12 : 0.36) * S;
    if (it.i) ww += size * 0.05 * S;
    w += ww;
  }
  return w;
}
// draws with left edge at x, math axis at y (device px)
function mDraw(g, items, x, y, size, col, a) {
  items = items.map(it => typeof it === 'string' ? { r: it } : it);
  let cx = x;
  for (let k = 0; k < items.length; k++) {
    const it = items[k]; const al = a * (it.a ?? 1), c = it.c || col;
    if (it.sup || it.sub) {
      const sy = it.sup ? y - size * 0.42 * S : y + size * 0.3 * S;
      cx += size * 0.04 * S; cx = mDraw(g, it.sup || it.sub, cx, sy, size * 0.6, c, al); continue;
    }
    if (it.frac) {
      const fs = size * 0.78, wn = mMeasure(g, it.frac, fs), wd = mMeasure(g, it.den, fs), wf = Math.max(wn, wd);
      cx += size * 0.11 * S;
      if (al > 0.003) {
        mDraw(g, it.frac, cx + (wf - wn) / 2, y - size * 0.5 * S, fs, c, al);
        mDraw(g, it.den, cx + (wf - wd) / 2, y + size * 0.56 * S, fs, c, al);
        g.fillStyle = rgba(c, al); g.fillRect(cx - size * 0.04 * S, y - size * 0.035 * S, wf + size * 0.08 * S, Math.max(1, size * 0.045 * S));
      }
      cx += wf + size * 0.11 * S; continue;
    }
    if (it.sq) {
      const wi = mMeasure(g, it.sq, size);
      if (al > 0.003) {
        g.strokeStyle = rgba(c, al); g.lineWidth = Math.max(1, size * 0.045 * S); g.lineJoin = 'round'; g.beginPath();
        g.moveTo(cx + size * 0.05 * S, y + size * 0.02 * S); g.lineTo(cx + size * 0.16 * S, y - size * 0.04 * S); g.lineTo(cx + size * 0.3 * S, y + size * 0.34 * S);
        g.lineTo(cx + size * 0.5 * S, y - size * 0.62 * S); g.lineTo(cx + size * 0.56 * S + wi, y - size * 0.62 * S); g.stroke();
      }
      mDraw(g, it.sq, cx + size * 0.56 * S, y, size, c, al); cx += wi + size * 0.62 * S; continue;
    }
    mFont(g, it, size); const s = mText(it);
    if (it.sans) g.letterSpacing = `${(0.18 * size * 0.5 * S).toFixed(2)}px`;
    let pad = 0; if (isOp(it)) pad = size * (s === ',' ? 0.06 : 0.18) * S;
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = rgba(c, al);
    const yo = it.sans ? size * 0.18 * S : size * 0.3 * S;
    if (al > 0.003) g.fillText(s, cx + pad, y + yo);
    cx += g.measureText(s).width + 2 * pad + (it.i ? size * 0.05 * S : 0); g.letterSpacing = '0px';
  }
  return cx;
}
// queued, centred at logical (x, y); returns nothing. glow adds a soft halo.
function mathL(x, y, items, size, col, a, glow = 0, align = 'center') {
  if (a <= 0.003) return;
  TXT.push(() => { const g = ctx; const w = mMeasure(g, items, size); const x0 = align === 'center' ? x * S - w / 2 : align === 'right' ? x * S - w : x * S;
    if (glow) { g.shadowColor = rgba(col, 0.75 * a); g.shadowBlur = glow * S; }
    mDraw(g, items, x0, y * S, size, col, a); g.shadowColor = 'rgba(0,0,0,0.65)'; g.shadowBlur = 18 * S; });
}
const mW = (items, size) => mMeasure(ctx, items, size) / S;
// common expressions
const ZS = [{ i: 'ζ' }, '(', { i: 's' }, ')'];
const HALF = { frac: ['1'], den: ['2'] };
const GP = s => ({ r: s, c: COL.hgold });
