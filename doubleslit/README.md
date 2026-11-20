# The Double-Slit Experiment — When Reality Becomes Strange

A 128-second cinematic science film (16:9, 4K, 24 fps) about the double-slit experiment, timed to its narration and scored with synthesized sound design.

- **`doubleslit-4k.mp4`** (3840×2160) · **`doubleslit-1080p.mp4`** (1920×1080), with narration and sound design
- **`index.html`**: the live, real-time version with sound. Press ▶ or Space, and use ←/→ to seek.
- **`render.cjs`**: frame-exact renderer (headless Chromium → ffmpeg), here run at `--fps 24`
- **`sound.py`**: sound design synthesized from the picture's own event schedule (`events.json`) and mixed under the narration (`narration.mp3`) → `soundtrack.wav`

## The physics behind every image

| Element | What is computed |
|---|---|
| Wave field (scene 2) | ψ(r) = Σⱼ e^{ik rⱼ}/√rⱼ from two coherent slit sources. Line height is Re ψ; colour is the time-averaged \|ψ\|² (gold ridges where waves reinforce, ultraviolet valleys where they cancel). |
| Electron detections (scene 3) | 16,000 individual points sampled from P(z) ∝ \|a₁ + a₂e^{iφ}\|², arriving faster and faster: one, then dozens, hundreds and thousands. A live histogram converges to the theoretical curve. No trails are shown and no electron "splits". |
| Which-path measurement (scene 4) | Coils and a laser sheet at the slits. Each electron scatters a photon at the slit it used, and that probe registers it. The resulting 9,000 detections follow P ∝ \|a₁\|² + \|a₂\|² (same single-slit envelopes, no interference term). No observer or eye is shown. |
| Split screen | Side-by-side comparison of no which-path information (visibility V ≈ 1) and which-path information (V ≈ 0), with histograms and theory curves. |
| Probability landscape (scene 5) | The detector distribution raised into a 3D landscape, with flickering detection events on its surface and P(x) = \|ψ(x)\|². |
| Ending (scene 6) | The landscape collapses to one point, which opens into two slits. The pattern returns, then fades, leaving one detection. |

Interpretations of quantum mechanics are presented as an open question.

## Sound

The score starts in near silence. Mechanical sounds accompany the apparatus. During the wave scene, two slightly detuned tones beat against each other, so the sound itself interferes. Every electron detection is its own click, pitched by where it landed, and the clicks merge into a rhythmic texture as their rate rises. At the measurement scene the intensity drops abruptly. The film ends on a single soft tone, then silence.
