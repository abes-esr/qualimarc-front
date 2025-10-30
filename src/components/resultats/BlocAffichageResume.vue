<template>
  <v-container class="ma-0 pa-0">
    <span v-shortkey="{up: ['arrowup'], left: ['arrowleft']}" @shortkey="goToPreviousLine()"></span>
    <span v-shortkey="{down: ['arrowdown'], right: ['arrowright']}" @shortkey="goToNextLine()"></span>
    <v-row class="ma-0 pa-0">
      <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Liste des PPN avec erreurs</h1>
    </v-row>
    <v-data-table
        v-if="items.length > 0"
        id="bgColorResults"
        v-model:selected="modelDataTable"
        :headers="headers"
        :items="ppnFiltered"
        :loading="loading"
        :mobile="xs || isMobileForced"
        class="borderBlocElements"
        density="compact"
        item-key="ppn"
        loading-text="Chargement..."
        select-mode="single"
        @update:current-items="sendItemsToParent"
    >
      <template v-slot:headers="{ columns : headers , toggleSort, isSorted, getSortIcon }">
        <tr>
          <th v-for="header in headers" :key="header.key" class="text-left">
            <div class="d-flex align-center">
              <span
                  class="cursor-pointer"
                  style='color: white; display: block'
                  @click="toggleSort(header)"
              >
                  {{ header.title }}
                <v-icon
                    v-if="isSorted(header)"
                    class="ml-1"
                    size="small"
                >
                  {{ getSortIcon(header) }}
                </v-icon>
                <v-icon v-else class="ml-1"
                        color="white" size="small">mdi-sort</v-icon>
              </span>
              <template v-if="header.key === 'typeDocument'">
                <v-menu offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn class="bouton-simple" icon size="x-small" style="text-decoration: none;" v-bind="props"
                           variant="text">
                      <v-icon :color="colorIconFilterTypeDoc()" color="white" size="small">
                        mdi-filter
                      </v-icon>
                    </v-btn>
                  </template>
                  <div class="pr-8 pb-4" style='background-color:white;color: black;'>
                    <v-btn v-for="type in selectType" :key="type.id" class="d-block" variant="plain"
                           @click="eventTypeChoice(type)">
                      <v-checkbox v-model="selectedCheckbox" :label="type" :value="type"></v-checkbox>
                    </v-btn>
                  </div>
                </v-menu>
              </template>
            </div>
          </th>
        </tr>
      </template>
      <template v-slot:item="{ item }">
        <tr v-if="(xs || isMobileForced)" :class="classItemMasked(item)" @click="sendCurrentPpnToParent($event, item)">
          <td colspan="100%">
            <v-row class="ma-0 py-2 d-flex align-center justify-space-between" >
              <div>
                Aff/Masq.
              </div>
              <div>
                <v-checkbox
                    v-model="item.affiche"
                    class=" align-self-center"
                    color="#CF4A1A"
                    density="compact"
                    false-icon="mdi-eye-off-outline"
                    hide-details
                    true-icon="mdi-eye"
                ></v-checkbox>
              </div>
            </v-row>
            <v-row class="ma-0 py-2 d-flex align-center justify-space-between">
              <div>
                PPN
              </div>
              <div>
                {{ item.ppn }}
              </div>
            </v-row>
            <v-row class="ma-0 py-2 d-flex align-center justify-space-between">
              <div>
                Type de document
              </div>
              <div>
                {{ item.typeDocument }}
              </div>
            </v-row>
            <v-row class="ma-0 py-2 d-flex align-center justify-space-between">
              <div>
                Nb. erreurs
              </div>
              <div>
                {{ item.nberreurs }}
              </div>
            </v-row>
          </td>
        </tr>
        <tr v-else :class="classItemMasked(item)" @click="sendCurrentPpnToParent($event, item)">
          <td>
            <v-checkbox
                v-model="item.affiche"
                class=" align-self-center"
                color="#CF4A1A"
                density="compact"
                false-icon="mdi-eye-off-outline"
                hide-details
                true-icon="mdi-eye"
            ></v-checkbox>
          </td>
          <td>
            {{ item.ppn }}
          </td>
          <td>
            {{ item.typeDocument }}
          </td>
          <td>
            {{ item.nberreurs }}
          </td>
        </tr>
      </template>
      <template v-slot:body.append>
        <tr>
          <td colspan="100%">
            <v-row class="ma-0">
              <v-col
                  :sm="isMobileForced ? 12 : 5" cols="12"
              >
                <v-row class="d-flex align-center justify-start py-4">
                  <v-checkbox
                      v-model="allDisplayed"
                      class="d-flex align-center pr-2"
                      color="#CF4A1A"
                      density="compact"
                      false-icon="mdi-eye-off-outline"
                      true-icon="mdi-eye"
                      @change="toggleMask"
                  />
                  <span>Afficher/masquer tout</span>
                </v-row>
              </v-col>
              <v-col
                  :sm="isMobileForced ? 12 : 7" cols="12"
              >
                <v-row class="d-flex align-center
                flex-row-reverse flex-sm-row
                justify-end justify-md-end
                py-4">
                  <span class="px-2">Générer la requête pour WinIBW</span>

                  <bouton-winibw :isDisabled="isWinibwButtonDisabled()" :ppnList="getPpnList()"
                                 @onClick="displayPopup"></bouton-winibw>
                </v-row>
              </v-col>
            </v-row>
          </td>
        </tr>
      </template>
      <template v-slot:bottom>
        <v-data-table-footer
            :items-per-page-options="[5, 10, 20, 30, -1]"
        />
      </template>
    </v-data-table>
    <bloc-aucune-donnee v-else>
      Les PPN en entrée ne comportent aucune erreur ou n’ont pas été trouvés dans le Sudoc.
      Reportez-vous au bloc “Récapitulatif” pour plus de détails.
    </bloc-aucune-donnee>
    <PopupRequestWinibw :dialog="dialog" :winibwRequest="winibwRequest" @onClose="setDialog"></PopupRequestWinibw>
  </v-container>
</template>

<script setup>
import {getCurrentInstance, onMounted, ref, watchEffect} from "vue"
import {useResultatStore} from "@/stores/resultat";
import BoutonWinibw from "@/components/BoutonWinibw";
import PopupRequestWinibw from "@/components/resultats/PopupRequestWinibw";
import QualimarcService from "@/service/QualimarcService";
import BlocAucuneDonnee from "@/components/BlocAucuneDonnee";
import {useDisplay} from "vuetify/framework";

const resultatStore = useResultatStore();
const serviceApi = QualimarcService;

const emit = defineEmits(['onChangePpn', 'onChangeItems']);
const props = defineProps({currentPpn: String, nbLancement: Number, isMobileForced: Boolean});

const size = '';
const headers = [
  {title: "Aff/Masq.", key: "affiche", width: 80, headerProps: {class: "headerTableClass"}},
  {title: "PPN", key: "ppn", width: 80, headerProps: {class: "headerTableClass"}},
  {title: "Type de document", key: "typeDocument", width: 140, headerProps: {class: "headerTableClass"}},
  {title: "Nb. erreurs", key: "nberreurs", width: 100, headerProps: {class: "headerTableClass"}}
];
const loading = ref(false);
const items = ref([]);
const winibwRequest = ref('null');
const dialog = ref(false);
const selectType = ref([]);
const selectedTypeDoc = ref(new Array("Tous"));
const ppnFiltered = ref([]);
let itemsSortedAndFiltered = [];
const modelDataTable = ref([]);
const selectedCheckbox = ref([]);
const {xs, smAndDown, mdAndDown, mdAndUp, name: breakPointName} = useDisplay()
const allDisplayed = ref(true);

onMounted(() => {
  feedItems();
  feedTypeList();
  nextSelectedItem();
})

watchEffect(() => {
  if (props.currentPpn) {
    updateItemSelected(props.currentPpn)
  }
  if (props.nbLancement) {
    feedItems()
  }
})

function nextSelectedItem() {
  let index = itemsSortedAndFiltered.findIndex(item => item.ppn === props.currentPpn);
  if (index < itemsSortedAndFiltered.length - 1) {
    emit('onChangePpn', itemsSortedAndFiltered[index + 1].ppn);
  }
}

function previousSelectedItem() {
  let index = itemsSortedAndFiltered.findIndex(item => item.ppn === props.currentPpn);
  if (index > 0) {
    emit('onChangePpn', itemsSortedAndFiltered[index - 1].ppn);
  }
}

function focusOnFirstElement() {
  nextSelectedItem()
}

function goToPreviousLine() {
  previousSelectedItem()
}

function goToNextLine() {
  nextSelectedItem()
}


function colorIconFilterTypeDoc() {
  if (selectedCheckbox.value[0] === "Tous" || selectedCheckbox.value === "Tous" || selectedCheckbox.value.length === 0) {
    return 'white';
  } else return '#FFC1AB';
}

/**
 * fonction permetant de recuperer les ppns du store
 */
function feedItems() {
  loading.value = true;
  items.value = [];
  resultatStore.getResultsList.forEach((el) => {
    if (el.detailerreurs)
      items.value.push({
        affiche: true,
        ppn: el.ppn,
        typeDocument: el.typeDocument,
        nberreurs: el.detailerreurs.length
      })
  });
  itemsSortedAndFiltered = items.value;
  ppnFiltered.value = items.value;
  loading.value = false;
}

/**
 * Fonction permettant de récupérer les PPN pour la création de la requête WINIBW
 */
function getPpnList() {
  let ppnList = [];
  let listItems = (ppnFiltered.value.length === 0 || selectedTypeDoc.value === "Tous") ? items.value : ppnFiltered.value;
  listItems.forEach(item => {
    ppnList.push(item.ppn);
  });
  return ppnList;
}

/**
 * Fonction permettant d'initialiser les listes de types de documents affichés dans le filtre
 */
function feedTypeList() {
  selectType.value.push("Tous");
  serviceApi.getFamillesDocuments()
      .then((response) => {
        response.data.forEach((el) => selectType.value.push(el.libelle));
      }).catch((error) => {
    //TODO : emit erreur si impossible de récupérer les types via appel axios
    //emitOnError(error);
  });
}

/**
 * Fonction permettant d'afficher une popup contenant la requête WinIBW
 */
function displayPopup(request) {
  winibwRequest.value = request;
  dialog.value = true;
}

/**
 * Fonction permettant de savoir si le bouton de génération de la requête winibw est désactivé
 */
function isWinibwButtonDisabled() {
  return ppnFiltered.value.length === 0;
}

/**
 * Fonction permettant de récupérer l'état d'ouverture de la popup de requête Winibw
 */
function setDialog(onClose) {
  dialog.value = onClose;
}

/**
 * Fonction qui renvoi un style de class pour griser les items masquées
 * @param item
 * @return {{masked: boolean, showed: (boolean|*)}}
 */
function classItemMasked(item) {
  return {
    mobile: xs.value,
    selected: modelDataTable.value.some(sel => sel.ppn === item.ppn),
    showed: item.affiche,
    masked: !item.affiche,
  }
}

/**
 * Fonction renvoyant le ppn de la ligne sélectionné vers le composant parent
 */
function sendCurrentPpnToParent(event, item) {
  console.log(classItemMasked(item))
  const alreadySelected = modelDataTable.value.some(sel => sel.ppn === item.ppn)
  modelDataTable.value = alreadySelected ? [] : [item]
  emit("onChangePpn", item.ppn);
}

function sendItemsToParent(complexItems) {
  console.log(complexItems)
  itemsSortedAndFiltered = complexItems.map(item => item.columns);
  emit("onChangeItems", items);
}

/**
 * Function qui permet de récupérer le selectedTypeDoc de document sélectionné
 * et de modifier la liste de selectedTypeDoc de document
 * @param type
 */
function eventTypeChoice(type) {
  if (type === "Tous") {
    selectedTypeDoc.value = new Array(type);
  } else {
    if (selectedTypeDoc.value.length > 0) {
      if (selectedTypeDoc.value.indexOf("Tous") >= 0) { //  Si un "Tous" est présent dans le selectedTypeDoc
        selectedTypeDoc.value.splice(selectedTypeDoc.value.indexOf("Tous"), 1);
      }
      if (selectedTypeDoc.value.indexOf(type) === -1) {  //  Ajout un selectedTypeDoc s'il n'est pas déjà dans la liste selectedTypeDoc
        selectedTypeDoc.value.push(type);
      } else if (selectedTypeDoc.value.indexOf(type) >= 0) { //  Supprime un selectedTypeDoc coché lorsque l'on clique de nouveau sur lui
        selectedTypeDoc.value.splice(selectedTypeDoc.value.indexOf(type), 1);
        if (selectedTypeDoc.value.length === 0) { //  si le dernier typeDoc est déselectionné, on insère la valeur "Tous"
          selectedTypeDoc.value.push("Tous");
        }
      }
    } else {
      selectedTypeDoc.value = new Array(type);
    }
  }
  selectedCheckbox.value = selectedTypeDoc.value;
  filterPpnByType();
}

/**
 * Function qui permet de trier la liste de item à afficher dans la dataTable
 * en fonction du.des types de documents
 * sélectionnés
 */
function filterPpnByType() {
  if (selectedTypeDoc.value.indexOf("Tous") >= 0) { //  Si le selectedTypeDoc choisi est tous
    ppnFiltered.value = items.value;
  } else if (selectedTypeDoc.value.length >= 1 && selectedTypeDoc.value.indexOf("Tous") === -1) {  //  Si le selectedTypeDoc choisi n'est pas "Tous"
    ppnFiltered.value = new Array(0);
    let tempRulesFilterByTypeDocList = new Set();
    for (let i = 0; i < selectedTypeDoc.value.length; i++) {
      let tempList = items.value.filter(item => {
        return item['typeDocument'].toLocaleLowerCase().includes(selectedTypeDoc.value[i].toString().toLocaleLowerCase())
      });
      tempList.forEach(item => {
        tempRulesFilterByTypeDocList.add(item);
      })
    }
    tempRulesFilterByTypeDocList.forEach(item => {
      ppnFiltered.value.push(item)
    })
  } else if (selectedTypeDoc.value.length === 0) { //  Si aucun selectedTypeDoc n'est sélectionné
    ppnFiltered.value = items.value;
    selectedTypeDoc.value = selectedCheckbox.value = new Array("Tous");
  }
}

function updateItemSelected(ppn) {
  let itemByType = ppnFiltered.value;
  modelDataTable.value = [];
  modelDataTable.value.push(itemByType[itemByType.map(item => item.ppn).indexOf(ppn)]);
}

/**
 * Fonction qui permet d'afficher ou de masquer toutes les lignes
 * @param value
 */
function toggleMask() {
  console.log(allDisplayed.value)
  ppnFiltered.value.forEach(item => {
    item.affiche = allDisplayed.value;
  })
}

</script>
<style>
.masked {
  color: lightgrey;
  background-color: whitesmoke;
}

.showed {
  color: #252C61;
  font-weight: bold;
}

.headerTableClass {
  color: white;
  background-color: #676C91;
}

.selected {
  background: #DADCE7 !important;
}

.mobile {
  height: auto;
  min-height: 48px
}

tr:not(.selected):hover {
  background-color: #eaeaea; /* gris clair au survol */
  cursor: pointer;
}
</style>
