<template>
  <div class="row q-gutter-x-lg q-mt-lg">
    <SettingsCard
      :headline="t('startupStartHeadline')"
      :subtitle="
        t('nextStandupStarts', [
          { key: 'distance', value: formattedDistanceTillNextStandup },
        ])
      "
      class="col"
    >
      <div class="row">
        <q-time v-model="time" :format24h="format24h" />
        <q-toggle v-model="format24h" :label="t('format24hLabel')" />
      </div>
    </SettingsCard>

    <div class="col">
      <SettingsCard :headline="t('startupDurationHeadline')">
        <div class="row">
          <q-slider
            v-model="durationInMin"
            :min="0"
            :max="60"
            :step="5"
            label
            :label-value="durationInMin + ' min'"
            label-always
          />
        </div>
      </SettingsCard>
      <SettingsCard :headline="t('startupEndHeadline')" class="q-mt-xl">
        <div class="row">
          <q-slider
            v-model="reminderMinutes"
            :min="1"
            :max="durationInMin"
            :step="1"
            label
            :label-value="reminderMinutes + ' min'"
            label-always
          />
        </div>
      </SettingsCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsCard from 'components/Settings/SettingsCard.vue';
import { computed, onBeforeUnmount, ref } from 'vue';
import { formatDistanceToNow, isPast, set } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useStore } from 'src/pinia';
import { availableLanguages, t } from 'src/i18n';

const store = useStore();

const format24h = computed({
  get() {
    return store.format24h;
  },
  set(format24h: boolean) {
    store.format24h = format24h;
  },
});

const durationInMin = computed({
  get() {
    return store.standupDurationInMin;
  },
  set(durationInMin: number) {
    store.standupDurationInMin = durationInMin;
  },
});

const reminderMinutes = computed({
  get() {
    return store.standupEndReminderAfterMin;
  },
  set(value: number) {
    store.standupEndReminderAfterMin = value;
  },
});

const time = computed({
  get() {
    return `${String(store.standupHour).padStart(2, '0')}:${String(
      store.standupMinute
    ).padStart(2, '0')}`;
  },
  set(time: string) {
    const [hour, minute] = time.split(':');
    store.standupHour = Number(hour);
    store.standupMinute = Number(minute);
    formattedDistanceTillNextStandup.value =
      getFormattedDistanceTillNextStandup();
  },
});

const getFormattedDistanceTillNextStandup = () => {
  const now = new Date();
  let standupDate = set(now, {
    hours: store.standupHour,
    minutes: store.standupMinute,
    seconds: 0,
  });

  if (isPast(standupDate)) {
    standupDate = set(now, {
      hours: store.standupHour,
      minutes: store.standupMinute,
      seconds: 0,
      date: now.getDate() + 1,
    });
  }

  const locale = store.language === availableLanguages.en.id ? enUS : de;

  return formatDistanceToNow(standupDate, { addSuffix: true, locale });
};

const formattedDistanceTillNextStandup = ref(
  getFormattedDistanceTillNextStandup()
);

const intervalId = setInterval(() => {
  formattedDistanceTillNextStandup.value =
    getFormattedDistanceTillNextStandup();
}, 60 * 1000);

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped></style>
