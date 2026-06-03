# RankEngine — Self-hosted deployment

Stack: **Cloudflare Tunnel** + **Nginx** (static files + N8N proxy)

Geen open poorten op de router nodig. Cloudflare Tunnel maakt een uitgaande
verbinding naar Cloudflare — SSL wordt automatisch afgehandeld.

---

## Architectuur

```
Bezoeker → rankengine.nl (Cloudflare) → Tunnel → Nginx → statische files
                                                        → /api/contact → N8N:5678
```

---

## Eerste keer opzetten

### 1. Repo klonen op de server

```bash
sudo mkdir -p /opt/rankengine
sudo chown $USER:$USER /opt/rankengine
git clone https://github.com/Puddingbuks/RankEngine.git /opt/rankengine
```

### 2. Tunnel token instellen

```bash
cd /opt/rankengine/deploy
cp .env.example .env
nano .env   # plak je TUNNEL_TOKEN
```

### 3. Stack starten

```bash
docker compose up -d
```

### 4. Cloudflare tunnel configureren

1. Ga naar **Cloudflare → Zero Trust → Networks → Tunnels**
2. Klik op je tunnel → **Configure → Public Hostnames**
3. Voeg toe:

| Subdomain | Domain | Path | Service |
|-----------|--------|------|---------|
| (leeg) | rankengine.nl | | `http://nginx:80` |
| www | rankengine.nl | | `http://nginx:80` |

4. Klik **Save**

De site is nu live op `https://rankengine.nl` met automatisch SSL.

### 5. N8N workflow importeren

1. Open N8N → Workflows → Import
2. Upload `n8n-workflow.json`
3. Configureer de **Email Send** node met je SMTP-gegevens
4. Zet op **Active**

---

## Auto-deploy via GitHub Actions

### Secrets instellen in GitHub

Ga naar: **repo → Settings → Secrets → Actions**

| Secret | Waarde |
|--------|--------|
| `SSH_HOST` | Lokaal IP van de server (`192.168.1.225`) |
| `SSH_USER` | Gebruikersnaam (bijv. `ubuntu`) |
| `SSH_KEY` | Private SSH key (zie hieronder) |

> Gebruik het **lokale** IP — je bent toch al via Cloudflare Tunnel bereikbaar van buiten.

### SSH key aanmaken

```bash
# Op de server:
ssh-keygen -t ed25519 -f ~/.ssh/rankengine_deploy -N ""
cat ~/.ssh/rankengine_deploy.pub >> ~/.ssh/authorized_keys

# Kopieer private key naar GitHub secret:
cat ~/.ssh/rankengine_deploy
```

### Workflow activeren

Maak `.github/workflows/deploy.yml` aan in de repo (via GitHub web UI)
en plak de inhoud van `github-actions-deploy.yml` erin.

Na elke push naar `main` deployt GitHub Actions automatisch via SSH.

---

## Handmatig deployen

```bash
ssh user@192.168.1.225
git -C /opt/rankengine pull
docker exec rankengine-nginx nginx -s reload
```

---

## Containers beheren

```bash
# Status
docker compose -f /opt/rankengine/deploy/docker-compose.yml ps

# Logs tunnel
docker logs rankengine-cloudflared -f

# Logs Nginx
docker logs rankengine-nginx -f

# Herstarten
docker compose -f /opt/rankengine/deploy/docker-compose.yml restart
```
