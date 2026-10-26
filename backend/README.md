# Majakka Echo World API — v0.10 (NOT deployed)

This is a separate Cloudflare Worker + D1 backend for a narrow *shared Echo* pilot.
**It is not connected to an online database yet.** Never reuse the Tuntiseuranta
Supabase project; Majakka must own an isolated database.

## Supported
- `GET /v1/health`: backend status, whether writes are enabled.
- `GET /v1/nodes?ids=atlas-echo-GX-GY,...`: authoritative shared node charges
  (0 dormant, 1 resonating, 2 awake). Up to 24 world-fixed Echo IDs per request.
- `POST /v1/session`: issue signed private, accountless pilot session, initially 6 Lumen.
- `GET /v1/wallet`: authoritative wallet balance (Bearer token).
- `POST /v1/channel`: earn 2 Lumen without moving; 120s cooldown, max 36/day,
  wallet cap 20. Requires `operationId` (UUID).
- `POST /v1/attune`: contribute +1 to a valid Echo anywhere in the world,
  spending 2 Lumen. One contribution per player per Echo; two *different*
  pilot identities can awaken a node. Requires `operationId` and `nodeId`.
- Idempotency: repeating a UUID does not spend twice. All writes use a D1
  transactional `batch` with conditional ledger effects.
- No route/GPS/home coordinates stored or uploaded to the Majakka API.
  Echo ID reads and actions can nevertheless reveal coarse regions of interest.

## Security gates (important)
`MUTATIONS_ENABLED = "false"` is the default. **Do not enable publicly**
until user registration, Sybil resistance, abuse/rate limiting, retention policy
and permission/safety review are completed. Anonymous pilot session creation
cannot prevent one person from manufacturing multiple players: it is only
suitable for a controlled/private pilot. The 30-day bearer token is saved
in localStorage: losing browser data loses that session's wallet.
The project does not yet sync wallets with the older local 12-node game.
The shared pilot wallet has its own labeled status and remains separate.

## Local setup — only after choosing a dedicated Cloudflare account/database
From `backend/`:
1. Use Cloudflare's current Wrangler CLI. Create **a dedicated** D1 database:
   `npx wrangler d1 create majakka-echo-alpha`
2. Copy `wrangler.example.toml` to `wrangler.toml` and insert the real
   D1 UUID returned above. Do **not** commit secret or key material.
3. Apply the schema to the **local** test database:
   `npx wrangler d1 migrations apply majakka-echo-alpha --local`
4. Create a development secret using the Wrangler dev env file
   (never commit `.dev.vars`): `SIGNING_SECRET="<random-32+-char-secret>"`.
   For deployment, set the same using `npx wrangler secret put SIGNING_SECRET`.
5. Start locally with `npx wrangler dev`. Validate `/v1/health`,
   24-node query rejection, cross-origin rejection, and mutation-disabled 503.
6. For a *private* test only, set `MUTATIONS_ENABLED="true"` locally and
   test two different sessions: channel Lumen, each spend two Lumen
   on the SAME Echo, both get charge 2; retry a duplicate UUID, balance unchanged.
7. Deploy only once privacy and abuse gates are satisfied. Point the PWA
   to the Worker **HTTPS origin** in the `majakka-api` meta element of
   `index.html`. Only then will shared actions be shown.
   `ALLOWED_ORIGIN` must exactly match the frontend origin.
8. Test two phones/browsers; server must be the sole source of shared charge.

## Tests / restrictions
`node --test tests/shared-echo-api.test.mjs tests/atlas-core.test.mjs
tests/unified-world.test.mjs` from repo root checks the code and the
read-only contract. **It does not replace a Wrangler D1 integration test.**
The Worker code and database have not been field-tested on Cloudflare yet.
Production geography data, user accounts, shared threads/fields, conflict
reconciliation, anti-cheat and multiplayer aggregation remain for later milestones.
