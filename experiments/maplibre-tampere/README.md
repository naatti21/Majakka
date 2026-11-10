# MAJAKKA — MapLibre Tampere / kartan laatukoe v0.1

**Päiväys:** 2026-11-10  
**Status:** Selainkokeilu julkaistu, visuaalinen Android-käyttäjätesti vielä auki.  
**Mobiililinkki:** https://naatti21.github.io/Majakka/experiments/maplibre-tampere/

## Tavoite

Katsotaan miltä oikea Tampere näyttää **valmiilla vektorikarttamoottorilla** ja vapaalla kameralla. Edelliset rasteri-Godot- ja omat Godot SurfaceTool -karttarenderöinnit hylättiin huonon Android-ulkoasun vuoksi. Ei enää samaa tekniikkaa peukaloimalla uutta APK:ta.

## Käytetyt ratkaisut

- MapLibre GL JS, kiinnitetty v6.15.0; vaatii selaimelta WebGL2-tuen.
- OpenFreeMapin OSM-vektoritiilet, kolme testityyliä: Fiord (tumma oletus), Dark ja vaalea Liberty vertailua varten.
- Keskipiste Tampereen keskustassa (lon 23.7606, lat 61.4982). GPS:ää ei pyydetä eikä tiliä tarvita.
- Yksi sormi siirtää, kaksi kiertää/kallistaa/nipistää. HOME palauttaa lähtökameran, 2D/3D-painike kallistaa, N ↑ palauttaa pohjoisen.
- Verkkoyhteys tarvitaan, testissä ei ole offline-karttaa.
- Sovelluksen omat 3D-Nodet, Kaikut ja pelaaja eivät kuulu vielä kokeeseen. Ei myöskään talojen käsinmallinnusta.

## Android-laatuportti

1. Ovatko Tammerkoski, Näsijärvi, Pyhäjärvi, sillat, kadut ja puistot tunnistettavia?
2. Ovatko tiet ja rannat teräviä myös viistossa? Näkyvätkö nimet selkeinä?
3. Tuntuuko kameran liike hyvältä puhelimessa ja pysyykö maantiede paikallaan eri eleissä?
4. Mikä tyyli näyttää oikealta: Fiord, Dark vai Liberty? Vaalea on lähinnä kontrolli.
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
