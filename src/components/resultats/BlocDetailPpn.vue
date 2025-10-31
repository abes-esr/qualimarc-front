<template>
  <v-container class="pa-0">
    <h1 class="fontPrimaryColor" style="font-size: 1.26em; font-weight: bold;">Détail des erreurs par PPN</h1>
    <v-card v-if="itemsPpnParent.length > 0 && itemsPpnParent[page - 1]" class="pa-0 ma-0 borderBlocElements" flat>
      <img v-if="coverLink !== ''" :src="coverLink" alt="Première de couverture non trouvée"
           class="borderPicturePpnErrorDetail">
      <v-sheet v-else :color="iconTypeDocument.color" class="borderPicturePpnErrorDetail pa-2 rounded-circle" rounded
               style="position:absolute;">
        <v-icon color="white">{{ iconTypeDocument.img }}</v-icon>
      </v-sheet>
      <div class="mb-2 pt-1 text-justify detailErrorPpnSubtitle" style="background-color: #535775; color: white">{{
          itemsPpnParent[page - 1].titre
        }} / {{ itemsPpnParent[page - 1].auteur }}
      </div>
      <div class="mb-2 pt-1 text-justify detailErrorPpnSubtitle fontPrimaryColor" style="font-size: 0.92em">PPN {{
          itemsPpnParent[page - 1].ppn
        }}
      </div>
      <v-data-table
          id="bgColorGrey"
          :headers="headers"
          :height="itemsPpnParent[page - 1].itemsDetailPpn.length > 10 ? '40vh' : 'auto'"
          :items="itemsPpnParent[page - 1].itemsDetailPpn"
          :items-per-page="itemsPpnParent[page - 1].itemsDetailPpn.length"
          class="elevation-0"
          density="compact"
          fixed-header
          hide-default-footer>

        <template v-slot:headers="{ columns : headers , toggleSort, isSorted, getSortIcon }">
          <tr>
            <th v-for="header in headers" :key="header.key"  @click="toggleSort(header)">
              <div class="d-flex align-center">
                <span
                    v-if="header.key === 'priority'"

                    style='color: #252C61; font-weight: 400; font-size: 12px'>
                  <v-icon color="#252C61" size="x-small">mdi-checkbox-blank-circle</v-icon>
                  {{ header.title.split('|')[0] }}
                  <span style="display: block"></span>
                  <v-icon class="pr-1" color="#4D4D4D" size="x-small">mdi-checkbox-blank-circle-outline</v-icon>
                  <span style="font-weight: 400; color: #4D4D4D"> {{ header.title.split('|')[1] }}</span>
                </span>
                <span
                    v-else
                    style='color: #4D4D4D; font-weight: 600; font-size: 12px'
                >
                    {{ header.title }}
                </span>
                <v-icon
                    v-if="isSorted(header)"
                    class="ml-1"
                    size="small"
                >
                  {{ getSortIcon(header) }}
                </v-icon>
                <v-icon v-else class="ml-1" size="small">mdi-sort</v-icon>
              </div>
            </th>
          </tr>
        </template>

        <!-- lien vers le guide méthodologique dans l'intitulé des zones -->
        <template v-slot:item="{ item }">
          <tr :class="classItemPriority(item)">
            <td>
              <a :href="getLinkGuideMethodo(item.zone1)" class="linkBlue" target="_blank">{{ item.zone1 }}</a>
            </td>
            <td>
              <a :href="getLinkGuideMethodo(item.zone2)" class="linkBlue" target="_blank">{{ item.zone2 }}</a>
            </td>
            <td>
              {{ item.message }}
            </td>
            <td>
              <div :aria-label="'Règle ' + (item.priority)" class="ma-0 pa-0 d-flex justify-center" role="img">
                <v-icon v-if="item.priority === 'essentielle'" v-model="item.priority" color="#252C61"
                        size="small">mdi-checkbox-blank-circle
                </v-icon>
                <v-icon v-if="item.priority === 'avancée'" v-model="item.priority" color="#4D4D4D"
                        size="small">mdi-checkbox-blank-circle-outline
                </v-icon>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-pagination
          v-model="page"
          @update:model-value="currentPpn = itemsPpnParent[page - 1].ppn"
          :length="itemsPpnParent.length"
          total-visible="12"
          size="small"
          color="#0c5c92"
      ></v-pagination>
    </v-card>
    <bloc-aucune-donnee v-else>Cliquer sur un ppn de la liste du bloc de
      gauche
      pour afficher les détails des erreurs
    </bloc-aucune-donnee>
  </v-container>
</template>

<script setup>
import {onUpdated, ref, watchEffect} from "vue";
import {useResultatStore} from "@/stores/resultat";
import CoverService from "@/service/CoverService";
import BlocAucuneDonnee from "@/components/BlocAucuneDonnee";

const props = defineProps({itemsSortedAndFiltered: Array});
const emit = defineEmits(['backendError']);
const currentPpn = defineModel('currentPpn', {type: String, required: true});

const resultatStore = useResultatStore();

const service = CoverService;

const page = ref(1);
const coverLink = ref('');
const iconTypeDocument = ref({color: "black", img: "mdi-help"});
const itemsPpnParent = ref([]);
const headers = [
  {title: "Zone UNM1", key: "zone1", width: 133},
  {title: "Zone UNM2", key: "zone2", width: 133},
  {title: "Message d'erreur", key: "message"},
  {title: "Règle essentielle|Règle avancée", key: "priority", width: 200}
];


/**
 * Fonction qui permet de vérifier un changement de valeur du ppn courant
 */
watchEffect(() => {
      if (currentPpn.value) {
        itemsPpnParent.value = [];
        coverLink.value = '';
        for (const result of resultatStore.getResultsList
            .filter(e => props.itemsSortedAndFiltered.some(el => el.ppn === e.ppn))) {
          let temp = [];
          for (const erreur of result.detailerreurs) {
            temp.push({
              zone1: erreur.zones[0],
              zone2: erreur.zones[1],
              priority: getPriority(erreur.priority),
              message: erreur.message
            });
          }
          itemsPpnParent.value[props.itemsSortedAndFiltered.map(item => item.ppn).indexOf(result.ppn)] = {
            titre: result.titre,
            auteur: result.auteur,
            ppn: result.ppn,
            itemsDetailPpn: temp,
          }
        }
        page.value = itemsPpnParent.value.map(item => item.ppn).indexOf(currentPpn.value) + 1;
      }
    }
)

/**
 * Fonction qui modifie la class de l'item sélectionné en fonction de sa priorité
 * @param item
 * @returns {essentielle: boolean, avancee: boolean}
 */
function classItemPriority(item) {
  return {
    essentielle: item.priority === 'essentielle',
    avancee: item.priority === 'avancée',
  }
}

onUpdated(() => {
  feedCover();
})

function feedCover() {
  const detailCurrentPpn = resultatStore.getResultsList.filter(result => result.ppn === currentPpn.value);
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
      iconTypeDocument.value.img = "mdi-bookshelf";
      iconTypeDocument.value.color = "green";
      break;
    case "Doc Elec":
      iconTypeDocument.value.img = "mdi-mouse-variant";
      iconTypeDocument.value.color = "orange";
      break;
    case "Enregistrement":
      iconTypeDocument.value.img = "mdi-volume-high";
      iconTypeDocument.value.color = "pink";
      break;
    case "Image":
      iconTypeDocument.value.img = "mdi-camera";
      iconTypeDocument.value.color = "orange";
      break;
    case "Manuscrit":
      iconTypeDocument.value.img = "mdi-script-outline";
      iconTypeDocument.value.color = "brown";
      break;
    case "Multimédia":
      iconTypeDocument.value.img = "mdi-movie-play-outline";
      iconTypeDocument.value.color = "purple";
      break;
    case "Objet":
      iconTypeDocument.value.img = "mdi-cube";
      iconTypeDocument.value.color = "cyan";
      break;
    case "Musique":
      iconTypeDocument.value.img = "mdi-album";
      iconTypeDocument.value.color = "orange";
      break;
    case "Partition":
      iconTypeDocument.value.img = "mdi-music";
      iconTypeDocument.value.color = "red";
      break;
    case "Ressource continue":
      iconTypeDocument.value.img = "mdi-newspaper-variant-outline";
      iconTypeDocument.value.color = "grey";
      break;
    case "Audiovisuel":
      iconTypeDocument.value.img = "mdi-video-vintage";
      iconTypeDocument.value.color = "purple";
      break;
    case "Carte":
      iconTypeDocument.value.img = "mdi-web";
      iconTypeDocument.value.color = "blue";
      break;
    case "Thèse de soutenance":
    case "Thèse de reproduction":
      iconTypeDocument.value.img = "mdi-school";
      iconTypeDocument.value.color = "black";
      break;
    case "Partie composante":
      iconTypeDocument.value.img = "mdi-card-search-outline";
      iconTypeDocument.value.color = "blue";
      break;
    default:
      iconTypeDocument.value.img = "mdi-help";
      iconTypeDocument.value.color = "black";
  }
}

function emitOnError(error) {
  emit('backendError', error);
}

function getPriority(priority) {
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
.essentielle {
  font-weight: 400;
  color: #252C61;
}

.avancee {
  font-weight: 400;
  color: #4D4D4D;
}
</style>
