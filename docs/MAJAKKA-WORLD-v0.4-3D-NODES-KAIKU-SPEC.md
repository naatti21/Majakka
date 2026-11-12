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

## Päätöspäivitys 2026-11-12 — tekninen Node hyväksytty, ulkomuoto avoin

**HYVÄKSYTTY FYYSISELLÄ ANDROIDILLA:** Käyttäjä vahvisti World v0.4.2 -testin jälkeen: *"No mutta nythän se on hyvä."* Tämä koskee **renderöinnin eheyttä ja geosidottua 3D-Noden näyttämistä kartalla** aiemman mustien karttaviiltojen vian jälkeen. Se ei tarkoita koko tuotantomoottorin, suorituskyvyn tai pelivalmiuden loppuhyväksyntää.

**AVOIN DESIGN:** Käyttäjä huomautti samassa palautteessa, että **Nodejen varsinaista ulkomuotoa ei ole vielä suunniteltu tai hyväksytty**. Nykyinen turkoosi oktaedri, renkaita sisältävä kristallikehikko ja valopilari on **tekninen paikkamerkki**, ei kanoninen Node eikä varsinainen hahmo.

**Muodon suunnittelun lähtökriteerit (ehdotuksia, ei päätöksiä):**
- **Oma tunnistettava siluetti:** erotuttava tavallisesta sci-fi-kristallista/loot-beaconista; tunnistettava myös kauempaa ja eri kamerakulmista.
- **Elävä rakenne:** orgaaninen liike tai materiaalin syke, ei pelkkää jäykkää pyörivää geometriaa. Node on maailman osa, jolla on yhteys Resonanceen, Kaikuihin ja myöhempään säieverkkostoon.
- **Valaiseva mutta kiinteä:** itse Node näkyy ehjänä, valo/energia voi olla läpikuultavaa. Sijainti maantieteeseen sidottuna ja pieni leijunta sallittu.
- **Yhteyssäikeen lähtökohta:** tulevalle orgaaniselle ilmassa leijuvalle Node–Node-säikeelle pitää löytyä visuaalisesti luonteva kiinnittymiskohta; peittoalue syntyy vasta todellisesta pelilogiikasta.
- **Mobiili ensin:** siluetti, kontrasti, osittainen peittyminen, animaation rytmi ja GPU-kuorma testattava Tampereen tummalla kartalla, ei vain irrallisessa taidekuvassa.
- **Muotokieli vasta arvioinnin jälkeen:** vertaillaan esimerkiksi elollista siemen-/kudosrakennetta, muinaista resonanssireliikkiä ja kerrostunutta energiarakennetta. Näistä **mitään ei ole valittu**, eivätkä esimerkit ole uusia lukittuja lore-päätöksiä.

**Seuraava portti:** tee erillinen Node Art Direction -vertailu 2–3 selvästi toisistaan eroavasta konseptista ennen lopullisen 3D-mallin muotoilua; käytä toimivaa v0.4.2-renderöintipohjaa näyttämiseen. Flintailin hyväksyttyä identiteettiä ei muuteta Noden ulkomuodon suunnittelussa.

## Päätöspäivitys 2026-11-12 — palautetaan alkuperäinen KUUDEN Node-tyypin järjestelmä

**LÄHDE / SUUNNITELMA OLI JO TEHTY:** [NODE-ATLAS-v0.1.md](NODE-ATLAS-v0.1.md) määrittelee kuusi erilaista **pelillistä Node-toimintoa**, eikä vain eri värisiä tai eri näköisiä objekteja. Sama luokittelu on mukana toteutetun [atlas-autogen.js](../atlas-autogen.js) -luokittelun `nodeType`-kentässä. Käyttäjä muistutti, että niillä oli eri ominaisuudet. AI:n 12.11. ehdottamat kolme abstraktia ulkomuotoa eivät ole korvaava Node-luokitus tai hyväksytty lore.

| Alkuperäinen tyyppi | Paikkakategoria | Suunnitelmassa määritelty toiminta |
| --- | --- | --- |
| **Prism** | Taide / muraali | Taittaa valosäikeitä ja avaa taajuus-/väritehtäviä |
| **Archive** | Historia / muistomerkki | Paljastaa muisto-fragmentteja, valintoja ja mysteerejä |
| **Grove** | Puisto / luontokohde | Rauhoittaa häiriöitä, orgaaninen juurivalaistus |
| **Relay** | Reitin opaste / risteys | Välittää ja haaroittaa valoa sekä vaihtoehtoisia yhteyksiä |
| **Observer** | Näköalapaikka | Paljastaa kaukaisia heikkoja Kaiku-signaaleja |
| **Commons** | Kirjasto / kulttuurikohde | Kollektiiviset muistot ja myöhempi yhteistoiminta |

**TÄRKEÄ EROTUS:** `atlas-core.js` käyttää erikseen **neljää karkeaa paikkakategoriaa** `art / history / nature / culture`. Ne eivät ole sama asia kuin kuusi yllä kuvattua Node-pelityyppiä. Kaiku / Echo -nimityksiä on lisäksi käytetty sekä fiktiivisistä etätehtävistä että 3D-olennoista — älä sekoita näitä tietomalleissa.

**TOTEUTUSTILAT:**
- **Suunniteltu:** kuusi tyyppiä sekä niiden perusroolit (Node Atlas).
- **Koodattu osittain:** `atlas-autogen.js` tunnistaa kategorioista `nodeType`-arvon ja valitsee ehdokkaita sääntöjen mukaan.
- **Ei todistettu valmiiksi:** kuuden tyypin oikeat yksilölliset 3D-mallit, animaatiot, vaikutussäännöt, äänet ja integroidut yhteydet uudessa MapLibre 3D -maailmassa.
- **Testattu:** MapLibre v0.4.2:n **yksi geneerinen DEMO-3D-Node** toimii renderöinnin kannalta fyysisellä Androidilla; ei edusta mitään kuudesta virallisesta Node-tyypistä.

**VISUAALINEN JATKOTYÖ:** suunnitellaan **kullekin kuudelle tyypille oma 3D-siluetti ja vaikutuksen animaatiokieli** nimenomaan toimintaa heijastaen. Esimerkiksi Prism taittaa valoa ja Relay näyttää yhteyksien haarautumisen — nämä vaikutukset ovat alkuperäisestä suunnitelmasta. Tarkka materiaalin väri, geometria ja liike ovat **avoimia designratkaisuja**, joita ei saa esittää jo lukittuina. Ei tehdä geneeristä yhtä kristallia kuudessa värissä. Seuraavaksi tehdään Node-tyyppikohtainen visuaalinen suunnittelukortti ja **yhden** tyypin uusi 3D-prototyyppi toimivalle kartalle.

**GLOBAALI ATLAS:** lopullinen Node-verkko muodostetaan turvallisuussuodatetuista ja julkisesti lähestyttävistä oikeista paikoista, käyttäen automaattista lähdepohjaista valintaa [NODE-ATLAS-AUTOGEN-v0.1.md](NODE-ATLAS-AUTOGEN-v0.1.md). Tämä suunnitelma ei muuta pelin DEMO-koordinaatteja julkisiksi turvallisiksi kohteiksi.

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
