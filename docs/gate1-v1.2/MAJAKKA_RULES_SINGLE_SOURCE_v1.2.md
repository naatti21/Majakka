# Majakka – First Light | Yksi sääntölähde, Gate 1 -ehdokas v1.2
**Päiväys:** 27.10.2026  
**Status:** SUUNNITTELUEHDOKAS / EI JULKAISULUPA; numerot testattavia, ei käyttäjän erikseen hyväksymiä.  
**Käyttö:** ensisijainen tulkintaohje rajattuun sääntömoottoriin ja sen testeihin; nykyinen julkaistu peli ei muutu.

## 0. Miksi tämä dokumentti on olemassa
Work toimitti erilliset `03_MAJAKKA_GDD_v1.1.md`, `04_DISTANCE_NETWORK_FIELDS_INTERFERENCE_RULES.md` ja `balance-config.v1.1.json` sekä `MAJAKKA_COMPLETE_DESIGN_v1.1.md` -koosteen. Niissä on eri numerot ja osittain eri käyttäytymissäännöt. Kumpaakaan versiota ei saa naamioida jo lukituksi päätökseksi. Tässä luodaan **yksi Gate 1 -testiehdokas** siten, että ristiriidat on näkyvästi dokumentoitu.

### Lähdejärjestys Gate 1:ssä
1. **LOCKED**: käyttäjän keskustelussa sovitut periaatteet ja `MAJAKKA_GAME_DESIGN_FOUNDATION_v1.0.md` (säilytä niiden henki ja eksplisiittiset kiellot).
2. **PROVISIONAL**: numeeristen sääntöjen yhteiseksi ehdokkaaksi Workin *erillinen* `04_DISTANCE_NETWORK_FIELDS_INTERFERENCE_RULES.md` ja sitä vastaava `balance-config.v1.1.json`. **Niitä ei hyväksytä automaattisesti tuotantoon.**
3. **PROVISIONAL GAMEPLAY**: erillinen `03_MAJAKKA_GDD_v1.1.md` (toiminnot, sisällön tavoite ja nimenomaiset rajoitukset), vain jos ei riko kohtia 1–2.
4. **ALTERNATIVE / ARCHIVED**: `MAJAKKA_COMPLETE_DESIGN_v1.1.md`:n poikkeavat laskelmat ovat vaihtoehtoinen versio, eivät tämän kokeilun ohjelmistosääntöjä. Sen esimerkkitarinat, retkikonsepti, käyttöliittymän selkeys ja koetapaukset säilyvät hyödyllisinä.

Kun ehdotus läpäisee Gate 1 -testit, yhden muutoksen PR käsittelee numeerisen vaihdon kaikkialla: config + testit + muutosloki. Codex ei saa itse muuttaa lukuarvoja kohdatessaan ongelman.

## 1. Lukitut peliperiaatteet, joita ei suunnitella uudelleen
- Yksi yhteinen, palvelimella vahvistettu maailma. Nodejen pysyvät identiteetit ja koordinaatit ovat samat kaikille.
- Todellinen lähteistetty paikka tai avoimesti fiktiivinen kanoninen **Regional Phenomenon**, ei kameran generoimaa nodepilveä. Syrjäseutujen pelattavuus on julkaisuehto.
- Lumenit ovat maantieteeseen sidottuja, eivät zoom- tai karttakameroiden luomia. Kerääminen ei ole päämäärä.
- Karttakamera, kotialue/toimintakeskus ja luvallinen GPS-havainto ovat **kolme eri asiaa**; kameraa liikuttamalla ei etäännytetä tai lähennetä pelivaikutusta.
- Paikallinen toiminta on tehokkainta. Kaukaisten nodejen tutkimus ja rakentaminen sekä mannertenväliset säikeet/kolmiot ovat mahdollisia. Kotona pystyy pelaamaan ilman pakollista GPS:ää.
- Kahdesta **heränneestä** nodesta voi valita rakennettavan säikeen; kolme eri nodea ja kaikki kolme vahvistettua reunaa muodostavat kentän. Ei automaattista linkkiä, ei pinta-ala-Lumenia.
- Interference rajoittaa tilapäisesti toimintaa. Se ei poista yhtään pysyvää herätystä, säiettä, kenttää, fragmenttia tai pelaajan viikkojen edistymistä. Pelaamatta jättäminen ei luo velkaa.
- Pelin ydinkoukku on **havainto → valinta → verkon käyttö → uusi tieto tai pysyvä maailmanseuraus**. Ei klikattavia pisteitä ilman tarkoitusta, loputonta farmausta, streakkejä, PvP:n tuhoamaa edistymistä tai jatkuvaa huoltamista.
- Englanti ensin itse pelissä. Mobiilissa yksi ymmärrettävä tavoite kerrallaan; visuaalinen orgaanisuus ei saa pakottaa raskasta renderöintiä.

## 2. Varsinainen pelikierros – mitä varten nodet ovat olemassa?
**Valittu hypoteesi:** tutkimusretket johtavat, reittien rakentaminen antaa päätöksille merkityksen ja yhteiset suurprojektit ovat vapaaehtoinen kerros. 

1. **Havaitse:** kartta esittää todelliseen paikkaan tai selvästi merkittyyn alueelliseen ilmiöön liittyvän fiktiivisen signaaliristiriidan, kysymyksen ja vihjeen. Pelaaja saa ensimmäisen merkityksellisen valinnan heti.
2. **Herätä / tutki:** jos solmu on Dormant, pelaaja voi käyttää Lumenia tai suorittaa aidon kerran avautuvan tietotehtävän. Jo herätetty node ei ole uudelle pelaajalle tyhjä: hän saa henkilökohtaisen tutkimustehtävän.
3. **Suunnittele säie:** pelaaja valitsee kaksi jo herätettyä nodea ja näkee kustannuksen, etävaikutuksen, tarkoituksen sekä sen, mitä valinta muuttaa. Säie ei synny pelkästä läheisyydestä.
4. **Muodosta kenttä:** kolmas hyväksytty reunayhteys sulkee kolmion. Henkilökohtaisessa tutkimuksessa valitaan yksi **Beacon / Shelter / Lens** -funktio. Julkista kentän roolia ei vaihdeta muiden puolesta.
5. **Reagoi:** Interference tarjoaa **Stabilize / Investigate / Reroute / Ignore** -valinnat, joilla on eri hyöty. Ohittaminen on täysin kelvollista.
6. **Kirjaa:** pysyvä löytö, fragmentti, reitti tai menetelmä avaa uuden kysymyksen tai päätöksen. Sessio saa loppua, kun seuraus on selvillä.

**Pelaajalle ei luvata:** jokaisesta napista valuuttaa, jokaisesta kolmiosta ilmaista resurssia, uusia tehtäviä kellon perusteella tai pakkoa seurata häiriöitä. Viides sessio ei saa olla sama herätys viidennessä kohteessa.

### Pilotin kuusi erilaista tapausta
`First Light` (oma havainto ja ensimmäinen herätys), `Two Voices` (kahden havaintopaikan vertailu), `The Missing Beat` (kentän rooli ja reitin vaikutus), `Quiet Reference` (häiriön suojaus tai ohitus), `Crossroads` (reittivalinta kahden kentän välillä), `First Horizon` (pitkä yhteys, tutkittu reitti tai yhteistyö). Näiden tulee sisältää vähintään kaksitoista aidosti erilaista suunniteltua/validoitua **päätöstilannetta**, ei kuutta saman kuvion väriversiota. Vain yksi ensimmäisen luvun loppuun asti pelattava, laadukas vertikaalinen testi avataan ennen laajaa sisällöntuotantoa.

## 3. Numeeriset Gate 1 -ehdokkaat (v1.2 config)
**Nämä ovat simulaatiomallin lähtöarvot, eivät päätetty balanssi.** Arvot löytyvät koneellisesti tiedostosta `balance-candidate.v1.2.json` kohdasta `parameters`.

| Kohde | Gate 1 -ehdokas | Huomautus |
|---|---|---|
| Aloitussaldo | 8 L, saldo enintään 18 L | ensisäie vie koko 8 L; **testattava ensimmäisen kentän odotusriski** |
| Channel | +4 L enintään kerran / 20 h | ansaintakatto 10 / liukuva 24 h; **älä tee kirjautumispakkoa** |
| Node-herätys | 2 L panos, läheltä +1.0 charge | lisäys riippuu `e(d)`:stä; sama pelaaja/node 20 h väli vain suorille toistopulsseille |
| Node-tutkimus | 3 erilaista kertatoimea, 1 L / +0.30 kukin | enintään +0.90 yhteensä / pelaaja+node, ei minipelihattarasta |
| Säie | 2 L / panos; Anchor ja Align voidaan tehdä ensimmäisellä sessiolla | myöhempi Reinforce 20 h / pelaaja+sama säie; linkki on pysyvä |
| Pitkän säikeen tutkimus | >100 km, 3 kertaluonteista +1.5 työyksikön Proofia (1 L/kpl) | Proof-katto yhteensä **80 % säikeen rakennustyöstä**, kaikkien käyttäjien yli |
| Kenttä | kolme hyväksyttyä säiettä; enintään 2 aktiivista henkilökohtaista fokusta | pinta-ala tai kenttien määrä ei tuota passiivista Lumenia |
| Häiriö | 24 h Signal + enintään 72 h Interference + 48 h Recovery | yksi tapahtuma max -20 prosenttiyksikköä, yhteensä max -40 pp, ei pysyvää menetystä |
| Pelkkä kameran siirto | ei muuttunutta vaikutuskeskusta tai kustannusta | kaikissa renderöintitiloissa |

### 3.1. Etäisyysfunktio
`d` on geodeettinen etäisyys kilometreinä, ei ruutukoordinaatti. Käytetään haversinea säteellä 6371.0088 km. Sekä nodejen että säikeiden laskenta tehdään kanonisesta geometriasta ja palvelimen hyväksymästä toimintakeskuksesta.

```text
E(d) = 1.00                                           kun 0 <= d <= 5
     = 1 - .35*(d-5)/20                              kun 5 < d <= 25
     = .65 - .35*(d-25)/75                           kun 25 < d <= 100
     = .30 - .22*(d-100)/900                         kun 100 < d <= 1000
     = .02 + .06*exp(-(d-1000)/1400)                 kun d > 1000
```

Pisteet: E(5)=1, E(25)=.65, E(100)=.30, E(1000)=.08, E(2307)≈.0436 ja E(6491)≈.0212. Raja-arvot ovat jatkuvia, vaikutus ei koskaan parane etäisyyden kasvaessa eikä alle .02. **Smoothstep-versio Workin pitkästä koosteesta on vaihtoehto, ei tämän testiversion funktio.**

### 3.2. Säikeen sääntö
Kaksi eri, Awakened-nodea `A`, `B`; järjestyksestä riippumaton linkki-ID. Kustannustyö:

```text
W(D_km) = 2 + min(4,max(0,log10(max(1,D_km/2))))  // 2..6 work
Q(A,B) = sqrt(Eeff(home,A) * Eeff(home,B))          // 0..1
```

- Ensimmäiset suunnitteluteot `Anchor` ja `Align` ovat aidosti **kaksi erilaista tekoa**. Jos testissä ne näyttävät samalta kaksinkertaiselta maksulta, yhdistä/suunnittele uusiksi ennen toteutusporttia.
- Pitkän linkin 3 erilaista Proofia voi kattaa **enintään 80 % W:stä yhteensä**, vaikka kuinka moni osallistuu. Vähintään 20 % edellyttää hyväksytyllä Q-teholla tehtyä rakennustyötä.
- Relehyöty on `max(E_direct, min(.60,E(Dvirt)))` ja hyväksytty reitti enintään 6 hyppyä; yhden linkin virtuaalietäisyys on `20 km + .12 * L_km` + sisään/ulos-geodeettiset matkat. Reitti ei saa kulkea keskeneräisen säikeen läpi eikä sisältää sykliä.
- Mannertenväliset kolmionmuodostukset ovat sallittuja, mutta pituuden ja etätoiminnan vuoksi merkittäviä hankkeita. Kartan risteävät säikeet eivät peru linkkejä; projektion dateline-/napaerikoistapaukset testattava.
- Kolmio syntyy, kun `AB, BC, CA` kaikki Committed. Muiden käyttäjien jo rakentama infrastruktuuri on käytettävissä myös uusille pelaajille.

### 3.3. Vastavoiman sääntö
`Calm -> Signal (24 h, 0 haitta) -> Interference (max 72 h, max -20 pp/tapahtuma) -> Recovery (48 h asteittain nollaan) -> Calm`. Kokonaishaitta yhteen omaan toimintoon enintään -40 pp. Ilmiöt ratkeavat ilman huoltamista; **pysyvät herätykset, säikeet, kentät ja löydökset eivät katoa koskaan häiriön vuoksi**.

- `Stabilize`: 2 L, välitön toiminnallisen haitan poistuminen ja yhteinen siirtymä palautumisvaiheeseen, jos ehdot täyttyvät. Ei veloitusta, jos jo rauhoittunut.
- `Investigate`: ilmainen, mutta ratkaistava merkityksellinen havainto; säilyvä fragmentti tai uusi tulkinta; omaa toimintavajetta ei poisteta automaattisesti.
- `Reroute`: 1 L, oman fokuksen väliaikainen vaihtoehtoinen reitti (enintään 24 h); ei kirjoiteta uutta kanonista säiettä eikä sotketa muiden fokusvalintoja.
- `Ignore`: maksuton, turvallinen ja aina mahdollinen. Ei kertynyttä vahinkoa, velkaa, turhaa tehtäväpinoa eikä palkintojen katoamista 21 päivän tauon jälkeen.

### 3.4. Palvelinauktoriteetti ja turvallisuus
Kaikki yhteiset node/link/field/event-tilat ja pelaajan saldo ratkaistaan palvelimella. Atominen, idempotentti operaatio tallentaa `operationId`, payload-hashin, oikean `actorId`, `expectedRevision`, katalogiversion ja kuitin. Sama operationId samalla payloadilla palauttaa saman kuitin. Sama ID eri payloadilla hylätään. Kaksi rinnakkaista tekijää ei saa yliveloitusta eikä kahteen kertaan julkista aktivointipalkintoa. Asiakas ei valitse maailman node-koordinaatteja, todistettua GPS-lippua, wallet-saldoa tai etäisyyskerrointa.

**Data:** rajatuilla säännöillä valittu Overture/OSM-katalogi, turvallisuussuodatus ja lisenssikatselmus. Majakan oma muuttumaton `worldNodeId` + aliakset lähteille, versionoidut kentät. Julkiselle ominaisuudelle ei väitetä käyntiturvallisuutta OSM:n keskipisteen perusteella. POI-köyhälle alueelle voidaan *julkaista* kanoninen Regional Phenomenon, ei generoida joka kameraruutuun. GPS-vapaus ei tarkoita huijaamatonta todellista sijaintia: kotialue on strateginen sitoumus, ei vahvistettu asuinpaikka. 30 vrk vaihtoväli on ehdokas.

## 4. Work-paketista löytyneet ristiriidat – päätösrekisteri
| Tunnus | Yhtenäinen `COMPLETE_DESIGN` | Erillinen `03/04` + config | Gate 1 -valinta / perustelu | Status |
|---|---|---|---|---|
| C01 | aloitus **12 L + 6 nostamatonta** | **8 L**, saldo18 | **8 L testiehdokas**: erillinen 04+config on yhteneväinen; edistymislukko testataan | PROVISIONAL |
| C02 | **30 h** häiriö, 6+18+6 | **144 h / 6 vrk**, 24+72+48 | **6 vrk testiehdokas**: 04+config; vertaa 30h-malliin koetulla ylläpitopaineella | PROVISIONAL |
| C03 | `C(L)=min(18,2+2*log2(max(1,L/5)))` | `W(D)=2+min(4,log10(max(1,D/2)))` | **W / 04** kevyempi pitkille linkeille; vertailutesti pakollinen | PROVISIONAL |
| C04 | linkkipanoksen `max(Ea,Eb)` | `sqrt(Ea*Eb)` | **geometrinen keskiarvo / 04** kunnioittaa etäisyyttä molempiin päihin | PROVISIONAL |
| C05 | 3 kenttää / tutkimusretki | 2 aktiivista henkilökohtaista kenttäfokusta | **2 / 04** yksinkertaisempi mobiiliin; 3-field alternative säilyy | PROVISIONAL |
| C06 | max 8 relehyppyä, .85-hävikki/kaari, kap 0.65 | max 6 hyppyä, paino 20+.12*L, kap .60 | **6 / 04** yhden testifunktion lähteeksi; toinen vaihtoehto myöhempään kokeeseen | PROVISIONAL |
| C07 | 3 reittikohtaista Route Survey -tekoa avaa nimetyn kohteen E>=.25 | 3 kohdekohtaista +.30 tutkimustoimea (yht .90) + suorat toimet | **04:n kohdetutkimus**; erillinen Route Survey suunnittelun vaihtoehtona, ei samanaikainen bonustie | PROVISIONAL |
| C08 | yhden retken 12 linkkiä/3 kenttää ja linkkikapasiteetti 2 | 2 aktiivista henkilökohtaista kenttää, ei samaa retkikapasiteettia | **Ei tuoda 12-linkki- ja kapasiteettisääntöä Gate 1:een**; retken rajaus suunnitellaan erikseen | OPEN |
| C09 | 6 kirjoitettua tapausta | ≥12 erilaista tutkittua haastetta ennen julkaisua | **6 tapausta**, joissa **≥12 erilaista ratkaistavaa päätöstä**; sama ei merkitse automaattisesti 12 erillistä jaksoa | PROVISIONAL |
| C10 | Lumen-keruu koti/varanto, myös ilman GPS:ää | jyvien nouto aidolla GPS:llä, Channel +4/20 h | Ei saa luoda GPS-pakkoa; hyväksymisehto on **kotipelaajan etenemisen tasa-arvo**, keruutapa OPEN. 04:n ekonomiaparametrit vain simulaatiolle | OPEN |
| C11 | 3 kentän roolit retkikohtaisia | 2 henkilökohtaista roolia/fokusta | Yhteinen maailma ei saa sisältää globaalisti muiden puolesta muutettavaa roolia. Täsmennä ensimmäisessä UX-testissä fokuksen suhde retkeen. | OPEN |
| C12 | ajallinen retken kuvauksen lukitus | ei valmista retki-snapshot-kontraktia | Tärkeä eheysvaatimus, mutta konkreettinen retkiversiointi Gate 2 -malliin ennen backendia | OPEN |

## 5. Kriittiset riskit – hyväksymisehdot ennen tuotantoa
**R1. Ei odotusansaa:** 8 L:llä paikalliset 2 herätystä + `Anchor/Align` = täsmälleen 8 L. Mutta täysin tyhjän kolmen noden kentän työ vaatii 18 L jo ennen mittausta. Tämä on oikea riski, ei onnistunut pelisuunnittelu. Testaa 8 vs 12+varanto -mallit ja vaihtoehtoinen tutkimusreitti **ilman 20 h login-aikataulua**.

**R2. Kaukoyhteys ei saa olla 20 klikkausta:** simuloitu kaukoteho voi olla 2 %. Kolmen yksilöllisen todistetehtävän jälkeenkin tarvitaan hyväksyttyä rakennustyötä; pelaajien pitää kokea se strategiaksi. Hylkää, jos toisto voittaa tutkimuksen tai yhteistyön.

**R3. Häiriön kesto ei saa rasittaa:** 6 vuorokauden rajattu tapahtuma on turvallinen pysyvälle edistykselle, mutta voi silti muistuttaa päivystämisestä. A/B-testaa 30 h vs 6 vrk ja pelaajien halu olla poissa 21 päivää.

**R4. Syrjäseudun sisältö pitää julkaista oikeasti:** alueellinen ilmiö on erikseen selitetty fiktiivinen, kiinteään julkaistuun alueeseen sidottu. Yhtään “tulemme myöhemmin lisäämään sinulle nodeja” -aluetta ei hyväksytä pelattavaksi kattavuudeksi.

**R5. Yhteinen palvelin, ei kaksi clientin totuutta:** vähintään kahdessa selaimessa/tilissä näkyy sama node, säie, kenttä ja kuitattu muutos. Palvelin estää 1000 toistopyynnön tuplat, saldojen yliveloituksen ja samanaikaisuuskilpailun.

**R6. Hauskuus ei ole 134/134 testiä:** 8–12 ensipelaajan laadullinen UX-testi eri sijainneissa + heikko Android. Vähintään 80 % ymmärtää ensimmäisen tavoitteen 2 min sisällä; viidennessä sessiossa aidosti uusi päätös. Näitä ei ole vielä mitattu.

## 6. Gate-järjestys ja Codexin oikeudet
1. **Gate 1:** puhdas, DOMiton, deterministinen `game-rules/` sääntömoottori erilliseen `feature/majakka-rules-v12`-haaraan; ei muutoksia nykyiseen `main`-julkaisuun. Testaa geo/monotonisuus, balansi, linkkien ID, kolmiot, kentät, häiriöt ja lompakon identiteettirajat.
2. **Gate 2:** ensimmäinen todellinen pelillinen tutkimusretki (**The Missing Beat**) ja kaksi erilaista ratkaisua, joiden vaikutus voidaan testata ilman karttaa; pilotin julkaistu Tampere/maaseutu/kaukoverkko-data valvotaan.
3. **Gate 3:** turvallinen aito yhteinen palvelin, atominen wallet+graafi, julkaistu katalogi, tallenteiden turvallinen migraatio; kaksi eri käyttäjää todentaa saman muutoksen.
4. **Gate 4:** yksi kevyt mobiilikartta, geodeettiset säikeet/alueet, kenttien visuaalinen elävyys ja oikean Androidin mittaustulokset. Vasta sitten julkaisu päätetään.

**GO vain Gate 1 -kehityshaaraan** kun lähdekonfliktit merkitty, testit tehtävissä ja Workin kehityspaketti säilytetty. **EI GO nykyisen mainin toiminnan muuttamiseen, palvelimen avaamiseen tai globaaliin julkaisuun**. 

## 7. Testisopimus / anti-regressio
- Numerofunktiot: `E(d)` raja-arvojen jatkuvuus, monotonisuus, negatiiviset/NaN/∞, d=0, 5,25,100,1000,2307,6491 km, napatilanteet, ±180° antimeridiaani.
- Graafi: järjestysriippumaton identiteetti, yksi hyväksytty linkki/pari, kolmio syntyy jos ja vain jos AB+BC+CA, risteys ei hylkää, suuren kolmion 0 L pinta-alatuotto.
- Proof: ei samaa stagea kahdesti, cap 80% koko yhteisprojektin yli; 2 ensimmäistä valintaa voi tehdä saman session aikana.
- Interference: eteneminen palvelimen UTC-ajassa vaikka sovellus suljettu; -20/-40pp katot, 21 päivän tauko ei aiheuta pysyvää menetystä; Investigate/Ignore ei tuota saldo-velkaa.
- Lompakko: ei negatiivista saldoa, tulot rajatut, toistopyyntö ei tuota lisähyötyä, jo valmis kohde ei veloita.
- Maaseutu: 0/1/3 soveltuvan POI:n fixturet ja erikseen julkaistu alueilmiö, ei kameralle luotua virtuaalista nodea.
- Renderöinti: Gate 1 moottorissa **ei** karttariippuvuutta; 2D/3D yksinään eivät muuta yhteistä totuutta.
- CI: nykyisen repon `node --test tests/*.test.mjs` läpäisee; uudet testit ovat lisäys, eivät uusien asetusten keino muuttaa vanhojen tuloksia hiljaisesti.

## 8. Päätöksen laajuus
Tämän version hyväksyminen mahdollistaa puhtaan sääntömoottorin aloittamisen ja ehdotusten testaamisen. Se **ei** vielä lukitse lopullista Lumen-taloutta, 30 h/6 vrk Interference-valintaa, kaupallistamista, GPS-lisätehoa, retkikapasiteettia eikä pelin julkaisemista. Mahdollinen huomattava sääntömuutos vaatii erillisen versionumeron, muutosperusteen ja toistettavat testit.

**Tarkastettu / Validated:** dokumentin ja konfiguraation sisäinen lähdevastaavuus sekä tiedostojen rakenne. Ei fyysistä pelaajatestiä eikä toimivan backendin todennusta.
