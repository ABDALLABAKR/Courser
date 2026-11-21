#version 300 es
// "The Invisible Universe" — procedural cell-biology film shader.
// One fragment shader renders every shot; the timeline (scene weights,
// local times, zoom) is driven from film.js through uniforms.
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uT;      // global time (s)
uniform float uZ;      // log-zoom for the skin/tissue/body shot
uniform float uW[7];   // scene weights
uniform float uL[7];   // scene local times

#define PI  3.14159265
#define TAU 6.28318531

const vec3 TURQ  = vec3(0.10, 0.82, 0.78);
const vec3 EMER  = vec3(0.12, 0.74, 0.40);
const vec3 EBLUE = vec3(0.12, 0.40, 1.00);
const vec3 AMBER = vec3(1.00, 0.60, 0.16);
const vec3 VIOL  = vec3(0.46, 0.22, 0.92);
const vec3 LDIR  = vec3(-0.48, 0.62, 0.62);

float PX; // size of one pixel in frame units (frame height == 1)

// ------------------------------------------------------------ utilities
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2  h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float sq(float x){ return x * x; }
float h11(float x){ return h12(vec2(x, 17.31)); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float a = .5, s = 0.; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = m * p + 3.1; a *= .5; }
  return s;
}
float fbm3o(vec2 p){
  float a = .5, s = 0.; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++){ s += a * vnoise(p); p = m * p + 3.1; a *= .5; }
  return s;
}
float ridged(vec2 p){
  float a = .5, s = 0.; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ float n = 1. - abs(vnoise(p) * 2. - 1.); s += a * n * n; p = m * p + 1.7; a *= .5; }
  return s;
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float segD(vec2 p, vec2 a, vec2 b, out float h){ vec2 pa = p - a, ba = b - a; h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
float segD(vec2 p, vec2 a, vec2 b){ float h; return segD(p, a, b, h); }
float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
void over(inout vec3 col, vec3 c, float a){ col = mix(col, c, clamp(a, 0., 1.)); }
vec3 sph(vec2 dv){ dv /= max(1., length(dv)); return vec3(dv, sqrt(max(0., 1. - dot(dv, dv)))); }
float spow(float x, float e){ return exp2(e * log2(max(x, 1e-6))); }
float cover(float d, float w){ return 1. - smoothstep(-w, w, d); }

vec3 shade(vec3 n, vec3 base, vec3 rimC, float specK){
  vec3 L = normalize(LDIR);
  float wrap = max(dot(n, L) * .5 + .5, 0.);
  float fr = spow(1. - clamp(n.z, 0., 1.), 2.6);
  float sp = spow(max(dot(n, normalize(L + vec3(0, 0, 1))), 0.), 56.) * specK;
  return base * (.18 + .95 * wrap * wrap) + rimC * fr * .85 + vec3(1., .96, .88) * sp;
}

// Voronoi (iq) — F1, edge distance, cell id. Optionally skips one site.
struct Vor { float f1; float edge; vec2 id; vec2 r; };
Vor voronoi(vec2 x, float t, bool skipHero){
  vec2 n = floor(x), f = fract(x), mg = vec2(0), mr = vec2(0); float md = 8.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec2 g = vec2(i, j); vec2 c = n + g;
    if (skipHero && c == vec2(0)) continue;
    vec2 o = h22(c); o = .5 + .38 * sin(t + TAU * o);
    vec2 r = g + o - f; float d = dot(r, r);
    if (d < md){ md = d; mr = r; mg = g; }
  }
  float ed = 8.;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++){
    vec2 g = mg + vec2(i, j); vec2 c = n + g;
    if (skipHero && c == vec2(0)) continue;
    vec2 o = h22(c); o = .5 + .38 * sin(t + TAU * o);
    vec2 r = g + o - f;
    if (dot(mr - r, mr - r) > 1e-5) ed = min(ed, dot(.5 * (mr + r), normalize(r - mr)));
  }
  return Vor(sqrt(md), ed, n + mg, mr);
}
float vorF1(vec2 x){
  vec2 n = floor(x), f = fract(x); float md = 8.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec2 g = vec2(i, j); vec2 r = g + h22(n + g) * .8 + .1 - f; md = min(md, dot(r, r));
  }
  return sqrt(md);
}

// ------------------------------------------------------------ mitochondrion (shared)
// q: local coords, a/b axis, r radius. Returns rgb + alpha. cut: 0 intact, 1 sectioned.
vec4 mito(vec2 q, vec2 a, vec2 b, float r, float blur, float seed, float t){
  float h; float dl = segD(q, a, b, h); float d = dl - r;
  if (d > blur + .02) return vec4(0);
  vec2 ax = normalize(b - a); float len = length(b - a);
  float s = h * len; float w = dot(q - a, vec2(-ax.y, ax.x));
  vec3 n = sph((q - (a + (b - a) * h)) / r);
  float al = cover(d, blur + PX);
  // cristae seen through the translucent outer membrane
  float warp = .25 * sin(w / r * 3. + seed * 6.) + .2 * vnoise(q / r * 2. + seed);
  float cr = abs(fract(s / r * 2.6 + warp + seed) - .5);
  float crist = smoothstep(.16 + blur * 8., .04, cr) * smoothstep(1., .55, abs(w / r));
  vec3 mat = mix(AMBER * .55, AMBER * 1.05, vnoise(q / r * 6. + seed));
  vec3 base = mix(mat, TURQ * .45 + EBLUE * .1, crist * .8);
  vec3 c = shade(n, base, TURQ * 1.1, .7);
  c += TURQ * .5 * smoothstep(.012 * r / .1 + blur, 0., abs(d + .03 * r)) ;
  return vec4(c, al * (.55 + .45 * spow(1. - n.z, 1.5)));
}

// ------------------------------------------------------------ a whole cell (hero / finale)
// c: coords in units of cell half-height; a: aspect; px: pixel size in c units
vec4 drawCell(vec2 c, float a, float t, float px, float seed){
  float ang = atan(c.y, c.x);
  vec2 e = c / vec2(a, 1.);
  float le = length(e);
  float g = length(vec2(e.x / a, e.y)) / max(le, 1e-4);
  float wob = .016 * sin(ang * 3. + t * .6 + seed) + .010 * sin(ang * 7. - t * .8) + .012 * (vnoise(vec2(ang * 2.5 + seed, t * .25)) - .5);
  float d = (le - 1.) / g + wob;
  if (d > .06) return vec4(0);
  float aa = px * 1.5;
  float inside = cover(d, aa);
  vec3 n = normalize(vec3(e.x * .9, e.y * .9, sqrt(max(.04, 1. - le * le))));

  // cytoplasm with streaming
  vec2 wq = c + .06 * vec2(fbm3o(c * 2.5 + t * .05), fbm3o(c * 2.5 - t * .04 + 4.));
  float gran = fbm(wq * 7. + seed);
  vec3 col = mix(vec3(.010, .070, .090), vec3(.020, .060, .150), gran);
  col += EMER * .06 * smoothstep(.55, .8, fbm3o(wq * 3.));
  // cytoskeleton
  float cs = abs(vnoise(wq * 16. + 2.) - .5);
  col += vec3(.25, .55, .85) * .22 * smoothstep(.03 + px * 8., 0., cs) * smoothstep(-.02, -.12, d);
  // ribosome speckle
  vec2 gc = wq / .018; vec2 gi = floor(gc); vec2 go = h22(gi + seed);
  float sp = length(fract(gc) - .2 - go * .6);
  col += vec3(.55, .9, .9) * .35 * step(.55, h12(gi * 1.7)) * smoothstep(.18 + px * 60., .05, sp);

  // nucleus geometry
  vec2 nc = vec2(-.04 * a, .14) + .01 * vec2(sin(t * .4), cos(t * .33));
  vec2 nq = (c - nc) / vec2(.95, 1.);
  float nang = atan(nq.y, nq.x);
  float dn = length(nq) - .31 - .012 * sin(nang * 4. + t * .3) - .008 * vnoise(vec2(nang * 3., t * .2));

  // rough ER — stacked sheets hugging the nucleus
  float er = dn * 30. + 1.6 * fbm3o(c * 3.5 + t * .03 + seed);
  float erl = smoothstep(.09 + px * 30., .0, abs(fract(er) - .5) - .34);
  float erm = smoothstep(.34, .12, dn) * smoothstep(.015, .05, dn) * smoothstep(.25, .55, vnoise(vec2(nang * 2.2, 3.) + seed));
  col = mix(col, EMER * .75 + TURQ * .15, erl * erm * .75);
  col += vec3(.6, 1., .8) * .2 * erl * erm * step(.7, h12(floor(c * 90.)));

  // Golgi apparatus — curved cisternae stack
  vec2 gp = nc + vec2(.10 * a, -.12);
  vec2 gq = c - gp; float gr = length(gq); float ga = atan(gq.y, gq.x) + PI * .5;
  for (int k = 0; k < 5; k++){
    float rk = .23 + float(k) * .022;
    float span = .55 - float(k) * .05;
    float dk = abs(gr - rk) - .006;
    float am = smoothstep(span, span - .12, abs(ga + .2));
    float edgeBulb = smoothstep(span - .14, span, abs(ga + .2));
    col = mix(col, mix(AMBER * .9, AMBER * 1.2 + vec3(.1), float(k) / 5.), cover(dk - edgeBulb * .004, aa + .002) * am * .85);
  }

  // mitochondria in the annulus between nucleus and membrane
  for (int i = 0; i < 9; i++){
    float fi = float(i);
    float th = fi / 9. * TAU + h11(fi + seed) * .5 + t * .018;
    vec2 pc = nc * .25 + vec2(cos(th) * a * .74, sin(th) * .74);
    float o = th + PI * .5 + (h11(fi * 3.1 + seed) - .5) * 1.2;
    vec2 ax = vec2(cos(o), sin(o)) * (.06 + .04 * h11(fi * 7.3));
    vec4 m = mito(c, pc - ax, pc + ax, .033, px, fi + seed, t);
    over(col, m.rgb, m.a * .95);
  }

  // transport vesicles budding from the Golgi
  for (int i = 0; i < 12; i++){
    float fi = float(i);
    float ph = fract(t * .07 + h11(fi * 5.7 + seed));
    float th = -PI * .5 + (h11(fi * 2.3) - .5) * 2.4;
    vec2 dir = vec2(cos(th) * a, sin(th));
    vec2 vp = mix(gp + vec2(0, -.25), dir * .92, ph);
    float vr = .018 + .012 * h11(fi * 9.1);
    float vd = length(c - vp) - vr;
    vec3 vn = sph((c - vp) / vr);
    float va = cover(vd, aa) * smoothstep(0., .08, ph) * smoothstep(1., .9, ph);
    over(col, shade(vn, EBLUE * .35 + VIOL * .2, TURQ, .6), va * (.35 + .65 * sq(1. - vn.z)));
  }

  // nucleus
  float nin = cover(dn, aa);
  if (nin > 0.){
    vec2 cq = nq * 3.2 + vec2(t * .03, 0);
    float chrom = ridged(cq + seed);
    float hetero = smoothstep(-.07, 0., dn) * smoothstep(.45, .7, fbm3o(nq * 9. + seed));
    vec3 nb = mix(vec3(.04, .03, .12), VIOL * .55 + EBLUE * .15, chrom);
    nb = mix(nb, TURQ * .35, smoothstep(.75, 1., chrom) * .5);
    nb = mix(nb, vec3(.02, .01, .06), hetero * .6);
    // nucleolus
    vec2 nl = nq - vec2(.07, .05);
    float dnl = length(nl) - .085 - .01 * vnoise(nl * 30.);
    float nlg = fbm(nl * 60.);
    nb = mix(nb, mix(VIOL * .22, AMBER * .32 + VIOL * .1, nlg), cover(dnl, aa + .02) * .8);
    vec3 nn = sph(nq / .33);
    nb = shade(nn, nb, VIOL * .6, .25);
    col = mix(col, nb, nin);
  }
  // nuclear envelope with pores
  float pores = smoothstep(.55, .75, abs(fract(nang * 22. / TAU * 2.) - .5) * 2.);
  float env = exp(-sq(dn / (.005 + aa))) + .7 * exp(-sq((dn + .014) / (.004 + aa)));
  col += (TURQ * .8 + EBLUE * .25) * env * (1. - pores * .85);

  // plasma membrane — lipid bilayer + embedded proteins
  float fres = spow(clamp(le, 0., 1.), 6.);
  float mem = exp(-sq(d / (.005 + aa))) + .8 * exp(-sq((d + .014) / (.004 + aa)));
  vec3 memC = mix(TURQ, EBLUE, .35 + .3 * sin(ang * 2. + t * .2));
  col = mix(col * (.55 + .55 * dot(n, normalize(LDIR))), col, .4);
  col += memC * mem * (.55 + .9 * fres);
  float pk = floor(ang * 70. / TAU); float pf = fract(ang * 70. / TAU);
  float prot = step(.55, h11(pk + seed)) * exp(-sq((pf - .5) / .18)) * exp(-sq((d - .007) / (.006 + aa)));
  col += mix(EMER, AMBER, h11(pk * 3.)) * prot * .7;
  // inner volume gradient / subsurface
  col += TURQ * .06 * smoothstep(-.25, 0., d) * inside;

  float alpha = clamp(inside * .96 + mem * .6 + prot, 0., 1.);
  return vec4(col, alpha);
}

// ------------------------------------------------------------ human figure (sdf)
float tcap(vec2 q, vec2 a, vec2 b, float r1, float r2){ float h; float d = segD(q, a, b, h); return d - mix(r1, r2, h); }
float ell(vec2 q, vec2 c, vec2 r){ return (length((q - c) / r) - 1.) * min(r.x, r.y); }
float sdBody(vec2 q){
  vec2 s = vec2(abs(q.x), q.y);
  float d = ell(q, vec2(0, .374), vec2(.044, .056));
  d = smin(d, tcap(q, vec2(0, .335), vec2(0, .292), .016, .019), .012);
  d = smin(d, tcap(s, vec2(.0, .272), vec2(.068, .25), .024, .021), .022);
  d = smin(d, ell(q, vec2(0, .195), vec2(.064, .08)), .028);
  d = smin(d, ell(q, vec2(0, .09), vec2(.047, .07)), .03);
  d = smin(d, ell(q, vec2(0, .018), vec2(.062, .05)), .03);
  d = smin(d, tcap(s, vec2(.08, .245), vec2(.098, .11), .017, .0135), .012);
  d = smin(d, tcap(s, vec2(.098, .11), vec2(.112, -.03), .013, .009), .008);
  d = smin(d, ell(s, vec2(.115, -.058), vec2(.011, .026)), .008);
  d = smin(d, tcap(s, vec2(.034, .0), vec2(.042, -.2), .03, .019), .02);
  d = smin(d, tcap(s, vec2(.042, -.2), vec2(.046, -.4), .018, .010), .01);
  d = smin(d, ell(s, vec2(.051, -.425), vec2(.017, .011)), .01);
  return d;
}

// ------------------------------------------------------------ SCENE 0: skin → tissue → hero cell (and pull-back → body)
vec3 skin(vec2 q, float pxs, float focus, out float hgt){
  // domain-warped so the microrelief network curves like real dermatoglyphics
  vec2 wq = q + .55 * vec2(fbm3o(q * .35), fbm3o(q * .35 + 7.3)) - .27;
  Vor v1 = voronoi(wq * .95, 0., false);
  Vor v2 = voronoi(wq * 2.3 + 7., 0., false);
  float fur = smoothstep(0., .30, v1.edge); fur = fur * fur * (3. - 2. * fur);
  float fur2 = smoothstep(0., .22, v2.edge);
  float pore = vorF1(q * .5 + 3.);
  float hasPore = step(.4, h12(floor(q * .5 + 3.)));
  float por = hasPore * smoothstep(.10, .03, pore);
  float plateau = smoothstep(0., .5, v1.edge);
  hgt = .50 * fur + .07 * fur2 * focus + .12 * fbm(q * 3.) + .05 * fbm(q * 14.) * focus - .35 * por;
  float gx = dFdx(hgt), gy = dFdy(hgt);
  vec3 n = normalize(vec3(-gx, -gy, pxs * 15.));
  float tone = fbm(q * .25);
  vec3 alb = mix(vec3(.60, .36, .30), vec3(.74, .50, .42), tone);
  alb = mix(alb, vec3(.66, .30, .28), smoothstep(.55, .8, fbm(q * .12 + 4.)) * .35); // capillary flush
  alb = mix(alb * vec3(.82, .66, .64), alb, fur);                                     // furrows hold shadow & blood
  alb *= .92 + .16 * vnoise(q * 9.);
  alb = mix(alb, vec3(.22, .10, .08), por * .8);
  vec3 L = normalize(vec3(-.80, .50, .33));
  float ndl = dot(n, L);
  float dif = max(ndl, 0.);
  float sss = max(ndl * .5 + .5, 0.);
  vec3 c = alb * (vec3(1., .80, .58) * dif * 1.25 + vec3(.85, .28, .22) * sss * sss * .22 + vec3(.03, .05, .07));
  vec3 L2 = normalize(vec3(.85, -.25, .3));
  c += TURQ * .09 * spow(max(dot(n, L2), 0.), 2.5) * (.4 + .6 * fur);
  float spec = spow(max(dot(n, normalize(L + vec3(0, 0, 1))), 0.), 28.);
  c += vec3(1., .92, .82) * spec * .22 * (.5 + .5 * fbm(q * 2.)) * focus;
  return c;
}

vec3 tissueLayer(vec2 v, float pxv, float t, float dim, float blur, bool skipHero){
  Vor vr = voronoi(v, t * .15, skipHero);
  float id = h12(vr.id);
  float w = .022 + blur;
  float mem = exp(-sq(vr.edge / w)) + .6 * exp(-sq((vr.edge - .035) / (w * .8)));
  float h = smoothstep(0., .45, vr.edge);
  vec3 cyto = mix(vec3(.01, .07, .09), vec3(.02, .07, .17), id);
  cyto = mix(cyto, EMER * .18, smoothstep(.6, .9, h12(vr.id + 3.)) );
  cyto *= .55 + .7 * fbm(v * 6. + id * 10.) ;
  cyto *= .5 + .7 * h;
  vec2 nr = vr.r / vec2(.95, 1.25);
  float dn = length(nr + vec2(.03, -.05)) - .21 - .02 * sin(atan(nr.y, nr.x) * 3. + id * 6.);
  float nuc = cover(dn, max(pxv, blur));
  vec3 nucC = mix(vec3(.05, .03, .14), VIOL * .5 + EBLUE * .1, ridged(v * 7. + id * 9.));
  nucC += TURQ * .5 * exp(-sq(dn / (.01 + blur)));
  vec3 c = mix(cyto, nucC, nuc * .9);
  // dome lighting
  vec2 gdir = normalize(-vr.r + 1e-5);
  c *= .8 + .35 * dot(-gdir, normalize(LDIR.xy)) * (1. - h);
  c += mix(TURQ, EBLUE, id) * mem * .75;
  return c * dim;
}

vec3 scene0(vec2 p, float t, float Z){
  vec3 col = vec3(.004, .006, .016);
  float ez = exp(-Z);
  // ---- body (only when pulled far back)
  float bodyW = 1. - smoothstep(-2.8, -1.4, Z);
  float skinMask = 1.;
  if (bodyW > 0.){
    float KB = .0115;
    vec2 Pb = vec2(.025, .175);
    vec2 qb = p * KB * ez + Pb;
    float pxb = PX * KB * ez;
    float db = sdBody(qb);
    vec2 e = vec2(pxb * 2., 0);
    vec2 gr = vec2(sdBody(qb + e.xy) - sdBody(qb - e.xy), sdBody(qb + e.yx) - sdBody(qb - e.yx)) / (2. * e.x);
    float inb = cover(db, pxb * 1.2);
    float depth = clamp(-db / .03, 0., 1.);
    vec2 gn = normalize(gr + 1e-6);
    vec3 n = normalize(vec3(gn * (1. - depth), sqrt(depth) + .05));
    // translucent living body: dark core, subsurface warmth near the surface, cool rim
    float edge = exp(-max(-db, 0.) / .0055);
    vec3 bc = vec3(.014, .012, .032) + vec3(.07, .03, .03) * (.3 + .7 * max(dot(n, normalize(vec3(-.7, .5, .5))), 0.));
    bc += AMBER * .55 * edge * smoothstep(.4, -.8, gn.x) * (.6 + .4 * gn.y);
    bc += TURQ * .85 * edge * edge * smoothstep(-.3, .8, gn.x);
    bc += VIOL * .25 * edge * (1. - abs(gn.x));
    // "trillions of cells" — a faint living texture across the body
    float cf = vorF1(qb * 900.);
    float tw = .6 + .4 * sin(t * 2. + h12(floor(qb * 900.)) * 30.);
    bc += mix(TURQ, VIOL, vnoise(qb * 40.)) * .13 * smoothstep(.22, .04, cf) * tw;
    bc += EBLUE * .05 * ridged(qb * 70.);
    // subtle atmosphere around the figure
    col += VIOL * .045 * exp(-max(db, 0.) * 22.) + EBLUE * .025 * exp(-length(qb) * 3.);
    col = mix(col, bc, inb * bodyW);
    skinMask = inb;
  }
  // ---- skin macro
  float skinW = 1. - smoothstep(1.55, 2.75, Z);
  if (skinW > 0. && Z > -3.4){ // uniform branch (dFdx inside)
    float hgt;
    vec2 qs = p * 8. * ez + vec2(3.1, 1.7);
    float focus = exp(-sq(p.y * 2.1)) * .85 + .15;
    vec3 sc = skin(qs, PX * 8. * ez * (1. + 2.5 * smoothstep(.6, 1.8, Z)), focus, hgt);
    // as we descend, the stratum corneum turns translucent and cool
    float deep = smoothstep(.9, 2.3, Z);
    sc = mix(sc, sc * vec3(.45, .75, .85), deep);
    col = mix(col, sc, skinW * skinMask * smoothstep(-2.6, -1.3, Z));
  }
  // ---- tissue
  float tisW = smoothstep(1.25, 2.45, Z);
  if (tisW > 0.){
    float ST = 627.;
    vec2 H = vec2(.31, .5);
    vec2 q = p * ST * ez + H;
    float pxq = PX * ST * ez;
    vec2 stretch = vec2(.62, 1.);
    // deep blurred layer
    vec2 qd = (p * ST * ez * 1.45) + H + vec2(7.3, 2.1);
    vec3 tc = tissueLayer(qd / stretch, pxq * 1.45, t + 3., .35, .06, false) * vec3(.7, .7, 1.2);
    // focal layer
    vec3 fc = tissueLayer(q / stretch, pxq / .62, t, 1., 0., true);
    float gapMask = 1.;
    vec4 hero = drawCell((q - H) / .48, .6, t, pxq / .48, 0.);
    float hd = length((q - H) / vec2(.29, .48));
    gapMask = smoothstep(1.0, 1.08, hd);
    vec3 tcol = mix(tc, fc, .88);
    tcol *= mix(.35, 1., gapMask);
    tcol = mix(tcol, hero.rgb, hero.a);
    // floating foreground particles (out of focus)
    vec2 fq = p * 6. + vec2(t * .05, -t * .03);
    float fd = length(fract(fq) - .5 - (h22(floor(fq)) - .5) * .5);
    tcol += vec3(.3, .6, .7) * .05 * step(.8, h12(floor(fq))) * smoothstep(.22, .0, fd);
    col = mix(col, tcol, tisW);
  }
  return col;
}

// ------------------------------------------------------------ SCENE 1: cytoplasm flight to the nucleus
vec3 scene1(vec2 p, float lt){
  float dist = 8. * exp(-lt * .76);
  float camZ = 8. - dist;
  vec2 pp = p + vec2(.015 * sin(lt * .7), .01 * cos(lt * .5));
  vec3 col = mix(vec3(.004, .02, .04), vec3(.02, .03, .09), fbm(pp * 2.5 + lt * .06));
  col += EMER * .025 * fbm(pp * 5. - lt * .1);
  // nucleus
  vec2 nc = vec2(0., .03);
  float Rp = .96 / dist;
  vec2 dv = (pp - nc) / Rp; float l = length(dv);
  float nucA = 0.;
  if (l < 1.05){
    vec3 n = sph(dv / 1.0);
    float aa = PX / Rp * 1.5;
    nucA = cover(l - 1., aa);
    vec2 iq = dv * (2.6 + 1.2 * (1. - n.z)) + vec2(lt * .05, 0.);
    float chrom = ridged(iq * 1.4 + 4.);
    vec3 inner = mix(vec3(.03, .02, .10), VIOL * .6 + EBLUE * .2, chrom);
    inner = mix(inner, TURQ * .4, smoothstep(.8, 1.05, chrom) * .6);
    float nlD = length(dv - vec2(.25, .18)) - .22;
    inner = mix(inner, mix(VIOL * .25, AMBER * .3, fbm(dv * 30.)), cover(nlD, .12) * .45);
    inner = shade(n, inner, VIOL * .5, .2);
    // envelope with nuclear pore complexes
    vec2 pq = dv / (.35 + n.z) * 19.;
    float pf = vorF1(pq);
    float ring = smoothstep(.03, .0, abs(pf - .1) - .02) * .35;
    float hole = smoothstep(.08, .03, pf);
    vec3 env = mix(TURQ * .35, EBLUE * .3, fbm(dv * 4.));
    env += TURQ * ring * .8; env *= 1. - hole * .6;
    float ea = .35 + .5 * sq(1. - n.z) + ring * .4;
    vec3 nb = mix(inner, env, clamp(ea, 0., 1.));
    nb += TURQ * spow(1. - n.z, 4.) * .9;
    nb += vec3(1., .95, .85) * spow(max(dot(n, normalize(normalize(LDIR) + vec3(0, 0, 1))), 0.), 60.) * .12 / max(1., Rp);
    col = mix(col, nb, nucA);
  }
  // recycled depth layers of cytoplasmic machinery
  const int L = 7;
  for (int k = L - 1; k >= 0; k--){
    float zr = float(k) + 1. - fract(camZ);
    float lid = floor(camZ) + float(k) + 1.;
    vec2 q = pp * zr / .96 + h22(vec2(lid, 3.)) * 7.;
    float pxl = PX * zr / .96;
    float blur = abs(zr - 1.6) * .028;
    float fog = exp(-zr * .26) * smoothstep(.15, .7, zr);
    if (zr > dist) fog *= 1. - nucA;
    vec2 id = floor(q); vec2 f = fract(q) - .5;
    vec2 rn = h22(id + lid * 13.1);
    float ty = h12(id + lid * 7.7);
    vec2 o = (rn - .5) * .35;
    vec3 c = vec3(0); float a = 0.;
    if (ty < .42){            // vesicle
      float r = .06 + .09 * rn.x;
      float d = length(f - o) - r;
      vec3 n = sph((f - o) / r);
      c = shade(n, mix(EBLUE, VIOL, rn.y) * .3, TURQ, .5);
      a = cover(d, blur + pxl) * (.3 + .7 * sq(1. - n.z));
    } else if (ty < .68){     // mitochondrion
      float an = rn.y * TAU; vec2 ax = vec2(cos(an), sin(an)) * (.12 + .1 * rn.x);
      vec4 m = mito(f, o - ax, o + ax, .065, blur, lid + rn.x, lt);
      c = m.rgb; a = m.a;
    } else if (ty < .86){     // ER sheet fragment
      vec2 g = f - o; float rr = .22 + .1 * rn.x;
      float dd = abs(length(g + vec2(0, rr)) - rr);
      float ang = abs(atan(g.x, g.y + rr));
      float band = 0.;
      for (int s = 0; s < 3; s++) band += exp(-sq((dd - float(s) * .035) / (.008 + blur)));
      c = EMER * .55 + TURQ * .1; a = band * smoothstep(1.1, .2, ang) * .38 * (.6 + .4 * vnoise(g * 9.));
    } else {                  // polysome spiral
      for (int s = 0; s < 8; s++){
        float fs = float(s);
        vec2 sp = o + .13 * vec2(cos(fs * .9 + lt), sin(fs * .9 + lt)) * (.4 + fs * .08);
        float d = length(f - sp) - .022;
        float aa2 = cover(d, blur + pxl);
        if (aa2 > a){ a = aa2 * .7; c = shade(sph((f - sp) / .022), EMER * .45, TURQ * .6, .3); }
      }
    }
    // a filament crossing the layer
    vec2 fd = normalize(h22(vec2(lid, 9.)) - .5);
    float fl = abs(dot(q - h22(vec2(lid, 5.)) * 4., vec2(-fd.y, fd.x)));
    float fil = exp(-sq(fl / (.012 + blur))) * .45;
    c = mix(c, vec3(.35, .6, .95) * .7, fil * (1. - a)); a = max(a, fil);
    over(col, c, a * fog);
  }
  return col;
}

// ------------------------------------------------------------ SCENE 2: chromatin & DNA
vec3 dnaBead(vec2 q, vec2 c, float r, vec3 base, float depthK, float pxq, inout vec3 col){
  float d = length(q - c) - r;
  vec3 n = sph((q - c) / r);
  vec3 s = shade(n, base, TURQ * .8, .9) * depthK;
  col = mix(col, s, cover(d, pxq * 1.2));
  return col;
}
vec3 scene2(vec2 p, float lt){
  vec3 col = mix(vec3(.012, .008, .04), vec3(.03, .03, .10), fbm(p * 2.2 + lt * .05));
  col += VIOL * .04 * ridged(p * 3. + vec2(lt * .04, 0));
  // background chromatin: beads-on-a-string fibres (nucleosomes)
  for (int i = 2; i >= 0; i--){
    float fi = float(i);
    float sc = 1.5 + fi * .8;
    vec2 q = rot(.4 + fi * .9) * p * sc + vec2(lt * .04 * (fi + 1.), fi * .7 - .2);
    float blur = .012 + .006 * fi;
    float k0 = floor(q.x / .1);
    for (int j = -1; j <= 1; j++){
      float x = (k0 + float(j)) * .1 + .05;
      float y = .18 * sin(x * 2.1 + fi * 2.) + .02 * sin(x * 13.);
      vec2 b = vec2(x, y + (h11(k0 + float(j) + fi * 50.) - .5) * .03);
      float r = .036;
      float d = length(q - b) - r;
      vec3 n = sph((q - b) / r);
      float dimF = .55 - fi * .12;
      vec3 c = shade(n, VIOL * .45 + EBLUE * .1, VIOL * .7, .3) * dimF;
      // DNA wrapped ~1.65 turns around the histone octamer
      vec2 wq = rot(.5) * (q - b) / r;
      float wrap = abs(fract(wq.y * 1.3 + wq.x * .25) - .5);
      c += TURQ * dimF * .9 * smoothstep(.12, .03, wrap) * step(length(wq), 1.);
      col = mix(col, c, cover(d, blur));
      // linker DNA
      float xn = x + .1; vec2 bn = vec2(xn, .18 * sin(xn * 2.1 + fi * 2.) + .02 * sin(xn * 13.));
      float ld = segD(q, b, bn) - .006;
      col = mix(col, TURQ * dimF * .8, cover(ld, blur) * step(r, length(q - b)) * .8);
    }
  }
  // foreground B-DNA double helix
  float zoom = 1. + lt * .09;
  vec2 q = p / zoom;
  float th = 1.08;
  vec2 dir = vec2(cos(th), sin(th)), nrm = vec2(-dir.y, dir.x);
  q -= vec2(.04, .1);
  float u = dot(q, dir) + lt * .045;
  float v = dot(q, nrm) + .045 * sin(u * 2.3 + .5);
  float pxq = PX / zoom;
  const float A = .078;
  const float PITCH = .265;
  float bp = PITCH / 10.5;
  float om = lt * .55;
  float DEL = 2.55; // minor/major groove offset
  float k0 = floor(u / bp + .5);
  vec2 uv = vec2(u, v);
  // pass 0: back beads & links, pass 1: base pairs, pass 2: front beads & links
  for (int pass = 0; pass < 3; pass++){
    for (int j = -3; j <= 3; j++){
      float k = k0 + float(j);
      float uk = k * bp;
      float ph = uk / PITCH * TAU + om;
      float ukn = uk + bp; float phn = ukn / PITCH * TAU + om;
      for (int s = 0; s < 2; s++){
        float o = s == 0 ? 0. : DEL;
        float vz = A * sin(ph + o), zz = A * cos(ph + o);
        float vzn = A * sin(phn + o), zzn = A * cos(phn + o);
        bool front = (zz + zzn) * .5 >= 0.;
        if (pass == 1) continue;
        if ((pass == 2) != front) continue;
        float dk = .55 + .45 * (zz / A * .5 + .5);
        vec3 base = s == 0 ? mix(TURQ, EBLUE, .25) : mix(EBLUE, VIOL, .35);
        // sugar backbone link
        float hh; float ld = segD(uv, vec2(uk, vz), vec2(ukn, vzn), hh) - .0085;
        vec2 cl = mix(vec2(uk, vz), vec2(ukn, vzn), hh);
        vec3 ln = sph(vec2((uv - cl).y, 0.) / .0085);
        col = mix(col, shade(ln, base * .55, TURQ * .5, .6) * dk, cover(ld, pxq * 1.2));
        // phosphate
        float r = .0165 * (1. + .12 * zz / A);
        col = dnaBead(uv, vec2(uk, vz), r, base * .8, dk, pxq, col);
      }
      if (pass == 1){
        float v1 = A * sin(ph), v2 = A * sin(ph + DEL);
        float z1 = A * cos(ph), z2 = A * cos(ph + DEL);
        float hh; float rd = segD(uv, vec2(uk, v1), vec2(uk, v2), hh);
        float face = .45 + .55 * abs(sin(ph + DEL * .5));
        float w = .0068 * (.7 + .3 * face);
        float pt = h11(k * 1.37);
        vec3 c1 = pt < .5 ? EMER : VIOL;
        vec3 c2 = pt < .5 ? AMBER : EBLUE;
        if (fract(pt * 7.) < .5){ vec3 tmp = c1; c1 = c2; c2 = tmp; }
        vec3 bc = mix(c1, c2, step(.5, hh));
        float zr = mix(z1, z2, hh);
        float dk = .45 + .55 * (zr / A * .5 + .5);
        vec3 bn = vec3(0, (uv.x - uk) / w, 0); bn.z = sqrt(max(0., 1. - bn.y * bn.y));
        vec3 sc = shade(normalize(bn + vec3(0, 0, .2)), bc * (.55 + .45 * face), bc * .5, .5) * dk;
        sc *= 1. - .5 * smoothstep(.03, 0., abs(hh - .5));
        col = mix(col, sc, cover(rd - w, pxq * 1.2));
      }
    }
  }
  // drifting nucleoplasm particles
  vec2 fq = p * 9. + vec2(lt * .08, lt * .02);
  float fd = length(fract(fq) - .5 - (h22(floor(fq)) - .5) * .6);
  col += vec3(.4, .5, .9) * .06 * step(.75, h12(floor(fq))) * smoothstep(.12, .0, fd);
  return col;
}

// ------------------------------------------------------------ SCENE 3: mitochondrial network
vec4 heroMito(vec2 q, float lt, float pxq){
  vec2 a = vec2(-.13, -.33), b = vec2(.13, .33);
  float r = .155;
  float h; float dl = segD(q, a, b, h); float d = dl - r;
  if (d > .03) return vec4(0);
  vec2 ax = normalize(b - a); float len = length(b - a);
  float s = h * len - .0; float w = dot(q - a, vec2(-ax.y, ax.x));
  vec3 n = sph((q - (a + (b - a) * h)) / r);
  float aa = pxq * 1.3;
  float ri = r - .022;
  // matrix
  float mf = fbm(q * 22. + lt * .05);
  vec3 col = mix(vec3(.30, .13, .03), AMBER * .8, mf);
  col = mix(col, vec3(.55, .32, .08), smoothstep(.55, .8, fbm(q * 7. - lt * .03)) * .5);
  col *= .55 + .5 * smoothstep(-ri, 0., -abs(w));
  col = mix(col, vec3(.15, .07, .02), smoothstep(.35, .0, vorF1(q * 70.)) * .35); // matrix granules
  // cristae — lamellar invaginations of the inner membrane
  float sp = .046;
  float warp = .012 * sin(w * 28. + 1.3) + .016 * (fbm3o(q * 9.) - .5);
  float ss = s + warp;
  float j0 = floor(ss / sp + .5);
  for (int jj = -1; jj <= 1; jj++){
    float j = j0 + float(jj);
    float side = h11(j * 3.7) < .5 ? -1. : 1.;
    float reach = .55 + .4 * h11(j * 5.3);
    vec2 cq = vec2(ss - j * sp, w * side);
    float tipW = ri - reach * 2. * ri;
    float thick = .0085;
    float dc = segD(cq, vec2(0, ri + .02), vec2(0, tipW)) - thick;
    float lumen = cover(dc + .0035, aa);
    float memb = exp(-sq((dc + .0018) / (.0016 + aa)));
    col = mix(col, vec3(.02, .09, .13), lumen * .9);
    col += TURQ * memb * 1.1;
    // ATP synthase rotary heads lining the crista
    if (cq.y < ri && cq.y > tipW + .004){
      float wk = (floor(cq.y / .0115) + .5) * .0115;
      for (int fside = 0; fside < 2; fside++){
        float sx = fside == 0 ? -1. : 1.;
        vec2 kc = vec2(sx * (thick + .0062), wk);
        vec2 kq = cq - kc;
        float kd = length(kq) - .0042;
        float st = segD(cq, vec2(sx * thick, wk), kc) - .0011;
        col = mix(col, AMBER * .8, cover(st, aa) * .8);
        float ka = atan(kq.y, kq.x * sx) + lt * 9. + j * 2.;
        float lobes = .75 + .25 * cos(3. * ka);
        vec3 kn = sph(kq / .0042);
        vec3 kcol = shade(kn, mix(AMBER, vec3(1., .82, .45), .3) * lobes, TURQ * .6, .9);
        col = mix(col, kcol, cover(kd, aa));
      }
    }
  }
  // ATP molecules streaming through the matrix
  vec2 pq = q * 38. + vec2(0., -lt * 1.2);
  float pd = length(fract(pq) - .5 - (h22(floor(pq)) - .5) * .7);
  col += vec3(1., .78, .4) * .5 * step(.82, h12(floor(pq))) * smoothstep(.06, .02, pd);
  // inner boundary + outer membrane (double membrane)
  float inner = exp(-sq((d + .016) / (.0022 + aa)));
  float outer = exp(-sq((d + .003) / (.003 + aa)));
  float ims = cover(d + .003, aa) * (1. - cover(d + .016, aa));
  col = mix(col, vec3(.01, .05, .08), ims * .85);
  col += TURQ * inner * .9 + mix(TURQ, EBLUE, .3) * outer * (1. + 1.2 * sq(1. - n.z));
  // volumetric roundness
  vec3 L = normalize(vec3(.55, .65, .5));
  col *= .62 + .5 * max(dot(n, L), 0.);
  col += AMBER * .12 * spow(1. - n.z, 3.);
  return vec4(col, cover(d, aa));
}
vec3 scene3(vec2 p, float lt){
  vec2 pp = p + vec2(.01 * sin(lt * .4), 0.);
  vec3 col = mix(vec3(.012, .016, .03), vec3(.05, .035, .02), fbm(pp * 2. + lt * .05));
  col += TURQ * .02 * fbm(pp * 4. - lt * .07);
  float sH = .36 * exp(lt * .27);
  float zH = 1. / sH;
  float camZ = lt * .85;
  vec2 T = vec2(.035, -.03);
  vec2 qh = rot(-.12 + lt * .02) * pp / sH + T * smoothstep(1.5, 6.2, lt);
  bool heroDrawn = false;
  const int L = 6;
  for (int k = L - 1; k >= -1; k--){
    if (k == -1 || (!heroDrawn && float(k) + 1. - fract(camZ) < zH)){
      if (!heroDrawn){
        heroDrawn = true;
        vec4 hm = heroMito(qh, lt, PX / sH);
        col = mix(col, hm.rgb, hm.a * smoothstep(0., .8, lt));
      }
      if (k == -1) break;
    }
    float zr = float(k) + 1. - fract(camZ);
    float lid = floor(camZ) + float(k) + 1.;
    vec2 q = pp * zr * 1.15 + h22(vec2(lid, 1.)) * 9.;
    float blur = abs(zr - 1.4) * .02;
    float fog = exp(-zr * .3) * smoothstep(.15, .6, zr);
    vec2 id = floor(q); vec2 f = fract(q) - .5;
    vec2 rn = h22(id + lid * 3.3);
    if (h12(id + lid) < .25) continue;
    float an = rn.y * TAU + lt * .05 * (rn.x - .5);
    vec2 axv = vec2(cos(an), sin(an)) * (.18 + .12 * rn.x);
    vec2 o = (rn - .5) * .08;
    vec4 m = mito(f, o - axv, o + axv, .085 + .02 * rn.y, blur, lid * 7. + rn.x * 3., lt);
    over(col, m.rgb, m.a * fog);
  }
  return col;
}

// ------------------------------------------------------------ SCENE 4: ribosome translating a protein
struct Blob { vec3 n; float h; };
void addSph(vec2 q, vec2 c, float r, inout vec3 nacc, inout float wacc, inout float hmax){
  vec2 d = q - c; float h2 = r * r - dot(d, d);
  if (h2 > 0.){ float h = sqrt(h2); float w = exp(h * 60.); nacc += w * vec3(d, h) / r; wacc += w; hmax = max(hmax, h); }
}
vec3 aminoCol(float i){
  float hsh = h11(i * 1.913);
  return hsh < .2 ? TURQ : hsh < .4 ? EMER : hsh < .6 ? AMBER : hsh < .8 ? VIOL : EBLUE;
}
vec3 chainPos(float i, float lt, float ne){
  vec2 E = vec2(.04, .19);
  float sd = (ne - 1. - i) * .0145;
  vec3 ext = vec3(E + vec2(.05 * sin(sd * 9. + 1.) + sd * .25, sd), .02 * sin(sd * 14.));
  // folded target: an alpha helix packed against a small beta/coil globule
  vec3 fol;
  vec2 C = vec2(.07, .37);
  if (i < 16.){
    float a = i * 1.745; // 100 deg per residue
    vec2 axd = normalize(vec2(.8, .55));
    float along = (i - 8.) * .0072;
    vec2 pc = C + vec2(-.03, -.035) + axd * along + vec2(-axd.y, axd.x) * cos(a) * .022;
    fol = vec3(pc, sin(a) * .022);
  } else {
    float m = i - 16.;
    float yy = 1. - (m + .5) / 20. * 2.;
    float rr = sqrt(1. - yy * yy);
    float ph = m * 2.39996;
    fol = vec3(C + vec2(.035 + cos(ph) * rr * .05, .025 + yy * .05), sin(ph) * rr * .05);
  }
  float te = lt - (i - 10.) / 11.;
  float fw = smoothstep(.4, 1.9, te);
  return mix(ext, fol, fw);
}
vec3 scene4(vec2 p, float lt){
  float zoom = 1. + lt * .05;
  vec2 q = p / zoom + vec2(-.006 * lt, .008 * lt);
  float pxq = PX / zoom;
  vec3 col = mix(vec3(.01, .015, .035), vec3(.025, .05, .06), fbm(p * 2. + lt * .04));
  col += VIOL * .03 * fbm(p * 4. - lt * .05);
  // background polysome — other ribosomes on a distant mRNA (defocused)
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    vec2 bq = p * 1.9 + vec2(-.5 + lt * .03, .55);
    vec2 bc = vec2(fi * .28 - .2, .12 * sin(fi * 1.3));
    float d1 = length(bq - bc - vec2(0, .03)) - .085;
    float d2 = length(bq - bc - vec2(.01, -.06)) - .06;
    float bl = .03;
    over(col, EMER * .18 + TURQ * .05, cover(d1, bl) * .7);
    over(col, EBLUE * .15 + VIOL * .05, cover(d2, bl) * .7);
  }
  // distant folded proteins drifting
  for (int i = 0; i < 4; i++){
    float fi = float(i);
    vec2 c = vec2(-.2 + .17 * fi, -.34 + .2 * sin(fi * 2.1)) + .02 * vec2(sin(lt + fi), cos(lt * .7 + fi));
    float d = length(p * 1.3 - c) - .04 - .006 * sin(atan(p.y * 1.3 - c.y, p.x * 1.3 - c.x) * 3. + fi);
    over(col, mix(VIOL, AMBER, h11(fi)) * .10, cover(d, .03) * .6);
  }

  // mRNA threading through the decoding groove
  float shift = (floor(lt * 2.2) + smoothstep(0., .35, fract(lt * 2.2))) * .0435;
  float my = -.074;
  float mx = q.x + shift;
  float k0 = floor(mx / .0145);
  vec3 rnaCol = col; float rnaA = 0.;
  for (int j = -1; j <= 1; j++){
    float k = k0 + float(j);
    float bx = k * .0145 + .007;
    vec2 bcen = vec2(bx - shift, my + .006 * sin(bx * 40.));
    float d = length(q - bcen) - .0085;
    float tN = h11(k * 2.1);
    vec3 nb = tN < .25 ? AMBER : tN < .5 ? EMER : tN < .75 ? EBLUE : VIOL;
    vec3 c = shade(sph((q - bcen) / .0085), nb * .6, TURQ * .4, .5);
    float a = cover(d, pxq * 1.2);
    rnaCol = mix(rnaCol, c, a); rnaA = max(rnaA, a);
  }
  float bb = abs(q.y - my - .006 * sin((q.x + shift) * 40.)) - .0035;
  // ribosome subunits (rRNA + proteins), sphere-cluster height fields
  vec3 nL = vec3(0); float wL = 0., hL = 0.;
  vec2 R0 = vec2(.0, .0);
  addSph(q, R0 + vec2(-.075, .06), .072, nL, wL, hL);
  addSph(q, R0 + vec2(.0, .10), .088, nL, wL, hL);
  addSph(q, R0 + vec2(.078, .05), .07, nL, wL, hL);
  addSph(q, R0 + vec2(-.03, .0), .072, nL, wL, hL);
  addSph(q, R0 + vec2(.05, -.005), .068, nL, wL, hL);
  addSph(q, R0 + vec2(.115, .125), .042, nL, wL, hL);
  addSph(q, R0 + vec2(-.12, .12), .046, nL, wL, hL);
  addSph(q, R0 + vec2(-.02, .175), .05, nL, wL, hL);
  addSph(q, R0 + vec2(.06, .17), .038, nL, wL, hL);
  vec3 nS = vec3(0); float wS = 0., hS = 0.;
  addSph(q, R0 + vec2(-.06, -.125), .056, nS, wS, hS);
  addSph(q, R0 + vec2(.02, -.14), .066, nS, wS, hS);
  addSph(q, R0 + vec2(.085, -.115), .045, nS, wS, hS);
  addSph(q, R0 + vec2(-.012, -.18), .05, nS, wS, hS);
  addSph(q, R0 + vec2(-.105, -.1), .03, nS, wS, hS);
  // background mRNA strand (behind small subunit, left/right of ribosome)
  col = mix(col, vec3(.2, .35, .4), cover(bb, pxq * 1.5) * .5);
  col = mix(col, rnaCol, rnaA * .9);
  vec2 bump = vec2(fbm3o(q * 70.) - .5, fbm3o(q * 70. + 5.) - .5) + .6 * vec2(vnoise(q * 240.) - .5, vnoise(q * 240. + 9.) - .5);
  if (wS > 0.){
    vec3 n = normalize(nS / wS + vec3(bump * .7, 0));
    float pat = fbm(q * 40.);
    vec3 base = mix(EBLUE * .32, VIOL * .34, smoothstep(.45, .75, pat));
    vec3 c = shade(n, base, TURQ * .35, .25);
    col = mix(col, c, smoothstep(0., pxq * 2., hS) * .97);
  }
  // mRNA in front of small subunit, partially enclosed
  col = mix(col, rnaCol, rnaA * smoothstep(.0, .02, hS + .001) * .55 * step(hL, .0));
  if (wL > 0.){
    vec3 n = normalize(nL / wL + vec3(bump * .7, 0));
    float pat = fbm(q * 34. + 3.);
    vec3 base = mix(EMER * .34, TURQ * .36, pat);
    base = mix(base, AMBER * .32, smoothstep(.64, .78, pat) * .55); // ribosomal proteins
    vec3 c = shade(n, base, TURQ * .45, .25);
    col = mix(col, c, smoothstep(0., pxq * 2., hL) * .97);
  }
  // nascent polypeptide — emerging from the exit tunnel and folding
  float ne = min(36., 11. + lt * 11.);
  vec3 envC = vec3(0); float denv = 1e3, fsum = 0.;
  vec3 cc = col; float best = -1.;
  for (int ii = 0; ii < 36; ii++){
    float i = float(ii);
    if (i > ne - 1.) break;
    vec3 P = chainPos(i, lt, ne);
    float te = lt - (i - 10.) / 11.;
    float fw = smoothstep(.4, 1.9, te);
    float emerg = smoothstep(ne - 1., ne - 2.5, i);
    float r = (.0095 + .003 * h11(i * 4.1)) * emerg;
    if (i < ne - 1.){
      vec3 P2 = chainPos(i + 1., lt, ne);
      float bd = segD(q, P.xy, P2.xy) - .0032;
      float dk = .65 + .35 * clamp((P.z + P2.z) * 10. + .5, 0., 1.);
      cc = mix(cc, vec3(.75, .85, .8) * .55 * dk, cover(bd, pxq * 1.2));
    }
    float d = length(q - P.xy) - r;
    vec3 n = sph((q - P.xy) / max(r, 1e-4));
    float dk = .6 + .4 * clamp(P.z * 12. + .5, 0., 1.);
    cc = mix(cc, shade(n, aminoCol(i) * .75, TURQ * .5, .8) * dk, cover(d, pxq * 1.2));
    denv = smin(denv, length(q - P.xy) - .026, .02 + 0. * fw);
    fsum += fw;
  }
  col = cc;
  // emerging molecular surface of the folded domain
  float fold = smoothstep(14., 30., fsum);
  float rimE = exp(-sq(denv / (.004 + pxq)));
  col += TURQ * rimE * .3 * fold;
  col = mix(col, col + EMER * .08, cover(denv, .004) * fold);
  return col;
}

// ------------------------------------------------------------ SCENE 5: kinesin carrying a vesicle on a microtubule
vec3 microtubule(vec2 q, vec2 P0, vec2 dir, float R, float pxq, float blur, float dim, vec3 col, out float cov){
  vec2 nrm = vec2(dir.y, -dir.x);
  float u = dot(q - P0, dir), v = dot(q - P0, nrm);
  cov = cover(abs(v) - R, pxq + blur);
  if (cov <= 0.) return col;
  float nv = clamp(v / R, -1., 1.);
  float nz = sqrt(1. - nv * nv);
  float thv = asin(nv);
  float cp = (thv / PI + .5) * 6.5;
  float pf = abs(fract(cp) - .5);
  float cu = (u + cp * .0047) / .016;
  float mono = mod(floor(cu), 2.);
  float gapU = abs(fract(cu) - .5);
  float bump = sin(fract(cp) * PI) * sin(fract(cu) * PI);
  vec3 base = mix(mix(TURQ, EMER, .35) * .55, mix(EMER, TURQ, .2) * .42, mono);
  base *= .65 + .5 * bump;
  base *= 1. - .6 * smoothstep(.43 - blur * 30., .5, pf) * (1. - blur * 15.);
  base *= 1. - .45 * smoothstep(.44 - blur * 30., .5, gapU) * (1. - blur * 15.);
  vec3 n = normalize(vec3(nrm * nv, nz));
  vec3 c = shade(n, base, TURQ * .8, .5) * dim;
  return mix(col, c, cov);
}
vec3 scene5(vec2 p, float lt){
  vec3 col = mix(vec3(.008, .012, .03), vec3(.03, .02, .07), fbm(p * 1.8 + lt * .05));
  col += EMER * .02 * fbm(p * 4. + lt * .03);
  float cov;
  // background microtubules & actin (defocused)
  col = microtubule(p * 2.3, vec2(.3, 0.), normalize(vec2(-.55, 1.)), .05, PX, .03, .16, col, cov);
  col = microtubule(p * 1.8, vec2(-.25, .2), normalize(vec2(1., .25)), .05, PX, .022, .22, col, cov);
  for (int i = 0; i < 2; i++){
    float fi = float(i);
    vec2 aq = p * 1.25 + vec2(.1 - fi * .2, -fi * .3);
    vec2 ad = normalize(vec2(.9, .45 - fi * .9));
    float u = dot(aq, ad), v = dot(aq, vec2(-ad.y, ad.x));
    float k0 = floor(u / .012);
    for (int j = -1; j <= 1; j++){
      float k = k0 + float(j);
      float ph = k * 2.9;
      vec2 c = vec2(k * .012 + .006, .006 * sin(ph));
      float d = length(vec2(u, v) - c) - .0065;
      over(col, mix(VIOL, EBLUE, .3) * (.35 + .25 * cos(ph)), cover(d, .004) * .7);
    }
  }
  // far dynein + vesicle travelling the other way (defocused)
  {
    vec2 fq = p * 2.2 + vec2(-.25, .2) ;
    vec2 vc = vec2(.18, .55 - lt * .09);
    float d = length(fq - vc) - .11;
    over(col, VIOL * .25 + EBLUE * .06, cover(d, .035) * .6);
  }
  // camera tracks the motor
  float steps = lt * 2.4;
  float sk = floor(steps), sf = fract(steps);
  float s = smoothstep(0., .45, sf);
  float bp = .032;
  float uc = (sk + s) * bp - .02;
  float zoom = .92 - .08 * smoothstep(2.2, 3.4, lt);
  vec2 dir = normalize(vec2(.36, 1.));
  vec2 nrm = vec2(dir.y, -dir.x);
  vec2 P0 = vec2(-.1, -.15);
  float camU = lt * .077 + .06;
  vec2 q = p / zoom + P0 + dir * camU + nrm * .12;
  q -= dir * .0;
  float pxq = PX / zoom;
  float R = .05;
  col = microtubule(q, P0, dir, R, pxq, 0., 1., col, cov);
  float u = dot(q - P0, dir), v = dot(q - P0, nrm);
  vec2 uv = vec2(u, v);
  // kinesin heads — hand-over-hand
  bool aLead = mod(sk, 2.) < .5;
  float rest0 = sk * bp - .02;
  float trailFrom = rest0 - bp * .5, trailTo = rest0 + bp * 1.5;
  vec2 hLead = vec2(rest0 + bp * .5, R * .62);
  vec2 hTrail = vec2(mix(trailFrom, trailTo, s), R * .62 + .03 * sin(s * PI));
  vec2 hA = aLead ? hLead : hTrail;
  vec2 hB = aLead ? hTrail : hLead;
  vec2 neck = vec2(uc + .01, R + .035);
  // cargo vesicle
  float Rv = .135;
  vec2 vc = vec2(uc - .045 + .008 * sin(lt * 1.3), R + .055 + .1 + Rv + .008 * sin(lt * 1.9));
  vec2 att = vc + normalize(neck - vc) * Rv;
  // coiled-coil stalk
  float sh; float sd = segD(uv, neck, att, sh);
  vec2 sdir = normalize(att - neck); vec2 sn = vec2(-sdir.y, sdir.x);
  float along = dot(uv - neck, sdir);
  for (int c2 = 0; c2 < 2; c2++){
    float off = (c2 == 0 ? 1. : -1.) * .0032 * sin(along * 260.);
    float dd = abs(dot(uv - neck, sn) - off) - .0024;
    dd = max(dd, max(-along, along - length(att - neck)));
    float dk = .65 + .35 * (c2 == 0 ? cos(along * 260.) : -cos(along * 260.));
    over(col, mix(EMER, TURQ, .4) * .8 * dk, cover(dd, pxq * 1.2));
  }
  // light chains near the cargo
  vec2 lc = mix(neck, att, .86) + sn * .012;
  over(col, shade(sph((uv - lc) / .013), AMBER * .6, TURQ * .4, .5), cover(length(uv - lc) - .013, pxq));
  // neck linkers + heads
  for (int hh = 0; hh < 2; hh++){
    vec2 hc = hh == 0 ? hA : hB;
    float nd = segD(uv, hc, neck) - .0028;
    over(col, EMER * .75, cover(nd, pxq * 1.2));
    vec2 hq = (uv - hc) / vec2(.026, .019);
    float d = (length(hq) - 1.) * .019 - .002 * (vnoise(hq * 4. + float(hh)) - .5);
    vec3 n = sph(hq * .95);
    vec3 base = hh == 0 ? mix(EMER, TURQ, .3) : mix(EMER, AMBER, .25);
    over(col, shade(n, base * .8, TURQ * .5, .7), cover(d, pxq * 1.2));
  }
  // vesicle — lipid bilayer sphere with cargo
  float vd = length(uv - vc) - Rv;
  vec3 vn = sph((uv - vc) / Rv);
  float vin = cover(vd, pxq * 1.2);
  if (vin > 0.){
    vec3 inner = mix(EBLUE * .10, VIOL * .16, fbm((uv - vc) * 18. + lt * .1));
    vec2 cq = (uv - vc) * 70. + vec2(lt * .4, lt * .2);
    float cd = length(fract(cq) - .5 - (h22(floor(cq)) - .5) * .5);
    inner += mix(AMBER, EMER, h12(floor(cq))) * .35 * step(.6, h12(floor(cq) + 3.)) * smoothstep(.16, .08, cd);
    inner *= .7 + .4 * vn.z;
    col = mix(col, col * .45 + inner, vin);
    float bil = exp(-sq(vd / (.0024 + pxq))) + exp(-sq((vd + .0075) / (.0024 + pxq)));
    col += mix(TURQ, EBLUE, .3) * bil * (.55 + .9 * sq(1. - vn.z));
    col += vec3(.04, .1, .14) * cover(vd + .0075, pxq) * (1. - cover(vd + .0, pxq)) * 0.;
    // reflection of the light source on the membrane
    vec2 hl = (uv - vc) / Rv - vec2(-.42, .5);
    col += vec3(.9, .95, 1.) * .18 * smoothstep(.16, .0, length(hl * vec2(1., 2.2))) ;
  }
  float va = atan((uv - vc).y, (uv - vc).x);
  float pk = floor(va * 46. / TAU);
  float mp = step(.6, h11(pk)) * exp(-sq((fract(va * 46. / TAU) - .5) / .2)) * exp(-sq((vd - .004) / (.005 + pxq)));
  col += mix(EMER, AMBER, h11(pk * 2.)) * mp * .6;
  // foreground bokeh
  vec2 fq = p * 3. + vec2(-lt * .06, -lt * .12);
  float fd = length(fract(fq) - .5 - (h22(floor(fq)) - .5) * .5);
  col = mix(col, vec3(.05, .09, .12), step(.82, h12(floor(fq))) * smoothstep(.2, .14, fd) * .35);
  return col;
}

// ------------------------------------------------------------ SCENE 6: the single cell suspended in darkness
vec3 scene6(vec2 p, float lt, float t){
  vec3 col = vec3(.003, .004, .01);
  col += EBLUE * .018 * fbm(p * 2. + t * .03) + VIOL * .012 * fbm(p * 3. - t * .02);
  // a few very distant drifting particles
  vec2 fq = p * 14. + vec2(t * .02, t * .05);
  float fd = length(fract(fq) - .5 - (h22(floor(fq)) - .5) * .6);
  col += vec3(.3, .5, .6) * .05 * step(.9, h12(floor(fq))) * smoothstep(.08, .02, fd);
  float sc = .30 + .012 * sin(t * .8);
  vec2 c = rot(.06 * sin(t * .25) - .08) * (p - vec2(0., .085)) / sc;
  vec4 cell = drawCell(c, .64, t, PX / sc, 3.);
  // soft light scattering through the cell into the surrounding dark
  vec2 e = (p - vec2(0., .085)) / vec2(.2, .3);
  col += TURQ * .045 * exp(-dot(e, e) * 1.3);
  col = mix(col, cell.rgb, cell.a);
  return col;
}

// ------------------------------------------------------------ main
void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 p = (fc - .5 * uRes) / uRes.y;
  PX = 1. / uRes.y;
  vec3 col = vec3(0);
  float wsum = 0.;
  if (uW[0] > 0.){ col += uW[0] * scene0(p, uT, uZ); wsum += uW[0]; }
  if (uW[1] > 0.){ col += uW[1] * scene1(p, uL[1]); wsum += uW[1]; }
  if (uW[2] > 0.){ col += uW[2] * scene2(p, uL[2]); wsum += uW[2]; }
  if (uW[3] > 0.){ col += uW[3] * scene3(p, uL[3]); wsum += uW[3]; }
  if (uW[4] > 0.){ col += uW[4] * scene4(p, uL[4]); wsum += uW[4]; }
  if (uW[5] > 0.){ col += uW[5] * scene5(p, uL[5]); wsum += uW[5]; }
  if (uW[6] > 0.){ col += uW[6] * scene6(p, uL[6], uT); wsum += uW[6]; }
  col /= max(wsum, 1e-3);

  // grade: filmic tone map, vignette, fine grain
  col *= 1.25;
  col = (col * (2.51 * col + .03)) / (col * (2.43 * col + .59) + .14);
  float vig = 1. - .38 * spow(length(p * vec2(1.25, .95)), 2.3);
  col *= vig;
  col = pow(clamp(col, vec3(1e-6), vec3(1.)), vec3(1. / 2.2));
  col += (h12(fc + fract(uT * 7.13) * 400.) - .5) * .018;
  fragColor = vec4(col, 1.);
}
