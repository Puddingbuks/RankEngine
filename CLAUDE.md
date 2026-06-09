# RankEngine — projectinstructies voor Claude

## Git
- Werk altijd op de `main` branch
- Push altijd naar `origin main`
- Nooit werken op feature branches tenzij de gebruiker dat expliciet vraagt

## Deployment
- Server pullt automatisch via cronjob elk uur vanuit `main`
- Handmatig deployen: `cd ~/RankEngine && git pull origin main && sudo cp -r . /opt/rankengine/`

## Stack
- Statische HTML/CSS/JS site, geen framework
- CSS theming via `[data-theme]` op `<html>` element
- Webroot op server: `/opt/rankengine`
- Docker: `rankengine-nginx` + `rankengine-cloudflared`

## Formulier
- n8n webhook: `https://n8n.rankengine.nl/webhook/rankengine-contact`
- Veldnamen: `naam`, `email`, `dienst`, `bericht`

## Contact
- E-mail: `thomas@rankengine.nl`
