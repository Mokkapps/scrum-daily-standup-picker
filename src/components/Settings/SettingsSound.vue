<template>
  <SettingsCard
    :headline="t('selectMusicHeadline')"
    :subtitle="t('soundUploadInfo')"
    class="q-mt-lg"
  >
    <div class="row">
      <SoundCard
        v-for="(sound, index) in standupSoundsWithoutDefaultSounds"
        :key="index"
        :sound="sound"
        class="q-mr-md"
      />
    </div>

    <q-separator class="q-mt-lg" />

    <p class="text-subtitle1 q-mt-lg">{{ t('additionalSoundSettings') }}</p>
    <div class="row items-center justify-between">
      <q-btn icon="upload" @click="uploadSounds">{{ t('uploadSounds') }}</q-btn>
      <SettingsSoundKnob />
      <q-select
        v-model="successSoundModel"
        :options="soundOptions"
        outlined
        :label="t('successSoundLabel')"
        class="col-4"
      />
      <q-select
        v-model="reminderSoundModel"
        :options="soundOptions"
        outlined
        :label="t('reminderSoundLabel')"
        class="col-4"
      />
    </div>
  </SettingsCard>
</template>

<script setup lang="ts">
import SoundCard from 'components/Settings/SettingsSoundCard.vue';
import SettingsCard from 'components/Settings/SettingsCard.vue';
import useFiles from 'src/composables/useFiles';
import { computed } from 'vue';
import { useStore } from 'src/pinia';
import { t } from 'src/i18n';
import { StandupSound } from 'src/pinia/model';
import SettingsSoundKnob from 'components/Settings/SettingsSoundKnob.vue';

const store = useStore();
const { uploadSounds } = useFiles();

const standupSoundsWithoutDefaultSounds = computed(() => store.standupSounds);
const allStandupSounds = computed(() => store.standupSounds);
const soundOptions = computed(() =>
  allStandupSounds.value.map((sound: StandupSound) => sound.name)
);

const successSoundModel = computed({
  get() {
    return store.standupSuccessSound ? store.standupSuccessSound.name : '';
  },
  set(soundName: string) {
    store.setStandupSuccessSound(soundName);
  },
});

const reminderSoundModel = computed({
  get() {
    return store.standupEndReminderSound
      ? store.standupEndReminderSound.name
      : '';
  },
  set(soundName: string) {
    store.setStandupReminderSound(soundName);
  },
});
</script>

<style scoped></style>
