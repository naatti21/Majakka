# Flintail Native Presentation Slice v0.2

**Prototype art, not final approved Species Art Master.**

## Goal
One `sp.flintail` + `fm.flintail.base`, represented on the World Map as a **2.5D sprite**, and in Inventory as an **Animated Card concept**. The map is a fabricated test map, **not** actual geographical gameplay, and no shared world API is called.

### Controls
- `WORLD MAP` / `INVENTORY`: switch contexts, and pause the invisible context's animation.
- `MOVE`: advance 2.5D sprite along a test track between two positions.
- `GUARDIAN` / `COMPANION`: deploy same sprite visually at a synthetic Node; **no gameplay effect**.
- `RESONATE` in Inventory: one lightweight visual pulse.
- FPS and Godot engine static memory appear at top.

## Known limits
1. Concept art was cropped from an exploratory design sheet. **Not a complete 4-direction, 3-animation approved sprite atlas.** Walk/Run are concept poses, not in-between animation cycles.
2. Two existing Identity Map requirements were not met by the generated art: fully legible forked luminous tail and right foreleg asymmetric crescent. Treat as failing *canonical Art Master approval* until corrected.
3. Portrait-only. No Inventory listing, character save, hybrid gameplay, backend, GPS, latency, or production renderer benchmarks.
4. The Inventory card uses a very subtle scale/pulse instead of an authored 3–6-second full animation; test the performance profile and interaction first.
5. Original v0.1 Prismite demo scripts remain in the repository for regression testing but are no longer the default launch scene.

## Budget snapshot
`assets/maps/forest-map.webp` around 35 KB and all Flintail WebPs combined around 55 KB compressed. *GPU-decompressed textures cost more.* Only one map sprite and one selected Card displayed simultaneously (never both animated).

## Test
Godot 4.7.2:

```bash
godot --headless --path native-client --import
godot --headless --path native-client --script res://tests/flintail_smoke.gd
godot --headless --path native-client --script res://tests/smoke.gd
```

On Android: inspect small-screen layout, observe movement and tab switching, ensure 10-minute use is stable; record FPS, memory, thermal behavior. If all pass, **redraw canonical character** then derive properly authored sprites from locked turnaround. We have *not* claimed visual identity acceptance yet.
