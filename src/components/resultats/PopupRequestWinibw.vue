<template>
  <v-dialog v-model="props.dialog">
    <template v-slot:default="dialog">
      <v-card color="white">
        <v-toolbar
            color="#252C61"
            dark
        >Générer la requête WinIBW</v-toolbar>
        <v-card-text>
          <tr>
            <td>
              <div class="font-weight-bold pa-12">{{ props.winibwRequest }}</div>
            </td>
            <td>
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn @click="copyText" v-bind="props"><v-icon>mdi-content-copy</v-icon></v-btn>
                </template>
                <span>Copier la requête</span>
              </v-tooltip>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <v-container v-if="messageDisplayed === true"><span>Requête copiée !</span></v-container>
            </td>
          </tr>
        </v-card-text>
        <v-card-actions class="justify-end">
            <v-btn
                text
                @click="emitOnClose"
            >Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({winibwRequest: String, dialog: Boolean});
const emit = defineEmits(['onClose']);

const messageDisplayed = ref(false);

/** fonction permettant de copier la requête winIBW dans le presse-papier
 *
 */
function copyText() {
  navigator.clipboard.writeText(props.winibwRequest);
  messageDisplayed.value = true;
}

function emitOnClose() {
  messageDisplayed.value = false;
  emit('onClose', false);
}
</script>
