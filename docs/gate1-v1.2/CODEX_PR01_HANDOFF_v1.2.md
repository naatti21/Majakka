# Codexille | Majakka Gate 1, PR-01 – suora toimeksianto v1.2
**Tila:** rajatun sääntömoottorin toteutus voidaan aloittaa GitHubin feature-haarassa; tuotanto-mainiin ei saa kirjoittaa ilman erillistä hyväksyntää.

## Työ
Työskentele olemassa olevassa GitHub-repositoriossa **`naatti21/Majakka`**. Ensin lue Workin aiemmat v1.1-suunnittelumateriaalit ja **tämän paketin** `MAJAKKA_RULES_SINGLE_SOURCE_v1.2.md`, `balance-candidate.v1.2.json` ja `CONFLICT_DECISIONS_v1.2.md`. Älä tulkitse `MAJAKKA_COMPLETE_DESIGN_v1.1.md`:n vaihtoehtoisia numeroita uudeksi totuudeksi. Kaikki luvut ovat vasta **Gate 1 -testiehdokkaita**, eivät hyväksyttyä tuotantobalanssia.

1. Luo uusi **`feature/majakka-rules-v12`** -kehityshaara nykyisen `main`in HEADistä. Älä luo uutta repoja, älä kirjoita `main`iin äläkä käynnistä tuotantojulkaisua.
2. Luo `game-rules/geo.mjs`: validoi koordinaatit; lyhin etäisyys geodeettisesti; `e(d)` numeerisesta v1.2-configista; ei GPS-/camera-syötettä etäisyyspäätökselle.
3. Luo `game-rules/identity.mjs`: kanoninen järjestysriippumaton linkki- ja field-tunniste, selvä rajaus geometrian ja ID:n välille. Älä johda maailman paikkojen UUID:ta suoraan kamera-/GPS-koordinaateista.
4. Lisää `game-rules/balance-config.json` *sellaisenaan v1.2 candidates* ja merkitse `status=CANDIDATE_FOR_TESTING_NOT_APPROVED`. Älä lisää aktiivista UI-latausta eikä palvelinmutaatioita tässä PR:ssä.
5. Lisää `tests/game-rules-geo.test.mjs` ja `tests/game-rules-identity.test.mjs`: E(d) jatkuvuus ja monotonisuus, 0/5/25/100/1000/2307/6491 km, dateline/napa/virhesyötteet, ID:n vakioisuus kaikilla selaimilla ja reunan suuntaamattomuus. Lisää deterministinen fuzz-seed (vähintään 10 000 paria) ja dokumentoi käyttämäsi tarkkuus/toleranssit.
6. Aja `node --test tests/*.test.mjs` ja `node --check backend/worker.mjs`, raportoi uudet ja vanhat tulokset erikseen. Käytä tarvittaessa todellisia Node-työkaluja; älä merkitse mitään Android-testatuksi.
7. Toimita pieni muutoskatsaus: lista uusista tiedostoista repo-suhteellisine polkuineen, toteutettu sääntö, testiraportti, rollback, riskit ja linkki yhteen tarkistettavaan PR:ään feature-haarasta. Jos PR-työkalu ei ole saatavilla, anna haara ja commit-tunniste. Älä yhdistä PR:ää itse.

## Ei nyt
Älä refaktoroi nykyistä näkyvää karttaa, jätä sen nykyinen `v0.11.5` toimimaan. Älä kytke `shared-world.js` tai Echo-backendiä elävään peliin. Älä generoi uusia nodeja Tampereelle. Älä rakenna vielä NPC:tä, PvP:tä, isoa 3D-animaatiota tai globaalia datatuontia. Tämä PR on **testattava säännöstön perusta**, ei 'valmis peli'.

## Hyväksymisehto
PR-01 hyväksytään vasta, kun geometria, testisyötteet ja sivuvaikutukset ovat läpinäkyviä ja kaikki testit vihreitä. Seuraava PR käsittelee lompakkoa ja ensimmäisten toimintojen sääntöjä; senkin tulee käyttää samaa configia, ei kopioida lukuarvoja.
