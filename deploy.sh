#!/usr/bin/env sh

# Arrêter en cas d'erreur
set -e

# Build
npm run build

# Aller dans le dossier de build
cd dist

# Initialiser un repo git dans dist et push sur la branche gh-pages
git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'

# Push vers la branche gh-pages de ton repo
# Adapter l'URL à ton repo GitHub :
git push -f git@github.com:TON-USERNAME/sae_js.git gh-pages:gh-pages

cd -
