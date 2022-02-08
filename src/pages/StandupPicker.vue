<template>
  <div>
    <q-btn-group spread>
      <q-btn
        color="primary"
        :label="t('start')"
        icon="play_arrow"
        :disable="startDisabled"
        @click="start"
      />
      <q-btn
        color="secondary"
        :label="t('reset')"
        icon="restart_alt"
        @click="reset"
      />
    </q-btn-group>
    <q-linear-progress
      v-if="progress !== null"
      size="25px"
      class="q-mt-lg"
      :value="progress"
      color="secondary"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="white"
          text-color="secondary"
          :label="
            t('minRemaining', [
              {
                key: 'minutes',
                value: remainingStandupMinutes,
              },
            ])
          "
        />
      </div>
    </q-linear-progress>
    <div class="row justify-evenly q-gutter-md q-mt-md">
      <TeamMemberCard
        v-for="data in data.teamMembers"
        :key="data.id"
        :data="data"
        @click="(id, selected) => onMemberClick(id, selected)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, Ref, ref, watch } from 'vue';
import * as _ from 'lodash';
import { useInterval } from '@vueuse/core';
import { useStore } from 'src/pinia';
import { TeamMember } from 'src/pinia/model';
import { t } from 'src/i18n';
import TeamMemberCard from 'components/TeamMemberCard.vue';
import { useAudio } from 'src/composables/useAudio';

const store = useStore();
const { play: playAudio, stop: stopAudio } = useAudio();
const counterPerSecond = useInterval(1000);

let intervalId: NodeJS.Timeout;

/** reactive section */
const statusText = ref('');
const playedReminderSound = ref(false);
const remainingStandupMinutes: Ref<number | null> = ref(null);
const passedStandupMinutes: Ref<number | null> = ref(null);
const data: { teamMembers: TeamMember[] } = reactive({ teamMembers: [] });

const teamMembers = computed(() => store.teamMembers);
const startDisabled = computed(() => store.availableTeamMembers.length === 0);

const progress = computed(() => {
  if (passedStandupMinutes.value === null) {
    return null;
  }
  return passedStandupMinutes.value / store.standupDurationInMin;
});

/** method section */
const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
};

const selectTeamMember = async () => {
  const availableMembers = store.availableTeamMembers;
  for (let i = 0; i < 5; i++) {
    data.teamMembers = getShuffledTeamMembers(availableMembers);
    await wait(250);
  }

  playSuccessSound();

  const selectedTeamMember = _.sample(availableMembers) as TeamMember;
  store.setTeamMemberSelected({
    id: selectedTeamMember.id,
    selected: true,
  });
};

const reset = () => {
  clearInterval(intervalId);
  stopAudio();
  remainingStandupMinutes.value = null;
  passedStandupMinutes.value = null;
  playedReminderSound.value = false;
  statusText.value = '';
  store.unselectAllTeamMembers();
  store.setAllTeamMembersAvailable();
};

const startStandupInterval = () => {
  statusText.value = t('remainingStandupTimeText', [
    { key: 'minutes', value: store.standupDurationInMin },
  ]);

  const standupDurationInSec = store.standupDurationInSec;
  let secondsPassed = 0;

  intervalId = setInterval(() => {
    secondsPassed += 1;
    const remainingMinutes = Math.round(
      (standupDurationInSec - secondsPassed) / 60
    );
    passedStandupMinutes.value = Math.floor(secondsPassed / 60);
    remainingStandupMinutes.value = remainingMinutes;

    if (
      !playedReminderSound.value &&
      passedStandupMinutes.value === store.standupEndReminderAfterMin
    ) {
      playReminderSound();
      playedReminderSound.value = true;
    }

    statusText.value = t('remainingStandupTimeText', [
      { key: 'minutes', value: remainingMinutes },
    ]);

    if (remainingMinutes === 0) {
      reset();
    }
  }, 1000);
};

const start = async () => {
  reset();
  await selectTeamMember();
  startStandupInterval();
};

const onMemberClick = (id: string, selected: boolean): void => {
  if (!selected) {
    store.toggleTeamMemberAvailibility({ id });
  }
};

const playSuccessSound = () => {
  if (store.standupSuccessSound) {
    playAudio(store.standupSuccessSound.name, store.standupSuccessSound.src);
  }
};

const playReminderSound = () => {
  if (store.standupEndReminderSound) {
    playAudio(
      store.standupEndReminderSound.name,
      store.standupEndReminderSound.src
    );
  }
};

const getShuffledTeamMembers = (teamMembers: TeamMember[]): TeamMember[] =>
  _.shuffle(teamMembers);

const playRandomStandupSound = () => {
  const sound = _.sample(store.standupSoundsWithoutDefaultSounds);
  if (sound) {
    playAudio(sound.name, sound.src);
  }
};

/** watch section */
watch(counterPerSecond, () => {
  const now = new Date();
  if (
    now.getSeconds() === 0 &&
    now.getHours() === Number(store.standupHour) &&
    now.getMinutes() === Number(store.standupMinute)
  ) {
    console.log('STANDUP TIME', now);
    playRandomStandupSound();
  }
});

watch(
  teamMembers,
  (newTeamMembers) => {
    data.teamMembers = newTeamMembers;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  store.unselectAllTeamMembers();
});
</script>

<style scoped></style>
