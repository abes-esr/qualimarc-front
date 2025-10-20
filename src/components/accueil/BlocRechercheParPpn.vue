<template>
  <section class="pa-2 borderBlocElements">
    <span class="px-0 mb-2 fontPrimaryColor" style="font-size: small; display: block">
      Pour optimiser l'analyse, il est recommandé de ne pas soumettre plus de 5000 PPN en une seule fois
    </span>
    <v-combobox
        label="Saisir ou coller des PPN, puis cliquer hors du cadre (ou appuyer sur Entrée)"
        v-model="ppnListCombobox"
        v-model:search="lastValuesTypedOrPasted"
        append-inner-icon=""
        class="pt-1 px-1 pb-0 mb-0"
        data-cy="COMBOBOX_AJOUT_PPN"
        filled
        multiple
        dense
        @blur="checkValuesAndFeedPpnListTyped"
        @keydown.enter="checkValuesAndFeedPpnListTyped"
        @keydown.tab="checkValuesAndFeedPpnListTyped"
    >
      <template v-slot:selection="data">
        <v-chip
            v-if="data.item.value === ppnCopied"
            :key="JSON.stringify(data.item.value)"
            v-bind="data.attrs"
            aria-label="PPN copié"
            color="#eafaed"
            role="img"
            @click="copyLabelItem(data.item.value)"
            @click:close="removeItem(data.item.value)"
        >
          <span class="green--text text--darken-3" style="font-weight: 500; min-width: 83px">
            PPN COPIÉ
          </span>
          <v-icon class="ma-0 pa-0" color="green darken-3" size="16">mdi-check</v-icon>
        </v-chip>
        <v-chip
            v-else
            :key="JSON.stringify(data.item.value)"
            v-bind="data.attrs"
            :disabled="data.disabled"
            :model-value="data.selected"
            @click="copyLabelItem(data.item.value)"
            @click:close="removeItem(data.item.value)"
            closable
        >
          <div :aria-label="'PPN numéro : ' + data.item.title + '. Cliquez pour copier ce numéro de PPN'" role="img">
            <span class="pr-2"> {{ data.item.title }}</span>
          </div>
        </v-chip>
      </template>
    </v-combobox>
    <v-sheet class="d-flex align-end flex-column pt-0 pr-1" style="margin-top: -23px">
      <v-btn
          class="pr-1 pt-0 mt-0 elevation-0"
          data-cy="del_all_ppn"
          depressed
          size="small"
          append-icon="mdi-delete"
          tile
          flat
          variant="outlined"
          @click="removeAllItems"
          color="#4D4D4D"
      >
        Vider la liste de ppn
      </v-btn>
    </v-sheet>
    <v-sheet class="py-5 d-flex justify-center">
      <div
          aria-label="Utiliser le champ de saisi ci-dessus pour saisir ou coller des PPN, puis cliquer hors du cadre (ou appuyer sur Entrée)"
          role="img">
        <v-icon class="mr-3" color="black">mdi-chevron-double-up</v-icon>
      </div>
      <span style="font-weight: 700">OU</span>
      <div
          aria-label="Utiliser le champ de saisi ci-dessous pour glisser-déposer un fichier .csv ou .txt contenant des PPN. Vous pouvez également cliquer dans le champ de saisi ci-dessous pour ouvrir une boite de dialogue de recherche de fichier."
          role="img">
        <v-icon class="ml-3" color="black">mdi-chevron-double-down</v-icon>
      </div>
    </v-sheet>
    <v-file-input
        @dragleave="dragLeave"
        @drop.prevent="dropFile"
        @dragover.prevent="dragOver"
        ref="fileInput"
        v-model="fichierLoaded"
        :clearable="false"
        :error-messages="errorMsg"
        :label="isDragging ? 'Importer votre fichier ici pour charger un fichier .csv ou .txt contenant des PPN' : 'Cliquer ici pour sélectionner un fichier de PPN au format .csv ou .txt (ou le glisser-déposer)'"
        :loading="isDragging"
        :rules="rules"
        :style="isDragging ? 'transform: scale(1.02);' : ''"
        :success-messages="successMsg"
        append-inner-icon="mdi-file-download-outline"
        aria-label="Cliquer ici pour sélectionner un fichier de PPN au format .csv ou .txt (ou le glisser-déposer)"
        class="ml-1"
        filled
        for="files"
        show-size
        truncate-length=75
        type="file"
        @change="isAllowToSend">
    </v-file-input>
    <v-alert v-if="analyseStore.getPpnInvalidsList.length !== 0"
             border="start"
             elevation="2"
             type="error"
             variant="outlined"
            >
      Les PPN listés ci-dessous présentent une syntaxe non conforme et ne seront pas analysés :<br>
      <span style="color: #595959; font-size: small">Rappel : syntaxe d'un PPN = 9 caractères, composés de 9 chiffres ou de 8 chiffres + la lettre X</span><br>
      <v-expansion-panels>
        <v-expansion-panel role="button">
          <v-expansion-panel-title>
            <span class="pt-2">Voir les PPN avec une syntaxe erronée</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-chip v-for="(item, index) in analyseStore.getPpnInvalidsList" :key="index" color="#B30900" outlined>
              {{ item }}
            </v-chip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="mt-4 d-flex flex-row-reverse">
        <v-btn class="button" color="#0c5c92" depressed height="26" max-width="380" small tile
               @click="copyPnnWrongSyntax()">
          <span style="color: white">COPIER LES PPN AVEC SYNTAXE ERRONEE</span>
          <v-icon class="ml-2" color="white" small>mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-alert>
    <v-snackbar
        v-model="snackbarCopyPpnNumberStatus"
        color="#43a047"
        elevation="5"
        rounded="lg"
        timeout="2000"
    >
      <v-icon class="ma-0 pa-0 mr-4" color="green darken-3">mdi-check</v-icon>
      <span class="green--text text--darken-3" style="font-weight: 500">{{ snackbarMessage }}</span>
    </v-snackbar>
  </section>
</template>

<script setup>
import {useAnalyseStore} from "@/stores/analyse";
import {onUpdated, ref} from 'vue';
import {useHistoriqueStore} from "@/stores/historique";
import {useRoute} from 'vue-router'

const route = useRoute()

//Store
const analyseStore = useAnalyseStore();
const historiqueStore = useHistoriqueStore();

//Emit
const emit = defineEmits(['isPpnListEmpty', 'backendError']);

//drag&drop
const isDragging = ref(false);

//Combobox
const lastValuesTypedOrPasted = ref(""); //Dernière Chaîne de caractères saisie dans la combobox, servant à alimenter ensuite ppnListTyped
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

function dropFile(dropObject) {
  let filesDragged = [];
  let droppedFiles = dropObject.dataTransfer.files;
  filesDragged.push(...droppedFiles);
  fichierLoaded.value = filesDragged[0];
  isAllowToSend();
  isDragging.value = false;
}

function dragOver() {
  isDragging.value = true;
}

function dragLeave() {
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
function removeItem(item) {
  const index = ppnListCombobox.value.indexOf(item);
  ppnListCombobox.value.splice(index, 1);
  analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
  emitOnEvent();
}

/**
 * Suppression de l'ensemble des éléments de la combobox
 */
function removeAllItems() {
  resetMessages();
  if (ppnListCombobox.value) {
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
function checkValuesAndFeedPpnListTyped() {
  if (lastValuesTypedOrPasted.value) {
    //Si la valeur n'est pas nulle, ce qui se produit si l'utilisateur sort du cadre sans rien taper
    ppnListCombobox.value.pop()
    let arrayWithValidsPpn = lastValuesTypedOrPasted.value.split(/[^\da-zA-Z]/).filter(ppn_to_check => ppn_to_check.match(/^(\d{8}(\d|X|x))$/));
    let arrayWithInvalidsPpn = lastValuesTypedOrPasted.value.split(/[^\da-zA-Z]/).filter(ppn_to_check => !ppn_to_check.match(/^(\d{8}(\d|X|x))$/)).filter(str_to_clean => str_to_clean.trim() !== '');
    let arrayWithValidsPpnWithUniqueValues = arrayWithValidsPpn.filter((v, i, a) => a.indexOf(v) === i); //Fonction anonyme de dédoublonnage sur la saisie en cours
    let arrayWithInvalidsPpnWithUniqueValues = arrayWithInvalidsPpn.filter((v, i, a) => a.indexOf(v) === i); //Fonction anonyme de dédoublonnage sur la saisie en cours
    //Ppn valides
    arrayWithValidsPpnWithUniqueValues.forEach(currentValidPpn => {
      ppnListCombobox.value.push(currentValidPpn)
    });
    ppnListCombobox.value = ppnListCombobox.value.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) === index;
    }); //Supprime les ppn qui serait en doublon sur une saisie précédente
    //Ppn invalide
    arrayWithInvalidsPpnWithUniqueValues.forEach(currentValidPpn => ppnInvalids.value.push(currentValidPpn));
    ppnInvalids.value = ppnInvalids.value.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) === index;
    }); //Supprime les ppn qui serait en doublon sur une saisie précédente
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
function checkPpnListIsEmptyInCombobox() {
  return ppnListCombobox.value.length === 0;
}

function isAllowToSend() {
  resetMessages();
  fileReader.onloadend = function () {
    if (fileReader.result.split(/[^\da-zA-Z]/).filter(str_to_clean => str_to_clean.trim() !== '').length < 5000) {
      lastValuesTypedOrPasted.value = fileReader.result;
      successMsg.value = "Fichier importé avec succès"
      checkValuesAndFeedPpnListTyped();
    } else {
      errorMsg.value = "Le fichier ne doit pas contenir plus de 5000 PPN";
    }
  };
  fileReader.onerror = function () {
    emit('backendError', fileReader.error);
  }
  if ((fichierLoaded.value !== null) && ((fichierLoaded.value.type === 'text/csv') || (fichierLoaded.value.type === 'text/plain') || (fichierLoaded.value.type === 'application/vnd.ms-excel' && fichierLoaded.value.name.includes('.csv')))) {
    fileReader.readAsText(fichierLoaded.value);
  }
}

/**
 * Evenement envoyant au parent avec l'annotation @isPpnListEmpty un booleen
 */
function emitOnEvent() {
  emit('isPpnListEmpty', checkPpnListIsEmptyInCombobox());
}

/**
 * Fonction permettant de réinitialiser les messages de succès et d'erreur sur l'upload de fichier
 */
function resetMessages() {
  successMsg.value = '';
  errorMsg.value = '';
}
</script>
