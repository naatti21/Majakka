# MAJAKKA — Beacon Material Family Lab v0.1

**21.11.2026 · TOTEUTETTU kokeilu / EI kanoninen Node-design.**
**Kokeile Androidilla:** https://naatti21.github.io/Majakka/experiments/node-family-v01/

Tavoite on käyttäjän erikseen korostama: **kaikki näyttävät edelleen majakoilta, mutta koko rakennus, kruunu ja ennen kaikkea materiaali saavat olla omanlaisensa**. Erilainen pintamateriaali tarkoittaa oikeaa värin, karheuden, pienkohokuvion ja valonheijastuksen variaatiota, EI vain perussylinteriin liimattuja lisäosia. Kuuden majakan roolit perustuvat alkuperäiseen [Node Atlakseen](../../docs/NODE-ATLAS-v0.1.md).

| Pelirooli | Ensimmäinen materiaali- ja arkkitehtuuriehdotus | Kruunun ominaisuus |
| --- | --- | --- |
| Prism | Porcelain / hoikka lasitettu kahdeksankulmainen keramiikkamajakka | kolme optista värillistä taittopaneelia |
| Archive | Stone / leveä ja järeä kerrostunut kivimajakka | kivinen lyhtyhuone + lämmin muistovalo |
| Grove | Moss / epäsymmetrinen, sammalen valtaama kivimajakka | siemenkotamainen suojalyhty |
| Relay | Copper / elegantti patinoitunut metallimajakka | kolme suunnattua yhteysvaloaukkoa |
| Observer | Pearl / Mineral / kapea hohtava mineraalimajakka | yksi kauas katsova linssi |
| Commons | Timber / nelikulmainen puurakenteinen majakka | avoin nelisivuinen, yhteistä valoa kantava kruunu |

**Nämä eivät ole käyttäjän hyväksymiä lopullisia 1:1-tyyppisidoksia.** Muitakin yhdistelmiä voi myöhemmin käyttää, eikä rakennuksen materiaali itsessään merkitse laatutasoa tai harvinaisuutta. Tässä annettu kuusikko tekee suunnittelun erojen testaamisesta konkreettista.

## Oikeasti tehty

- [beacon-materials.js](beacon-materials.js) luo lokalisti **kolme erillistä proseduraalista tekstuurikarttaa** jokaiselle materiaalille: *albedo (värisävy)*, *roughness (mikrokarheus)* ja *bump (pienkohokuvio)*. Kiven huokoinen ladonta, sammaleen laikut, puun syyt ja oksakohdat, posliinin hienosäröt, kuparin patina ja helmiäisen kerroksellinen väri syntyvät ilman lisäosia tai ulkoisia kuvalatauksia.
- [beacon-model.js](beacon-model.js) tekee kuusi erilaista **rakennusprofiilia, poikkileikkausta ja kruunua**; ydin on kiinteää Three.js-geometriaa, ei läpinäkyvä hologrammi. Pinnan Three.js-standardimateriaali heijastaa valoa materiaalin ominaisuuksien mukaan. Helmiäisellä `MeshPhysicalMaterial`/iridesenssi.
- [beacon-layer.js](beacon-layer.js) piirtää **vain yhden majakan kerrallaan** oikeana MapLibre CustomLayer 3D:nä samaan fiktiiviseen DEMO-koordinaattiin. Vaihdossa edellisen mallin geometriat, materiaalit ja GPU-tekstuurit vapautetaan. Hyväksytty `renderer.clearDepth()` ennen Three.js-renderöintiä ja `map.addLayer(study)` karttatyylin viimeisenä kerroksena säilyy.
- [index.html](index.html) antaa kuuden tyypin mobiilivalinnan sekä HOME/zoom/2D/3D/kierto/LOW-MED-HIGH. `?type=relay` tai `?type=commons` avaa suoraan toivottuun materiaaliin. `zoom`, `pitch`, `bearing`, `quality` tukevat kuvatestejä.
- Ei GPS:ää, ei oikeaa Atlas-POI-kohdetta, ei Nodejen pelillisiä kykyjä, ei aktiivista taloutta. Vanha hyväksytty v0.4.2, v0.5-yhteyssäie ja Relay v0.3 pysyvät muuttumattomina.

## Android-laatuportti

1. Kokeile kuutta majakkaa vuorotellen, **zoom 17–18, kallistus 55°**, ja kierrä karttaa. Erityisesti Copperin patina, Stone-kiven ladonta, Timberin puunsyyt sekä Porcelainin lasite pitää erottaa myös läheltä.
2. Palaa zoomiin 15–16: rungon ja kruunun pitää olla edelleen majakka, eikä kaikkien mallien pidä näyttää samalta.
3. Tarkista, etteivät mustat karttakerrokset viillä runkoa tai kruunua.
4. Katso LOW vs MED: visuaalisen pinnan luonne säilyy, vaikka tekstuurin tarkkuus pienenee. **Mitattua FPS-/p99-/akku-/lämpödataa ei vielä ole.**
5. Vertaa käyttäjän lähettämään kuvan inspiraatioon: **erilaiset rakennusmateriaalit + omanlaiset kruunut** ilman fantasia-artefaktin ulokekasaa.

## Ohjelmallinen laatuvarmistus

- [tests/node-family-v01.test.mjs](../../tests/node-family-v01.test.mjs) tarkistaa tiedostojen JS-syntaksin, kuusi arkkitehtuuria, PBR-pintakanavat, yhden mallin kerrallaan, GPU-muistin vapautuksen, geosidonnan ja WebGL-syvyyden.
- [GitHub Actions -visuaalitesti](../../.github/workflows/node-family-v01-visual-smoke.yml) ottaa Chromiumin WebGL-renderöimät pääkuvat kaikista kuudesta sekä Prism/Relay-lähikuvat. Kuva-artefaktit eivät korvaa fyysisen Androidin hyväksyntää.
- Jos kooditestit ja kuvat onnistuvat, **mallit ovat vasta toimivia 3D-luonnoksia**. Pinnan aitous ja lopullinen laatu vaativat käyttäjän palautteen ja tarvittaessa erillisen tekstuuri-/materiaalikorjauksen.

**Art directionin pohja:** [Node Beacon Families v0.1](../../docs/NODE_BEACON_FAMILIES_v0.1.md). Kokoelma on vielä ehdotus; kuusi käyttäjälle mieluisaa materiaaliperhettä on tärkeämpää kuin tekoälyn ehdottama tietty tyyppi–materiaali-paritus.
