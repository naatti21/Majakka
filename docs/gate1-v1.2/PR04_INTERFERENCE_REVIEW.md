# Majakka Gate 1 — PR-04: reversible Interference rules

**Status:** Candidate, not a game release. Stacked onto `feature/majakka-rules-pr03` (which depends on PR-02 and PR-01). **Do not merge into main or activate a live Worker.**

## Implemented, as pure deterministic JavaScript

### Server-clock event phases
A trusted world scheduler publishes an immutable event ID and region, UTC starting instant, plus existing field IDs and one committed affected link per field. A player request cannot create events.

- Scheduled → Signal **24 h** (warning, 0 effect)
- Interference **up to 72 h** (≤20 percentage points effect per event)
- Recovery **48 h** (effect smoothly fades 20 → 0)
- Calm (archived, **0 effect**)

When a player successfully stabilizes an active event, it immediately enters a zero-functional-loss Recovery, with a 48 h purely visual fade. At most one new start per **21 days per region**. Multiple regions can impact one field, aggregate effect limited to **40 percentage points**. UTC phase derivation continues even when the game is closed. There is no maintenance obligation and no expiration of permanent discoveries.

### Four actions and personal field choices

- `STABILIZE`: **2 Lumen** from one player, once per shared event; during active phase only. No spend if already resolved or lacking balance. This ends the worldwide functional effect of that event, **not other events**.
- `INVESTIGATE`: **0 Lumen**, once per player/event, grants a persistent personal fragment only when an *independent trusted authored-challenge evaluator* has preapproved the actor/event grant. Available from the permanent archive as well; cannot miss the main story by not logging in.
- `REROUTE`: **1 Lumen**, personal effect (≤10pp reduction for ≤24h) during active phase and only through a real, committed, currently clear alternative path in the field's triangle; requires a personally focused field. Does not add/remove any public link.
- `IGNORE`: **0 Lumen**, no state mutation or missed-reward debt, always safe.

`setFieldFocus` chooses Beacon / Shelter / Lens for up to **2** committed fields for that player only. Role changes are blocked during active Interference. A new player can still focus an affected field while it is active, but **Shelter chosen after the warning phase cannot retroactively block the current disturbance**. Shelter covers at most one affected event for that personal field; no other player's choice is affected.

`fieldSignalQuality` returns read-only quality and a breakdown. The underlying world nodes, links, fields, wallet and findings do not decay with time; quality is computed from UTC, personal focus, and temporary reroute records. The entire penalty disappears automatically even after 21 days away. The method is for gameplay/UX signals, not server authorization.

### State boundary and consistency

`events.mjs` exports `createEventState`, `createInterferenceEvent`, `eventPhase`, `archivedEvent`, duration constants. `interference.mjs` exports `setFieldFocus`, `fieldSignalQuality`, `applyInterferenceAction`, `investigationKey`, `rerouteKey`.

`applyInterferenceAction` shares the PR-02/03 actor+operationId receipt ledger and wallet reducer, so replays cannot debit twice. Unrelated IDs/payload types trigger conflict; failed operations are not billed. A new committed field is never replaced with an event overlay: the event is a separate read-only effect on its functional strength.

**Important trust limitations:** the event scheduler, server time, account identity, event field impacts, investigation grants, catalog and financial state are all injected into a pure reducer. None are verified cryptographically here. The future backend must persist them transactionally with unique operation IDs, revision checks and permissions. This PR contains no independently authored investigation content, no browser UI, no API endpoints, no live multiplayer, and no Android performance measurements.

## Balancing review is still OPEN

The **six-day** total event length is a PROVISIONAL Work v1.1 / Gate 1 v1.2 numerical proposal, not an approval by a player. Alternative 30-hour event stays available for Gate 2 qualitative testing. Players might still feel the warning is urgent even without permanent losses; test this explicitly. Also test whether no-cost archive research makes "stabilize" worthwhile, and whether two fields/three role choices are intuitive rather than busywork.

## Acceptance testing

`node --test tests/*.test.mjs`, `node --check backend/worker.mjs`.
New unit/property scenarios exercise UTC boundaries, region cooldown, 20/40pp caps, concurrent sequential decisions, 1000 duplicate calls, personal Shelter, personal reroute, official proof grant, 21-day absence, and a field genuinely assembled with PR-03's graph reducer.

No field-hardware test or authoritative D1 concurrency proof is claimed. **Rollback:** close this branch/PR. No production files or persisted player state changed.
