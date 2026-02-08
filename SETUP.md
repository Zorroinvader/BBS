# BBS Podcast Platform – Setup-Anleitung

Schritt-für-Schritt-Anleitung zum Einrichten der Podcast-Plattform nach dem Klonen aus dem GitHub-Repository.

---

## Voraussetzungen

- **Node.js** 18+ (für lokale Entwicklung)
- **Docker** und **Docker Compose** (für Container-Deployment)
- **Git**

---

## Schritt 1: Repository klonen

```bash
git clone https://github.com/<dein-org>/<repo-name>.git
cd <repo-name>
```

---

## Schritt 2: Setup-Skript ausführen

### Entwicklung (localhost, SQLite)

Für lokale Entwicklung oder Demo auf deinem Rechner:

```bash
node scripts/setup.js --dev
```

Das Skript:
- Erstellt automatisch eine `.env` mit localhost-Einstellungen
- Installiert Abhängigkeiten (`npm install`)
- Startet die Plattform nicht automatisch (du startest mit `npm start` oder `docker compose up`)

### Produktion (öffentliche Domain, PostgreSQL)

Für den Einsatz mit öffentlicher Domain und PostgreSQL:

```bash
node scripts/setup.js --prod
```

Das Skript fragt interaktiv nach den Werten. Du kannst sie direkt einfügen und mit Enter bestätigen:

| Variable | Beispiel | Beschreibung |
|----------|----------|--------------|
| PUBLIC_URL | `https://podcast.bbs2-wob.de` | Öffentliche URL der Plattform |
| DB_PASSWORD | `mein-sicheres-passwort` | Passwort für PostgreSQL |
| JWT_SECRET | `langer-zufallsstring-32-zeichen` | Geheimer Schlüssel für JWT |
| CORS_ORIGIN | (leer) | Optional; zusätzliche erlaubte Domains |

Die Werte werden in `.env` gespeichert. Du kannst sie später in der `.env`-Datei anpassen.

---

## Schritt 3: Plattform starten

### Mit Docker (empfohlen)

**Entwicklung (SQLite):**
```bash
docker compose build
docker compose up -d
```

**Produktion (PostgreSQL):**
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Ohne Docker (nur für Entwicklung)

```bash
npm install
npm start
```

---

## Schritt 4: Erster Login

- **URL**: http://localhost:3000 (bzw. deine PUBLIC_URL)
- **Admin**: http://localhost:3000/admin/
- **E-Mail**: `admin@bbs2-wob.de`
- **Passwort**: `admin123`

**Wichtig**: Passwort nach dem ersten Login ändern (über Benutzerverwaltung, sobald vorhanden).

---

## Übersicht der Modi

| Modus | Befehl | Datenbank | URL |
|-------|--------|-----------|-----|
| Entwicklung | `--dev` | SQLite (lokal) | localhost:3000 |
| Produktion | `--prod` | PostgreSQL (Docker) | Deine Domain |

---

## Troubleshooting

### Port 3000 bereits belegt
- Anderen Port setzen: `PORT=3001 node scripts/setup.js --dev`
- Oder anderen Prozess beenden, der Port 3000 nutzt

### Docker nicht gefunden
- Docker Desktop installieren und starten
- Prüfen mit: `docker --version`

### Produktion: Datenbank verbindet nicht
- Bei DB auf anderem Rechner: `DATABASE_URL` in `.env` prüfen
- Firewall: Port 5432 (PostgreSQL) vom App-Server zum DB-Server freigeben
