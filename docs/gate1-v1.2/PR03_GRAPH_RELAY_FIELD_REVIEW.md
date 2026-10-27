# Majakka Gate 1 / PR-03 — graph, relay, field candidate

**Status:** PROVISIONAL; not integrated into the live PWA, Worker or player UI.
Stacked on `feature/majakka-rules-pr02`, itself stacked on PR-01. Do NOT merge
this branch before prior PRs or assume a published backend exists.

## Deterministic contract

- `graph.mjs`: `linkWorkKm(D)` = 2 + min(4,max(0,log10(max(1,D/2)))).
  `createGraphState(nodeRulesState)` adds link, field and trusted proof-grant
  storage. `previewLinkAction` quotes the next candidate action without a debit.
  `applyLinkAction` accepts only WEAVE (anchor/align/reinforce) and
  LINK_PROOF (survey/interpret/route), with actor-scoped action IDs.
- Required light work = sqrt(effective reach to A * effective reach to B),
  quantized to 1/10,000 units. `anchor` then `align` can happen immediately
  in one session; subsequent `reinforce` is limited to one successful action
  / actor + link / 20 hours. There is no deadline or ongoing maintenance.
- Links have IDs from the PR-01 identity module. They are `Building` until
  `workDoneUnits >= workRequiredUnits`, then permanently `Committed`.
  Link cost = 2L per successful WEAVE contribution. Late and replayed actions
  do not spend Lumen, generate a new link or duplicate a receipt.
- >100km link projects may accept authored, previously APPROVED proof grants:
  survey/interpret/route, once per actor/link/stage, 1L and at most 1.5 work.
  All authors share ONE capped proof sum <= floor(80% required work). A link
  cannot complete using research-only proofs, even with infinite accounts.
  `solved:true` and client-supplied work amounts are ignored.
- `relay.mjs` calculates best direct or relay effectiveness through already
  `Committed` edges with a maximum of 6 hops. Edge virtual distance
  = 20km + 0.12*geodesicLengthKm, plus real-world entry and exit travel
  distances to the graph. Relay effectiveness is at most 0.60; short local
  direct links still have effectiveness 1.
- `field.mjs`: AB+BC+CA, all committed, implies one stable field identity.
  On an edge completion inspect only its endpoints' common neighbours;
  materialize newly closed fields once. Overlapping/crossing/distant
  triangles are valid; no graph edit is caused by geographic rendering.
  Field area generates **zero passive Lumen**.

## Explicit non-features and risks

- The different `anchor` and `align` steps are mechanically ordered,
  but **do not yet express a meaningful different player decision**. Gate 2
  must author a visible design consequence or combine them; never ship two
  differently named 'pay 2 L' buttons as if that were interesting gameplay.
- Field Beacon/Shelter/Lens roles, interference and expedition content are
  separate future mechanics; committed field identity is ready, not its UX.
- This reference reducer has no actual authenticated actor, no location
  authentication, no persisted server-wide CAS/transaction, no Sybil defence,
  and no scalable global graph query. The future Worker must quote/verify the
  cost and atomically commit wallet debit, edge, field, and the idempotency
  receipt under one DB transaction.
- Future production network lookup needs bounded spatial indexing, adjacency
  materialization and performance limits, NOT iterating all millions of
  published edges in each request. Here the entire small pilot graph is
  deliberately passed in as a trusted input.
- Long link costs and 20h repetition remain **game-balancing hypotheses**:
  mathematic consistency does not prove players enjoy international links.
- Existing canonical node coordinates and remote-only restrictions remain
  required. No map camera/GPS argument can change any work calculation.

## Test and rollback

Run `node --test tests/*.test.mjs` and `node --check backend/worker.mjs`
on the PR head. No mobile hardware or cross-client D1 tests are claimed.
This PR adds only files under `game-rules/`, `tests/`, `docs/`.
Roll back by closing its PR; no production data or deployed app changed.
