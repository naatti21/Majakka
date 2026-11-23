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
- Kevyt shader-kalvo: 190 vertexin kolmioverkko (18 jaottelua), rauhallinen noin metrin suuruusluokan shader-aaltoilu, 2 hyvin loivaa valokuvioista laskettua usvajuovaa, läpikuultavuus + barysentrinen reuna-pehmennys. Ei terävää, lasimaista, kiinteää kolmiolevyä.
- Peite kelluu hieman kartan yläpuolella, **alempana kuin orgaaniset yhteysputket**. Se on visuaalinen ”verkon valoherääminen”, EI todellinen laskettu pelillinen peittoalue.
- MED: 28 pientä **staattista** usvamotetta; HIGH: 48; LOW: ei erillisiä pisteitä, mutta aaltoileva usvakalvo edelleen näkyy. Hiukkasille korkeintaan **yksi lisäpiirtokutsu** koko peitealueessa. Pisteet värjäytyvät Nodejen materiaaliväreistä.
- Peite häipyy esiin/pois pehmeästi; **USVA ON/OFF** -painikkeesta voi vertailla sitä verkon ollessa 3/3. Demo-URL `?mist=0` avaa vertailun suoraan ilman peitettä.
- PBR-majakkoja, kartan luettavia katuja, `renderer.clearDepth()`-piirtojärjestystä, geosidontaa tai reittien muotoa ei muutettu.

## Käyttö ja QA

- Avaa sivu puhelimella: `stage=3&quality=medium`, zoom 15.5–18, kallistus 0°, 55° ja 70°. Katso sekä hiukkasvanan pituus että usvan reunojen häipyminen.
- Paina **USVA OFF / ON**. Peitteen pitää olla hillitty eikä hävittää karttateitä tai majakoita. Paina myös vaiheita 0/3, 2/3, 3/3: peite vasta täydellisessä kolmiossa.
- Vertaa `LOW` ja `HIGH`: sama orgaaninen putki ja itse sumupeite säilyvät, vain valovanat sekä pölyhiukkaset vähenevät.
- `tests/node-network-v08.test.mjs` tarkistaa sekä koodisyntaksin, vanhan ulkoputken geometrian sanasta sanaan, käytettyjen piirto-olioiden määrän, usvan rajauksen kolmioon että geosidonnan ja GPU-resurssien vapautuksen.
- `.github/workflows/node-network-v08-visual-smoke.yml` ottaa mobiilikokoiset Chromium-WebGL-testikuvat vaiheista 0,2,3, peitteen ON/OFF-vertailun sekä HIGH/LOW/zoom.

## Rehelliset rajat

**Käyttäjän fyysisen Androidin FPS-, viive- ja lämpötesti on avoin.** Emme lupaa suorituskykyä vain draw-call-arvion perusteella. Pääasiallinen kustannus on usvan läpikuultava shader-peitto (fragmenttimäärä etenkin zoomattaessa), joten tarvittaessa sen alpha/kuviointia ja redraw-rajaa säädetään ennen uusia efektejä.

**Ei vielä toteutettu:** oikeat hyväksytyt Node-POI:t, GPS, 150 metrin pelaajainteraktio, tallennetut peliyhteydet, peittoalueen todellinen pelimekaniikka, taloudellinen vaikutus tai pelaajien välinen vuorovaikutus. Tämä on **visuaalinen esitys siitä, miltä suljettu verkko voisi näyttää**.
