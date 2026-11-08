# Majakka — Native Kaiku Lab v0.1

**Status: implementation prototype, not yet proven to compile/export or run on a phone.**

Independent Godot 4.7.2 project under `native-client/`. It is **not** the previous PWA, not an MMO, and doesn't send data anywhere. The first deliberately procedural Kaiku is **Prismite** (Shardforms): a tiny true 3D mesh assembled from local geometry, with an animated core, four articulated satellite shards and a resonance halo.

## What can be tested

- Rotate the Kaiku with one finger (or drag with a mouse).
- **INK FORM / LUMINOUS:** two material-based looks. The Ink option is an *early material study*, **not** a finished anime cel shader or a new Species.
- **REACT:** short bounce/pulse.
- **GUARDIAN / COMPANION:** switches its pose for eventual Node Guardian use. This does not publish anything to a Node.
- **LOW DETAIL / FULL DETAIL:** removes decorative geometry (halo and 12 sparks) to compare device load.
- HUD measures observed FPS, last ~240 samples' p95 frame time, and Godot's static engine memory metric. They are **not** device RAM totals or complete GPU profiling.

The prototype contains **zero backend calls**, zero personal data collection, zero downloaded assets and no location permissions. It uses Godot's `gl_compatibility` renderer to support a wider Android device range.

## Run locally

1. Install **Godot 4.7.2 Standard** (no .NET needed).
2. Import `native-client/project.godot` and run the project.
3. Logic smoke: `godot --headless --path native-client --editor --import --quit` followed by `godot --headless --path native-client --script res://tests/smoke.gd`.
4. To make an Android debug APK, install matching Godot export templates, configure Java/Android SDK/keystore as required by Godot, then use the Android export preset or CLI `--export-debug "Android"`.

**Performance acceptance (initial proposal):** sustained 30 FPS on the actual target phone, no crashes, controls usable in portrait, reasonable memory/thermals after 10 minutes. The scene is deliberately **much simpler** than the eventual creature art and must not be used to claim final-game performance.

## Android delivery

`native-kaiku-android.yml` runs for PRs changing the native client and supports manual execution later. It can export a debug APK on a GitHub-hosted runner after downloading the exact editor and standard templates. That step can consume significant CI bandwidth and build minutes. Check that the workflow succeeds before treating APK delivery as working; this repository was not previously using Godot builds. The APK is signed only as a debug test app and is not for store publication.

## Architecture and next gates

1. **A:** establish repeatable Android APK and collect FPS/p95/engine memory, APK size and basic thermal observations.
2. **B:** replace procedural proxy with one authored GLB asset (Flintail or Inkari), same benchmark.
3. **C:** add isolated local data model for Species/Instance/Form + one reversible Kaiku Talent and Guardian deployment preview.
4. **D:** only after fun and technical acceptance, connect authoritative Network state with anti-duplication controls.

The existing Majakka `main` branch and unmerged gameplay rule PRs must not be overwritten, silently merged or treated as native game logic.
