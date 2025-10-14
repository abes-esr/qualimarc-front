<template>
  <v-container align-items="center" style="min-width: 90%">
    <v-row class="mb-2 px-4" justify="space-between">
      <!--      TITRE     -->
      <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold">Historique des analyses</h1>
      <!--      BOUTON TELECHARGER L'HISTORIQUE     -->
      <v-tooltip left>
        <template v-slot:activator="{props}">
          <v-btn class="ma-0" elevation="0" :disabled="historiqueList.length === 0" small v-bind="props" color="#0c5c92">
            <download-csv :delimiter="';'" :data="exportHistorique(historiqueList)" name="qualimarc-export-historique.csv" >
              <span style="color: white">TÉLÉCHARGER L'HISTORIQUE</span>
            </download-csv>
            <v-icon small color="white" class="ml-2">mdi-download</v-icon>
          </v-btn>
        </template>
        <span>Télécharger l'historique dans un fichier nommé "qualimarc-export-historique.csv"</span>
      </v-tooltip>
    </v-row>
    <div class="ma-0 pa-0" style="border-top: 4px solid #252c61">
      <v-row class="mt-1" justify="space-around">
        <v-alert v-if="historiqueList.length !== 0" class="mt-4" border="left" colored-border dense type="info" elevation="2" icon="mdi-information">
          L’historique n’est valable que pour la durée de la session.
        </v-alert>
        <v-alert v-else class="mt-4" border="left" colored-border dense type="warning" elevation="2" icon="mdi-alert">
          <span style="display: block; color: #595959">L’historique est vide.</span>
          <span style="font-style: italic; font-weight: 300; font-size: 0.9em; color: #595959">L’historique n’est valable que pour la durée de la session.</span>
        </v-alert>
      </v-row>

      <v-timeline v-if="historiqueList.length !== 0" align-top dense clipped style="width: 100%">
        <!--      TRAITEMENT PAR ANALYSE      -->
        <v-timeline-item v-for="historique in historiqueList.slice().reverse()" :key="historiqueList.indexOf(historique)" color="lightgrey">
          <!--      AFFICHAGE DU NUMERO DE L'ANALYSE DANS LA PUCE     -->
          <template v-slot:icon>
            <span style="color: #B30900; font-weight: 400; font-size: 1.2em">{{ historiqueList.indexOf(historique) +1 }}</span>
          </template>
          <v-expansion-panels multiple>
            <v-expansion-panel class="mb-4" role="button">
              <v-expansion-panel-title>
                <v-row justify="space-around">
                  <!--      AFFICHAGE DE LA DATE      -->
                  <span class="mt-1">Analyse du {{ historique.date.toLocaleString() }} <span style="font-style: italic; color: #595959">- Type d'analyse : {{ historique.analyse.analyseSelected.libelle }}</span></span>
                  <!--      AFFICHAGE DU BOUTON      -->
                  <v-btn @click="relanceAnalyse(historiqueList.indexOf(historique))" depressed color="#B30900" class="button" max-width="220" height="26">
                    <span style="color: white">Relancer l'analyse</span>
                    <v-icon color="white" class="ml-2">mdi-arrow-right-thin-circle-outline</v-icon>
                  </v-btn>
                </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-divider></v-divider>
                <v-list-item class="mt-2" style="overflow-x: scroll; overflow-y: hidden">
                  <!--      TRAITEMENT PAR RESULTAT     -->
                  <v-col v-for="result in historique.resultats.slice()" :key="historique.resultats.indexOf(result)" class="mr-10">
                    <card-recapitulatif :resultats="result"><span style="color: #595959">{{ historique.resultats.indexOf(result) +1 }}</span></card-recapitulatif>
                  </v-col>
                </v-list-item>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-timeline-item>
      </v-timeline>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import CardRecapitulatif from "@/components/CardRecapitulatif";
import {useHistoriqueStore} from "@/stores/historique";
import router from "@/router";

const historiqueStore = useHistoriqueStore();
const historiqueList = ref(historiqueStore.getHistorique);


function relanceAnalyse(currentAnalyse) {
  router.push("/?numeroAnalyse="+currentAnalyse);
}

function exportHistorique(items){
  let itemsToExport = [];
  //  Pour chaque analyse dans historiqueList
  items.forEach(element => {

    //  Récupère la liste des types de documents
    let typesDocuments = "";
    element.analyse.familleDocumentSet.forEach(element => {
      typesDocuments += element.libelle.toString() + ", ";
    })
    //  Récupère la liste des jeux de règles
    let jeuxRegles = "";
    element.analyse.ruleSet.forEach(element => {
      jeuxRegles += element.libelle.toString() + ", ";
    })

    //  Pour chaque résultat d'une analyse
    element.resultats.forEach((result, index) => {

      //  Récupère la liste de ppn analysés
      let ppnAnalyses = "";
      result.PpnTotal.forEach(ppn => {
        ppnAnalyses += ppn.toString() + ", ";
      })

      //  Récupère la liste de ppn avec erreurs
      let ppnAvecErreurs = "";
      result.PpnErreurs.forEach(ppn => {
        ppnAvecErreurs += ppn.toString() + ", ";
      })

      //  Récupère la liste de ppn sans erreurs
      let ppnSansErreurs = "";
      result.PpnOk.forEach(ppn => {
        ppnSansErreurs += ppn.toString() + ", ";
      })

      //  Récupère la liste de ppn inconnus
      let ppnInconnus = "";
      result.PpnInconnus.forEach(ppn => {
        ppnInconnus += ppn.toString() + ", ";
      })

      //  Récupère l'index et adapte le type de lancement
      let typeLancement;
      if (index === 0) {
        typeLancement = "accueil";
      } else {
        typeLancement = "relance";
      }

      itemsToExport.push({
        "Date" : element.date.toLocaleString(),
        "Type de lancement": typeLancement,
        "Numero de lancement": index +1,
        "Type d'analyse": element.analyse.analyseSelected.libelle,
        "Types de documents": typesDocuments,
        "Jeux de regles": jeuxRegles,
        "Nb ppn analyses": result.PpnTotal.length,
        "Ppn analyses": ppnAnalyses,
        "Nb ppn avec erreurs": result.PpnErreurs.length,
        "Ppn avec erreurs": ppnAvecErreurs,
        "Nb ppn sans erreurs": result.PpnOk.length,
        'Ppn sans erreurs': ppnSansErreurs,
        "Nb ppn inconnus": result.PpnInconnus.length,
        "Ppn inconnus": ppnInconnus
      });
    })
  })
  return itemsToExport;
}

</script>
