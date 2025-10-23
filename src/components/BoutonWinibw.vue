<template>
    <v-btn @click="emitOnClick" depressed color="#B30900" class="button" size="small" :disabled="props.isDisabled">
      <v-icon color="white">mdi-cog-refresh</v-icon>
    </v-btn>
</template>

<script setup>
const props = defineProps({isDisabled: Boolean, ppnList: Array});
const emit = defineEmits(['onClick']);

function generateWinibwRequest() {
  let request = 'che';
  props.ppnList.forEach((ppn, index) => {
    if (index === 0)
      request += ' ppn ' + ppn;
    else
      request += ' OU ppn ' + ppn;
  });
  return request;
}

function emitOnClick() {
  emit('onClick', generateWinibwRequest());
}
</script>
