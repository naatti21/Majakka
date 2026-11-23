# MAJAKKA World v0.7.1 — kevyt orgaaninen hiukkasvirta

**23.11.2026** · Toteutettu 3D-demoksi, käyttäjän Android-hyväksyntä vielä avoin.
**Kokeile:** https://naatti21.github.io/Majakka/experiments/node-network-v071/

## Muutos edelliseen v0.7:ään

Käyttäjä hyväksyi v0.7:n orgaanisen läpikuultavan kalvon mutta pyysi poistamaan **isot liikkuvat pallot**. Tilalle tuli **paljon pieniä rauhallisesti virtaavia valohiukkasia**, ja tärkeänä rajoitteena **kevyt mobiilisuorituskyky**. Oikeaa protonien fysiikkasimulaatiota ei tehdä — ”protonit” kuvaavat nyt graafista energiapölyä.

**Säilyy:** kolme eri PBR-majakkaa (Relay/Copper, Grove/Moss, Prism/Porcelain), organinen läpikuultava kalvo, pintakarheus ja mikrofilamentit, värisiirtymät, kartan 3D, stage 0–3, vaiheittainen herääminen ja LOW/MED/HIGH-ohjaus. Vanha [v0.7](../node-network-v07/) säilyy vertailussa.

**Toteutettu:** Ei enää `SphereGeometry`-valopalloja, omia valosfääri-materiaaleja tai kolme olioita per linkki. Uudessa [organic-strand.js](organic-strand.js) -moduulissa on vain **yksi `THREE.Points` / linkki**, jonka sisällä piirtyy useita pyöreitä valohiukkasia. Sama 32×32 säteittäinen alpha-sprite jaetaan kaikille kolmelle linkille. Pisteiden määrä per linkki:
- LOW **8** → **24 pistettä kolmessa linkissä**.
- MED **14** → **42 pistettä** (oletus).
- HIGH **26** → **78 pistettä**.

Hiukkaset etenevät samaan suuntaan pienillä yksilöllisillä nopeuseroilla, usealla lähekkäisellä sisäisellä sädekaistalla; ne eivät halkaise orgaanista kalvoa. Kaksi väriä sekoitetaan Node-päiden materiaalin mukaan, mutta energiaa ei maalata liian neoniksi. Pienillä värin ja koon kaltaisilla kirkkauseroilla syntyy jatkuvan aineen vaikutelma.

**Suorituskyky:** pisteiden paikat ja värit muuttuvat kahdessa jo varatussa `Float32Array`-puskurissa, ei erillisiä 3D-malleja tai hiukkasfysiikan maailman tiloja. `BufferGeometry.setDrawRange()` vaihtaa LOW/MED/HIGH-määrän ajossa. Piirtokutsuja pisteille on korkeintaan **kolme koko verkostossa**, eikä uutta geometrian/tekstuurin varausta tehdä animaation jokaisella ruudulla. Vanhat linkkikalvon ja kartan testit säilyvät. Shared sprite ja materiaalit vapautetaan kerroksen purussa. `prefers-reduced-motion` pysäyttää hiukkasten sijaintiliikkeen.

**Rajaus:** Ei aitoa Node-verkostopelimekaniikkaa, käyttäjän GPS:ää, pelin resursseja, peittoaluepilveä eikä vielä todistetusti hyvää Androidin FPS-/akku-/lämpötulosta. Peittoalue pilvi edelleen seuraava erillinen tuotevaihe vasta näyttötarkistuksen jälkeen.

## QA

- `tests/node-network-v071.test.mjs` tarkistaa JS-syntaksin, SphereGeometryn poistumisen, 8/14/26-määrät, GPU-puskurien uudelleenkäytön, yhden pistejoukon/linkki, pehmeän spriteshaderin, orgaanisen kuoren ja vanhan MapLibre `clearDepth()`-piirtojärjestyksen.
- `.github/workflows/node-network-v071-visual-smoke.yml` ottaa viisi WebGL-kuvaa sisältäen vaihe 0, vaihe 3 MED, LOW, HIGH ja sivuperspektiivi.
- Käyttäjän puhelimella: katso ensin **MED** zoomissa 17–18 ja vertaa v0.7:ään. Pisteiden pitää näyttää virtaavalta hienolta aineelta, ei ylivalottuneelta hehkusuikalelta, ilotulitukselta eikä suurilta palloilta. Tarkista myös LOW ja HIGH ja kerro mahdollinen nykiminen.

### 23.11.2026 — kuvallisen ensimmäisen testin perusteella tehty korjaus

Chromiumin ensimmäisessä mobiilikuvassa hiukkaset olivat **liian himmeitä** verrattuna kalvoon. Korjattiin vain `PointsMaterial.size` (2.55 → 5.0), hiukkasten läpinäkyvyyttä ja valkoisen värisekoituksen kirkkausaluetta. **Määrät 8/14/26 ja kolmen piirtokutsun rakenne pysyvät samoina.** Lopullinen Android-hyväksyntä ja tämän korjauksen kuvallinen tarkistus ovat erillisiä QA-vaiheita.
