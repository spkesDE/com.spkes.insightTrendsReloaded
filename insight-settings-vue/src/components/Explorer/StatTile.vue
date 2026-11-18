<script setup lang="ts">
import {ref} from "vue";

defineProps<{
  label: string
  value: string | number
  unit?: string
}>();

// Long values are cut to one line. A tap shows the full value.
const expanded = ref(false);
</script>

<template>
  <button
    type="button"
    :class="['card', 'statTile', 'hy-nostyle', {expanded}]"
    :title="String(value)"
    @click="expanded = !expanded"
  >
    <span class="tileLabel">{{ label }}</span>
    <span class="tileValue">
      <span class="tileNumber">{{ value }}</span>
      <span
        v-if="unit"
        class="tileUnit"
      >{{ unit }}</span>
    </span>
    <slot />
  </button>
</template>
