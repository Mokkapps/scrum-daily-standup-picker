<template>
  <SettingsStandupTime />

  <div class="row q-mt-lg q-gutter-lg">
    <SettingsCard :headline="t('changeLanguageHeadline')" class="col">
      <q-option-group
        v-model="languageGroup"
        :options="languageOptions"
        color="primary"
      />
    </SettingsCard>

    <SettingsCard :headline="t('changeBackgroundImageHeadline')" class="col">
      <div class="q-pa-md q-gutter-lg">
        <q-img
          :src="backgroundImageSrc"
          style="height: 140px; max-width: 150px"
        />
        <ImageDropdownButton
          :label="t('changeImage')"
          @select="(index) => onSelectBackgroundImage(index)"
          @delete="(index) => onDeleteBackgroundImage(index)"
        />
      </div>
    </SettingsCard>
  </div>

  <SettingsCard
    :headline="t('configureTeamHeadline')"
    :subtitle="t('imageUploadInfo')"
    class="q-mt-lg"
  >
    <div class="row fit wrap justify-start items-center content-start">
      <TeamMemberCard
        v-for="data in teamMembers"
        :key="data.id"
        :data="data"
        edit-mode
        class="q-ma-sm"
      />
      <q-btn icon="add" size="xl" @click="onAdd" />
    </div>
  </SettingsCard>

  <SettingsSound />

  <SettingsCard :headline="t('dangerZone')" class="q-mt-lg">
    <q-btn
      color="red"
      icon="warning"
      :label="t('deleteStoredData')"
      @click="deleteStoredData"
    />
  </SettingsCard>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import { LOCAL_STORAGE_STATE_KEY, useStore } from 'src/pinia';
import { TeamMember } from 'src/pinia/model';
import useFiles from 'src/composables/useFiles';
import TeamMemberCard from 'components/TeamMemberCard.vue';
import ImageDropdownButton from 'components/Settings/SettingsImageDropdownButton.vue';
import SettingsSound from 'components/Settings/SettingsSound.vue';
import { availableLanguages, t } from 'src/i18n';
import SettingsCard from 'components/Settings/SettingsCard.vue';
import { useConfirmDialog } from 'src/composables/useConfirmDialog';
import SettingsStandupTime from 'components/Settings/SettingsStandupTime.vue';

const store = useStore();
const $q = useQuasar();
const { show } = useConfirmDialog();
const { defaultTeamMemberImageSrc, deleteAllFiles, deleteImage } = useFiles();

/** reactive section */
const images = computed(() => store.images);
const backgroundImageSrc = computed(() => store.backgroundImage?.src);

const teamMembers = computed(() => store.teamMembers);
const teamMemberInputData: Record<string, unknown> = reactive({});

const languageGroup = computed({
  get() {
    return store.language;
  },
  set(language: string) {
    store.language = language;
  },
});

const languageOptions = Object.entries(availableLanguages).map(
  ([, { id, label }]) => ({ label, value: id })
);

/** method section */
const onDeleteBackgroundImage = async (index: number) => {
  await deleteImage(images.value[index].name);
  store.deleteImage(index);
};

const onSelectBackgroundImage = (index: number) => {
  store.backgroundImage = images.value[index];
};

const onAdd = () => store.addTeamMember(defaultTeamMemberImageSrc.value);

const deleteStoredData = () => {
  const confirmHook = () => {
    store.$reset();
    localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
    deleteAllFiles()
      .then(() => {
        $q.notify({ type: 'positive', message: t('successDeleteStorage') });
      })
      .catch((e) => console.error(e));
  };

  show(confirmHook);
};

/** watch section */
watch(
  teamMembers,
  () => {
    teamMembers.value.forEach(({ id }: TeamMember) => {
      teamMemberInputData[id] = {
        name: computed({
          get() {
            return store.getTeamMemberNameById(id);
          },
          set(newValue: string) {
            store.setTeamMemberName({ id, name: newValue });
          },
        }),
        image: computed({
          get() {
            return store.getTeamMemberImageById(id);
          },
          set(newValue: string) {
            store.setTeamMemberImage({ id, image: newValue });
          },
        }),
      };
    });
  },
  { immediate: true, deep: true }
);
</script>

<style scoped></style>
