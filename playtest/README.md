# Majakka Gate 2 / PR-07 — first mobile research playtest

This PR is stacked on PR-06 and **must not** modify the public `main` entrypoint.

## How to try it

**No website deployment is required.** Download `playtest/majakka-missing-beat-offline.html` (the *raw* file) on the phone and open it in a browser as a local HTML page. CSS, simulation fixture, world rules and the current story logic are all embedded in that one file; no network requests, camera, GPS or account.

The source-code version `playtest/index.html` loads separate CSS and ES modules and needs a local HTTP server / branch preview to work. Browser `file://` module loading can be blocked; **use the standalone version for direct local phone testing**.

The demo is **not** production-ready shared-world gameplay. The three nodes are clearly identified synthetic test anchors. The field is prebuilt on a deterministic `18 L` fixture budget; the real world might need more investment. The interference recording is archival. The in-browser journal uses editable localStorage, not a real cloud account. Nothing impacts the published Majakka world.

## What should be tested by a person

1. Open with GPS disabled. Can you explain within two minutes why these three linked nodes matter?
2. Select Lens, measure A–B–C, choose among three hypotheses, and save the result.
3. Use **Reset test** and test Shelter: record the direct and detour routes; notice the different evidence and second-reading cost.
4. Reset again, test Beacon. See that the direct route matters even if the detour indicates the general delay direction.
5. Make a wrong hypothesis. Is the consequence informative rather than merely annoying?
6. Close/reopen the standalone HTML on the same device and see if the journal persists; local file storage support may vary by browser.
7. Attempt 200%-scale text, landscape, VoiceOver/TalkBack, and weak battery / offline mode. Record screenshots and feedback.

## Implementation

- `playtest/session.mjs` assembles three actually committed links with the PR-03 reducer, publishes a reversible archived signal using the PR-04 scheduler, and invokes the PR-06 expedition reducer. LocalStorage is demo-only.
- `playtest/ui.mjs` renders role choice, paths, observation clues, interpretation, and final journal. DOM click controls are functional.
- `playtest/playtest.css` is mobile-first, high-contrast, 48px+ action targets and reduced-motion-friendly.
- `playtest/index.html` is the modular source page; `playtest/majakka-missing-beat-offline.html` is an auto-assembled copy with real (not stubbed) rules bundled inline. It should be regenerated whenever a source module changes.
- `tests/playtest-browser-smoke.test.mjs` executes the **actual offline artifact** against a minimal Node DOM stub; it tests complete UI clicks, wrong hypotheses, reset and local re-open. It is not a real Android/Chrome browser or human UX test.

## Gate to continuing

**Do not call this first chapter fun based on green CI.** Have at least five fresh players attempt the complete case with zero live hints. Test whether they understand the reason for a route and experience a genuine new decision, not just a sequence of 'correct answer' buttons. If the mobile flow proves too technical, simplify before new nodes or art.

No merge to `main` until reviewed, and no public deployment. PR-07's rollback is simply closing its draft PR.
