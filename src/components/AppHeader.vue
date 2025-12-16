<script setup lang="ts">
import { QrCode } from 'lucide-vue-next';
import LanguageSelector from './LanguageSelector.vue';
import ThemeSelector from './ThemeSelector.vue';
</script>
<template>
  <header class="border-b border-border bg-page">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Title -->
        <div class="flex items-center space-x-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <QrCode class="h-5 w-5 text-page" aria-hidden="true" />
          </div>
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
