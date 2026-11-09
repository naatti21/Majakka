# MAJAKKA — Kaiku Visual Pipeline v0.1 / Flintail

**Päivitetty:** 2026-11-09  
**Status:** Hyväksytty suunnittelusuunta ja ensimmäinen Flintail-tuotantolinja; EI väite valmiista animaatio- tai 3D-asset-koodista.  
**Lähde:** Käyttäjän 9.11.2026 tässä kehityskeskustelussa vahvistamat aiemmin tehdyt suunnittelukortit:
- “MAJAKKA | Kaiku Visual Pipeline v0.1 – Flintail”
- “MAJAKKA | Kaiku Identity Map v0.1” (kortissa merkintä **HYVÄKSYTTY — Flintail: Ensimmäinen tuotantolinja**).

> **Tärkeä jatkuvuussääntö:** Älä suunnittele Flintailia tai Kaiku-esitysjärjestelmää tyhjältä pöydältä uuden keskustelun alussa. Tarkista tämä dokumentti, alkuperäiset referenssikuvat ja tarvittaessa toteutunut asset-kanta. Älä myöskään päättele kuvakortista, että varsinaiset animaatiot, rigatut 3D-mallit tai pelimoottoritoiminnot olisivat jo olemassa.

## 1. Yksi Kaiku, useita esitystapoja

**Identity Lock:** Yhdellä Kaikulla on yksi pysyvä identiteetti, jota käytetään kartalla, kokoelmassa, tarkastelussa, Guardian-esityksissä ja muotovariaatioissa.

- Identiteettitasot: **Species → Form → Instance → Presentation**.
- Yksi vakaa Species-ID; Flintailin tunnus **FLINTAIL**.
- Jaettu design-perusta: siluetti, mittasuhteet, tunnuskuviot ja lajia erottavat piirteet.
- Sama väripaletti ja keskeiset kuviomotiivit.
- Muoto-/hybridimuutokset säilyttävät hahmon tunnistettavuuden.
- Esitykset johdetaan samasta hyväksytystä Master Art / Game Base -lähteestä. Eri näkymiin ei suunnitella erillisiä, keskenään ristiriitaisia hahmoja.

## 2. Flintail — identiteetti ja hyväksytty hahmosuunta

| Kenttä | Suunnittelukortissa |
| --- | --- |
| Nimi | **Flintail** |
| Alatyyppi | **Trailborn** / Resonance Beast |
| Reso | **II** ensimmäisessä Visual Pipeline -kortissa |
| Pääelementti | **Aera** |
| Harvinaisuus | **Uncommon–Rare** (Identity Map -kortti) |
| Roolit | **Companion, Guardian, Explorer** (Identity Map -kortti) |
| Toimintaprofiili | **Agile, Tracker, Field Sense** (Visual Pipeline -kortti) |
| Luonne | Nopea ja aistiva; turkin hehku reagoi ympäristön Resonanceen; kumppani tutkimiseen ja solmujen vartiointiin |

**Tuntomerkit suunnittelukorteissa:** kultaiset/meripihkaiset tarkkaavaiset silmät; pitkät korvatupsut; virtaavat syaaninsiniset Resonance-kuviot; tuuhea kärjestä hehkuva häntä; hieman hehkuvat vaaleat tassut; siniharmaa vaalea turkki. Tunnistettavuus ei saa kadota pienessä karttakuvassa.

**Aiemmassa hahmosuunnittelussa erikseen määriteltyjä lukitustarkistuksia:** katkonaiset V-muotoiset korvatupsut, kaksihaarainen valohäntä ja epäsymmetrinen puolikuumerkki oikeassa etujalassa. Nämä on tarkistettava hyväksyttyä Art Masteria vasten ennen mallinnusta, koska kaikkia kolmea yksityiskohtaa ei voi luotettavasti vahvistaa näiden kahden pienennetyn koontikortin perusteella. Älä “korjaa” niitä arvauksella.

**Lähdekuvien tila:** Koontikorttien kuvat ovat visuaalisen suunnittelun referenssejä, eivät sellaisenaan valmiita 3D-malleja, animaatiospritejä tai lopullisia pelitiedostoja.

## 3. Esitysmuodot

| Presentation | Tarkoitus | Suunta |
| --- | --- | --- |
| **Map Sprite (2.5D)** | Kaiku maailmanäkymässä | Kevyt, selkeä ja tunnistettava; Idle, Walk, Run, React sekä Encounter/Ping |
| **Inventory / Animated Card** | Laadukas kokoelma- ja palkintoesitys | Noin 3–6 s tai 4–6 s näyttävä loop korttikontekstin mukaan; kevyt ympäristö |
| **Inspect / Detail** | Lähitarkastelu | Kierto, Form-vaihto, kyvyt/talentit, hybridi- ja ympäristönäkymä konseptitasolla |
| **Active Companion** | Pelaajan mukana kulkeva Kaiku | Kevyt jatkuva esitys ja animaatio |
| **Guardian / Node** | Solmuun liittyvä hahmoesitys | Käyttää samaa identiteettiä ja suunnittelulähdettä |
| **Reveal** | Löytö/harvinaisuus-esitys | Erillinen lyhyt näyttävä loop; ei jatkuvasti pyörivä kartta-asset |

**Päätös 9.11.2026:** Käyttäjä on kiinnostunut myös varsinaisista kevyistä, elävistä **3D-Kaikuista ja 3D-pelaajasta sekä 3D-Nodeista**, jos ne toimivat hyvin. Tämä on tutkittava toteutuslinja, **ei** päätös hylätä hyväksyttyä 2.5D + Animated Card -arkkitehtuuria tai rakentaa kaikki Kaikut heti täysinä 3D-hahmoina. Testaa ensin yksi laadukas mallihahmo ja mobiilisuorituskyky. Prioriteetti on pelin **omat hahmot ja Nodet**, ei rakennusten yksilöllinen mallintaminen.

### Karttaesitys: animaatiot suunnittelukortissa

- **Idle** (hengitys/kevyt silmukka).
- **Walk** (viitteellinen 4–6 framea).
- **Run** (viitteellinen 6–8 framea).
- **React** (huomio/havainto).
- **Encounter / Ping** (kohtaamisefekti; 2.5D-kortissa).

Frame-määrät ovat kuvakortin alustavia tuotantotavoitteita, eivät varmennettuja mittauksia.

## 4. Forms / muotoversiot

**Visual Pipeline -kortissa:** Base Form (Trailborn) → Luminous Form (Evolution) → Ink Form (Variant) → Hybrid Form (Shard × Bloom) → Guardian Form (Node).

**Identity Map -kortissa:** Luminous Form (perusmuoto), Ink Form (veil), Root Form (luonnonvoima), Aether Form (ilmava), Hybrid (Aera × Bloom).

**HUOM: kahden hyväksytyn koontikortin termistö ei ole täysin identtinen.** Älä yhdistä ”Base” ja ”Luminous” tai ”Guardian” ja ”Root/Aether” automaattisesti samaan lopulliseen taksonomiaan. Pidä nämä kahtena suunnittelukortissa esiintyvänä näkymänä, kunnes Form-malli ja nimet lukitaan erikseen. Molemmissa säilyy *sama tunnistettava Flintail*.

## 5. Tuotantoputki (suunnitelma)

1. **Concept:** ulkoasu ja identiteetti.
2. **Master Art:** hyväksytty väripaletti ja kuviot; taiteellinen lähde.
3. **Game Base:** kevyt 3D-malli/rig tai 2.5D-pohja esitystapaan sopivasti.
4. **Map Sprite:** animaatiot ja karttakäyttö.
5. **Animated Card:** Inventory/Collection-esitys.
6. **Reveal Loop:** Discovery/Rare-esitys.

Kunkin vaiheen valmistuminen tulee todentaa erikseen. Kuvallinen pipeline-kaavio **ei todista**, että kohdat 3–6 on toteutettu tiedostoiksi.

## 6. Mobiilitavoitteet (kortin viitearvot — validoitava)

| Kohde | Kortin tavoite |
| --- | --- |
| Map Sprite 2.5D | enintään 256 × 256 / animaatio; noin 50–200 KB / form |
| Animated Card | ~4–6 s, 720p; noin 1–3 MB videona **tai** 0.5–1 MB sprite sheetinä |
| Active Companion | kevyt 2.5D-animaatio; enintään ~2–4 MB |
| Maailman FPS | **≥ 60 FPS tavoite**, ei luvattu tulos kaikilla puhelimilla |
| Aktiivinen Kaiku-runtime-muisti | **≤ 10–20 MB** tavoite |

Tekniset arvot ovat kuvakorteista, eivät valmiin buildin profilerituloksia. Testaa erityisesti muistinkulutus, atlas-koko, ylikuormitustilanteet ja näytön tarkkuus oikealla Android-laitteella.

## 7. Maailma ja rajaus — hyväksytty suunta 9.11.2026

- **Laadukas, terävä, visuaalisesti yhtenäinen ja oikeaan maantietoon perustuva kartta.** Nykyinen Tampereen 3D-perspektiivikokeilu on käyttäjäpalautteen mukaan liian pikselöitynyt ja sekava. Diagnosoi ensin lähdedata, tiilikuvien venytys/mipmap/suodatus, todellinen renderöintiresoluutio, yksityiskohtatasot ja tyylisäädöt; syytä ei ole vielä varmennettu.
- **Vapaa kamera:** kierto, kallistus, siirto ja zoom; toimivat mobiilieleet ja järkevät rajat. Ei vain valmiiksi rajattuja tilt-kulmia.
- **Omien pelielementtien laatu etusijalle:** Node, Kaiku ja pelaajahahmo voivat olla animoituja 3D-malleja.
- **Älä mallinna Tampereen taloja käsin.** Rakennusten valmis karttageometria vain, jos se tulee helposti, tehokkaasti ja parantaa kokonaisuutta. Se ei ole pelin pääprioriteetti.
- Pimeä Nocturne-henkinen tyyli voidaan säilyttää, mutta **pimeys ei saa peittää kartan luettavuutta**.
- 2D-karttamahdollisuutta kannattaa säilyttää navigointia ja teknistä fallbackia varten.
- Ensimmäinen laatukoe: **testialue + vapaa kamera + laadukas kartta + yksi Kaiku/Node**; tämän jälkeen vasta hahmolaajennukset ja maailmatehosteet.

## 8. Asset-hallinta ja hyväksyntätilat

**Tällä hetkellä dokumentoitu:** koontikorttien suunnittelupäätökset sekä ensimmäisen Flintail-tuotantolinjan hyväksyntä.  
**Ei tämän dokumentin perusteella varmistettu:** lopulliset yksittäiset PNG-assetit, hyväksytty master-arkisto, lähde-3D, rig, sprite sheet, videot, Godot-tuonti, jatkuvuustestit.

Ehdotettu polkurakenne, kun lähdetiedostot lisätään:
```
assets/kaiku/flintail/reference/    # alkuperäiset hyväksytyt koontikortit
assets/kaiku/flintail/master/       # master art / tunnusmerkkien lukitus
assets/kaiku/flintail/game/         # mallit / rig / sprite-esitykset
assets/kaiku/flintail/cards/        # animaatiokortit ja reveal
```
Polut ovat **ehdotuksia**, eivät vielä olemassa olevia tiedostoja tai päätös vaihtaa nykyistä asset-rakennetta.

**Versionhallinnan sääntö:** Kunkin hyväksytyn hahmopiirteen tai pelimekaniikkapäätöksen jälkeen päivitetään vastaava Markdown sekä lähdeassetit, jos ne ovat saatavilla. Merkitse aina **HYVÄKSYTTY / PROTOTYYPPI / AVOIN / TOTEUTETTU / TESTATTU**; älä sotke statuksia.

## 9. Avoin tarkistettava ennen tuotantoa

- Alkuperäiset kaksi referenssi-PNG:tä tulee vielä viedä repon asset-kansioon, jotta kuvat säilyvät keskusteluista riippumatta.
- Flintailin kolme aiempaa hienoa identiteettipiirrettä tarkistetaan täysikokoisesta hyväksytystä Master Artista.
- Muotoversioiden nimistö sekä Species/Form/Instance-objektimalli täsmennetään ilman ristiriitoja.
- Varmistetaan, mitä Native/Godot-prototyypistä on oikeasti tallessa GitHubissa tai erillisessä paketissa; **PWA-main ei yksin todista Godot-lähdeprojektin tilaa**.
- Yksi kevyt 3D-Kaiku voidaan benchmarkata kartalla hyväksyttyä 2.5D-versiota vasten ennen tuotantolinjan muuttamista.
