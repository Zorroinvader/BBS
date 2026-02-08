# Remote-DB-Verbindung

## SSH-Tunnel (--db-only-ssh / --app-only-ssh)

Die einfachste Methode für Verbindungen aus anderen Netzwerken:

1. **DB-Rechner**: `node scripts/setup.js --db-only-ssh`
   - Startet PostgreSQL und erstellt SSH-Credentials
   - Versucht automatisch UPnP-Portweiterleitung (Port 22)
   - Erzeugt `podcast-ssh-credentials.json`

2. **Credentials übertragen**: Kopiere die Datei auf den App-Rechner

3. **App-Rechner**: `node scripts/setup.js --app-only-ssh`
   - Gib den Pfad zu `podcast-ssh-credentials.json` an
   - Verbindet via SSH-Tunnel

### Falls die Verbindung nicht funktioniert

- **UPnP fehlgeschlagen**: Viele Router unterstützen UPnP nicht oder es ist deaktiviert. Richte Port 22 am Router manuell auf den DB-Rechner weiter.

- **Tailscale**: Installiere Tailscale auf beiden Rechnern. Nutze die Tailscale-IP des DB-Rechners als `ssh_host` (statt der öffentlichen IP). Kein Port-Forwarding nötig.

- **Firewall**: Stelle sicher, dass der DB-Rechner SSH (Port 22) akzeptiert.
