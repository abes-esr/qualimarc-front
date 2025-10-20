<template>
  <v-alert v-if="backendErrorMessage !== null || messageError !== null"
           border="start"
           colored-border
           variant="outlined"
           type="error"
           elevation="2">
    <div v-if="backendErrorMessage">
      {{
        (backendErrorMessage.response.data.message ? backendErrorMessage.response.data.message : '') + '(' + backendErrorMessage.response.statusText + ' : ' + backendErrorMessage.response.status + ')'
      }}
    </div>
    <div v-if="messageError">
      {{ messageError }}
    </div>
    <div v-if="backendErrorMessage && backendErrorMessage.response.data.debugMessage">
      {{ backendErrorMessage.response.data.debugMessage }}
    </div>
  </v-alert>
</template>

<script setup>

import {onMounted, onUpdated} from "vue";

const props = defineProps({
  backendErrorMessage: {type: Object}, messageError: {type: String}
});

onMounted(() => {
  console.error(JSON.stringify(props.backendErrorMessage))
})

onUpdated(() => {
  console.error(JSON.stringify(props.backendErrorMessage))
})
</script>
