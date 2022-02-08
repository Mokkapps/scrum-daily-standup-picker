<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card>
      <q-card-section>
        <p class="text-h5">
          Standup Picker (Version {{ packageJson.version }})
        </p>
        <p>{{ t('developedBy') }}</p>
      </q-card-section>
      <q-card-actions align="evenly" class="q-mb-lg">
        <q-btn round :icon="fabGithub" @click="openGithubRepo" />
        <q-btn round :icon="fasExternalLinkAlt" @click="openWebsite" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { fabGithub, fasExternalLinkAlt } from '@quasar/extras/fontawesome-v5';
import { electronApi } from 'src/electron-api';
import { t } from 'src/i18n';
import packageJson from '../../package.json';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const openGithubRepo = () => {
  electronApi.openExternal(
    'https://github.com/Mokkapps/scrum-daily-standup-picker'
  );
};

const openWebsite = () => {
  electronApi.openExternal('https://mokkapps.de');
};
</script>

<style scoped></style>
