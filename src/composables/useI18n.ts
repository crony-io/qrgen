import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { safeGetItem, safeSetItem } from '../utils/storage';

export type SupportedLocale =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ar'
  | 'pt'
  | 'ja'
  | 'ru'
  | 'it'
  | 'ko';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
];

export const STORAGE_KEY = 'qrgen-locale';

function getBrowserLocale(): string | null {
  try {
    if (typeof navigator === 'undefined') {
      return null;
    }
    return (
      navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || null
    );
  } catch {
    return null;
  }
}

function normalizeLocale(locale: string): string {
  return locale.split('-')[0] || locale;
}

export function detectInitialLocale(
  availableLocales: readonly string[],
  fallbackLocale: string = 'en',
): string {
  const stored = safeGetItem(STORAGE_KEY);
  if (stored && availableLocales.includes(stored)) {
    return stored;
  }

  const browserLocale = getBrowserLocale();
  if (browserLocale) {
    const normalized = normalizeLocale(browserLocale);
    if (availableLocales.includes(normalized)) {
      return normalized;
    }
  }

  return fallbackLocale;
}

export function getLocaleInfo(localeCode: string): LocaleInfo | undefined {
  return SUPPORTED_LOCALES.find((l) => l.code === localeCode);
}

export function isLocaleRTL(localeCode: string): boolean {
  return getLocaleInfo(localeCode)?.rtl ?? false;
}

export function applyDocumentLocale(localeCode: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = localeCode;
  document.documentElement.dir = isLocaleRTL(localeCode) ? 'rtl' : 'ltr';
}

export function useLanguageSwitcher() {
  const i18n = useI18n();
  const currentLocale = computed(() => i18n.locale.value as SupportedLocale);

  const isRTL = computed(() => isLocaleRTL(currentLocale.value));

  const switchLanguage = async (newLocale: SupportedLocale) => {
    try {
      if (!i18n.availableLocales.includes(newLocale)) {
        return false;
      }

      // Set locale
      i18n.locale.value = newLocale;
      safeSetItem(STORAGE_KEY, newLocale);
      applyDocumentLocale(newLocale);

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to switch language:', error);
      }
      return false;
    }
  };

  const availableLocales = computed(() => {
    const localeCodes = i18n.availableLocales;
    return SUPPORTED_LOCALES.filter((l) => localeCodes.includes(l.code));
  });

  return {
    currentLocale,
    isRTL,
    switchLanguage,
    getLocaleInfo,
    availableLocales,
  };
}

export function useLanguage() {
  const { locale, availableLocales } = useI18n();

  const currentLocale = computed(() => locale.value);

  const setLocale = (newLocale: string) => {
    if (!availableLocales.includes(newLocale)) {
      return;
    }
    locale.value = newLocale;
    safeSetItem(STORAGE_KEY, newLocale);
    applyDocumentLocale(newLocale);
  };

  const initLocale = () => {
    const initialLocale = detectInitialLocale(availableLocales, locale.value);
    if (availableLocales.includes(initialLocale)) {
      locale.value = initialLocale;
    }
    applyDocumentLocale(locale.value);
  };

  return {
    currentLocale,
    setLocale,
    initLocale,
    availableLocales,
  };
}
