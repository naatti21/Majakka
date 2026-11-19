# MAJAKKA — Relay D Chromatic / visuaalinen itsearvio 19.11.2026

**Tila:** SELF CRITIC (sama AI teki mallin ja arvioi kuvat), ei riippumaton QA eikä Android-hyväksyntä.
**Toteutus:** [Relay Art Lab v0.2](../experiments/relay-concept-lab/), [Visual Critic](MAJAKKA_VISUAL_CRITIC_v0.1.md), [Style Tokens](NODE_STYLE_TOKENS_v0.1.md).
**Näyttö:** [GitHub Actions WebGL smoke, run 44596519623](https://github.com/naatti21/Majakka/actions/runs/44596519623), 3 vanhaa A/B/C-kuvaa ja 6 D-mallin vakioitua Chrome-kuvaa. Screenshotit tallennettu kyseisen Actions-ajon `majakka-relay-3d-concept-qa`-artifactiin. Ei fyysistä Android-suorituskykytestiä.

## Havainnot oikeasti renderöidyistä kuvista

- **Positiivista:** ydin ja kolmen ulostulon siluetti pysyvät kolmiulotteisesti ehjinä (myös 55°/zoom 17.1 ja 0°/zoom 16.5); MapLibren tiet ja tekstit näkyvät Noden ulkopuolella. Koralli, kulta ja violetti erottautuvat turkoosista — väriä on aiempaa enemmän.
- **P1: edelleen liian pelkistetty lähikuva:** suuri keskikappale näyttää sileältä tekniseltä säiliöltä. Täytyy syventää bio-keramiikka-/metallipintaa, kaiverrusten jaksotusta ja epäsymmetriaa — ilman että siluetti muuttuu sekavaksi.
- **P1: ulostulojen pimeät päät:** kolmen portin tummat päätypinnat ovat lähikuvassa hallitsevat, vaikka porttien pitäisi kertoa valon välittämisestä. Lisää sisäistä lämmintä syvyyttä/reunavalotusta ja näkyvää energian suuntaa; ei suuria läpikuultavia hologrammeja.
- **P1: liikkeen vaikutusta ei näe still-kuvassa:** energiapulssit on koodattu, mutta 4–6 s omaa videoarviota ei ole vielä tehty. Saumattomuus ja hiukkasten rytmi ovat NOT RUN.
- **P2: korkea rengas+kartion muoto** voi edelleen näyttää geneeriseltä sci-fi-laitteelta eikä Majakan tunnistettavalta Relayltä. Seuraava kokeilu voisi korvata osan toruksista epäsymmetrisillä orgaanisilla koristekaarilla ja porttisilloilla.
- **P2: pieni karttaesitys** on tunnistettavasti kolmihaarainen mutta värihierarkia romahtaa etäzoomilla. Tarkista zoom 15.5 fyysisellä puhelimella ja tarvittaessa rajattu valokorostus, ei lisää suuria efektejä.

## Alustavat itsearvioidut pisteet (0–5; eivät käyttäjän hyväksyntä)
| Kriteeri | Pisteet | Arvio |
| --- | ---: | --- |
| Siluetti | 3 | 3 haaraporttia havaittavissa, mutta yhtenäinen ydin on vielä geneerinen |
| Värit | 4 | selvä parannus aiemmasta yksivärisyydestä |
| Materiaalikerrostus | 3 | eri pinta-/metallikerrokset näkyvät mutta eivät vielä premium-tasoa |
| Detalji | 2 | liian sileä ja tekninen hero-objekti suureksi zoomattuna |
| Peliroolin näkyvyys | 3 | kolme ulostuloa kertovat Relaysta, virtaus vaatii liikevideon |
| Kartan luettavuus | 4 | tumman kartan nimet/tiet säilyvät suuren objektin ulkopuolella |
| Animaation rytmi | EI TESTATTU | staattiset Chrome-kuvat eivät todista saumattomuutta |
| Android FPS / lämpö / akku | EI TESTATTU | ei laitemittausta |

**Portti:** REVISE / USER REVIEW. Ei viimeistelty eikä hyväksytty Relay-asset.

**Seuraavat kolme korjausta** käyttäjän Android-palautteen jälkeen: 1) porttien sisäinen valoydin ja näkyvä energia, 2) selvästi rikkaampi keraaminen pinta ja käsityön tuntua tuova epäsymmetria, 3) vähän luonnollisempi rakenneliike ja mitattu mobiilikuorma. Ei Node-verkon pelisääntöihin tai GPS-alueeseen muutoksia.
