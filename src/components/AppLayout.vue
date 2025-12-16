<template>
  <div class="min-h-screen bg-page text-body">
    <AppHeader />
    <ToastContainer />

    <main class="mx-auto px-4 py-8">
      <slot />
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
