<template>
  <AppLayout>
    <div class="flex flex-col gap-8">
      <section class="panel text-center">
        <div class="flex flex-col items-center gap-3">
          <span
            class="inline-flex items-center rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-medium text-body"
          >
            {{ $t('app.welcome.badge') }}
          </span>
          <h2 class="text-3xl font-bold text-body sm:text-4xl">
            {{ $t('app.welcome.title') }}
          </h2>
          <p class="text-lg text-muted">
            {{ $t('app.welcome.description') }}
          </p>
        </div>
      </section>

      <QRGenerator />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/AppLayout.vue';
import QRGenerator from './components/QRGenerator.vue';
</script>
