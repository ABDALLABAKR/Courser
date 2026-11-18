# The Electron — A Quantum Mystery

A 30-second cinematic motion-graphics film (16:9, 4K) about the quantum nature of the electron.

- **`electron-4k.mp4`**: the rendered film (3840×2160, 30 fps, H.264)
- **`index.html`**: the live, real-time version. Open it in a browser. Space plays or pauses, ←/→ seek, and the scrubber appears when you move the mouse. Add `?t=18` to start at a given second.
- **`render.cjs`**: renders the film frame by frame with headless Chromium and ffmpeg

Every frame is a pure function of time, so the live page and the video are identical.

## Scenes

| Time | Scene | What the visualization shows |
|---|---|---|
| 0–5 s | **The Invisible World** | Darkness, then a single point emerges. The camera approaches while a faint particle field fades in. |
| 5–11 s | **Wave–Particle Duality** | The electron travels and leaves a trailing wave. It then spreads into a Gaussian wave packet, drawn as the complex wavefunction (Re ψ, Im ψ) with a purple \|ψ\| envelope, and re-localizes with a detection flash. "PARTICLE" and "WAVE" in the caption light up with the current representation. |
| 11–18 s | **The Electron Cloud** | The wave curls into a hydrogen **3d<sub>z²</sub>** orbital (n=3, ℓ=2, m=0) around the nucleus. It is built from 34,000 points sampled from \|ψ\|², with cyan and blue/purple showing the sign of ψ (phase). |
| 18–24 s | **Quantum Uncertainty** | The cloud collapses to one detected point (a measurement). The point then spreads into a Gaussian. Side panels show the position distribution widening while the momentum distribution narrows, with Δx·Δp held constant. Particle jitter is faster when Δx is small. |
| 24–30 s | **The Quantum Mystery** | The camera pulls back on a 4f + 4p superposition cloud above a two-source interference wave field. The particles fade into darkness, and then the final titles appear. |

## Re-rendering

Requires Node, Playwright (Chromium) and ffmpeg.

```bash
node render.cjs                                   # 4K, 30 fps → electron-4k.mp4
node render.cjs --width 1920 --out electron-1080p.mp4
node render.cjs --fps 60 --workers 4              # options: --width --fps --workers --crf --out
```
