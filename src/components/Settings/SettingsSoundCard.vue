<template>
  <q-card>
    <q-card-section>
      <q-checkbox v-model="inputData.checkbox" :disable="modifyActionsDisabled"
        >{{ sound.name
        }}<q-tooltip v-if="modifyActionsDisabled">
          {{ t('tooltipDefaultSoundsCheck') }}
        </q-tooltip></q-checkbox
      >
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        flat
        round
        :icon="isPlaying ? 'stop' : 'play_arrow'"
        @click="onPlaybackClick"
      />
      <q-btn
        flat
        round
        color="red"
        icon="delete"
        :disable="modifyActionsDisabled"
        @click="onDeleteSound"
        ><q-tooltip v-if="modifyActionsDisabled">
          {{ t('tooltipDefaultSoundsDelete') }}
        </q-tooltip></q-btn
      >
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { StandupSound } from 'src/pinia/model';
import { computed, reactive } from 'vue';
import { useStore } from 'src/pinia';
import useFiles, {
  DEFAULT_REMINDER_SOUND_NAME,
  DEFAULT_SUCCESS_SOUND_NAME,
} from 'src/composables/useFiles';
import { t } from 'src/i18n';
import { useConfirmDialog } from 'src/composables/useConfirmDialog';
import { useAudio } from 'src/composables/useAudio';

const props = defineProps<{ sound: StandupSound }>();

const { show } = useConfirmDialog();
const store = useStore();
const { deleteSound } = useFiles();
const { toggle, isPlaying } = useAudio();

const inputData = reactive({
  checkbox: computed({
    get() {
      return props.sound.selected;
    },
    set(selected: boolean) {
      store.setSoundSelected(props.sound.name, selected);
    },
  }),
});
const modifyActionsDisabled = computed(
  () =>
    props.sound.name === DEFAULT_REMINDER_SOUND_NAME ||
    props.sound.name === DEFAULT_SUCCESS_SOUND_NAME
);

const onDeleteSound = () => {
  const confirmHook = () => {
    deleteSound(props.sound.name).catch((e) => console.error(e));
  };

  show(confirmHook);
};

const onPlaybackClick = () => {
  toggle(props.sound.name, props.sound.src);
};
</script>

<style scoped></style>
