# MAJAKKA — Node Atlas 0B review lab (26.10.2026)

## Käyttö

**URL:** https://naatti21.github.io/Majakka/atlas-review.html

1. Avaa erillinen tarkastusnäkymä. Se käynnistyy Tampereen vanhasta demokeskuksesta eikä lue laitteen GPS:ää.
2. Siirrä karttaa haluamallesi alueelle. Ristikon kohta on hakukeskus.
3. Paina **Find OSM candidates**. Vasta tämä painike pyytää julkisesta Overpass-palvelusta OSM-kohteita 1,2 km säteellä.
4. Napauta ehdokasta listalta tai kartalta. Näet kohdeluokan, lähteen, koordinaattien epätarkkuuden ja esiseulonnan perustelut.
5. Kirjaa vapaaehtoinen istuntomerkintä: Visit-check, Research tai Skip. Ne eivät ole julkaisuhyväksyntä.
6. **Copy review report** kopioi tunnisteet, kohteiden koordinaatit, luokittelun ja omat merkinnät JSON-muodossa. Tietoja ei lähetetä Majakan palvelimelle. Liitä raportti tarvittaessa ChatGPT Workiin arvioitavaksi.
7. **Clear this session** poistaa ehdokaslistan ja merkinnät muistista. Sivun sulkeminen hävittää merkinnät samoin.

## Tekninen toteutus

- Käytetään vanhaa MajakkaRaster 2D -moottoria, ilman uusia CDN-JavaScript-riippuvuuksia.
- OSM-ehdokasryhmät: taide, muistomerkit, näköalat, museot, kirjastot, yhteisötilat, polkuopasteet, puistot.
- Manuaalinen Overpass QL -kysely, palvelinrajoitus 18 s, verkkopyynnön 29 s katkaisu, enintään 125 tulosta ja radius 1200 m.
- Julkisen palvelimen suoja: enintään uusi pyyntö 90 sekunnin välein, samaa aluetta koskeva vastaus 30 minuuttia istuntomuistissa.
- OSM-polygoneista laskettu keskipiste EI todista kohteen sisäänkäyntiä eikä julkista kulkuyhteyttä.
- Ehdokkaat luokitellaan vaiheisiin needs_evidence, rejected ja review_ready. Mikään ei salli automaattista julkaisemista: publicationAllowed on aina false.
- Ei tallenna hakualuetta, GPS-reittiä tai tarkistusmerkintöjä paikalliseen tietokantaan. Vierailtu kartta-alue näkyy kuitenkin karttatiilipalvelulle. Käyttäjän itse tekemä hakupyyntö lähettää valitun hakukeskuksen Overpass-palvelulle.
- Ei julkisia nodeja, ei kuvalatausta, ei moderointikäyttäjiä, ei verkon yli tapahtuvaa julkaisua.
- Tulokset voivat olla vääriä, vanhentuneita tai turvallisuuden kannalta puutteellisia. Ihmistarkastus pakollinen.

## Mitä pitää arvioida seuraavaksi

- Onko 20–30 oikeasti löydetystä OSM-kohteesta riittävästi turvallisia, kiinnostavia ja tarkoituksenmukaisia Majakan ankkureiksi?
- Voiko jokaiselle potentiaaliselle ankkurille osoittaa todellisen, julkisen jalankulkureitin tai opasteen?
- Onko erityisesti puistoista vain kartan geometrisia keskipisteitä (ei kelvollisia sisäänkäyntipaikkoja)?
- Löytyykö kaksoiskohteita, koulun pihoilla olevia taideteoksia, rajoitettuja alueita tai liian geneerisiä paikkoja?
- Millaisia Prism / Archive / Grove / Relay / Observer / Commons -pelitoimintoja näistä saisi?
- Node Atlas 0C: käyttäjän kuvan ottaminen paikalliseksi ehdotusluonnokseksi, EXIF-poisto, sijainnin asettaminen ja käyttöoikeudet.

## Lähteet

- Overpass QL: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
- Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- OSM ODbL: https://www.openstreetmap.org/copyright
- OSM tile usage: https://operations.osmfoundation.org/policies/tiles/

**Tarkastettu / Validated:** 10/10 policy-testiä ja 8/8 importer-testiä; yhdistetyn sivun ID/JS/CSS-kytkennät ja simuloitu yhden haun tuloslista toimivat. Live Overpass/CORS ja Androidin käyttö testattava erikseen. Tätä ei saa merkitä julkaistun pelin turvalliseksi paikkatietokannaksi.
