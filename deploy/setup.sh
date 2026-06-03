#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# RankEngine — eerste keer opzetten op de homelab-server
# Eenmalig uitvoeren via SSH: bash setup.sh
# ─────────────────────────────────────────────────────────────────────
set -e

REPO="https://github.com/Puddingbuks/RankEngine.git"
DEPLOY_DIR="/opt/rankengine"
COMPOSE_DIR="$DEPLOY_DIR/deploy"

echo "==> Repo klonen naar $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo chown "$USER:$USER" "$DEPLOY_DIR"
git clone "$REPO" "$DEPLOY_DIR"

echo "==> Docker stack starten..."
cd "$COMPOSE_DIR"
docker compose up -d

echo ""
echo "Klaar! Controleer de status met:"
echo "  docker compose -f $COMPOSE_DIR/docker-compose.yml ps"
echo ""
echo "Vergeet niet:"
echo "  1. Pas Caddyfile aan als je domein anders is dan rankengine.nl"
echo "  2. Zet poorten 80 en 443 open op je router (port forwarding)"
echo "  3. Wijs rankengine.nl in DNS naar je publieke IP"
echo "  4. Configureer de N8N workflow voor het contactformulier (zie n8n-workflow.json)"
