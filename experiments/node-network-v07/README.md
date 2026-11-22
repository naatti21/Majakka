# MAJAKKA World v0.7 — orgaaniset resonanssikanavat

**Toteutuspäivä:** 22.11.2026
**Kokeilu:** https://naatti21.github.io/Majakka/experiments/node-network-v07/
**Status:** GitHubiin toteutettu 3D-grafiikkaprototyyppi. Ei hyväksytty Android-assetti eikä pelillinen linkkimoottori.

## Miksi tämä v0.7 tehtiin?

Käyttäjän 22.11.2026 palaute nykyisistä v0.6-yhteyksistä: **“Meidän putket näyttää testi grafiikalta. Tehdään vähän orgaanisempia.”** Ingress-kuva havainnollisti sitä, ettei pelkkä suora läpikuultava viiva, jonka päällä pallo liikkuu, tunnu tarpeeksi materiaaliselta. Majakka-universumin linkkien pitää tuntua **elävältä yhteiseltä verkkomateriaalilta** ja heijastaa niiden päissä olevien erilaisten majakoiden sävyjä. Tarkoitus ei ole kopioida toisen pelin viivagrafiikkaa.

## Mitä koodissa on oikeasti

- **Samat kolme geosidonnaista DEMO-majakkaa** (Relay/Copper, Grove/Moss, Prism/Porcelain), samat linkkiparit, samat vaiheet **0/3, 1/3, 2/3, 3/3**, sama toistettava verkon herääminen ja kamera. Vanha [v0.6](../node-network-v06/) säilyy muuttumattomana vertailuun.
- **Ulkokalvo (outer membrane):** oma 3D-`BufferGeometry` rakennetaan `CatmullRomCurve3`-polkua pitkin. Seinämän säde vaihtelee **pitkittäissuunnassa ja ympäri putkea**, pehmeästi kapenevat valopisteiden liittymät. Kartan yläpuolella loiva kohoava orgaaninen kaari, ei täysin suora laser. Pintaväri sekoittuu alkupään ja loppupään Node-materiaalin väristä.
- **Materiaalintuntu:** `MeshStandardMaterial` käyttää läpikuultavuutta, `roughnessMap`-, `bumpMap`- ja verteksivärivaihtelua. Suunniteltu näyttämään pehmeältä kalvolta eikä tasaisesti fluoresoivalta paksulta putkelta. Pinnassa on matalaa, kuvioitua mikrokarheutta; geometriassa vain hienovarainen vaihtelu. Materiaalikartat tuotetaan paikallisesti pienellä canvasilla (192×96); ei ulkoisia kuvastoja.
- **Sisävirtaus:** hyvin hillitty vaalea sisäinen 3D-juova, **kaksi ohutta orgaanisesti punoutuvaa mikrorihmaa kalvon sisällä**, ei erillistä ohutta kirkasta ulkoista laserviivaa.
- **Kulkevat valopisarat:** 1–3 aidosti pyöreää `SphereGeometry`-valopalloa (sisäydin ja pehmeä läpikuultava halo) liikkuu kalvon keskikäytävässä. Virtaus on hidasta. Orbin muoto ei ole monikulmainen debug-timantti.
- **Suorituskyky:** geometria ja tekstuurit tuotetaan kerran. Animaatiossa muutetaan vain materiaalin opasiteettia ja pallojen sijaintia, **ei** muokata putken kaikkia verteksejä joka ruudussa. LOW vähentää efektiä ja mukana olevien pallojen määrää, MED 2 palloa ja HIGH 3. Käytössä on edelleen ajastettu maltillinen kartan uudelleenpiirto sekä `prefers-reduced-motion`-tuki. Kolmen majakan materiaalit periytyvät aiemmasta PBR-labrasta.
- **MapLibre-korjaus:** tumman kartan luettavat nimet/tiet ja 3D-kerroksen piirto viimeisenä sekä `renderer.clearDepth()` säilyvät v0.4.2:n periaatteen mukaisesti.

## Mitä ei pidä tulkita valmiiksi

- **Peittoaluepilveä ei ole vielä toteutettu**, eikä sitä lisätä ennen uutta laadun arviointia.
- Yhteyksien avautuminen on yhä visuaalinen demo, ei oikea Node-Atlas-pelimekaniikka. Ei Lumen-kuluja, hyväksyttyjä fyysisiä POI-paikkoja, paikannusta, etäisyysrajojen ohjausta tai pysyvää tilaa.
- Todellista Androidin FPS-/p99-/lämpömittausta ei ole. Staattinen CI ja selaimen screenshot eivät yksin todista hyvää mobiilisuorituskykyä.
- **Materiaalivalinta on kokeilu**: käyttäjä voi toivoa läpinäkyvämpää, ohuempaa, rihmastomaisempaa tai elävämpää ilmettä. Pääasia on luopua tasaisen “testiputken” tunnusta.

## Tarkistussuunnitelma

1. `tests/node-network-v07.test.mjs`: varmistaa JS-syntaksin, oikean muutoksen v0.6:een, 3D-kalvon, karheus-/kohokartat, esfera-valopisarat, kaikki linkkivaiheet ja vanhat MapLibre-depth-invariantit.
2. `.github/workflows/node-network-v07-visual-smoke.yml`: 7 kuvakaappausta oikeasta WebGL-karttarenderöinnistä: vaihe 0, 1, 3, sivukulma, yläkulma, lähikuva ja LOW.
3. **Tarkista silmin**: linkki ei saa näyttää läpinäkymättömältä viemäriputkelta, ylimitoitetulta lonkerolta eikä yksittäiseltä lasersäteeltä. Matalan sivukulman pitää osoittaa, että kalvo kohoaa kartan yläpuolella; liitynnät eivät saa jättää aukkoa kruunun ja säikeen väliin.
4. Käyttäjän **oma Android-koe** ratkaisee, näkyvätkö kalvo ja sisällä liikkuvat pallot hyvin myös mobiilin pienessä näkymässä. Jos ei, säätöjen järjestys: läpikuultavuus / paksuus / karheus / valopallojen luettavuus; **ei** uusi iso irrallinen geometria.
5. Vasta onnistuneen portin jälkeen seuraava kokeilu on hengittävä ilmassa leijuva **peittoaluepilvi** kolmen majakan kolmion sisällä.

**Työnjako:** `organic-strand.js` rakentaa uuden fysiikan tuntuisen ulkokalvon ja sen sisällön, `network-world.js` hallitsee 3D-karttaa ja 0–3 vaihetta, `index.html` tarjoaa mobiilitoiminnot. Vanhat kokeet eivät muutu.
