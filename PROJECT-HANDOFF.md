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
