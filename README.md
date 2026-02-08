# BBS II Wolfsburg – Podcast-Plattform

Interne Podcast-Plattform für die BBS II Wolfsburg. Lehrkräfte können über das Admin-Panel Episoden hochladen; diese erscheinen auf der Website und werden per RSS an Spotify, YouTube und Schulradio verteilt.

## Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/<org>/<repo>.git
cd <repo>

# 2. Setup (Entwicklung)
node scripts/setup.js --dev

# 3. Mit Docker starten
docker compose build
docker compose up
```

Alternativ mit npm: `npm run setup:dev` dann `npm start`

Die Plattform läuft unter http://localhost:3000

- **Webseite**: http://localhost:3000
- **API**: http://localhost:3000/api
- **RSS-Feed**: http://localhost:3000/feed.xml
- **Admin**: http://localhost:3000/admin/

### Standard-Login

- E-Mail: `admin@bbs2-wob.de`
- Passwort: `admin123`

**Wichtig**: Passwort nach der ersten Anmeldung ändern.

## Produktion (Docker, PostgreSQL, öffentliche Domain)

```bash
# .env: DB_PASSWORD, JWT_SECRET, PUBLIC_URL setzen
docker compose -f docker-compose.prod.yml up -d
```

**DB auf anderem Rechner**: Nur App-Container starten, `DATABASE_URL=postgresql://user:pass@db-host:5432/podcasts` setzen.

## API-Verbindungszeichenfolge

Andere Anwendungen können die API wie folgt nutzen:

1. `GET <PUBLIC_URL>/api/health` aufrufen
2. `apiUrl` aus der Antwort verwenden
3. Alle API-Aufrufe mit `{apiUrl}/episodes`, `{apiUrl}/stats` etc. machen

## Entwicklung (ohne Docker)

```bash
npm install
npm run dev
```

## Konfiguration

Siehe `.env.example` für alle Umgebungsvariablen. Wichtig:

- **PUBLIC_URL**: Öffentliche URL (inkl. https für Produktion)
- **DATABASE_URL**: Optional; PostgreSQL für DB auf anderem Host
- **CORS_ORIGIN**: Optional; kommagetrennt für mehrere Origins
- **JWT_SECRET**: Geheimes Schlüsselwort für Authentifizierung

## Projektstruktur

- `src/` – Node.js Backend (Express, SQLite/PostgreSQL)
- `public/` – Öffentliche Website (HTML, CSS, JS)
- `public/admin/` – Admin-Panel für Lehrkräfte
- `uploads/` – Hochgeladene Audio-Dateien
