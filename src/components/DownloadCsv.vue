<template>
  <v-btn :disabled="disabled"  @click="download" class="button" flat :size="size" color="#0c5c92">
    <slot></slot>
  </v-btn>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  name: {
    type: String,
    default: 'data.csv'
  },
  delimiter: {
    type: String,
    default: ','
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

function convertToCsv(dataArray, delimiter) {
  if (!dataArray || dataArray.length === 0) return '';

  const headers = Object.keys(dataArray[0]);
  const csvRows = [headers.join(delimiter)];

  for (const row of dataArray) {
    const values = headers.map(h => {
      const val = row[h] ?? '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(delimiter));
  }

  return csvRows.join('\n');
}

function download() {
  const csvContent = convertToCsv(props.data, props.delimiter);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.name;
  a.click();
  URL.revokeObjectURL(url);
}
</script>