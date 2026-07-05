# Előadókezelő PRO 3 – Tested Edition

## Újítások
- Drag & Drop fő kép feltöltés
- 3 db Drag & Drop galériakép
- Automatikus kliensoldali képtömörítés
- Galériaképből fő kép egy kattintással
- Képek törlése az adatlapról
- Képszámláló
- Élő előnézetben mini galéria

## Feltöltendő
- speakers-manager.html
- speakers-manager.js
- styles.css

## SQL
Kell egy kis adatbázis-módosítás:
ALTER TABLE people ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;
