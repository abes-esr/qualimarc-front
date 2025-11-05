<template>
  <v-row class="d-flex align-center" style="min-width: 330px">
    <v-col style="color: lightgrey; font-weight: 400; font-size: 1.2em; width: 40px; max-width: 40px"><slot></slot></v-col>
    <v-sheet style="border-left: 2px solid lightgrey; width: 18em" class="pa-5 mb-1" >
      <v-row class="d-flex justify-space-between align-center">
        <span>Nb. total de PPN analysés :</span>
        <DownloadCsv
            name="ppn_analyses.csv"
            :disabled="resultatsToDisplay.PpnTotal.length === 0"
            size="x-small"
            delimiter=";"
            :data="itemsToExport(resultatsToDisplay.PpnTotal)" >
          <span>
            {{ resultatsToDisplay.PpnTotal.length }}
          </span>
        </DownloadCsv>
      </v-row>
      <v-row class="d-flex justify-space-between align-center">
        <span>Nb. de PPN avec erreurs :</span>
        <DownloadCsv
            :disabled="resultatsToDisplay.PpnErreurs.length === 0"
            delimiter=";"
            :data="itemsToExport(resultatsToDisplay.PpnErreurs)"
            size="x-small"
            name="ppn_avec_erreurs.csv">
          <span>
            {{ resultatsToDisplay.PpnErreurs.length }}
          </span>
        </DownloadCsv>
      </v-row>
      <v-row class="d-flex justify-space-between align-center">
        <span>Nb. de PPN sans erreur :</span>
        <DownloadCsv
            :disabled="resultatsToDisplay.PpnOk.length === 0"
            delimiter=";"
            :data="itemsToExport(resultatsToDisplay.PpnOk)"
            size="x-small"
            name="ppn_sans_erreur.csv">
          <span>
            {{ resultatsToDisplay.PpnOk.length }}
          </span>
        </DownloadCsv>
      </v-row>
      <v-row class="d-flex justify-space-between align-center">
        <span>Nb. de PPN non trouvés :</span>
        <DownloadCsv
            :disabled="resultatsToDisplay.PpnInconnus.length === 0"
            delimiter=";"
            :data="itemsToExport(resultatsToDisplay.PpnInconnus)"
            size="x-small"
            name="ppn_inconnus.csv">
          <span>
            {{ resultatsToDisplay.PpnInconnus.length }}
          </span>
        </DownloadCsv>
      </v-row>
    </v-sheet>
  </v-row>
</template>
<script setup>
import {onMounted, ref} from "vue";
import DownloadCsv from "@/components/DownloadCsv.vue";

const props = defineProps({
  // props
  resultats: {
    type: Object,
    required: true
  }
});

const resultatsToDisplay = ref(props.resultats);

function itemsToExport(items) {
  let itemsToExport = [];
  items.forEach(ppn => {
    itemsToExport.push({'ppn':ppn});
  })
  return itemsToExport;
}
</script>
<style scoped>
.button {
  color:white;
}
</style>
