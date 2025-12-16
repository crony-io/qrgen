<script setup lang="ts">
import type { EventQRData } from '../../types/qr';
import type { QRFieldErrors } from '../../utils/qrValidation';

import InputError from '../ui/InputError.vue';

defineProps<{
  data: EventQRData;
  errors?: QRFieldErrors;
  updateData: (updates: Partial<Omit<EventQRData, 'type'>>) => void;
}>();
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="form-label" for="qr-event-title">{{ $t('qr.forms.event.title_label') }}</label>
      <input
        id="qr-event-title"
        :value="data.title"
        @input="updateData({ title: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.event.title_placeholder')"
        class="form-control"
        :aria-invalid="errors?.title ? 'true' : undefined"
        :aria-describedby="errors?.title ? 'qr-event-title-error' : undefined"
        :class="errors?.title ? 'border-error focus:ring-error' : ''"
      />
      <InputError id="qr-event-title-error" :message="errors?.title" />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label" for="qr-event-start">{{
          $t('qr.forms.event.start_label')
        }}</label>
        <input
          id="qr-event-start"
          :value="data.start"
          @input="updateData({ start: ($event.target as HTMLInputElement).value })"
          type="datetime-local"
          class="form-control"
          :aria-invalid="errors?.start ? 'true' : undefined"
          :aria-describedby="errors?.start ? 'qr-event-start-error' : undefined"
          :class="errors?.start ? 'border-error focus:ring-error' : ''"
        />
        <InputError id="qr-event-start-error" :message="errors?.start" />
      </div>
      <div>
        <label class="form-label" for="qr-event-end">{{ $t('qr.forms.event.end_label') }}</label>
        <input
          id="qr-event-end"
          :value="data.end"
          @input="updateData({ end: ($event.target as HTMLInputElement).value })"
          type="datetime-local"
          class="form-control"
        />
      </div>
    </div>
    <div>
      <label class="form-label" for="qr-event-location">{{
        $t('qr.forms.event.location_label')
      }}</label>
      <input
        id="qr-event-location"
        :value="data.location"
        @input="updateData({ location: ($event.target as HTMLInputElement).value })"
        type="text"
        :placeholder="$t('qr.forms.event.location_placeholder')"
        class="form-control"
      />
    </div>
    <div>
      <label class="form-label" for="qr-event-description">{{
        $t('qr.forms.event.description_label')
      }}</label>
      <textarea
        id="qr-event-description"
        :value="data.description"
        @input="updateData({ description: ($event.target as HTMLTextAreaElement).value })"
        :placeholder="$t('qr.forms.event.description_placeholder')"
        class="form-control-textarea"
        rows="3"
      />
    </div>
  </div>
</template>
