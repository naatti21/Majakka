# MAJAKKA — APP-SPEC v0.2

**Päivä:** 2026-10-24  
**Tila:** Ensimmäinen paikallinen synteettinen v0.1-prototyyppi toteutettu; mobiilijulkaisua ei vielä varmennettu  
**Yhteinen kehitysohje:** App Engineering Playbook v1.9.2  
**Kieli:** peli ja pelin käyttöliittymä englanniksi; sisäinen kehityskeskustelu suomeksi.  
**Nimi:** Majakka on työnimi; kansainvälistä brändinimeä ei ole lukittu.

## Toteutuksen delta 24.10.2026

- **Toteutettu prototyypissä:** kolme kuvitteellista aluetta, 22 julkista nodia, kolme pientä signaalihaastetta, simuloidut viivästetyt purskeet, oma Beacon-merkki ilman julkisia linkkejä, IndexedDB, paikallinen päiväkirja, opt-in-äänet, offline-PWA-kuori.
- **Ei vielä toteutettu:** viiden oikean turvapaikan määrittely, todellinen GPS/karttadata, pelaajien keskinäinen rihmasto, palvelin ja huijauksenesto, matkaecho sekä oikean maailman turvallisuusarvio.
- **Tekninen päätös:** ensimmäinen julkaisutiedostopaketti on suoraan ajettavaa HTML/CSS/JS:ää ilman build-komentoa. Aiemmin ehdotettu TypeScript/Vite arvioidaan vasta monimoduulisessa vaiheessa; Playbook-periaatteet pysyvät.
- **Laatutaso:** Node-testit ja selainlogiikan offline-eristystestaus tässä ympäristössä; fyysisen Androidin Pages-testit odottavat käyttäjän arviota.

## 1. Tuotelupaus

**“Valaistaan maailma jälleen.”** / *Restore the Light. Reconnect the World.* (englanninkielinen slogan vielä ehdotus)

Majakka on rauhallinen, näyttävä, paikkatietoon kytkeytyvä peli, jossa maailma palautuu vähitellen kohinasta harmoniaan. Pelaajat eivät kilpaile joukkueina eivätkä näe toistensa sijainteja. Toisten läsnäolo näkyy viivästettyinä, yhteisinä muutoksina julkisissa nodeissa ja rihmastossa.

**Lukitut suunnittelurajat:**
- Ei Alliance/Horde-tyyppisiä joukkueita tai aluevaltauksia.
- Liikkumattomuudesta ei rangaista; koti- ja kahvitaukosessioilla on oikeaa sisältöä.
- Yksittäisen käyttäjän liikettä, läsnäoloa tai kulkureittiä ei julkaista.
- Koti, työ ja kolme muuta yksityistä turvapaikkaa näkyvät vain omalle käyttäjälle, eivätkä linkity julkiseen verkkoon.
- Nodit voivat heiketä/hiipua, mutta eivät kuole pysyvästi.
- Julkisen verkon muutokset tapahtuvat viivästetyissä purskeissa, eivät livenä.
- Visuaalinen suunta: tumma, premium, hillitty neon, orgaaninen rihmasto, pehmeä valo ja laadukas liike/ääni. Ei pakollista 3D:tä tai AR:ää.

## 2. Pelin tilat

**Kuuntelu / Home:** lyhyt 1–5 minuutin pelisessio, jossa käsitellään jo löytyneitä signaaleja, koetaan maailman muutoksia ja tehdään merkityksellinen pieni valinta. Ei päivittäistä kirjautumispakkoa.

**Tutkiminen / Explore:** sovelluksen ollessa auki pelaaja voi löytää julkisia nodeja, vahvistaa niitä sekä löytää signaalityyppejä. Haja-asutusalueet eivät saa olla tyhjiä; tiheys ja arvokkuus eivät perustu pelkästään kaupunkien POI-määriin.

**Matkakaiku / Travel Echo (myöhempi):** vapaaehtoinen opt-in-tila, jossa matkan aikana kohdattuja alueita voidaan auttaa hitaasti. Julkaisu perustuu aggregaatioon ja viiveeseen; ei julkista reittiviivaa. Lentäminen ei automaattisesti aktivoi kaikkia alle jääviä nodeja. Ajoneuvoa ajaessa ei vaadita näytön käyttöä.

## 3. Julkinen maailma

- Nodi: julkinen turvallinen karttakohde tai pelin hyväksymä julkisen alueen ankkuri.
- Nodin elinkaari: uinuva → heräävä → hehkuva → kiintotähti; visuaalinen voimakkuus voi laskea pysyvän historian katoamatta.
- Linkki: mahdollinen kahden julkisen nodin välinen yhteys, jota voi tukea riittävästi toisistaan riippumattomien osallistujien kollektiivinen toiminta.
- Purske: aikataulutettu ja viivästetty julkisen maailman tilapäivitys; samalle käyttäjälle rajoitettu vaikutus ja cooldown.
- Rihmasto: yhteinen maailman kerros; jokaisella pelaajalla lisäksi oma yksityinen löytö-/kuuntelukerros.
- Musiikki: nodit, yhteydet ja alueet muodostavat kasvavia sointirakenteita; kaupungin sinfonia ei saa tehdä harvasta alueesta arvotonta.

**Ei vielä lukittu:** mikä on aidosti kiinnostava 2–5 minuutin ydintehtävä, millaisia signaalien tulkinta-/rytmi-/logiikkahaasteita se sisältää, miten osaaminen kasvaa ja millaiseen pitkän ajan päämäärään se liittyy. Näitä ei naamioida valmiiksi peliksi.

## 4. Tekninen linja

### Vaihe A — paikallinen pelattava PWA, ei palvelinta
- Prototyyppi v0.1: staattinen HTML/CSS/JavaScript ilman käännöstä, mobiili ensin. TypeScript + Vite optio myöhemmin tarpeeseen.
- Julkaisu: oma GitHub-repo; Cloudflare Pages -esikatselu olemassa olevan toimintamallin mukaan.
- Kartta: aluksi tyylitelty synteettinen kartta; myöhemmin MapLibre GL JS ja asianmukaisesti lisensoitu karttatiilipalvelu.
- Visuaalit: SVG/Canvas ja tarvittaessa kevyet WebGL-efektit; suorituskyky mitataan oikealla Android-puhelimella.
- Äänet: Web Audio API; vähintään myös äänetön/visuaalinen pelitapa.
- Tallennus: IndexedDB, paikalliset saavutukset, asetukset ja muutokset; versioitu skeema.
- Sijainti: ensin valinnainen foreground-GPS, ei lupauksia suljetun PWA:n taustasijainnista.

### Vaihe B — rajattu yhteinen maailma
- Esimerkkivaihtoehto: Supabase Postgres + PostGIS (julkiset nodit, spatiaalikyselyt), RLS/suljetut palvelinoperaatiot ja Cron/Edge Functions (viivästetyt purskeet).
- Kaikki julkiset vaikutukset lasketaan palvelinpuolella: vastaanoton rajaus, deduplikointi, cooldown, riittävän monen riippumattoman osallistujan vähimmäisraja, viive ja väärinkäytön esto.
- Tietoturvan uhkamalli tarkistetaan ennen ensimmäistä julkista synkronointia. "Nimetön" ei tarkoita automaattisesti, ettei yksittäistä pelaajaa voida päätellä.
- Backend on tekninen ehdotus, ei valittu sopimus eikä luotu palvelu.

### Vaihe C — natiivikuori vain todettuun tarpeeseen
- Jos opt-in-matkakaiku vaatii sijaintia taustalla, tutkitaan Capacitor-paketointi Androidille ensin ja tarvittaessa iOS:lle.
- Capacitorin tavallinen Geolocation-plugin ei suoraan tarjoa taustapaikannusta; se vaatii erillisen natiivin ratkaisun, lupakäytännöt, akkukokeet ja sovelluskauppojen säännöt.
- Taustapaikannus ei ole prototyypin edellytys. Ei oletusarvoista seurantaa.

## 5. Tietosuojan suunnittelurajat

1. Turvapaikkojen tarkat koordinaatit vain paikallisessa säilytyksessä, eivät osaksi julkisia linkkejä tai synkronoitavaa raakareittiä.
2. Julkisiin nodeihin kohdistuvat vaikutukset eivät saa paljastaa kotia, työtä tai yksittäistä matkaketjua. Tarvitaan myös yksityisyyttä suojaava käsittely turvapaikkojen lähellä.
3. GPS:n pyöristäminen ei yksin riitä anonymisoimaan liikettä. Suunnittele raportointitiheys, yhteenvetoalueet, viive, kynnysarvot, kyselyrajat ja tietojen poistaminen yhdessä.
4. Cooldown ja "eri käyttäjiä" -ehto vaativat väärinkäyttöä kestäviä tunnisteita tai vastaavan mekanismin. Tätä ei voi luvata sekä täysin tunnisteettomaksi että huijausvarmaksi ilman suunnittelua.
5. Pelaaja voi kieltäytyä sijaintiluvasta ja silti kokeilla pelin ydintä.
6. Testeissä ei käytetä oikeita käyttäjien koti-/työ-/kulkureittitietoja.

## 6. Ensimmäinen prototyyppi — tarkka laajuus

**Tavoite:** testata, onko Majakka pelinä kiinnostava myös sohvalla, ei rakentaa kokonaista paikkatietopalvelua.

- Kolme simuloitua aluetta: keskusta, pieni taajama ja harva maaseutu.
- 15–30 synteettistä julkista nodia ja viisi erillistä yksityistä turvapaikkaa (testikoordinaatit).
- 3–4 visuaalista noditilaa, mahdollisia yhteyksiä, yksi hidas purskemalli ja aikasiirto 7 päivän yli.
- Vähintään kolme erilaista pienhaastetta samalla signaalikielellä; toistoja ja vaikeustasoja testataan, ei rakenneta vielä massatuotantoa.
- Home/Explore-näkymät, alkuperäisen Majakka-tyylin mukainen käyttöliittymä, yksi hallittu animaatioketju ja kevyt äänimaailma.
- Käyttäjän oma edistyminen säilyy reloadin yli ja toimii offline-tilassa (karttatiilien offline-ehtoja rikkomatta).

**Hyväksymisportti ennen palvelinta:**
- Pelaaja ymmärtää ensimmäisessä sessiossa, mitä tekee ja miksi.
- Kolme lyhyttä sessiota eivät ole vain saman viritysrutiinin toistoa.
- Harvan alueen simulaatio tuntuu mielekkäältä eikä rankaise paikallaan pysymisestä.
- Visualisointi toimii sujuvasti oikealla Android-puhelimella, ja tärkeät tekstit ovat luettavia.
- Turvapaikkojen erillisyys, offline-käytös ja tallennuksen säilyminen voidaan osoittaa testeillä.
- Ulkoisen maailman toteutukseen EI edetä ennen kuin ydinkoukku on osoittanut lupaavuutta.

## 7. Dokumentaatio ja QA

- Tämä `APP-SPEC` on Majakan oma dokumentti, eikä muuta muiden sovellusten speksejä.
- `GAME-LOOP-LAB.md`: testattavat pelisilmukat, hyväksymisehdot, käyttäjäpalautteen löydökset (luodaan kokeiden yhteydessä).
- `PRIVACY-THREAT-MODEL.md`: ennen todellisen sijainnin yhteiskäyttöä (luodaan ennen vaihetta B).
- Uutta yhteistä Playbook-versiota ei tarvita tällä hetkellä; yleispätevät opit voidaan lisätä myöhemmin delta-muutoksina.
- `00_NOW`: lisää Majakka omaksi **konsepti/prototyyppi, ei tuotantoon** -riviksi, kun repositorio tai ensimmäinen testiversio todella syntyy.
- Perus-Quality gate: yksi kanoninen testikomento; Node-yksikkötestit + Playwright-mobiili/sijaintikielto/offline; GitHub Actions; julkaisujen GO/NO-GO Playbookin mukaan.
- Toimitus mobiilityönkulkuun: vain muuttuneet GitHub-tiedostot ja niiden tarkat polut; `.js`/`.ts` tarvittaessa ZIPinä.

## 8. Päätettävät kysymykset

1. Onko 2–5 minuutin kuuntelu-/logiikkatoiminto aidosti hauskempaa kuin rutiiniviritys?
2. Mikä on merkityksellinen pelaajan valinta, jonka seuraus näkyy myöhemmin?
3. Miten yksinpelaaja etenee, jos muita pelaajia ei ole lähialueella?
4. Mikä on opt-in-matkakaiun minimiseuranta ja sallittu virrankulutus?
5. Millainen musiikillinen rakenne skaalautuu yhdestä nodista kaupungin sinfoniaan?

## 9. Viralliset tekniset lähteet (tarkistettu 24.10.2026)

- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- Capacitor: https://capacitorjs.com/docs
- Capacitor geolocation: https://next.capacitorjs.com/docs/apis/geolocation
- Supabase PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Supabase Cron: https://supabase.com/docs/guides/cron
- OpenStreetMap tile usage: https://operations.osmfoundation.org/policies/tiles/
- Android background location guidance: https://support.google.com/googleplay/android-developer/answer/9799150

**Tarkastettu / Validated:** tämä on keskustelussa vahvistettujen periaatteiden ja erikseen merkittyjen teknisten ehdotusten johdonmukainen lähtödokumentti, ei toteutus- tai testiraportti.
