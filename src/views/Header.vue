<template>
  <header absolute padless class="pa-0" fluid>
    <nav aria-label="Navigation principale">
     <v-row :class="(mdAndUp) ? 'pr-4 pb-4 pl-12 bgColorPrimary' : 'pa-2 bgColorPrimary'" justify="center" :align="(mdAndUp) ? 'end' : 'start'" no-gutters>
       <v-col cols="2" :style="(mdAndUp) ? null : 'margin-bottom: -10px'">
         <a @click="$router.push({path: '/'})" aria-label="Redirige vers la page d'accueil de Qualimarc">
           <img v-if="(mdAndUp)" :src="QMLogo" class="titleBarLogo" alt="logo Qualimarc"/>
           <img v-else :src="QMLogoIconBlue" style="height: 50px; margin-bottom: -9px; margin-top: -8px" alt="logo Qualimarc"/>
         </a>
       </v-col>
       <v-col :cols="(mdAndUp) ? '8' : '7'" :class="(mdAndUp) ? 'pl-8' : null">
         <v-row class="ma-0 pa-0" justify="center" role="toolbar">
           <v-btn text tile color="white" value="interfaceVerification" :class="{titleBarButtonSelected: (route.path === '/') || (route.path === '/resultats') }" to="/" aria-label="Redirige vers la page Interface d'analyse de Qualimarc ">{{ (mdAndUp) ? 'Interface d\'analyse' : 'Analyse' }}</v-btn>
           <v-btn text tile color="white" value="interfaceRegles" :class="{titleBarButtonSelected: route.path === '/regles' }" to="/regles" aria-label="Redirige vers la page Interface des règles de Qualimarc"> {{(mdAndUp) ? 'Interface des règles' : 'Règles' }}</v-btn>
           <v-btn text tile color="white" value="historique" :class="{titleBarButtonSelected: route.path === '/historiques' }" to="/historiques" aria-label="Redirige vers la page Historique de Qualimarc">Historique</v-btn>
         </v-row>
       </v-col>
       <v-col :cols="(mdAndUp) ? '2' : '3'">
         <v-row :class="(mdAndUp) ? 'justify-center' : 'ma-0 pa-0 justify-end'" :no-gutters="mdAndUp">
           <v-tooltip bottom color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <v-btn v-bind="props" icon :style="(mdAndUp) ? 'margin-right: 10px' : 'margin-right: 3px'" fab :size="mdAndUp ? 'small' : 'x-small'"  :depressed="mdAndUp" color="white" href="https://stp.abes.fr/node/3?origine=sudocpro" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guichet Abes STP" target="_blank">
                 <v-img :src="chatBubbles" :height="(mdAndUp) ? '34px' : '24px'" :width="(mdAndUp) ? '34px' : '24px'" alt="Poser une question sur Abes STP"></v-img>
               </v-btn>
             </template>
             <span style="color: white">Ouvre Abes STP dans un nouvel onglet</span>
           </v-tooltip>
           <v-tooltip bottom color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <v-btn v-bind="props" icon :style="(mdAndUp) ? 'margin-right: 10px' : 'margin-right: 3px'" fab :size="mdAndUp ? 'small' : 'x-small'" :depressed="mdAndUp" color="white" href="https://documentation.abes.fr/aidequalimarc/index.html" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de la documentation de Qualimarc" target="_blank">
                 <v-img :src="questionMark" :height="(mdAndUp) ? '34px' : '24px'" :width="(mdAndUp) ? '34px' : '24px'" alt="Consulter le manuel utilisateur QualiMarc"></v-img>
               </v-btn>
             </template>
             <span style="color: white">Ouvre le manuel utilisateur dans un nouvel onglet</span>
           </v-tooltip>
           <bloc-statuts/>
         </v-row>
       </v-col>
      </v-row>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from "vue-router"
import BlocStatuts from "@/components/accueil/BlocStatuts.vue";
import { useDisplay } from 'vuetify'
import QMLogo from '@/assets/QMLogo.svg';
import QMLogoIconBlue from '@/assets/QMLogoIconBlue.svg';
import chatBubbles from '@/assets/chatBubbles.svg';
import questionMark from '@/assets/questionMark.svg';

const { mdAndUp } = useDisplay()

const route = useRoute();
</script>
