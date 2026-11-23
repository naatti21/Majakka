# MAJAKKA World v0.7.2 — orgaaniset putket ennallaan, sisäiset serpentiinit pois

**23.11.2026 · toteutettu erillinen mobiili-WebGL-kokeilu.**
**Testaa:** https://naatti21.github.io/Majakka/experiments/node-network-v072/?stage=3&quality=medium
**Vertaa:** [v0.7.1](../node-network-v071/)

## Käyttäjän täsmennys — älä tulkitse väärin jatkossa

> “Putket oli ihan kivan orgaanisia mutta hiukkasten mukana lisäsit sinne sisälle serpentiiniä.”

**HYVÄKSYTTY MUUTOKSEN RAJA:** orgaaninen, epätasapaksu, läpikuultava PUTKI ja sen korkealla kaartuva reitti olivat käyttäjän mielestä hyviä. Eivätkä ne olleet ongelma. Ongelma on v0.7/v0.7.1:n **kaksi ylimääräistä spiraalimaista sisärihmaa**, jotka näkyvät serpentiininauhoina, sekä liian heikosti erottuva virta ja zoomissa katoavat pisteet. **ÄLÄ muuta putken ulkomuotoa tai perusreittiä tämän palautteen perusteella.**

## Toteutettu

- **Koko orgaanisen putken `makeMembraneGeometry` ja `makePath` kopioitiin sellaisinaan v0.7.1:stä.** Patina/kalvopinnan `roughnessMap`, `bumpMap`, värit ja hienoinen epätasaisuus säilyivät.
- **Poistettu:** molemmat putken sisällä kiertyvät ylimääräiset `filaments`-TubeGeometryt ja niitä koskeva LOW/MED/HIGH-piilottelulogiikka. Hillitty keskimmäinen hehkuva sisäydin säilyy.
- **Hiukkasia enemmän:** LOW 12, MED 22, HIGH 34 kpl **per linkki** (kolmessa linkissä 36 / 66 / 102 kpl). Oletus MED.
- **Hiukan kirkkaammat valopisteet:** opasiteetti .92 × verkon aktiivisuus; pehmeä 32×32 radiaalinen sprite, vaaleampi sävysekoitus ja näyttökoko **4 CSS-pikseliä**, eli `PointsMaterial.sizeAttenuation=false`. Tämä korjaa aiemman maailman mittakaavasta johtuvan pienentymisen/katoamisen zoomissa.
- **Kevyt:** edelleen **yksi `THREE.Points`-joukko/linkki**, yksi jaettu tekstuuri, kullekin linkille yksi paikkapuskuri + väripuskuri. Etukäteen välimuistiin tallennettu 257-pisteinen käyrän otos korvaa per-hiukkanen/per-frame tehtävän `curve.getPointAt`-haun. Ei uusia verkkomesh-palloja eikä lisää 3D-geometriaa.
- **Säilyy:** kolme majakkaa Relay/Copper, Grove/Moss, Prism/Porcelain; niiden kolme geosidottua, vain DEMO-karttapisteisiin perustuvaa linkkiä, aktivointi 0–3, mobiilikamerat, vanha MapLibre `clearDepth()`-syvyyskorjaus ja grafiikkatasot.

## Laatukontrolli

- [testit](../../tests/node-network-v072.test.mjs) vertaavat putken geometrian ja polun lähdekoodia **sanasta sanaan** vanhaan v0.7.1:een, varmistavat serpentiinien poistumisen, 12/22/34-pistebudjetit ja zoomista riippumattoman pistekoon.
- Automatisoitu WebGL-kuvatesti [workflow](../../.github/workflows/node-network-v072-visual-smoke.yml) tarkistaa vaihetta 0, MED-verkkoa ja kauempaa zoomattua MED-verkkoa; käyttäjän **fyysinen Android-palaute** ratkaisee visuaalisen hyväksynnän.
- Tämä on edelleen graafinen kokeilu; ei GPS:ää, todellista POI/Node-verkkoa, peittoaluepilveä, pelaajan 150 m vuorovaikutussädettä, palkintomekaniikkaa tai mitattua Android-akku/FPS-kuormaa.

## 23.11.2026 — Android-kuvapalaute: hiukkasten kirkkaus ylös

Käyttäjän kahdessa aidossa Android-kuvakaappauksessa v0.7.2:n putki on mukavan orgaaninen, mutta hiukkaset erottuvat **liian heikosti jopa HIGH-tilassa**. Täsmäkorjaus tehtiin **samaan v0.7.2-linkkiin** (ei muutosta rakennusten tai putken geometrian muotoon eikä hiukkasmääriin):

- Pisteiden ruutukoko 4.0 → **5.5 px**, `sizeAttenuation:false` säilyy, joten kameraetäisyys ei pienennä valopisteitä olemattomiin.
- Värit sekoittuvat enemmän vaaleaan valkoiseen (50 % → **78 %**), yksilöllisen valokirkkauden minimitaso nousee ja alpha kasvaa.
- Kolmelle linkille jo jaetun 32×32 säteittäisen pistetekstuurin kirkas keskialue levenee. Pisteissä on nyt additiivinen valosekoitus ilman yhtään lisämesh-/draw call -kustannusta.
- Edelleen **12/22/34 pistettä per linkki**, sama rauhallinen orgaaninen kalvo, samat kolme linkkiä, ei sisäistä serpentiinirihmaa.
- Muutos on **päätelmä kuvista, ei vielä käyttäjän hyväksymä lopputulos**. WebGL-kuva ja Android-palautteen jälkeen voidaan säätää vain kirkkautta. Kiiltävää jatkuvaa laserviivaa, palloja tai spiraaleja ei pidä palauttaa.
