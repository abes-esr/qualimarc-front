<template>
    <v-container fluid>
        <h1 class="ml-1 mb-2 fontPrimaryColor" style="font-size: 1em; font-weight: 400">Outil d'analyse des notices
            bibliographiques du Sudoc</h1>
        <progress-bar v-model:isLoading="isProgressLoading" @finished="redirect" @cancel="stopAnalyse"
                      @error="setMessageErreur"></progress-bar>
        <v-row class="mb-2 pa-2" justify="space-between">
            <v-col class="ma-2 pa-2" style="min-height: 34em;">
                <h2 style="font-size: 1.26em; color : #252C61; font-weight: bold">
                    <v-icon color="#252C61" style="margin-top: -4px">mdi-numeric-1-box</v-icon>
                    Soumettre des PPN
                </h2>
                <bloc-recherche-par-ppn class="mb-0 pa-0" @isPpnListEmpty="setIsPpnListIsEmpty"
                                        @backendError="setBackendError"/>
            </v-col>
            <v-col class="ma-2 pa-2" style="min-height: 34em">
                <h2 style="font-size: 1.26em; color : #252C61; font-weight: bold;">
                    <v-icon color="#252C61" style="margin-top: -4px">mdi-numeric-2-box</v-icon>
                    Sélectionner un type d'analyse
                </h2>
                <bloc-type-analyse class="mb-2 pa-0" @isSelected="setIsAnalyseSelected"
                                   @backendError="setBackendError"></bloc-type-analyse>
                <message-erreur class="mb-2 pa-4" :backendErrorMessage="backendErrorMessage"
                                :messageError="messageErreur"></message-erreur>
                <bouton-lancement
                        class="mb-2 pa-0"
                        :isDisabled="(isPpnListIsEmpty || !isAnalyseSelected)"
                        @backendError="setBackendError"
                        @finished="maskAndStopProgress"
                        @started="displayAndStartProgress"
                >
                    Lancer l'analyse
                </bouton-lancement>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup>
import BlocTypeAnalyse from "@/components/accueil/BlocTypeAnalyse.vue";
import BlocRechercheParPpn from "@/components/accueil/BlocRechercheParPpn.vue";
import BoutonLancement from "@/components/BoutonLancement.vue";
import MessageErreur from "@/components/MessageErreur.vue";
import {onMounted, ref, watchEffect} from 'vue';
import router from "@/router";
import {useResultatStore} from "@/stores/resultat";
import {useAnalyseStore} from "@/stores/analyse";
import ProgressBar from "@/components/ProgressBar.vue";

const isAnalyseSelected = ref(false);
const isPpnListIsEmpty = ref(true);
const backendErrorMessage = ref(null);
const isProgressLoading = ref(false);
const messageErreur = ref(null);
//Store
const resultatStore = useResultatStore();
const analyseStore = useAnalyseStore();

onMounted(() => {
    resultatStore.$reset();
    analyseStore.$reset();
});

/**
 *
 * @param isAnaslyseSelected
 */
function setIsAnalyseSelected(isAnaslyseSelected) {
    isAnalyseSelected.value = isAnaslyseSelected;
}

/**
 *
 * @param isPpnListIsEmptyFromBloc
 */
function setIsPpnListIsEmpty(isPpnListIsEmptyFromBloc) {
    isPpnListIsEmpty.value = isPpnListIsEmptyFromBloc;
}

function setBackendError(error) {
    backendErrorMessage.value = error;
    stopAnalyse();
}

function setMessageErreur(message) {
    messageErreur.value = message;
}

function displayAndStartProgress() {
    isProgressLoading.value = true;
    resetErrorMessage();
}

function maskAndStopProgress() {
    isProgressLoading.value = false;
    backendErrorMessage.value = null;
}

function stopAnalyse() {
    isProgressLoading.value = false;
}

function redirect() {
    router.push('/resultats');
}

function resetErrorMessage() {
    messageErreur.value = null;
    backendErrorMessage.value = null;
}
</script>
