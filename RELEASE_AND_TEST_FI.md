# Majakka Native Prototype v0.1 — luovutus ja testaus

## Mitä paketissa on

- `native-client/project.godot`: erillinen Godot 4.7.2 -projekti, Android portrait, Compatibility renderer.
- `native-client/scenes/main.tscn`: pelin lähtökohtaus.
- `native-client/scripts/prismite.gd`: oikea proseduraalinen 3D-Kaiku, animaatio, kaksi Form-materiaalivaihtoehtoa, Guardian-pose, low detail.
- `native-client/scripts/lab.gd`: Androidin kosketusohjaus, UI, FPS + p95-frame time + engine memory -mittaus.
- `native-client/tests/smoke.gd`: Godot headless logic smoke -tarkistus.
- `native-client/export_presets.cfg`: Android ARM64 debug APK -export.
- `.github/workflows/native-kaiku-android.yml`: GitHub Actions APK-build PR:n yhteydessä sekä myöhemmin manuaalisesti.

**Tila:** ensimmäinen toteutus on tehty; sitä **ei vielä ole ajettu Godotilla eikä Android-puhelimella** tässä ympäristössä. Mitään APK:ta ei väitetä valmistuneeksi.

## Polut Githubissa

Tämä paketti on tarkoitettu `naatti21/Majakka`-repositorion **erilliselle kokeilubranšille**, esim. `feature/native-kaiku-lab-v01`. Sijoita projektin tiedostot repon juureen samoille poluille (ei toista `majakka-native-v0.1`-yläkansiota). Nykyiseen `main`-versioon ei saa vahingossa yhdistää keskeneräistä prototyyppiä. GitHub Actionsin manuaalinen `workflow_dispatch` näkyy tavallisesti vasta, kun työnkulku sijaitsee oletushaarassa; kokeilubranšissa voidaan ajaa export paikallisesti tai ottaa workflow myöhemmin erillisellä hyväksytyllä muutoksella käyttöön.

## Androidin käyttötesti (kun APK on saatu)

1. Asenna ainoastaan itse rakennettu testiversio. Vältä käyttäjän muista sovelluksista riippuvia oikeuksia; appissa ei ole sijainti-/internetlupia.
2. Avaa portrait-tilassa. Pyyhkäise vasen/oikea nähdäksesi Prismiten 3D-pyörimisen.
3. Testaa `INK FORM` ↔ `LUMINOUS`, `REACT`, `GUARDIAN` ↔ `COMPANION`, `LOW DETAIL` ↔ `FULL DETAIL`.
4. Tarkastele FPS- ja p95-arvoja alussa sekä noin 10 minuutin jälkeen. Kirjaa puhelinmalli, Android-versio, lämpötila-arvio, vakaa FPS, mahdolliset nykäykset, sovelluksen kaatumiset ja APK:n koko.
5. Testaa palautuminen taustalta. Testaa toisella heikommalla laitteella, jos mahdollista.

**Hyväksymiskriteeri kokeilulle:** 30 FPS tasainen (p95 frame-time mielellään alle 33 ms), kosketus ja napit toimivat, ei kuumenemista tai kaatumisia kymmenessä minuutissa. Tämä ei todista raskaamman GLB-hahmon suorituskykyä.

## Rajaukset

- Ei vielä Talent Tree -pelimekaniikkaa, Kaiku Collectionia, MMO-yhteyttä, Hybrid Species -generointia tai pysyvää savea.
- `INK FORM` on **materiaalikokeilu**, ei kokonainen anime-3D-malli.
- `GUARDIAN` on pelkästään preview, ei julkaistu Node-deployment.
- Rakenne ei käytä mobiilidataa eikä vaadi palvelinlaskua.
- Engine-muisti ei ole puhelimen koko muistinkulutus. FPS ei yksin riitä arvioimaan akkua tai lämpötilaa.

## Suositeltu seuraava askel

Godot-exportin ja kahden laitetestin jälkeen tehdään **yhden oikeasti suunnitellun creature-GLB:n** visuaalinen koe. Sen perusteella päätetään, onko Godot Compatibility hyvä lähtötaso vai tarvitaanko Mobile renderer / korkeampi laatuprofiili. Vasta sen jälkeen lisätään tallennettavat Species/Instance/Form-järjestelmät.
