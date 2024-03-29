# qualimarc-front

[![build-test-pubtodockerhub](https://github.com/abes-esr/qualimarc-front/actions/workflows/build-test-pubtodockerhub.yml/badge.svg)](https://github.com/abes-esr/qualimarc-front/actions/workflows/build-test-pubtodockerhub.yml) [![Docker Pulls](https://img.shields.io/docker/pulls/abesesr/qualimarc.svg)](https://hub.docker.com/r/abesesr/qualimarc/)

Qualimarc est l'outil de diagnostic des notices du Sudoc.

![qualimarc](https://user-images.githubusercontent.com/328244/203315079-4cabb49a-58a8-4778-80b5-d789e48fb94d.PNG)

Ce dépôt héberge le code source de l'interface utilisateur de qualimarc (développée en VueJS).  
Cette interface utilisateur fonctionne avec son API développée en Java : https://github.com/abes-esr/qualimarc-api/  
Et l'application qualimarc complète peut être déployée via Docker à l'aide de ce dépôt : https://github.com/abes-esr/qualimarc-docker/


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
