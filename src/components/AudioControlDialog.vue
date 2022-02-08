<template>
  <q-dialog ref="dialogRef" seamless position="bottom" @hide="onDialogHide">
    <q-card style="width: 350px">
      <q-linear-progress v-if="progress" :value="progress" color="secondary" />

      <q-card-section class="row items-center no-wrap">
        <div>
          <div class="text-weight-bold">{{ title }}</div>
        </div>

        <q-space />

        <q-btn flat round icon="stop" @click="onStopClick" v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';

export default {
  props: {
    title: String,
    progress: {
      type: Number,
      required: false,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup() {
    const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

    return {
      dialogRef,
      onDialogHide,
      // passthrough onDialogOK directly
      onStopClick: onDialogOK,
    };
  },
};
</script>

<style scoped></style>
