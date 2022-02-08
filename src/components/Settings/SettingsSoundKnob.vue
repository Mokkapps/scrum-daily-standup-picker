<template>
  <q-knob
    name="volume"
    class="text-black q-ma-md"
    v-model="volume"
    font-size="16px"
    size="90px"
    :thickness="0.2"
    color="primary"
    track-color="grey-3"
    show-value
  >
    <q-icon name="volume_up" class="q-mr-xs" />
    {{ value }}
  </q-knob>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'src/pinia';

const store = useStore();

const value = computed(() => `${store.soundVolume} %`)

const volume = computed({
  get() {
    return store.soundVolume;
  },
  set(volume: number) {
    store.soundVolume = volume;
  },
});
</script>

<style scoped></style>
