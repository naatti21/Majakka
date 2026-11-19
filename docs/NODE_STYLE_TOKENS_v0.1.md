# MAJAKKA — NODE STYLE TOKENS v0.1
**Päiväys 19.11.2026 · Tila: ART-DIRECTION-EHDOTUKSET. Ei käyttäjän hyväksymää lopullista 3D-designia.**

## Yhteiset invarianssit
- Tausta: MapLibre OpenFreeMap **Dark · tiet ja tekstit näkyviin**. Kartan kontrastia ei saa huonontaa.
- Kaikkien kuuden Noden runko on kolmiulotteinen, **kiinteä siluetti**. Valo ja hiukkaset saavat olla läpikuultavia. Ei mustia karttaviiltoja.
- Vähintään **3 materiaalista/funktiosta johtuvaa väriryhmää** (runko, valo, vastaväri), ei vain cyan + black.
- Jokaisella Node-tyypillä on oma toiminnallinen rooli, ainutlaatuinen siluetti, erilainen energia-animaatio sekä vähintään yksi tunnistettava valo-/kudosyksityiskohta.
- LOD / Quality muuttaa VFX:n määrää, **ei geosijaintia, pelisääntöä eikä perusmuotoa**. Ei rakennusten käsinmallinnusta tai ulkopuolisen pelin tyylin kopiointia.

## Väri- ja muotokielen ehdotukset
| Node-tyyppi | Hero-siluetti | Runko / rakenne | Hehku | Vastaväri | Liike | Vältä |
| --- | --- | --- | --- | --- | --- | --- |
| **Prism** | kolme epäsymmetristä taittopintaa, haarautuvat optiset kanavat | `#263E69` cobalt slate | `#6DE8FF` icy refraction | `#FDBD79` warm spectrum + `#C588EA` violet edge | valon taittuminen ulostulossa | yksi läpinäkyvä kristalli |
| **Archive** | kerrostettu muistikehto, sisäkkäiset levyt | `#57455F` violet stone | `#FFD8A1` aged amber | `#77C7BD` patina | hitaat muistofragmenttien avautumiset | kirjakuvake pylväässä |
| **Grove** | kiinteä siemen/juurikehä, epäsymmetriset vahvat kasvujalat | `#244B3F` moss ceramic | `#82E5AF` biolume | `#E8B66F` spore-gold + `#B588B8` bark bloom | hengitys, pehmeä häiriön tasoitus | Relay-tyyliset 3 energiaporttia |
| **Relay** | 3 selkeää yhteysporttia, monikerroksinen haaroittuva ydin | `#163A49` marine ceramic | `#31DCCF` teal channels | `#FF8E74` coral / `#FFD99A` gold + `#8F74D9` amethyst | matkustavat valopulssit, porttien suunta | cyan ring-only debug-malli |
| **Observer** | epäsymmetrinen suppilo/linssikruunu, näkyvä katsesuunnan aukko | `#344763` twilight blue | `#93D8FC` signal | `#FFCB7C` amber sightline | hidas sektoroitu skannaus kauas | geneerinen satelliittitutka |
| **Commons** | yhteen nivoutuvat useat siemenytimet, yhteinen kehä | `#594866` warm plum | `#E6B9FF` shared resonances | `#78DDC3` mint + `#F0C37F` brass | eri ytimien synkronoituminen | yksi tavallinen valopallo |

**Nämä HEX-arvot eivät ole kanonisia brändivärejä**. Niitä verrataan Androidilla saman kartan päällä ennen lukitsemista.

## Relay — laadukkaan uuden D-testin tokenit
- **Tarkoitus:** näyttää reittien haaroittajalta, ei scifi-debug-tolpalta.
- **Päämuoto:** kolme epäsymmetristä, mutta tasapainossa olevaa ulostulopäätä; keskellä voimakas facetoitu bio-keramiikkaydin.
- **Pintarakennus:** kaksi matta–kiiltävä kerrosta, sisään upotetut valokanavat, kohotetut harjanteet, osittain poikkileikattu messinkimäinen koriste; ei kokonaan wireframe.
- **Säikeet:** kanavat jatkuvat kohti tulevien orgaanisten 3D-säikeiden ankkuripisteitä. Ei vielä oikeita peliyhteyksiä tässä art-kokeessa.
- **Paletti:** marine body `#163A49`, saturated cyan `#31DCCF`, coral `#FF8E74`, gold `#FFD99A`, violet `#8F74D9`; vähintään 3 näkyvää ei-neutraalia väriä myös zoomilla 16.
- **Liike:** yksi rauhallinen sydänpulssi ja kolme ajoitettua energiavirtaa, ei kymmentä samanaikaista orbiittia.
- **Low:** kiinteä ydin, portit ja muutama valokanava. **Medium:** lisädetaljit ja harvat kipinät. **High:** lisää hiukkasia ja pinnan valotusta; ei muutu toiseksi Nodeksi.
- **Huom:** vanhat Relay A / B / C säilyvät vertailua varten. D-testistä ei tule automaattisesti käyttäjän hyväksymää mallia.

## Väri suhteessa elävään maailmaan
Nodejen eri tyypit saavat näyttää erilaisilta ilman että koko kartta täytetään sateenkaarivalolla. Käytä vahvoja värikontrasteja **kohteen sisällä**, hillittyä vaaleaa karttarajaa ja muuta hehkua vain tarvittaessa. Kartan nimien täytyy säilyä luettavina. Pelaajan 150 m lähitoimintamatka, etäpelaaminen ja Kaiku-assetit ovat erillisiä pelimekaniikkoja.
