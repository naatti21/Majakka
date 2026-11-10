# MAJAKKA — MapLibre Tampere / kartan laatukoe v0.2

**Päiväys:** 2026-11-10  
**Status:** Selainkokeilu julkaistu, visuaalinen Android-käyttäjätesti vielä auki.  
**Mobiililinkki:** https://naatti21.github.io/Majakka/experiments/maplibre-tampere/

## Päivitys 2026-11-10 — Majakka Nocturne ja valopisteet

**Käyttäjän visuaalinen suunta:** tummuus Fiordin ja Darkin väliltä; jos oma välimuoto ei toimi, Dark on parempi lähtökohta. **Nodet ja Kaikut valaisevat karttaa**. Kartan pitää olla itsessään luettava eikä vain neonvalojen varassa.

**TOTEUTETTU KOKEILUUN, EI VIELÄ PUHELIMELLA HYVÄKSYTTY:**
- Pudotusvalikossa uusi oletus **Majakka · oma tumma** (Dark-tyylin päälle rakennettu hillitty sinivihreä palette override). Alkuperäiset Dark, Fiord ja Liberty säilyvät vertailuvaihtoehtoina.
- Kartalla kaksi **selvästi DEMO-merkittyä, fiktiivistä** geokoordinaattipistettä: Node turkoosina ja Kaiku vaaleanviolettina.
- Pisteiden ympärillä on MapLibre-circle-layerien pehmeä ulompi ja sisempi hehku; pienet ytimet sekä DEMO-tekstit. Hehkut ovat karttaan sidottuja, eivät pysy kuvan nurkissa kameran kääntyessä.
- **VALOT**-painike kytkee kaikki hehkuelementit päälle/pois, jotta karttapohjan kontrastia voi arvioida ilman niitä.
- Tämä ei ole vielä varsinainen paikallisia teitä valaistava shader, eikä rigitty 3D-Kaiku tai oikea Node-kohteiden tietokanta. Valon todellinen vuorovaikutus, animoitu liikkuva Kaiku, 3D-mallit ja optimointi päätetään myöhemmin vasta perustestien jälkeen.
- Jos mukautettu paletti ei vaikuta tiettyihin lähdetyylin karttatasoihin, näiden tasojen OpenFreeMap-tyylimääritykset tarkistetaan puhelimen palautteen perusteella; **Dark säilyy varavalintana**.

**Laatukriteerit:** valo tekee löydöstä kiinnostavan mutta ei peitä katunimiä, teitä, vesistöjä tai liian suurta ympäristöä; myös valoton maailma säilyy esteettisenä. Hehkujen lukumäärä ja laatu on optimoitava oikean laitteen FPS:n perusteella. Ei luvata “oikeaa 3D-valaistusta” pelkällä overlaylla.

## Tavoite

Katsotaan miltä oikea Tampere näyttää **valmiilla vektorikarttamoottorilla** ja vapaalla kameralla. Edelliset rasteri-Godot- ja omat Godot SurfaceTool -karttarenderöinnit hylättiin huonon Android-ulkoasun vuoksi. Ei enää samaa tekniikkaa peukaloimalla uutta APK:ta.

## Käytetyt ratkaisut

- MapLibre GL JS, kiinnitetty v6.15.0; vaatii selaimelta WebGL2-tuen.
- Ensisijainen oma tyyli Majakka Nocturne; alkuperäiset Dark, Fiord ja Liberty ovat valikossa vertailuun.
- OpenFreeMapin OSM-vektoritiilet, kolme testityyliä: Fiord (tumma oletus), Dark ja vaalea Liberty vertailua varten.
- Keskipiste Tampereen keskustassa (lon 23.7606, lat 61.4982). GPS:ää ei pyydetä eikä tiliä tarvita.
- Yksi sormi siirtää, kaksi kiertää/kallistaa/nipistää. HOME palauttaa lähtökameran, 2D/3D-painike kallistaa, N ↑ palauttaa pohjoisen.
- Verkkoyhteys tarvitaan, testissä ei ole offline-karttaa.
- Sovelluksen omat 3D-Nodet, Kaikut ja pelaaja eivät kuulu vielä kokeeseen. Ei myöskään talojen käsinmallinnusta.

## Android-laatuportti

1. Ovatko Tammerkoski, Näsijärvi, Pyhäjärvi, sillat, kadut ja puistot tunnistettavia?
2. Ovatko tiet ja rannat teräviä myös viistossa? Näkyvätkö nimet selkeinä?
3. Tuntuuko kameran liike hyvältä puhelimessa ja pysyykö maantiede paikallaan eri eleissä?
4. Onko **Majakka Nocturne** sopivasti Darkin ja Fiordin välillä vai pitääkö pysyä Darkissa? Arvioi myös **VALOT** päällä ja pois. Liberty on kontrolli.
5. Näkyykö virheilmoituksia, katoaako kartta tai tapahtuuko renderöinnissä nykimistä?
6. Käyttäjän hyväksyntä tai hylkäys kuvakaappauksen ja kokeilun perusteella, ei CI-koonnin perusteella.

Kun kartan pohja hyväksytään, seuraava kokeilu on **yksi** geokoordinaattiin kiinnitetty 3D-Node tai Flintail, jonka sijainti ja renderöinnin laatu tarkistetaan. Lopullinen peli-/karttamoottorin integrointi jätetään auki siihen asti.

## Rajaukset

Tämä on GitHub Pagesiin lisätty erillinen kokeilupolku eikä muuta nykyisen Majakka-PWA:n pelikoodia. OpenFreeMap on ulkopuolinen palvelu, jonka ehdot, resurssit ja mahdollinen tuotantokäytön karttajakelu tarkistetaan erikseen. © OpenStreetMap contributors; sivulla on näkyvä attribuutio.

## Tekninen dokumentaatio

- https://maplibre.org/maplibre-gl-js/docs/
- https://openfreemap.org/quick_start/
- https://github.com/hyperknot/openfreemap-styles
- https://www.openstreetmap.org/copyright

Jatkuvuus: https://github.com/naatti21/Majakka/blob/main/PROJECT-HANDOFF.md
