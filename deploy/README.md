# RankEngine — Self-hosted deployment

Stack: **Caddy** (reverse proxy + SSL) + **Nginx** (static files) + **N8N** (formulier)

---

## Eerste keer opzetten

### 1. Server voorbereiding (via SSH)

```bash
# Repo klonen
sudo mkdir -p /opt/rankengine
sudo chown $USER:$USER /opt/rankengine
git clone https://github.com/Puddingbuks/RankEngine.git /opt/rankengine

# Stack starten
cd /opt/rankengine/deploy
docker compose up -d
```

### 2. Router / DNS

| Wat | Instelling |
|-----|-----------|
| Port forwarding | TCP 80 en 443 → server IP |
| DNS A-record | `rankengine.nl` → jouw publieke IP |
| DNS A-record | `www.rankengine.nl` → zelfde IP |

> **Dynamisch IP?** Gebruik Cloudflare als DNS-provider met hun DDNS-API, of DuckDNS.

Caddy haalt automatisch een Let's Encrypt-certificaat op zodra DNS klopt.

### 3. N8N workflow importeren

1. Open N8N op `http://<server-ip>:5678`
2. Ga naar **Workflows → Import**
3. Upload `n8n-workflow.json`
4. Configureer de **Email Send** node met jouw SMTP-gegevens
5. Zet de workflow op **Active**

De webhook luistert op: `http://<server-ip>:5678/webhook/rankengine-contact`
Caddy proxiet `/api/contact` daar naartoe.

---

## Auto-deploy via GitHub Actions

### Secrets instellen in GitHub

Ga naar: **repo → Settings → Secrets → Actions**

| Secret | Waarde |
|--------|--------|
| `SSH_HOST` | Publiek IP van de server |
| `SSH_USER` | Gebruikersnaam (bijv. `ubuntu`) |
| `SSH_KEY` | Private SSH key (zie hieronder) |
| `SSH_PORT` | `22` (of je eigen poort) |

### SSH key aanmaken

```bash
# Op de server:
ssh-keygen -t ed25519 -f ~/.ssh/rankengine_deploy -N ""
cat ~/.ssh/rankengine_deploy.pub >> ~/.ssh/authorized_keys

# Kopieer de private key naar GitHub secret:
cat ~/.ssh/rankengine_deploy
```

Na elke push naar `main` deployt GitHub Actions automatisch:
1. `git pull` op de server
2. `nginx -s reload`

---

## Handmatig deployen

```bash
ssh user@server
git -C /opt/rankengine pull
docker exec rankengine-nginx nginx -s reload
```

---

## Containers beheren

```bash
# Status
docker compose -f /opt/rankengine/deploy/docker-compose.yml ps

# Logs Caddy
docker logs rankengine-caddy -f

# Logs Nginx
docker logs rankengine-nginx -f

# Herstarten
docker compose -f /opt/rankengine/deploy/docker-compose.yml restart
```
