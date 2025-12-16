<template>
  <div class="min-h-screen bg-page text-body">
    <AppHeader />
    <ToastContainer />

    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './AppHeader.vue';
import ToastContainer from './ToastContainer.vue';
import { useLanguage } from '../composables/useI18n';

const { initLocale } = useLanguage();

onMounted(() => {
  initLocale();
});
</script>
