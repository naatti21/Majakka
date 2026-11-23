# MAJAKKA World v0.8 — lyhyt valovana + suljetun verkon leijuva usvapeite

**24.11.2026.** Viety GitHubiin toiminnallisena Three.js/MapLibre 3D-kokeena.
**Käyttö:** https://naatti21.github.io/Majakka/experiments/node-network-v08/?stage=3&quality=medium

## Toteutuspäätös käyttäjän palautteen perusteella

Edellinen v0.7.2:n **kolmen eri materiaalimajakan (Relay/Copper, Grove/Moss, Prism/Porcelain)** 3D-verkko sekä sen **orgaanisten putkien tarkka profiili ja reitti** pidetään ennallaan. Uusia serpentiinirihmoja tai suuria valopalloja ei palauteta.

Käyttäjä pyysi:
1. Kirkkaasti näkyville pienille virtaaville hiukkasille **hyvin lyhyt, nopeasti katoava vana**, jos toteutus on kevyt.
2. Kolmen majakan sisään **matalalla leijuva, pehmeästi aaltoileva usva / hiukkaspeite**, jossa maailma näyttää elävältä mutta karttaa ei peitetä.

## Mitä uutta on koodattu

### Valovana

- Nykyiset **12 / 22 / 34 liikkuvaa pistettä per linkki** säilyvät. Pisteisiin lisätään kaksi himmeää, vain hieman taaempana sijaitsevaa vananäytettä (matka 0.014 ja 0.030 linkin pituudesta).
- Jäljet himmenevät nopeasti: ensimmäinen 65 % ja toinen 27 % pääpisteen väritehosta **ennen** vanamateriaalin omaa matalaa 34 % opasiteettia.
- **Yksi ylimääräinen `THREE.Points`-piirtokutsu/linkki** — vain 3 ylimääräistä piirtokutsua 3 yhteyden verkossa, eikä blur-, frame-history- tai CPU-fysiikkajärjestelmää.
- Välimuistiin varatut paikkapuskuri/väripuskuri; ei uusia objekteja/tekstuuria ruutua kohti. Sama jaettu pehmeä 32×32 pistekuva.
- **LOW ja liikkeen vähennystila**: ei vanaa. MED/HIGH: kaksi pienikokoista vanapistettä per liikkuva hiukkanen, ei takaisin syntyvää serpentiininauhaa.
- Pääpisteiden 5.5px ruutukoko ja kirkkaus pidetään v0.7.2:n hyväksyntää odottavalla tasolla; zoomissa koko ei kutistu.

### Leijuva peittoalue

- Peite rakennetaan **kolmen DEMO-majakan karttakoordinaattien muodostaman kolmion SISÄÄN** ja aktivoituu vasta, kun kolmas linkki sulkee kolmion (**3/3**). Vaiheissa 0–2 sitä ei ole.
- Kevyt läpikuultava tekstuurikalvo: 120 vertexin kolmioverkko (14 jaottelua), pieni 192×192 proseduraalinen RGBA-usvatekstuuri, jossa on pehmeä kolmion reunaa seuraava häivytys. Rungon aaltoliike syntyy vain noin 120 verteksin y-koordinaatin hitaasta päivityksestä; erillistä raskasta fragmenttishaderia ei tarvita.
- Peite kelluu hieman kartan yläpuolella, **alempana kuin orgaaniset yhteysputket**. Se on visuaalinen ”verkon valoherääminen”, EI todellinen laskettu pelillinen peittoalue.
- MED: 28 pientä **staattista** usvamotetta; HIGH: 48; LOW: ei erillisiä pisteitä, mutta aaltoileva tekstuurikalvo edelleen näkyy. Hiukkasille korkeintaan **yksi lisäpiirtokutsu** koko peitealueessa. Pisteet värjäytyvät Nodejen materiaaliväreistä.
- Peite häipyy esiin/pois pehmeästi; **USVA ON/OFF** -painikkeesta voi vertailla sitä verkon ollessa 3/3. Demo-URL `?mist=0` avaa vertailun suoraan ilman peitettä.
- PBR-majakkoja, kartan luettavia katuja, `renderer.clearDepth()`-piirtojärjestystä, geosidontaa tai reittien muotoa ei muutettu.

## Käyttö ja QA

- Avaa sivu puhelimella: `stage=3&quality=medium`, zoom 15.5–18, kallistus 0°, 55° ja 70°. Katso sekä hiukkasvanan pituus että usvan reunojen häipyminen.
- Paina **USVA OFF / ON**. Peitteen pitää olla hillitty eikä hävittää karttateitä tai majakoita. Paina myös vaiheita 0/3, 2/3, 3/3: peite vasta täydellisessä kolmiossa.
- Vertaa `LOW` ja `HIGH`: sama orgaaninen putki ja itse sumupeite säilyvät, vain valovanat sekä pölyhiukkaset vähenevät.
- `tests/node-network-v08.test.mjs` tarkistaa sekä koodisyntaksin, vanhan ulkoputken geometrian sanasta sanaan, käytettyjen piirto-olioiden määrän, usvan rajauksen kolmioon että geosidonnan ja GPU-resurssien vapautuksen.
- `.github/workflows/node-network-v08-visual-smoke.yml` ottaa mobiilikokoiset Chromium-WebGL-testikuvat vaiheista 0,2,3, peitteen ON/OFF-vertailun sekä HIGH/LOW/zoom.

## Rehelliset rajat

**Käyttäjän fyysisen Androidin FPS-, viive- ja lämpötesti on avoin.** Emme lupaa suorituskykyä vain draw-call-arvion perusteella. Pääasiallinen kustannus on usvan läpikuultavan tekstuurikalvon piirto ja jo ennestään käytettyjen PBR-majakkojen renderöinti, joten tarvittaessa usvapeitteen opasiteettia, näkyvyysaluetta ja päivitysrytmiä säädetään ennen uusia efektejä.

**Ei vielä toteutettu:** oikeat hyväksytyt Node-POI:t, GPS, 150 metrin pelaajainteraktio, tallennetut peliyhteydet, peittoalueen todellinen pelimekaniikka, taloudellinen vaikutus tai pelaajien välinen vuorovaikutus. Tämä on **visuaalinen esitys siitä, miltä suljettu verkko voisi näyttää**.

## Kuvallinen QA-korjaus: liian huomaamaton peite

Ensimmäinen v0.8-WebGL-testikuva todisti hiukkasten valovanan piirtyvän, mutta usvan ON/OFF-kuvien erotus jäi lähes olemattomaksi. Siksi vaihdoimme ensimmäisen kokeilun vähäkontrastisen erikoisshaderin **selvästi mutta hillitysti näkyvään, paikallisesti luotuun RGBA-tekstuurikalvoon**, jonka reunat häipyvät kolmiomaskilla. Uusi toteutus ei lisää kolmatta sumupiirtokerrosta, ei raymarchingia eikä hiukkasfysiikkaa. Se tekee noin 120 vertexin kevyen aaltopäivityksen ja käyttää yhä enintään yhtä usvan pistemateriaalijoukkoa. **Tämä on toteutettu; uuden renderöinnin ja Androidin ulkoasu pitää vielä tarkistaa.**
