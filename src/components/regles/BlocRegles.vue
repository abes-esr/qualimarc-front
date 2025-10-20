<template>
  <v-container align-items="center" style="min-width: 90%">
    <!--      BLOC TITRE     -->
    <v-row class="mb-2 px-4" justify="space-between">
      <!--      TITRE     -->
      <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Table générale des règles</h1>
      <!--      BOUTON TELECHARGER LES REGLES     -->
      <v-tooltip left>
        <template v-slot:activator="{ props }">
          <v-btn class="ma-0" elevation="0" :disabled="items.length === 0" small v-bind="props" color="#0c5c92">
            <download-csv :delimiter="';'" :data="items" name="qualimarc-export-regles.csv" style="color: white">
              <span style="color: white">TÉLÉCHARGER TOUTES LES R&Egrave;GLES</span>
            </download-csv>
            <v-icon small color="white" class="ml-2">mdi-download</v-icon>
          </v-btn>
        </template>
        <span>Télécharger toutes les règles dans un fichier nommé "qualimarc-export-rules.csv"</span>
      </v-tooltip>
    </v-row>

    <!--      FORMATAGE DES BORDURES      -->
    <div style="border-top: #252C61 solid 4px">

      <!--      BLOC AFFICHAGE DES FILTRES ET BOUTONS SUPPRESSION DES FILTRES      -->
      <v-row class="mx-4 my-2" justify="center">
        <!--            BOUTON EFFACER LES FILTRES-->
        <v-tooltip left>
          <template v-slot:activator="{ props }">
            <v-btn class="ma-0" append-icon="mdi-filter-remove" small outlined color="#b30900" @click="resetSelector()" v-bind="props">
              Effacer tous les filtres
            </v-btn>
          </template>
          <span>Effacer tous les filtres actifs</span>
        </v-tooltip>
      </v-row>
      <!--      AFFICHAGE DES FILTRES SELECTIONNES      -->
      <v-row class="ma-0 pa-0 mb-2" justify="center">
        <span class="ma-0 pa-0 mr-2" style="font-size: 0.8em; color: #252C61; font-style: italic">
          <span>Type de document :</span>
          <span style="color: #595959">{{ selectedTypeDoc.toString() }}</span>
           --
          <span>Type de règle :</span>
          <span style="color: #595959">{{ selectedPriority.toString() }}</span>
        </span>
      </v-row>

      <!--      CADRE DE LA DATA TABLE      -->
      <div style="border: #252C61 solid 1px">
      <!--      DATA TABLE      -->
        <v-data-table id="bgColorIdColumnRulesTable"
                      class="pa-0 ma-0"
                      :headers="headers"
                      loading-text="Chargement..."
                      :loading="isLoading"
                      :items="rulesFiltered"
                      :item-class="classItemPriority"
                      :search="ruleMessage"
                      :custom-filter="searchByMessage"
                      single-select
                      item-key="id"
                      dense
        >
          <!--      REMPLISSAGE DU HEADER     -->
          <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ headers }">
            <!--      HEADER ID     -->
            <v-tooltip bottom v-if="header.value === 'id'">
              <template v-slot:activator="{ props }">
                <span v-bind="props" style='color: white; display: block'>{{ header.textBtn }}</span>
              </template>
              <span>{{ header.tooltip}}</span>
            </v-tooltip>
            <!--      HEADER REGLE DE VERIFICATION      -->
            <span v-if="header.value === 'message'" style='margin-top: 28px; color: white; display: block'>
                {{ header.text }}
            </span>
            <!--      AUTRES HEADER      -->
            <span v-if="header.value !== 'message' && header.value !== 'id'" style='color: white; display: block'>
                {{ header.text }}
            </span>
            <!--      CHAMP DE RECHERCHE COLONNE "Règles de vérification / qualité"     -->
            <v-menu class="ma-0 pa-0" offset-y v-if="header.value === 'message'">
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-model="ruleMessage"
                    label="rechercher par mot-clé"
                    class="ma-0 pa-0 tetxFieldRegles"
                    height="26px"
                    dense
                    solo
                    style="color: #595959; font-weight: 400; font-style: italic; font-size: 1.2em"
                ></v-text-field>
              </template>
            </v-menu>
            <!--      ICONES DE TRI POUR LES ID, TYPE DOCUMENTS ET TYPE REGLES      -->
            <v-menu offset-y v-if="header.value === 'id' || header.value === 'typeDoc' || header.value === 'priority'">
              <template v-slot:activator="{ props }">
                <v-btn text class="bouton-simple" x-small v-bind="props" style="text-decoration: none;" :aria-label="header.value">
                  <span>
                    <v-icon v-if="header.value === 'typeDoc'" small :color="colorIconFilterTypeDoc()">
                      mdi-filter
                    </v-icon>
                  </span>
                  <span>
                    <v-icon v-if="header.value === 'id'" small :color="colorIconFilterId()">
                      mdi-filter
                    </v-icon>
                  </span>
                  <span>
                    <v-icon v-if="header.value === 'priority'" small :color="colorIconFilterPriority()">
                      mdi-filter
                    </v-icon>
                  </span>
                </v-btn>
              </template>
              <div style='background-color:white;color: black;' class="pl-4 pr-8" v-if="header.value === 'typeDoc'">
                <v-btn class="d-block" plain v-for="ruleTypeDoc in listSelectedRulesTypeDoc" :key="ruleTypeDoc.value" @click="eventTypeChoice(ruleTypeDoc) ">
                  <v-checkbox v-model="selectedCheckbox" :label="ruleTypeDoc" :value="ruleTypeDoc"></v-checkbox>
                </v-btn><div style="height: 30px"></div>
              </div>
              <div style='background-color:white;color: black;' class="pl-4 pr-8" v-if="header.value === 'id'">
                <v-btn class="d-block" plain v-for="ruleId in listSelectedRulesId" :key="ruleId.value" @click="filterRulesById(ruleId)">
                  {{ ruleId }}
                </v-btn>
              </div>
              <div style='background-color:white;color: black;' class="pl-4 pr-8" v-if="header.value === 'priority'">
                <v-btn class="d-block" plain v-for="rulePriority in listSelectedRulesPriority" :key="rulePriority.value" @click="(selectedPriority = rulePriority) && filterRulesByPriority(rulePriority)">
                  {{ rulePriority }}
                </v-btn>
              </div>
            </v-menu>
            <!--      SUPPRESSION DE L'ICONE DE TRI COLONNE "Règle de vérification / qualité"     -->
            <v-icon color="white" small v-if="header.value !== 'message'">mdi-sort</v-icon>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import {ref, onMounted} from "vue";
import QualimarcService from "@/service/QualimarcService";

const serviceApi = QualimarcService;
let headers = [
  { text: "", value: "id", class: "headerTableClass", width: 20, textBtn: "ID règle", tooltip: "Les identifiants des règles sont générés automatiquement et sont donnés à titre informatif"},
  { text: "Zone UNM 1", value: "zoneUnm1", class: "headerTableClass", width: 30},
  { text: "Zone UNM 2", value: "zoneUnm2", class: "headerTableClass", width: 30},
  { text: "Type de document concerné par la règle", value: "typeDoc", class: "headerTableClass", width: 160},
  { text: "Règle de vérification", value: "message", class: "headerTableClass", width: 200, sortable : false},
  { text: "Type de règle", value: "priority", class: "headerTableClass", width: 50}
];
const items = ref([]);
const listSelectedRulesId = ref([]);
const selectedTypeDoc = ref(new Array("Tous"));
const listSelectedRulesTypeDoc = ref([]);
const listSelectedRulesPriority = ref([]);
const ruleMessage = ref(null);
const isLoading = ref(true);
const rulesFiltered = ref([]);
const selectedCheckbox = ref(["Tous"]);
const selectedPriority = ref("Toutes");
const selectedId = ref("Tous");

onMounted(() => {
  feedItems();
  feedTypeList();
  feedRulesPriorityList();
  resetSelector();
})

function resetSelector() {
  selectedTypeDoc.value = new Array("Tous");
  rulesFiltered.value = items.value;
  selectedCheckbox.value = "Tous";
  selectedPriority.value = "Toutes";
  selectedId.value = "Tous";
}

function colorIconFilterTypeDoc() {
  if (selectedCheckbox.value[0] === "Tous" || selectedCheckbox.value === "Tous" || selectedCheckbox.value.length === 0) {
    return 'white';
  } else return '#FFC1AB';
}

function colorIconFilterId() {
  if (selectedId.value === "Tous") {
    return 'white';
  } else return '#FFC1AB';
}

function colorIconFilterPriority() {
  if (selectedPriority.value === "Toutes") {
    return 'white';
  } else return '#FFC1AB';
}

/**
 * Fonction qui permet de faire la correspondance entre la saisie de l'utilisateur et les items
 * @param value renvoie les valeurs de toutes les cases du dataTable qui contienne la recherche (n'est pas utilisé ici, mais obligation de le laisser)
 * @param search la saisie de l'utilisateur
 * @param item les items qui match avec la saisie de l'utilisateur
 * @returns {boolean} valeur de retour
 */
function searchByMessage (value, search, item) {
  return item.message != null &&
      ruleMessage != null &&
      typeof item.message === 'string' &&
      item.message.toString().toLocaleUpperCase().indexOf(search.toLocaleUpperCase()) !== -1
}

/**
 * fonction permetant de recuperer la liste des règles
 */
function feedItems(){
  isLoading.value = true;
  items.value = [];
  serviceApi.getRules()
      .then((response) => {
        response.data.forEach((el) => items.value.push(el));
        feedIdList();
        isLoading.value = false;
      }).catch((error) => {
    //TODO : emit erreur si impossible de récupérer les types via appel axios
    //emitOnError(error);
        isLoading.value = false;
  });
}

/**
 * Fonction qui modifie la class de l'item sélectionné en fonction de sa priorité
 * @param item
 * @returns {{essentielle: String, avancee: String}}
 */
function classItemPriority(item){
  return {
    essentielle: item.priority === 'Essentielle',
    avancee: item.priority === 'Avancée',
  }
}

/**
 * Fonction permettant d'initialiser les listes de types de documents affichés dans le filtre
 */
function feedTypeList() {
  listSelectedRulesTypeDoc.value.push("Tous");
  serviceApi.getFamillesDocuments()
      .then((response) => {
        response.data.forEach((el) => listSelectedRulesTypeDoc.value.push(el.libelle));
      }).catch((error) => {
  });
}

/**
 * Fonction permettant de remplir le liste d'Id affichés dans le filtre
 */
function feedIdList() {
  listSelectedRulesId.value.push("Tous");
  for(let i = 0; i < items.value.length; i++) {
    listSelectedRulesId.value.push(items.value[i].id);
  }
}

/**
 * Fonction permettant de remplir le liste des règles de priorité affichées dans le filtre
 */
function feedRulesPriorityList() {
  listSelectedRulesPriority.value.push("Toutes");
  listSelectedRulesPriority.value.push("Essentielle");
  listSelectedRulesPriority.value.push("Avancée");
}

/**
 * Fonction qui permet d'afficher les typeDoc sélectionnés par l'utilisateur
 * @param type l'élément sélectionné
 * @returns {*[] | []} appelle la fonction d'affichage des Id sélectionnés par l'utilisateur
 */
function eventTypeChoice(type) {
  if (type === "Tous") {
    selectedTypeDoc.value = new Array(type);
  } else {
    if (selectedTypeDoc.value.length > 0) {
      if (selectedTypeDoc.value.indexOf("Tous") >= 0) { //  Si un "Tous" est présent dans le selectedTypeDoc
        selectedTypeDoc.value.splice(selectedTypeDoc.value.indexOf("Tous"), 1);
      }
      if (selectedTypeDoc.value.indexOf(type) === -1) {  //  Ajout un typeDoc s'il n'est pas déjà dans la liste selectedTypeDoc
        selectedTypeDoc.value.push(type);
      } else if (selectedTypeDoc.value.indexOf(type) >= 0) { //  Supprime un typeDoc coché lorsque l'on clique de nouveau sur lui
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
  filterRulesByTypeDoc();
}

/**
 * Fonction qui permet d'afficher une règle selon l'id sélectionné par l'utilisateur
 * @param ruleId l'id sélectionné
 * @returns {UnwrapRef<[]>}
 */
function filterRulesById(ruleId) {
  selectedTypeDoc.value = selectedCheckbox.value = new Array("Tous");
  selectedPriority.value = "Toutes";
  selectedId.value = ruleId;
  if (ruleId !== "Tous") {
    rulesFiltered.value = items.value.filter(item => {
      return item.id === ruleId;
    });
  } else if (ruleId === "Tous") {
    rulesFiltered.value = items.value;
  }
}

/**
 * Function qui permet de filtrer par type de document
 * @returns {Ref<UnwrapRef<[]>>}
 */
function filterRulesByTypeDoc(){
  if ( (selectedPriority.value === "Toutes") && (selectedTypeDoc.value.indexOf("Tous") >= 0) ) {  //  si aucune priorité n'a été sélectionné et typeDoc === Tous
      rulesFiltered.value = items.value;
      selectedTypeDoc.value = new Array("Tous");
  } else if ( (selectedPriority.value === "Toutes") && (selectedTypeDoc.value.indexOf("Tous") === -1) ) {  //  si aucun priorité n'a été sélectionnée et typeDoc !== Tous
    filterSelectedTypeDocTrueAndSelectedPriorityTrue();
  } else if ( (selectedPriority.value !== "Toutes") && (selectedTypeDoc.value.indexOf("Tous") >= 0) ) {  //  si une priorité a été sélectionnée et typeDoc === Tous
    rulesFiltered.value = items.value.filter(rule => {
      return rule['priority'].toString().toLocaleLowerCase() === selectedPriority.value.toString().toLocaleLowerCase();
    });
  } else if ( (selectedPriority.value !== "Toutes") && (selectedTypeDoc.value.indexOf("Tous") === -1) ) {  //  si une priorité a été sélectionnée et typeDoc !== Tous
    //  Vide la liste
    rulesFiltered.value = new Array(0);
    //  Tri par priorité
    let tempRulesListPriority = items.value.filter(rule => {
      return rule['priority'].toString().toLocaleLowerCase() === selectedPriority.value.toString().toLocaleLowerCase();
    });
    rulesFiltered.value = new Array(0);
    tempRulesListPriority.forEach(tempRule => {
      rulesFiltered.value.push(tempRule)
    });
    // Tri par typeDoc
    let tempRulesFilterByTypeDocList = new Set();
    for(let i = 0; i < selectedTypeDoc.value.length; i++) {
      let tempList = rulesFiltered.value.filter(item => {
        return item['typeDoc'].toLocaleLowerCase().includes(selectedTypeDoc.value[i].toString().toLocaleLowerCase())
      });
      tempList.forEach(item => {
        tempRulesFilterByTypeDocList.add(item);
      })
    }
    rulesFiltered.value = new Array(0); //  vide la liste
    tempRulesFilterByTypeDocList.forEach(item => {
      rulesFiltered.value.push(item)
    })
  }
}

/**
 * Function qui permet de filtrer par priorité
 * @param priority la priorité choisie par l'utilisateur
 * @returns {Ref<UnwrapRef<[]>>}
 */
function filterRulesByPriority(priority) {
  selectedId.value = "Tous";
  if ((selectedTypeDoc.value.indexOf("Tous") >= 0) && (priority.toString() === "Toutes")) { //  si aucun type de document n'a été sélectionné au préalable et priorité "Toutes"
    rulesFiltered.value = items.value;
  } else if ((selectedTypeDoc.value.indexOf("Tous") >= 0) && (priority.toString() !== "Toutes")) {  //  si aucun type de document n'a été sélectionné au préalable et priorité différente de "Toutes"
    rulesFiltered.value = items.value.filter(rule => {
      return rule['priority'].toString().toLocaleLowerCase() === priority.toString().toLocaleLowerCase();
    });
  } else if ((selectedTypeDoc.value.indexOf("Tous") === -1) && (priority.toString() !== "Toutes")) {  //  si un/des type.s de document a/ont été sélectionné.s au préalable et priorité différente de "Toutes"
    filterSelectedTypeDocTrueAndSelectedPriorityTrue();
    let tempRulesList = rulesFiltered.value.filter(rule => {
      return rule['priority'].toString().toLocaleLowerCase() === priority.toString().toLocaleLowerCase();
    });
    rulesFiltered.value = new Array(0);
    tempRulesList.forEach(tempRule => {
      rulesFiltered.value.push(tempRule)
    });
  } else if ((selectedTypeDoc.value.indexOf("Tous") === -1) && (priority.toString() === "Toutes")) {  //  si un/des type.s de document a/ont été sélectionné.s au préalable et priorité "Toutes"
    filterRulesByTypeDoc();
  }
}

/**
 * Function qui permet de vider la liste des règles filtrées puis de trier la liste des items en fonction
 * des typeDoc sélectionnés, puis de mettre chaque item dans la liste des règles filtrées
 */
function filterSelectedTypeDocTrueAndSelectedPriorityTrue() {
  rulesFiltered.value = new Array(0);
  let tempRulesFilterByTypeDocList = new Set();
  for(let i = 0; i < selectedTypeDoc.value.length; i++) {
    let tempList = items.value.filter(item => {
      return item['typeDoc'].toLocaleLowerCase().includes(selectedTypeDoc.value[i].toString().toLocaleLowerCase())
    });
    tempList.forEach(item => {
      tempRulesFilterByTypeDocList.add(item);
    })
  }
  tempRulesFilterByTypeDocList.forEach(item => {
    rulesFiltered.value.push(item)
  })
}

</script>

<style>

.essentielle{
  font-weight: 400;
}

.avancee{
  font-weight: 400;
}

</style>
