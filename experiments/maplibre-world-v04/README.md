# MAJAKKA World v0.4 — ensimmäinen geosidottu 3D-Node

**Päiväys:** 2026-11-11
**Status:** toteutettu selaimen kehityskokeilu / GitHub Pages -julkaisu; **Androidin visuaalinen ja suorituskykyhyväksyntä AVOIN**.

**Avaa:** https://naatti21.github.io/Majakka/experiments/maplibre-world-v04/

## 2026-11-11 — v0.4.1: liian läpinäkyvän Noden korjaus

**Käyttäjän fyysiset Android-kuvat v0.4:stä:** kartta, kamera ja geosidottu Node näkyivät, mutta Node oli **liian läpinäkyvä ja heikkokontrastinen**. Keskimmäinen ydin näytti haalealta, ja wireframe-renkaat sekä puoliläpinäkyvä valopylväs kilpailivat sen kanssa. Tämä on **visuaalinen hylkäys / korjauspyyntö**, ei v0.4:n hyväksyntä.

**TOTEUTETTU v0.4.1, ANDROID-VISUAALITESTI AVOIN:**
- Noden pääydin on nyt `MeshBasicMaterial`-materiaalia, jossa `transparent:false`, `opacity:1`, `depthWrite:true` ja `depthTest:true`. Kahdeksan tahkoa on toteutettu itsenäisillä, näkyvän turkoosin eri sävyisillä vertex-väreillä. Tämä on edelleen **aitoa kolmiulotteista geometrianäyttöä**, ei kuvatiedosto tai litteä marker.
- Uusi kiinteä kirkas sisäkide tukee siluettia; kaksi paksumpaa rengasta on myös läpinäkymätöntä geometriaa.
- Hento ulkokuori jää läpikuultavaksi tukiefektiksi (`opacity:0.40`), mutta etualan ydin ei.
- Valokeila `opacity:0.12`, maahan piirtyvä rengas `opacity:0.19`, ympäröivä 3D-aura `opacity:0.028`. Valot eivät enää saa peittää itse esinettä.
- Korkeus madallettu 42 metristä 34 metriin ja leijuntaliikkeen amplitudi 2,3 metristä 1,6 metriin, jotta ydin ja sen valo pysyvät yhtenäisenä kokonaisuutena.
- Karttatyyli, geosidottu piste, MapLibre-kamera ja perus-NODE-kytkin pysyvät ennallaan. HTML-vahvistus `World v0.4.1` ja 3D-moduulille uusi cache-versio `?v=041`.
- `tests/world-v04.test.mjs` sisältää uuden varmistuksen kiinteästä kristallimateriaalista. GitHub-kooditestit menivät läpi, **mutta tämä ei todista vielä puhelimella näkyvää 3D-laatua**.

**Laatuportti:** tärkein tarkistus seuraavassa Android-kuvassa on kiinteä luettava kristallisiluetti kallistuksilla 0–70° ja kameran pyörityksen aikana. Läpikuultaviksi jätetään vain halo/valopilari, ei koko Nodea. Kun laatu on oikea, edetään suunniteltuun Flintailin 3D-prototyyppiin ja myöhemmin tarkkaan looppaavaan Kaiku-korttiin.

## 2026-11-12 — v0.4.2 / Render Clean — mustat karttaviillot Noden päällä

**Vika todettu käyttäjän Android-kuvassa v0.4.1:** Noden läpinäkymätön turkoosi runko on jo aiempaa parempi, mutta **mustat kartan muodot / viillot peittävät sen keskeltä**. Tämän korjaaminen on ehdoton portti ennen Kaikujen 3D-renderöintiä. Screenshot ei yksin todista täsmällistä GPU-mekanismia, mutta koodista löytyi kaksi renderöinnin riskikohtaa.

**TOTEUTETTU v0.4.2 / fyysisen Androidin kuvatesti AVOIN:**
1. `map.addLayer(layer, firstLabel)` korvattiin `map.addLayer(layer)`-kutsulla. 3D-Node piirretään **viimeisenä MapLibre-tyylitasona, myös karttanimien jälkeen**. Maanpinnan DEMO-hehku on edelleen alempana.
2. Three.js:n renderöintiin lisättiin `renderer.clearDepth()` heti `renderer.resetState()`-kutsun jälkeen ja **ennen** `renderer.render()`-kutsua. Tämä tyhjentää kartan aiemmin kirjoittaman **syvyyden, ei kartan värejä**, jolloin kristalli ja sen 3D-renkaat voivat käyttää omaa ehjää syvyysjärjestystään.
3. HTML-otsikko `v0.4.2`, moduuliviittaus `node-3d.js?v=042` pakottaa Android-selaimen lataamaan korjatun koodin vanhan välimuistin sijasta.
4. `tests/world-v04.test.mjs` varmistaa, ettei 3D-Nodea työnnetä enää ennen kartan nimiä ja että syvyyspuskuri nollataan ennen Three.js-piirtoa.

**Tietoinen kompromissi:** Tässä prototyypissä 3D-Node on aina karttatasojen **edessä**. Tällä saadaan ehjä ja luettava 3D-siluetti ilman mustia karttaviiltoja. Tämä **ei vielä ratkaise** oikeaa maasto-/rakennuspeittymistä eli sitä, että katveen pitäisi joskus piilottaa Node. Pelin valmiissa maailmassa peittyminen ratkaistaan erillisellä hallitulla 3D-depth-polulla, ei palauttamalla mustat viillot.

**Laatuportti:** testaa sama geokoordinaatti oikealla Androidilla: 55° ja 70° kallistus, 360° kierto, zoom 15–18, sekä NODE päälle/pois. Runko ja renkaat eivät saa rikkoutua mustiin paloihin. Karttatekstit ja tiet säilyvät muualla luettavina. **Pelkkä vihreä CI ei todista, että grafiikkavirhe olisi poistunut puhelimella.**

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
