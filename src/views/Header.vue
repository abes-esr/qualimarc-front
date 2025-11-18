<template>
  <header absolute class="pa-0" fluid padless>
    <nav aria-label="Navigation principale">
      <v-row :align="(mdAndUp) ? 'end' : 'start'"
             :class="(mdAndUp) ? 'pr-4 pb-4 pl-12 bgColorPrimary' : 'pa-2 bgColorPrimary'"
             justify="center" no-gutters>
        <v-col align-self="center" cols="2">
          <a aria-label="Redirige vers la page d'accueil de Qualimarc" @click="$router.push({path: '/'})">
            <img v-if="(mdAndUp)" :src="QMLogo" alt="logo Qualimarc" class="titleBarLogo"/>
            <img v-else :src="QMLogoIconBlue" alt="logo Qualimarc"
                 style="height: 100px;"/>
          </a>
        </v-col>
        <v-col alignSelf="end" class="pb-1" cols="7" md="8" sm="7">
          <v-row class="ma-0 pa-0" role="toolbar">
            <v-spacer cols="0" lg="1" md="1" xl="3"></v-spacer>
            <v-col class="ma-0 pa-0 d-flex justify-center" cols="12" lg="3" md="4" sm="4" xl="2" xs="12">
              <v-btn :class="{titleBarButtonSelected: (route.path === '/') || (route.path === '/resultats') }"
                     aria-label="Redirige vers la page Interface d'analyse de Qualimarc " color="white" tile
                     to="/" value="interfaceVerification"
                     style="width: 100%"
                     variant="text">
                {{ (mdAndUp) ? 'Interface d\'analyse' : 'Analyse' }}
              </v-btn>
            </v-col>
            <v-col class="ma-0 pa-0 d-flex justify-center" cols="12" lg="3" md="4" sm="4" xl="2" xs="12">
              <v-btn :class="{titleBarButtonSelected: route.path === '/regles' }"
                     aria-label="Redirige vers la page Interface des règles de Qualimarc" color="white" tile
                     to="/regles" value="interfaceRegles"
                     style="width: 100%"
                     variant="text">
                {{ (mdAndUp) ? 'Interface des règles' : 'Règles' }}
              </v-btn>
            </v-col>
            <v-col class="ma-0 pa-0 d-flex justify-center" cols="12" lg="3" md="4" sm="4" xl="2" xs="12">
              <v-btn :class="{titleBarButtonSelected: route.path === '/historiques' }"
                     aria-label="Redirige vers la page Historique de Qualimarc" color="white" tile
                     to="/historiques" value="historique"
                     style="width: 100%"
                     variant="text">Historique
              </v-btn>
            </v-col>
            <v-spacer cols="0" lg="2" md="1" xl="3"></v-spacer>
          </v-row>
        </v-col>
        <v-col :align-self="(mdAndUp) ? 'end' : 'center'" :cols="(mdAndUp) ? '2' : '3'">
          <v-row :class="(mdAndUp) ? 'justify-center' : 'justify-center'" :no-gutters="mdAndUp">
            <v-tooltip color="#54576D" dark location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn :depressed="mdAndUp" :size="mdAndUp ? 'small' : 'x-small'"
                       :style="(mdAndUp) ? 'margin-right: 10px' : 'margin-right: 3px'"
                       aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guichet Abes STP"
                       color="white" fab href="https://stp.abes.fr/node/3?origine=sudocpro"
                       icon
                       target="_blank"
                       v-bind="props">
                  <v-img :height="(mdAndUp) ? '34px' : '24px'" :src="chatBubbles" :width="(mdAndUp) ? '34px' : '24px'"
                         alt="Poser une question sur Abes STP"></v-img>
                </v-btn>
              </template>
              <span style="color: white">Ouvre Abes STP dans un nouvel onglet</span>
            </v-tooltip>
            <v-tooltip color="#54576D" dark location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn :depressed="mdAndUp" :size="mdAndUp ? 'small' : 'x-small'"
                       :style="(mdAndUp) ? 'margin-right: 10px' : 'margin-right: 3px'"
                       aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de la documentation de Qualimarc"
                       color="white" fab href="https://documentation.abes.fr/aidequalimarc/index.html"
                       icon
                       target="_blank"
                       v-bind="props">
                  <v-img :height="(mdAndUp) ? '34px' : '24px'" :src="questionMark" :width="(mdAndUp) ? '34px' : '24px'"
                         alt="Consulter le manuel utilisateur QualiMarc"></v-img>
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
import {useRoute} from "vue-router"
import BlocStatuts from "@/components/accueil/BlocStatuts.vue";
import {useDisplay} from 'vuetify'
import QMLogo from '@/assets/QMLogo.svg';
import QMLogoIconBlue from '@/assets/QMLogoIconBlue.svg';
import chatBubbles from '@/assets/chatBubbles.svg';
import questionMark from '@/assets/questionMark.svg';

const {mdAndUp} = useDisplay()

const route = useRoute();
</script>