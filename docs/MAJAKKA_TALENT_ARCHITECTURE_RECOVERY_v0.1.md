# MAJAKKA — Talent Architecture / palautettu suunnitelma v0.1

**Päiväys:** 2026-11-12  
**Tila:** AIEMMASTA KESKUSTELUSTA PALAUTETTU SUUNNITTELU. Ei valmis tai pelissä toteutettu talent-puu.
**Miksi dokumentti on olemassa:** käyttäjän 8.11.2026 Talent-keskustelua ei voi enää jatkaa vanhassa chatissa; näin sen olennaiset päätökset ja avoimet kohdat säilyvät GitHubissa.

## 1. Talentin perusfilosofia — käyttäjän hyväksymät rajat

- **Classless / ei lukittuja hahmoluokkia.** Pelaajaa ja Kaikua voidaan viedä eri suuntiin ja yhdistää valintoja.
- **Monipuolinen, mutta ei eksyttävän valtava talent-universumi.** Puu tarjoaa valintoja, ei valtavaa turhaa rakennetta.
- **Ei yhtä pakollista meta-buildia.** Kaiku-speciesin omat painotukset muuttavat *miten* tehtävä ratkaistaan, eivät sulje suurinta osaa pelin sisällöstä pois.
- **Undo / Full Reset mahdollinen ehdoin.** Väärä talent-valinta ei lukitse pelaajaa tai Kaikua pysyvästi. Respecin tarkkaa kustannusta, cooldownia tai avausehtoa **ei ole palautettu** — älä keksi.
- Talenteilla tulee olla havaittava pelivaikutus etenkin etsimiseen, Kaiku-suhteeseen ja Node-verkostoon; ei pelkkiä prosenttinumeron korotuksia.

## 2. Player Talent Web — alkuperäinen luonnos

| Rakenne | Vanhan keskustelun luku / päätös |
| --- | --- |
| Solmuja | **24** (suunnittelumitoitus) |
| Jaettavia pisteitä | **14** (suunnittelumitoitus) |
| Pääsuuntia | **4** |
| Hahmoluokka | **Ei lukittua class-roolia** |
| Reset | Undo / Full Reset ehdollisena mahdollisuutena |
| Hybrid Talent | Pääsuuntia yhdisteleviä erikoistalenteja, esimerkkityönimi **Phantom Trail** |

Pääsuunnat ja merkitys (merkitykset tulkitaan nimien sekä aiemman pelirakenteen pohjalta; yksittäisten kykyjen tarkkoja kuvauksia ei ole varmennettu):

1. **Tracking** — jäljittäminen, havainnointi, signaalit ja löydöt.
2. **Bonding** — suhde Kaikuihin, aktiivinen Companion, Guardianien tuki.
3. **Weaving** — Node-verkoston yhteydet, orgaaniset säikeet, vaikutusalueet.
4. **Veilcraft** — häiriöt, hämärtyneet/peitetyt ilmiöt, vaihtoehtoiset ratkaisut.

Nämä neljä ovat talent-suuntia, eivät pakollisia pelihahmoluokkia. `Phantom Trail` oli keskustelussa **Hybrid Talent -esimerkki**: **Player Deep Tracking + Kaiku Echo Sense → Phantom Trail**. Tarkka vaikutus, prerequisite-tasot ja avausehto ovat **AVOIN**; esimerkki ei ole hyväksytty toteutettu taito.

## 3. Kaiku Talent Tree — alkuperäinen luonnos

| Rakenne | Vanhan keskustelun luku / päätös |
| --- | --- |
| Solmuja per Kaiku | **12** (suunnittelumitoitus) |
| Jaettavia pisteitä | **7** (suunnittelumitoitus) |
| Identiteetti | Species → Form → Instance → Presentation |
| Periaate | Species-kohtainen painotus; ei sama geneerinen puu kopioituna |
| Hahmoluokka | Ei peruuttamattomia Companion/Guardian/Explorer-lukituksia |
| Reset | Ehdollinen Undo / Full Reset -mahdollisuus |

- Flintail on **Trailborn / Aera** ja sen jo dokumentoidut piirteet ovat **Agile / Tracker / Field Sense**. Tämä ohjaa Flintailin talent-tyyliä. Vanhan keskustelun esimerkkipuiden nimiä olivat **Flintail Adaptive**, **Mosswake Rooted** ja **Veilmoth Convergence**. Nämä ovat aiempia talent-konsepteja, eivät todiste Mosswaken tai Veilmothin hyväksytyistä malleista, rigistä tai pelikoodista.
- Kaikuilla voi olla erilaiset animaatiot, liikkumismekanismit ja talent-puuston painotukset. **Samat keskeiset pelitavoitteet pitää voida saavuttaa eri taktiikoilla**, jotta yksi species ei muutu ainoaksi järkeväksi valinnaksi.
- Kaiku Talent, speciesin luontainen taitoprofiili, `Form/Hybrid`, `Guardian`-tehtävä ja `Animated Card` ovat **eri tietomallin käsitteitä**. Älä yhdistä niitä yhdeksi muodonmuutos-valikoksi.

## 4. Active Party, Guardianit, ylimääräiset Kaikut

**Käyttäjän muistettu päätössuunta 8.11.2026:**
- **1 tai enintään 3 aktiivista Kaikua**; asistentsuunnitelmassa **1 Primary Companion + 2 Support**.
- **Ylimääräisiä Kaikuja voi asettaa Node Guardianeiksi**, joista tulee Nodea vahvistava, tyypin/kyvyn mukainen pieni vaikutus.
- **Ei suoraa Kaikujen Trading-järjestelmää.**
- Aiempi käyttäjän esimerkki oli **noin 10 ylimääräisen Kaikun avulla Evolutionin nostaminen 1–2 tasoa**. Tämä **ei ole tavallinen XP/Level-nousu**. Täsmällinen duplikaattien muunnos, kulutus ja kustannus ovat **AVOIN**.

**Avoin:** mikä tarkalleen tekee Guardianista hyvän johonkin Nodeen; pinoamiskatot, Guardian-paikkojen määrä, takaisin kutsuminen, bondin pysyvyys, aktiivisen party-koon vaihtaminen, mahdollinen 10 Kaikun käyttötapa, ja mitä kukin nostotaso antaa.

## 4A. Kaikun eteneminen on useampi erillinen akseli

**XP / Level ja Evolution olivat aiemmassa keskustelussa erilliset.** Niitä ei saa sekoittaa:

- **XP / Level:** kokemuspohjainen tasokehitys. Täsmälliset XP-lähteet ja level-cap ovat avoimia.
- **Evolution:** erillinen, Kaikun muotoa/kehitysastetta koskeva järjestelmä. Käyttäjän 10 ylimääräisen Kaikun esimerkki koski tätä (1–2 Evolution-tason nousua), ei tavallista levutusta.
- **Echo Imprints:** assistentin aiemmin ehdottama mahdollinen resurssi, jonka ylimääräiset/duplicate-kaikut voisivat tuottaa Evolutionia varten. **Ei lukittu nimi tai vaihtosuhde.**
- **Talent Web:** oma valintojen ja kykyjen rakenteensa. Pisteiden ansainta, tasorajojen suhde ja palautuksen kustannukset avoimia.

**UX-laatuportti myöhemmin:** aktiivisen Companionin tai Guardianin pitäisi erottua selvästi ylimääräisistä yksilöistä, eikä vahvistetussa Evolution-toiminnossa saa huomaamatta käyttää arvokasta Kaikua. Tämä on toteutusturvan ehdotus, ei väite valmiista pelitoiminnosta.

## 5. Tiedossa oleva pelikonteksti — ei automaattinen talent-spesifikaatio

- [NODE-ATLAS-v0.1.md](NODE-ATLAS-v0.1.md) määrittää jo **kuusi erilaista Nodea**: Prism, Archive, Grove, Relay, Observer, Commons. Niiden kykyprofiilit ovat erilliset Player/Kaiku-talent-puista.
- [APP-SPEC.md](../APP-SPEC.md) ja nykyinen Majakka-PWA sisältävät Lumen-, Node-, häiriö- ja kenttämekaniikkojen kokeiluja; **niitä ei pidä sekoittaa talent-puiden toteuttamiseen**.
- [KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md](KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md) määrittää Flintailin identiteetin, muodot ja presentation stackin. Se ei tarkoita, että Inspectissä toimiva talent-puu olisi olemassa.

## 6. Varmennettu vs auki

| Asia | Tila |
| --- | --- |
| Neljä Player Talent -suuntaa | **PALAUTETTU AIEMMASTA SUUNNITTELUSTA** |
| 24 solmua / 14 pistettä, Kaiku 12 solmua / 7 pistettä | **HYVÄKSYTTY AIEMMAN KESKUSTELUN MITOITUS**, tasapainotus testaamatta |
| Classless + respec mahdollinen | **KÄYTTÄJÄN HYVÄKSYMÄ PERIAATE** |
| Phantom Trail | **AIEMPI ESIMERKKI**, ei lukittua vaikutusta |
| 1–3 aktiivista, ylimääräiset Guardianiksi | **KÄYTTÄJÄN SUUNTA**, party-UI ja efektit toteuttamatta |
| “10 ylimääräistä Kaikua → Evolution +1–2 tasoa” | **KÄYTTÄJÄN AIEMPI ESIMERKKI**, tarkka sääntö avoin |
| Tarkat talent-sisällöt, prerequisite-grafit, pisteiden earning, level-capit, unlockit, respec-kustannukset | **AVOIN** |
| Talent-puiden UI, persistence, multiplayer-synkronointi, varsinainen gameplay-kytkentä | **EI TOTEUTETTU / ei löydetty main-PWA:n koodista 12.11.2026** |

## 7. Seuraava rajattu toteutussuunnitelma

1. Tee **Player Talent Web -data v0.1** 24 solmulle / 14 pisteelle, neljälle suunnalle, ilman meta-buildia; tarkat efektit erilliseen tarkistettavaan sääntötaulukkoon.
2. Tee **Flintail Kaiku Talent Tree** 12 solmulle / 7 pisteelle; kytke Tracking/Field Sense -identiteettiin, mutta jätä muutkin pelitavat saavutettaviksi.
3. Tee ensin laskennallinen sääntömoottori ja testit (prerequisite, budget, reset, Guardian-vaikutukset), sitten vasta näyttävä mobiili-talent-UI.
4. Tarkista talouden ja pelin tasapaino: ei pakollista fyysistä vierailua, ei rajatonta boost-farmia, ei ylivoimaista buildia.
5. Käyttäjän **hyväksyttävä yksittäiset talent-vaikutukset** ennen kuin niistä tulee lukittu osa peliä.

**Älä alusta tätä järjestelmää uudelleen seuraavassa keskustelussa.** Tämä on aiemman Talent-keskustelun talteenotto, ei uusi satunnainen ideapankki.
