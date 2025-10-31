import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import JsonCSV from 'vue-json-csv'
import VueMatomo from 'vue-matomo'

// Création de l'app
const app = createApp(App)

// Création du store
const pinia = createPinia()
app.use(pinia)

// Router & plugins
app.use(router)
app.use(vuetify)

// utilisation de piwik/matomo uniquement en production
if (import.meta.env.VITE_APP_ROOT_API?.includes('qualimarc.sudoc')) {
  app.use(VueMatomo, {
    host: 'https://piwik.abes.fr/',
    siteId: 35,
    trackerFileName: 'matomo',
    router,
    enableLinkTracking: true,
    requireConsent: false,
    trackInitialView: true,
    disableCookies: false,
    enableHeartBeatTimer: false,
    heartBeatTimerInterval: 15,
    debug: true,
    userId: undefined,
    cookieDomain: undefined,
    domains: undefined,
    preInitActions: []
  })
}

// Composant global
app.component('downloadCsv', JsonCSV)

// Monter l'application
app.mount('#app')
