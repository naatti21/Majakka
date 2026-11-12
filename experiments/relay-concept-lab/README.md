# MAJAKKA / Relay Concept Lab v0.1

**Päiväys:** 2026-11-12  
**Status:** kolme mallinnettua todellista 3D-luonnosta ja A/B/C-mobiilivertailu olemassa. **Mikään muoto ei ole hyväksytty Node-kanoniksi.**

**Android-linkki:** https://naatti21.github.io/Majakka/experiments/relay-concept-lab/

## Mikä on tässä kokeessa uutta?

- Vanhan [Node Atlas v0.1](../../docs/NODE-ATLAS-v0.1.md) **Relay**: valon välittäminen ja haarautuminen reittisolmujen kautta, ei uusi peliin keksitty Node-tyyppi.
- Kolme aidon 3D-geometrian versiota MapLibren todellisen kartan päällä: **A · Haara**, **B · Portti** ja **C · Kudos**.
- Valitse muoto alareunan kolmesta painikkeesta; malli vaihtuu paikan päällä, kamera ja keskus pysyvät samoina.
- Eri muodot on suunniteltu yhteyssäikeiden tulevaa lähtöpistettä silmällä pitäen.
- Hyväksytyn v0.4.2:n tumma mutta luettava karttapohja, geokoordinaatit, 3D-kerroksen viimeinen piirtojärjestys ja eristetty depth-puskuri säilyvät.
- Sijainti on **fiktiivinen DEMO-piste**. Tämä testi ei lue tai tallenna GPS-sijaintiasi. Relay ei vielä yhdistä todellisia Nodeja eikä toteuta Kyky/Talent-vaikutusta.

## A/B/C-koe puhelimella

1. Kokeile muotoja 55° kameran kallistuksella, zoom 16, sama keskipiste.
2. Vaihda 2D-tilaan ja zoomaa kauemmas (esim. 15) arvioimaan **siluetin erottuvuutta**.
3. Kierrä ja kallista karttaa 55–70° varmistaaksesi, etteivät renkaat, haarat tai nauhat peity mustiin karttaviiltoihin.
4. Mikä välittää **heti ilman selitettä** ajatuksen valon haarautumisesta? Mikä tuntuu enemmän Grove-/Prism-tyyppiseltä kuin Relaylta?
5. Kiinnitä huomiota animaation levottomuuteen ja siihen, ettei itse Noden ydin ole läpinäkyvä.
6. Kerro A, B, C tai niiden yhdistelmä ja miksi. **Emme vielä lukitse mitään ennen palautetta.**

## Arkkitehtuuri

- [index.html](index.html): samanlainen MapLibre-karttapohja ja kamerakontrollit kuin hyväksytyssä v0.4.2:ssa.
- [relay-3d.js](relay-3d.js): Three.js + MapLibre custom layer, 3 konseptia; vain yksi näkyy kerrallaan. Rakenne ei vaadi 3D-kaupunkimalleja.
- [tests/relay-concept-lab.test.mjs](../../tests/relay-concept-lab.test.mjs): 3 mallin, oikean geo-3D:n, karttatyylin ja piirtojärjestyksen staattiset regressiotestit.
- [.github/workflows/relay-lab-visual-smoke.yml](../../.github/workflows/relay-lab-visual-smoke.yml): headless WebGL -kuvakaappaukset jokaisesta vaihtoehdosta automaattisesti; **ei korvaa Android-käyttäjätestiä**.

## Seuraava vaihe

Yhden Relay-muodon valinta, hienompi visuaalinen mallinnus ja idle/herääminen/haarautuminen. Sitten kaksi Nodea + yksi todellinen ilmassa leijuva orgaaninen yhteyssäie ja sitä vastaava pelillinen valintatapa. Muut viisi Node-tyyppiä suunnitellaan oman vaikutuksensa pohjalta.

Tämä kokeilu on eri hakemistossa kuin aiempi `experiments/maplibre-world-v04/`; toimivaa hyväksyttyä vertailuversiota ei korvattu.
