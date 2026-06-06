#!/bin/bash
REPO="$HOME/RankEngine"
LIVE="/opt/rankengine"
LOG="$HOME/rankengine-deploy.log"
cd "$REPO" || exit 1
OLD=$(git rev-parse HEAD)
git pull origin main --quiet
NEW=$(git rev-parse HEAD)
if [ "$OLD" != "$NEW" ]; then
  cp index.html bedankt.html 404.html privacy.html algemene-voorwaarden.html "$LIVE/"
  cp -r css/ js/ "$LIVE/"
  echo "$(date): Deployed $NEW" >> "$LOG"
fi
