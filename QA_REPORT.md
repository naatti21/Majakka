# MAJAKKA v0.1 — QA handoff

**Date:** 2026-10-24  
**Scope:** first static, local-only prototype.  
**Release status:** **READY FOR USER PAGES/ANDROID TEST; NOT PRODUCTION READY.**

## PASS — executed

- `node --check app.js`, `node --check sw.js` — PASS.
- `node --test tests/core.test.mjs` — 10/10 PASS. Invariants include unique public nodes, public-public links only, remote-data absence, no dead nodes, challenge variety, malformed saved-state rejection.
- Headless Chromium rendering with page HTML/CSS/JS injected directly (due test-environment URL navigation block): no JavaScript exceptions; simulated City/Town/Wild change yields 8/7/7 nodes.
- Three distinct challenges completed in simulated browser: pattern choice, phase alignment, echo replay/memory. Counter increases from 0 to 3; journal records completions.
- Simulated delayed pulse advances counter; tests at 320, 390, 430, 768 and 1440px widths showed no horizontal document overflow.
- ZIP archive CRC/integrity check — PASS.

## NOT RUN / unverified

- Actual Cloudflare Pages deployment, HTTP fetch in headless Chromium and production URL — NOT RUN. Browser blocked navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`) before any application scripts; therefore browser tests were performed via injected content instead. This is **not** a site error finding.
- Real Android tap/scroll/graphics performance, IndexedDB persistence across a genuine page reload, installed PWA offline reopen — NOT RUN.
- Real background location and multiple-player privacy — intentionally not implemented.

## Next user-facing acceptance

1. Verify the production Pages link displays the correct version and icon.
2. Restore a node in each of the three puzzle categories, including muted sound.
3. Switch among all three regions and simulate a pulse.
4. Reload and confirm `Echoes Restored`, `World Pulse` and the journal persist.
5. Put the device offline after a successful visit and relaunch the installed PWA.
6. Inspect 320–430px readability, tap targets, battery usage and animation feel on a real device.

The protocol is truthful: simulated/browser checks cannot replace Android and deployment verification.
