<template>
  <section class="borderSelectAnalyseType">
    <v-radio-group v-model="analyseSelected" class="d-inline-flex" @change="updateAnalyseSelectedInStore">
      <v-radio :data-cy="analyse.id" v-for="analyse in analysesList" :key="analyse.id" :value="analyse">
        <template v-slot:label>
          <v-tooltip right color="#54576D" dark>
            <template v-slot:activator="{ on, attrs }">
              <div :aria-label="'Analyse ' + (analyse.libelle + ' , ' + analyse.description)" role="img">
                <span style="color: #595959" v-on="on">{{ analyse.libelle }}</span>
              </div>
            </template>
            <span style="color: white">{{ analyse.description }}
              <span  v-if="analyse.id === 'QUICK'">
                 (règles essentielles
                <v-icon x-small color="white">mdi-checkbox-blank-circle</v-icon>
                )
              </span>
              <span v-if="analyse.id === 'COMPLETE'">
                 (règles essentielles
                <v-icon x-small color="white">mdi-checkbox-blank-circle</v-icon>
                 et avancées
                <v-icon x-small color="white">mdi-checkbox-blank-circle-outline</v-icon>
                )
              </span>
            </span>
          </v-tooltip>
        </template>
      </v-radio>
      </v-radio-group>
      <v-sheet v-if="analyseSelected.id === 'FOCUS'" >
        <span  v-if="familleDocumentList.length > 0" class="ml-2" style="font-size: 0.9em; color : #252C61; font-weight: bold"><v-icon color="#252C61" small>mdi-chevron-right</v-icon>Par règles associées à un ou plusieurs types de documents</span>
        <v-sheet class="d-flex align-content-start flex-wrap pa-0 mb-2 pl-8">
          <v-checkbox v-for="familleDoc in familleDocumentList" :key="familleDoc.id" :data-cy="familleDoc.id" v-model="familleDocumentSetSelected"
            class="ma-1"
            style="max-height: 30px"
            @change="updateFamilleDocumentSetInStore"
            :value="familleDoc"
        >
          <template v-slot:label>
            <span style="color: #595959">{{ familleDoc.libelle }}</span>
          </template>
        </v-checkbox>
      </v-sheet>
      <span v-if="ruleSetList.length > 0" class="ml-2" style="font-size: 0.9em; color : #252C61; font-weight: bold;"><v-icon color="#252C61" small>mdi-chevron-right</v-icon>Par jeux de règles thématiques</span>
      <v-card flat class="d-flex flex-column pa-0 mb-2 pl-8">
        <v-checkbox v-for="ruleset in ruleSetList" :key="ruleset.id" :data-cy="ruleset.id" v-model="ruleSetSelected" :value="ruleset" @change="updateRuleSetInStore" class="ma-1" style="max-height: 30px">
            <template v-slot:label>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span v-on="on" style="color: #595959">{{ ruleset.libelle }}</span>
              </template>
              {{ ruleset.description }}
            </v-tooltip>
          </template>
        </v-checkbox>
      </v-card>
    </v-sheet>
  </section>
</template>

<script setup>
  import { useAnalyseStore } from "@/stores/analyse";
  import { onMounted, ref } from "vue";
  import QualimarcService from "@/service/QualimarcService";

  // Store
  const analyseStore = useAnalyseStore();

  // Emit
  const emit = defineEmits(['isSelected', 'backendError'])

  // Service
  const serviceApi = QualimarcService ;

  // Data
  const analysesList = ref([]);
  const familleDocumentList = ref([]);
  const ruleSetList = ref([]);

  // Selected Data
  const analyseSelected = ref('');
  const familleDocumentSetSelected = ref([]);
  const ruleSetSelected = ref([]);

  onMounted(() => {
    feedAnalyseList()
  })

  function feedAnalyseList(){
    serviceApi.getAnalyses().then((response) => {
      analysesList.value = response.data.analyses;
      familleDocumentList.value = analysesList.value.find(analyse => analyse.id === 'FOCUS').famillesDocument;
      ruleSetList.value = analysesList.value.find(analyse => analyse.id === 'FOCUS').ruleSets;
    }).catch((error) => {
      emit('backendError', error)
    })
  }

  function feedFamilleDocumentList(){
      serviceApi.getFamillesDocuments()
        .then((response) => {
          response.data.forEach((el) => familleDocumentList.value.push(el));
        }).catch((error) => {
          emitOnError(error);
        });
  }

  function feedRuleSetList(){
    serviceApi.getRuleSetList()
      .then((response) => {
      response.data.forEach((el) => ruleSetList.value.push(el));
    }).catch((error) => {
      emitOnError(error);
    });
  }

  function updateAnalyseSelectedInStore() {
    //RAZ de la selection
    familleDocumentSetSelected.value = [];
    analyseStore.setFamilleDocumentSet(familleDocumentSetSelected.value);
    ruleSetSelected.value = [];
    analyseStore.setRuleSet(ruleSetSelected.value);

    analyseStore.setAnalyseSelected(analyseSelected.value);
    emitOnEvent();
  }
  function updateFamilleDocumentSetInStore() {
    analyseStore.setFamilleDocumentSet(familleDocumentSetSelected.value);
    emitOnEvent();
  }
  function updateRuleSetInStore() {
    analyseStore.setRuleSet(ruleSetSelected.value);
    emitOnEvent();
  }

  function isSelected() {
    return ((analyseSelected.value.id !== '' && analyseSelected.value.id !== 'FOCUS') || (analyseSelected.value.id === 'FOCUS' && ((familleDocumentSetSelected.value.length > 0) || (ruleSetSelected.value.length > 0))));
  }

  function emitOnEvent(){
    emit('isSelected', isSelected());
  }
  function emitOnError(error){
    emit('backendError', error);
  }

</script>
