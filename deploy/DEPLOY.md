# Website deploy — git workflow & cronjob

## Stack

| Onderdeel | Details |
|---|---|
| Webserver | Docker container `rankengine-nginx` (nginx:alpine) |
| Proxy | Docker container `rankengine-cloudflared` (Cloudflare Tunnel) |
| Webroot op server | `/opt/rankengine` |
| Git repo op server | `~/RankEngine` |
| Branch | `main` |

---

## Handmatig deployen

**Vanuit de ontwikkelomgeving — push naar GitHub:**
```bash
git add -A
git commit -m "Omschrijving"
git push origin main
```

**Op de server — pull en sync naar webroot:**
```bash
cd ~/RankEngine && git pull origin main && sudo cp -r . /opt/rankengine/
```

---

## Automatisch deployen via cronjob (elk uur)

Het script `deploy/pull.sh` checkt of er nieuwe commits zijn en deployt alleen als dat zo is.

### Eenmalige setup op de server

**Stap 1 — script uitvoerbaar maken:**
```bash
chmod +x ~/RankEngine/deploy/pull.sh
```

**Stap 2 — sudo rechten zonder wachtwoord voor cp:**
```bash
sudo visudo
```
Voeg onderaan toe:
```
pudding ALL=(ALL) NOPASSWD: /bin/cp -r * /opt/rankengine/
```

**Stap 3 — cronjob instellen (elk uur):**
```bash
crontab -e
```
Voeg toe:
```
0 * * * * /home/pudding/RankEngine/deploy/pull.sh
```

**Stap 4 — log bekijken:**
```bash
tail -f /var/log/rankengine-deploy.log
```

---

## Workflow samengevat

```
Code schrijven / Claude Code sessie
        ↓
git push origin main
        ↓
Cronjob pikt het op (binnen 1 uur)
        ↓
git pull + cp naar /opt/rankengine
        ↓
Nginx serveert direct de nieuwe bestanden
```

> Het script deployt alleen bij nieuwe commits — geen onnodige kopieeracties.
