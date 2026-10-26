# MAJAKKA — AUTO ATLAS v0.1
**26.10.2026 · Toteutettu sääntömoottori, ei vielä tuotantoon ajettu maailmanlaajuinen aineisto**

## Suunnanmuutos

Manuaalinen Node Atlas 0B -kartta EI ole pelimaailman rakentamismenetelmä. Yhden kehittäjän tai pelaajayhteisön ei kuulu tarkistaa maailman jokaista kiinnostavaa paikkaa. **Päämalli on automaattisesti generoitu, paikkatiedosta johdettu pysyvä maailmanverkko.**

Kolme sisältökerrosta:
1. **Fyysinen ankkuriehdokas (walkup_candidate):** olemassa oleva kiinnostava kohde, jolla on _erikseen johdettu_ käveltävä julkinen lähestymispaikka, yhteys julkiseen jalankulkuverkkoon ja eksplisiittiset este- ja pääsyrajoitustarkistukset. Ei absoluuttinen turvallisuustakuu; pelaajalla aina etäaktivointivaihtoehto.
2. **Etänä pelattava todellinen kiinnostava kohde (remote_only):** POI on kiinnostava ja riittävän luotettava, mutta turvallista lähestymistä ei voi osoittaa. Ei oikeaan koordinaattiin osoittavaa lähestymiskehotusta; peliasiakkaalle **ei toimiteta paikan tarkkaa koordinaattia**. Voidaan rakentaa narratiivinen tapahtuma ja valoverkon suunnittelu etäpelinä.
3. **Fiktiivinen Echo:** generoitu pelisisältö, ei väitetty fyysinen kiinnostava paikka eikä satunnainen kävele tähän -koordinaatti. Aina vähintään kuusi etäpelattavaa kaikuobjektia/alue, vaikka POI-kanta olisi täynnä.

**Pelaajan valokuva on valinnainen tietojen täydennyskeino**, ei edellytys maailman syntymiselle. Kuvien julkistaminen ja henkilötiedot vaativat edelleen moderoinnin; pelkän uuden POI-tietueen olemassaolon voi erottaa kuvan julkaisusta.

## Avoimet lähteet ja kaupallistamisen riski

- **Overture Maps Places** on ensisijainen maailmanlaajuinen POI-ehdokaslähde. 21.10.2026 julkaisu: noin 88,4 miljoonaa Places-kohdetta, Overture v2.0.0, uusina kategorioiden lähdekenttinä **basic_category** ja **taxonomy.primary**; vanha `categories` on poistettu. Place ID voi olla pysyvä GERS-tunniste, mutta ID-muutoksia ja duplikaatteja tapahtuu, joten tarvitaan versionhallinta/bridge ja epäselvien kohteiden yhdistys. Overture Places -teeman lisenssi on permissiivinen (CDLA-Permissive-2.0/Apache 2.0 lähteestä riippuen), mutta lähteiden attribuutiot on säilytettävä.
- **OpenStreetMap** täydentää puistojen ja reittien geometrian sekä saavutettavuustiedon (footways, polut, sisäänkäynnit, access/foot-tags), ja kunnan aineisto voi olla ensisijainen paikallinen lisä. OSM ja Overture Transportation ovat ODbL-aineistoa; **yhdistetyn sijaintitietokannan lisenssivaikutukset pitää selvittää**, eikä Overture Placesin salliva lisenssi itsessään vapauta jalan kuljettavuuden tietolähteiden vaatimuksista.
- Käyttäjän kamerakuvat ovat erillinen käyttöoikeus- ja moderointilinja.
- Public Overpass sopii paikalliseen kehitystestiin, **ei** reaaliaikaiseksi maailmanlaajuiseksi pelin tietopalvelimeksi. Tuonti rakentuu ajoittain palvelimella tai paikallisesti alue-extracteista ja julkaistaan pienten, välimuistiin menevien aluetiedostojen kautta.

Tutkitut lähteet:
- https://docs.overturemaps.org/blog/2026/10/21/release-notes/
- https://docs.overturemaps.org/guides/places/
- https://docs.overturemaps.org/schema/reference/places/place/
- https://docs.overturemaps.org/attribution/
- https://docs.overturemaps.org/guides/transportation/
- https://wiki.openstreetmap.org/wiki/Access
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://www.openstreetmap.org/copyright

## AutoGenin nykyiset säännöt (pure JS)

Koodi: `atlas-autogen.js`, testit `tests/atlas-autogen.test.mjs`.

**Syöttö:** yksilölliset POI-tietueet normalisoituna kenttiin id/source/name/category/point/confidence/access/walking/entrance/overlays. Luotetun GIS-tuontiputken pitää **laskea**, ei käyttäjän mielivaltaisesti asettaa `walking.connectedToPublicNetwork`, `access.publicPedestrian`, `entrance.publiclyApproachable` ja vaarallisten alueiden `overlays`-luokitukset. Tässä prototyypissä näitä **ei vielä johdeta raakadatasta**.

**1. Tunnistus:** vain pelin kannalta merkitykselliset luokat (taide, historia, puisto, opastetut polut, näköala, kirjasto, kulttuuri ja luonto). Ei jokaista kauppaa, kotia tai ravintolaa. Tyyppi määrää Prism, Archive, Grove, Relay, Observer, Commons -toiminnon.

**2. Ehdottomat esteet:** suljettu kohde, eksplisiittisesti yksityinen, koulu-/päiväkotialue, sairaala, hätäajoneuvoväylä, raide, moottoritie, vesi tai muu arkaluonteinen/rajoitettu alue. Puuttuva tieto ei ole sama kuin turvallinen.

**3. Luotettavuus:** ensisijaisesti tunnettujen POI-lähteiden luotettavat kohteet. Esimerkkiraja olemassaolotiedolle 0,70 ja fyysisen aktivoinnin ehdokkaalle 0,82; **nämä ovat alustavia, testaamattomia suodatinparametreja, eivät kalibroitu turvallisuustodennäköisyys**. Overturen confidence kuvaa kohteen olemassaoloa, ei pääsyoikeutta.

**4. Kulkuyhteys:** walkup_candidate vain, jos julkinen jalankulku sallittu, yhteys julkiseen jalankulkuverkkoon olemassa, tarkistettu julkinen sisäänkäynti/lähestymispiste ja korkeintaan 40 m tarkistetusta kulkureittiyhteydestä. Jos näitä ei tiedetä → remote_only; lähestymispistettä ei keksitä alueen keskelle.

**5. Hajautus:** tasainen näkyvyys vähintään kilometrin säteellä. Prototyyppi hakee 1 km ympyrästä enintään 24 fyysistä/todellista ankkuriehdokasta, 125 m vähimmäisetäisyyden valittujen kohteiden välillä, 45 m nimikohtaisen duplikaattiyhdistämisen, toistuvien luokkien vähentämisen sekä etusijan korkealle datalaadulle ja hyvälle julkiselle saavutettavuudelle. Tämä ei takaa kaikilla paikkakunnilla samaa määrää, koska todellisia kohteita ei saa keksiä.

**6. Ekologia:** valoverkko syntyy relevanttien kohteiden merkitysten ja topologian kautta, ei pelkistä satunnaisista kolmioista. Kulttuuri/taide/historia/luonto vaikuttaa tehtävään, valosäikeen käytökseen ja myöhempiin valintoihin. Peruspelin toteutus vielä erillinen.

**7. Etäpelaaminen:** aina vähintään kuusi täysin digitaalista Echo-tehtävää vyöhykkeellä. Liikkuva pelaaja hyötyy Lumenista; kotona voi tutkia kaikuja ja suunnitella/ratkoa verkostoa. Fyysisille ankkureille ei sallita painostavaa viimeistele juuri tässä pihalla -mekaniikkaa.

**8. Pysyvyys ja päivitykset:** syötteiden järjestys ei muuta tuloksia, ID perustuu lähdetunnisteeseen tai vakaaseen aluetunnisteeseen. Sama alue generoi saman objektijoukon samasta dataversiosta. Tuonti tehdään erissä (esim. kuukausittain), poistetut tai käyttörajoitetut kohteet poistuvat/muuttuvat remote-tilaan. Käyttäjän peliedistyminen viittaa lähde-ID:ihin, eikä synny jokaisella kartan siirrolla uudestaan.

## Tuotantoputki

`Overture Places PBF/Parquet + OSM jalankulkuverkko/polygoni + kunnan POI` → lähdeattribuutit ja tuoreus → normalisointi → POI-luokittelu → kielletyt alueet → jalankulkureitin ja sallittujen sisäänkäyntien GIS-validointi → deduplikointi → hajautus → deterministinen paikkatietovyöhyke ja pelinodit → versioitu ja välimuistitettu Atlas-karttaindeksi → asiakkaalle näkyvä pelimaailma.

**Ei kyselyä maailman kaikkiin palvelimiin joka kerta kun puhelin avataan.** Tuontiajan suurtyö tehdään eräajona, ja asiakas hakee vain katselun kannalta sopivat pienet alueresurssit. Ensimmäinen tekninen kokeilu voidaan tehdä yhdelle kaupungille/maakunnalle, mutta sama sääntömoottori on maantieteellisesti yleistettävissä.

## Mitä tämä prototyyppi EI väitä

- Ei ole ladannut koko Overture-aineistoa tai Suomen POI-verkostoa.
- Ei vielä muodosta todellisesta kartasta käveltävyysgraphia, laske puistojen sisäänkäyntejä eikä tunnista jokaista vaarallista risteystä.
- Ei vielä siirrä oikeita POI-nodeja nykyiseen LIVE-peliin.
- Ei takaa käyttäjän turvallisuutta pelkällä OSM- tai Overture-tietueella.
- Ei ole kokonaisen maailman valmista serveriä, moderointia tai kuvien julkaisujärjestelmää.
- PWA:n nykyinen 12 minuutin etualan GPS on edelleen erillinen rajoitus.

## Seuraavan kehitysvaiheen hyväksymiskriteeri

Ei uutta käsin klikattavaa Node Atlas Review Lab -kierrosta. Sen sijaan automaattinen **alueellinen importtitesti** yhdellä hallitulla aineistolla, joka tuottaa kartan täyteen Prism/Grove/Archive ym. nodeja ilman yhtään manuaalista hyväksyntäpainallusta. Samalla valvotaan väärää sijaintia, yksityisalueita, jalankulkuyhteyden epävarmuutta ja etäaktivointia.

Laadun mittarit: (i) käveltävien ehdokkaiden todellinen osuus, (ii) vaarallinen/epäselvä sijoittelu, (iii) duplikaatit, (iv) nodien hajautus 1 km näkyvyydessä, (v) tekemisen mielekkyys kotona ja kävelyllä. Vasta tämän jälkeen kytkentä elävään peliin.
