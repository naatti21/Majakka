# MAJAKKA — Kaiku Presentation Architecture v0.1 (palautettu suunnittelu)

**Päiväys:** 2026-11-12
**Tila:** aiemman keskustelun **palautettu arkkitehtuuriehdotus**. Yhteensopiva jo hyväksytyn Flintailin esityssuunnan kanssa. Ei väite valmiista 3D-mallista, loop-animaatiosta tai Inspect-näkymästä.
**Lähde:** käyttäjän 12.11.2026 chatissa palauttama laaja vanhan keskustelun katkelma; [Flintail Visual Pipeline](KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md); [World v0.4 3D](MAJAKKA-WORLD-v0.4-3D-NODES-KAIKU-SPEC.md).

## Perussääntö: yksi Kaiku, eri esitystasot

**Species → Form → Instance → Presentation** säilyy samana. Pelin ei tarvitse pyörittää kaikkien Kaikujen hero-tasoista 3D-olentoa yhtä aikaa. Kaikun identiteetti ei riipu siitä, käytetäänkö kartalla kevyttä spriteä vai Inspectissä erillistä rigattua mallia.

| Konteksti | Suositeltu tapa | Miksi |
| --- | --- | --- |
| World / Map, useimmat Kaikut | 2D/2.5D-animoitu sprite tai halpa representaatio | skaalautuu, siluetti, suunta, tila, lajityyppi, harvinaisuus |
| Active Companion, 1 ensisijainen | kevyt animoitu **aito 3D** jos mobiilitesti sallii | pelaajan lähin kumppani tuntuu elävältä |
| Support / Guardian, muut | pose / kevyt sprite / aura / nameplate | tunnistettava rooli Node-verkon osana, vähän runtime-kuormaa |
| Nearby encounter | tilapäisesti parempi esitys | lähellä oleva tapahtuma voi erottua |
| Inventory / Collection | **premium Animated Kaiku Card**, ennalta tuotettu loop | korkea tarkkuus ilman jatkuvaa live-3D-rasitusta |
| Inspect / Showcase | vain yksi kerrallaan avattava tarkempi **aito 3D-malli**, pyöritys, Form/talent-ennakko | tässä interaktiivisuus on perusteltu |
| Discovery / rare reveal | erillinen lyhyt pre-rendered cinematic/stylized reveal | harvinaisuuden tunne, ei aina aktiivinen |
| Marketing | korkeamman laadun key art/traileri | ei samaa runtime-budjettia |

**Tärkeä ero:** aiemmin käyttäjä halusi **3D-Nodet, 3D-Kaikut, orgaaniset ilmassa leijuvat säikeet ja peittoaluepilven**. Tässä suunnittelussa **Nodet pysyvät 3D:nä**, ja Kaikut ovat oikeaa 3D:tä niissä konteksteissa joissa pelaaja niitä oikeasti katsoo (esim. Companion ja Inspect). **Kaikkia map-Kaikuja ei pidetä samaan aikaan korkealla 3D-laadulla**.

## Kortti: GIF-tyylinen kokemus, ei raskasta GIF-tiedostoa

- Jokaisella Kaikulla on suunniteltu **viimeistelty, tarkka looppaava Animated Card**; Flintailin kortin tavoite **4–6 sekuntia** (yleinen vaihteluväli aiemmassa suunnitelmassa 3–6 s).
- Premium-art, hitaasti liikkuva pose, hengitys/korvat/häntä, vahvistavat resonanssikuviot ja teemaan sopiva VFX, saumaton ensimmäisen/viimeisen ruudun jatko.
- Ensisijaiset tekniset kokeet: **WebM / MP4** -video, sprite sheet/sequence, animoitu materiaali tai still-art + kerros-VFX. Valitse laadun, koon, dekoodauksen ja selaintuen mukaan.
- **Gridissa still-poster oletuksena**. Vain avattu/fokusoitu kortti animoi; keskeytä piilotetut ja `prefers-reduced-motion` -asetus huomioiden. Älä aja 50 hero-videota yhtä aikaa.
- Kortin UI-teksti pysyy terävänä omassa kerroksessa; älä pakkaa kaikkea typografiaa videoon.
- Lähtöarvot hyväksytystä Flintail-kortista: noin 720p ja 1–3 MB/video tai 0.5–1 MB/sprite sheet. **Ei varmistettu lopullinen laatubudjetti**; kortin todellinen terävyys, muisti, lämpö ja sulava loop ratkaistaan fyysisellä Androidilla.

## Production Stack / assettierot

1. **Gameplay Asset:** karttasprite tai matalapolyinen Companion-3D, perusstate-animaatiot.
2. **Collection Asset:** korkealaatuinen loopattu kortti.
3. **Showcase Asset:** tarkempi yksi interaktiivinen Inspect-3D-olio.
4. **Reveal Asset:** erikoishetken lyhyt video-/animaatio.
5. **Marketing Asset:** erillinen korkeamman laadun promo-/key art.
6. **Shared VFX Profile:** aura, hehku, partikkelit, Resonance, Guardian-efekti; käytä yhtenäisiä kykykohtaisia teemoja.

Kaikki assetit eivät ole sama tiedosto. Tärkeintä on **laji- ja Form-identiteetin jatkuvuus** eri esityksissä.

## Hybrid/Form-skaalaus

- Kartalla muodon ero voi olla siluetin lisäke, eri VFX, materiaali tai state.
- Kortilla muunnos voidaan toteuttaa pre-renderöidyillä loopilla tai näyttävällä mutta kevyellä kerrosanimaatiolla.
- Inspectissä tärkeät/harvinaiset hybridit voivat saada tarkemman muokatun 3D-mallin. **Jokaiselle yhdistelmälle ei heti tarvita uniikkia rigattua hero-versiota.**
- Rigejä ei tarvitse tehdä kaikille samalla tavalla: Trailborn voi tarvita luonnollisen kävelysyklin, kelluvat/pyörivät muodot kevyempiä animaatiotekniikoita.
- **Muototaksonomia ei ole vielä lukittu**: aiemmissa Flintailin korteissa Base/Luminous/Ink/Hybrid/Guardian ja Luminous/Ink/Root/Aether/Hybrid eivät täsmää täysin. Eivät muutu uusiksi species- tai talent-luokiksi tällä dokumentilla.
- Vanhan katkelman nimet **Rootbound, Veilkin, Shardform, Bloomform, Prismite, Inkari** ovat luovia esimerkkejä, **ei tällä kertaa varmennettuja hyväksyttyjä virallisia species-/Form-nimiä**. Ne säilytetään ehdokastermeinä, ei lukita tuotannoksi.

## Ensimmäinen end-to-end-testi

**Flintail** on paras ensimmäinen benchmark, koska siitä on jo hyväksyttyä identiteettireferenssiä ja se testaa vaativampaa liikkumista.

1. Tarkista Art Masterin tunnusmerkit (katkonainen V-korvatupsu, kaksihaarainen valohäntä, oikean etujalan epäsymmetrinen puolikuumerkki).
2. Kevyt map-sprite tai low-poly 3D; Android-kartalle yksi aktiivinen Companion.
3. Oikea **4–6 s saumaton Animated Card**, still-poster mukana.
4. Vasta kun nämä toimivat, yksi Inspectin korkeampi 3D-versio ja harvinainen Reveal.
5. Mittaa lataus, fps, muisti, akkukulutus, loopin sauma, visuaalinen eheys ja 3D-karttasidonta.

**Toteutustila 12.11.2026:** MapLibren 3D-Node-renderöinti on käyttäjän puhelimella teknisesti hyväksytty. Tämä EI tarkoita että Flintailin valmis 3D-gameplay-asset, animoitu kortti tai Inspect olisi jo tuotettu.

## Linkki Talent-järjestelmään

Kokoelmakortin ja Inspectin on voitava **esittää** Kaikun talentit, mutta esityskerros ei itsessään määritä talent-pisteitä tai tasapainotusta. Palautettu pelaajan ja Kaikun talent-suunnitelma: [MAJAKKA_TALENT_ARCHITECTURE_RECOVERY_v0.1.md](MAJAKKA_TALENT_ARCHITECTURE_RECOVERY_v0.1.md).

**Laatuportti:** yksi näyttävä Flintail-kortti ja yksi mobiilikartan aktiivinen Kaiku; ei satunnaista uusia spesieseitä tai koko maailman live-3D-olioita ennen tätä.


## Päätösdelta 2026-11-15 — käyttäjän 3 vertailukuvaa: elävä kartta, staattinen grid, ympäristöön sidottu Kaiku-esittely

**LÄHDE:** käyttäjän toimittamat kolme Jurassic World Alive -pelin mobiilikuvakaappausta ja hänen oma palautteensa. Kuvakaappaukset toimivat **UX- ja tuotantoarkkitehtuurin inspiraationa, eivät kopioitavina grafiikka-, hahmo- tai UI-assetteina**. Kuvien varsinaisia bittitiedostoja **ei ole siirretty GitHub-repoon**; kirjalliset havainnot on talletettu tähän.

**Kuvakohtaiset havainnot:**
1. **Kartta:** useita toisistaan selvästi erottuvia olentoja liikkuu karttamaailmassa. Pelaajan näkökulmasta hengitys, pieni liike, katseen muutos ja joidenkin hahmojen lyhyt paikallinen patrol tuovat elävyyttä; pelkkä hohtava kiinteä ikoni ei riitä. Kartan HUD ja elementtien tiheys **eivät ole Majakalle kopiointimalli**.
2. **Collection grid:** tarkat, terävät, hyvin erotettavat **staattiset korttikuvat** toimivat isossakin kokoelmassa. Korttia napauttamalla siirrytään yhden Kaikun tarkkaan animoituun esitykseen. Tämä on aiemman “kaikki kortit looppaavat” -vaatimuksen **käyttötilanteen tarkennus**, ei korttianimaatioista luopuminen.
3. **Detail / character stage:** yksi huomattavasti suurempi, elävä, animoitu hahmo. Käyttäjä **ei halua Majakkaan geneeristä laboratoriota**. Jokainen Kaiku avataan sen luonteeseen sopivassa pienessä maailmassa: metsä, tuuli, sammal, kalliot, resonanssi tai muu lajille hyväksyttävä teema. Myös pienessä korttikuvassa näkyvät taustan värit/motiivit jatkuvat samaan detail-ympäristöön.

**UUSI SUOSITELTU ESITYSJÄRJESTYS:**
- **World Map:** pieni tunnistettava animoitu Kaiku, idle/hengitys/huomio/pienet asentomuutokset; osalle lyhyt paikallinen partiointi. Kaukaiset hahmot sprite-/2.5D-versioina, aktiivinen Companion voi olla kevyt aito 3D. Animaatio pysähtyy tai harvenee näkymän ulkopuolella; useita täysiä 3D-malleja ei ajeta samanaikaisesti.
- **Collection grid:** laadukkaat, **lähtökohtaisesti staattiset** kortit. Yksittäinen korostus/hover voidaan tarvittaessa animioida kevyesti, mutta grid ei ole videoseinä.
- **Focused card / detail stage:** yksi Kaiku esitetään suuressa koossa **4–6 s saumattomalla loopilla**, laadukkaana, sen oman maailman tunnelmassa; kortin ja avautuvan ympäristön visuaalinen jatkuvuus. Esitys voi olla esirenderöity video/sprite-animaatio, ja erillinen napautettava **Inspect** voi tarjota aidosti kierrettävän 3D-mallin myöhemmin.
- **Reveal:** erillinen näyttävä harvinaisempi animaatio, ei toistuva raskas ruudukkotekniikka.
- **Flintail-vertailu:** sen hyväksyttyjä Art Master -tuntomerkkejä ei muuteta. Sen luontoon sopivasta ympäristöstä päätetään ulkomuodon mukaan; älä vahvista uusia lore-yksityiskohtia pelkän tämän vertailun perusteella.

**Tekninen periaate:** “Animated Card” on **assetin nimi / valmius**, ei vaatimus että jokainen kokoelman pikkukortti toistaa videota. Usean kortin grid = still-juliste; valitun Kaikun stage = looppaava animaatio. Videoformaatti ei ole vanha GIF; käytä tarvittaessa WebM/MP4 + poster tai optimoitua spritesheetiä. Tarkka toteutustapa testataan Androidilla.

**Laatuportti:** yksi hyväksytty Flintail-kortti staattisena Collection-ruudussa + sama hahmo animoinnissa omaan ympäristöön sijoitettuna, ilman identiteettidriftiä. Erillinen 3D Inspect vasta kun tämä toimii. Patrolloiva karttahahmo ei saa väittää fiktiivistä sijaintia turvalliseksi fyysiseksi vierailukohteeksi.

**TILA:** käyttäjän hyväksymä inspiraatio/suunnittelusuunta; toimivat Majakka-kortit, luontoympäristöanimaatio ja patrol **EIVÄT OLE TOTEUTETTUJA**.
