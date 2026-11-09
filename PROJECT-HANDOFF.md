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

## Prioriteetit seuraavaan työvaiheeseen

1. Selvitä PWA-mainin ja mahdollisen Native/Godot-työpuun todellinen tilanne, myös assetit.
2. Korjaa Tampereen kartan luettavuus ja tarkkuus.
3. Toteuta/varmenna vapaa kamera ja mobiilieleet.
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
