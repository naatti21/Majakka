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

## 2026-11-10 — Majakka Nocturne -paletti ja Node/Kaiku-valon suunta

**KÄYTTÄJÄN PALAUTE / HYVÄKSYTTY TAIDESUUNTA:** MapLibre-kokeilun Fiord ja Dark ovat molemmat käyttökelpoisia vertailuja; mieluisin karttapohja on **niiden välissä oleva tumma, selkeä tyyli**. Jos oma välimuoto ei onnistu, **Dark** on varavalinta. Pelin omat **Nodet ja Kaikut valaisevat kartan**. Tämä ei tarkoita pimeyttä, jossa kartan tiet ja rannat lakkaavat näkymästä. Ei rakennusten käsin 3D-mallinnusta.

**TOTEUTETTU KOKEILUSIVULLE, VIELÄ AVOIN PUHELINTARKISTUS:** [MapLibre-karttakoe](https://naatti21.github.io/Majakka/experiments/maplibre-tampere/) v0.2 käyttää oletuksena **Majakka Nocturne** -palettia (Dark-pohja, sinivihreät vesistöt, metsäalueet, tiet ja hillityt rakennuspohjat). Alkuperäiset Dark, Fiord ja Liberty ovat edelleen vertailutyylejä. Kartalla kaksi erikseen **DEMO**-merkittyä Node-/Kaiku-valoa (turkoosi/violetti), pehmeä karttaan sidottu sädekehä, ja **VALOT**-kytkin vertailemaan karttapohjaa ennen ja jälkeen. Tämä on tarkoituksella kevyt **2D/2.5D-hehkukerros**, ei oikea 3D-valonlaskenta, animoitu hahmo eikä tosiasiallinen Nodejen paikkatietorekisteri. Hyväksytyt Flintail-kortit säilyvät erillään.

**SEURAAVA LAATUPORTTI:** käyttäjän Android-testissä arvioidaan erityisesti oman tumman tyylin luettavuutta ja valoefektin hillittyä vaikuttavuutta, sekä verrataan vaihtoehtoon Dark. Jos toimiva, sen jälkeen yksi laadukas 3D-Node/Kaiku geokoordinaattiin sidottuna. Lisäohje ja tekninen status: [experiments/maplibre-tampere/README.md](experiments/maplibre-tampere/README.md).

## 2026-11-10 — Android-kuvapohjainen Nocturne v0.3 -kontrastilukko

**KÄYTTÄJÄPALAUTE:** Majakka Nocturne v0.2 on käyttökelpoisempi karttapohja kuin alkuperäinen Dark, mutta **yleistä maapohjaa halutaan vielä tummemmaksi**, jotta pelin omien Nodejen ja Kaikujen hehkut erottuvat. Alkuperäinen Dark kadottaa tiet ja nimet liikaa. Violetin Kaiku-DEMO-hehkun vaikutus on käyttäjän mielestä lupaava. Kartan luettavuus ei saa kadota pimeään.

**TOTEUTETTU SELAINKOKEESEEN / ANDROID-UUSINTA-ARVIO AVOIN:** [MapLibre-kokeilu](https://naatti21.github.io/Majakka/experiments/maplibre-tampere/) Nocturne v0.3 tummentaa eri maastoluokat yksitellen, mutta vahvistaa nimenomaan teiden ja paikannimien kontrastia; text-halo korjattu. Valikossa oma **Dark · tiet ja tekstit näkyviin** -vertailu sekä alkuperäinen Dark ja Fiord. Tyylinvaihdon vanha jumiutunut `Ladataan ...` -tilaviesti korjattu `style.load`-käsittelyllä. DEMO-Node-/Kaiku-hehkut säilyvät erillisinä karttaan sidottuina kerroksina. Karttatyylin kerros-ID:t on tarkistettu OpenFreeMapin Dark-lähde-JSON:sta ja JavaScript tarkistettu syntaksiltaan; lopullista puhelimen visuaalista hyväksyntää ei vielä ole.

**TUOTANTOPERIAATE:** tumma pohja, **omien peliobjektien tuoma valo** ja **aina luettavat kadut/nimet**. Älä ratkaise tunnelmaa himmentämällä kaikkia kartan kerroksia samalla suotimella. Ei koko ruudun brightness-filtteriä, joka tummentaisi myös tekstit ja valonlähteet.

## 2026-11-11 — World v0.4: oikeat 3D-Node/Kaiku ja orgaaninen 3D-verkosto

**KÄYTTÄJÄN HYVÄKSYMÄ SUUNTA:** Valittu karttapohja on **Dark · tiet ja tekstit näkyviin**; sen päälle rakennetaan **aidot, elävät 3D-Nodet ja 3D-Kaikut**. Nodejen väliset linjat leijuvat **orgaanisina 3D-säikeinä maanpinnan yläpuolella**, ei suorina viivoina karttapinnassa. Jos Nodejen yhdistäminen muodostaa pelilogiikan mukaisen peittoalueen, se leijuu **läpinäkyvänä, orgaanisena pilvenä maan yllä**, ei maalattuna karttapolygoniin. Kartan maantiede pysyy MapLibren vastuulla; **ei rakennusten käsinmallinnusta**. Pelin oma valo valaisee tummaa mutta luettavaa maailmaa.

**SPEC TALLENNETTU:** [docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md](docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md).

**VERSIOJÄRJESTYS:** v0.4:n pieni koe = valittu karttapohja + kevyempi käyttöliittymä + yksi aito geosidottu 3D-Node + yksi 3D-Flintailin prototyyppi. v0.5 = kahden Noden orgaaninen ilmassa kulkeva 3D-yhteyssäie. v0.6+ = peittoalueen pelisäännön mukainen orgaaninen kelluva pilvikenttä. **TILAT:** konseptisuunta hyväksytty, implementointi ja mobiili-hyväksyntä auki. Testejä ei saa sekoittaa hyväksyttyihin valmiisiin hahmo-3D-assetteihin.

## 2026-11-11 — Kaiku-kortit laadukkaina saumattomasti looppaavina animaatioina

**KÄYTTÄJÄN VAHVISTAMA VAATIMUS:** Kaikujen Inventory / Collection -kortit ovat **erittäin tarkkoja, korkealaatuisia ja animaatioltaan saumattomasti looppaavia**. Käyttäjä sanoi aluksi “GIF”, mutta ei vaadi vanhaa GIF-tiedostomuotoa. Suositeltava tekninen kokeilu on lyhyt **mykistetty WebM/MP4-loop + staattinen poster** tai tarvittaessa tehokas sprite sheet; tarkista mobiili-yhteensopivuus ja tiedostokoot. Aiemmin hyväksytyn Flintail Visual Pipelinen kortin tavoite **4–6 s ja lähtötasona 720p** säilyy, mutta kortin lopullinen laatu voidaan tehdä korkeammaksi jos se on tarpeen. Kartan 3D-Kaiku ja kokoelman huipputarkka animoitu kortti ovat **eri esityskerrokset samalle hahmoidentiteetille**, eivät kaksi eri hahmoa. Ei animaatiossa vaihtelevia korvatupsuja/häntää/merkkejä. Mobiilissa näkyvät kortit toistetaan, näkymän ulkopuoliset keskeytetään, liikkeen vähentämistoive huomioidaan.

**TILANNE:** Tämä on **hyväksytty suunnittelumäärittely**, ei väite valmiiksi tuotetuista videokorteista. Päivitetty yksityiskohtainen ohje: [docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md](docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md) kohdassa 8A.

## 2026-11-11 — World v0.4 ensimmäinen oikea 3D-Node koodattu

**TOTEUTETTU KARTTAKOKEESEEN / ANDROIDIN KUVALLINEN TESTI AVOIN:** [World v0.4 testisivu](https://naatti21.github.io/Majakka/experiments/maplibre-world-v04/) ja [lähdekoodi](experiments/maplibre-world-v04/) on lisätty erillisenä kokeena. Käyttäjän hyväksymä **Dark · tiet ja tekstit näkyviin** on oletuskartta, aiemmin hyväksyttyä v0.3-kokeilua ei korvattu.

- **Aito geosidottu 3D-Node:** Three.js:llä generoitu moniulotteinen turkoosi Node (oktaedri, kuoriverkko, rengaskehät, animaatio) MapLibre GL JS:n `custom` WebGL2-kerroksessa `renderingMode:'3d'`, jaettu karttakamera, `MercatorCoordinate` ja metrimittakaava. Vain yksi fiktiivinen **DEMO-koordinaatti** Tampereella, ei käyttäjän sijaintia tai live-peliohjausta.
- Karttatiet, katujen ja paikannimien kontrasti säilyy. Maaperän Node-hehku on erillinen kevyt 2D-efekti **3D-Noden lisänä**, eikä sitä väitetä maaston fyysiseksi valaistukseksi.
- Käyttöliittymä: pienennetty kartan testi-HUD, HOME, 2D/3D, kameraohjaus ja NODE näkyviin/pois.
- Mukana erillinen `tests/world-v04.test.mjs` (JS-syntaksit, luettava karttatyyli, aidon 3D-geometrian ja geokoordinaattimuunnoksen läsnäolo, virhetilan karttafallback). GitHub Actions kooditestit ovat laadun ensimmäinen portti, **eivät todellinen Android-kuva- tai suorituskykytesti**.
- Ohjeistus ja tunnetut puutteet: [experiments/maplibre-world-v04/README.md](experiments/maplibre-world-v04/README.md).
- **Ei vielä toteutettu:** hyväksyttyihin Flintail-referensseihin perustuva 3D-Kaiku, sen tarkka looppaava 4–6 s animoitu kokoelmakortti, orgaaniset ilmassa leijuvat Node-yhteyssäikeet tai aluepilvi. Näiden järjestys pysyy hyväksytyn [v0.4-suunnitelman](docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md) mukaisena.

**SEURAAVA PORTTI:** käyttäjä avaa World v0.4:n puhelimella, varmistaa 3D-Noden oikean geosidonnan ja grafiikan sekä antaa palautteen. Vasta tämän jälkeen tehdään Kaikun varsinainen 3D-ratkaisu hyväksytyn hahmodesignin mukaisesti.

## 2026-11-11 — World v0.4.1: Noden läpinäkyvyyskorjaus Android-palautteesta

**KÄYTTÄJÄN VISUAALIPALAUTE v0.4:** Android-kuvissa turkoosi geosidottu 3D-Node näkyi ja kartta säilyi luettavana, mutta itse Node vaikutti **liian läpinäkyvältä**. Tämä ei ole lopullisen 3D-Noden hyväksyntä.

**TOTEUTETTU KOKEILUSIVULLE v0.4.1 / UUSI ANDROID-LAATUPORTTI AUKI:** [MapLibre World v0.4.1](https://naatti21.github.io/Majakka/experiments/maplibre-world-v04/?v=041) muuttaa 3D-kristalliytimen oikeasti **läpinäkymättömäksi** (`transparent:false`, `depthWrite:true`, täysi opacity), erottelee kirkkaat kiinteät pinnat facet-värein, vahvistaa renkaiden geometriaa ja heikentää läpikuultavaa valokeilaa/maakehää. Noden keskus on lähempänä maata ja leijunta rauhallisempi. Kartan Dark-readable-tyyli, geosidonta ja MapLibre-kamera säilyvät. Koodin regressiotestit sisältävät nimenomaan kiinteän 3D-ytimen tarkistuksen. **Fyysisen Androidin arvio v0.4.1:stä puuttuu edelleen.**

**LUKITTU LAATUPERIAATE:** Noden ja myöhemmin Kaikun varsinainen 3D-ruumis tulee nähdä kiinteänä, luettavana siluettina joka kulmasta. Glow, energiavirrat, peittoaluepilvet ja ympäröivät elementit voivat olla läpikuultavia, **itse pelin olio ei näytä hologrammivarjolta** ellei kyse ole tarkoituksellisesta erikoismuodosta. [World v0.4 README / QA](experiments/maplibre-world-v04/README.md).

## 2026-11-12 — v0.4.2 Render Clean / Node peittyi mustiin karttaviiltoihin

**KÄYTTÄJÄN ANDROID-PALAUTE v0.4.1: HYLÄTTY 3D-RENDERÖINTI:** Kristalliydin on kiinteämpi, mutta mustat karttatasot / viillot menevät selvästi sen päälle. **Älä aloita vielä 3D-Flintailia, yhteyssäikeitä tai peittoaluetta** ennen Noden ehjää 3D-siluettia.

**KORJAUS TOTEUTETTU SELAINKOKEILUUN v0.4.2 / PUHELIMEN UUDELLEENTESTI AVOIN:** [World v0.4.2](https://naatti21.github.io/Majakka/experiments/maplibre-world-v04/?v=042) piirtää **3D-Noden MapLibren viimeisenä tyylikerroksena** (`map.addLayer(layer)`, ei enää `map.addLayer(layer, firstLabel)`) ja kutsuu **Three.js:n `renderer.clearDepth()` ennen 3D-olion renderöintiä**; syvyyspuskuri nollataan, ei kartan värikuvaa. Noden oma 3D-depth säilyy, ja kiinteä kristalli sekä sen renkaat eivät saa rikkoontua kartan mustiin palasiin. Alapuolen karttahehku pysyy erillisessä tasossa. Kooditestit tarkistavat uuden järjestyksen ja depth-nollauksen; **fyysisen Androidin näkymää ei ole vielä vahvistettu**. Dokumentaatio: [experiments/maplibre-world-v04/README.md](experiments/maplibre-world-v04/README.md).

**TIEDOSTETTU RAJAUS:** 3D-Node piirtyy tässä prototyypissä kaikkien karttatasojen päälle ja voi peittää katunimiä, jos osuu niiden kohdalle; valmiin pelin todellinen maasto-/rakennuspeittyminen ratkaistaan myöhemmin erikseen. Tämä on tarkoituksellinen välietappi ehjän 3D-olion ja geosidonnan varmistamiseksi.

## 2026-11-12 — v0.4.2 kromiselainkuvalla varmistettu, Android-testi auki

**KUVA-ARVIO TEHTY (ei pelkkä kooditesti):** GitHub Actions [visual smoke 43298859081](https://github.com/naatti21/Majakka/actions/runs/43298859081) avasi julkaistun v0.4.2 MapLibre/Three.js-kartan aidossa headless Chromium -selaimessa (720 × 1500, oletuskamera zoom 16, kallistus 55°, suunta −15°), tallensi kuvan ja julkaisi ZIP-artifactin `world-v042-chromium-screenshot`. Katsotussa kuvassa 3D-kristalliydin ja renkaat näkyvät **yhtenäisinä ilman aiemman Android-v0.4.1:n suuria mustia päällepiirtymisviiltoja**. Tämä on ensimmäinen graafinen tarkistus, mutta **ei vielä Android-/GPU-hyväksyntä** eikä osoita kaikkia zoom/kulmayhdistelmiä toimiviksi.

**Testausperiaate jatkossa:** renderöinnin kriittisille muutoksille myös kuvallinen WebGL-testi ennen puhelimelle tarjoamista. Vain fyysisen Androidin kuvapalaute lukitsee seuraavan portin; v0.4.2 on vielä kokeilu.

## 2026-11-12 — v0.4.2 hyväksytty tekniseksi 3D-pohjaksi; Noden visuaalinen identiteetti AVOIN

**HYVÄKSYTTY KÄYTTÄJÄN ANDROID-PALAUTTEELLA:** käyttäjä v0.4.2:sta: *"No mutta nythän se on hyvä."* Ydinhavainto: MapLibre + Three.js:n 3D-Noden päällepiirtymisvirhe on saatu käyttäjän mielestä kuntoon. Tätä renderöintipohjaa kannattaa säilyttää; ei enää paluuta aiempiin rikkinäisiin kerrosjärjestyksiin.

**ERIKSEEN AVOIN:** käyttäjän jatko: *"Nodejen ulkomuotoon ei olla vielä menty. Sekin täytyy kyllä miettiä."* Nykyinen läpinäkymätön kristalli renkaineen on **tekninen DEMO-malli, ei hyväksytty lopullinen Node-design**. Muotokieli, materiaali, valon dramaturgia, vaihtelut ja yhteys myöhempiin orgaanisiin säikeisiin suunnitellaan erillisessä taidesuuntavaiheessa, eikä sovelluksen tämänhetkistä mallia saa kanonisoida vahingossa.

**SEURAAVA TYÖ:** tutki 2–3 selvästi erilaista Node-ulkoasukonseptia ja arvioi ne saman toimivan, Dark-readable-karttaisen mobiili-3D-pohjan päällä. Pidä Flintailin jo hyväksytty identiteetti ja hienot looppaavat Kaiku-kortit erillisinä tuotantovaatimuksina. Päivitetty suunnitelma: [docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md](docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md).

## 2026-11-12 — alkuperäiset kuusi erilaista Node-toimintoa löydetty

**KÄYTTÄJÄN MUISTUTUS OLI OIKEA.** [docs/NODE-ATLAS-v0.1.md](docs/NODE-ATLAS-v0.1.md) sisältää jo suunnitellut **kuusi Node-tyyppiä** ominaisuuksineen: **Prism** (valosäikeen taitto / taajuus), **Archive** (muistofragmentit / historia), **Grove** (häiriön rauhoittaminen / luonto), **Relay** (yhteyksien välittäminen ja haaroittaminen), **Observer** (heikkojen kauko-Kaikujen paljastaminen), **Commons** (kollektiiviset muistot / yhteistoiminnan mahdollisuus). `atlas-autogen.js` sisältää jo näiden `nodeType`-luokittelun paikkakategorioista. Neljä yleistä `art/history/nature/culture` -luokkaa `atlas-core.js`-tiedostossa ovat **eri luokittelutaso**, eivät kuuden Node-tyypin korvike.

**ÄLÄ KORVAA TÄTÄ SUUNNITELMAA** uusilla geneerisillä kategorioilla kuten “elävä ydin / muinainen reliikki / resonanssisolmu”. Ne olivat vain irrallisia art direction -ideoita, eivät sovittuja pelirooleja. Jokaiselle Node-tyypille suunnitellaan oma tunnistettava **3D-muoto, animaatio ja vaikutus** sen alkuperäisen roolin mukaisesti; tarkka muotokieli on vielä avoin. v0.4.2:n geneerinen 3D-kristalli on **vain teknisesti hyväksytty testiesine**. Yksittäisten tyypin mukaisten kykyjen toteutusta uudessa MapLibre-maailmassa ei ole vielä vahvistettu. Tarkennettu [World v0.4 -suunnitelma](docs/MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md).

## 2026-11-12 — rikki menneestä keskustelusta palautetut Kaiku Presentation ja Talent -arkkitehtuurit

**PALAUTETTU AIEMMASTA CHATISTA (8.11.2026, käyttäjän 12.11.2026 katkelma):**
- [**MAJAKKA_TALENT_ARCHITECTURE_RECOVERY_v0.1.md**](docs/MAJAKKA_TALENT_ARCHITECTURE_RECOVERY_v0.1.md): **Player Talent Web 24 solmua / 14 pistettä**, neljä suuntaa **Tracking, Bonding, Weaving, Veilcraft**; **Kaiku Talent Tree 12 solmua / 7 pistettä**; ei lukittuja class-rooleja tai ylivoimaista meta-buildia; ehdollinen Undo/Full Reset; hybriditalentti-esimerkki **Phantom Trail = Player Deep Tracking + Kaiku Echo Sense**; Kaiku-puuesimerkit **Flintail Adaptive, Mosswake Rooted, Veilmoth Convergence**. Nämä ovat suunniteltuja, eivät nykykoodin toteutettuja talent-puita.
- **Party & Guardians:** käyttäjän suunta 1–3 aktiivista Kaikua (aiempi ehdotus yksi Primary + kaksi Support), ylimääräisiä Guardianiksi vahvistamaan Nodea; ei suoraa Kaiku-tradingiä. **XP/Level ja Evolution ovat erillisiä**: käyttäjän esimerkkimalli n. **10 ylimääräistä/duplikaatti-Kaikua → Evolution +1–2 tasoa**, ei XP-Level. Ehdotettu `Echo Imprints` -resurssi ja tarkka kulutus **eivät ole lukittuja**.
- [**MAJAKKA_KAIKU_PRESENTATION_ARCHITECTURE_v0.1.md**](docs/MAJAKKA_KAIKU_PRESENTATION_ARCHITECTURE_v0.1.md): sama Kaiku-identiteetti, eri tarkoitukseen optimoidut assetit: **Map kevyt sprite / aktiivinen Companion kevyt oikea 3D / Inventory tarkka saumaton 4–6 s Animated Card / Inspect tarkempi yksi 3D / Reveal harvinainen pre-rendered-animaatio**. Varsinainen GIF-formaatti ei ole oletus. Kartan 3D-Nodet ja orgaaninen verkko pysyvät suunnitelmassa.
- **Älä lukitse tai keksi puuttuvia spesifikaatioita:** tarkat talent-vaikutukset, pisteiden earning, prerequisitet, resetin ehdot, Evolutionin duplikaattikurssi, Hybrid/Form-säännöt sekä Mosswake/Veilmothin ulkomuodot ovat vielä **AVOIN**. Näin palautettu tieto ei muutu vahingossa valmiiksi pelimekaniikaksi.

**TOTEUTUSTILAN ERITTELY:** kaksi uutta dokumenttia ovat suunnittelun talteenotto; päähaaran nykyinen PWA ei sisällä valmista 24+12 Talent Web -moottoria, player/Kaiku-talent-UI:ta eikä live-hybriditalentteja.

## 2026-11-12 — Node Art Direction v0.1 / Relay-muotovertailu toteutettu

**VANHAN PELISUUNNITELMAN MUKAINEN UUSI KOKEILU:** User hyväksyi teknisesti ehjän 3D-Noden v0.4.2:n mutta **ei geneerisen kristallin lopullista ulkoasua**; kuusi suunniteltua Node-tyyppiä ominaisuuksineen ovat Prism, Archive, Grove, **Relay**, Observer, Commons. Ensin kannattaa muotoilla Relay, koska sillä on pelin ilmaan leijuvan säieverkon haarautumistoiminto.

**TOTEUTETTU erillinen 3D-art lab / Android-laatuarvio AVOIN:** [Relay Concept Lab](https://naatti21.github.io/Majakka/experiments/relay-concept-lab/) sisältää kolme **oikean 3D-geometrian vaihtuvaa** Relay-konseptia samassa DEMO-koordinaatissa ja Dark-readable-kartassa:
- **A · Haara:** paksu runko jakautuu kolmeen orgaaniseen valoa kuljettavaan haaraan (riski muistuttaa Grovea).
- **B · Portti:** kolme katkonaiseksi muotoiltua avointa rengaskaarta (riski liian geneerinen sci-fi-energia).
- **C · Kudos:** kolme ilmassa punoutuvaa, kiinteää spiraalinauhaa (riski liian sekava pienellä zoomilla).

A/B/C-painikkeet vaihtavat mallia ilman kartan uutta latausta. Hyväksytty v0.4.2 MapLibre/custom 3D layer, `clearDepth()`, renderöinti viimeisenä, geosidonta ja karttaluettavuus säilytetään. Varjojen/viivojen ja puhelinsuorituskyvyn testaaminen on seuraava portti. **Mikään kolmesta muodoista EI ole vielä käyttäjän hyväksymä**, eivätkä Nodejen todelliset Relay-kyvyt ole tässä kokeessa toteutettuja. Alkuperäinen geneerinen 3D-karttatesti ja pääpelin PWA jätettiin muuttamatta.

**Suunnitelma:** [MAJAKKA_NODE_ART_DIRECTION_v0.1.md](docs/MAJAKKA_NODE_ART_DIRECTION_v0.1.md). Kuuden tyypin ulkonäkö johdetaan niiden aiemmin määritellystä toiminnosta; Relaylla oltava selvät yhteyspisteet tulevalle orgaaniselle 3D-säikeelle. **Seuraava portti:** käyttäjän A/B/C-vertailu puhelimella ja yhden suunnan valinta tai yhdistely, sitten yksi todellinen Node-tapahtuma ja 3D-yhteyssäie. Ei kuutta valmista mallia tai 24 talenttia heti.

## 2026-11-15 — kolme käyttäjän pelivertailukuvaa: elävä kartta, Kaiku-kokoelma ja 150 m

**KÄYTTÄJÄN 3 KUVAA JA KOMMENTIT TALLETTU DOKUMENTAATIOON** (lähdekuvat annettu chatissa; itse kuvabittejä **ei ole** tallennettu GitHubiin):
- Vertailupelin kartalla **selvät yksilölliset hahmosiluetit elävät**: hengittävät, liikahtelevat, joidenkin lyhyt paikallinen patrol. Majakan maailmaan kevyt 2.5D/3D-mobiilioptimoitu idle-liike ja vain tarvittaessa aktiiviselle Companionille aito 3D; ei täyttä reaaliaikaista creature-simulaatiota kaikille.
- **Collection Grid = korkealaatuiset staattiset kortit**, jotta suuri ruudukko pysyy kevyenä. **Korttia napauttamalla = suuri animointiesitys** (saumaton noin 4–6 s loop), mieluummin Kaikun omassa luonto-/resonanssiympäristössä kuin steriilissä laboratoriossa. Kortin taide/teema jatkuu detail-ympäristöön. Tämä **tarkentaa** aiemman ”kaikilla animated card” -vaatimuksen käyttötilannekohtaiseksi: animaatio säilyy, ei välttämättä toistu gridissa. Erillinen Inspect voi myöhemmin tarjota yhden interaktiivisen 3D-mallin. Älä kopioi vertailupelin hahmo- tai UI-grafiikkaa.
- **Käyttäjä suosii 150 m kokeiluarvoa** vuorovaikutussäteeksi pelaajasta (vertailupelin 200 m tuntui mukavalta, Ingressin liian lyhyt vaikutusetäisyys ja yhden Noden ~15 min drone toisto turhauttava kotona). **150 m ei ole kotipelaamisen ainoa tapa**: etä-Echot, Kaikun kehitys ja verkon suunnittelu pysyvät merkityksellisinä ilman GPS:ää/lähi-Nodea. Vanhassa `APP-SPEC`issa mainittu **70 m etualakävelyn laskenta on eri muuttuja**, ei korvaudu 150 m vuorovaikutusetäisyydellä.

**KIRJATTU:** [Kaiku Presentation Architecture v0.1 — 15.11 delta](docs/MAJAKKA_KAIKU_PRESENTATION_ARCHITECTURE_v0.1.md) ja [APP-SPEC — 150 m radius kokeilu](APP-SPEC.md).

**TILAT:** inspiroiva vertailu ja hyväksytty keskustelusuunta / **EI toteutettu** Majakan live-peliin. Visual Relay A/B/C -vertailu on oma edelleen avoin art-direction-portti, jota ei tarvitse sekoittaa Kaiku-esitykseen. Seuraava konkreettinen pelillinen laatukoe: testaa ensin yksi Flintailin kartta-idle + staattinen collection-kortti + sama hahmo suuressa teeman mukaisessa loopatussa esityksessä, sekä erikseen demoversion 150 m vuorovaikutuksen mielekkyys.

## 2026-11-19 — Abyssal-opit toteutettu prosessiksi ja Relay Chromatic D -kokeeksi

**KÄYTTÄJÄ PALAUTTI JO HYVÄKSYTYT TEHTÄVÄT:** 16.11.2026 lisätty Abyssal Garden -oppidokumentti ehdotti visuaalista laatuprosessia. Aiemmat Relay A/B/C -mallit olivat käyttäjän mielestä **liian low quality ja liian vähävärisiä**. Hänen ei tule joutua kirjoittamaan teknistä promptia: assistentti kirjoittaa sekä briefin, toteutuspromptin, visual critic -ohjeen että korjauskriteerit. Älä väitä samaa AI:ta riippumattomaksi arvioijaksi.

**TOTEUTETTU JA TALLENNETTU:**
- [Visual Prompt System v0.1](docs/MAJAKKA_VISUAL_PROMPT_SYSTEM_v0.1.md): art-director/implementer/critic-työvaiheet, konkreettiset prompt-pohjat, Done When, regressio- ja palautesilmukka.
- [Visual Critic v0.1](docs/MAJAKKA_VISUAL_CRITIC_v0.1.md): kuusi vakioitua 3D-kameraa, värien/materiaalien/luettavuuden/hahmoroolin arviointi, P0/P1/P2-hylkäykset ja suorituskykymittaukset.
- [Node Style Tokens v0.1](docs/NODE_STYLE_TOKENS_v0.1.md): kuuden jo määritellyn Node-tyypin erilliset väri-, materiaali-, liike- ja muotosuuntaukset; ehdotuksia, **ei hyväksyttyä kanonia**.
- [Relay Concept Lab v0.2](https://naatti21.github.io/Majakka/experiments/relay-concept-lab/) sisältää **D · Värit / Chromatic Conduit** -muodon vanhojen A/B/C-vaihtoehtojen lisäksi. Kolme voimakasta ulostuloporttia, kiinteä kerroksellinen runko, koralli-/kulta-/violettiaksentit turkoosin rinnalla, hienovarainen proseduraalinen liike ja LOW/MED/HIGH-VFX. Aiempi hyväksytty MapLibre-kamera ja last-layer/clearDepth eivät muutu. URL-parametrit sallivat 6 vakioitua kameravertailukuvaa. [Lab README](experiments/relay-concept-lab/README.md).
- [Relay visual smoke](.github/workflows/relay-lab-visual-smoke.yml) laajennettu ottamaan kolmesta vanhasta vaihtoehdosta kuvat ja kuusi D-kamerakulmaa; [testi](tests/relay-concept-lab.test.mjs) tarkistaa myös neljännen mallin ja laatutasot.

**TILA:** lähdekoodi toteutettu, GitHub-koodi- ja kuvalliset testit tarkistettava viimeisimmistä Actions-ajoista. **Fyysisen Androidin käyttäjäarvio Chromatic-muodosta puuttuu; D ei ole lopullinen Relay.** Ei muita Node-malleja, Kaiku-assetia, oikeaa kaiku-animaatiokorttia eikä Node-verkon pelillistä haarautumista väitetä valmiiksi.

**SEURAAVA PORTTI:** käyttäjän Android-kuva D · Värit -vaihtoehdosta, värit/materiaalit/selkeys kritiikkiin, sitten yksi rajattu parannus. Työtä ei jätetä promptin tarjoamiseen; tuota muutokset GitHubiin saakka. **Abyssalissa otetaan käyttöön menetelmä, ei kopioida grafiikkaa.**

## 2026-11-21 — Relay v0.3: toimiva majakkamuotoinen 3D-Node, ei pelkkä build-brief

**KÄYTTÄJÄN PÄÄTÖSSUUNTA:** Nodejen tulee kuulua **majakkaperheeseen**; yhteinen yksinkertainen pystysiluetti, tyypin mukaan eri kruunu/pintakuvio/valo, ja Nodejen laatua heijastavat hillityt värit/koristeet. Entinen Chromatic D oli liian laajalle haarautuva scifi-artefakti. **Käyttäjä pyysi toteutusta, ei enää vain ohjeita.**

**TOTEUTETTU** repo-mainiin [Relay Lab](https://naatti21.github.io/Majakka/experiments/relay-concept-lab/?concept=lighthouse&grade=3): uusi **E · Majakka / Relay v0.3** on oletusmuoto vanhojen A/B/C/D:n rinnalla. [relay-lighthouse.js](experiments/relay-concept-lab/relay-lighthouse.js) sisältää yhden oikean Three.js-tornin: porrastettu jalusta, kiinteä kapeneva 12-sivuinen runko, kohokuvioiset pinnat/energiakanavat, hillityt koralli-/kulta-/turkoosi-/violettiaksentit, kolmisuuntainen lyhtykruunu ja sen valopulssit. [relay-3d.js](experiments/relay-concept-lab/relay-3d.js) liittää sen aiemmin Androidilla hyväksyttyyn MapLibre-renderöintiin; **piirtojärjestys + clearDepth-v0.4.2-korjaus säilyvät.** Vanhoja Node-versioita ei poistettu.

**UUSI KOKEILU:** visuaalinen `grade=1|2|3` muuttaa pinnan koristeita/värejä, mutta on **vain hahmotelma mahdolliselle Node-laadulle/harvinaisuudelle**, ei oikea pelisääntö. Erillinen LOW/MED/HIGH graafinen laatutaso vaihtaa vain lisäefektejä. Kartalla DEMO-koordinaatti ilman GPS:ää. Kuusi QA-kamerakulmaa ja I–III-kuvavertailut automaattisesti, mutta pelin v0.4.2-verkkoon, Lumen-talouteen tai Node-Atlakseen ei lisätty vaikutuksia.

**TILAT:** toteutettu 3D-grafiikkaprototyyppi; automaattinen staattinen CI ja Chromium-kuvasavu on vahvistettava viimeisimmästä GitHub Actionsista. **Ei valmista käyttäjän hyväksymää Node-kanoonia eikä toimivaa Node–Node-säiepelimekaniikkaa**. Fyysinen Android-katselmus ja suorituskykymittaus tarvitaan myöhemmin.

**Seuraava todellinen pelituotantoportti:** valitun majakkamallin visuaalisen kelvollisuuden jälkeen 2 oikeasti paikkasidottua **DEMO**-nodea + yksi ilmassa kulkeva orgaaninen 3D-yhteys + käyttäjälle ymmärrettävä muutos. Talentteja ei rakenneta etupainotteisesti.

## 2026-11-21 — v0.3 hyväksytty MUOTOSUUNNAKSI, materiaalintuntu avoin; v0.5-kaksi-Nodea-yhteys

**UUSIN KÄYTTÄJÄN PALAUTE:** Relay v0.3 -majakan **yksinkertainen tornimainen siluetti ja yleisilme ovat oikea suunta**: käyttäjä sanoi *“kyllä tuo näyttää hyvältä”*. **Pintaa EI ole hyväksytty valmiiksi:** yksityiskohdat ovat nyt lähinnä lisää 3D-muotoja, eivät vielä uskottavaa materiaalin pintaa. Oikea termi: **materiaalintuntu / pintatekstuuri / material response**. Seuraava rajattu art-polku: tekstuuri- tai proseduraalinen normal-/roughness-vaihtelu, värikerrosten mikrorakenne, fyysisesti uskottava valon heijastuminen; vältä turhaa ulokkeiden/polygonien lisäämistä. **Ei väitettä että uusi materiaali olisi jo toteutettu.**

**KÄYTTÄJÄ PYYNTÖ:** *“Edetään suunnitelmasi mukaan”* = ensin kahden majakan välinen oikea ilmassa leijuva yhteyssäie; ei lisää pitkää suunnittelumonologia, vaan toteuta peliä.

**TOTEUTETTU GitHub-mainiin, uusi erillinen kokeilu:** [World Link v0.5](https://naatti21.github.io/Majakka/experiments/node-link-v05/), lähteet [index.html](experiments/node-link-v05/index.html) ja [link-world.js](experiments/node-link-v05/link-world.js). Kaksi oikeaa 3D Three.js Relay-v0.3-majakkaa kahdessa erillisessä fiktiivisessä, karttaan sidotussa DEMO-pisteessä `[23.7603,61.4991]` ja `[23.7627,61.4996]` (~140 m toisistaan, **ei** pelaajan toimintamatka). Samassa 3D-scenessä yksi orgaaninen koholla kulkeva `CatmullRomCurve3/TubeGeometry`-valosäie ja sivujuovat sekä liikkuvat valopulssit. Käyttäjä voi oikeasti **KATKAISTA** ja **MUODOSTAA** 3D-yhteyden takaisin (lyhyt hiipumis-/syttymissiirtymä). Runkokartta on edelleen OpenFreeMap Dark + MapLibre. `map.addLayer(layer)` viimeisenä ja `renderer.clearDepth()` säilyttävät käyttäjän hyväksymän 3D-piirtojärjestyskorjauksen. `linked=0`-URL-parametri avaa kuvan ilman yhteyttä. LOW/MED/HIGH on graafinen tehostekytkin. **Ei GPS:ää, ei oikeita Node-sijainteja, ei sääntömoottoria eikä pysyvää peliverkkoa.**

**VERIFIOINTI:** [tests/node-link-v05.test.mjs](tests/node-link-v05.test.mjs) testaa kaksi koordinaattia, 3D-säikeen, tilakytkimen ja depth-fiksin. Uusi [GitHub Actions -kuvatesti](.github/workflows/node-link-v05-visual-smoke.yml) ottaa yhdistetyn/katkaistun tilan ja eri 3D-kamerakulmat. **CI/PAGES/kuvallisen QA:n lopputila tarkistettava viimeisimmistä ajoista; älä tulkitse pelkkää kuvan onnistunutta tallennusta oikean sisällön hyväksynnäksi.** Fyysisen Androidin ulkonäkö, akku ja FPS ovat vielä AVOIN. [Kokeilun README](experiments/node-link-v05/README.md).

**SEURAAVA PORTTI:** (1) varmista yhdistetyn ja katkaistun kuvakulman kontrasti, (2) käyttäjän Android-palaute nimenomaan yhteyssäikeen korkeudesta/kaartumisesta/visuaalisesta tunnistettavuudesta, (3) vasta sen jälkeen yksi pelillinen verkostotapahtuma tai kolmas Node/alue, (4) Relay-materiaalintunnun erillinen pintamateriaalikoe. Älä muuta aiempaa hyväksyttyä Relay Art Labia tai maailmakartan tyyliä v0.5-kokeilun takia.

## 2026-11-21 — käyttäjän tarkennus: jokainen Node voi olla oma MAJAKKARAKENNUS ja oma KRUUNU

**TÄRKEÄ TÄSMENNYS aiempaan “runko vakio, kruunu vaihtelee” -tulkintaan:** Se tulkinta oli VIRHEELLINEN. Käyttäjä vahvisti, että **rakennus/runkorakenne tai pintamateriaali pitää saada omakseen**; **myös kruunu/lyhtyosa voi olla jokaisella erilainen**. Yhteinen rajoite on vain **majakaksi tunnistettava kokonaisuus**, ei identtinen 3D-runko tai saman sylinterin pinnoittaminen.

Käyttäjä nosti **Stone, Moss, Timber, Porcelain, Copper ja Pearl / Mineral Beacon** -materiaalisten majakoiden joukon; ne ovat vaihtoehtoisia rakennus- ja materiaaliperheitä. **ÄLÄ rinnasta automaattisesti** kuuteen alkuperäiseen pelilliseen Node-lajiin (Prism, Archive, Grove, Relay, Observer, Commons). Niiden yhteydet ja laatuasteet päätetään myöhemmin. **Realistinen/orgaaninen materiaalintuntu** (`roughness`, `normal`, pintatekstuurit, syyt, patina, heijastus, kuluminen) asetetaan etusijalle lisättävän geometrian ja irrallisten renkaiden sijaan. Relay v0.3:n majakkasiluetti on käyttäjän mielestä hyvänsuuntainen, **sen materiaali ei vielä täytä tavoitetta**.

Päivitetyt lähteet: [Node Style Tokens](docs/NODE_STYLE_TOKENS_v0.1.md) ja [Node Art Direction](docs/MAJAKKA_NODE_ART_DIRECTION_v0.1.md). **Tämä on suunnittelulukko, ei väite uusien 3D-assetien toteutuksesta**.

## 2026-11-21 — kuudelle alkuperäiselle Node-tyypille OMAT materiaalimajakat ja 3D-kokeilu

**KÄYTTÄJÄN PYYNTÖ:** ”No nyt voit sitten noille prism, archive jne tyypeille keksiä sopivat materiaalit ja muodot. Ja tadaa Majakoita.” Tämä jatkaa aiempaa päätöstä: **majakka on yhteinen identiteetti, mutta sekä KOKO RAKENNUS että KRUUNU ja materiaali saavat vaihdella**. Ei kuutta samaa sylinteriä eri väreissä eikä lisää satunnaista debug-geometriaa.

**KUUSI EHDOTETTUA YHDISTELMÄÄ (luova art direction, ei käyttäjän lopullinen canon):** `Prism = Porcelain` (lasitettu posliini, optinen kruunu), `Archive = Stone` (kulunut ladottu kivi, lämmin kivilyhty), `Grove = Moss` (sammaloitunut epäsymmetrinen kivitorni, siemenkotakruunu), `Relay = Copper` (patinoitu kuparitorni, kolme ulostulovaloa), `Observer = Pearl/Mineral` (helmiäismineraalitorni, yksi suuntaava kaukolinssi), `Commons = Timber` (puurakenteinen nelikulmainen torni, avoin yhteislyhty). Pelillinen rooli perustuu alkuperäiseen [Node Atlas v0.1](docs/NODE-ATLAS-v0.1.md). Materiaali ei ole pelillinen laatuluokka eikä 1:1-sidosta ole lukittu.

**TOTEUTETTU** erillisessä [Beacon Family Material Lab](https://naatti21.github.io/Majakka/experiments/node-family-v01/) -kokeessa: uusi `index.html` valitsee kuuden tyypin välillä samassa geosidotussa *fiktiivisessä DEMO-pisteessä*. [beacon-materials.js](experiments/node-family-v01/beacon-materials.js) tekee lokaalisti **albedo-, roughness- ja bump-tekstuurit** tyypin pintamateriaalista (kiven huokoisuus/laasti, puunsyyt/oksat, kuparin patina, posliinin säröily, sammalen vaihtelu, helmiäisen kerrostuma/iridesenssi). [beacon-model.js](experiments/node-family-v01/beacon-model.js) antaa kullekin **erillisen rungon profiilin ja oman kruunun**, ja [beacon-layer.js](experiments/node-family-v01/beacon-layer.js) piirtää yhden aidon Three.js-3D-majakan kerrallaan MapLibren viimeisenä kerroksena, `clearDepth()` säilyttäen. Entisen mallin GPU-muisti vapautetaan vaihdossa. V0.4.2-map / Relay v0.3 / v0.5 säiekoe on jätetty ennalleen; EI GPS:ää, EI valmiita Node-peliefektejä.

**TARKKA STATUS:** koodi/prototyyppi tallennettu GitHub-mainiin; [node-family-v01.test.mjs](tests/node-family-v01.test.mjs) testaa syntaksin, kuusi profiilia, materiaalikanavat, geosidonnan ja cleanupin. [kuvatesti](.github/workflows/node-family-v01-visual-smoke.yml) tallentaa Chromiumissa kuusi pääkuvaa + kaksi lähikuvaa. Testien läpäisy EI vielä ole käyttäjän Android-hyväksyntä eikä todista uskottavaa materiaalintuntua, suorituskykyä tai valmista lopullista assettia. [Lue myös arkkitehtuuriperheet](docs/NODE_BEACON_FAMILIES_v0.1.md) ja [labran README](experiments/node-family-v01/README.md).

**SEURAAVA ARVIO:** mobiilissa kaikkien kuuden rungon ja kruunun siluetti sekä materiaalintuntu zoom 17–18, ja zoom 15–16 tunnistettavuus. Käyttäjän kuvapalaute tarkentaa ensin materiaaleja, ei lisää uusia koristeita. Vasta visuaalisen portin jälkeen kahta eri Node-tyyppiä samaan v0.5:een; pelillinen Node-verkko erikseen.

## 2026-11-22 — World v0.6: kolme erilaista PBR-majakkaa ja vaiheittain heräävä 3D-verkko

**KÄYTTÄJÄN “Hyvä, jatketaan siitä” tarkoitti edellisen hyväksytyn suunnitelman KONKREETTISTA TOTEUTUSTA**, ei uutta pitkää suunnittelutekstiä. Kuusi perhemallia jäi ehdokasvalikoimaksi; valittu seuraava demo on **kolme eri 3D-materiaalimajakkaa samassa maastokartassa, niiden väliset 3D-yhteyssäikeet ja näkyvä verkoston muodostuminen**. Peittoaluepilvi vasta seuraavaksi linkkien Android-laatukontrollin jälkeen.

**TOTEUTETTU** erillinen [World v0.6 – Three-Node Network](https://naatti21.github.io/Majakka/experiments/node-network-v06/), ei v0.5-vertailun päälle kirjoitettu:
- **Relay / Copper**, **Grove / Moss**, **Prism / Porcelain** omine 3D-runkoprofiileineen, kruunuineen ja proseduraalisine PBR albedo+roughness+bump -pintoineen vanhasta `node-family-v01`-kokeesta.
- 3 fiktiivistä **DEMO-karttakoordinaattia** Tampereella: `[23.7603,61.4991]`, `[23.7622,61.4992]`, `[23.7612,61.5006]`. Ne eivät ole hyväksyttyjä POI-ankkureita eikä niihin ohjata pelaajaa fyysisesti.
- **Kolme oikeaa ilmassa kaartuvaa 3D CatmullRomCurve3/TubeGeometry -säiettä:** Relay–Grove, Relay–Prism, Grove–Prism. Kussakin lämpimän tai viileän sävyinen runko, ohut valoisa keskusta, sivujuovat ja liikkuva valopulssi.
- Mobiili-UI: napit **0/3, 1/3, 2/3, 3/3** sekä **HERÄTÄ VERKOSTO VAIHEITTAIN** (toistettava havaittava eteneminen); kamera HOME, zoom, pitch, north ja LOW/MED/HIGH.
- Yksi yhteinen ambient/key/fill-valaistus kolmelle PBR-majakalle, jolloin samaa valoa ei kerrota kolmella. Siksi `beacon-model.js` sai takaisin-yhteensopivan valinnaisen `sharedLighting`-parametrin; vanha yksittäisen majakan material labin valaistus pysyy ennallaan.
- MapLibre OpenFreeMap Dark + teiden/nimien luettavuus. Hyväksytty **lisää 3D-kerros viimeisenä + `renderer.clearDepth()`** -korjaus säilytetty. Animaation päivityspyyntö ajastettu hallitusti, jotta staattinen kartta jatkaa heräämistä ilman pahaa GPU-spiniä.
- `?stage=0|1|2|3` avaa halutun tilan testikuvaksi. Käytössä ei ole GPS:ää, pelaajan 150m interaktiota, oikeaa linkkirakennuskustannusta, serveriä, persistenttejä linkkejä eikä todellista pelikattavuutta. Nämä ovat VAIN visuaalinen/prosessillinen prototyyppi.
- Koodilähteet `experiments/node-network-v06/index.html`, `network-world.js`, [README](experiments/node-network-v06/README.md); testi `tests/node-network-v06.test.mjs`; Chromium/WebGL-katselmus `.github/workflows/node-network-v06-visual-smoke.yml`.

**HYVÄKSYNNÄN RAJA:** GitHub Actions -kooditestien ja 0–3 kuvatestien tila tarkistettava raportista; HTML/Three-koodi on tehty mutta **ei vielä Androidilla käyttäjän hyväksymä**. Ei väitettä että peittoaluepilvi tai pelillinen verkostomekaniikka olisi valmis. Älä taas jää loputtomaan CI-pollaussilmukkaan. **Seuraava portti:** käyttäjän Android-kuva 3/3 ja 0/3 vaiheista ja arvio, näkyykö jokainen majakka/säie ilman mustia karttaviiltoja ja miten säikeet kaartuvat; sen jälkeen pehmeä leijuva peittoaluepilvi `v0.7` erillisenä art-testinä.

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
