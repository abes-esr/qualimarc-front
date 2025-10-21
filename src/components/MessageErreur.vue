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

const props = defineProps({
  backendErrorMessage: {type: Object}, messageError: {type: String}
});
</script>
