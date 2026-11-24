# Gate 2 / PR-06 — The Missing Beat, playable in the rule engine

**Design status:** STORY PILOT / FIXTURE ONLY / no live UI or real POI claim.
Stacked on PR-05, which is stacked on Gate 1. Nothing merges to `main`.

## What the player does
The player encounters a fictional timing anomaly on a graph with three already awakened, actually **committed** edges A–B, B–C and A–C. The nodes come from `fixtureOnly:true` and carry synthetic IDs, not claimed historical landmarks. The case uses a recorded, versioned interference snapshot to make reruns fair and to avoid an artificial real-world six-day wait.

1. **START**: read the contradiction and its purpose. No Lumen or GPS.
2. **SELECT_ROLE**: choose one personal *expedition* tool: Lens, Shelter or Beacon. Before the first measurement the role can change; after the measurement it is locked for this case. It never changes the shared field for other players.
3. **MEASURE**: choose the direct A–C route or the A–B–C detour; observe authored facts that differ by route and field role. One first-ever tutorial measurement is free; later distinct measurements cost 1 Lumen and are limited to once per route.
4. **INTERPRET**: choose the explanation. Wrong theories receive specific contradictory evidence **without loss of progress or Lumen**; right theory requires proof from the measurements, not a client-supplied `correct:true` flag.
5. **FINISH**: save `finding:the-missing-beat:route-echo` and unlock **Echo Differentiation** plus the next question. Journal and world structures persist; the same case does not mint repeated rewards.

## Three genuinely different solution paths

- **Lens:** one A–B–C detour separates two copies carrying the same signature. Explanation: the route repeats the same source, not a fourth hidden sender.
- **Shelter:** obtain clean measurements on A–C and A–B–C, then compare their delays; a second reading costs 1 Lumen.
- **Beacon:** reveal that a delay begins near B; comparing with direct A–C rules out a fourth source. Also needs a second observation.

These are authored deterministic evidence rules, not random/AI-generated trivia. They share one conclusion but differ in *information acquired, actions and cost*. They are **hypotheses about fun**, not validated enjoyable UX.

## Architectural boundary
`content/cases/the-missing-beat.json` is explicitly fictional. `gameplay/mission-planner.mjs` derives route-sensitive evidence and accepts only a validated prior recorded case snapshot. `gameplay/first-light-flow.mjs` provides a pure `applyExpeditionAction` reducer and `getExpeditionView` for eventual one-CTA mobile UI.

The first flow is map-independent and consumes an existing test-world graph. It does NOT auto-build three links, auto-awaken fictional real-world landmarks, impersonate a multi-user server, synchronize the live PWA, or record an actual visit. Client-supplied GPS, success flags and time do not determine evidence or reward.

Gate 3 requires authenticated server-controlled case snapshots, trusted case catalog, proof evaluation and atomic ledger/receipt writes. Gate 2 UI PR-07 requires a mobile presentation and user testing. A new player's 8L start is **still insufficient** to build a fresh three-edge field instantly; for this test the already-built field is a scenario fixture, not a false promise of a first-10-minute economy.

## Acceptance
Run all `node --test tests/*.test.mjs` and check `backend/worker.mjs`.
Test three solution paths, wrong guesses, two players with different roles on the same shared field, first free measure, repeat attempt and 21-day archived snapshot. A story with no implemented PWA screen has **not** been human playtested. Keep existing `main` and GitHub Pages unchanged. Rollback: close the branch/PR.
