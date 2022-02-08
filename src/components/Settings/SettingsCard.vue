<template>
  <q-card>
    <q-card-section>
      <p class="text-h6">{{ headline }}</p>
      <p v-if="subtitle" class="text-subtitle1">{{ subtitle }}</p>
    </q-card-section>
    <q-card-section>
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ headline: string; subtitle?: string }>();
</script>

<style scoped></style>
