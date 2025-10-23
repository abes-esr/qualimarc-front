<template>
  <v-container class="ma-0 pa-0">
    <!--  TODO  <span v-shortkey="{up: ['arrowup'], left: ['arrowleft']}" @shortkey="goToPreviousLine()"></span>-->
    <!--  TODO  <span v-shortkey="{down: ['arrowdown'], right: ['arrowright']}" @shortkey="goToNextLine()"></span>-->
    <v-row class="ma-0 pa-0">
      <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Liste des PPN avec erreurs</h1>
    </v-row>
    <v-data-table
        v-if="items.length > 0"
        id="bgColorResults"
        v-model:selected="modelDataTable"
        :headers="headers"
        :item-class="classItemMasked"
        :items="ppnFiltered"
        :loading="loading"
        :mobile-breakpoint="resizeDataTable()"
        class="borderBlocElements"
        density="compact"
        item-key="ppn"
        loading-text="Chargement..."
        select-mode="single"
        @click:row="sendCurrentPpnToParent"
        @update:items="sendItemsToParent"
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


      <!--      ffffffffffffffffffffffffffffffffffffff -->
      <template #item="{ item }">
        <tr @click="console.log(item)" :class="classItemMasked(item)">
          <td>
            <v-checkbox
                v-model="item.affiche"
                color="#CF4A1A"
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
            <!--      Affichage en mode mobile      -->
            <div
                v-if="(mobileBreakpoint === 4000 && breakPointName === 'xl') || (mobileBreakpoint === 4000 && breakPointName === 'lg') || breakPointName === 'xs'"
                class="d-flex flex-column">
              <div class="pl-3 d-flex align-center justify-start">
                <v-checkbox color="#CF4A1A" false-icon="mdi-eye-off-outline" input-value="1" true-icon="mdi-eye"
                            @change="toggleMask"/>
                <span>Afficher/masquer tout</span>
              </div>
              <div class="mb-4 d-flex align-center justify-start">
                <bouton-winibw :isDisabled="isWinibwButtonDisabled()" :ppnList="getPpnList" class="mr-2"
                               @onClick="displayPopup"></bouton-winibw>
                <span>Générer la requête pour WinIBW</span>
              </div>
            </div>
            <!--      Affichage en mode pc      -->
            <div v-else class="d-flex justify-space-between">
              <div class="d-flex align-center mr-4">
                <v-checkbox color="#CF4A1A" false-icon="mdi-eye-off-outline" input-value="1" true-icon="mdi-eye"
                            @change="toggleMask"/>
                <span>Afficher/masquer tout</span>
              </div>
              <div class="d-flex align-center">
                <span class="pr-1">Générer la requête pour WinIBW</span>
                <bouton-winibw :isDisabled="isWinibwButtonDisabled()" :ppnList="getPpnList()"
                               @onClick="displayPopup"></bouton-winibw>
              </div>
            </div>
          </td>
        </tr>
      </template>
      <template #bottom>
        <v-data-table-footer
            :items-per-page-options="[5, 10, 20, 30, -1]"
        />
      </template>
    </v-data-table>
    <bloc-aucune-donnee v-else>Les PPN en entrée ne comportent aucune erreur ou n’ont pas été trouvés dans le Sudoc.
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
const props = defineProps({currentPpn: String, nbLancement: Number, mobileBreakpoint: Number});

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
let itemsTrieAndFiltered = [];
const modelDataTable = ref([]);
const selectedCheckbox = ref([]);
const {mdAndDown, name: breakPointName} = useDisplay()

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
  let index = itemsTrieAndFiltered.findIndex(item => item.ppn === props.currentPpn);
  if (index < itemsTrieAndFiltered.length - 1) {
    emit('onChangePpn', itemsTrieAndFiltered[index + 1].ppn);
  }
}

function previousSelectedItem() {
  let index = itemsTrieAndFiltered.findIndex(item => item.ppn === props.currentPpn);
  if (index > 0) {
    emit('onChangePpn', itemsTrieAndFiltered[index - 1].ppn);
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
  items.value = Array.of([]);
  resultatStore.getResultsList.forEach((el) => {
    if (el.detailerreurs)
      items.value.push({
        affiche: true,
        ppn: el.ppn,
        typeDocument: el.typeDocument,
        nberreurs: el.detailerreurs.length
      })
  });
  itemsTrieAndFiltered = items.value;
  ppnFiltered.value = items.value;
  loading.value = false;
}

/**
 * Fonction permettant de récupérer les PPN pour la création de la requête WINIBW
 */
function getPpnList() {
  let ppnList = Array.of([]);
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
    showed: item.affiche,
    masked: !item.affiche,
  }
}

/**
 * Fonction renvoyant le ppn de la ligne sélectionné vers le composant parent
 */
function sendCurrentPpnToParent(event, row) {
  row.toggleSelect(row.item);
  emit("onChangePpn", row.item.ppn);
}

function sendItemsToParent(items) {
  itemsTrieAndFiltered = items;
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
function toggleMask(value) {
  items.value.forEach(item => {
    item.affiche = value;
  })
}

/**
 * Fonction qui permet de récupérer la valeur du breakpoint de vuetify
 * et adapte l'affichage de la dataTable (mobile ou pc)
 * @returns {InferPropType<Number | NumberConstructor>|number}
 */
function resizeDataTable() {
  const instance = getCurrentInstance();

  if (mdAndDown) {
    return 200;
  } else {
    return props.mobileBreakpoint;
  }
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

.theme--light.v-data-table tbody tr.v-data-table__selected {
  background: #DADCE7 !important;
}

.theme--dark.v-data-table tbody tr.v-data-table__selected {
  background: #DADCE7 !important;
}

.theme--dark.v-data-table tbody tr.v-data-table__selected:hover {
  background: #DADCE7 !important;
}

.theme--light.v-data-table tbody tr.v-data-table__selected:hover {
  background: #DADCE7 !important;
}
</style>
