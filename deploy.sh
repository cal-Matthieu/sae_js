#!/usr/bin/env sh

# Arrêter en cas d'erreur
set -e

# Build
npm run build

# Aller dans le dossier de build
cd dist

# Nettoyer un éventuel ancien .git
rm -rf .git

# Initialiser un repo git dans dist et push sur la branche offline
git init
git checkout -b offline
git add -A
git commit -m 'deploy'

# Push vers la branche offline de ton repo
git push -f git@github.com:cal-Matthieu/sae_js.git offline:offline

cd -
