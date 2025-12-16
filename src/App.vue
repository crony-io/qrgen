<template>
  <AppLayout>
    <div class="text-center">
      <h2 class="mb-8 text-3xl font-bold text-body">
        {{ $t('app.title') }}
      </h2>
      <p class="mb-8 text-lg text-muted">
        {{ $t('app.description') }}
      </p>

      <QRGenerator />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/AppLayout.vue';
import QRGenerator from './components/QRGenerator.vue';
</script>
