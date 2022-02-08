import { useQuasar } from 'quasar';
import { t } from 'src/i18n';

export const useConfirmDialog = () => {
  const $q = useQuasar();

  const show = (confirmHook: () => void, cancelHook?: () => void) => {
    $q.dialog({
      title: t('deleteDialogText'),
      cancel: {
        label: t('cancel'),
        color: 'secondary',
      },
      ok: {
        label: t('delete'),
        color: 'primary',
      },
      persistent: true,
    })
      .onOk(() => {
        confirmHook();
      })
      .onCancel(() => {
        cancelHook && cancelHook();
      })
      .onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel');
      });
  };

  return { show };
};
