# Remote-DB-Verbindung

## Gleiches Netzwerk

- **DB-Rechner**: `node scripts/setup.js --only-db`
- **App-Rechner**: `node scripts/setup.js --app-only` mit DB_HOST = lokale IP des DB-Rechners

## Remote-Zugang (Reverse SSH via VPS)

Für Verbindungen aus anderen Netzwerken nutzt das Setup einen **Reverse-SSH-Tunnel** über einen VPS. Kein Port-Forwarding oder Tailscale erforderlich.

1. **DB-Rechner**: `node scripts/setup.js --db-only-ssh`
   - Startet PostgreSQL
   - Fragt nach VPS_HOST und VPS_USER
   - Erzeugt `podcast-ssh-credentials.json`

2. **VPS**: Füge den angezeigten öffentlichen SSH-Schlüssel zu `~/.ssh/authorized_keys` hinzu.

3. **DB-Rechner**: Starte den Reverse-Tunnel:
   - `node scripts/reverse-ssh-tunnel.js`
   - Oder systemd: siehe `scripts/podcast-reverse-ssh.service.example`

4. **Credentials übertragen**: Kopiere `podcast-ssh-credentials.json` auf den App-Rechner

5. **App-Rechner**: `node scripts/setup.js --app-only-ssh` – gib den Pfad zur Credentials-Datei an

### Reverse-Tunnel als systemd-Service

```bash
# Beispiel anpassen und kopieren
sudo cp scripts/podcast-reverse-ssh.service.example /etc/systemd/system/podcast-reverse-ssh.service
sudo nano /etc/systemd/system/podcast-reverse-ssh.service  # User und Pfade anpassen
sudo systemctl daemon-reload
sudo systemctl enable podcast-reverse-ssh
sudo systemctl start podcast-reverse-ssh
```
