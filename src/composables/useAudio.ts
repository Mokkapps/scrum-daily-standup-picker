import { computed, Ref, ref, watch } from 'vue';
import { Howl } from 'howler';
import { DialogChainObject, useQuasar } from 'quasar';
import AudioControlDialog from 'components/AudioControlDialog.vue';
import { useStore } from 'src/pinia';

export const useAudio = () => {
  const $q = useQuasar();
  const store = useStore();
  let dialog: DialogChainObject | null = null;
  let intervalId: number | undefined;
  let howl: Howl | null = null;

  const title: Ref<string> = ref('');
  const progress: Ref<number | null> = ref(null);
  const isPlaying: Ref<boolean | undefined> = ref(false);

  const volume = computed(() => store.soundVolume / 100);

  const showAudioControlDialog = () => {
    dialog = $q
      .dialog({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        component: AudioControlDialog,
        // props forwarded to your custom component
        componentProps: {
          title: title.value,
        },
      })
      .onDismiss(() => {
        stop();
        dialog = null;
      });
  };

  const hideAudioControlDialog = () => {
    if (dialog) {
      dialog.hide();
      dialog = null;
    }
  };

  const updateProgress = () => {
    isPlaying.value = howl?.playing();

    if (isPlaying.value && howl) {
      const howlProgress = (howl.seek() / howl.duration()) * 100;
      progress.value = howlProgress / 100;

      dialog &&
        dialog.update({
          progress: progress.value,
        });
    } else {
      progress.value = null;
      hideAudioControlDialog();
    }
  };

  const play = (audioTitle: string, audioSrc: string | null): void => {
    if (audioSrc === null) {
      return;
    }

    title.value = audioTitle;

    howl = new Howl({
      src: [audioSrc],
    });

    if (howl) {
      howl.volume(volume.value);
      howl.play();

      isPlaying.value = true;
      showAudioControlDialog();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      intervalId = setInterval(() => {
        updateProgress();
      }, 300);
    }
  };

  const stop = () => {
    if (isPlaying.value) {
      howl?.stop();
      isPlaying.value = false;
      clearInterval(intervalId);
      hideAudioControlDialog();
    }
  };

  const toggle = (audioTitle: string, audioSrc: string | null) => {
    if (isPlaying.value) {
      stop();
    } else {
      play(audioTitle, audioSrc);
    }
  };

  watch(volume, (newVolume) => {
    if (howl) {
      howl.volume(newVolume);
    }
  });

  return {
    title,
    progress,
    isPlaying,
    play,
    stop,
    toggle,
  };
};
