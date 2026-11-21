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

## 2026-11-19 — Chromatic Conduit D, korkeampi graafinen laatu

**TOTEUTETTU ERILLISEEN LABRAAN / EI HYVÄKSYTTY NODE-KANONIKSI.** Uusi D · Värit on vertailuvaihtoehto vanhoille A/B/C-muodoille. Värillinen runko yhdistää syvän merensinisen keramiikan, kirkkaan turkoosin, korallin, kullan ja violetin. Kolme vahvaa ulostuloporttia, kohotetut pintadetaljit, metallikehykset, kiinteä monitasoinen ydin ja matkustavat energiapulssit korvaavat aiemman yksivärisen debug-estetiikan. Yhteyssäikeiden oikeaa pelilogiikkaa EI ole toteutettu.

**KÄYTTÖ:** https://naatti21.github.io/Majakka/experiments/relay-concept-lab/ — painike D · Värit. LOW/MED/HIGH muuttaa lisäefektejä; esineen perussiluetti ja rooli pysyvät. URL-vertailukameran parametrit: ?concept=chromatic&zoom=17.1&pitch=55&bearing=-15&quality=medium.

**TEKNIIKKA:** Entinen toimiva Dark-readable MapLibre ja Three.js CustomLayer säilytetty, samoin viimeiseksi piirtäminen ja clearDepth-korjaus. Tämä on vain fiktiivinen DEMO-koordinaatti, ei GPS:ää. Uusi renderöinti tehdään kerroksellisilla Three.js-materiaaleilla, eikä Abyssal Gardenin grafiikkaa tai koodia kopioida.

**LAATUPORTTI:** Testissä 6 kiinteää Chromatic-kamerakulmaa ja A/B/C-vertailukuvat; staattiset kooditestit ovat erikseen. Oikean Androidin FPS, lämpö, sähkönkulutus ja käyttäjän visuaalinen hyväksyntä ovat AUKI.

**Tuotanto-ohjeet:** [Visual Prompt System](../../docs/MAJAKKA_VISUAL_PROMPT_SYSTEM_v0.1.md), [Visual Critic](../../docs/MAJAKKA_VISUAL_CRITIC_v0.1.md), [Node Style Tokens](../../docs/NODE_STYLE_TOKENS_v0.1.md).

## 2026-11-21 — Relay v0.3 / Majakka (toteutettu koodiin)

**Käyttäjän art direction:** Node on majakkasukuinen beacon — ei monia rönsyäviä energiahaaroja eikä geneerinen scifi-artefakti. Käyttäjä halusi hienon pintakuvion ja laatua viestivät värit ja yksityiskohdat. **Tämä korvaa D:n tavoitellun lopullisen muotokielen, mutta D ja A/B/C jätetään vertailukelpoisina kokeina.**

**TOTEUTETTU LABRASSA:** Uusi **E · Majakka** on oletusvalinta. Se koostuu vakaasta 12-sivuisesta jalustasta, ylöspäin kapenevasta yhtenäisestä tornirungosta, kaiverretuista koristeaiheista, kolmesta kulkevasta energiauomasta, värillisesti korostetuista metallisista reunoista, kolmesta valoa välittävästä kruunuikkunasta ja katosta/huipusta. 3D-geometria on oikeaa Three.js-verkkoa, ei kuvapohjainen sprite. Profiilin monimutkaisuus pysyy enimmäkseen **pinnassa**, ei leveissä ulokkeissa.

**Käyttö:** https://naatti21.github.io/Majakka/experiments/relay-concept-lab/?concept=lighthouse&grade=3

- **E · Majakka:** uusin luonnos. A/B/C/D edelleen mukana.
- **Pintalaatu I–III:** suunnitteluesimerkki, jossa värit ja koristeet muuttuvat. **Ei lukittu rarity/taloudellinen pelimekaniikka**; ei vaihda Node-tyyppiä tai pelillisiä kykyjä.
- **LOW / MED / HIGH:** erillinen graafisten lisähiukkasten laatutaso; ei koske Node-laatua.
- Kartan kameran 2D/3D-, zoom-, kierto- ja HOME-toiminnot säilytetty.
- DEMO-koordinaatti ei ole varmennettu fyysinen Node, eikä GPS:ää kerätä.

**UUSI LÄHDE:** `relay-lighthouse.js` rakentaa E-majakan. `relay-3d.js` hallitsee versioiden vaihtoa ja säilyttää hyväksytyn v0.4.2-renderöintikorjauksen (`map.addLayer(layer)`, `renderer.clearDepth()`). HTML-versioitu moduuli `?v=004`; Lighthouse-moduuli `?v=030`. Tests mukana `relay-concept-lab.test.mjs`.

**VISUAALINEN PORTTI:** Chrome-kuvat 6 kulmasta sekä pintalaatu I/II/III -vertailu, käyttäjän Android-arvio, tarvittaessa mitattu FPS/ruutuajan p99/akku. Staattisten testien läpäisy EI ole sama kuin valmis laatuhyväksyntä. Seuraavaksi yksi rajattu kaiverrusten/materialien ja kruunun viimeistely Android-kuvien perusteella.
