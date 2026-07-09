# Éles oldal – csak előadókezelő frissítés

## Mit módosít?
- Új `speakers-manager.html` és `speakers-manager.js` az éles oldalhoz.
- A főoldali előadói sáv Supabase `people` / `event_speakers` táblából tölt.
- Az `eloadok.html` oldal is az új előadói rendszerből olvas, ha van adat.
- Ha adatbázis-hiba van, a régi statikus lista marad, tehát a látogatói oldal nem ürül ki.

## Mit NEM módosít?
- Regisztráció
- Beléptetés
- Galéria
- Program
- Támogatás
- Egyéb éles funkciók

## Feltöltendő
- index.html
- homepage.js
- public-content.js
- speakers-manager.html
- speakers-manager.js
- styles.css
