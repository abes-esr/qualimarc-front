<template>
  <v-card variant="flat" class="ma-0 pa-0">
    <v-btn
        data-cy="btn_lance_analyse"
        @click="checkPpnWithTypeAnalyse"
        depressed :color="props.isDisabled ? '' : '#B30900'"
        :style="props.isDisabled ? '' : 'color:white'"
        :disabled="props.isDisabled"
        :loading="spinnerActive"
        append-icon="mdi-arrow-right-thin-circle-outline"
    >
      <slot></slot>
    </v-btn>
  </v-card>
</template>

<script setup>
import { useAnalyseStore } from "@/stores/analyse";
import { useResultatStore } from "@/stores/resultat";
import { useHistoriqueStore } from "@/stores/historique";
import QualimarcService from "@/service/QualimarcService";
import {ref} from "vue";

// Store
const analyseStore = useAnalyseStore();
const resultatStore = useResultatStore();
const historiqueStore = useHistoriqueStore();

// Props & Emit
const props = defineProps({isDisabled: Boolean, isReplay: Boolean});
const emit = defineEmits(['backendError', 'finished', 'started']);

// Service
const serviceApi = QualimarcService;

// Spinner
const spinnerActive = ref(false);

function checkPpnWithTypeAnalyse() {
  const startedAt = performance.now();
  const ppnCount = analyseStore.getPpnValidsList.length;
  const analysisType = analyseStore.getAnalyseSelected.id;

  spinnerActive.value = true;
  emit('started');
  serviceApi.checkPpnWithTypeAnalyse(analyseStore.getPpnValidsList, analyseStore.getAnalyseSelected.id, analyseStore.getFamilleDocumentSet, analyseStore.getRuleSet, props.isReplay)
    .then((response) => {
      logAnalysisDuration('terminee', startedAt, ppnCount, analysisType);
      resultatStore.setResultsListArray(response.data.resultRules);
      resultatStore.pushRecapitulatif(
        response.data.ppnAnalyses,
        response.data.ppnInconnus,
        response.data.ppnErrones,
        response.data.ppnOk
      );
      if(props.isReplay) {
        historiqueStore.pushReplayedResultatToLastHistorique(
          resultatStore.getLastRecapitulatif
        );
      } else {
        historiqueStore.createNewHistorique(
            {
              ppnValidsList: analyseStore.getPpnValidsList,
              ppnInvalidsList: analyseStore.getPpnInvalidsList,
              analyseSelected : analyseStore.getAnalyseSelected,
              familleDocumentSet : analyseStore.getFamilleDocumentSet,
              ruleSet : analyseStore.getRuleSet,
            },
            resultatStore.getLastRecapitulatif
        );
      }
      emitOnFinished();
    })
    .catch((error) => {
      if(error.message === 'canceled') {
        logAnalysisDuration('annulee', startedAt, ppnCount, analysisType);
      }else {
        logAnalysisDuration('en erreur', startedAt, ppnCount, analysisType);
        emitOnError(error);
      }
    })
    .finally(() => spinnerActive.value = false);
}

function logAnalysisDuration(status, startedAt, ppnCount, analysisType) {
  const durationMs = Math.round(performance.now() - startedAt);

  console.info('[Qualimarc] Analyse ' + status, {
    dureeMs: durationMs,
    dureeSecondes: Number((durationMs / 1000).toFixed(3)),
    nbPpn: ppnCount,
    typeAnalyse: analysisType,
    replay: props.isReplay,
  });
}

function emitOnError(error){
  emit('backendError', error);
}

function emitOnFinished(){
  emit('finished');
}

</script>

<style scoped>
</style>
