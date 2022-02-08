<template>
  <router-view />
</template>

<script setup lang="ts">
import { LOCAL_STORAGE_STATE_KEY, useStore } from 'src/pinia';

const store = useStore();
store.$subscribe((_, state) => {
  // persist the whole state to the local storage whenever it changes
  localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
});
</script>
