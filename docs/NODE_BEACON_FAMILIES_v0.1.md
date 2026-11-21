# MAJAKKA — BEACON FAMILIES / kuusi Node-majakkaa v0.1

**21.11.2026 — käyttäjän antamaan luovaan toimeksiantoon tehty art direction.**
**Tila:** AI:n ehdotus yhdistää 6 aiemmin suunniteltua **peliroolia** ja 6 käyttäjän valitsemaa **majakkojen rakennus-/materiaaliperhettä**. Yksikään rooli–materiaali-pari tai lopullinen 3D-design **ei vielä ole käyttäjän hyväksymä kanoni**. Pelikykyjen kuvaukset perustuvat alkuperäiseen [Node Atlas v0.1](NODE-ATLAS-v0.1.md), materiaalit ovat tämän työn taiteellisia valintoja.

## Peruslaki — ei kuutta samaa torniobjektia
- **Kaikki näyttävät majakoilta:** rakennus kohoaa kartan yllä, lyhtyhuone/kruunu näkyy, selkeä valoa lähettävä elementti.
- **Koko arkkitehtuuri saa vaihdella** rakennusmateriaalin mukaan; myös kruunu saa olla aivan oma. “Yksi sylinteri eri tekstuurilla” on hylkäysperuste.
- Pintalaatu syntyy **värin, karheuden, bump/normal-pinnan, kiillon, kosteuden, kulumisen ja materiaalin valovasteen** kautta. Ylimääräinen torus/uloke ei ole pintatekstuuri.
- **Rooli** (Prism, Archive, Grove, Relay, Observer, Commons) ja **materiaalin/esineen perhe** ovat kaksi käsitettä. Nämä kuusi yhdistelmää ovat vertailuun laadittu suositus, eivät koodiin lukittu 1:1-sääntö.
- Jos peliin tulee erillinen laadun/harvinaisuuden asteikko, sen visuaalinen signaali (patina, valo, hienovarainen koristetaso) toteutetaan **Node-roolin ja rakennusmateriaalin päälle**, ei sekoiteta “kupari = harvinainen” -säännöksi.

## Ehdotettu kuuden majakan sarja

### PRISM — Porcelain Beacon
**Pelirooli:** taiteen ja julkisten muraalien Node; taittaa valosäikeitä, avaa taajuus-/väritehtäviä (Node Atlas).
**Rakennus:** kapea, epätasaisen kahdeksankulmainen **valkeaksi lasitettu keramiikkamajakka**. Ei kirkasta läpinäkyvää kristallitolppaa.
**Pinta:** posliinin lämmin valkoinen, hienot halkeamaverkostot, sinilaventeliset lasitejuovat, vaihteleva korkeakiilto; `map + roughness + bump/normal`, mikrosäröt heijastavat.
**Kruunu:** fasetoitu optinen lyhtyhuone, jossa kolmessa lasipinnassa pieni spektrinsiirto. Runko kiinteä. Optinen valo muuttaa sävyä rauhallisesti, ei sateenkaari-fog.
**Tunnus:** sileä vaalea hoikka runko + epäsymmetriset optiset kruunupinnat.
**Väripaletti:** ivory `#E8E2D5`, cobalt `#4F78AD`, lavender `#9878C8`, warm gold `#E7C089`.
**Riski:** kirkas pinta katoaa vaalealla kartalla (nykyinen Dark auttaa); liian steriili -> pieni lämmin säröily.

### ARCHIVE — Stone Beacon
**Pelirooli:** historian/muistomerkkien Node; muisto-fragmentit, mysteerit ja valinnat (Node Atlas).
**Rakennus:** **matalampi ja leveämpi, ladotusta kuluneesta kivestä muurattu majakka**. Kerroksellinen kivitorni, raskas mutta selkeä lanternakatos; majakka ei näytä museotalolta.
**Pinta:** hiekan, harmaan ja kallion väliset vaihtelut, kuluneet laastisaumat, huokoisuus, mineralisoitunut kosteus ja haalea kultainen aikakerros. PBR-roughness korkea, epätasainen bump.
**Kruunu:** pieni vanha pronssikehikkoinen lyhtyhuone, painava kivinen katto ja lämmin sisävalo, kuin säilynyt muisto.
**Tunnus:** järeä kivirakenne + lämmin sisäinen valo.
**Väripaletti:** slate `#6F6867`, granite `#8D8479`, weathered brown `#514B4C`, amber `#FFD092`.
**Riski:** musta massakivi kartalla; ylimmän valon lämmin aksentti on tärkeä.

### GROVE — Moss Beacon
**Pelirooli:** luonto-/puisto-Node; rauhoittaa häiriöitä ja tukee orgaanista juurivalaistusta (Node Atlas).
**Rakennus:** **hieman epäsymmetrinen, ikään kuin vanhan kivisen majakan päälle kasvanut rakenne**. Tyvi leveä, runko kaventuu ja kasvu paksunee paikoin; ei massiivisia oksia kartan yli.
**Pinta:** sammalen tummat ja vaaleat kasvustot, märän luonnonkiven laikkuisuus, pienet kasvusäikeet **pintatekstuurissa**, pintakarheuden ja kiillon vaihtelu.
**Kruunu:** siemenkodan/lehdykän henkeä kantava mutta selvästi lyhtyhuoneellinen suojakupu, pehmeä vihreänvalkea hohde.
**Tunnus:** elänyt sammalkivi + rauhallinen elollinen kruunu.
**Väripaletti:** deep moss `#253F2E`, leaf `#719764`, wet stone `#647468`, soft lime `#BEE6AB`.
**Riski:** liian kasvihahmomainen; majakka-arkkitehtuurin pitää säilyä.

### RELAY — Copper Beacon
**Pelirooli:** reitti-/risteys-Node; valon välitys/haaroitus ja vaihtoehtoiset yhteydet (Node Atlas).
**Rakennus:** hoikka, hieman suippeneva **kuparipeltinen majakka**, jonka pintaan kolme johdatettua saumaa. Ei leveää satunnaista kolmihaaraveistosta.
**Pinta:** punertava/oranssi kupari, vihertävän turkoosi patina saumojen ja sadejälkien alueilla, vanhan metallin kiillotetut kohdat, selvä metallinen valovaste.
**Kruunu:** suunnattu kolmivaloinen lyhtyhuone, jossa kolme yhteyssäikeen luonnollista lähtöaukkoa.
**Tunnus:** patinoitunut lämmin metallitorni + 3 valoa.
**Väripaletti:** aged copper `#AE7458`, verdigris `#3B9A95`, dark copper `#583F3A`, warm gold `#FFD39A`.
**Riski:** liikaa kirkasta turkoosia, jolloin runko taas näyttää hologrammilta.
**Huom:** Relay v0.3 toimii teknisenä majakkasiluettitestinä, mutta **ei vielä toteuta kuparin materiaalintuntua**.

### OBSERVER — Pearl / Mineral Beacon
**Pelirooli:** näköalakohteiden Node; paljastaa heikkoja kaukaisia Kaiku-signaaleja (Node Atlas).
**Rakennus:** korkea ja hoikka, luonnonmineraaleista kerrostunut ja hieman epäsymmetrinen **helmiäismajakka**, joka ei hajoa kristallipalasiksi.
**Pinta:** kerroksellinen helmiäinen, opaalin/kvartsin vaaleanharmaat ja sinivioletit sävyvaihtelut; valokulman muuttuessa iridesenssi ja satiinikiilto.
**Kruunu:** yksi laajempi optinen linssimäinen lyhtyhuone, jossa rauhallinen suuntaava havaitsemisvalo; ei geneeristä tutka-antennia.
**Tunnus:** kapea helmiäinen torni + yksi katsova ylälinssi.
**Väripaletti:** shell `#C7D0DB`, periwinkle `#8AA5B9`, violet `#998ABA`, pale aqua `#AEF6E8`.
**Riski:** liian läpinäkyvä/hologrammimainen tai liian Prismiltä näyttävä — kruunussa YKSI katsesuunta, ei Prismille ominaista taittopintojen moninaisuutta.

### COMMONS — Timber Beacon
**Pelirooli:** kirjastojen/kulttuurikohteiden Node; kollektiiviset muistot ja myöhempi yhteistoiminta (Node Atlas).
**Rakennus:** **neliskulmainen, puuristikkorakenteinen majakka**, jonka ikääntynyt puu on näkyvä rakennusmateriaali eikä ruskea maalipinta. Avoin, neljään suuntaan katsova lyhtypaviljonki.
**Pinta:** puusyyt, oksankohdat, öljytyt/tummuneet osat, liitoskohdat ja luonnollinen lämpö; näkyvissä vain vähän todellisia palkkirakenteita, tekstuuri kantaa pääosan puumaisuudesta.
**Kruunu:** avoin lämmin lyhtyhuone, sisällä muutama valopiste yhdistyy yhdeksi yhteisvaloksi.
**Tunnus:** puun lämmin rakenne + monivaloinen yhteisöllinen kruunu.
**Väripaletti:** honeywood `#92704E`, dark oak `#574533`, worn beige `#BEA27A`, candle `#FFD194`.
**Riski:** muuttuu mökiksi tai hökkeliksi; pystymajakka ja valopää ratkaisevat.

## Tuotantotapa ja rajat

1. Tee **erillinen 3D-materiaalilabra**, ei muutos jo toimivaan v0.5 Node-yhteyteen. Kaikki kuusi vaihdettavina samassa geosidonnaisessa testipisteessä.
2. Mallinna **kuusi omaa rakennusprofiilia ja kruunua**, ei kuutta samaa lathe-mallia eri bitmapilla. Käytä proseduraalista **albedo+roughness+bump/normal**-karttaa, fyysisesti vastaavaa valaistusta ja vain niukkaa lisägeometriaa. Ei ulkopuolisen pelin omaisuusassetin kopiointia.
3. Renderöi samaan MapLibre Dark-readable -karttaan: vertaa zoom 15.5 / 17.1 / 18 ja pitch 0/55/70; katso sekä siluetti että lähelle tarkasteltu materiaalintuntu.
4. **Mobiili:** kerrallaan vain yksi testitorni näkyvissä ja sitä vastaavat karttatekstuurit GPU:ssa; tyhjennä vaihdettu mallimateriaali ja -geometria. Varmista tarvittaessa staattisen posterin fallback.
5. **Hyväksyntä:** käyttäjän palaute ennen kuin näistä kuudesta tulee lopullisia Node-tyypin visuaalisia identiteettejä.

**Käsitteellinen rajaus:** nämä materiaalit eivät määritä laatutasoa/rare-tieria eikä korvaa alkuperäistä Node-roolin toiminnallisuutta. Kuusi peliä varten hyväksyttyä fyysistä sijaintia ei vielä ole. Kaikki geosijainnit ovat DEMOja, kunnes Node Atlas -prosessi hyväksyy oikeat kohteet.
