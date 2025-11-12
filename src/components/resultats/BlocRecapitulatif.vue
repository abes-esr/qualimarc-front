<template>
  <v-container class="ma-0 pa-0">
    <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Récapitulatif</h1>
    <v-card variant="flat" class="pa-0 ma-0 borderBlocElements">
      <div class="mb-2 pt-1 rappelTypeAnalyse" style="background-color: #535775; color: white"><bloc-rappel-type-analyse></bloc-rappel-type-analyse></div>
      <v-carousel
          v-model="page"
          hide-delimiters
          :continuous="false"
          height="auto"
      >
        <v-carousel-item
            v-for="i in getNumberSlides()"
            :key="i"

        >
          <v-row class="d-flex justify-space-around align-center pa-4 ml-10">
            <v-col class="d-flex justify-center">
              <card-recapitulatif :resultats="getRecapitulatifByIndex(i-1)"><span style="color: #595959"> {{ i }} </span></card-recapitulatif>
            </v-col>
            <v-col class="d-flex justify-center">
              <card-recapitulatif v-if="isSecondCardHasToBeDisplayed(i)" :resultats="getRecapitulatifByIndex(i)"><span style="color: #595959"> {{ i + 1}} </span></card-recapitulatif>
            </v-col>
          </v-row>
        </v-carousel-item>
      </v-carousel>
    </v-card>
  </v-container>
</template>

<script setup>
import BlocRappelTypeAnalyse from "@/components/resultats/BlocRappelTypeAnalyse";
import CardRecapitulatif from "@/components/CardRecapitulatif";
import {ref, watchEffect} from 'vue';
import {useResultatStore} from "@/stores/resultat";

const page = ref(0);
const props = defineProps({
  // props
  'nombreResultatAnalyse': {
    type: Number,
    required: true
  }
});

const resultatStore = useResultatStore();

watchEffect(() => {
  if (props.nombreResultatAnalyse) {
    goToLastSlide();
  }
})

function getRecapitulatifByIndex(index) {
  return resultatStore.getRecapitulatif[index];
}

function getNumberSlides() {
  return props.nombreResultatAnalyse <= 2 ? 1 : props.nombreResultatAnalyse - 1;
}

function goToLastSlide() {
  page.value = (props.nombreResultatAnalyse > 2) ? props.nombreResultatAnalyse - 2 : 0;
}

function isSecondCardHasToBeDisplayed(i) {
  return (props.nombreResultatAnalyse > 1) && (i < props.nombreResultatAnalyse);
}

</script>

