<template></template>
<script setup>

import { onMounted, onUnmounted } from 'vue'
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault()
      previousSelectedItem()
      break;
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault()
      nextSelectedItem()
      break;
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const currentPpn = defineModel('currentPpn', {type: [String, null]});
const props = defineProps({itemsSortedAndFiltered: Array });


function nextSelectedItem() {
  let index = props.itemsSortedAndFiltered.findIndex(item => item.ppn === currentPpn.value);
  if (index < props.itemsSortedAndFiltered.length - 1) {
    currentPpn.value = props.itemsSortedAndFiltered[index + 1].ppn;
  }
}

function previousSelectedItem() {
  let index = props.itemsSortedAndFiltered.findIndex(item => item.ppn === currentPpn.value);
  if (index > 0) {
    currentPpn.value = props.itemsSortedAndFiltered[index - 1].ppn;
  }
}

</script>