<template>
  <div class="space-y-4">
    <!-- Text Input -->
    <TextInputQr
      v-if="data.type === 'text'"
      :data="data"
      :errors="errors"
      :updateData="updateText"
    />

    <!-- URL Input -->
    <UrlInputQr v-if="data.type === 'url'" :data="data" :errors="errors" :updateData="updateUrl" />

    <!-- Email Input -->
    <EmailInputQr
      v-if="data.type === 'email'"
      :data="data"
      :errors="errors"
      :updateData="updateEmail"
    />

    <!-- Phone Input -->
    <PhoneInputQr
      v-if="data.type === 'phone'"
      :data="data"
      :errors="errors"
      :updateData="updatePhone"
    />

    <!-- SMS Input -->
    <SmsInputQr v-if="data.type === 'sms'" :data="data" :errors="errors" :updateData="updateSms" />

    <!-- WiFi Input -->
    <WifiInputQr
      v-if="data.type === 'wifi'"
      :data="data"
      :errors="errors"
      :updateData="updateWifi"
    />

    <!-- vCard Input -->
    <VcardInputQr
      v-if="data.type === 'vcard'"
      :data="data"
      :errors="errors"
      :updateData="updateVcard"
    />

    <!-- Geo Location Input -->
    <GeoInputQr v-if="data.type === 'geo'" :data="data" :errors="errors" :updateData="updateGeo" />

    <!-- Event Input -->
    <EventInputQr
      v-if="data.type === 'event'"
      :data="data"
      :errors="errors"
      :updateData="updateEvent"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  AllQRData,
  EmailQRData,
  EventQRData,
  GeoQRData,
  PhoneQRData,
  SMSQRData,
  TextQRData,
  UrlQRData,
  VCardQRData,
  WiFiQRData,
} from '../types/qr';

import type { QRFieldErrors } from '../utils/qrValidation';

import EmailInputQr from './qr-options/EmailInputQr.vue';
import EventInputQr from './qr-options/EventInputQr.vue';
import GeoInputQr from './qr-options/GeoInputQr.vue';
import PhoneInputQr from './qr-options/PhoneInputQr.vue';
import SmsInputQr from './qr-options/SmsInputQr.vue';
import TextInputQr from './qr-options/TextInputQr.vue';
import UrlInputQr from './qr-options/UrlInputQr.vue';
import VcardInputQr from './qr-options/VcardInputQr.vue';
import WifiInputQr from './qr-options/WifiInputQr.vue';

const props = defineProps<{
  data: AllQRData;
  errors?: QRFieldErrors;
}>();

const emit = defineEmits<{
  'update:data': [data: AllQRData];
}>();

type Updates<T extends AllQRData> = Partial<Omit<T, 'type'>>;

const updateText = (updates: Updates<TextQRData>) => {
  if (props.data.type !== 'text') {
    return;
  }
  const next: TextQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateUrl = (updates: Updates<UrlQRData>) => {
  if (props.data.type !== 'url') {
    return;
  }
  const next: UrlQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateEmail = (updates: Updates<EmailQRData>) => {
  if (props.data.type !== 'email') {
    return;
  }
  const next: EmailQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updatePhone = (updates: Updates<PhoneQRData>) => {
  if (props.data.type !== 'phone') {
    return;
  }
  const next: PhoneQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateSms = (updates: Updates<SMSQRData>) => {
  if (props.data.type !== 'sms') {
    return;
  }
  const next: SMSQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateWifi = (updates: Updates<WiFiQRData>) => {
  if (props.data.type !== 'wifi') {
    return;
  }
  const next: WiFiQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateVcard = (updates: Updates<VCardQRData>) => {
  if (props.data.type !== 'vcard') {
    return;
  }
  const next: VCardQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateGeo = (updates: Updates<GeoQRData>) => {
  if (props.data.type !== 'geo') {
    return;
  }
  const next: GeoQRData = { ...props.data, ...updates };
  emit('update:data', next);
};

const updateEvent = (updates: Updates<EventQRData>) => {
  if (props.data.type !== 'event') {
    return;
  }
  const next: EventQRData = { ...props.data, ...updates };
  emit('update:data', next);
};
</script>
