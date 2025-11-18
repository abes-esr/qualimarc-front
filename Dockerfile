###
# Phase de compilation de l'appli vuejs
FROM cypress/included:15.6.0 AS build-image
WORKDIR /build/
# Mise en cache docker pour le téléchargement
# des dépendances npm (répertoire node_modules/)
COPY ./package*.json /build/
# si on a un node_modules/ local on peut décommenter la ligne suivante pour
# éviter que npm retélécharge toutes les dépendances
#COPY ./node_modules/ /build/node_modules/
RUN npm ci
# Compilation du TS en JS compilé
# en injectant des placeholders dans les variables .env de vuejs
# (cf le fichier docker/vuejs_env_placeholder) pour pouvoir créer des conteneurs
# en dev, test, prod ou en local en passant les valeurs de ce .env
# via des variables d'environement Docker
# si on est en dev, test ou prod ou local.
# Par exemple, cela permet d'injecter l'URL où se trouvent les API (back) différente

#COPY ./.browserslistrc              /build/.browserslistrc
#COPY ./.eslintrc.js                 /build/.eslintrc.js
COPY ./*.js                         /build/
COPY ./*.json                       /build/
COPY ./index.html                   /build/index.html
COPY ./src/                         /build/src/
COPY ./public/                      /build/public/
COPY ./docker/vuejs_env_placeholder /build/.env
# lance les tests cypress dans un RUN unique
# pour lancer en tache de fond le serveur web avec npm
# puis exécuter les tests cyrpress et stopper le processu
# de build docker si jamais un test ne passe pas
#COPY ./cypress/                         /build/cypress/

RUN npm run build
#RUN (npm run serve &) && \
#    sleep 30s && \
#    npx cypress verify && \
#    npx cypress run
RUN npm prune --production



####
## Serveur web (nginx) pour exec l'appli vuejs
FROM nginx:1.20.2 AS front-image
COPY --from=build-image /build/dist/ /usr/share/nginx/html.orig/
COPY ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
