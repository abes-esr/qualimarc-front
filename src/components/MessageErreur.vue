<template>
  <v-alert v-if="backendErrorMessage !== null || messageError !== null"
           border="start"
           colored-border
           variant="outlined"
           type="error"
           elevation="2">
    <div v-if="backendMessageText">
      {{ backendMessageText }}
    </div>
    <div v-if="messageError">
      {{ messageError }}
    </div>
    <div v-if="backendDebugText">
      {{ backendDebugText }}
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  backendErrorMessage: { type: Object, default: null },
  messageError: { type: String, default: null }
});

const backendMessageText = computed(() => {
  const err = props.backendErrorMessage
  if (!err) return null
  const resp = err.response
  if (resp && resp.data) {
    const baseMsg = resp.data && resp.data.message ? resp.data.message : ''
    const statusText = resp.statusText ?? ''
    const status = resp.status ?? ''
    const suffix = statusText || status ? ` (${statusText} : ${status})` : ''
    return `${baseMsg}${suffix}`.trim()
  }
  // No response (e.g., Axios ERR_NETWORK)
  // Prefer the generic error message provided by Axios
  return err.message || 'Une erreur est survenue.'
})

const backendDebugText = computed(() => {
  const err = props.backendErrorMessage
  return err && err.response && err.response.data && err.response.data.debugMessage
    ? err.response.data.debugMessage
    : null
})
</script>
