# MAJAKKA Native v0.5.1 — Map Clarity + Free Camera Trial

**Päivitetty:** 2026-11-09  
**Status:** kehityshaara / testattava. Ei yhdistetä mainiin eikä julkaista lopullisena ilman Android-laaduntarkastusta.  
**Perusta:** branch `feature/native-perspective-world-v05`; Godot 4.7.2 / `native-client`.

## Miksi muutos tehtiin?

9.11.2026 Android-kuvakaappauksen palaute: Tampereen rasterikartta oli liian pikselöitynyt; perspektiivikameran pitäisi liikkua vapaasti. Pelin omiin Node-, Kaiku- ja pelaajahahmoihin käytetään 3D-työtä, ei kaupungin rakennusten manuaaliseen mallintamiseen.

### Varmennettu kuvakarkeuden lähde

V0.5:n `scripts/map_style.gd` otti verkosta/levyltä ladatun **256 × 256 PNG-tiilen** ja pienensi sen **128 × 128**-kokoiseksi ennen väri-indeksointia. Kun tämä tekstuuri laitettiin viistoksi 3D-tasoksi, yksityiskohdat olivat jo hävinneet. Kiinteä 720 × 800 -SubViewport aiheutti lisäksi potentiaalisen skaalauseron erikokoisissa karttapaneeleissa.

### Tehdyt muutokset v0.5.1

- `map_style.gd`: tyylitelty karttatekstuuri säilyttää lähdelaatan 256 × 256 resoluution; lisää mipmapit.
- `perspective_world_canvas.gd`: viistojen tekstuurien bilineaarinen anisotrooppinen mipmap-suodatus (ei pikselimäistä nearest-skaalausta).
- 3D-SubViewportin kokoa sovitetaan todelliseen kartta-alueeseen, GPU-muistille kohtuullinen enimmäiskoko.
- Vapaa kameraympyrä (azimuth), jatkuva pitch (24–84°), optinen pinch-zoomaus rasteri-LOD-vaihdolla, ruudun geometriasta johdettu pan ilman tavallisen 2D-pikselivedon virhettä.
- Kosketus: **yksi sormi siirtää karttaa**; **kaksi sormea: nipistys zoomaa, kierto pyörittää, pystysuuntainen liike kallistaa**. Monikosketus ei tee vahinkotappeja Nodella.
- Desktop-testi: vasen hiiri siirtää, oikea hiiri pyörittää/kallistaa, rulla zoomaa.
- HOME palauttaa demon maantieteelliseen kotisijaintiin ja palauttaa kameran alkukulman. Vanha TILT + toimii myös näppäinoikotienä.
- Kameraan liittyviä geokoordinaatti-, zoom-, kosketus- ja palautustestejä lisätty headless smoke-testiin.

## Rajaukset

- **Tämä ei ole vielä vektorikartta.** OSM Standard PNG:n lähdetekstit ovat edelleen osa tekstuuria, ja yksinkertaisen palettiklassifikaattorin jälki voi olla karkea. Tällä korjataan selvä oma resoluutio-ongelma, ei kaikkia mahdollisia syitä.
- Ei rakennusten 3D-malleja, korkeusdataa, globaalia karttapalvelua, oikeaa GPS-sijaintia, pelaajatiliä tai live-moninpeliä.
- Julkinen OSM Standard -rasterilähde sopii vain tämän pienimuotoiseen yksityiseen prototyyppitestaukseen, ei pelin tuotanto-CDN:ksi. Uudelle lisensoidulle/provisioidulle vektoripohjalle tarvitaan oma ratkaisu.
- Suuremmat 256px-tekstuurit kasvattavat karttatiilien GPU- ja prosessointikuluja (RGBA8-tason muistitarve 4× verrattuna 128px:ään ennen mipmappeja). Mittaa oikealla puhelimella.
- FPS, lämmöt ja sormieleiden tuntuma eivät ole todistettuja pelkällä smoke-testillä.

## Tarkistukset (Gate)

1. Godot 4.7.2 import/parse + `map_style_smoke.gd` ja `perspective_map_smoke.gd` sekä vanhat smoke-testit.
2. CI:n Android debug APK build onnistuu kehityshaaralla.
3. Androidissa: vertaa saman Tampereen alueen v0.5 / v0.5.1 -kuvia samalla zoomilla ja kamerakulmalla.
4. Pyöritä kameraa koko ympyrä, kallista ääriarvoihin, nipistä ja panoroi; varmista, etteivät laatat repeile eikä Kaiku/Node irtoa geosijainnista.
5. Mittaa FPS, tile-load-nykäykset, GPU/muisti ja lämpeneminen toistuvan kartan liikutuksen aikana.
6. Jos maailma on edelleen epäselvä, seuraava ratkaisu on lisensoitu vektori-/paikkatietopohja (tiet, vesistöt, viheralueet ja nimet), **ei** rakennusten käsin mallintaminen. Ensimmäisenä rajattu Tampereen testialue.

## Käyttäjän hyväksyntä

- Suunnittelusuunta **hyväksytty**: hyvä kartta, vapaa kamera ja pelin omat 3D-elementit.
- v0.5.1 toteutuksen tuntuma ja lopputulos **AVOIN / ANDROID QA PUUTTUU**.
- Kaikujen hyväksytyt Flintail-identiteettipäätökset dokumentoitu erilliseen main-haaran `docs/KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md`-tiedostoon; niiden arvo säilyy riippumatta karttarenderöinnistä.
