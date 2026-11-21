# The Invisible Universe — a 30-second cell-biology film

A 30-second cinematic journey into a single living human cell. It is rendered
procedurally: every frame is computed by one GLSL fragment shader. There is no
stock footage, no 3D models and no AI video.

**Format:** native 9:16 portrait · 2160 × 3840 · 24 fps · H.264 (BT.709)

| Time | Shot | On-screen text |
|---|---|---|
| 0–6 s | Macro skin microrelief, then a dive through the epidermis into a columnar epithelium, until one cell fills the frame | AN ENTIRE UNIVERSE… INSIDE YOU. |
| 6–12 s | Flight through cytoplasm (vesicles, rough ER, polysomes, filaments) to the nucleus, through nuclear-pore-studded envelope, into chromatin (nucleosomes) and a B-DNA double helix | DNA — THE INSTRUCTIONS OF LIFE. |
| 12–18 s | Mitochondrial network, then a sectioned mitochondrion: double membrane, lamellar cristae lined with rotating ATP-synthase heads, ATP streaming through the matrix | MITOCHONDRIA — CELLULAR ENERGY. |
| 18–24 s | Ribosome (large and small subunits) translocating along mRNA while the nascent polypeptide emerges and folds (α-helix and globule). Then kinesin walking hand over hand along a 13-protofilament microtubule, carrying a lipid-bilayer vesicle | MILLIONS OF MOLECULAR PROCESSES. |
| 24–30 s | Pull back out through the cell, tissue and skin to the whole human body, then end on the single cell suspended in darkness | TRILLIONS OF CELLS. / ONE EXTRAORDINARY LIFE. |

## Scientific touches

- Epithelial cells are columnar, with a nucleus, a nucleolus, rough ER wrapped around the nucleus, a Golgi stack, mitochondria and Golgi-derived vesicles.
- B-DNA has 10.5 bp per turn, a pitch-to-diameter ratio of about 1.7, and offset strands that give real major and minor grooves. Base pairs are drawn as complementary half-rungs.
- Chromatin appears as "beads on a string": DNA wrapped around histone octamers, with linker DNA between them.
- Microtubules show α/β-tubulin monomers on a helical lattice. Kinesin takes 8 nm hand-over-hand steps on a coiled-coil stalk with light chains.

## Files

- `shader.frag`: the whole film (all shots, colour grade, grain)
- `index.html`: WebGL2 host, timeline (shot weights, zoom curves) and typography (Inter Display)
- `render.js`: drives headless Chromium frame by frame and pipes the frames to ffmpeg
- `render_all.sh`: full render in six chunks, then a lossless join

## Rendering

```bash
# stills for review (any width; height = width * 16/9)
node render.js stills 540 stills/ 0.5 9 15 20 29

# quick motion preview
node render.js film 360 preview.mp4

# final master, 2160x3840 @ 24 fps (about 10 s per frame on a 4-core CPU with SwiftShader)
./render_all.sh out
```

Requires Node with `playwright` (Chromium), `ffmpeg` with libx264, and the Inter / Inter Display fonts.
