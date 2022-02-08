<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    maximized
  >
    <q-card>
      <q-toolbar>
        <q-toolbar-title
          ><span class="text-weight-bold">{{ t('settings') }}</span>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section>
        <Settings />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import Settings from 'components/Settings/Settings.vue';
import { t } from 'src/i18n';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped></style>
