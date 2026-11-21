"""Precompute the mathematics the Riemann film draws (writes rh-data.js).

ZEROS   imaginary parts of the first nontrivial zeros of zeta (mpmath.zetazero)
LAND    log10|zeta(s)| and arg zeta(s) on a grid  sigma in [-2, 3.5], t in [0, 50]
WAVES   Riemann's explicit formula for pi(x), x in [1.6, 100]:
          pi(x) = sum_{n <= log2 x} mu(n)/n * J(x^(1/n))
          J(y)  = li(y) - sum_rho Ei(rho ln y) - ln 2 + int_y^inf dt / (t (t^2-1) ln t)
        BASE[i] is the smooth part (no zeros); TERM[k][i] is the contribution of the
        conjugate pair rho_k, conj(rho_k)  (= -sum_n mu(n)/n * 2 Re Ei(rho_k ln x / n)).
BOUND   li(x) - pi(x) for x up to 1e6 together with Schoenfeld's conditional bound
        sqrt(x) ln x / (8 pi)  (valid for x >= 2657 if RH holds).
"""
import json, math
from multiprocessing import Pool
import mpmath
import numpy as np

mpmath.mp.dps = 15
NZ, NW = 400, 100


def zero(n):
    return float(mpmath.zetazero(n).imag)


SIG = [round(-2.0 + 0.05 * i, 4) for i in range(111)]       # -2 .. 3.5
TS = [round(0.1 * j, 4) for j in range(501)]                  # 0 .. 50


def land_row(j):
    t = TS[j]; mags, args = [], []
    for s in SIG:
        if abs(s - 1) < 1e-9 and t == 0:
            mags.append(3.0); args.append(0.0); continue
        z = complex(mpmath.zeta(complex(s, t)))
        mags.append(round(max(-3.0, min(3.0, math.log10(abs(z) + 1e-300))), 3))
        args.append(round(math.atan2(z.imag, z.real), 3))
    return mags, args


def mobius(n):
    r, m = 1, n
    p = 2
    while p * p <= m:
        if m % p == 0:
            m //= p
            if m % p == 0:
                return 0
            r = -r
        p += 1
    return -r if m > 1 else r


XS = [float(x) for x in np.exp(np.linspace(math.log(1.6), math.log(100.0), 1800))]


def tail_int(y):
    return float(mpmath.quad(lambda u: 1 / (u * (u * u - 1) * mpmath.log(u)), [y, mpmath.inf]))


def base_at(x):
    v = 0.0
    n = 1
    while x ** (1.0 / n) >= 2.0 - 1e-12 or n == 1:
        mu = mobius(n)
        if mu:
            y = x ** (1.0 / n)
            v += mu / n * (float(mpmath.li(y)) - math.log(2) + tail_int(y))
        n += 1
        if x ** (1.0 / n) < 2.0:
            break
    return v


def terms_at(args):
    x, zs = args
    out = []
    lx = math.log(x)
    ns = [n for n in range(1, 8) if (n == 1 or x ** (1.0 / n) >= 2.0) and mobius(n)]
    for g in zs:
        rho = complex(0.5, g)
        v = 0.0
        for n in ns:
            v -= mobius(n) / n * 2 * float(mpmath.re(mpmath.ei(rho * lx / n)))
        out.append(round(v, 4))
    return out


def main():
    with Pool(4) as pool:
        zeros = pool.map(zero, range(1, NZ + 1), chunksize=8)
        print('zeros', zeros[0], zeros[-1])
        rows = pool.map(land_row, range(len(TS)), chunksize=8)
        print('land done')
        base = pool.map(base_at, XS, chunksize=40)
        terms = pool.map(terms_at, [(x, zeros[:NW]) for x in XS], chunksize=20)
        print('waves done')
    # pi(x) and li(x) up to 1e6 for the error-bound plot
    N = 1_000_000
    sieve = np.ones(N + 1, bool); sieve[:2] = False
    for p in range(2, int(N ** 0.5) + 1):
        if sieve[p]:
            sieve[p * p::p] = False
    pic = np.cumsum(sieve)
    bx = np.linspace(2657, N, 700).astype(int)
    bd = [[int(x), round(float(mpmath.li(x)) - int(pic[x]), 2), round(math.sqrt(x) * math.log(x) / (8 * math.pi), 2)] for x in bx]
    data = {
        'ZEROS': [round(z, 6) for z in zeros],
        'LAND': {'sig': [SIG[0], 0.05, len(SIG)], 't': [0.0, 0.1, len(TS)], 'mag': [r[0] for r in rows], 'arg': [r[1] for r in rows]},
        'WAVES': {'x': [round(x, 5) for x in XS], 'base': [round(b, 4) for b in base], 'terms': [[terms[i][k] for i in range(len(XS))] for k in range(NW)]},
        'BOUND': bd,
    }
    with open('rh-data.js', 'w') as f:
        f.write('const RHD = ' + json.dumps(data, separators=(',', ':')) + ';\n')
    # sanity: explicit formula with 100 zeros vs true pi(x)
    for x in (10.5, 30.5, 50.5, 97.5):
        i = min(range(len(XS)), key=lambda i: abs(XS[i] - x))
        approx = base[i] + sum(terms[i]) - 1 / math.log(XS[i]) * 0  # see check below
        print(f'x={XS[i]:.2f} pi={int(pic[int(XS[i])])} base={base[i]:.3f} with100={base[i] + sum(terms[i]):.3f}')


if __name__ == '__main__':
    main()
