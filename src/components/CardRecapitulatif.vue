<template>
  <v-row class="d-flex align-center" style="min-width: 330px">
    <v-col cols="2" style="color: lightgrey; font-weight: 400; font-size: 1.2em; width: 40px; max-width: 40px">
      <slot></slot>
    </v-col>
    <v-col cols="10" style="border-left: 2px solid lightgrey; width: 100%">
      <v-row>
        <v-col cols="10">
          <span>Nb. total de PPN analysés :</span>
        </v-col>
        <v-col cols="2">
          <DownloadCsv
              :data="itemsToExport(resultatsToDisplay.PpnTotal)"
              :disabled="resultatsToDisplay.PpnTotal.length === 0"
              delimiter=";"
              name="ppn_analyses.csv"
              size="x-small">
            <span>
              {{ resultatsToDisplay.PpnTotal.length }}
            </span>
          </DownloadCsv>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="10">
          <span>Nb. de PPN avec erreurs :</span>
        </v-col>
        <v-col cols="2">
          <DownloadCsv
              :data="itemsToExport(resultatsToDisplay.PpnErreurs)"
              :disabled="resultatsToDisplay.PpnErreurs.length === 0"
              delimiter=";"
              name="ppn_avec_erreurs.csv"
              size="x-small">
          <span>
            {{ resultatsToDisplay.PpnErreurs.length }}
          </span>
          </DownloadCsv>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="10">
          <span>Nb. de PPN sans erreur :</span>
        </v-col>
        <v-col cols="2">
          <DownloadCsv
              :data="itemsToExport(resultatsToDisplay.PpnOk)"
              :disabled="resultatsToDisplay.PpnOk.length === 0"
              delimiter=";"
              name="ppn_sans_erreur.csv"
              size="x-small">
          <span>
            {{ resultatsToDisplay.PpnOk.length }}
          </span>
          </DownloadCsv>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="10">
          <span>Nb. de PPN non trouvés :</span>
        </v-col>
        <v-col cols="2">
          <DownloadCsv
              :data="itemsToExport(resultatsToDisplay.PpnInconnus)"
              :disabled="resultatsToDisplay.PpnInconnus.length === 0"
              delimiter=";"
              name="ppn_inconnus.csv"
              size="x-small">
            <span>
              {{ resultatsToDisplay.PpnInconnus.length }}
            </span>
          </DownloadCsv>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup>
import {ref} from "vue";
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
    itemsToExport.push({'ppn': ppn});
  })
  return itemsToExport;
}
</script>
<style scoped>
.button {
  color: white;
}

.v-col {
  padding: 2px !important;
}

.v-row {
  margin: 0 !important;

}
</style>
