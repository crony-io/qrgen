/**
 * @fileoverview Composable and helpers for persisting and applying the app theme.
 */

import { onMounted, ref } from 'vue';

import { safeGetItem, safeSetItem } from '../utils/storage';

import type { Appearance, UseAppearanceReturn } from '../types/appearance';

/**
 * Updates the document theme based on the specified appearance.
 *
 * @param value The appearance setting to apply.
 */
export function updateTheme(value: Appearance): void {
  if (value === 'system') {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQueryList.matches ? 'dark' : 'light';

    document.documentElement.classList.toggle('dark', systemTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', value === 'dark');
  }
}

/** Returns the media query for detecting system dark mode preference. */
function getMediaQuery(): MediaQueryList {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

/**
 * Parses a stored appearance string into a valid Appearance value.
 *
 * @param value The raw localStorage value.
 * @returns The parsed Appearance value, or null if invalid or missing.
 */
function parseStoredAppearance(value: string | null): Appearance | null {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return null;
}

/**
 * Retrieves the stored appearance preference from localStorage.
 *
 * @returns The stored appearance value, or null if not set.
 */
function getStoredAppearance(): Appearance | null {
  return parseStoredAppearance(safeGetItem('appearance'));
}

/** Handles system theme changes by updating the document theme. */
function handleSystemThemeChange(): void {
  const currentAppearance = getStoredAppearance();
  updateTheme(currentAppearance ?? 'system');
}

/** Initializes the theme from localStorage and sets up system theme change listener. */
export function initializeTheme(): void {
  const savedAppearance = getStoredAppearance();
  updateTheme(savedAppearance ?? 'system');
  getMediaQuery().addEventListener('change', handleSystemThemeChange);
}

const appearance = ref<Appearance>('system');

/**
 * Composable for managing application theme appearance.
 *
 * @returns Reactive appearance state and update function.
 */
export function useAppearance(): UseAppearanceReturn {
  onMounted(() => {
    const savedAppearance = getStoredAppearance();
    if (savedAppearance != null) {
      appearance.value = savedAppearance;
    }
  });

  /**
   * Updates the appearance setting and persists it to localStorage.
   *
   * @param value The new appearance value to apply.
   */
  function updateAppearance(value: Appearance): void {
    appearance.value = value;
    safeSetItem('appearance', value);
    updateTheme(value);
  }

  return {
    appearance,
    updateAppearance,
  };
}
