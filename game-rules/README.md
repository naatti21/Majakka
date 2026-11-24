# Majakka Gate 1 / PR-01

Candidate-only pure rules. No module is loaded by the game, service worker or backend.
Base: main `9a7f90effbe7d71c788259aca47a53fe24acfb7a`.

## API

`distanceKm({latitude,longitude}, {latitude,longitude})` validates finite numeric degrees (latitude ±90, longitude ±180) and returns the shortest great-circle distance on the 6371.0088 km sphere. This is a spherical model, not an ellipsoid survey. `e(nonnegativeKilometres)` reads the unmodified v1.2 candidate keypoints and exponential tail from `balance-config.json`. No coordinate or effectiveness comes from camera/GPS flags. Callers must supply canonical geometry and an approved action centre; this pure library does not authenticate them.

`linkId(a,b)` and `fieldId(a,b,c)` accept opaque published world IDs, reject duplicates and malformed strings, sort by specified ECMAScript UTF-16 order, then use a versioned namespace and JSON array encoding. No locale sort, coordinate hash, Unicode normalization or delimiter ambiguity. They identify topology only: they do NOT prove awakening, committed edges, a real field or server authorization. JSON escaping preserves valid non-ASCII IDs. Existing node identity assignments are untouched.

Runtime: checked on Node 24.19.0. JSON import attributes require a supported modern runtime; this is not wired to old browser clients. Cross-browser identity execution was not run; exact literal vectors document the portable byte contract. No DOM, storage, network, server mutation or time dependency.

## Configuration and source precedence

`balance-config.json` is byte-identical to supplied `balance-candidate.v1.2.json`; status remains `CANDIDATE_FOR_TESTING_NOT_APPROVED`. Only efficiency fields are used in PR-01. Wallet, relay, link work, research, interference and field formation are later steps, not silently implemented here.

Original Gate 1 package files are preserved under `docs/gate1-v1.2/`. The supplied single-source rules and C01–C12 conflict log take precedence for this candidate. Work's original Foundation, separate 03/04, v1.1 config and COMPLETE_DESIGN files were not present in this checkout or attachment. They could not be independently read; no alternative numbers were inferred. This remains a source-review limitation before acceptance, not a claim that source conflicts are finally approved.

## Evidence

Commands run locally:

- Before changes: `node --test tests/*.test.mjs`: 134 PASS, 0 FAIL, 0 SKIP.
- New tests: `node --test tests/game-rules-*.test.mjs`: 9 PASS, 0 FAIL, 0 SKIP.
- Combined: `node --test tests/*.test.mjs`: 143 PASS, 0 FAIL, 0 SKIP.
- `node --check backend/worker.mjs`: PASS, file unmodified.

Seed `0x15012026`, unsigned 32-bit LCG, 10,000 pairs. Independent reference uses unit-vector cross/dot `atan2`, tolerance 1e-6 km (1 mm); symmetry 1e-9 km; analytic distance checks 1e-8 km. E keypoints 1e-10 absolute; boundary probes ±1e-7 km with 1e-8 effectiveness tolerance. Deterministic monotonic sweep 0..40,000 km in 0.5 km steps. Covers dateline, poles, antipodes, malformed input, Unicode/collision cases and every field permutation. No tolerance claims Earth-model surveying accuracy.

No Android, player UX, live backend atomicity or publication validation. Existing tests were not changed. Main functionality and v0.11.5 remain untouched. Rollback: discard this feature branch or revert its additive commit; there is no state migration or persisted data to undo.
