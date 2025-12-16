<script setup lang="ts">
/**
 * @fileoverview Dropdown for selecting the application's theme appearance.
 */

import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAppearance } from '../composables/useAppearance';
import type { Appearance } from '../types/appearance';

const { t } = useI18n();
const { appearance, updateAppearance } = useAppearance();

/** Whether the dropdown menu is currently open. */
const isOpen = ref(false);

/** Available theme options with their icons. */
const options = [
  { value: 'light', labelKey: 'theme.options.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.options.dark', icon: Moon },
  { value: 'system', labelKey: 'theme.options.system', icon: Monitor },
] as const satisfies ReadonlyArray<{ value: Appearance; labelKey: string; icon: typeof Sun }>;

type ThemeOption = (typeof options)[number];

/** Currently selected theme option. */
const currentOption = computed<ThemeOption>(
  () => options.find((option) => option.value === appearance.value) ?? options[2],
);

const currentLabel = computed(() => t(currentOption.value.labelKey));

/**
 * Selects a theme option and closes the dropdown.
 *
 * @param value The appearance value to select.
 */
function selectOption(value: Appearance): void {
  updateAppearance(value);
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
      class="form-control-inline glass-hover flex items-center gap-2 text-sm font-medium transition"
      @click="toggleDropdown"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="t('theme.selector.aria_label', { theme: currentLabel })"
    >
      <component :is="currentOption?.icon" class="h-4 w-4" aria-hidden="true" />
      <span class="hidden sm:inline">{{ currentLabel }}</span>
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
        :aria-activedescendant="`theme-option-${appearance}`"
      >
        <li
          v-for="option in options"
          :key="option.value"
          :id="`theme-option-${option.value}`"
          role="option"
          :aria-selected="appearance === option.value"
          class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition hover:bg-surface-hover"
          :class="appearance === option.value ? 'text-body font-medium' : 'text-muted'"
          @click="selectOption(option.value)"
        >
          <component :is="option.icon" class="h-4 w-4" aria-hidden="true" />
          <span class="flex-1">{{ t(option.labelKey) }}</span>
          <Check v-if="appearance === option.value" class="h-4 w-4" aria-hidden="true" />
        </li>
      </ul>
    </Transition>
  </div>
</template>
