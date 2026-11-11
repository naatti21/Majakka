# MAJAKKA World v0.4 — ensimmäinen geosidottu 3D-Node

**Päiväys:** 2026-11-11
**Status:** toteutettu selaimen kehityskokeilu / GitHub Pages -julkaisu; **Androidin visuaalinen ja suorituskykyhyväksyntä AVOIN**.

**Avaa:** https://naatti21.github.io/Majakka/experiments/maplibre-world-v04/

## Mikä on oikeasti toteutettu

- **Kartta**: käyttäjän valitsema `Dark · tiet ja tekstit näkyviin` oletustyyli, MapLibre GL JS 6.15.0 + OpenFreeMap Dark, alkuperäisen v0.3-kokeen kanssa sama katu- ja nimikontrastin määritys.
- **Yksi Node (DEMO)**: procedural Three.js **oikea 3D-geometria** (oktaedriydin, moniulotteinen kuori, torus-rengaskehät, valopilari), leijunta ja hitaat pyörimiset, MapLibren jaettu WebGL2-canvas ja `CustomLayerInterface` `renderingMode:'3d'`.
- **Geosidonta**: vakioidut DEMO-koordinaatit `[23.7603,61.4991]` syötetään `MercatorCoordinate.fromLngLat`-funktiolle ja metriyksiköiden muunnos lasketaan `meterInMercatorCoordinateUnits()`-metodilla. 3D-matriisi käyttää `args.defaultProjectionData.mainMatrix`-projektioarvoa. Ei 2D-kuvabillboardia tai kartan päällä vapaasti kelluvaa HTML-merkkiä.
- **Kartalla Node-hehku**: hillitty 2D circle layer suoraan maantieteelliseen koordinaattiin sidottuna tukiefektinä. Tämä ei ole oikeaa maastogeometriaan kohdistuvaa valaisua, mutta **3D-Node on aito**.
- **Käyttöliittymä**: kevyt mobiilipaneeli, +/−, HOME, 2D/3D-kallistus, N ylös, NODE näkyviin/pois. Ei GPS:ää, 3D-rakennuksia tai muita pelitilejä.
- **Virhetilanne**: jos Three.js-moduuli tai 3D WebGL-kerros epäonnistuu, kartta jää käyttöön ja virhe näytetään.

### Mitä EI vielä toteutettu

- **Ei 3D-Flintailia**. Hyväksyttyjen Art Master -referenssien löytyminen ja niiden perusteella mallinnettava rigattu hahmo on oma seuraava laatuportti. Älä väitä satunnaista geometrista kokeiluhahmoa lopulliseksi Flintailiksi.
- **Ei** orgaanisia, ilmassa leijuvia Node-yhteyssäikeitä tai peittoaluepilviä (ks. `docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md`). Toteutus v0.5 ja v0.6+ vasta perustan jälkeen.
- **Ei** korkealaatuista 4–6 s loopattua Flintail-kokoelmakorttia. Korttivaatimus kirjattu `docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md` kohtaan 8A.
- Ei tuotantopalvelua, live-Nodejen todellista sijaintitietoa, GPS:ää, tilisidontaa tai kaupallisen karttatiilipalvelun sopimusta.
- 3D-jalokiven valo ei valaisee MapLibren rakennuksia fyysisesti; kyseessä on erillinen 3D-hahmon ja maahan piirrettävän hehkun kokeilu.

## Ennen hyväksyntää testattava Androidissa

1. Näkyykö **oikea kolmiulotteinen turkoosi Node** kartalla (monitahoinen ydin, kaksi kiertävää rengasta, pystysuuntainen säde) ja liikkuuko se hillitysti? Se on tietoisesti suuri DEMO-beacon.
2. Liikkuuko Node **täsmälleen** kartan mukana yhden sormen siirrossa, kahden sormen nipistyszoomissa, kierrossa ja kallistuksessa?
3. Pysyvätkö Tampereen tiet ja katunimet hyvin näkyvissä sekä 2D- että 3D-näkymässä?
4. Pysyykö liike sulavana 30–60 sekunnin ajan? Jos tulee virhe, ota kuva myös alareunan statusviestistä.
5. Vertaa NODE-painikkeella samaa karttaa 3D-hahmon kanssa ja ilman. Ei valon tai hahmon irtoamista oikeasta sijainnista.

## Tekniikan lähteet

- https://maplibre.org/maplibre-gl-js/docs/examples/add-a-3d-model-using-threejs/
- https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/
- https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput/
- https://www.openstreetmap.org/copyright

**Seuraava vaihe:** käyttäjän mobiilikuvan palaute ja 3D-prototyypin viimeistely; sitten Flintailin hyväksyttyyn master-taiteeseen pohjautuva 3D-malli. Ei palautusta Godotin itse tehtyyn rasteri- tai karttamesh-maailmaan. Hahmokorttien näyttävä looppi rakennetaan erikseen.
