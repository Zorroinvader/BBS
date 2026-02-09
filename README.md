## BBS Podcast Platform

Interne Podcast-Plattform für die BBS II Wolfsburg. Mit dieser Anwendung könnt ihr Podcasts hochladen, verwalten und im Browser anhören. Dieses Dokument ist für eure Gruppe gedacht und erklärt Schritt für Schritt, wie ihr das Projekt lokal starten könnt.

---

## 1. Voraussetzungen

### Variante A – mit Docker (empfohlen)

Du brauchst:

- **Docker**
- **Docker Compose**

Prüfen:

```bash
docker --version
docker compose version
```

### Variante B – ohne Docker (Node.js direkt)

Du brauchst:

- **Node.js 20** (oder kompatible Version 18/20)
- **npm**

Prüfen:

```bash
node -v
npm -v
```

---

## 2. Projekt klonen

```bash
git clone <REPO-URL> BBS
cd BBS
```

Falls das Projekt schon vorhanden ist, reicht:

```bash
cd BBS
```

---

## 3. Start mit Docker (empfohlen)

Im Projektordner:

```bash
docker compose up --build
```

Danach im Browser öffnen:

- `http://localhost:3000` – Startseite
- `http://localhost:3000/admin/` – Admin-Bereich

Für den Hintergrundmodus:

```bash
docker compose up -d --build
docker compose logs -f   # Logs ansehen
docker compose down      # stoppen
```

---

## 4. Start ohne Docker (Node.js)

### 4.1 Abhängigkeiten installieren

```bash
npm install
```

### 4.2 Entwicklungsmodus (mit SQLite)

```bash
npm run setup:dev
```

oder

```bash
node scripts/setup.js --dev
```

Danach im Browser:

- `http://localhost:3000`
- `http://localhost:3000/admin/`

Wenn die Datenbank schon eingerichtet ist, reicht später:

```bash
npm start
```

---

## 5. Admin-Login (Standardzugang)

Beim ersten Start wird automatisch ein Admin-Benutzer angelegt:

- **E-Mail**: `admin@bbs2-wob.de`
- **Passwort**: `admin123`
- **URL**: `http://localhost:3000/admin/`

**Wichtig:** Diese Zugangsdaten sind nur für lokale Tests. In einer echten Produktionsumgebung Passwort (und ggf. E‑Mail) ändern.

---

## 6. Wichtige Ordner

- `public/` – HTML, CSS, JS für die Oberfläche
- `uploads/` – hochgeladene Audiodateien
- `data/` – lokale SQLite-Datenbank (Dev)
- `src/` – Node.js-Server (API, Routen, Services)
- `scripts/setup.js` – Setup-Script für verschiedene Modi

---

## 7. Kurze Zusammenfassung

- **Empfohlen:** `docker compose up --build`
- **Ohne Docker:** `npm install` und `npm run setup:dev`
- **Zugriff:** `http://localhost:3000` und `http://localhost:3000/admin/`
- **Login:** `admin@bbs2-wob.de` / `admin123`

