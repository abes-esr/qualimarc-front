<template>
    <v-overlay
            v-model="isLoading"
    >
        <v-dialog v-model="isLoading" @click:outside="cancel" width="400" style="max-width: 400px">
            <v-sheet style="background-color: #252C61" class="d-flex justify-center">
                <span class="text-h5" style="color: white">Analyse en cours</span>
            </v-sheet>

            <v-sheet
                    class="pa-5"
                    style="background-color: white"
            >
                <span v-if="count === '0%'" style="padding: 24px; font-style: italic; color: grey;" class="d-flex justify-center">L'analyse va débuter, veuillez patienter quelques instants.</span>
                <span v-if="count === '100%'" style="padding: 24px; font-style: italic; color: grey;" class="d-flex justify-center">L'analyse est terminée, veuillez patienter quelques instants.</span>
                <v-progress-linear
                        v-model="count"
                        height="25"
                        color="#0F75BC"
                        rounded
                        class="my-9"
                >
                    Progression de l'analyse : {{ count }}
                </v-progress-linear>
                <div class="d-flex justify-center">
                    <v-btn
                            @click="cancel()"
                            depressed
                            color="#B30900"
                            class="button"
                    >
                        Annuler
                        <v-icon color="white">mdi-close-circle-outline</v-icon>
                    </v-btn>
                </div>
            </v-sheet>
        </v-dialog>
    </v-overlay>
</template>

<script setup>
import {onBeforeUnmount, ref, watch} from 'vue';
import QualimarcService from "@/service/QualimarcService";

const isLoading = defineModel('isLoading', { type: Boolean, default: false });
const emit = defineEmits(['finished', 'cancel', 'error']);

const serviceApi = QualimarcService;

const count = ref('0%');
const isCanceled = ref(false);
const pollingIntervalId = ref(null);
const isStatusRequestPending = ref(false);
const isResultRequestPending = ref(false);

watch(isLoading, (loading) => {
    if (loading) {
        startPolling();
    }
});

onBeforeUnmount(() => {
    stopPolling();
});

/**
 * Lance une unique boucle de polling pour suivre la progression.
 */
function startPolling() {
    count.value = '0%';
    isCanceled.value = false;
    isStatusRequestPending.value = false;
    isResultRequestPending.value = false;
    stopPolling();

    pollingIntervalId.value = window.setInterval(async () => {
        if (isCanceled.value) {
            stopPolling();
            return;
        }

        if (count.value.replace('%', '') > 100) {
            handleUnexpectedError();
            return;
        }

        if ((count.value === '100%') && !isResultRequestPending.value) {
            isResultRequestPending.value = true;
            try {
                const response = await serviceApi.getResult();
                if (response?.status === 200) {
                    serviceApi.logAnalysisDuration('terminee');
                    isLoading.value = false;
                    finish(response.data);
                }
            } catch (error) {
                handleUnexpectedError(error);
            } finally {
                isResultRequestPending.value = false;
            }
            return;
        }

        if ((count.value !== '100%') && !isStatusRequestPending.value) {
            isStatusRequestPending.value = true;
            try {
                const response = await serviceApi.getStatus();
                if (response?.data) {
                    count.value = response.data;
                }
            } catch (error) {
                handleUnexpectedError(error);
            } finally {
                isStatusRequestPending.value = false;
            }
        }
    }, 500);
}

function stopPolling() {
    if (pollingIntervalId.value !== null) {
        clearInterval(pollingIntervalId.value);
        pollingIntervalId.value = null;
    }
}

function cancel() {
    isCanceled.value = true;
    stopPolling();
    serviceApi.logAnalysisDuration('annulee');
    serviceApi.cancel();
    emit('cancel', true);
}

function finish(result) {
    stopPolling();
    emit('finished', result);
}

function handleUnexpectedError() {
    stopPolling();
    isLoading.value = false;
    serviceApi.logAnalysisDuration('en erreur');
    emit('error', 'Une erreur inattendue est survenue sur le serveur. Merci de relancer votre analyse.');
}
</script>

<style scoped>
.button {
    color: white
}
</style>
