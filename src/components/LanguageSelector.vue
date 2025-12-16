<script setup lang="ts">
/**
 * @fileoverview Dropdown for selecting the application's language (locale).
 */

import { Check, ChevronDown, Languages } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useLanguageSwitcher } from '../composables/useI18n';
import type { SupportedLocale } from '../composables/useI18n';

const { t } = useI18n();
const { currentLocale, switchLanguage, availableLocales } = useLanguageSwitcher();

/** Whether the dropdown menu is currently open. */
const isOpen = ref(false);

/** Currently selected locale info. */
const currentOption = computed(() => {
  const match = availableLocales.value.find((locale) => locale.code === currentLocale.value);
  return match ?? availableLocales.value[0];
});

/**
 * Selects a locale and closes the dropdown.
 *
 * @param value The locale code to switch to.
 */
async function selectOption(value: SupportedLocale): Promise<void> {
  await switchLanguage(value);
  isOpen.value = false;
}

/** Toggles the dropdown menu visibility. */
function toggleDropdown(): void {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="form-control-inline glass-hover flex items-center gap-2 pr-8 text-sm font-medium transition"
      @click="toggleDropdown"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="
        t('language.selector.aria_label', { language: currentOption?.nativeName ?? currentLocale })
      "
    >
      <Languages class="h-4 w-4" aria-hidden="true" />
      <span class="hidden sm:inline">{{ currentOption?.nativeName ?? currentLocale }}</span>
      <ChevronDown
        class="h-4 w-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <ul
        v-if="isOpen"
        class="dropdown-surface absolute right-0 z-50 mt-2 w-36 origin-top-right py-1"
        role="listbox"
        :aria-activedescendant="`locale-option-${currentLocale}`"
      >
        <li
          v-for="locale in availableLocales"
          :key="locale.code"
          :id="`locale-option-${locale.code}`"
          role="option"
          :aria-selected="currentLocale === locale.code"
          class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition hover:bg-surface-hover"
          :class="currentLocale === locale.code ? 'text-body font-medium' : 'text-muted'"
          @click="selectOption(locale.code)"
        >
          <span class="flex-1">{{ locale.nativeName }}</span>
          <Check v-if="currentLocale === locale.code" class="h-4 w-4" aria-hidden="true" />
        </li>
      </ul>
    </Transition>
  </div>
</template>
