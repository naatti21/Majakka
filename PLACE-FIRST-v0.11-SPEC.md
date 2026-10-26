# Majakka v0.11 — Place-first restoration pilot
Updated 2026-10-26. This document records what is implemented and what remains an experiment.

## What was wrong
The old regional generator created 12 virtual nodes per cell, six fictional Echo
nodes per sparse area, and decorative beacons. They had no relationship to specific
places, overcrowded the screen, and changed abruptly when camera regions switched.
Even if those procedural coordinates were deterministic, the result had no
convincing in-world reason for players to interact.

## Current single-player pilot
- No procedural map nodes or filler Echoes are visible. Personal collectible
  Lumen grains remain independent of real locations.
- Tap **Discover landmarks** to request named heritage, artwork, nature and
  cultural place candidates near the fixed map search region. The request uses
  OpenStreetMap data through Overpass. At most three candidates, separated by
  >=360m, are shown. Empty geography stays empty.
- These landmarks use deterministic OSM-derived IDs and source coordinates, not
  camera-relative spawning or the user's GPS. A scene switch does not generate
  new place locations.
- Tap a source-backed landmark to restore it for 2 Lumen. The beacon brightens.
  Restore two in the same roughly 2.6km projected district to awaken a permanent
  First Chord and receive up to 3 Lumen (subject to wallet/daily limits).
- Restored landmarks in the same district form a visible line in both 2D and
  3D. The **District** tab explains the objective and shows the counts.
- The user may pan the map and play remotely; walking is not required.
- Previous local data is not deleted. Old prototype nodes and related
  panels are hidden, not migrated.

## What is NOT yet achieved
- There is **no live multiplayer service**. The same OSM record gives the
  same node ID and coordinates, but restoration progress is per browser.
- POI data is unverified. Sites are **virtual interactions**, not directions,
  visits, access guarantees, or navigation instructions.
- On-demand Overpass queries are appropriate only for a small pilot. A public
  production game requires an independently operated or licensed POI dataset,
  moderation, canonical inclusion decisions, cache/version management, and a
  backend that agrees on world nodes and their shared state.
- Different overlapping requests can yield different visible candidate
  subsets. A canonical, versioned worldwide POI catalog is required before
  claiming every user sees exactly the same full set.
- The 2-landmark First Chord loop proves that actions can have a visible
  spatial consequence. It is not a complete long-term game economy.

## Next product design decision
A coherent longer-term Majakka could use:
1. **Discover** a meaningful public landmark (its history/nature/art/culture
   determines the type of resonance, rather than an arbitrary random category).
2. **Restore** it by contributing Lumen or completing a meaningful skill.
3. **Link** compatible restored sites. A linked network creates an enduring
   district feature: visible lights, a new chapter, utility, and progression.
4. **Protect/shape** the network as interference returns on predictable rules.
   Rare, high-impact decisions, not repetitive tapping on countless posts.

Validate the emotional payoff, frequency and scarcity with the user before
adding combat, daily tasks, resource sinks, or virtual enemies.

## Device QA
- Pan slowly and quickly: existing landmarks must not slide to another street,
  respawn in the camera center, or change identity.
- Switch 2D ⇄ 3D at the same camera region; site coordinates must agree.
- Load the same OSM landmark on two browsers: location and ID must match;
  local restoration state will not match until multiplayer backend is live.
- Restore a landmark once, refresh: it stays lit; the second attempt does not
  debit the wallet. Restore a second valid landmark in the same district:
  a line appears and the First Chord unlocks exactly once.
- On an empty POI area, no substitute fictional node must spawn.
- The Lumen grains still collect independently with no GPS permission.
- Test GPS as a location marker only; it must not control what sites exist.

**Tarkastettu / Validated** refers to code/test coverage only, not Android
field acceptance. All device/UI claims require direct user verification.
