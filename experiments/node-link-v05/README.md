# MAJAKKA World v0.5 — kaksi geosidottua DEMO-majakkaa ja orgaaninen 3D-yhteyssäie

**Päiväys:** 2026-11-21
**Status:** TOTEUTETTU erilliseksi kokeeksi. **Ei** tuotantopelin Node-verkko, ei pelaajan GPS, ei todellisia hyväksyttyjä Node-paikkoja. Android-tarkistus **AVOIN**.
**Kokeile:** https://naatti21.github.io/Majakka/experiments/node-link-v05/

## Mitä nyt oikeasti tapahtuu?

- Tampereen **OpenFreeMap Dark + MapLibre** -kartalla on **kaksi oikeaa 3D-Three.js-majakkaa**, jotka ovat kiinni **kahdessa erillisessä fiktiivisessä DEMO-geokoordinaatissa**.
- Molemmissa käytetään aiemmin puhelimella hyväksyttyyn 3D-karttatekniikkaan lisättyä [Relay v0.3 -majakkamuotoa](../relay-concept-lab/relay-lighthouse.js). Kahdella majakalla on pelkästään vertailun vuoksi eri koriste-/väriluokat (I–III-luokat **eivät ole vahvistettuja peliharvinaisuuksia**).
- Niiden lyhtykruunujen yhteyspisteiden välissä kulkee **oikea kolmiulotteinen, korkealla kartan yläpuolella leijuva orgaaninen säie**: tumma turkoosi runko, vaalea energiajuova, kaksi aaltoilevaa sivusäiettä sekä hitaita valopulsseja. Se ei ole karttaan maalattu 2D-viiva.
- **KATKAISE / MUODOSTA YHTEYS** vaihtaa säikeen tilaa. Säie hiipuu ja syttyy, majakat eivät liiku pois paikoiltaan. Tila on **vain tämän demon hetkellinen visuaalinen tila**, ei pelaajan varsinainen Node-verkoston tallennettu yhteys.
- **LOW/MED/HIGH** vähentää visuaalisia pulssiefektejä; ei muuta sijaintia, verkon sääntöjä tai pelikokemuksesta ansaittavaa hyötyä.
- HOME, kameran 2D/3D, pohjoisnuoli ja zoom toimivat aiempien karttatestien tavoin.

## Miten geosidonta toimii?

- Node A: `[23.7603, 61.4991]`; Node B: `[23.7627, 61.4996]`. Molemmat ovat **testikoordinaatteja**, eivät turvallisiksi varmennettuja POI-kohteita.
- `MercatorCoordinate.fromLngLat()` antaa maailmakoordinaatit; toisen majakan sijainti suhteutetaan ensimmäiseen `meterInMercatorCoordinateUnits()` -muunnoksella. Kummallakin on oma 3D-ryhmä samassa Three.js-scene:ssä.
- Säie muodostetaan muutamista ohjauspisteistä yhdellä `CatmullRomCurve3`-polulla; `TubeGeometry` tekee sen ympärille oikean tilavuudellisen poikkileikkauksen. Kaari kohoaa maailman pinnasta, ja kaikki sivuaallot lähtevät ja päättyvät samaan yhteyspisteeseen.
- **TÄRKEÄ:** säie on **yksi todellinen 3D-olio, jolla on näkyvä liike**, mutta yhteyden gameplay-kustannuksia, pituusrajoja, valoverkon vaikutusalaa, muita kaiku-/guardian-bonuksia tai pelaajan 150 m vuorovaikutussädettä ei ole toteutettu.
- Hyväksytty v0.4.2-korjaus säilyy: 3D-kerros on **karttatyylin viimeinen**, ja `renderer.clearDepth()` nollaa vain aiemmin piirretyn kartan depth-tiedon, jotta kartan mustat muodot eivät riko majakoita tai säiettä.
- Emme pyydä puhelimen GPS:ää, emmekä muuta oikean Node Atlaksen tietoja.

## QA-portti

1. [tests/node-link-v05.test.mjs](../../tests/node-link-v05.test.mjs) testaa erilliset geosidonnat, 3D-käyrät, kytkimen, kartan depth-järjestyksen ja GPS-vapauden.
2. [GitHub Actions -kuvatesti](../../.github/workflows/node-link-v05-visual-smoke.yml) renderöi Chromiumilla kytketyn ja katkaistun yhteyden sekä sivu-, ylä- ja lähinäkymän. Kuvien olemassaolo **ei yksin todista** oikeaa grafiikkaa; tarkista kuvat ja käyttöliittymän todellinen tila.
3. **Puhelintesti:** Android, zoom 15–18, kallistus 0°, 55° ja 70°, kartan 360° kierto. Säie ei saa katketa väärään paikkaan, ilmestyä kartan alle eikä peittyä kartan mustiin palasiin.
4. **Suorituskyky:** 2 Lighthouse-mallia + useita TubeGeometry-viivoja; nyt oikeaa Androidin FPS-/p99-/lämpötestiä ei vielä ole. Kerroksia vähennetään ennen kaupallistamista, jos grafiikka kuormittaa.

## Seuraava tuotantoporras

- Täsmennä, miten kahden geosidonnaisen Noden **pelillinen** yhteys syntyy ja mitä se tekee, säilyttäen turvallinen Node Atlas ja mielekäs etäpelaaminen.
- Lisää vasta sen jälkeen kolmas Node, suljettu kolmen Noden sykli ja niiden oikea vaikutusalue (peittoaluepilvi).
- Käyttäjän 21.11.2026 palaute Relay v0.3:sta: **majakka-siluetti kelpaa suunnaksi, mutta pinta ei vielä tunnu materiaalilta**, vaan kaiverrus on lähinnä ylimääräistä geometriaa. Seuraava art-vaihe käsittelee `roughness`-, `normal`- ja materiaali- sekä valon vastetta, ei vain uusia polygoneja. Tätä **EI ole vielä korjattu** tässä kokeessa eikä luvata valmiiksi.
