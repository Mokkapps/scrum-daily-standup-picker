import { useStore } from 'src/pinia';
import enUS from './en-US';
import deDe from './de-DE';

export const availableLanguages = {
  de: {
    id: 'de-DE',
    messages: deDe,
    label: 'Deutsch',
  },
  en: {
    id: 'en-US',
    messages: enUS,
    label: 'English',
  },
};

export const t = (
  key: string,
  placeholders: { key: string; value: string | number }[] = []
): string => {
  const store = useStore();

  let message = 't.b.t';

  if (store.language === availableLanguages.en.id) {
    message =
      (availableLanguages.en.messages as Record<string, string>)[key] ??
      't.b.t';
  }

  if (store.language === availableLanguages.de.id) {
    message =
      (availableLanguages.de.messages as Record<string, string>)[key] ??
      't.b.t';
  }

  for (const placeholder of placeholders) {
    message = message.replace(
      `{${placeholder.key}}`,
      placeholder.value.toString()
    );
  }

  return message;
};
