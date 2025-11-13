<template>
  <v-container class="ma-0 pa-0">
    <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Récapitulatif</h1>
    <v-card max-width="100%" variant="flat" class="pa-0 ma-0 borderBlocElements">
      <div class="mb-2 pt-1 rappelTypeAnalyse" style="background-color: #535775; color: white"><BlocRappelTypeAnalyse></BlocRappelTypeAnalyse></div>
      <v-slide-group
        v-model="page"
        show-arrows
      >
        <v-slide-group-item
            v-for="recap in resultatStore.getRecapitulatif"
            :key="recap"
          >
          <CardRecapitulatif :resultats="recap"><span style="color: #595959"> {{ getIndex(recap)+1 }} </span></CardRecapitulatif>
        </v-slide-group-item>
      </v-slide-group>
    </v-card>
  </v-container>
</template>

<script setup>
import BlocRappelTypeAnalyse from "@/components/resultats/BlocRappelTypeAnalyse";
import CardRecapitulatif from "@/components/CardRecapitulatif";
import { ref, watchEffect} from 'vue';
import {useResultatStore} from "@/stores/resultat";

const page = ref(0);;

const resultatStore = useResultatStore();

function getIndex(resultat){
  return resultatStore.getRecapitulatif.indexOf(resultat);
}
watchEffect(() => {
  if (resultatStore.getRecapitulatif.length > 0) {
    page.value = resultatStore.getRecapitulatif.length - 1;
  }
});

</script>

