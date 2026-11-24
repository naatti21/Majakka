# Majakka | Gate 0 → Gate 1 – päätösloki v1.2

**Nämä ovat päätöksiä testiehdokkaan sisäisestä johdonmukaisuudesta, eivät tuotantobalanssin lopullisia hyväksyntöjä.**

Täsmävertailu: `MAJAKKA_RULES_SINGLE_SOURCE_v1.2.md` §4 (C01–C12) on ristiriitaloki. Ainoaksi numeeriseksi testiversioksi valitaan Workin erillinen `04_DISTANCE_NETWORK_FIELDS_INTERFERENCE_RULES.md` ja `balance-config.v1.1.json`. Vaihtoehtoiset numerot säilytetään Workin alkuperäisessä `MAJAKKA_COMPLETE_DESIGN_v1.1.md`:ssä, mutta niitä ei yhdistetä v1.2-malliin.

**Tärkeimmät valinnat:** 8 aloitus-Lumenia (vs 12+6); 6vrk rauhoittuva häiriö (vs 30h); log10-pohjainen 2–6 linkkityö (vs log2/pitkille linkeille paljon kalliimpi); sqrt-päätepisteteho (vs max); 2 aktiivista kenttää (vs 3/retki); 6 relehyppyä (vs 8); 3 yksilöllistä Node-Proofia (vs Route Survey E>=0.25). Nämä ovat **provisional**, eivät ennalta “parhaiksi” osoitettuja.

**Avoimiksi jätetyt riskit:** (a) GPS-vapaan Lumen-keruun käytettävyys; (b) ensimmäisen kolmion odotteluaika; (c) kuuden päivän häiriön mahdollinen psykologinen päivystysvaikutus; (d) etäherätyksen tutkimustehtävien todellinen sisällöllinen laatu; (e) henkilökohtaisen kenttäfokuksen suhde retken rooliin; (f) julkisen palvelimen väärinkäytös- ja samanaikaisuuskestävyys.

**Käytännön sääntö kehittäjälle:** jos testissä tulee ristiriita, älä tee heuristista piilokorjausta tai vaihda konfiguraatiota lennossa. Luo nimenomainen issue/riski ja ehdota versiokorjausta, jossa on vastatesti ja pelaajavaikutus.
