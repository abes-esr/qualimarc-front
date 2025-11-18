#!/bin/bash

# Paramètres par défaut du conteneur
export QUALIMARC_FRONT_API_BASEURL=${QUALIMARC_FRONT_API_BASEURL:='http://localhost:8081/'}


# Remplace les placeholders dans le code généré en prod
# QUALIMARC_PLACEHOLDER_VITE_APP_ROOT_API
# On va remplacer les placeholders depuis les JS originales
echo "-> Remplacement des placeholders venant du .env de vuejs dans la destination /usr/share/nginx/html/"
echo "-> QUALIMARC_FRONT_API_BASEURL=${QUALIMARC_FRONT_API_BASEURL}"
rm -rf /usr/share/nginx/html/
cp -rf /usr/share/nginx/html.orig/ /usr/share/nginx/html/
sed -i \
  "s#QUALIMARC_PLACEHOLDER_VITE_APP_ROOT_API#${QUALIMARC_FRONT_API_BASEURL}#g" \
  /usr/share/nginx/html/assets/*


# execute nginx (cf CMD dans Dockerfile)
exec "$@"
