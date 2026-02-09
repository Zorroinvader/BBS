# BBS Podcast Platform – Setup-Anleitung

## Admin-Login

Beim ersten Start wird automatisch ein Admin-Benutzer angelegt. **Standard-Zugangsdaten:**

| | |
|---|---|
| **E-Mail** | `admin@bbs2-wob.de` |
| **Passwort** | `admin123` |

→ Anmeldung unter **/admin/** (z. B. `http://localhost:3000/admin/`).  
**Wichtig:** In Produktion Passwort und ggf. E-Mail ändern (über API oder Datenbank).

---

## Modi (SSH optional)

| Modus | Befehl | Beschreibung |
|-------|--------|--------------|
| Entwicklung | `--dev` | SQLite, localhost |
| Produktion | `--prod` | App + DB (Docker) |
| **DB only** | `--db-only` oder `--only-db` | PostgreSQL auf DB-Host (ohne SSH, direkte Verbindung) |
| **App only** | `--app-only` | App verbindet direkt zur Remote-DB (ohne SSH) |
| **App only (SSH)** | `--app-only-ssh` | App verbindet via SSH-Tunnel (optional, für sichere Verbindung) |
| DB + SSH (lokal) | `--db-local` | DB + SSH für gleiches Netzwerk (empfohlen, sichere Verbindung) |
| DB + Reverse-SSH | `--db-only-ssh` | DB + Reverse-SSH via VPS für Remote-Zugang |

## Gleiches Netzwerk (DB und App)

### Option A: Mit SSH-Authentifizierung (empfohlen für Sicherheit)

1. **DB-Rechner**: `node scripts/setup.js --db-local` oder `npm run setup:db-local`
   - Startet PostgreSQL
   - Erzeugt SSH-Schlüssel und `podcast-ssh-credentials.json`
   - SSH-Server (sshd) wird benötigt
2. **Credentials übertragen**: Kopiere `podcast-ssh-credentials.json` auf den App-Rechner  
   - Der Setup zeigt einen SCP-Befehl (vom App-Rechner aus ausführen)
3. **App-Rechner**: `node scripts/setup.js --app-only-ssh` oder `npm run setup:app-only-ssh` – gib den Pfad zur Credentials-Datei an

### Option B: Direkte Verbindung (einfacher, ohne SSH)

1. **DB-Rechner**: `node scripts/setup.js --db-only` oder `npm run setup:db-only`
2. **App-Rechner**: `node scripts/setup.js --app-only` oder `npm run setup:app-only` – gib die lokale IP des DB-Rechners als DB_HOST an.

## Remote-Zugang (Reverse SSH via VPS)

Für Verbindung aus anderen Netzwerken benötigst du einen VPS mit öffentlicher IP.

### 1. Auf dem DB-Rechner

```bash
node scripts/setup.js --db-only-ssh
```

- Startet PostgreSQL
- Fragt nach VPS_HOST und VPS_USER
- Erzeugt SSH-Schlüssel und `podcast-ssh-credentials.json`

### 2. Manuell: Auf dem VPS

Füge den angezeigten öffentlichen Schlüssel zu `~/.ssh/authorized_keys` auf dem VPS hinzu.

### 3. Manuell: Auf dem DB-Rechner

Starte den Reverse-SSH-Tunnel (z.B. im Hintergrund oder als systemd-Service):

```bash
node scripts/reverse-ssh-tunnel.js
```

Oder mit autossh: `autossh -M 0 -o ServerAliveInterval=30 -R 5432:localhost:5432 -i .ssh/podcast_tunnel -N VPS_USER@VPS_HOST`

### 4. Credentials übertragen

Kopiere `podcast-ssh-credentials.json` auf den App-Rechner.  
Der Setup zeigt einen SCP-Befehl (vom App-Rechner aus ausführen), alternativ USB/E-Mail.

### 5. Auf dem App-Rechner

```bash
node scripts/setup.js --app-only-ssh
```

- Gib den Pfad zu `podcast-ssh-credentials.json` an
- Startet SSH-Tunnel zur VPS und App

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Details.
