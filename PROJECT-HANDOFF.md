# MAJAKKA — PROJECT HANDOFF / Jatkuvuusmuisti

**Päivitetty:** 2026-11-09
**Repository:** https://github.com/naatti21/Majakka
**Tarkoitus:** Tämä on uusien kehityskeskustelujen aloituspiste ja hyväksyttyjen päätösten loki. Ei väite, että suunnitelmat on jo ohjelmoitu.

## Uuden keskustelun aloitus

1. Lue tämä tiedosto.
2. Lue tehtävän mukaan [Flintailin hyväksytty visual pipeline](docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md), [APP-SPEC](APP-SPEC.md), [README](README.md) ja [Node Atlas AutoGen](docs/NODE-ATLAS-AUTOGEN-v0.1.md).
3. Tarkista GitHubin koodi ja käytettävissä olevat assetit: mikä on suunniteltu, mikä prototyyppi, mikä oikeasti toteutettu, mikä puhelimella testattu?
4. Jatka delta-muutoksilla; älä aloita ideointia tyhjästä tai kysy uudestaan asioita, jotka löytyvät tiedostoista.
5. Jos vanhasta keskustelusta puuttuu tieto, kerro se, älä keksi sitä.

## Vakaa pelisuunta

Majakka / The Living World on todelliseen maantieteeseen tukeutuva, tumma mutta luettava elävä pelimaailma. Varsinaisen pelimaailman tuovat Nodet, Kaikut, pelaaja, Resonance, verkostot, valo ja musiikki — ei rakennusten yksilöllinen mallintaminen.

- Nocturne-henkinen tyyli, mutta kartan pitää olla **terävä ja luettava**.
- Tutkinta, solmujen yhteydet ja maailman vähittäinen muuttuminen tärkeämpiä kuin kartan tekninen näyttävyys.
- 2D-karttaa kannattaa säilyttää navigointia ja teknistä varatilaa varten.
- Paikkatietoon perustuvan maailmanlaajuisen Node-verkon tulee syntyä sääntöperusteisesti datasta, ei kaikkien paikkojen käsin hyväksynnästä. Ulkoisen lähteen POI-merkintä ei todista kohteen turvallista saavutettavuutta. Ks. Node Atlas AutoGen.
- Älä paljasta pelaajien tarkkoja sijainteja tai reittejä muille; turvallinen etäpelaaminen kuuluu ideaan. Erota fiktiiviset demo-Node-pisteet varmennetuista oikeista kohteista.

## Päätösdelta 2026-11-09 — kartta, kamera ja omat pelihahmot

**HYVÄKSYTTY SUUNTA**

1. Nykyinen Tampereen Perspective World -kokeilukartta on käyttäjän mukaan liian pikselöitynyt ja visuaalisesti sotkuinen. Kartan selkeys ja laatu korjataan ensimmäisenä.
2. Kameran pitää olla mobiilissa vapaa: siirtäminen, zoom, kierto, kallistus; järkevät rajoitukset ja sijaintiin paluu.
3. Pelin omat **Nodet, Kaikut ja pelaajahahmo** ovat kiinnostavia kohteita laadukkaille kevyille 3D-malleille ja animaatioille.
4. **Ei rakennusten käsin mallintamista.** Se oli aiempi assistentin ehdotus, jota käyttäjä ei halua pääprioriteetiksi. Karttamoottorin valmis rakennusgeometria voi olla mukana vain, jos se toimii helposti ja tehokkaasti.
5. Aiemmin hyväksytty **2.5D Map Sprite + näyttävä Animated Card** pysyy suunnittelun pohjana. Kevyen 3D-Kaikun toteutusta testataan ennen päätöstä laajasta siirtymästä 3D-hahmoihin.
6. Testaa ensin yksi selkeä Tampereen alue, vapaa kamera ja yksi oma Node/Kaiku. Laajenna vasta toimivan pohjan jälkeen.

**AVOIN TEKNINEN DIAGNOOSI:** Pikselöitymisen syy ei ole vielä tiedossa. Tutki karttalähteiden tarkkuus, tekstuurien venytys ja suodatus, mipmapit, LOD, renderöintiresoluutio ja näkymän zoom/kulma. Älä vaihda moottoria vain arvaamalla.

## Flintailin ja Kaikujen hyväksytty suunnitteluperusta

Käyttäjä toimitti 9.11.2026 kaksi aiemmin tehtyä suunnittelukorttia:
- MAJAKKA — Kaiku Visual Pipeline v0.1 / Flintail.
- MAJAKKA — Kaiku Identity Map v0.1, jossa lukee **HYVÄKSYTTY – Flintail – Ensimmäinen tuotantolinja**.

Suunnittelun perussääntö on **Species → Form → Instance → Presentation**, eli yksi Kaiku-identiteetti kartalla, kokoelmassa, inspect-näkymässä, Guardianina ja muotoversioina.

Tarkka identiteetti, hyväksytyt tuntomerkit, forms, animaatiot, workflow, tekniset tavoitteet ja korttien väliset terminologiset erot ovat tiedostossa [docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md](docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md). **Älä suunnittele Flintailia tyhjästä uudelleen.**

Koontikortit ovat hyväksyttyä suunnittelua, eivät todiste valmiista sprite sheeteistä, animaatioista, rigeistä tai varsinaisista 3D-malleista. Alkuperäiset kaksi referenssi-PNG:tä pitää vielä versionhallita, jotta myös visuaaliset lähteet säilyvät.

## Toteutustilan tärkeä ero

**GitHub main** tarkistettu 9.11.2026: naatti21/Majakka sisältää PWA:n, selainkarttoja ja pelilogiikkaa. Repon README:n ylin versio on **v0.11.1 Place-first Landmark Alpha, 26.10.2026**.

**Native / Godot:** Todennettu 9.11.2026 **oikea v0.5-lähdehaara** [feature/native-perspective-world-v05](https://github.com/naatti21/Majakka/tree/feature/native-perspective-world-v05) ja sen [native-client](https://github.com/naatti21/Majakka/tree/feature/native-perspective-world-v05/native-client), Godot 4.7.2. Lähdekoodi sisältää `scripts/perspective_world_canvas.gd`, `scripts/map_style.gd`, `scripts/world_map.gd` ja Android CI:n. Tämä Native-prototyyppi on **erillisessä haarassa**, ei main-PWA:n juuressa. v0.5:n rasterikartta käytti 256px OSM-tilestä 128px tyyliteltyä tekstuuria, joka on selvä tarkkuushäviön syy, ja kamerassa oli vain 42°/53°/64° TILT-presetit. Käyttäjän 9.11.2026 kuvassa on tumma perspektiivimaailma, jossa FPS 60 ja 98 styled tiles ovat kuvakaappauksen tilannelukuja eivätkä suorituskykytodistus.

**Älä sekoita:**
- hyväksytty suunnitelma
- keskustelussa tehty prototyyppi
- GitHub mainissa oleva koodi
- Android-laitteella oikeasti testattu ominaisuus.

## Työdeltapäivitys 2026-11-09 — Native v0.5.1

**PROTOTYYPPI / TESTAUS KESKEN:** Luotu [PR #14](https://github.com/naatti21/Majakka/pull/14), luonnos, joka kohdistuu v0.5:n Native-haaraan eikä PWA-mainiin. Kehityshaara `feature/native-map-clarity-free-camera-v051` säilyttää täyden 256px karttatarkkuuden, lisää mipmap-/anisotrooppisen suodatuksen, sovittaa 3D-viewportin kartta-alueeseen ja lisää mobiiliin yhden sormen panoroinnin sekä kahden sormen zoomin, kierron ja jatkuvan kallistuksen. UI:n HOME palauttaa sijainnin ja kameran. `native-client/WORLD_MAP_V051_README.md` sisältää tarkemman QA-portin. Godot 4.7.2 CI **LÄPI** 9.11.2026: viisi headless smoke-testiä (logic, Flintail, world map, perspective map, map style) sekä Android debug APK -export; [onnistunut Actions-ajo](https://github.com/naatti21/Majakka/actions/runs/42635806102). **Fyysinen Android-laaduntarkastus PUUTTUU**: kartan terävyys, vapaat kosketuseleet, FPS/muisti, latautuvat tiilet sekä Kaiku/Node-kohdistus on testattava puhelimessa. Buildin onnistuminen ei ole käyttäjän hyväksyntä eikä lupa mergeen.

## Päätösdelta 2026-11-09 — v0.5.1 Android-kuva hylätty

**HYLÄTTY / VISUAALINEN LAATUPORTTI:** käyttäjä asensi Native v0.5.1 APK:n ja toimitti kuvakaappauksen. 60 FPS -tilalukemasta huolimatta näkymä jäi kelvottoman pikselöityneeksi ja rasterimaiseksi. Kadut, rakennukset ja nimet piirtyvät osaksi viistoksi venytettyä tekstuuria. Parannettu 256 px / mipmap -versio ei poistanut rakenteellista ongelmaa. **Älä rakenna seuraavaa versiota samaa rasteriväriluokittelua paikkaamalla.**

- [PR #14](https://github.com/naatti21/Majakka/pull/14) **suljettu ilman mergeä** 9.11.2026. Sen kameran liikekoodia saa käyttää uudessa kokeilussa vasta testauksen kautta.
- Uusi laatumäärittely: [docs/NATIVE-WORLD-V06-MAP-QUALITY.md](docs/NATIVE-WORLD-V06-MAP-QUALITY.md).
- **Seuraava toteutuksen tutkimussuunta:** todelliseen paikkatietoon perustuva vektorirenderöinti (selkeät tiet, puistot, vedet, nimet), erillisinä pelin 3D-Node/Kaiku/pelaaja. Ei kaupungin rakennusten käsin 3D-mallintamista.
- **TOTEUTUS AVOIN:** Godot-native Tampereen alueen vector mesh -koe vs tarvittaessa MapLibre Native Android integraatiotesti. Protomaps / PMTiles on mahdollinen paikkatiedon lähdejakelu, ei Godot-karttarendereri.
- Reaalinen Android-kuva ja eleiden toiminta ovat hyväksyntäportti; automatisoitu APK-koonti ei yksin riitä.

## Työdeltapäivitys 2026-11-09 — ensimmäinen oikea vektorikartan koodikoe

**PROTOTYYPPI / ODOTETAAN ANDROID-KUVATARKISTUSTA:** [PR #15](https://github.com/naatti21/Majakka/pull/15) / haara `feature/native-vector-world-v06` on tehty v0.5.1-kamerakoodin päälle. Se vaihtaa huonon PNG-rasterin väriluokittelun **OSM-paikkatietogeometriasta tehtyihin Godot-mesheihin**. Tiet, vesistöt, viheralueet ja litteät rakennusten pohjat ovat karttatietoa, eivät käsin tehtyä 3D-kaupunkia. Katunimet piirretään erillisinä kameran suuntaisina 2D-teksteinä. Pelin omat 3D-Node/Kaiku/Avatar-objektit ovat edelleen erillisessä kerroksessa.

- Lähde on **pieni Tampereen keskustan OSM Overpass -kysely** (käynnistyksessä, paikallinen JSON-välimuisti, RETRY MAP). Tässä kokeessa ei ole vielä tuotannon karttapalvelinratkaisua.
- Testattu Godot 4.7.2 -käännös ja kuusi determinististä smoke-testiä, mutta **oikean Overpass-latauksen onnistumista ja visuaalista Android-laatua ei voi vahvistaa CI:llä**.
- Uusi koodi löytyy `native-client/scripts/vector_world_canvas.gd`. Laatuportin dokumentti on haarassa `native-client/WORLD_MAP_V06_README.md`; yleinen suunnittelutavoite on edelleen [docs/NATIVE-WORLD-V06-MAP-QUALITY.md](docs/NATIVE-WORLD-V06-MAP-QUALITY.md).
- Tunnettu rajaus: Overpass-way-geometria ei yksin tue kaikkia moniosaisia vesistö-/puistoalueita; osa ranta- ja puistogeometriasta voi puuttua. **Älä väitä testialuetta valmiiksi maailmanlaajuiseksi kartaksi.**
- **PWA main säilyy ennallaan.** Native-kokeilu on GitHubin erillisessä kehityshaarassa eikä sen PR:ää saa yhdistää ennen käyttäjän visuaalista hyväksyntää.

## 2026-11-09 — Android v0.6 tyhjä kartta → v0.6.1 offline-korjaus

**HYLÄTTY:** käyttäjän fyysinen Android-kuva v0.6:sta näyttää ainoastaan 3D-Node/Kaiku/Avatar-merkinnät ja tyhjän karttataustan; status jumiutuu tekstiin `VECTOR WORLD · loading real Tampere OSM geometry…`. Pelkkä CI:n synteettinen mesh-testi ei riittänyt.

**TOTEUTETTU / TESTATTU CI:ssä, EI VIELÄ HYVÄKSYTTY PUHELIMELLA:** [PR #16](https://github.com/naatti21/Majakka/pull/16), haara `feature/native-vector-offline-v061`, korvaa ajonaikaisen Overpass-haun **APK:n sisään pakatulla oikealla OSM-Tampereen kartta-aineistolla**. Data tallennettu `native-client/assets/maps/tampere-vector-pilot.json` ja tuotantotapana toistettava `native-client/tools/build_tampere_osm_snapshot.py`. 9.11.2026 snapshot sisälsi 3 707 lähdeviitteellistä way-kohdetta (2 624 tietä, 53 vesikohdetta, 366 viheralue-/puistokohdetta, 664 rakennuspohjaa; 1 323 261 tavua), lähde OpenStreetMap API `/api/0.6/map`, ODbL-attribuutio. Kartta ei pyydä puhelimella verkosta mitään. Rakennukset ovat litteitä 2D-pohjia, eivät erikseen 3D-mallinnettuja.

**Testit:** [Android-koonti 42652897675](https://github.com/naatti21/Majakka/actions/runs/42652897675) **onnistui**: 6 Godot-smokea ml. oikean pakatun basemapin läsnäolo sekä geometriameshien muodostuminen, Android APK -export läpi. APK-tiedoston sisäisestä ZIP-rakenteesta tarkistettiin erikseen `assets/assets/maps/tampere-vector-pilot.json` (1.3 MB) ja 3707 kohdetta. Tämä varmistaa **tiedoston ja renderöintigeometrian**, ei vielä ulkoasua tai käynnistymistä varsinaisessa Android-grafiikkatilassa.

**AVOIN:** käyttäjän uusi Android-v0.6.1 kuvakaappaus (kartta näkyy myös lentotilassa?), eleet, laatu, FPS, kartan rajauksen toiminta. PR pysyy luonnoksena eikä mergetä mainiin ennen hyväksyntää.

## 2026-11-09 — v0.6.1 VISUAALISESTI HYLÄTTY; renderöintiarkkitehtuuri uusiksi

**HYLÄTTY:** Fyysisen Android-kokeen käyttäjäpalaute v0.6.1: “Ihan on sekavaa shaipaa.” Aiempi v0.6 näytti täysin tyhjän kartan; v0.6.1 korjasi datan saatavuuden mutta **ei kartan käytettävyyttä eikä ulkoasua**. Godotin itse tehty OSM→SurfaceTool-karttarenderöinti on tämän projektin kannalta liian heikko perusta. Älä jatka v0.6.1:stä lisäämällä yhä katumerkintöjä, rakennusmeshejä tai kohinaa.

- [PR #15](https://github.com/naatti21/Majakka/pull/15) ja [PR #16](https://github.com/naatti21/Majakka/pull/16) **suljettu ilman mergeä**. Koodi ja CI-historia säilyvät tutkimusta varten.
- **Uusi suositeltu arkkitehtuurikoe (AVOIN, ei vielä toteutettu):** erillinen mobiilissa toimiva **MapLibre GL JS** -vektorikartta oikealla tile-palvelulla; testipalveluksi tutkitaan **OpenFreeMap** Dark/Fiord, jossa ei tarvita API-avainta. MapLibre hallitsee kartan tiet, vesistöt, nimet, vektoritiilet, kosketuksen ja perspektiivikameran. Lähteet: https://maplibre.org/maplibre-gl-js/docs/ ja https://openfreemap.org/ . Julkisen palvelun käyttöehdot ja mahdollisen kaupallisen käytön vaatimukset tarkistetaan erikseen.
- **Laatuportti:** yksi laadukas Tampereen karttanäkymä ilman yhtään hahmoa, 3D-rakennusta tai Node-efektiä; tarkat ja luettavat tiet, rannat ja viheralueet, sulava kierto/kallistus/zoom oikealla Androidilla. Käyttäjän visuaalinen hyväksyntä ensin. Vasta sitten 1 todelliseen pisteeseen sidottu 3D-Node/Kaiku.
- MapLibre GL JS tukee WebGL-custom-layer `renderingMode:"3d"` ja siihen integroitua Three.js-/Babylon.js-mallia, mutta **peliobjektien todellinen kuormitus ja toteutus on validoitava kokeessa**, eikä sitä luvata valmiiksi. Godotin ja MapLibren yhdistäminen voi olla hankalaa; älä lukitse lopullista moottoria ennen prototyyppiä.
- Säilytä hyväksytty Flintail-identiteetti ja esityskortit; **kaikujen suunnittelu ei ole hylätty**. Muutosta ei tehdä julkaistuun main-PWA:n pelilogiikkaan.

## 2026-11-10 — MapLibre Tampere -erillinen selainkokeilu

**TOTEUTETTU / ODOTTAA PUHELIMEN KUVALLISTA HYVÄKSYNTÄÄ:** Uusi karttamoottorin kokeilu julkaistu GitHub Pagesissa:

**https://naatti21.github.io/Majakka/experiments/maplibre-tampere/**

Koodi: [experiments/maplibre-tampere/index.html](experiments/maplibre-tampere/index.html), ohje: [experiments/maplibre-tampere/README.md](experiments/maplibre-tampere/README.md).

- **MapLibre GL JS 6.15.0**, OpenFreeMapin oikeat OSM-vektoritiilet; tyylit Fiord / Dark / Liberty, oletuksena tumma Fiord.
- Käyttöliittymä mobiili edellä: pan, pinch, rotate, tilt, HOME, 2D/3D ja kompassin suunta, ladataan verkon yli. Ei tilipyyntöjä eikä GPS:ää.
- Ei vielä Nodeja, Kaikuja, pelaajaa eikä Godot-3D-integraatiota; testin tarkoitus on **karttapohjan laatu ennen hahmoja**.
- Ero aiempiin hylättyihin toteutuksiin: ei rasterin pikseliväriluokittelua, ei omia karttameshejä, ei Overpass-hakuja Androidissa, vaan karttakäyttöön suunniteltu valmis moottori.
- Testi on **erillisessä alihakemistossa**, julkaistua pääpelin logiikkaa ei muutettu. Kartta on **online-only**, eikä demo itsessään lupaa offline-välimuistia.
- **Laatuportti auki:** käyttäjän oikean Androidin kuvakaappaus, teiden ja rantojen selkeys, kaunis yötyyli, vapaa kamera sekä käytettävyys. Ei luvata valmiiksi testaamatta. Jos kartta on hyvä, seuraava koe on yksi geokoordinaatteihin sidottu 3D-pelielementti. Ei kokonaista hahmoarmeijaa tähän vaiheeseen.

## Prioriteetit seuraavaan työvaiheeseen

1. Selvitä PWA-mainin ja mahdollisen Native/Godot-työpuun todellinen tilanne, myös assetit.
2. Rakenna uusi Tampereen vektorikarttapohjan kokeilu; rasterivärikartan v0.5.1 on hylätty.
3. Siirrä/testaa vapaan kameran mobiilieleet uuteen karttarendereriin.
4. Koeaja yksi laadukas Node ja Flintail-karttaesitys; vertaa 2.5D:tä ja kevyttä 3D:tä.
5. Mittaa suorituskyky oikealla Android-laitteella.
6. Kehitä loput animaatiot, kokoelmakortit, Guardian- ja Reveal-esitykset asteittain.

## Päätösten kirjaamisen käytäntö

Jokaisessa muutoksessa kerrotaan päiväys, ratkaisu, syy, vaikutus sekä tila:
- **HYVÄKSYTTY** = käyttäjä on hyväksynyt suunnan/designin.
- **AVOIN** = ei vielä lukittu.
- **PROTOTYYPPI** = kokeilu olemassa, ei tuotantokypsä.
- **TOTEUTETTU** = tarkistettu tiedostoissa.
- **TESTATTU** = oikealla kohdelaitteella verifioitu.
- **HYLÄTTY/KORVATTU** = ei elvytetä oletuksena.

Päivitä ensin tarkin aihekohtainen dokumentti ja lisää tähän vain olennaiset deltamuutokset. Ei kasvavaa sekavaa kaiken kattavaa keskusteludumppia.

## Kopioitava aloitus seuraavaan keskusteluun

“Jatketaan Majakkaa. Lue repon naatti21/Majakka PROJECT-HANDOFF.md ja docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md. Tarkista mainin nykytila ja mahdollinen erillinen Native/Godot-prototyyppi. Älä aloita hahmosuunnittelua alusta. Seuraava työ: [tehtävä].”
