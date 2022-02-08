import { computed } from 'vue';
import { Notify } from 'quasar';
import { useStore } from 'src/pinia';
import { electronApi, ElectronFileFilter } from 'src/electron-api';
import { t } from 'src/i18n';

const IMAGES_FILTER: ElectronFileFilter = {
  name: 'Images',
  extensions: ['jpg', 'jpeg', 'png'],
};
const SOUNDS_FILTER: ElectronFileFilter = {
  name: 'Sounds',
  extensions: ['wav', 'mp3', 'ogg', 'm4a'],
};
export const IMAGES_FOLDER_NAME = 'images';
export const SOUNDS_FOLDER_NAME = 'sounds';
export const DEFAULT_SUCCESS_SOUND_NAME = 'Success';
export const DEFAULT_REMINDER_SOUND_NAME = 'Reminder';
export const DEFAULT_BACKGROUND_IMAGE_NAME = 'Default Background';
export const DEFAULT_TEAM_MEMBER_IMAGE_NAME = 'Team Member Placeholder';

export const DEFAULT_SUCCESS_SOUND = {
  name: DEFAULT_SUCCESS_SOUND_NAME,
  src: `${SOUNDS_FOLDER_NAME}/success.wav`,
  selected: false,
};

export const DEFAULT_REMINDER_SOUND = {
  name: DEFAULT_REMINDER_SOUND_NAME,
  src: `${SOUNDS_FOLDER_NAME}/tickTock.wav`,
  selected: false,
};

export const DEFAULT_SOUNDS = [DEFAULT_SUCCESS_SOUND, DEFAULT_REMINDER_SOUND];

export const DEFAULT_BACKGROUND_IMAGE = {
  name: DEFAULT_BACKGROUND_IMAGE_NAME,
  src: `${IMAGES_FOLDER_NAME}/background.jpg`,
};
export const DEFAULT_IMAGES = [
  DEFAULT_BACKGROUND_IMAGE,
  {
    name: DEFAULT_TEAM_MEMBER_IMAGE_NAME,
    src: `${IMAGES_FOLDER_NAME}/placeholder.png`,
  },
];

function useFiles() {
  const store = useStore();

  const defaultBackgroundSrc = computed(
    () =>
      store.images.find((file) => file.name === DEFAULT_BACKGROUND_IMAGE_NAME)
        ?.src
  );
  const defaultTeamMemberImageSrc = computed(
    () =>
      store.images.find((file) => file.name === DEFAULT_TEAM_MEMBER_IMAGE_NAME)
        ?.src
  );

  const updateFiles = async () => {
    try {
      const [imagesFromUserData, soundsFromUserData] =
        await getFilesFromUserDataDirectory();

      store.images = [...DEFAULT_IMAGES, ...imagesFromUserData];
      store.setStandupSounds(soundsFromUserData);

      store.addDefaultImageToAllTeamMembersWithoutImage(
        defaultTeamMemberImageSrc.value
      );
    } catch (e) {
      const errorMessage = t('notificationUpdateFail');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  const uploadImages = async () => {
    try {
      const filePaths = await electronApi.openFileDialog(
        'Select images',
        IMAGES_FOLDER_NAME,
        IMAGES_FILTER
      );
      const promises = filePaths.map((filePath) =>
        electronApi.writeFile(IMAGES_FOLDER_NAME, filePath)
      );
      await Promise.all(promises);
      await updateFiles();
      triggerPositive(t('notificationUploadImageSuccess'));
    } catch (e) {
      const errorMessage = t('notificationUploadImageError');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  const uploadSounds = async () => {
    try {
      const filePaths = await electronApi.openFileDialog(
        'Select sounds',
        SOUNDS_FOLDER_NAME,
        SOUNDS_FILTER
      );
      const promises = filePaths.map((filePath) =>
        electronApi.writeFile(SOUNDS_FOLDER_NAME, filePath)
      );
      await Promise.all(promises);
      await updateFiles();
      triggerPositive('Uploaded sounds');
    } catch (e) {
      const errorMessage = t('notificationUploadSoundError');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  const deleteSound = async (filePath: string) => {
    try {
      await electronApi.deleteFile(SOUNDS_FOLDER_NAME, filePath);
      await updateFiles();
      triggerPositive(t('notificationDeleteSoundSuccess'));
    } catch (e) {
      const errorMessage = t('notificationDeleteSoundError');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  const deleteImage = async (filePath: string) => {
    try {
      await electronApi.deleteFile(IMAGES_FOLDER_NAME, filePath);
      triggerPositive(t('notificationDeleteImageSuccess'));
    } catch (e) {
      const errorMessage = t('notificationDeleteImageError');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  const deleteAllFiles = async () => {
    try {
      await electronApi.deleteDirectory(IMAGES_FOLDER_NAME);
      await electronApi.deleteDirectory(SOUNDS_FOLDER_NAME);
      store.images = [...DEFAULT_IMAGES];
      store.setStandupSounds([...DEFAULT_SOUNDS]);
    } catch (e) {
      const errorMessage = t('notificationDeleteAllFilesError');
      console.error(errorMessage, e);
      triggerNegative(errorMessage);
    }
  };

  return {
    defaultBackgroundSrc,
    defaultTeamMemberImageSrc,
    updateFiles,
    uploadImages,
    uploadSounds,
    deleteSound,
    deleteImage,
    deleteAllFiles,
  };
}

async function getFilesFromUserDataDirectory() {
  return Promise.all([
    electronApi.getBase64ImagesFromDirectory('images'),
    electronApi.getBase64SoundsFromDirectory('sounds'),
  ]);
}

function triggerPositive(message: string) {
  Notify.create({
    type: 'positive',
    color: 'positive',
    timeout: 2500,
    position: 'bottom',
    message,
  });
}

function triggerNegative(message: string) {
  Notify.create({
    type: 'negative',
    color: 'negative',
    timeout: 2500,
    position: 'bottom',
    message,
  });
}

export default useFiles;
