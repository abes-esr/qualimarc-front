<template>
  <v-container align-items="center" style="min-width: 90%">
    <!--      BLOC TITRE     -->
    <v-row class="mb-2 px-4" justify="space-between">
      <!--      TITRE     -->
      <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Table générale des règles</h1>
      <!--      BOUTON TELECHARGER LES REGLES     -->
      <v-tooltip location="start">
        <template v-slot:activator="{ props }">
          <DownloadCsv
              :data="items"
              :disabled="items.length === 0"
              delimiter=";"
              name="qualimarc-export-regles.csv"
              size="small"
              style="color: white"
              v-bind="props">
            <span style="color: white">TÉLÉCHARGER TOUTES LES R&Egrave;GLES</span>
            <v-icon class="ml-2" color="white" size="small">mdi-download</v-icon>
          </DownloadCsv>
        </template>
        <span>Télécharger toutes les règles dans un fichier nommé "qualimarc-export-rules.csv"</span>
      </v-tooltip>
    </v-row>
    <!--      FORMATAGE DES BORDURES      -->
    <div style="border-top: #252C61 solid 4px">

      <!--      BLOC AFFICHAGE DES FILTRES ET BOUTONS SUPPRESSION DES FILTRES      -->
      <v-row class="mx-4 my-2" justify="center">
        <!--            BOUTON EFFACER LES FILTRES-->
        <v-tooltip location="start">
          <template v-slot:activator="{ props }">
            <v-btn append-icon="mdi-filter-remove" class="ma-0" color="#b30900" size="small" v-bind="props"
                   variant="outlined" @click="resetSelector()">
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
                      :headers="headers"
                      :items="filteredItems"
                      :loading="isLoading"
                      class="pa-0 ma-0"
                      dense
                      item-key="id"
                      loading-text="Chargement..."
                      single-select
        >
          <!--      REMPLISSAGE DU HEADER     -->
          <template v-slot:headers="{ columns : headers , toggleSort, isSorted, getSortIcon }">
            <tr>
              <th v-for="header in headers" :key="header.key" class="text-left"
                  @click="header.sortable ? toggleSort(header):'';">
                <div :style="header.key === 'message' ? '' : 'display: flex; align-items: center; white-space: nowrap;'">
                  <!--      HEADER ID     -->
                  <v-tooltip v-if="header.key === 'id'" location="bottom">
                    <template v-slot:activator="{ props }">
                      <span style='color: white; display: block' v-bind="props">{{ header.textBtn }}</span>
                    </template>
                    <span>{{ header.tooltip }}</span>
                  </v-tooltip>
                  <!--      HEADER REGLE DE VERIFICATION      -->
                  <span v-if="header.key === 'message'" style='margin-top: 28px; color: white; display: block'>
                {{ header.title }}
                </span>
                  <!--      AUTRES HEADER      -->
                  <span v-if="header.key !== 'message' && header.key !== 'id'" style='color: white; display: block'>
                    {{ header.title }}
                </span>
                  <!--      CHAMP DE RECHERCHE COLONNE "Règles de vérification / qualité"     -->

                  <v-text-field
                      v-if="header.key === 'message'"
                      v-model="search"
                      bg-color="white"
                      class="ma-0 pa-0 textFieldRegles"
                      density="compact"
                      height="26px"
                      label="rechercher par mot-clé"
                  ></v-text-field>

<!--                   ICONES DE TRI                  -->
                  <v-icon v-if="header.sortable && !isSorted(header)" class="pl-4" color="white" size="small">mdi-sort</v-icon>
                  <v-icon v-else-if="header.sortable" class="pl-4" color="white" size="small">{{ getSortIcon(header) }}</v-icon>

                  <!--      ICONES DE FILTRE POUR LES ID, TYPE DOCUMENTS ET TYPE REGLES      -->
                  <v-menu v-if="header.key === 'id' || header.key === 'typeDoc' || header.key === 'priority'" offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn :aria-label="header.key" icon
                             size="x-small" v-bind="props" variant="text" class="pa-0 ma-0">
                        <v-icon :color="colorIconFilter(header.key)" size="small">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div v-if="header.key === 'typeDoc'" class="pl-4 pr-8" style='background-color:white;color: black;'>
                      <v-btn v-for="ruleTypeDoc in listSelectedRulesTypeDoc" :key="ruleTypeDoc.value" class="d-block"
                             variant="plain"
                             @click="eventTypeChoice(ruleTypeDoc) ">
                        <v-checkbox v-model="selectedCheckbox" :label="ruleTypeDoc" :value="ruleTypeDoc"></v-checkbox>
                      </v-btn>
                      <div style="height: 30px"></div>
                    </div>
                    <div v-if="header.key === 'id'" class="pl-4 pr-8" style='background-color:white;color: black;'>
                      <v-btn v-for="ruleId in listSelectedRulesId" :key="ruleId.value" class="d-block" variant="plain"
                             @click="filterRulesById(ruleId)">
                        {{ ruleId }}
                      </v-btn>
                    </div>
                    <div v-if="header.key === 'priority'" class="pl-4 pr-8"
                         style='background-color:white;color: black;'>
                      <v-btn v-for="rulePriority in listSelectedRulesPriority" :key="rulePriority.value" class="d-block"
                             variant="plain"
                             @click="(selectedPriority = rulePriority) && filterRulesByPriority(rulePriority)">
                        {{ rulePriority }}
                      </v-btn>
                    </div>
                  </v-menu>
                </div>
              </th>
            </tr>
          </template>
          <template v-slot:item="{ item }">
            <tr :class="classItemPriority">
              <td>
                {{ item.id }}
              </td>
              <td>
                {{ item.zoneUnm1 }}
              </td>
              <td>
                {{ item.zoneUnm2 }}
              </td>
              <td>
                {{ item.typeDoc }}
              </td>
              <td>
                {{ item.message }}
              </td>
              <td>
                {{ item.priority }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import QualimarcService from "@/service/QualimarcService";
import DownloadCsv from "@/components/DownloadCsv.vue";

const serviceApi = QualimarcService;
let headers = [
  {
    title: "ID règle",
    key: "id",
    textBtn: "ID règle",
    tooltip: "Les identifiants des règles sont générés automatiquement et sont donnés à titre informatif",
    sortable: true
  },
  {
    title: "Zone UNM 1",
    key: "zoneUnm1",
    sortable: true
  },
  {
    title: "Zone UNM 2",
    key: "zoneUnm2",
    sortable: true
  },
  {
    title: "Type de document",
    key: "typeDoc",
    tooltip: "Type de document concerné par la règle",
    sortable: true
  },
  {
    title: "Règle de vérification",
    key: "message",
    sortable: false
  },
  {
    title: "Type de règle",
    key: "priority",
    sortable: true
  }
];
const items = ref([]);
const listSelectedRulesId = ref([]);
const selectedTypeDoc = ref(new Array("Tous"));
const listSelectedRulesTypeDoc = ref([]);
const listSelectedRulesPriority = ref([]);
const search = ref('')
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
  search.value = ''
  rulesFiltered.value = items.value;
  selectedCheckbox.value = ["Tous"];
  selectedPriority.value = "Toutes";
  selectedId.value = "Tous";
}

function colorIconFilter(headerKey) {
  if (
      headerKey === 'typeDoc' && (selectedCheckbox.value[0] === "Tous" || selectedCheckbox.value.length === 0) ||
      headerKey === 'id' && selectedId.value === "Tous" ||
      headerKey === 'priority' && selectedPriority.value === "Toutes"
  ) {
    return 'white';
  } else return '#FFC1AB';
}


const filteredItems = computed(() => {
  if (!search.value) return rulesFiltered.value

  const term = search.value.toLowerCase()

  return rulesFiltered.value.filter(item =>
      (item.message && item.message.toLowerCase().includes(term))
  )
})

/**
 * fonction permetant de recuperer la liste des règles
 */
function feedItems() {
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
function classItemPriority(item) {
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
  for (let i = 0; i < items.value.length; i++) {
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
 * Retire l'option "Tous" de la liste si elle est présente
 */
function removeAllOption() {
  const allIndex = selectedTypeDoc.value.indexOf("Tous");
  if (allIndex >= 0) {
    selectedTypeDoc.value.splice(allIndex, 1);
  }
}

/**
 * Bascule la sélection d'un type de document (ajout ou suppression)
 * @param type le type à basculer
 */
function toggleTypeSelection(type) {
  const typeIndex = selectedTypeDoc.value.indexOf(type);

  if (typeIndex === -1) {
    // Ajout du type s'il n'est pas présent
    selectedTypeDoc.value.push(type);
  } else {
    // Suppression du type s'il est déjà présent
    selectedTypeDoc.value.splice(typeIndex, 1);

    // Si tous les types sont désélectionnés, réinitialiser à "Tous"
    if (selectedTypeDoc.value.length === 0) {
      selectedTypeDoc.value.push("Tous");
    }
  }
}

/**
 * Fonction qui permet d'afficher les typeDoc sélectionnés par l'utilisateur
 * @param type l'élément sélectionné
 */
function eventTypeChoice(type) {
  if (type === "Tous") {
    selectedTypeDoc.value = ["Tous"];
  } else {
    // S'assurer qu'il y a au moins un élément dans la liste
    if (selectedTypeDoc.value.length === 0) {
      selectedTypeDoc.value = [type];
    } else {
      // Retirer "Tous" si présent avant d'ajouter un type spécifique
      if (selectedTypeDoc.value.includes("Tous")) {
        removeAllOption();
      }

      // Basculer la sélection du type
      toggleTypeSelection(type);
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
function filterRulesByTypeDoc() {
  if ((selectedPriority.value === "Toutes") && (selectedTypeDoc.value.indexOf("Tous") >= 0)) {  //  si aucune priorité n'a été sélectionné et typeDoc === Tous
    rulesFiltered.value = items.value;
    selectedTypeDoc.value = new Array("Tous");
  } else if ((selectedPriority.value === "Toutes") && (selectedTypeDoc.value.indexOf("Tous") === -1)) {  //  si aucun priorité n'a été sélectionnée et typeDoc !== Tous
    filterSelectedTypeDocTrueAndSelectedPriorityTrue();
  } else if ((selectedPriority.value !== "Toutes") && (selectedTypeDoc.value.indexOf("Tous") >= 0)) {  //  si une priorité a été sélectionnée et typeDoc === Tous
    rulesFiltered.value = items.value.filter(rule => {
      return rule['priority'].toString().toLocaleLowerCase() === selectedPriority.value.toString().toLocaleLowerCase();
    });
  } else if ((selectedPriority.value !== "Toutes") && (selectedTypeDoc.value.indexOf("Tous") === -1)) {  //  si une priorité a été sélectionnée et typeDoc !== Tous
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
    for (let i = 0; i < selectedTypeDoc.value.length; i++) {
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
  for (let i = 0; i < selectedTypeDoc.value.length; i++) {
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

.essentielle {
  font-weight: 400;
}

.avancee {
  font-weight: 400;
}

</style>
