<template>
  <q-card
    bordered
    class="card"
    :class="{ 'bg-orange': data.selected && !editMode }"
    @click="emit('click', data.id, data.selected)"
  >
    <q-img
      :src="data.image || defaultTeamMemberImageSrc"
      class="image"
      :class="{ 'not-available': !data.available }"
      fit="cover"
    />

    <q-card-section>
      <q-input v-if="editMode" v-model="name" />
      <div v-else class="name text-h6">{{ data.name }}</div>
      <span v-if="notAvailable">{{ t('isOutOfOffice') }}</span>
      <span v-if="selected">{{ t('startsToday') }}</span>
    </q-card-section>

    <q-separator v-if="editMode" />

    <q-card-actions v-if="editMode" align="right">
      <ImageDropdownButton
        :label="t('changeImage')"
        @select="(index) => onSelectImage(index)"
        @delete="(index) => onDeleteImage(index)"
      />
      <q-btn flat round color="red" icon="delete" @click="remove" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TeamMember } from 'src/pinia/model';
import { useStore } from 'src/pinia';
import { t } from 'src/i18n';
import useFiles from 'src/composables/useFiles';
import ImageDropdownButton from 'components/Settings/SettingsImageDropdownButton.vue';
import { useConfirmDialog } from 'src/composables/useConfirmDialog';

const props = withDefaults(
  defineProps<{
    data: TeamMember;
    editMode?: boolean;
  }>(),
  { editMode: false }
);

const emit = defineEmits<{
  (e: 'click', id: string, selected: boolean): void;
}>();

const store = useStore();
const { defaultTeamMemberImageSrc, deleteImage } = useFiles();
const { show } = useConfirmDialog();

const images = computed(() => store.images);
const selected = computed(() => props.data.selected && !props.editMode);
const notAvailable = computed(() => !props.data.available && !props.editMode);

const name = computed({
  get() {
    return store.getTeamMemberNameById(props.data.id);
  },
  set(name: string) {
    store.setTeamMemberName({ id: props.data.id, name });
  },
});

const remove = () => {
  const confirmHook = () => {
    store.removeTeamMember({ id: props.data.id });
  };
  show(confirmHook);
};

const onDeleteImage = async (index: number) => {
  await deleteImage(images.value[index].name);
  store.deleteImage(index);
};

const onSelectImage = (index: number) => {
  store.setTeamMemberImage({
    id: props.data.id,
    image: images.value[index].src,
  });
};
</script>

<style scoped>
.card {
  width: 100%;
  max-height: 400px;
  max-width: 250px;
}

.name {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image {
  height: 250px;
}

.not-available {
  opacity: 0.5;
}
</style>
