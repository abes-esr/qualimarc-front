<template>
  <section class="pa-2 borderBlocElements" >
    <span class="px-0 mb-2 fontPrimaryColor" style="font-size: small; display: block">
      Pour optimiser l'analyse, il est recommandé de ne pas soumettre plus de 5000 PPN en une seule fois
    </span>
    <v-combobox
        filled
        data-cy="COMBOBOX_AJOUT_PPN"
        append-icon=""
        @keydown.enter="checkValuesAndFeedPpnListTyped"
        @keydown.tab="checkValuesAndFeedPpnListTyped"
        :search-input.sync="lastValuesTypedOrPasted"
        :value="ppnListCombobox"
        @blur="checkValuesAndFeedPpnListTyped"
        multiple
        small-chips
        :label="comboboxPpnLabel"
        class="pa-1"
    >
      <template v-slot:selection="{item}">
        <v-chip v-if="item === ppnCopied" color="#eafaed" @click="copyLabelItem(item)" @click:close="removeItem(item)" aria-label="PPN copié" role="img">
          <span class="green--text text--darken-3" style="font-weight: 500; min-width: 83px">PPN COPI&Eacute;</span>
          <v-icon class="ma-0 pa-0" color="green darken-3" small>mdi-check</v-icon>
        </v-chip>
        <v-chip v-else close @click="copyLabelItem(item)" @click:close="removeItem(item)">
          <div :aria-label="'PPN numéro : ' + (item) + '. Cliquez pour copier ce numéro de PPN'" role="img">
            <span class="pr-2">{{ item === ppnCopied ? 'PPN COPIE' : item }}</span>
          </div>
        </v-chip>
      </template>
    </v-combobox>
    <v-sheet class="d-flex align-end flex-column pt-0 pr-1" style="margin-top: -34px;">
      <v-btn
          class="pr-1"
          depressed
          small
          tile
          data-cy="del_all_ppn"
            @click="removeAllItems"
            style="border: 1px solid grey; color: grey"
        >
          <span style="color: #4D4D4D">Vider la liste de ppn</span>
        <v-icon color="#4D4D4D">mdi-delete</v-icon>
      </v-btn>
    </v-sheet>
    <v-sheet class="py-5 d-flex justify-center">
      <div aria-label="Utiliser le champ de saisi ci-dessus pour saisir ou coller des PPN, puis cliquer hors du cadre (ou appuyer sur Entrée)" role="img">
        <v-icon class="mr-3" color="black">mdi-chevron-double-up</v-icon>
      </div>
      <span style="font-weight: 700">OU</span>
      <div aria-label="Utiliser le champ de saisi ci-dessous pour glisser-déposer un fichier .csv ou .txt contenant des PPN. Vous pouvez également cliquer dans le champ de saisi ci-dessous pour ouvrir une boite de dialogue de recherche de fichier." role="img">
        <v-icon class="ml-3" color="black">mdi-chevron-double-down</v-icon>
      </div>
    </v-sheet>
    <div v-cloak
         @drop.prevent="dropFile"
         @dragleave="dragLeave"
         @dragover.prevent="dragOver"
    >
      <v-file-input
          filled
          class="ml-1"
          :label="isDragging ? 'Importer votre fichier ici pour charger un fichier .csv ou .txt contenant des PPN' : 'Cliquer ici pour sélectionner un fichier de PPN au format .csv ou .txt (ou le glisser-déposer)'"
          :loading="isDragging"
          prepend-icon=""
          append-icon="mdi-file-download-outline"
          show-size
          type="file"
          aria-label="Cliquer ici pour sélectionner un fichier de PPN au format .csv ou .txt (ou le glisser-déposer)"
          truncate-length=75
          for="files"
          :rules="rules"
          v-model="fichierLoaded"
          @change="isAllowToSend"
          :style="isDragging ? 'transform: scale(1.02);' : ''"
          :clearable="false"
          :error-messages="errorMsg"
          :success-messages="successMsg"
          ref="fileInput">
      </v-file-input>
    </div>
    <v-alert v-if="analyseStore.getPpnInvalidsList.length !== 0" border="start" colored-border type="error" elevation="2">
      Les PPN listés ci-dessous présentent une syntaxe non conforme et ne seront pas analysés :<br>
      <span style="color: #595959; font-size: small">Rappel : syntaxe d'un PPN = 9 caractères, composés de 9 chiffres ou de 8 chiffres + la lettre X</span><br>
      <v-expansion-panels>
        <v-expansion-panel role="button">
          <v-expansion-panel-title>
              <span class="pt-2">Voir les PPN avec une syntaxe erronée</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
              <v-chip color="#B30900" outlined v-for="(item, index) in analyseStore.getPpnInvalidsList" :key="index">
                {{ item }}
              </v-chip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="mt-4 d-flex flex-row-reverse">
        <v-btn small tile depressed color="#0c5c92" class="button" max-width="380" height="26" @click="copyPnnWrongSyntax()">
          <span style="color: white">COPIER LES PPN AVEC SYNTAXE ERRONEE</span>
          <v-icon small color="white" class="ml-2">mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-alert>
    <v-snackbar
        v-model="snackbarCopyPpnNumberStatus"
        timeout="2000"
        color="#43a047"
        rounded="pill"
        elevation="5"
    >
      <v-icon class="ma-0 pa-0 mr-4" color="green darken-3">mdi-check</v-icon>
      <span class="green--text text--darken-3" style="font-weight: 500">{{ snackbarMessage }}</span>
    </v-snackbar>
  </section>
</template>

<script setup>
import { useAnalyseStore } from "@/stores/analyse";
import {onUpdated, ref} from 'vue';
import {useHistoriqueStore} from "@/stores/historique";
import { useRoute } from 'vue-router'
const route = useRoute()

//Store
const analyseStore = useAnalyseStore();
const historiqueStore = useHistoriqueStore();

//Emit
const emit = defineEmits(['isPpnListEmpty','backendError']);

//drag&drop
const isDragging = ref(false);

//Combobox
const comboboxPpnLabel = ref('Saisir ou coller des PPN, puis cliquer hors du cadre (ou appuyer sur Entrée)'); //Message indicatif de la combobox
const lastValuesTypedOrPasted = ref(''); //Dernière Chaîne de caractères saisie dans la combobox, servant à alimenter ensuite ppnListTyped
const ppnListCombobox = ref((route.query.numeroAnalyse && historiqueStore.getHistorique.length !== 0) ? historiqueStore.getHistorique[route.query.numeroAnalyse].analyse.ppnValidsList : []); //Tableau de ppn alimenté par les chaînes de caractères mises dans la combobox
const ppnInvalids = ref([]); //Tableau des ppn invalides saisis par l'utilisateur

//Import de fichier
const fichierLoaded = ref(null);
const rules = [(value) => !value || ((value.type === undefined) || (value.type === 'text/csv') || (value.type === 'text/plain') || (value.type === 'application/vnd.ms-excel' && value.name.includes('.csv'))) || 'Le fichier chargé n\'est pas dans un format autorisé (.txt ou .csv)'];
const fileReader = new FileReader();
const errorMsg = ref('');
const successMsg = ref('');

//Copie de ppn ou liste de ppn
const snackbarCopyPpnNumberStatus = ref(false);
const snackbarMessage = ref('');
const ppnCopied = ref('');

onUpdated(() => {
  if (ppnListCombobox.value.length > 0 && lastValuesTypedOrPasted.value === '') {
    analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
    analyseStore.setPpnInvalidsList(ppnInvalids.value); //Alimentation du store avec les ppn invalides
    emitOnEvent();
  }
});

function dropFile(dropObject){
  let filesDragged=[];
  let droppedFiles = dropObject.dataTransfer.files;
  filesDragged.push(...droppedFiles);
  fichierLoaded.value = filesDragged[0];
  isAllowToSend();
  isDragging.value = false;
}

function dragOver(){
  isDragging.value = true;
}

function dragLeave(){
  isDragging.value = false;
}

/**
 * Fonction qui permet le changement de l'affichage du chip du ppn copié
 * @param item le numéro de ppn
 */
function copyLabelItem(item) {
  ppnCopied.value = item;
  navigator.clipboard.writeText(item)
  setTimeout(() => {
    ppnCopied.value = '';
  }, 1000);
}

/**
 * Fonction qui permet l'affichage de la snackbar en cas de copie de la liste des ppn à la syntaxe erronée
 */
function copyPnnWrongSyntax() {
  navigator.clipboard.writeText(ppnInvalids.value)
  snackbarMessage.value = "Les PPN avec syntaxe erronée ont été copié dans le presse papier";
  snackbarCopyPpnNumberStatus.value = true;
}

/**
 * Suppression d'un élément ppn déclenché au moment du clic sur la croix
 * @param item le ppn en question
 */
function removeItem(item){
  const index = ppnListCombobox.value.indexOf(item);
  ppnListCombobox.value.splice(index, 1);
  analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
  emitOnEvent();
}

/**
 * Suppression de l'ensemble des éléments de la combobox
 */
function removeAllItems(){
  resetMessages();
  if(ppnListCombobox.value){
    ppnListCombobox.value = [];
    ppnInvalids.value = [];
    analyseStore.setPpnInvalidsList(ppnInvalids.value); // Vide la liste des ppn invalides
    analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
    emitOnEvent();
    fichierLoaded.value = null;
  }
}

/**
 * Contrôle des chaînes de caractères saisies dans la combobox à la sortie de la souris du champ et alimentation de ppnListTyped
 */
function checkValuesAndFeedPpnListTyped(){
  if(lastValuesTypedOrPasted.value){ //Si la valeur n'est pas nulle, ce qui se produit si l'utilisateur sort du cadre sans rien taper
    let arrayWithValidsPpn = lastValuesTypedOrPasted.value.split(/[^\da-zA-Z]/).filter(ppn_to_check => ppn_to_check.match(/^(\d{8}(\d|X|x))$/));
    let arrayWithInvalidsPpn = lastValuesTypedOrPasted.value.split(/[^\da-zA-Z]/).filter(ppn_to_check => !ppn_to_check.match(/^(\d{8}(\d|X|x))$/)).filter(str_to_clean => str_to_clean.trim() !== '');
    let arrayWithValidsPpnWithUniqueValues = arrayWithValidsPpn.filter((v, i, a) => a.indexOf(v) === i); //Fonction anonyme de dédoublonnage sur la saisie en cours
    let arrayWithInvalidsPpnWithUniqueValues = arrayWithInvalidsPpn.filter((v, i, a) => a.indexOf(v) === i); //Fonction anonyme de dédoublonnage sur la saisie en cours
    //Ppn valides
    arrayWithValidsPpnWithUniqueValues.forEach(currentValidPpn => { ppnListCombobox.value.push(currentValidPpn)});
    ppnListCombobox.value = ppnListCombobox.value.filter( function( item, index, inputArray ) {return inputArray.indexOf(item) === index;}); //Supprime les ppn qui serait en doublon sur une saisie précédente
    //Ppn invalide
    arrayWithInvalidsPpnWithUniqueValues.forEach(currentValidPpn => ppnInvalids.value.push(currentValidPpn));
    ppnInvalids.value = ppnInvalids.value.filter( function( item, index, inputArray ) {return inputArray.indexOf(item) === index;}); //Supprime les ppn qui serait en doublon sur une saisie précédente
  }
  analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
  analyseStore.setPpnInvalidsList(ppnInvalids.value); //Alimentation du store avec les ppn invalides
  lastValuesTypedOrPasted.value = ''; //On vide la chaîne puisqu'on à alimenté les valeurs valides dans :value="ppnListCombobox"
  emitOnEvent();
}

/**
 * Controle si la liste de ppn dans le store est vide ou non
 * @returns {boolean} true si la liste est vide, false si elle ne l'est pas
 */
function checkPpnListIsEmptyInCombobox(){
  return ppnListCombobox.value.length === 0;
}

function isAllowToSend() {
  resetMessages();
  fileReader.onloadend = function() {
    lastValuesTypedOrPasted.value = fileReader.result;
    if(fileReader.result.split(/[^\da-zA-Z]/).filter(str_to_clean => str_to_clean.trim() !== '').length < 5000){
      successMsg.value = "Fichier importé avec succès"
      checkValuesAndFeedPpnListTyped();
    } else {
      errorMsg.value = "Le fichier ne doit pas contenir plus de 5000 PPN";
    }
  };
  fileReader.onerror = function() {
    emit('backendError', fileReader.error);
  }
  if((fichierLoaded.value !== null) && ((fichierLoaded.value.type === 'text/csv') || (fichierLoaded.value.type === 'text/plain') || (fichierLoaded.value.type === 'application/vnd.ms-excel' && fichierLoaded.value.name.includes('.csv')))) {
    fileReader.readAsText(fichierLoaded.value);
  }
}

/**
 * Evenement envoyant au parent avec l'annotation @isPpnListEmpty un booleen
 */
function emitOnEvent(){
  emit('isPpnListEmpty', checkPpnListIsEmptyInCombobox());
}

/**
 * Fonction permettant de réinitialiser les messages de succès et d'erreur sur l'upload de fichier
 */
function resetMessages(){
  successMsg.value = '';
  errorMsg.value = '';
}
</script>
