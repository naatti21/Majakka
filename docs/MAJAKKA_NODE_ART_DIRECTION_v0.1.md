# MAJAKKA — Node Art Direction v0.1 / kuusi tyyppiä + Relay 3D Lab

**Päiväys:** 2026-11-12  
**Status:** 6 Node-tyyppiä ja niiden tehtävät palautettu aiemmasta suunnitelmasta; **3D-ulkonäköä EI ole hyväksytty**. Relaylla on kolme toteutettua visuaalista **teknistä luonnosta**, mutta ei vielä tyypin mukaista pelikykyä.

**Avaa Androidilla:** https://naatti21.github.io/Majakka/experiments/relay-concept-lab/  
**Lähteet:** [Node Atlas v0.1](NODE-ATLAS-v0.1.md), [Auto Atlas v0.1](NODE-ATLAS-AUTOGEN-v0.1.md), [World v0.4](MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md), [Project handoff](../PROJECT-HANDOFF.md).

## 1. Kiinnitetty suunnitteluperusta (EI tehdä uusiksi)

Aiemmasta Node Atlas -suunnitelmasta tulee suoraan **kuusi erilaista Node-tyyppiä**, joiden vaikutus ei saa jäädä väriin, UI-tagiin tai erilaiseen koristeeseen:

| Tyyppi | Lähdeympäristö | Jo suunniteltu toiminta | Ulkomuodon suunnittelutehtävä, EI vielä hyväksytty malli |
| --- | --- | --- | --- |
| **Prism** | Taide, muraalit | Taittaa valosäikeitä, taajuus-/väritehtävät | Näytä valon taittuminen ja muuttuvat suunnat |
| **Archive** | Historia, muistomerkki | Muistofragmentit, historian valinnat ja mysteeri | Ilmennä kerrostuneita muistiaineksia; ei pakollista kirjarakennetta |
| **Grove** | Puisto/luonto | Rauhoittaa häiriötä, juurimainen orgaaninen valo | Näytä ankkuroituminen ja ympäristön tasoittuminen |
| **Relay** | Reittien opasteet ja risteykset | Välittää ja haaroittaa valoa, vaihtoehtoiset yhteydet | **Omat tunnistettavat ulostulokohdat ilmassa leijuville säikeille** |
| **Observer** | Näköalapaikka | Havaitsee kaukaisia heikkoja Kaiku-signaaleja | Ilmennä laajempaa havaintokenttää; ei kaikkiin suuntiin osoittavia nuolia |
| **Commons** | Kirjastot ja kulttuurikohteet | Kollektiiviset muistot ja tuleva yhteistyö | Ilmennä kokoamista/yhteistä resonanssia, ei Guardian-hahmon kopio |

Tässä taulukossa **toiminta ja paikkakategoria perustuvat aiempaan suunnitelmaan**, viimeinen sarake on tämän art-direction-vaiheen sovellus/ehdotus.

**Älä sekoita** kuutta Node-lajia Kaikujen species-/Form-luokkiin, pelaajan neljään Talent Web -haaraan tai niihin kuuteen etäpelattavaan fiktiiviseen Echo-tehtävään, joita automaattinen Atlas tuottaa.

## 2. Miksi juuri Relay ensin?

Relay näkyy verkostopelin ydintoiminnassa: yksi Node ei vain hehku, vaan sen kautta **valo jatkaa ja haarautuu**. Jos Relay ei näytä tunnistettavalta **pienessä zoomissa** eikä sen rungosta löydy uskottavia säikeiden lähtökohtia, myöhempi 3D-säieverkko tuntuu irtonaiselta koristeelta.

Tässä vaiheessa ei tehdä vielä seuraavaa pelimekaniikkaa: oikea yhteyden valinta, Lumen-kustannus, Guardianin boost, Nodejen hallinta, peittoalueen laskenta tai yhteyssäikeiden pysyvyys. Ne vaativat erillisen pelisuunnittelun ja kooditestin. Ulkomuoto EI saa implikoida että vaikutus on jo toteutettu.

## 3. Relayn kolme mobiilivertailua (toteutettu, mutta hyväksyntä auki)

Kaikki vaihtoehdot ovat **samaan geneeriseen DEMO-pisteeseen sidottuja oikeita 3D-olioita** v0.4.2:n hyväksytyn MapLibre-renderöintitekniikan päällä. Vain yksi niistä näkyy kerrallaan valitulla A/B/C-painikkeella. Kaikilla yhtenäinen Relay-henkinen tumma turkoosi + kirkkaat yhteyspisteet, jotta ero näkyy **muodossa**, ei pelkässä värissä.

### A · Haara

**Muoto:** selkeä paksu runko, josta erkanee kolme kaareutuvaa, paksua orgaanista oksaa ja kolme kirkasta päätä. Kolme valopistettä kulkee oksan sisällä kohti lähtöpistettä. **Hyöty:** heti ymmärrettävä haarautuminen, vahva siluetti. **Riski:** liian kasvimainen/juurimainen muoto voi muistuttaa **Grovea**.

### B · Portti

**Muoto:** useita katkonaisia pystyrengaskaaria ja vakaa keskijakaja. Välit/kaaren päät toimivat visuaalisina säieportteina. **Hyöty:** selkeä ja monumentaalinen, erottuu Grove-tyypistä. **Riski:** voi näyttää enemmän muinaiselta portaalilta kuin vaihtoehtoja välittävältä Node-solmulta; liian tekninen estetiikka.

### C · Kudos

**Muoto:** kolme vahvaa, ilmassa punoutuvaa kiinteää spiraalinauhaa, valo kulkee niiden reunaa pitkin; päät ovat omia porttejaan. **Hyöty:** alkuperäinen, sopii Majakan orgaanisiin yhteyssäikeisiin. **Riski:** pienessä koossa nauhat voivat kasautua sekavaksi sykkyräksi, erityisesti kartan yläpuolelta nähtynä.

**Suunnittelijan lähtöarvio, EI valinta:** A on selkein pelaajalle; B erottuu helposti muista Nodeista; C vastaa voimakkaimmin ajatusta elävästä valoverkostosta. Ratkaise vasta **kartalla**.

## 4. Hyväksynnän kohde

Puhelimella arvioi mieluiten nämä kysymykset:

1. **Siluetti:** tunnistaako muodon pieneksi zoomattuna **ilman** hehkun apua?
2. **Pelillinen informaatio:** voiko hahmottaa että tästä haarautuu useampi yhteys?
3. **Majakka-identiteetti:** tuntuuko muoto Majakan omalta vai satunnaiselta mobiili-sci-fi-ikonilta?
4. **Vertailu muihin:** sekoittuuko Haara liian helposti Groveen? Voiko Portin tai Kudoksen tunnistaa Relayksi?
5. **Käytettävyys:** pysyykö muodossa kiinteä 3D-ydin, eivätkö karttakerrokset viillä sen läpi, 2D/3D-kameralla 0–70°?

**Lukitus tehdään vasta, kun käyttäjä valitsee tai yhdistää muotokielen.** Hyväksytyn v0.4.2:n renderöintiperustaa ei korvata eikä kahta mallia väitetä valmiiksi.

## 5. Järjestys ennen tuotantoa

- **Vaihe 1 NYT:** tarkastele A/B/C kartalla ja kirjaa visuaalinen palaute. 3D-kerroksen vaihto testataan ilman täydellistä karttalatausta.
- **Vaihe 2:** yhden Relayn muotokielen hyväksyntä, siihen muutama tarkka idle/herääminen/haarautuminen-animaatio.
- **Vaihe 3:** geosidottu **toinen testinode**, ja vasta sitten orgaaninen 3D-yhteyssäie, joka liittyy Relayn ulostuloporttiin. Pelilogiikan aito palaute ei saa riippua efektistä.
- **Vaihe 4:** kun Relay toimii, palataan viiden muun alkuperäisen Node-tyypin muotoihin. Kunkin vaikutus näkyy omassa siluetissa ja valossa.
- **Vaihe 5:** yksi oikea pelaamisen pystysuuntainen läpileikkaus: löytö → herääminen → yhteys → mielekäs seuraus → syy palata. Flintailin kevyt karttaesitys ja laadukas animaatiokortti tulevat tähän omana yhteisenä laatuporrastuksena. Talent-puita ei implementoida ennen kuin niillä on todellinen käyttö.

## 6. Tekniset ja tietoturvarajat

- Lähtökohta **Tampereen fiktiivinen DEMO-koordinaatti**. Ei pelaajan GPS:ää, ei oikeaa vierailukäskyä, ei validointia julkiseksi POIksi.
- **Kartta:** OpenFreeMap/MapLibre `Dark · tiet ja tekstit näkyviin`, kirjain- ja tiekontrasti säilyy. Kaikille muodoille sama kamera.
- **3D-renderöinti:** MapLibre custom `renderingMode:'3d'`, Three.js, `clearDepth()` ja karttatasojen jälkeen piirtäminen. Tämä säilyttää Androidilla hyväksytyn v0.4.2:n mustien viiltojen korjauksen.
- **Suorituskyky:** esillä vain yksi geometrinen muotovaihtoehto; muut mukana vain vertailutestiä varten. Varsinaisessa pelissä ei pidetä kaikkia vaihtoehtoja muistissa. Geometrian polygonimäärä, efekti, FPS, lämpö ja akku mitataan Androidilla.
- **Tilanne:** 3D-muotokokeilu on ohjelmoitu, mutta sen visuaalinen Android-hyväksyntä, Node-efektien logiikka ja tuotantomallit ovat vielä AVOIN.
