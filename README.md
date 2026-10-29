# StudyFlow mit Online-Server und dauerhafter Datenbank

Dieses Projekt enthält deine bisherige StudyFlow-App mit Aufgaben, Fächern, Prioritäten, Fälligkeitsdaten, Filtern, Sortierung, drei Designs, vier Sprachen (DE/EN/FR/TR), Fokus-Timer, Tagesziel, Erfolgen, Wochenübersicht, Notizen sowie JSON-Export/-Import und Daten löschen. Neu: Die App lädt und speichert den gemeinsamen App-Zustand über einen Express-Server in PostgreSQL.

## Wichtig zu wissen

Diese einfache Schulprojekt-Version verwendet **einen gemeinsamen Zugangscode und einen gemeinsamen Datenbestand**. Alle Personen mit Link UND Zugangscode sehen und ändern dieselben Aufgaben/Notizen. Es gibt noch keine individuellen Benutzerkonten. Teile den Zugangscode nicht öffentlich.

## Online stellen (kostenlose Einstiegsoptionen; Verfügbarkeit/Gratis-Limits können sich ändern)

Du brauchst ein GitHub-Konto, ein Render-Konto und eine PostgreSQL-Datenbank, z. B. bei Supabase.

### 1. Datenbank anlegen
1. Erstelle ein Projekt bei Supabase: https://supabase.com/
2. Öffne **Project Settings → Database** und kopiere die Connection String / URI (nicht öffentlich posten).
3. Verwende nach Möglichkeit die Verbindung, die Supabase für Server/Backend empfiehlt. Falls die direkte Verbindung auf deinem Hosting nicht klappt, nutze den Supabase Session Pooler.

### 2. Projekt auf GitHub laden
1. Entpacke `studyflow-server.zip`.
2. Lade den gesamten Ordnerinhalt in ein neues privates GitHub-Repository hoch.
3. Kontrolliere, dass `package.json`, `server.js` und der Ordner `public` im obersten Projektordner liegen.

### 3. Server bei Render veröffentlichen
1. Öffne https://render.com/ und erstelle einen **New Web Service**.
2. Verbinde dein GitHub-Repository.
3. Setze **Runtime** auf Node.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Unter **Environment** füge hinzu:
   - `DATABASE_URL` = die PostgreSQL-Verbindungszeichenfolge aus Supabase
   - `APP_PASSWORD` = ein langes, eigenes Zugangspasswort, das du der Lehrperson nur direkt mitteilst
7. Erstelle den Web Service und warte, bis der Deploy erfolgreich ist.
8. Öffne die Render-URL, z. B. `https://dein-projekt.onrender.com`. Beim ersten Öffnen fragt StudyFlow nach dem Zugangscode.

Der Server erstellt die benötigte Tabelle automatisch. Du musst keine SQL-Befehle manuell ausführen.

## Lokal auf Windows testen

Installiere Node.js LTS von https://nodejs.org/. Öffne dann PowerShell im Projektordner und führe aus:

```powershell
npm install
$env:DATABASE_URL="DEINE_POSTGRESQL_VERBINDUNGSZEICHENFOLGE"
$env:APP_PASSWORD="DEIN_EIGENES_LANGES_PASSWORT"
npm start
```

Öffne `http://localhost:3000`. Auch lokal braucht diese Version eine erreichbare PostgreSQL-Datenbank.

## Test-Checkliste

- [ ] Website-URL öffnen und Zugangscode eingeben
- [ ] Aufgabe erstellen, Seite neu laden und prüfen, ob sie bleibt
- [ ] Website in einem zweiten Browser öffnen und denselben Code eingeben: die Aufgabe sollte sichtbar sein
- [ ] Notiz schreiben und neu laden
- [ ] Export und Import der JSON-Sicherung testen
- [ ] Ungültigen Zugangscode testen

## Sicherheit und Grenzen

- `APP_PASSWORD` und `DATABASE_URL` nur in den geheimen Environment Variables von Render speichern, niemals in `public/index.html` oder in GitHub committen.
- Das ist ein einfacher gemeinsamer Datenraum ohne persönliche Konten. Für eine App mit privaten Daten mehrerer Schüler:innen braucht es richtige Benutzerkonten und Berechtigungen.
- PostgreSQL-Daten bleiben unabhängig vom Browser gespeichert. Prüfe trotzdem die Backup-/Aufbewahrungsoptionen deines Datenbank-Anbieters.
- Ein kostenloser Hosting-Tarif kann den Server nach Inaktivität pausieren; der erste Aufruf kann dann etwas dauern.
