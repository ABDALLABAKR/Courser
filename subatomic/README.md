# The Subatomic Universe — A Colorful Journey into Matter

A 40-second cinematic motion-graphics film (16:9, 4K, 30 fps) about protons, neutrons and electrons.

- **`subatomic-4k.mp4`**: 3840×2160 · **`subatomic-1080p.mp4`**: 1920×1080
- **`index.html`**: the live, real-time version. Space plays or pauses, ←/→ seek, and `?t=20` starts at a given second.
- **`render.cjs`**: frame-exact renderer (headless Chromium → ffmpeg)

## One continuous story

| Time | Scene | Visualization |
|---|---|---|
| 0–7 s | **The World Inside Matter** | Flowing blue, violet and magenta field with rotating geometry. A carbon‑12 atom materializes: 6 protons and 6 neutrons, plus an electron cloud sampled from real 1s/2s/2p orbitals. The camera then dives into one proton. |
| 7–16 s | **The Proton** | Orange, red and gold field with swirling energy spirals. A cutaway proton opens to show its **u, u, d** valence quarks joined by gluon flux tubes (a Y‑junction) inside a sea of flickering virtual quark pairs. *+⅔ +⅔ −⅓ = +1* |
| 16–25 s | **The Neutron** | The proton dissolves into a particle swarm. As the environment turns turquoise, emerald and deep blue, a neutron forms from the cloud, and one quark changes flavour (u → d). Energy pulses run across a hexagonal lattice. *+⅔ −⅓ −⅓ = 0* |
| 25–34 s | **The Electron** | The neutron **β‑decays** (n → p⁺ + e⁻ + ν̄ₑ). The emitted electron carries a de Broglie wave and expanding wave rings, then spreads into a hydrogen **2p** probability cloud around the remaining proton, with no orbit. |
| 34–40 s | **The Building Blocks of Atoms** | Eleven nucleons fly in to rebuild the carbon nucleus, and the cloud grows into carbon's multi-electron cloud. The background blends every palette, then the camera zooms out and the atom fades away. |

The nucleus is shown enlarged about 10,000× relative to the electron cloud. This is an artistic visualization, not to scale.

```bash
node render.cjs                                  # 4K master
node render.cjs --width 1920 --out subatomic-1080p.mp4
```
