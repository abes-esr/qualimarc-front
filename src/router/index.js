// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Resultat from '@/views/Resultat.vue'
import Accueil from '@/views/Accueil.vue'
import Regles from '@/views/Regles.vue'
import Historique from '@/views/Historique.vue'
import DonneesPersonnelles from '@/views/DonneesPersonnelles.vue'

const routes = [
  {
    path: '/',
    name: "accueil de l'application",
    meta: { title: 'Accueil' },
    component: Accueil,
  },
  {
    path: '/resultats',
    name: 'page de résultats',
    meta: { title: 'Résultats' },
    component: Resultat,
  },
  {
    path: '/regles',
    name: 'page des règles',
    meta: { title: 'Règles' },
    component: Regles,
  },
  {
    path: '/historiques',
    name: 'page des historiques',
    meta: { title: 'Historiques' },
    component: Historique,
  },
  {
    path: '/donnees-personnelles',
    name: 'page des données personnelles',
    meta: { title: 'Données personnelles' },
    component: DonneesPersonnelles,
  },
  // la route "catch-all" change en Vue Router 4 :
  {
    path: '/:pathMatch(.*)*',
    name: 'Redirection accueil',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// (optionnel) mettre à jour le titre de la page à chaque navigation
router.afterEach((to) => {
  document.title = to.meta.title || 'Application'
})

export default router
