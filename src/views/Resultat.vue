<template>
  <v-container fluid>
    <KeyboardNavigation
        v-model:currentPpn="currentPpn"
        :items-sorted-and-filtered="itemsSortedAndFiltered"
    />
    <ProgressBar v-model:isLoading="isProgressLoading" @cancel="stopAnalyse"
                 @finished="updateNbLancement"></ProgressBar>
    <div class="ma-0 pa-0 mb-2" style="color: #595959; font-size: 0.9em">
      <nav aria-label="fil d'Ariane" class="filAriane">
        <ul>
          <li>
            <span class="v-slider__thumb" @click="$router.push({path: '/'})">Accueil</span>
          </li>
          <li>
            <span class="v-slider__thumb" @click="$router.push({path: '/'})">Interface d'analyse</span>
          </li>
          <li>
            <div aria-current="page">Résultats de l'analyse</div>
          </li>
        </ul>
      </nav>
    </div>
    <v-row cols="12">
      <v-col
          class="d-flex pl-2 pa-0"
          cols="12"
          xs="12"
          sm="12"
          md="12"
          :lg="isMobileForced ? 3 : 4"
          :xl="isMobileForced ? 2 : 4">
        <BlocAffichageResume
            class="pr-2"
            v-model:currentPpn="currentPpn"
            v-model:itemsSortedAndFiltered="itemsSortedAndFiltered"
            :is-mobile-forced="isMobileForced"
            :mobileBreakpoint="mobileBreakpoint"
            :nbLancement="nbLancement">
        </BlocAffichageResume>
        <div class="d-none d-lg-flex flex-lg-column">
          <v-btn color="#b2b2b2" icon size="x-small" variant="flat" @click="resizeBloc">
            <v-icon color="white" size="x-large"> {{
                isMobileForced ? 'mdi-chevron-right' : 'mdi-chevron-left'
              }}
            </v-icon>
          </v-btn>
          <v-divider
              class="align-self-center"
              style="background-color: #b2b2b2"
              thickness="2"
              vertical
          ></v-divider>
        </div>
      </v-col>
      <v-col
          class="px-2 pl-lg-2 pa-0"
          cols="12"
          md="12"
          :lg="isMobileForced ? 9 : 8"
          :xl="isMobileForced ? 10 : 8"
      >
        <BlocDetailPpn
            v-model:currentPpn="currentPpn"
            :itemsSortedAndFiltered="itemsSortedAndFiltered"
            class="ma-0 pa-0 mb-2"
        ></BlocDetailPpn>
        <div class="ma-0 pa-0 d-flex justify-end" style="position: relative;">
          <v-tooltip location="start">
            <template v-slot:activator="{ props }" class="ma-0 pa-0 ">
              <DownloadCsv
                  :data="itemsToExport()"
                  :disabled="itemsToExport().length === 0"
                  delimiter=";"
                  name="qualimarc-export.csv"
                  v-bind="props">
                <span style="color: white">
                  TÉLÉCHARGER TOUS
                  <span style="display: block"></span>
                  LES RESULTATS
                </span>
                <v-icon class="ml-2" color="white">mdi-download</v-icon>
              </DownloadCsv>
            </template>
            <span>Télécharger le détail des erreurs trouvées dans tous les ppn de l’analyse en cours</span>
          </v-tooltip>
        </div>
        <BlocRecapitulatif v-if="resultatStore.getRecapitulatif.length !== 0"
                            class="ma-0 pa-0 mt-16 mb-4"></BlocRecapitulatif>
        <v-card
            class="float-right ma-0 pa-0"
            variant="flat"
        >
          <BoutonLancement
              class="ma-0 pa-0"
              is-replay
              @finished="maskAndStopProgress"
              @started="displayAndStartProgress"
          >
            Relancer l'analyse
          </BoutonLancement>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import BlocRecapitulatif from "@/components/resultats/BlocRecapitulatif.vue";
import BlocAffichageResume from "@/components/resultats/BlocAffichageResume.vue";
import BoutonLancement from "@/components/BoutonLancement.vue";
import BlocDetailPpn from "@/components/resultats/BlocDetailPpn.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import DownloadCsv from "@/components/DownloadCsv.vue";

import {onBeforeMount, ref} from "vue";
import {useResultatStore} from "@/stores/resultat";
import KeyboardNavigation from "@/components/resultats/KeyboardNavigation.vue";
import {useRouter} from 'vue-router'

const router = useRouter()
const resultatStore = useResultatStore();

const currentPpn = ref('');
const itemsSortedAndFiltered = ref([]);

const nbLancement = ref(0);
const mobileBreakpoint = ref(200);
const isProgressLoading = ref(false);
const isMobileForced = ref(false);


onBeforeMount(() => {
  if (resultatStore.getRecapitulatif.length === 0) {
    router.push({name: 'Redirection accueil'});
  }
});

function itemsToExport() {
  let itemsToExport = [];
  resultatStore.getResultsList.forEach(result => {
    if (result.detailerreurs) {
      result.detailerreurs.forEach(messageErreur => {
        let zoneunm2 = (messageErreur.zones[1]) ? messageErreur.zones[1] : "";
        let autresZones = "";
        for (let i = 2; i < messageErreur.zones.length; i++) {
          autresZones += messageErreur.zones[i]
          if (i !== (messageErreur.zones.length - 1)) autresZones += " | ";
        }
        let priority;
        if (messageErreur.priority === "P1") {
          priority = "Règle essentielle"
        } else if (messageErreur.priority === "P2") {
          priority = "Règle avancée"
        }
        itemsToExport.push({
          'ppn': result.ppn,
          'type de document': result.typeDocument,
          'zone/sous-zone 1': messageErreur.zones[0],
          'zone/sous-zone 2': zoneunm2,
          'autres zones/sous-zones': autresZones,
          'message d\'erreur': messageErreur.message,
          'type d\'erreur': priority,
          'date derniere modification de la notice': result.dateModification,
          'RCR dernier modificateur de la notice': result.rcr
        });
      });
    }
  });
  return itemsToExport;
}

function goToHome() {
  router.push('/');
}

function updateNbLancement() {
  nbLancement.value = resultatStore.getRecapitulatif.length;
}

function displayAndStartProgress() {
  isProgressLoading.value = true;
}

function maskAndStopProgress() {
  isProgressLoading.value = false;
}

function stopAnalyse() {
  isProgressLoading.value = false;
}

function resizeBloc() {
  isMobileForced.value = !isMobileForced.value;
}

</script>

<style scoped>
.v-slider__thumb {
  cursor: pointer;
  height: 42px;
  width: 42px;
}

.button {
  color: white;
}
</style>
