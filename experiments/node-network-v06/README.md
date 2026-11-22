# MAJAKKA WORLD v0.6 — kolme erilaista majakkaa ja muodostuva 3D-valoverkko

**Päiväys:** 22.11.2026
**Tila:** Koodattu prototyyppi erillisessä kokeilussa; Androidin visuaalinen hyväksyntä avoin.
**Kokeile:** https://naatti21.github.io/Majakka/experiments/node-network-v06/

## Mitä tässä toteutettiin?

- **Kolme erilaista oikeaa 3D-majakkaa** Tampereen kuvitteellisissa DEMO-koordinaateissa MapLibren OpenFreeMap Dark -kartalla:
  - **Relay / Copper Beacon** — lämmin kuparirunko, patina, kolme valoaukkoa.
  - **Grove / Moss Beacon** — sammaleinen kivirakenne ja orgaanisempi lyhtykruunu.
  - **Prism / Porcelain Beacon** — hoikka posliinitorni ja optinen kolmilasin kruunu.
- Kunkin mallin **oman profiilin, PBR-materiaalin ja kruunun** lähde on [node-family-v01](../node-family-v01/). Nämä ovat ensimmäisiä art direction -ehdotuksia, eivät loppuun hyväksyttyjä Node-canon-asetteja.
- **Kolme erillistä orgaanista, ilmassa kaartuvaa Three.js-valosäiettä**, jotka kytkevät kolme Nodea kolmioksi. Jokaisella säikeellä oma geometrian muotoinen kaari, ohut vaalea ydin, hillittyjä sivusäikeitä ja liikkuva valopiste. Ei tasainen 2D-karttaviiva.
- **Vaiheet 0/3, 1/3, 2/3, 3/3:** ensin ei linkkejä, sitten Relay–Grove, sitten Relay–Prism ja lopuksi Grove–Prism. Painike **HERÄTÄ VERKOSTO VAIHEITTAIN** toistaa koko etenemisen.
- LOW/MED/HIGH rajaa säikeiden lisäefektejä ja piirron päivitystaajuutta. Kiinteät 3D-Node-mallit ja niiden karttapaikat säilyvät.
- Säikeet ilmestyvät ja hiipuvat asteittain. Käyttäjä voi tutkia 2D/3D-kallistaen, kiertää kameraa ja zoomata. Sovellus ottaa huomioon `prefers-reduced-motion`-asetuksen.

## Mikä ei ole vielä toteutettu?

- **Ei pysyvää Node-verkkotietokantaa**, kilpailua, Lumen-kustannuksia, Guardian-bonuksia, taloutta, näkyvyys-/peittoaluelaskentaa tai oikeaa linkin hyväksyntäsääntöä.
- **Ei 150 metrin pelaajan toimintamatkaa** eikä GPS:ää. Kaikki kolme ankkuria ovat pelkkiä mallin testausta varten valittuja DEMO-pisteitä; niitä **ei ole hyväksytty** todellisiksi turvallisesti saavutettaviksi POI-paikoiksi.
- **Ei peittoaluepilveä** vielä. Se toteutetaan vasta, kun kolme linkkiä, syvyysjärjestys ja mobiilisuorituskyky ovat kunnossa. Peittoalueen visuaalin ei tarvitse vastata vielä pelillistä peittoalgoritmia.
- **Ei uusia pintatekstuureja**: tässä käytetään jo aiemmin laadittua proseduraalista perhemallia, jotta yksi kokeilu ei testaa kaikkea kerralla.

## Tekniset rajat

- Kumpikin moduuli on erillinen, lähteet [index.html](index.html) + [network-world.js](network-world.js).
- `MercatorCoordinate.fromLngLat` ja `meterInMercatorCoordinateUnits` pitävät objektit oikeissa suhteissa geodemo-koordinaatteihin.
- Kolme materiaalista mallia rakennetaan yhden jaetun ambient/key/fill-valoryhmän alle; yhden majakan omat lyhtyvalot jäävät erikseen. Tämä on kevyempää kuin kolme täyttä valoryhmää. Verkon ollessa näkyvissä kaikki mallit ovat samassa Three.js-scenessä.
- Tumman kartan tiet ja nimet säilyvät luettavina. Kartan 3D-kerros lisätään viimeisenä ja `renderer.clearDepth()` tehdään ennen Three.js-piirtoa, kuten hyväksytyssä v0.4.2:ssa.
- Verkon animaatio käyttää säädeltyjä uudelleenpiirtopyyntöjä ja vapauttaa geometriat sekä PBR-tekstuurit poistettaessa.
- `?stage=0|1|2|3`, `zoom`, `pitch`, `bearing` ja `quality=low|medium|high` sallivat automaattiset vertailukuvat. Oletus `stage=3` näyttää heti valmiin demon; nappi toistaa muodostumisen.

## Laatukriteerit

1. **Kolme todella erinäköistä majakkaa** erottuu kartalla ja niiden välillä näkyy ilmassa kaartuva todellinen 3D-säie.
2. **0/3 vs 3/3** muuttuu oikeasti myös kuvassa. Kun yhteydet katkaistaan, majakat pysyvät paikoillaan.
3. Ei mustia MapLibre-karttaviiltoja mallien tai säikeiden yli; testaa kallistus 0°/55°/70° ja kierto.
4. Kolmen Noden lukumäärällä kartan luettavuus säilyy; myöhempi 10 Node -stressitesti eri vaihe.
5. Testaa puhelimella värien ja pintojen ero, animoinnin rytmi, zoom 15–18, lämpö ja viive. Automaattinen JS- ja Chromium-WebGL-testisavutus ei ole Android-laatutakuu.

**Seuraava ominaisuus tämän hyväksynnän jälkeen:** pehmeä, hengittävä, **ilmassa leijuva peittoaluepilvi** kolmion sisällä. Erotettava pelillisen vaikutusalueen laskenta ja pelkkä visualisaatio.
