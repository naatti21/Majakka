# MAJAKKA — VISUAL CRITIC v0.1
**Päivitetty 19.11.2026 · Käyttö: ennen ja jälkeen jokaisen visuaalisen lab-päivityksen.**

## Näytöt, jotka arvioija saa
Kuusi samaa, määrättyä kameratilaa samassa geokoordinaatissa ja valaistuksessa, sekä 6–10 s lyhyt liikevideo:
1. 55° / zoom 17.1 / bearing -15° (päävertailu)
2. 70° / zoom 17 / bearing 65° (yläviisto/peittyminen)
3. 25° / zoom 17.5 / bearing 155° (matala siluetti)
4. 0° / zoom 16.5 / bearing 0° (ylhäältä / karttaluettavuus)
5. 55° / zoom 15.5 / bearing 0° (etäältä: onko lajityyppi tunnistettava)
6. 55° / zoom 18 / bearing 225° (lähellä: materiaalit ja detaljit)

Aina mainittava testialusta (Chromium/Android), versio, kuvan kellonaika, resoluutio ja liikkuvan kohteen tila. Kiinteät kameratilat mahdollistavat ennen–jälkeen-vertailun; valokuva ei yksin mittaa animaation laatua.

## Arviointimatriisi 0–5 (tekninen tavoite, ei faktaksi väitetty todistus)
| Osa | 0 = hylätty | 3 = minimi | 5 = erinomainen |
| --- | --- | --- | --- |
| Siluetti | pelkkä valopiste / sekava | tunnistaa kartalta | heti tyyppikohtainen eri kulmista |
| Värihierarkia | yksi tumma sävy + yksi neonglow | 3 tarkoituksellista sävyä | kiinnostava lämmin–kylmä suhde, syvyys |
| Materiaalit | debug-wireframe, läpinäkyvä runko | kiinteä 3D-runko + pintaeroja | tyylitelty kerrostunut pinta ja sykkivä energia |
| Detalji | yksinkertainen perusprimitive | selkeät rakenteelliset merkit | viimeistelty lähikuva muttei tukkeudu pieneksi |
| Peliroolin luettavuus | näyttää geneeriseltä | toiminnon voi päätellä | selkeä yhteys alkuperäisen tyypin kykyyn |
| Kartan luettavuus | nimet/tiet peittyvät | pääosin näkyvät | säilyvät hyvin kaikissa testikulmissa |
| Liike | nykii / häiritsee | rauhallinen, tarkoituksellinen | luonnollinen, lajille ominainen 4–6 s silmukka |
| Mobiilikustannus | jäätyy / kuumenee | toimii mitatulla laitteella | laatuportaat + mittaukset myös heikommalla |

**Vähimmäisportti luonnokselle:** siluetti, värit, materiaalit, pelirooli ja karttaluettavuus vähintään 3/5, kaikki P0 korjattu. Tämä on suunnittelupäätös, ei automaattinen ohjelmallinen hyväksyntä. Lopulliseen muotokieleen vaaditaan käyttäjän hyväksyntä.

## Välitön hylkäys (P0)
- Väärä geosijainti tai 3D-olio irtoaa kartasta kallistettaessa.
- Kartan tekstit/tiet piirtävät mustia viiltoja itse Noden päälle.
- Ydin on läpinäkyvä vastoin muotokielen päätöstä.
- WebGL-virhe tekee koko kartasta käyttökelvottoman.
- Luvaton GPS, oikean POI:n turvalliseksi väittäminen tai lähdekoodin kopiointi ilman asianmukaista oikeutta.

## P1 – laatu ei riitä
- Esine näyttää debug-primitiveiltä, ikään kuin muutama sylinteri ilman materiaalikieltä.
- Vain yksi siniturkoosi väri eri kirkkaustasoilla; ei värillistä vastapainoa.
- Niukka detalji: kolmesta metristä ei erotu pintarakennetta/aksentteja.
- Pelirooli ei näy muodosta; Prism, Relay ja Grove olisivat vaihtokelpoisia.
- Hehku peittää muodon tai kaartuvat säikeet näyttävät karttaan maalatuilta.
- Liike on ympyräpyörintä ilman syytä tai visuaalista rytmiä.

## P2 – viimeistely
- Pieni väriparin epätasapaino, liian terävä highlight, partikkelien epätasainen rytmi,
  kankeat siirtymät, yksittäinen lisämuoto tai hienosäädön tarve.

## Review-raportin malli
```text
ARTIFACT: [URL, commit, scene, candidate]
EVIDENCE: [6 screenshots, clip, Android test performed Y/N]
SCORES: silhouette / color / material / detail / role / map / motion / cost
P0:
P1:
P2:
WHAT WORKS:
TOP 3 CORRECTIONS: [toteutuskelpoiset, järjestyksessä]
NOT RUN: [GPU time, avg/p99/max frame, device battery/thermal, Android]
DECISION: REJECT | REVISE | USER REVIEW (ei automaattisesti APPROVED)
```

## Performance ja itsearvioinnin rehellisyys
- Kirjaa ruutuaika **avg/p99/max** mitattuna, älä päättele FPS:ää videosta.
- Low / Medium / High säätää ensisijaisesti **partikkeleita, VFX:ää ja renderöinnin yksityiskohtia**, ei Node-tyyppiä, sijaintia tai toiminnallisia kykyjä.
- Staattiset JS-testit varmistavat API-rakenteita, eivät todellista visuaalista laatua. Käyttäjä hyväksyy mobiililaitteella.
- Tekijä ja kriitikko voivat olla saman AI-istunnon eri vaiheita; **merkitse arvio itsearvioksi, älä riippumattomaksi auditoinniksi**.
