<template>
  <section class="pa-2 borderBlocElements">
    <span class="px-0 mb-2 fontPrimaryColor" style="font-size: small; display: block">
      Pour optimiser l'analyse, il est recommandé de ne pas soumettre plus de 5000 PPN en une seule fois
    </span>
    <v-combobox
        v-model="ppnListCombobox"
        v-model:search="lastValuesTypedOrPasted"
        append-inner-icon=""
        class="pt-1 px-1 pb-0 mb-0"
        data-cy="COMBOBOX_AJOUT_PPN"
        label="Saisir ou coller des PPN, puis cliquer hors du cadre (ou appuyer sur Entrée)"
        multiple
        variant="filled"
        @update:search="clearModel"
        @blur="checkValuesAndFeedPpnListTyped"
        @keydown.enter="checkValuesAndFeedPpnListTyped"
    >
      <template v-slot:selection="data">
        <v-chip
            v-if="data.item.value === ppnCopied"
            :key="JSON.stringify(data.item.value)"
            aria-label="PPN copié"
            color="#eafaed"
            role="img"
            v-bind="data.attrs"
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
            :disabled="data.disabled"
            :model-value="data.selected"
            closable
            v-bind="data.attrs"
            @click="copyLabelItem(data.item.value)"
            @click:close="removeItem(data.item.value)"
        >
          <div :aria-label="'PPN numéro : ' + data.item.title + '. Cliquez pour copier ce numéro de PPN'" role="img">
            <span class="pr-2"> {{ data.item.title }}</span>
          </div>
        </v-chip>
      </template>
    </v-combobox>
    <v-sheet class="d-flex align-end flex-column pt-0 pr-1" style="margin-top: -23px">
      <v-btn
          append-icon="mdi-delete"
          class="pr-1 pt-0 mt-0 elevation-0"
          color="#4D4D4D"
          data-cy="del_all_ppn"
          depressed
          size="small"
          tile
          variant="outlined"
          @click="removeAllItems"
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
        @change="isAllowToSend"
        @dragleave="dragLeave"
        @drop.prevent="dropFile"
        @dragover.prevent="dragOver">
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
            <v-chip v-for="(item, index) in analyseStore.getPpnInvalidsList" :key="index" color="#B30900" variant="outlined">
              {{ item }}
            </v-chip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="mt-4 d-flex flex-row-reverse">
        <v-btn class="button" color="#0c5c92" depressed height="26" max-width="380" size="small" tile
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
import { onUpdated, ref} from 'vue';
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
const ppnListCombobox = ref((route.query.numeroAnalyse && historiqueStore.getHistorique.length !== 0) ? historiqueStore.getHistorique[route.query.numeroAnalyse].analyse.ppnValidsList : ['123456987','123456789','017559782','006008577']); //Tableau de ppn alimenté par les chaînes de caractères mises dans la combobox
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


const isValidPpn = ppn => /^\d{8}(\d|X|x)$/.test(ppn);

onUpdated(() => {
  if (ppnListCombobox.value.length > 0 && lastValuesTypedOrPasted.value === '') {
    analyseStore.setPpnValidsList(ppnListCombobox.value); //Alimentation du store avec les ppn valides
    analyseStore.setPpnInvalidsList(ppnInvalids.value); //Alimentation du store avec les ppn invalides
    emitOnEvent();
  }
});

function clearModel() {
  ppnListCombobox.value = ppnListCombobox.value.filter(isValidPpn)
}

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
  navigator.clipboard.writeText(ppnInvalids.value.join(","))
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
  const rawInput = lastValuesTypedOrPasted.value;
  if (!rawInput) return; // Rien à faire si le champ est vide

  const tokens = rawInput.split(/[^\da-zA-Z]+/).map(s => s.trim()).filter(Boolean);

  const valids = [...new Set(tokens.filter(isValidPpn))];
  const invalids = [...new Set(tokens.filter(ppn => !isValidPpn(ppn)))];

  // Ajout des PPN valides sans doublon
  ppnListCombobox.value = [...new Set([...ppnListCombobox.value, ...valids])];

  // Ajout des PPN invalides sans doublon
  ppnInvalids.value = [...new Set([...ppnInvalids.value, ...invalids])];

  isValidPpnInPpnListCombobox(rawInput);

  // Mise à jour du store
  analyseStore.setPpnValidsList(ppnListCombobox.value);
  analyseStore.setPpnInvalidsList(ppnInvalids.value);

  // Réinitialisation de la saisie
  lastValuesTypedOrPasted.value = '';

  emitOnEvent();
}

function isValidPpnInPpnListCombobox(input) {
  // Retire la chaîne complète si elle se trouve dans la liste des PPN (cas d’un seul PPN saisi)
  if (!isValidPpn(input)) {
    const index = ppnListCombobox.value.indexOf(input);
    if (index !== -1) ppnListCombobox.value.splice(index, 1);
  }
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
