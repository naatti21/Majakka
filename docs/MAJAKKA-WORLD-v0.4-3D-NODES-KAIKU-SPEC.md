# MAJAKKA — World v0.4 / 3D Nodes & Kaiku — toteutussuunnitelma

**Päiväys:** 2026-11-11
**Tila:** HYVÄKSYTTY KONSEPTISUUNTA; v0.4-toteutus on **AVOIN / EI TÄMÄN DOKUMENTIN PERUSTEELLA TOTEUTETTU**.
**Lähtökohta:** [MapLibre Tampere -kokeilu](../experiments/maplibre-tampere/README.md), [Flintailin identiteettimäärittely](KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md), [projektin handoff](../PROJECT-HANDOFF.md).

## 1. Päätöslukko — ei uusia keskusteluja nollasta

Käyttäjä valitsi 10.11.2026 näytetyistä kartoista suosikikseen **“Dark · tiet ja tekstit näkyviin”**. Se on seuraavan kehitysversion **oletuskarttapohja**. Alkuperäinen Dark peitti tiet ja nimet, ja aiempi oma Nocturne-väriteema jäi vertailussa toiseksi. Muut tyylit voivat säilyä testivalikossa, mutta seuraava työ perustuu valittuun tyyliversioon.

Käyttäjän 11.11.2026 vahvistama maailmavisio:
- **Node**: pelin oma, valaiseva, kevyesti elävä **3D-objekti** maantieteellisesti sidotussa paikassa.
- **Kaiku**: pelin oma **3D-hahmo**, jonka suunnittelussa käytetään jo hyväksyttyjä Flintail-kortteja. Ei aloiteta uudesta satunnaisesta hahmodesignista.
- **Nodejen väliset yhteydet**: maantieteeseen ankkuroidut, **maanpinnan YLÄPUOLELLA leijuvat orgaaniset säikeet**. Ei karttaan maalattuja suoria viivoja.
- **Nodeverkon muodostama peittoalue**, silloin kun pelilogiikka sen oikeasti synnyttää: **maanpinnan yllä kelluva, orgaaninen, läpikuultava pilvimäinen kenttä**. Ei lattiaan maalattu 2D-monikulmio.
- Valot ja heijasteet herättävät ympäristön eloon, mutta **tiet, paikat, vesistöt ja katunimet säilyvät luettavina**.
- **EI käsin mallinnettua 3D-kaupunkia.** Valmis MapLibre kartta vastaa maantiedosta; 3D-resurssit käytetään pelin omiin asioihin.

## 2. Tekninen suunta (kokeiltava, ei vielä pysyvästi lukittu)

Peruskartta on **MapLibre GL JS** + OSM-vektoritiilet. Ensimmäinen 3D-kokeilu tehdään kartan koordinaatistoon sidottuna kerroksena. Suositeltava kokeiltava tapa on MapLibren **custom layer, renderingMode: "3d"**, jossa voidaan käyttää kevyitä Three.js-malleja ja WebGL-geometrya. Tarkista MapLibre v6 -API, kameraprojektiot ja mobiilin GPU-käyttö ennen kuin menetelmä julistetaan valmiiksi. **Älä rakenna karttaa uudelleen Godotin omilla mesheillä tai rasteripikseleistä.**

Alustava rakenne:
- `Basemap`: oikea paikkatieto, vapaa kamera, karttatekstit; syöttää maailmakoordinaatit.
- `World Objects`: Node, Kaiku, pelaaja — pelin omat animoidut 3D-entiteetit, erillinen karttatyylin väreistä.
- `Connections`: ilmassa leijuva parametrinen 3D-käyrä kahden tai useamman Node-ankkurin välillä, materiaalina hillitty valovirta.
- `Coverage Field`: alue-/verkostologiikasta laskettu, läpikuultava 3D-pinta/volyymivaikutelma, hieman maan yläpuolella, animaatiolla.
- `Lighting & UI`: pehmeä 2D/2.5D-glow voi täydentää oikeaa 3D-objektia, mutta ei saa korvata sitä lopullisessa maailmassa. Tekstit renderöidään luettavina.

**Maantietosääntö:** Node/Kaiku ja niistä piirretyt linjat siirtyvät kameran mukana oikein, eivät pysy ruutukoordinaateissa. Korkeus/zoom on määriteltävä niin, että viiva todella näyttää leijuvan katutason yllä. Näytöllä ei saa syntyä perspektiivin läpi hyppäämistä, väärin leikkaavia kerroksia tai taakse piirtyviä objekteja. Ei perustu GPS-pelaajatietoon ensimmäisessä kokeessa.

## 3. v0.4 — konkreettinen rajaus

**Yksi Tampereen rajattu mobiilitesti, jossa vain:**

1. **Kartta:** valittu `Dark · tiet ja tekstit näkyviin` oletukseksi; aiemmat tyylit vain vertailuna.
2. **Kevyempi UI:** pelitilassa enemmän karttaa näkyville; testaustilan 2D/3D, HOME, valojen kytkin säilyvät.
3. **Yksi 3D-Node (DEMO):** sykkivä turkoosi ydin, rauhallinen ylös–alas-leijunta, paikallaan pysyvä ankkurikoordinaatti ja hillitty hehku. Geometria on ensimmäisessä toiminnallisessa koeversiossa kevyt **aito 3D**, vaikka lopullinen mallimuoto hiotaan myöhemmin.
4. **Yksi 3D-Kaiku (Flintail-prototyyppi):** mallin pitää kunnioittaa hyväksyttyä tunnistettavaa identiteettiä, mutta todellista hyväksyttyä valmisrigattua mallia **ei ole vielä varmennettu**. Ensimmäinen kehitysmalli voidaan jättää yksinkertaiseksi, selvästi prototyypiksi merkityksi muodoksi; sitä ei saa kuvata valmiiksi Flintailiksi eikä korvata lopullista hahmoa satunnaisella yksityiskohdiltaan väärällä pedolla.
5. **DEMO-valot:** Node turkoosi, Kaiku vaaleanvioletti; valo on rajattu eikä peitä katuverkkoa.
6. **Mobiili-QA:** sijaintisidonta panoroinnissa, zoomissa, kallistuksessa ja kierrossa; lataus ja sujuvuus oikealla Androidilla; tekstien näkyvyys.

**Rajaus:** v0.4:ssa EI vielä rakenneta kokonaisen verkon peittoaluepilveä eikä kymmeniä 3D-Kaikuja. Yhtä objektiluokkaa ei saa korvata 2D-billboardilla ja väittää sitä käyttäjän toivomaksi 3D-toteutukseksi.

## 4. v0.5 — yhteyssäikeen oma portti

Kun v0.4:n kartta ja 3D-objektit toimivat:
- Kaksi todellista karttakoordinaattiin sidottua **DEMO-Nodea**.
- Niiden välillä **3D-käyrä** (esim. cubic Bézier + rauhallinen epäsäännöllinen aalto) korkeudella, jonka voi nähdä myös 0°–70° kamerakallistuksella.
- Vähän liikkuva, virtaava valokuvio; kapea läpikuultava hehku. Viiva **ei ole suora eikä karttapintaan liimattu**.
- Hahmojen ja kadunnimien luettavuus on tärkeämpää kuin paksu fluoresoiva efekti. Oikea käyttäjän visuaalinen hyväksyntä.

## 5. v0.6+ — peittoaluepilven oma portti

**Vain jos** verkon sääntöjen mukaan Nodejen yhteydestä syntyy peittoalue:
- Alueen muodon tulee perustua pelin **oikeaan yhteys-/peittoaluelogiikkaan**. Siitä ei vielä väitetä lopullista pelisääntöä eikä tuoteta satunnaista koristepilveä peittoalueena.
- Ohut/kelluva läpikuultava orgaaninen kenttä maanpinnan yllä, hitaasti elävä reunavyöhyke; tie- ja nimitiedot näkyvät pilven läpi.
- Toteutustavaksi tutkimus: harva 3D-verkko + alpha, shader-kohina tai kevyt tilavuusilluusio. Vältä mobile-GPU:ta kuormittavaa koko ruudun sumua.
- Rajat ja korkeus sopeutuvat zoomiin, 2D/3D-kameraan ja useiden kenttien päällekkäisyyteen.

## 6. Hyväksyntäportit ja epävarmuudet

- **Tavoite:** sujuva Android-käyttö; 60 FPS on tavoiteluku, ei lupaustulos. Mittaa todellisia frame-aikoja, GPU-kuormaa ja muistinkulutusta oikealla laitteella.
- **Lähtötilanne**: MapLibre v0.3 -kokeilu on selaimessa; sen 3D-mallien, ilmassa olevien säikeiden ja kentän tekniikkaa **ei ole toteutettu tässä dokumentissa**.
- **Hahmon jatkuvuus**: tarkista Flintailin hyväksytyt master-referenssit ennen lopullista 3D-mallia.
- **Sijainti ja tietosuoja:** kokeessa DEMO-koordinaatit, ei oikeita käyttäjän sijaintitietoja eikä turvalliseksi väitettyjä oikeita POI-kohteita.
- **Fallback:** kartan toimivuus pitää testata ilman 3D-kerrosta; 3D-virhe ei saa rikkoa koko karttapohjaa.
- **Käyttäjä hyväksyy jokaisen portin ulkoasun puhelimella.** CI:n vihreä tila ei korvaa visuaalista hyväksyntää.

## 7. Seuraava toteutettava työ

Tee ensiksi **v0.4:n Dark-readable-oletus + siistitty UI + yksi oikea 3D-Node** ja varmista, että Node on maantieteellisesti sidottu myös kameran kallistuessa. Tämän jälkeen lisää Flintail-prototyyppi samaan tekniseen kerrokseen, etene julkaisuun vain testaamalla.

Älä käsittele tätä spec-tiedostoa väitteenä valmiista 3D-pelistä.
