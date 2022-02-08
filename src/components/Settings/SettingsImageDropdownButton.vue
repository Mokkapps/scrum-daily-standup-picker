<template>
  <q-btn-dropdown color="primary" :label="label">
    <q-list>
      <q-item>
        <q-item-section>
          <q-btn
            color="primary"
            icon="upload"
            :label="t('uploadImage')"
            @click="uploadImages"
          />
        </q-item-section>
      </q-item>
      <q-item
        v-for="(image, index) in images"
        :key="index"
        clickable
        v-close-popup
        @click="() => emit('select', index)"
      >
        <q-item-section avatar>
          <q-avatar rounded>
            <img :src="image.src" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ image.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            color="red"
            icon="delete"
            @click.stop="() => emit('delete', index)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { t } from 'src/i18n';
import useFiles from 'src/composables/useFiles';
import { useStore } from 'src/pinia';
import { computed } from 'vue';

defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
  (e: 'delete', index: number): void;
}>();

const { uploadImages } = useFiles();
const store = useStore();

const images = computed(() => store.images);
</script>

<style scoped></style>
