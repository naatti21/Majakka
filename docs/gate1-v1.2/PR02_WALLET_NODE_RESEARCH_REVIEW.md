# Gate 1 / PR-02 — Lumen and node-action candidate (not gameplay release)

This branch is stacked on PR-01: `feature/majakka-rules-v12`.
Read `docs/gate1-v1.2/MAJAKKA_RULES_SINGLE_SOURCE_v1.2.md` and
`game-rules/balance-config.json` first. All values remain PROVISIONAL.

## Source of truth and API

- `wallet.mjs` exports `createWallet`, `spendLumen`, `grantEarnedLumen`,
  `channelLumen`. Integer Lumen balances, rolling 24h earned cap,
  20h Channel cooldown and capacity 18 are read from one config.
  Channel works without GPS. A zero-award Channel does not consume cooldown.
  A partial award may consume cooldown; this is **an unapproved balancing/UX risk**.
- `node.mjs` exports `createPlayer`, `createWorldNode`,
  `createRulesState`, `applyNodeAction`. Accepted action types:
  `ATTUNE`, `RESEARCH`, `CHANNEL`.
- `research.mjs` defines exactly three stages: Survey, Compare, Interpret;
  they give 3,000 charge units each only when **previously approved** by
  trusted content validation. An action-supplied `solved:true` or
  `verified:true` is ignored. Authoring/validation is NOT implemented.
- `ATTUNE` costs 2 L, adds rounded `e(distanceKm(home,node)) * 10000`
  units, max 10,000 units. Repeated direct player+node pulses have a 20h
  cooldown. The same player may research a distant node between pulses.
- `RESEARCH` costs 1 L, one success per actor/node/stage, total up to
  0.90 world charge from the three different stages of *one actor*.
  No research benefit/cost after Awakening.
- Node status is `Dormant` until 10,000 units, then permanently `Awakened`.
  Already awakened nodes cannot be charged or billed again by these actions.
- Each accepted actor+operationId receives a permanent reducer receipt.
  Replaying the same semantic request returns the saved result, never a
  second debit; reusing that operationId for a different type/target/stage
  is rejected. Failed actions return the unmodified state and do not
  consume costs, stages or cooldowns.

## Trust boundary — critical

This is a pure deterministic *reference reducer*, not a live authoritative
server, authentication service, proof evaluator or concurrency solution.
`actorId`, `nowMs`, player `home`, published node `geo` and
`researchGrants` MUST originate from trusted, versioned server state.
Never build them from browser action arguments. The reducer intentionally
ignores action-level position, GPS, camera, arbitrary efficiency and
`solved` flags. It does NOT safely persist transactions across two
concurrent server invocations, prevent Sybil accounts, prove GPS motion or
validate authored research answers. Gate 3 needs an atomic ledger and DB
uniqueness constraints.

An authorised controller is responsible for validating a player's identity
and the proof challenge, granting one permission to
`researchGrants[JSON.stringify([actorId,nodeId,stage])]`.
Client-side state is *not* a valid proof authority.

## Mandatory product/balance issues before UI integration

1. Starting at 8 L permits two local awakenings (4 L) and later 4 L of
   link investment, but **not** an entire three-node field, priced about 18 L
   from empty world. Current 20h income intervals can cause a waiting trap.
   Compare 8 L start against 12 L + 6 reserve and author a no-wait
   beginner path before player-facing integration.
2. The GPS-free Channel gives 4 L once/20h and earned cap of 10/rolling 24h.
   Physical grain awarding requires its own validated action and must not
   become the superior-only path. Evaluate partial-credit ergonomics.
3. A very distant node can still need 3 approved research decisions plus
   multiple 20h pulses; do not confuse 1000 passing assertions with fun.
4. Server-accepted research content must change the player's knowledge or
   decision, not amount to a repeatable "correct answer" click. This PR
   intentionally **does not unlock any research grant in the live app**.
5. No passive income, streak loss, debt, asset decay or mandatory return
   after 21 days. Resting does not reduce earned permanent node charge.

## Scope, test, rollback

New files only: `game-rules/wallet.mjs`, `game-rules/research.mjs`,
`game-rules/node.mjs`, `tests/game-rules-economy.test.mjs`, this document.
Existing `main`, PWA and live Worker are unchanged. Test:
`node --test tests/*.test.mjs` and `node --check backend/worker.mjs`.
`main` / GitHub Pages deployment is **not** authorised.
Rollback: close or discard PR-02 branch; no production state to migrate.
