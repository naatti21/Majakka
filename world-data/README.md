# Gate 2 / PR-05 — published world-catalog policy, fixture-only pilot

**Proposed policy / not a live global POI feed.** This branch is stacked on Gate 1 PR-04. No edit to main, PWA map, legacy localStorage, or Worker.

`world-data/catalog-policy.mjs` validates immutable Majakka IDs, exact coordinates, source aliases, source attribution/licence-review labels, distinct real vs fictional regional records, and public-access vs remote-only flags. A publishable real place must have an explicit accepted source; every non-public place defaults to remote-only by editorial decision. Sensitive place classifications are rejected. Real safety vetting and OSM/Overture licensing are NOT accomplished by this structural check; content ingestion remains Gate 3 work.

`kind='test_site'` is allowed **only** by calling `validateCatalog(fixture,{allowFixtures:true})` with `fixtureOnly:true`. No synthetic scenario marker represents an actual safe physical destination or an OSM feature; they must never be copied to live production catalog.

Regional phenomena are published, labelled **Fictional regional signal**, remote-only, with at most one per region ID. They are canonical signals, not site recommendations or viewport-spawned POIs.

`assessCoverage(catalog,home,{authoredResearch})` checks three reachable records within a *provisional* 50 km radius and at least one within 5 km; remote cases explicitly require verified authored research before pilot readiness. Coverage gaps report **INSUFFICIENT_PUBLISHED_SITES** or **MISSING_AUTHORED_RESEARCH**, never fabricate a monument or mark a region ready by assertion.

Fixtures: `tampere.json` (four labelled synthetic reference sites), `rural.json` (one fictional phenomenon plus two synthetic remote nodes), `worldwide.json` (five global/geodesic synthetic nodes). All are for automatic tests and authoring only. They are not proof of worldwide OSM density or GIS/H3 publication policy.

Gates still OPEN: stable canonical H3 region IDs and real GIS dedupe; access review, licence compliance, genuine geolocated POI ingestion, 0/1/3 node multi-region surveys, real rural usability, player-driven safety reports. No new real POIs were invented or generated. Rollback: close draft PR branch.
