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
  spinnerActive.value = true;
  emit('started');
  serviceApi.checkPpnWithTypeAnalyse(analyseStore.getPpnValidsList, analyseStore.getAnalyseSelected.id, analyseStore.getFamilleDocumentSet, analyseStore.getRuleSet, props.isReplay)
    .then((response) => {
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
        // Annulation de la requête
      }else {
        emitOnError(error);
      }
    })
    .finally(() => spinnerActive.value = false);
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
