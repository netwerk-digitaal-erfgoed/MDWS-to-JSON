# van MAIS Flexis 'Uitvoer naar MDWS' naar JSON
Dit script (index.js) maakt van een 'Uitvoer naar MDWS'-tekstbestand een JSON bestand.

## Install
```bash
git clone https://github.com/netwerk-digitaal-erfgoed/MDWS-to-JSON
cd MDWS-to-JSON
npm install
```

## Input:
```editor-config
%0(1) = 1001
na(1) = Huis Amerongen
pe(1) = 1405-1979
bj(1) = 1405
ej(1) = 1979
id(1) = 718779
ahd_id(1) = 
Toegangstitel(1) = Inventaris van het archief van het huis Amerongen 1405-1979
Auteur(1) = E.P. de Booy
Datering toegang(1) = 2000
Openbaarheid(1) = De persoonlijke correspondentie van na 1920 (in inv.nrs. 4264-4266, 4300, 4304-4305, 4307, 4309, 4313, 4316, 4318, 4342 en 4349) is niet openbaar tot 2025. Eerdere inzage is slechts mogelijk na toestemming van de inbewaargever
Rechtstitel(1) = Opneming in beheer van een particulier, niet in eigendom verkregen
rt(1) = 2.9 Huizen en Heerlijkheden
Omvang(1) = 362 charters; 4,31 m oude verpakking
GUID(1) = 609C5B99657D4642E0534701000A17FD
bn(1) = T1001 MF-export.01.pdf
CATTWD(1) = Huizen
THTWD(1) = Buitenplaats
oai(1) = APEX
FNC_DTM(1) = 07-08-2019 11:48:19
hsk(1) = 
na(1) = Inleiding
pe(1) = 
bj(1) = 
ej(1) = 
id(1) = 718780
ahd_id(1) = 718779
bn(1) = 
FNC_DTM(1) = 23-12-2010 09:56:20
GUID(1) = 609C5B99657C4642E0534701000A17FD
pgf(1) = 
na(1) = Het huis Amerongen en zijn bewoners
pe(1) = 
...
```

## Output:
```json
[
{
    "recordType": "krt",
    "recordID": 3393,
    "krt": "3393",
    "na": "Afbeelding van de omslag van een prospectus van het eerste spoorwegplan in Nederland, een door W.A. Bake, in 1832, ontworpen spoorweg tussen Amsterdam en Keulen: stoomwagen met wagons en een kaart van het traject.",
    "pe": "",
    "bj": "1832",
    "ej": "1832",
    "id": "41358398",
    "ahd_id": "41687302",
    "vlgnr": "14561",
    "Beschrijving": "Afbeelding van de omslag van een prospectus van het eerste spoorwegplan in Nederland, een door W.A. Bake, in 1832, ontworpen spoorweg tussen Amsterdam en Keulen: stoomwagen met wagons en een kaart van het traject.",
    "Datering vroegst": "01-01-1832",
    "Datering laatst": "31-12-1832",
    "Opmerkingen": "Litt.: Bibl. HUA NS DK 341, S. Boom, Tussen Amsterdam en Antwerpen ligt de weg naar Keulen: een onderzoek naar de aanleg van spoorwegen in Nederland tussen 1830 en 1860.",
    "Catalogusnummer": "3393",
    "Soort negatief": "Digitale reproductie X 106599",
    "Titel": "Spoorweg tusschen Amsterdam en Keulen",
    "Soort beeldmateriaal": "Cartografische documenten",
    "Materiaalsoort": "foto",
    "Schaal": "",
    "Schaal 2": "",
```
