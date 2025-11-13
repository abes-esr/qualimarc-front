<template>
  <v-container class=" px-4" style="width: 90vw">
    <v-row>
      <!--      TITRE     -->
      <v-col class="pa-2 d-flex justify-start align-center" cols="12" lg="4" md="4" sm="12" xl="4" xs="12">
        <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold">Historique des analyses</h1>
      </v-col>
      <v-spacer cols="0" lg="4" md="4" sm="0" xl="4" xs="0"></v-spacer>
      <!--      BOUTON TELECHARGER L'HISTORIQUE     -->
      <v-col class="pa-2 d-flex justify-md-end justify-lg-end justify-xl-end align-center" cols="12" lg="4" md="4"
             sm="12" xl="4"
             xs="12">
        <v-tooltip location="start">
          <template v-slot:activator="{props}">
            <DownloadCsv
                :data="exportHistorique(historiqueList)"
                :disabled="historiqueList.length === 0"
                delimiter=";"
                name="qualimarc-export-historique.csv"
                size="small"
                v-bind="props">
              <span style="color: white">TÉLÉCHARGER L'HISTORIQUE</span>
              <v-icon class="ml-2" color="white" size="small">mdi-download</v-icon>
            </DownloadCsv>
          </template>
          <span>Télécharger l'historique dans un fichier nommé "qualimarc-export-historique.csv"</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row style="border-top: 4px solid #252c61">
      <v-col class="pa-0 pt-2 text-center">
        <v-alert
            v-if="historiqueList.length !== 0"
            border="start"
            class="d-inline-flex "
            density="compact"
            elevation="2"
            icon="mdi-information"
            type="info"
            variant="outlined">
          L’historique n’est valable que pour la durée de la session.
        </v-alert>
        <v-alert
            v-else
            border="start"
            class="d-inline-flex"
            density="compact"
            elevation="2"
            icon="mdi-alert"
            type="warning"
            variant="outlined"
        >
          <span style="display: block; color: #595959; text-align: start">L’historique est vide.</span>
          <span style="font-style: italic; font-weight: 300; font-size: 0.9em; color: #595959; text-align: start">L’historique n’est valable que pour la durée de la session.</span>
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-timeline
            v-if="historiqueList.length !== 0"
            density="compact"
            side="end"
        >
          <!--      TRAITEMENT PAR ANALYSE      -->
          <v-timeline-item
              v-for="historique in historiqueList.slice().reverse()"
              :key="historiqueList.indexOf(historique)"
              dot-color="white"

          >
            <!--      AFFICHAGE DU NUMERO DE L'ANALYSE DANS LA PUCE     -->
            <template v-slot:icon>
              <span style="color: #B30900; font-weight: 400; font-size: 1.2em;">
                {{ historiqueList.indexOf(historique) + 1 }}
              </span>
            </template>
            <v-expansion-panels multiple>
              <v-expansion-panel role="button">
                <v-expansion-panel-title>
                  <v-row class="align-center">
                    <v-col class="d-flex justify-start align-center" cols="12" md="8">
                      <!--      AFFICHAGE DE LA DATE      -->
                      <span class="pr-1">
                        Analyse du {{ historique.date.toLocaleString() }}
                      </span>
                      <span style="font-style: italic; color: #595959">
                        - Type d'analyse : {{ historique.analyse.analyseSelected.libelle }}
                      </span>
                    </v-col>
                    <v-col class="d-flex justify-end align-center" cols="12" md="4">
                      <!--      AFFICHAGE DU BOUTON      -->
                      <v-btn
                          append-icon="mdi-arrow-right-thin-circle-outline"

                          color="#B30900"
                          @click="relanceAnalyse(historiqueList.indexOf(historique))">
                        Relancer l'analyse
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-divider></v-divider>
                  <div class="d-flex"  style=" overflow-x: auto; overflow-y: hidden">
                    <div
                        v-for="result in historique.resultats.slice()"
                        :key="historique.resultats.indexOf(result)"
                        class="px-2"
                    >
                      <CardRecapitulatif
                          :resultats="result">
                        <span
                            style="color: #595959">{{ historique.resultats.indexOf(result) + 1 }}
                        </span>
                      </CardRecapitulatif>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {ref} from "vue";
import CardRecapitulatif from "@/components/CardRecapitulatif";
import {useHistoriqueStore} from "@/stores/historique";
import router from "@/router";
import DownloadCsv from "@/components/DownloadCsv.vue";

const historiqueStore = useHistoriqueStore();
const historiqueList = ref(historiqueStore.getHistorique);


function relanceAnalyse(currentAnalyse) {
  router.push("/?numeroAnalyse=" + currentAnalyse);
}

function exportHistorique(items) {
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
        "Date": element.date.toLocaleString(),
        "Type de lancement": typeLancement,
        "Numero de lancement": index + 1,
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
<style>
.v-timeline-item__body {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 80% !important;
}

</style>