# MAJAKKA — VISUAL PROMPT SYSTEM v0.1
**Päivitetty 19.11.2026 · Tila: TUOTANTOOHJE, ei väite hyväksytystä Node-ulkoasusta.**

## Miksi tämä on olemassa
Käyttäjä ei ole velvollinen kirjoittamaan 3D-mallinnuksen, shadersysteemin tai kuvan luonnin yksityiskohtaista promptia. Hänen tehtävänsä on päättää, mikä näyttää oikealta; assistentti toimii **art directorina, toteuttajana ja oman työnsä kriittisenä arvioijana**, erottaen nämä vaiheet näkyviksi. Sama assistentti EI ole aidosti riippumaton arvioija. Ulkoinen kritiikki tai käyttäjän hyväksyntä on oma porttinsa.

**Lähde:** käyttäjän projektitiedosto `ABYSSAL-GARDEN-OPIT-APPEIHIN-2026-11-16(1).md`. Siirretään laadunmittausprosessi, EI kopioida Abyssal Gardenin ulkoasua, koodia, pelimaailmaa tai WebGPU-vaatimuksia.

## Sovitettu tuotantoputki
1. **Palauta konteksti:** lue `PROJECT-HANDOFF.md`, `docs/NODE-ATLAS-v0.1.md`, `docs/MAJAKKA_NODE_ART_DIRECTION_v0.1.md`, `docs/NODE_STYLE_TOKENS_v0.1.md` ja kyseisen hahmon/objektin master-referenssit. Erota HYVÄKSYTTY, EHDOTUS, PROTOTYYPPI ja TOTEUTETTU.
2. **Creative Brief:** kirjaa rooli, tarina, muoto, värin kolme tasoa, materiaalit, liike, yhteys pelimekaniikkaan, kohdeetäisyys kartalla, mobiilin laiteraja ja kolme EI-listan virhettä.
3. **Production Prompt:** anna rajatut implementaatio-ohjeet: mitä tiedostoja muutetaan, mitä pysyy ennallaan, millä renderöintitekniikalla, mitkä ovat täsmälliset DONE WHEN -ehdot. Todellinen OSM-kartta ei koskaan muutu satunnaisessa art-promptissa.
4. **Toteuta vain yksi rajattu muutos:** Node-asset / tehoste erilliseen labraan. Älä vaihda karttamoottoria, paikkatietoa tai jo Androidilla hyväksyttyä MapLibre `addLayer(layer)` + Three `clearDepth()` -renderöintiä.
5. **Toistettava havainnointi:** kuvaa 6 vakionäkymää ja tarvittaessa 6–10 s video. Mittaa grafiikan luettavuus myös pienenä, kamerakierto, zoom, läpinäkymätön ydin, värit ja siluetti. Luo mieluiten kaksi vaihtoehtoista selvästi erilaista versiota, älä geneeristä samaa kuutiota eri sävyssä.
6. **Visual Critic:** arvioi kuvia ilman toteuttajan kaunistelua käyttäen `MAJAKKA_VISUAL_CRITIC_v0.1.md`. Tuota priorisoidut viat: P0 rikki, P1 heikko laatu, P2 viimeistely. Jokaisesta yksi konkreettinen muutos eikä uusia keksittyjä pelikykyjä.
7. **Korjaussykli:** tee enintään 2 hallittua iterointia samalla kertaa, testaa uudelleen. Älä väitä tehtyä korkealaatuiseksi vain siksi että CI on vihreä.
8. **Portti:** julkaise labraan, anna käyttäjän arvioida Androidilla; hyväksytty muotokieli vasta eksplisiittisellä käyttäjäpalautteella. Päivitä `PROJECT-HANDOFF.md` vain delta.

## Prompt-template: Node-ART DIRECTOR
```text
ROLE: Majakka art director. TYPE: {Prism|Archive|Grove|Relay|Observer|Commons}.
CANON: Use NODE ATLAS type function as constraint. MapLibre Dark readable + real geography is fixed.
GOAL: A distinctive, richly colored, premium 3D game object; visually legible at zoom 15–18 and pitch 0–70°.
SILHOUETTE: {role-derived shape and 2–4 unmistakable secondary features}.
PALETTE: base {HEX} / major accent {HEX} / luminous detail {HEX} / shadow {HEX};
no single-color cyan wireframe. Give intentional warm/cool contrast.
MATERIALS: solid opaque hero body; layered contrasting shells, raised inlays,
metal/stone/bio-ceramic, luminous channels and restrained translucent aura.
MOTION: idle + subtle role-relevant pulse; energy MUST have a direction/source.
GAME READ: viewer recognizes node function without labels.
MOBILE: low-poly render path as a LOD, not low-quality final look.
FORBID: debug geometry, black map slices, see-through central body,
generic rings-only sci-fi icon, oversaturated fog obscuring streets, copied game assets.
TEST: 6 fixed screenshot angles, one short animation loop, Android QA.
OUTPUT: brief, implementation plan, files touched, risks, objective reject checklist.
```

## Prompt-template: Kaiku-ART DIRECTOR
```text
Use validated species master, Species → Form → Instance → Presentation.
Preserve every locked body mark, ears, tails, palette and expression.
MAP: recognizable economical silhouette + idle/occasional patrol.
COLLECTION GRID: crisp static high-res card.
FOCUSED CARD: 4–6s seamless animation; species' own environment matching card art.
INSPECT: optional single interactive 3D hero model, not N live-3D creatures.
Reveal must be distinctive and occasional. Respect reduced-motion and poster fallback.
Never infer a completed rig or asset from a concept card.
```

## Prompt-template: IMPLEMENTER
```text
Implement exactly the approved brief in the isolated existing Majakka lab.
Preserve stable camera, dark-readable style, 3D geoposition and depth fix.
Use module-separated maintainable Three.js; seeded procedural detail where useful.
Solid body and color/mat layers first, VFX last; effects must not hide the subject.
Add runtime fallback, mobile quality selector, smoke tests, version cache bust.
Do not change gameplay economy, live GPS, player data or underlying POI source.
Deliver GitHub commit(s), deployed URL and a truthful test report.
```

## Prompt-template: VISUAL CRITIC
```text
Review the following six fixed-view screenshots plus a short animation without
prior author explanation. Rate silhouette, color/material hierarchy, detail,
mechanical readability, map legibility, motion, and mobile cost.
List P0/P1/P2 failures and the 3 highest-impact fixes. Reject if it looks like
a low-poly debug object or uses barely any color. Distinguish screenshot evidence
from unmeasured FPS/thermal claims. Critic does not auto-approve its own output.
```

## Relay: seuraava tuotantoprompt
```text
Build "Relay — Chromatic Conduit" as a fourth, more premium comparison variant,
NOT a final approved design. Function: branching/routing connections.
Silhouette: 3 distinct outgoing sockets, solid central heart, nontrivial
carved/filigree shell. Premium palette: deep blue-green (#163A49),
porcelain teal (#31DCCF), warm coral (#FF8E74), luminous gold (#FFD99A),
violet (#8F74D9) micro-accents. Three materials and intentional warm/cool contrast.
Include elegant bright conduits, fine braided secondary geometry, small traveling
pulses and minimal ambient sparks; no giant opaque fog or fake-map terrain.
Use THREE geometry anchored in current MapLibre 3D custom layer.
Keep existing A/B/C for comparison. Add a "D · Chromatic" button only to
separate lab; no automatic canon or gameplay unlock.
Add motion quality L/M/H and fixed screenshot QA. Fail if same cyan low-poly wire
as previous or if streets become unreadable. Only user locks the design.
```
