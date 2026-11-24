# World v0.9 — Restoration playtest (draft, 2026-11-24)
Hypothesis: spending a finite test resource and deliberately connecting restored beacons makes the existing beautiful v0.8 world feel like a game.
Uses the unchanged v0.8.1 renderer and three fictional demo locations. Existing main and visual experiments are not modified. No GPS, no real POI inclusion, no backend, no production economy.
Test-only choices: 6 starting Lumen, 2 per restoration (consistent with Place-first v0.11), explicit sequential free links matching the existing renderer, no resource reward in this short trial. The First Chord label is feedback only. These choices are not new canon. Ground glow and button state reflect restoration; physical beacon models remain as in v0.8.1.
Progress is stored in an isolated localStorage key. Invalid data or storage failure starts a local trial and indicates unsaved progress. No existing player data migration. Three links close the visual field. Map requires internet and existing CDN libraries.
## QA
Run node --test tests/world-v09-playtest.test.mjs. Test initial state, invalid/repeated action, link prerequisites, all restoration orders, persistence, corrupt input and complete triangle. Browser/WebGL and Android visual QA NOT RUN unless separately evidenced. No release or merge without user approval and QA gate.
Physical playtest: restore two beacons, connect, restore third, close triangle, refresh; check Lumen, visible links, mist ON/OFF, street names, short wakes and low-end device usability. Note emotional payoff, not just whether the graphics work.
