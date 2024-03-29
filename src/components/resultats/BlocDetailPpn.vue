<template>
  <v-container class="pa-0">
    <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Détail des erreurs par PPN</h1>
    <v-card flat v-if="itemsPpnParent.length > 0 && itemsPpnParent[page-1]" class="pa-0 ma-0 borderBlocElements">
      <img v-if="coverLink !== ''" :src="coverLink" alt="Première de couverture non trouvée" class="borderPicturePpnErrorDetail">
      <v-sheet v-else rounded style="position:absolute;" class="borderPicturePpnErrorDetail pa-2 rounded-circle" :color="iconTypeDocument.color"><v-icon color="white">{{ iconTypeDocument.img }}</v-icon></v-sheet>
      <div class="mb-2 pt-1 text-justify detailErrorPpnSubtitle" style="background-color: #535775; color: white">{{ itemsPpnParent[page-1].titre }} / {{ itemsPpnParent[page-1].auteur }}</div>
      <div class="mb-2 pt-1 text-justify detailErrorPpnSubtitle fontPrimaryColor" style="font-size: 0.92em">PPN {{ itemsPpnParent[page-1].ppn }}</div>
      <v-data-table id="bgColorGrey"
                    fixed-header
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="desc"
                    :headers="headers"
                    :items="itemsPpnParent[page-1].itemsDetailPpn"
                    :item-class="classItemPriority"
                    :items-per-page="itemsPpnParent[page-1].itemsDetailPpn.length"
                    :height="itemsPpnParent[page-1].itemsDetailPpn.length > 10 ? '40vh' : 'auto'"
                    hide-default-footer
                    dense
                    class="elevation-0"
      >
        <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ headers }">
          <!--  Configuration de la colonne Règles  -->
          <span style='color: #252C61; font-weight: 500' v-if="header.value === 'priority'">
            <v-icon x-small color="#252C61">mdi-checkbox-blank-circle</v-icon>
            {{ header.text.split('|')[0] }}
            <v-icon color="#4D4D4D" small >mdi-sort</v-icon>
            <span style="display: block"></span>
            <v-icon x-small color="#4D4D4D" class="pr-1">mdi-checkbox-blank-circle-outline</v-icon>
            <span style="font-weight: 500; color: #4D4D4D"> {{ header.text.split('|')[1] }}</span>
          </span>
          <span style="color: #4D4D4D; font-weight: 600" v-else>
              {{ header.text }}
            <v-icon color="#4D4D4D" small >mdi-sort</v-icon>
          </span>
        </template>
        <!-- lien vers le guide méthodologique dans l'intitulé des zones -->
        <template v-slot:item.zone1="{ item }">
          <a target="_blank" :href="getLinkGuideMethodo(item.zone1)" class="linkBlue">{{ item.zone1 }}</a>
        </template>
        <template v-slot:item.zone2="{ item }">
          <a target="_blank" :href="getLinkGuideMethodo(item.zone2)" class="linkBlue">{{ item.zone2 }}</a>
        </template>
        <!--  Icone dans la colonne Règles  -->
        <template v-slot:item.priority="{ item }">
          <div class="ma-0 pa-0 d-flex justify-center" :aria-label="'Règle ' + (item.priority)" role="img">
            <v-icon v-model="item.priority" small v-if="item.priority === 'essentielle'" color="#252C61">mdi-checkbox-blank-circle</v-icon>
            <v-icon v-model="item.priority" small v-if="item.priority === 'avancée'" color="#4D4D4D">mdi-checkbox-blank-circle-outline</v-icon>
          </div>
        </template>
      </v-data-table>
      <v-pagination
          v-model="page"
          :length="itemsPpnParent.length"
          color="#0c5c92"
          :total-visible="12"
          @input="sendCurrentPpnToParent(itemsPpnParent[page-1].ppn)"
      ></v-pagination>
    </v-card>
    <bloc-aucune-donnee v-else>Cliquer sur un ppn de la liste du bloc de gauche pour afficher les détails des erreurs</bloc-aucune-donnee>
  </v-container>
</template>

<script setup>
import {ref, onUpdated, watchEffect } from "vue";
import { useResultatStore } from "@/stores/resultat";
import CoverService from "@/service/CoverService";
import BlocAucuneDonnee from "@/components/BlocAucuneDonnee";

const props = defineProps({currentPpn: String,currentItems: Array});
const emit = defineEmits(['backendError','onChangePpn']);

const resultatStore = useResultatStore();
const service = CoverService;

const page = ref(1);
const coverLink = ref('');
const iconTypeDocument = ref({color:"black",img:"mdi-help"});
const itemsPpnParent = ref([]);
let sortBy = "zone1";
let desc = false;
const headers = [
  {text: "Zone UNM1", value: "zone1", width: 133},
  {text: "Zone UNM2", value: "zone2", width: 133},
  {text: "Message d'erreur", value: "message"},
  {text: "Règle essentielle|Règle avancée", value: "priority", width: 170}
];


/**
 * Fonction qui permet de vérifier un changement de valeur du ppn courant
 */
watchEffect(() => {
  if(props.currentPpn){
    itemsPpnParent.value = [];
    coverLink.value = '';
    resultatStore.getResultsList
        .filter(e => props.currentItems
            .filter(el => el.ppn === e.ppn).length > 0)
        .forEach(result => {
          let temp = [];
          result.detailerreurs.forEach((erreur)=> {temp.push({
              zone1: erreur.zones[0],
              zone2: erreur.zones[1],
              priority: getPriority(erreur.priority),
              message: erreur.message
            });
          })
          itemsPpnParent.value[props.currentItems.map(item => item.ppn).indexOf(result.ppn)] = {
            titre: result.titre,
            auteur: result.auteur,
            ppn: result.ppn,
            itemsDetailPpn: temp,
          }
        });
    page.value = itemsPpnParent.value.map(item => item.ppn).indexOf(props.currentPpn) + 1;
  }
})

/**
 * Fonction qui modifie la class de l'item sélectionné en fonction de sa priorité
 * @param item
 * @returns {essentielle: boolean, avancee: boolean}
 */
function classItemPriority(item){
  return {
    essentielle: item.priority === 'essentielle',
    avancee: item.priority === 'avancée',
  }
}

onUpdated(() => {
  feedCover();
})


  function nextSelectedItem() {
    if(page.value < itemsPpnParent.value.length){
      page.value++;
      sendCurrentPpnToParent(itemsPpnParent.value[page.value-1].ppn);
    }
  }

  function previousSelectedItem() {
    if(page.value > 1){
      page.value--;
      sendCurrentPpnToParent(itemsPpnParent.value[page.value-1].ppn);
    }
  }

  function feedCover() {
    const detailCurrentPpn = resultatStore.getResultsList.filter(result => result.ppn === props.currentPpn);
    let ocn;
    let isbn;
    let typeDocument;
    if (detailCurrentPpn.length > 0) {
      ocn = detailCurrentPpn[0].ocn;
      isbn = detailCurrentPpn[0].isbn;
      typeDocument = detailCurrentPpn[0].typeDocument;
    }
    if (ocn !== '' && ocn !== undefined && ocn !== null) {
      service.getCoverByOcn(ocn).then((response) => {
        coverLink.value = response.data.items[0].volumeInfo.imageLinks.thumbnail;
        if (coverLink.value === '') {
          getCoverByIsbn(isbn);
        }
      }).catch((error) => {
        emitOnError(error);
      });
    } else {
      getCoverByIsbn(isbn);
    }
    if (coverLink.value === '') {
      //pas de réponse du ws GB, on affiche une image correspondant au type de document de la notice
      getIconTypeDocument(typeDocument);
    }
  }

function getCoverByIsbn(isbn) {
  //pas de retour avec OCN, on tente avec ISBN
  if (isbn !== '' && isbn !== undefined && isbn !== null) {
    service.getCoverByIsbn(isbn).then((response) => {
      if (response.data.items)
        coverLink.value = response.data.items[0].volumeInfo.imageLinks.thumbnail;
    }).catch((error) => {
      emitOnError(error);
    });
  }
}

function getIconTypeDocument(typeDocument) {
  switch (typeDocument) {
    case "Monographie":
      iconTypeDocument.value.img="mdi-bookshelf";
      iconTypeDocument.value.color="green";
      break;
    case "Doc Elec":
      iconTypeDocument.value.img="mdi-mouse-variant";
      iconTypeDocument.value.color="orange";
      break;
    case "Enregistrement":
      iconTypeDocument.value.img="mdi-volume-high";
      iconTypeDocument.value.color="pink";
      break;
    case "Image":
      iconTypeDocument.value.img="mdi-camera";
      iconTypeDocument.value.color="orange";
      break;
    case "Manuscrit":
      iconTypeDocument.value.img="mdi-script-outline";
      iconTypeDocument.value.color="brown";
      break;
    case "Multimédia":
      iconTypeDocument.value.img="mdi-movie-play-outline";
      iconTypeDocument.value.color="purple";
      break;
    case "Objet":
      iconTypeDocument.value.img="mdi-cube";
      iconTypeDocument.value.color="cyan";
      break;
    case "Musique":
      iconTypeDocument.value.img="mdi-album";
      iconTypeDocument.value.color="orange";
      break;
    case "Partition":
      iconTypeDocument.value.img="mdi-music";
      iconTypeDocument.value.color="red";
      break;
    case "Ressource continue":
      iconTypeDocument.value.img="mdi-newspaper-variant-outline";
      iconTypeDocument.value.color="grey";
      break;
    case "Audiovisuel":
      iconTypeDocument.value.img="mdi-video-vintage";
      iconTypeDocument.value.color="purple";
      break;
    case "Carte":
      iconTypeDocument.value.img="mdi-web";
      iconTypeDocument.value.color="blue";
      break;
    case "Thèse de soutenance":
    case "Thèse de reproduction":
      iconTypeDocument.value.img="mdi-school";
      iconTypeDocument.value.color="black";
      break;
    case "Partie composante":
      iconTypeDocument.value.img="mdi-card-search-outline";
      iconTypeDocument.value.color="blue";
      break;
    default:
      iconTypeDocument.value.img="mdi-help";
      iconTypeDocument.value.color="black";
  }
}

function emitOnError(error){
  emit('backendError', error);
}

function sendCurrentPpnToParent(currentPpn) {
  emit('onChangePpn', currentPpn);
}

function getPriority(priority){
  if (priority === "P1") {
    return "essentielle"
  } else if (priority === "P2") {
    return "avancée"
  }
}

function getLinkGuideMethodo(zone) {
  if (zone != undefined) {
    let link = "https://documentation.abes.fr/sudoc/formats/unmb/zones/"
    if (zone.indexOf("$") > 1)
      link += zone.substring(0, 3);
    else
      link += zone;
    return link + ".htm";
  }
  return "";
}
</script>

<style>

.essentielle{
  font-weight: 400;
  color: #252C61;
}

.avancee{
  font-weight: 400;
  color: #4D4D4D;
}
</style>
