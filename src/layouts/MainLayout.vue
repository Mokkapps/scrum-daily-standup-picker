<template>
  <q-layout
    :style="{
      backgroundImage: `url('${backgroundImageSrc}')`,
      backgroundSize: 'cover',
    }"
  >
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Standup Picker </q-toolbar-title>
        <q-btn flat round dense icon="help_outline" @click="openAboutDialog" />
        <q-btn flat round dense icon="settings" @click="openSettings" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="q-pa-md">
        <router-view />

        <AboutDialog v-model="aboutDialogVisible" />
        <SettingsDialog v-model="settingsDialogVisible" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AboutDialog from 'components/AboutDialog.vue';
import SettingsDialog from 'components/Settings/SettingsDialog.vue';
import { useStore } from 'src/pinia';

const store = useStore();
const backgroundImageSrc = computed(() => store.backgroundImage?.src);

const settingsDialogVisible = ref(false);
const aboutDialogVisible = ref(false);

const openSettings = () => {
  settingsDialogVisible.value = !settingsDialogVisible.value;
};

const openAboutDialog = () => {
  aboutDialogVisible.value = !aboutDialogVisible.value;
};
</script>
