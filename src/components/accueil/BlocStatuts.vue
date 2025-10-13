<template>
  <div  @mouseleave="hideBlock" @mouseenter="displayStatus" @focusin="displayStatus" @focusout="hideBlock">
    <v-btn fab :x-small="!mdAndUp" :small="mdAndUp" depressed color="white" aria-label="Status de l'application Qualimarc">
      <!--      Balise div servant à créer les aria-label et role pour l'accessibilité de l'application     -->
      <div aria-label="Status de l'application Qualimarc" role="img">
        <v-icon :style="(mdAndUp) ? 'font-size: 40px' : 'font-size: 32px'">mdi-gauge</v-icon>
      </div>
    </v-btn>
    <v-card v-if="isDisplayed" elevation="12" style="position: absolute; margin-left: -360px; margin-top: 20px; z-index: 10; border-radius: 5px!important;" width="400">
      <v-card-title class="justify-center pt-1" style="background-color: #252C61; color: white">STATUTS</v-card-title>
      <v-card-text style="background-color: white;color: black">
        <v-row class="d-flex justify-space-between pa-2">
          <span> Base Xml </span>
          <!--      Balise div servant à créer les aria-label et role pour l'accessibilité de l'application     -->
          <div :aria-label="(applicationStatus.statutBaseQualimarc)" role="img">
            <v-icon :color="(applicationStatus.statutBaseXml === 'OK') ? 'green' : 'red'">{{ (applicationStatus.statutBaseXml === "OK") ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
          </div>
        </v-row>
        <v-row class="d-flex justify-space-between pa-2">
          <span>Application Qualimarc</span>
          <!--      Balise div servant à créer les aria-label et role pour l'accessibilité de l'application     -->
          <div :aria-label="(applicationStatus.statutBaseQualimarc)" role="img">
            <v-icon  :color="(applicationStatus.statutBaseQualimarc === 'OK') ? 'green' : 'red'">{{ (applicationStatus.statutBaseQualimarc === "OK")  ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline'}}</v-icon>
          </div>
        </v-row>
        <v-row class="d-flex justify-space-between pa-2">
          <span>Dernière synchro Sudoc<->Base XML</span>
          <span>{{applicationStatus.dateDerniereSynchronisation}}</span>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import StatutsService from "@/service/StatutsService";
import { useDisplay } from 'vuetify'
const { mdAndUp } = useDisplay()


const service = StatutsService;
const emit = defineEmits(['backendError']);
const applicationStatus = ref({});
const isDisplayed = ref(false);
let isHovering = false

function displayStatus() {
  isHovering = true;
  isDisplayed.value = true;
  service.getStatusApplication().then((response) => {
    applicationStatus.value = response.data;
  }).catch((error) => {
    isDisplayed.value = false;
    emitOnError(error);
  });
}

function hideBlock(){
  isHovering = false;
  setTimeout(() => {
    isDisplayed.value = isHovering;
  }, 300);
}
function emitOnError(error){
  emit('backendError', error);
}
</script>
