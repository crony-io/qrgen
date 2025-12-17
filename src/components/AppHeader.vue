<script setup lang="ts">
import LanguageSelector from './LanguageSelector.vue';
import ThemeSelector from './ThemeSelector.vue';
import AppLogo from './ui/AppLogo.vue';
</script>
<template>
  <header class="border-b border-border">
    <div class="mx-auto p-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Title -->
        <div class="flex items-center space-x-3">
          <AppLogo class="h-8 w-8 text-accent" aria-hidden="true" />
          <h1 class="text-xl font-semibold text-body">
            {{ $t('app.title') }}
          </h1>
        </div>

        <!-- Controls -->
        <div class="flex items-center space-x-4">
          <LanguageSelector />

          <!-- Theme Toggle -->
          <ThemeSelector />
        </div>
      </div>
    </div>
  </header>
</template>
