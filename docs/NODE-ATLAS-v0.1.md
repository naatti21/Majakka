# MAJAKKA — NODE ATLAS v0.1
Suunnitteluperusta · 26.10.2026 · EI OLE käytössä nykyisen pelin julkisina nodeina

## Miksi?

Nykyiset LIVE-nodit ovat satunnaisiin karttaruutuihin sijoitettuja **fiktiivisiä testikohteita**, eivät turvalliseksi vahvistettuja vierailupaikkoja. Tämä korvataan oikeisiin paikkoihin perustuvalla tarkistusjärjestelmällä. Yksityiset pihat, vaaralliset paikat ja arveluttavat sisäänkäynnit eivät saa muuttua palkintojen vuoksi pelaajien kohteiksi.

## Kolme objektia

1. **ANCHOR / Ankkuri:** oikea, riittävän merkityksellinen, pysyvä, julkisesti saavutettava ja hyväksytty fyysinen kiinnostava paikka.
2. **ECHO / Kaiku:** fiktiivinen mysteeri ja pelitehtävä, jonka voi ratkaista myös kotona. Se ei ole vierailukäsky eikä väitä olevansa julkinen POI.
3. **NOMINATION / Ehdotus:** avoimesta paikkatiedosta tai pelaajan ottamasta kuvasta syntyvä ehdokas. Ei näy muille ennen hyväksyntää.

## Aineistot

- OpenStreetMapin POI-aineisto: esimerkiksi public art (tourism=artwork), historialliset kohteet (historic=memorial/monument), puistot (leisure=park), näköalat (tourism=viewpoint), kirjastot (amenity=library), museot (tourism=museum), opastetut polut (information=guidepost/board).
- Suomen kaupunkien/kuntien avoimet kohdetiedot, kun käyttöoikeus ja päivitettävyys on tarkastettu.
- Pelaajien omat valokuvat ja täytetyt ehdotukset.
- Majakan oma fiktiivinen sisältö Echo-kerrokseen.

OpenStreetMap-data on ODbL-lisensoitua. Näkyvä attribuutio ja johdettujen tietokantojen share-alike-velvoitteet sekä muihin aineistoihin yhdistäminen pitää selvittää ennen kaupallista käyttöä. Tile-palvelut eivät tarkoita rajoittamatonta POI API -käyttöoikeutta. Ei massahakuja yhteisön julkisiin Overpass-instansseihin pelikonsolien jokaisesta latauksesta.

## Ankkurin neljä hyväksymisporttia

**A. Luokitus ja todellisuus:** tunnettu, pysyvä, tunnistettava kohde; oikea sijainti ja tietolähde; samaa kohdetta ei ole jo hyväksytty.

**B. Turvallisuus ja julkinen kulku:** ei yksityispihaa, asuinrakennuksen takapihaa, alakoulu-/päiväkotialuetta, raidetta, autotietä, vesialuetta, hätäajoneuvoyhteyden tuketta, suljettua teollisuus-/sotilaskohdetta tai muuta herkkää paikkaa. Tarkista todellinen jalankulkuyhteys ja aukiolot; OSM access=yes ei yksin todista turvallisuutta. Access=permissive/customers tai puuttuva access vaatii lisäarvion. Myös yksityisesti omistettu julkisesti käytetty alue arvioidaan tapauskohtaisesti, eikä omistus yksin ratkaise kulkuoikeutta.

**C. Oikea ankkuripaikka:** suuren puiston, urheilukentän tai rakennuksen geometrian keskikohtaa ei käytetä sellaisenaan. Valitse puiston oikea julkinen sisäänkäynti, jalankulkuväylä, pysyvä opastaulu tai muu tarkistettu luonteva lähestymiskohta. Jos tällaista ei voida varmistaa, ei fyysistä ankkuria. Valokuvan ja kartan sijainti sovitetaan toisiinsa.

**D. Ihmisarviointi ja mahdollinen hyväksyntä:** automaattinen arvio antaa statuksen rejected, needs_evidence tai review_ready; mikään näistä ei ole published. Vasta erillinen, luotettava moderointiprosessi voi hyväksyä julkiseen atlakseen. Tarvitaan virheen korjaus, ilmoitus/poisto, valituskäytäntö ja kohteen omistajan poistopyyntö.

Koodi: Node Atlas -esisuodatin on erillinen node-atlas-policy.js, ei osa nykyistä LIVE-spawnia.

## Pelaajan kuvasta ehdotukseksi — mobiili-PWA

1. Pelaaja painaa **Suggest a Light / Ehdota valoa** ja ottaa kuvan tai valitsee omansa galleriasta. PWA-kokeessa HTML-tiedostovalitsin voi ehdottaa takakameraa, mutta tarkka toiminta vaihtelee selaimittain.
2. Nimi, kohdeluokka, lyhyt kuvaus ja miksi kohde on kiinnostava; onko se pysyvä.
3. Pelaaja osoittaa kartalta oikean kohteen / turvallisen julkisen sisäänkäynnin. GPS on vain apu, ei automaattinen julkaistava sijainti.
4. Kuva käsitellään puhelimessa. Poistetaan EXIF ja mahdollinen kuvan sisäinen GPS-tieto uudelleenkoodaamalla; alkuperäistä kuvaa ei lähetetä. Rajataan/peitetään tunnistettavat kasvot, rekisterikilvet ja muut yksityistiedot. Pelaaja vahvistaa kuvaoikeudet. Automaattinen tunnistus ei ole riittävä lopullinen tarkistus.
5. Haluttaessa toinen ympäristökuva **vain tarkastusta varten**, jotta jalankulku ja paikan oikeellisuus voidaan varmistaa.
6. Ensimmäisen version ehdotus tallennetaan **paikallisena luonnoksena**. Julkista lähetyspainiketta ei oteta käyttöön ilman tunnistusta, suostumusta, palvelinpohjaista moderointia, käyttöehtoja ja poistoprosessia.
7. Moderointi voi yhdistää duplikaatin, hylätä, pyytää muutoksia tai hyväksyä. Ehdotuksen lähettämisestä ei palkita Lumenilla — muutoin spämmi kannattaa.
8. Ehdottajan koti-/työpaikkatietoja tai tarkkaa ehdotushetken reittiä ei julkaista. Julkaisun jälkeen paikan voi raportoida vääräksi tai vaaralliseksi ja piilottaa tarvittaessa heti.

## Majakan merkitykselliset nodiluokat

| Oikea paikka | Pelinodi | Eriävä pelaaminen |
| --- | --- | --- |
| Taide ja julkinen muraali | **Prism** | Taittaa valosäikeitä, availee taajuus- ja väritehtäviä |
| Historia, muistomerkki | **Archive** | Antaa valintojen kautta muisto-fragmentteja ja mysteeriä |
| Puisto, opastettu luontokohde | **Grove** | Rauhoittaa ympäristön häiriötä, orgaaninen juurivalaistus |
| Polkujen opaste ja reittien risteys | **Relay** | Välittää ja haaroittaa valoa, vaihtoehtoiset yhteydet |
| Näköala ja turvallinen katselupaikka | **Observer** | Paljastaa kaukaiset heikot kaiut kartalla |
| Kirjasto tai kulttuurikohde | **Commons** | Kollektiiviset muistot ja yhteistoiminnan myöhemmät mahdollisuudet |

Näiden 3D-muoto ei ole identtinen tolppa eri värissä: kohdeluokka määrää efektin, tavan ratkaista ongelmia ja pelillisen vaikutuksen. Edistymisen näkee ympäristössä, ei vain laskurissa.

## Kotisohva + arjen liikkuminen

Kotona voi ratkoa kaikuja, suunnitella valoverkkoa, selvittää historiallisia fragmentteja, valita ratkaisuja ja herättää osaa ankkureista etänä. Kävely mihin tahansa suuntaan kerää Lumenia foreground-LIVE-kokeessa ja voi vahvistaa lähellä olevia signaaleja, mutta ei pakota fyysisiin kohteisiin. Kaikuja tarvitaan myös harvaan asutuilla alueilla, eikä niitä koskaan merkitä todellisiksi vierailukohteiksi.

## Ensimmäinen sopiva testi

- Katselmoi pieni todellinen POI-aineisto testialueelta. **Älä julkaise karttaan automaattisesti.**
- Kirjaa 20–30 ehdokkaan läpäisy/hylkäys ja tarkistuksen syy.
- Testaa yksi puiston sisäänkäynti, julkinen taideteos, museo ja yksi tietoisesti epäkelpo yksityinen kohde.
- Tee erillinen, laitteella pysyvä kuvaehdotuksen luonnos myöhempään prototyyppiin.
- Tämän jälkeen rakentuu yksi vahva tapahtuma: paikan löytäminen → merkityksellinen tehtävä → nodin herääminen → ilmassa kaartuva valosäie → uudet mysteerit.

## Toteutusvaiheet

**Atlas 0A NYT:** sääntökirja, puhdas JavaScript-tarkistin ja turvallisuustestit. **Ei muutosta nykyiseen pelinäkymään.**

**Atlas 0B:** OSM-ehdokkaiden luku erillisessä paikallisessa/moderointisandboxissa, ei julkista spawnausta. Lisenssi- ja kulkuoikeusarvio.

**Atlas 0C:** kuvaehdotus vain paikallisena luonnoksena, EXIF-poisto ja pelkistetty mobiili-UI.

**Atlas 1.0:** ihmismoderoitu julkaisu vasta palvelimen, väärinkäytön eston, tietosuojan, oikeuksien ja poistopyyntöjen jälkeen.

### Tutkitut lähteet

- Wayfarer eligibility: https://niantic.helpshift.com/hc/en/21-wayfarer/faq/2770-eligibility-criteria/
- Wayfarer acceptance: https://niantic.helpshift.com/hc/en/21-wayfarer/faq/2771-acceptance-criteria/
- Wayfarer nomination: https://niantic.helpshift.com/hc/en/21-wayfarer/faq/5543-submitting-a-wayspot-nomination-through-wayfarer/
- Wayfarer photo: https://niantic.helpshift.com/hc/en/21-wayfarer/faq/2769-photo-guidelines/
- Wayfarer rejection: https://niantic.helpshift.com/hc/en/21-wayfarer/faq/2774-rejection-criteria/
- OSM licence: https://www.openstreetmap.org/copyright
- OSM access: https://wiki.openstreetmap.org/wiki/Access
- OSM Overpass: https://wiki.openstreetmap.org/wiki/Overpass_API
- OSM tile policy: https://operations.osmfoundation.org/policies/tiles/
