<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  text: string
  warning?: boolean
}>();
</script>

<template>
  <div class="card emptyCard">
    <span :class="['emptyIcon', {warning}]">
      <i :class="['fas', icon]"></i>
    </span>
    <strong>{{ title }}</strong>
    <p>{{ text }}</p>
  </div>
</template>
