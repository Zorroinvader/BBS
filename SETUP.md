# BBS Podcast Platform – Setup-Anleitung

## Modi

| Modus | Befehl | Beschreibung |
|-------|--------|--------------|
| Entwicklung | `--dev` | SQLite, localhost |
| Produktion | `--prod` | App + DB (Docker) |
| Nur DB | `--only-db` | PostgreSQL auf DB-Host |
| Nur App | `--app-only` | App verbindet direkt zur Remote-DB |
| DB + SSH | `--db-only-ssh` | DB + SSH-Credentials für Remote-Zugang |
| App via SSH | `--app-only-ssh` | App verbindet via SSH-Tunnel (funktioniert überall) |

## SSH-Tunnel (App und DB nicht im gleichen Netzwerk)

Für Verbindung über verschiedene Netzwerke hinweg:

### 1. Auf dem DB-Rechner

```bash
node scripts/setup.js --db-only-ssh
```

- Startet PostgreSQL
- Erzeugt SSH-Schlüssel
- Versucht UPnP-Portweiterleitung (Port 22)
- Erstellt `podcast-ssh-credentials.json`

### 2. Credentials übertragen

Kopiere `podcast-ssh-credentials.json` auf den App-Rechner (USB, SCP, etc.).

### 3. Auf dem App-Rechner

```bash
node scripts/setup.js --app-only-ssh
```

- Gib den Pfad zu `podcast-ssh-credentials.json` an
- Startet SSH-Tunnel und App

Falls UPnP fehlschlägt: Nutze Tailscale auf beiden Rechnern und die Tailscale-IP als `ssh_host`, oder richte Port 22 manuell am Router weiter.

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Details.
