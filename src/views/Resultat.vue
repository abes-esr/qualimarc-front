<template>
  <v-container fluid>
    <progress-bar v-model:isLoading="isProgressLoading" @finished="updateNbLancement" @cancel="stopAnalyse"></progress-bar>
    <div class="ma-0 pa-0 mb-2" style="color: #595959; font-size: 0.9em">
      <nav aria-label="fil d'Ariane" class="filAriane">
        <ul>
          <li>
            <span @click="$router.push({path: '/'})" class="v-slider__thumb">Accueil</span>
          </li>
          <li>
            <span @click="$router.push({path: '/'})" class="v-slider__thumb">Interface d'analyse</span>
          </li>
          <li>
            <div aria-current="page">Résultats de l'analyse</div>
          </li>
        </ul>
      </nav>
    </div>
    <v-row cols="12">
      <v-col xs="12" sm="12" md="12" :lg="focusOn[0]" :xl="focusOn[1]" fluid fill-width>
        <!--      Le v-layout est nécessaire pour un bon affichage du tableau sur écran large      -->
        <v-layout child-flex>
          <BlocAffichageResume child-flex @onChangePpn="sendPpnToBlocResultat" @onChangeItems="sendItemsToBlocResultat" :currentPpn="currentPpn" :nbLancement="nbLancement" :mobileBreakpoint="mobileBreakpoint"></BlocAffichageResume>
        </v-layout>
      </v-col>
      <v-col xs="12" sm="12" md="12" lg="" xl="" class="pl-lg-6" fluid fill-width>
        <div class="d-none d-lg-flex" style="height: 70%; width: 2px; position:absolute; margin: 0 0 0 -1.15em; background-color: #E6E6E6">
          <v-btn fab size="x-small" depressed color="#b2b2b2" style="position:absolute; margin: 0 0 0 -1.55em" @click="resizeBloc">
            <v-icon @click="" color="white" large>{{ iconTimeline }}</v-icon>
          </v-btn>
        </div>
        <!--      Le v-layout est nécessaire pour un bon affichage du tableau sur écran large      -->
        <v-layout child-flex>
          <bloc-detail-ppn class="ma-0 pa-0 mb-2" @onChangePpn="sendPpnToBlocResultat" :currentPpn="currentPpn" :currentItems="currentItems" ></bloc-detail-ppn>
        </v-layout>
          <div class="ma-0 pa-0" style="position: relative">
            <v-tooltip left>
              <template v-slot:activator="{ props }" class="ma-0 pa-0 col-auto">
                <v-btn :disabled="itemsToExport().length === 0" style="position: absolute; top: 4px; right: -10px; margin-right: 12px;" class="button" elevation="0" v-bind="props" color="#0c5c92">
                  <download-csv :delimiter="';'" :data="itemsToExport()" name="qualimarc-export.csv">
                    <span style="color: white">
                      TÉLÉCHARGER TOUS
                      <span style="display: block"></span>
                      LES RESULTATS
                    </span>
                  </download-csv>
                  <v-icon color="white" class="ml-2">mdi-download</v-icon>
                </v-btn>
              </template>
              <span>Télécharger le détail des erreurs trouvées dans tous les ppn de l’analyse en cours</span>
            </v-tooltip>
          </div>
        <!--      Le v-layout est nécessaire pour un bon affichage du tableau sur écran large      -->
        <v-layout child-flex>
          <bloc-recapitulatif class="ma-0 pa-0 mt-16 mb-4" style="min-height: 13em" :nombre-resultat-analyse="nbLancement"></bloc-recapitulatif>
        </v-layout>
          <v-card
          flat
          class="float-right ma-0 pa-0"
          >
            <bouton-lancement
              class="ma-0 pa-0"
              is-replay
              @finished="maskAndStopProgress"
              @started="displayAndStartProgress"
          >
            Relancer l'analyse
          </bouton-lancement>
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

import { ref, onMounted } from "vue";
import { useResultatStore } from "@/stores/resultat";
import router from "@/router";

const resultatStore = useResultatStore();

const currentPpn = ref('');
const currentItems = ref([]);
const nbLancement = ref(0);
const mobileBreakpoint = ref(200);
const iconTimeline = ref('mdi-chevron-left');
const focusOn = ref([4, 4]);
const isProgressLoading = ref(false);

onMounted(() => {
  if(resultatStore.getRecapitulatif.length === 0) {
    router.push({name: 'Redirection accueil'});
  }
});

function sendPpnToBlocResultat(ppn) {
  currentPpn.value = ppn;
}

function sendItemsToBlocResultat(items) {
  currentItems.value = items;
}

function itemsToExport() {
  let itemsToExport = [];
  resultatStore.getResultsList.forEach(result => {
    if (result.detailerreurs){
      result.detailerreurs.forEach(messageErreur => {
        let zoneunm2 = (messageErreur.zones[1]) ? messageErreur.zones[1] : "";
        let autresZones = "";
        for (let i = 2;i<messageErreur.zones.length;i++) {
          autresZones += messageErreur.zones[i]
          if (i !== (messageErreur.zones.length - 1)) autresZones += " | ";
        }
        let priority;
        if (messageErreur.priority === "P1"){
          priority = "Règle essentielle"
        } else if (messageErreur.priority === "P2"){
          priority = "Règle avancée"
        }
        itemsToExport.push({
          'ppn': result.ppn,
          'type de document': result.typeDocument,
          'zone/sous-zone 1': messageErreur.zones[0],
          'zone/sous-zone 2': zoneunm2,
          'autres zones/sous-zones':autresZones,
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

function stopAnalyse(){
  isProgressLoading.value = false;
}

function resizeBloc() {
  if(iconTimeline.value === 'mdi-chevron-left'){
    focusOn.value = [3, 2];
    mobileBreakpoint.value = 4000;
    iconTimeline.value = 'mdi-chevron-right';
  }else{
    focusOn.value = [4, 4];
    mobileBreakpoint.value = 200;
    iconTimeline.value = 'mdi-chevron-left';
  }
}

</script>

<style scoped>
.v-slider__thumb{
  cursor:pointer;
  height:42px;
  width:42px;
}
.button {
  color:white;
}
</style>
