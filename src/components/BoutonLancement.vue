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
import QualimarcService from "@/service/QualimarcService";
import {ref} from "vue";

// Store
const analyseStore = useAnalyseStore();

// Props & Emit
const props = defineProps({isDisabled: Boolean, isReplay: Boolean});
const emit = defineEmits(['backendError', 'started']);

// Service
const serviceApi = QualimarcService;

// Spinner
const spinnerActive = ref(false);

function checkPpnWithTypeAnalyse() {
  const ppnCount = analyseStore.getPpnValidsList.length;
  const analysisType = analyseStore.getAnalyseSelected.id;

  spinnerActive.value = true;
  serviceApi.startAnalysisTracking(ppnCount, analysisType, props.isReplay);
  serviceApi.checkPpnWithTypeAnalyse(analyseStore.getPpnValidsList, analyseStore.getAnalyseSelected.id, analyseStore.getFamilleDocumentSet, analyseStore.getRuleSet, props.isReplay)
    .then(() => {
      emit('started');
    })
    .catch((error) => {
      if(error.message === 'canceled' || error.code === 'ERR_CANCELED') {
        serviceApi.logAnalysisDuration('annulee');
      }else {
        serviceApi.logAnalysisDuration('en erreur');
        emitOnError(error);
      }
    })
    .finally(() => spinnerActive.value = false);
}

function emitOnError(error){
  emit('backendError', error);
}

</script>

<style scoped>
</style>
