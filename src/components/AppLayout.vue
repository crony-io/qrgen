<template>
  <div class="min-h-screen text-body backdrop-blur-3xl relative z-10">
    <AppHeader />
    <ToastContainer />

    <main class="mx-auto px-4 py-8">
      <slot />
    </main>

    <AppFooter />
  </div>
  <div
    class="fixed top-4 left-4 w-64 h-64 lg:w-lg lg:h-lg xl:w-xl xl:h-xl rounded-full bg-conic/decreasing from-accent via-primary to-accent opacity-30"
  ></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';
import ToastContainer from './ToastContainer.vue';
import { useLanguage } from '../composables/useI18n';

const { initLocale } = useLanguage();

onMounted(() => {
  initLocale();
});
</script>
