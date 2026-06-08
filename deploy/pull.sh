#!/bin/bash
# Automatische deploy: git pull + sync naar webroot
set -e

REPO_DIR="/home/pudding/RankEngine"
WEB_DIR="/opt/rankengine"
BRANCH="main"
LOG="/var/log/rankengine-deploy.log"

cd "$REPO_DIR"

# Check of er nieuwe commits zijn
git fetch origin "$BRANCH" --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy gestart ($(git log -1 --format='%h %s' origin/$BRANCH))" >> "$LOG"

git pull origin "$BRANCH" --quiet
sudo cp -r . "$WEB_DIR/"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy klaar" >> "$LOG"
