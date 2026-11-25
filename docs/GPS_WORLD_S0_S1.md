# Majakka GPS World · S0 ja S1

## Käynnistä kehityshaara

Tarvitset Node.js 22.12+ tai 24:n, npm:n, Python 3:n ja modernin selaimen. Suorita repon juuressa.

```sh
git switch feature/gps-world-s1
npm ci --prefix world --ignore-scripts
python3 -m http.server 4187 --bind 127.0.0.1
```

Avaa [paikallinen peli](http://localhost:4187/world/). Androidissa voit käyttää USB-virheenkorjausta ja komentoa `adb reverse tcp:4187 tcp:4187`, sitten samaa localhost-osoitetta puhelimen Chromessa. Lähiverkon etäpelaamista varten sido palvelin oman verkon osoitteeseen ja avaa puhelimella `http://TIETOKONEEN-IP:4187/world/`. GPS vaatii selaimen luottaman HTTPS-yhteyden tai localhostin. Sivun lataus ja GPU-testi onnistuvat ilman sijaintilupaa.

Tampere avautuu kartan katselukeskuksena. Valitse Vanhankirkonpuisto kartalta, tarkista lähde ja kirjaa sen vahvistama havainto. **Use GPS** aloittaa etualan seurannan ja **Show my position** siirtää kameraa. Hyväksytyt kävelyosuudet keräävät Lumenia. Lähihavainto vaatii tuoreen sijainnin. Nokian ja Ruoveden aluevalinnat avaavat etätutkimuksen. Tutkimusmerkinnän voi tallentaa kerran kohdetta kohti. S1:n muistiinpano ei herätä Nodea tai anna S2-tutkimuskrediittiä.

## S0 · lähteet, ristiriidat ja riippuvuudet

Lähtökohta on main `188225ab0f2d71d35a3f85cf85fd287f27ffc1fd`. Paikallinen lähtöajo läpäisi 32 testitiedostoa ja Worker-syntaksitarkistuksen. [Mainin kooditarkistus](https://github.com/naatti21/Majakka/actions/runs/45460003294) ja [silloinen Pages-ajo](https://github.com/naatti21/Majakka/actions/runs/45460004644) onnistuivat.

| Osa | Tila ja ratkaisu |
|---|---|
| Main PWA, atlas-core, atlas-world, landmark-world, pilot-sites | Vanha neliluokkainen Atlas ja kahdeksan lähteistettyä esimerkkipaikkaa palvelevat vanhaa sovellusta. Kartan keskipisteestä johdettu toiminta, asiakaspuolen aluehaku ja automaattinen ensimmäinen yhteys eivät sovi tähän reittiin. |
| Atlas AutoGen ja kävely | S1 käyttää olemassa olevaa kuuden Node-tyypin luokittelua, laatuvalintaa, etäisyysrajaa ja determinististä harvennusta sekä walk-energy.js:n liikehavaintoja. AutoGenin generoimia virtuaalikaikuja ei julkaista POI-katalogissa. |
| PR #2–3 | PR #8:n kärjestä `e955d410bce1253284574237ea23d00dd90c17d7` tuotiin muuttamattomat geo-, wallet- ja balance-config-moduulit. Identiteetti viittaa julkaistuun lähdetunnukseen. Ehdokasbalanssi antaa 8 L alussa, enintään 18 L, ansaintakatto 10 L / liukuva 24 h. Kanavointi 4 L / 20 h. Kävely 70 m / L tulee mainista. 150 m on erillinen lähitoiminnan koekäyttöraja. |
| PR #4–5 | S2 käyttää graph/relay/field-moduulien esikatselua ja sitovaa toimintoa. Kolme vahvistettua reunaa tarvitaan kenttään. S4 käyttää palautuvaa Interference-tilakonetta. Nykyinen paikallinen havainto ei muuta maailman graafia. |
| PR #6 | Gate 2 catalog-policy validoi identiteetin, lähdealiakset, käyttöluokan ja attribuution **tuonnissa**. Sen sisäinen geo-kenttä kuuluu myös etäkohteelle, joten asiakas saa erillisen sallittujen kenttien projektion. |
| PR #7–8 ja #17 | The Missing Beat on fiktiiviseen aineistoon sidottu tutkimustapaus. PR #8:n session/receipt on viite myöhemmälle pelille. Hylätty #17:n kolmen majakan painikekoe säilyy arkistona. |
| Esitys ja assetit | MapLibre Dark, vapaa kamera ja mallien viimeisenä piirto sekä clearDepth ovat lähtökohta. S1 käyttää kuutta node-family-v01-rakennetta. v082-usva ja orgaaniset säikeet kuuluvat vasta todelliseen verkkoon. Native-haarassa on Flintailin card-concept.webp ja esityskokeita, tämän haaran verkossa ei ole hyväksyttyä valmista kerättävää Flintail-mallia. |
| Palvelin | Worker/D1:n anonyymit operaatiot eivät ole jaetun maailman auktoriteetti. S1 ei kutsu Workeria. Lähteiden lisenssiyhdistelmä, kenttävalidointi, backend, balansoitu eteneminen ja Android-hyväksyntä ovat avoinna. |

## Aluekatalogi ja pääsytodiste

Tampereen muuttumaton lähtöaineisto on oman Native-haaran 9.11.2026 noutama 3 707 OSM-wayn ote. Tuonti lukee tunnisteet, geometrian ja tagit, soveltaa Atlas-politiikkaa ja tuottaa sisältötiivisteellä nimetyt aluepalat sekä manifestin. Yksityisenä työaineistona käytetty tiivistetty ote ei sisällä kattavia pääsyrajoitustageja. Pelkkä `park` tai `footway` ei riitä. Siksi kaikki muut sisäänkäynnit jäävät vahvistamatta.

Vanhankirkonpuiston tunniste on `osm:way/1528781437`. Tampereen kaupungin aluekuvaus käsittelee puiston jalankulkua ja Keskustorin yhteyttä. OSM-otteen puiston raja, kävelytie 71464310 ja jalankulkualue 1528794859 jakavat täsmälleen yhden pisteen. Erillinen pääsyarvio sidotaan juuri tähän nimettyyn kohteeseen ja tarkistettuun lähderevisioon. Jos liitos puuttuu, peli saa etäkohteen. Tämä on kartta-aineistolla tarkistettu pilottiehdokas. Tilapäiset työmaat, tapahtumat, talviolosuhteet ja maastotilanne vaativat paikallisen arvioinnin. [Tampereen kaupungin puisto- ja kulkuohje](https://tapahtumajarjestajalle.tampere.fi/tapahtumapaikat/kirjastonpuisto/) · [OSM-ote](https://github.com/naatti21/Majakka/blob/e684e4e04487adf1984c3cdedc05cfe5e92e7c32/native-client/assets/maps/tampere-vector-pilot.json)

| Alue | Lähde | Kartalla | Vain etätutkimus |
|---|---|---:|---:|
| Tampere | OpenStreetMap ja kaupungin pääsyarvio | 1 | 4 |
| Nokia | Wikidatan Ossi Somman veistospuisto | 0 | 1 |
| Ruovesi | Wikidatan Helvetinjärven kansallispuisto | 0 | 1 |

Tampereen tuonti hylkäsi nimellisistä riveistä 55 poissulkuehdolla ja 515 puuttuvan luokituksen takia. Valinta harvensi vielä 17 kohdetta. Nokian ja Ruoveden lähdekorteissa on tarkistetut P31/P625-poiminnat, joista työaineistoon jäi vain 0,1 asteen tarkkuus. Nämä ovat pieniä lähdeotoksia. Julkisissa etäkorteissa on nimi, tunniste, tyyppi ja lähde, eikä koordinaatteja. OSM-aineiston attribuutio on © OpenStreetMap contributors (ODbL 1.0), Wikidatan CC0. Kaupungin tekstiä ei jaeta aineistona. [Nokian tietue](https://www.wikidata.org/wiki/Q116739418) · [Ruoveden tietue](https://www.wikidata.org/wiki/Q937131) · [OSM-lisenssi](https://www.openstreetmap.org/copyright)

Uusinta repon juuressa: `git fetch --depth=1 origin e684e4e04487adf1984c3cdedc05cfe5e92e7c32` ja `node tools/world/import.mjs`. Vaihtoehtoisesti anna tarkistetun JSON-otteen polku argumenttina. Tuonti tarkistaa SHA-256:n ennen pääsyarvion käyttöä. Lähteen uusi versio vaatii uuden katselmuksen. Aluevalinta ei laukaise ulkoista POI-hakua. Raportointilinkki valmistelee julkisen GitHub-issuen kohdetunnuksella. Ylläpitäjä voi peruuttaa kohteen lisäämällä tunnuksen tiedostoon `tools/world/withdrawn.json` ja ajamalla tuonnin. Uusi manifesti pudottaa perutun kohteen. Vanhojen staattisten palojen poistaminen jakelusta kuuluu julkaisuvaiheeseen.

## Tekninen sopimus

- Katalogiasiakas lukee näkymään osuvat aluepalat enintään kaksi kerrallaan, peruu vanhan näkymähaun ja säilyttää sisältöversiot istuntomuistissa. Kaukonäkymä ryhmittelee pisteet. Lähinäkymässä on enintään kahdeksan 3D-mallia. Paikallinen 2D-kartta sekä nimettyjen katujen Tampere-ote palvelevat verkkovirheessä. Pilotti tarvitsee staattisen palvelimen myös paikallisia tiedostoja varten.
- GPS-piste ja kamera ovat eri olioita. Julkiset karttatiilet pyydetään katsotusta alueesta. Kävelyn ankkuri ja avatar elävät vain muistissa. Tuoreusraja on 20 s, suurin hyväksytty epätarkkuus 35 m ja kävelyn nopeusraja 4,5 m/s. Lähitutkimuksessa etäisyys **plus** tarkkuussäde saa olla enintään 150 m. Piilotus ja luvan peruutus pysäyttävät seurannan. Web Lock sallii liikkeen hyvityksen vain yhdelle välilehdelle kerrallaan.
- S1:n `NodeAction` kirjaa lähteistetyn etähavainnon tai lähihavainnon kohteen tunnukselle. IndexedDB:n yksi readwrite-transaktio lukee, validoi ja kirjoittaa lompakon ja merkinnät. Tuntematon skeema säilytetään. Tallennusvirhe jättää kirjoituksen vahvistamatta. `Movement` ja `Channel` käyttävät PR #3:n lompakkoreduktoria. Tapahtuma-ajat tallentuvat lompakkoon, GPS-pisteet eivät.
- Seuraavien vaiheiden toimintojen viittausavain on katalogin muuttumaton worldNodeId. S2:n `LinkAction` sisältää päätepisteet, operationId:n ja version sekä edellyttää graph-moduulin kustannusesikatselua. S3:n `Encounter` viittaa encounterId:hen ja species/form/instance-tunnisteisiin, `TalentAllocation` pelaajaan tai yksilöön ja pistekirjanpitoon. S4:n `InterferenceEvent` viittaa tapahtuman revisioon ja voimassaoloon. S1-reduktori hylkää tuntemattoman toiminnon. S2:n ensimmäinen tehtävä on kytkeä ensimmäinen kartalta valittu, oikeaan kohteeseen sidottu vahvistusoperaatio node-reduktoriin.

## Todennus

```sh
node --test tests/*.test.mjs
node --check backend/worker.mjs
npm ci --prefix world --ignore-scripts
(cd world && npx playwright install --with-deps chromium)
# Staattinen palvelin käynnissä portissa 4187
node world/browser-qa.mjs
```

CI käyttää Ubuntu 24.04:ää ja PR:n head-SHA:ta. Playwright avaa oikean MapLibre/WebGL-kartan kahdella pystyleveydellä. Toistettavassa testissä OpenFreeMapin etätyyli estetään tarkoituksella ja OSM-katuote piirretään paikallisesti. Sijaintilupa ja selaimen paikkarajapinta testataan simuloiduilla sijainneilla. Erillinen ajastettu 90 m kävely tuotti yhden Lumenin, joka säilyi latauksessa. Ilman WebGL:ää 2D-valinta toimi. Ulkoisten karttatiilien tuotantotoiminta, fyysinen Android-kävely, akku, lämpö ja pitkäkestoinen FPS jäävät avoimiksi. S1 ei sisällä palvelimen vahvistamia sijainteja tai verkkotaloutta. [390 × 844](evidence/gps-s1/atlas-390.png) · [412 × 915](evidence/gps-s1/atlas-412.png)

Kehitysympäristön koonnissa 33 testitiedostossa oli yhteensä 217 läpäistyä Node-testiä. Myös Worker-syntaksitarkistus läpäistiin. Chromiumin ohjelmistorenderöinnissä ensimmäinen valittava karttakohde ilmestyi esimerkkiajoissa noin 1,1–1,3 sekunnissa. Mittaus koskee paikallista palvelinta, ei mobiiliverkkoa tai Androidin ruutunopeutta. Playwright tarkisti myös estyneen IndexedDB-tallennuksen. Katalogin lähdetiedostosta uudelleenajo tuotti samat julkaistavat tiedostot.

## Puhelimen HTTPS-esikatselu
Staattinen jakelupaketti: `npm ci --prefix world --ignore-scripts` ja `node tools/world/build-preview.mjs`. Valmis `.preview-build/` sisältää vain tarvittavat pelitiedostot, lukitut npm-ajonaikaiset kirjastot ja katalogin. CI ajaa myös valmiin paketin selainpelitestin ja tuottaa `gps-world-static-preview`-artefaktin. Artefakti EI itsessään ole toimiva puhelinpelilinkki. Julkaise sisältö erilliselle HTTPS-esikatselupolulle vasta omistajan hyväksynnällä; säilytä olemassa oleva Pages-julkaisu, älä vaihda sen lähdehaaraa. Testaa URL ja GPS-lupa julkaisemisen jälkeen. Ei muutoksia gameplayhin tässä paketointikorjauksessa.
