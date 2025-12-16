<template>
  <div class="mb-6">
    <label id="qr-type-selector-label" class="mb-3 block text-sm font-medium text-muted">
      {{ $t('qr.type_selector.label') }}
    </label>

    <div
      class="grid grid-cols-3 gap-3 sm:grid-cols-5"
      role="radiogroup"
      aria-labelledby="qr-type-selector-label"
    >
      <button
        v-for="(type, index) in qrTypes"
        :key="type.value"
        ref="buttons"
        type="button"
        role="radio"
        :aria-checked="modelValue === type.value"
        :tabindex="modelValue === type.value ? 0 : -1"
        @click="selectType(type.value)"
        @keydown="onKeydown($event, index)"
        :class="[
          'flex flex-col items-center justify-center rounded-lg border p-3 transition-colors',
          modelValue === type.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-surface text-muted hover:bg-surface-hover',
        ]"
        :title="$t(`qr.types.${type.value}.description`)"
      >
        <component :is="type.icon" class="mb-1 h-5 w-5" aria-hidden="true" />
        <span class="text-xs font-medium">{{ $t(`qr.types.${type.value}.label`) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { QRDataType } from '../types/qr';
import {
  Type as TextIcon,
  Link as UrlIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  MessageSquare as SmsIcon,
  Wifi as WifiIcon,
  User as VCardIcon,
  MapPin as GeoIcon,
  Calendar as EventIcon,
} from 'lucide-vue-next';

interface QRType {
  value: QRDataType;
  icon: typeof TextIcon;
}

const qrTypes: QRType[] = [
  { value: 'text', icon: TextIcon },
  { value: 'url', icon: UrlIcon },
  { value: 'email', icon: EmailIcon },
  { value: 'phone', icon: PhoneIcon },
  { value: 'sms', icon: SmsIcon },
  { value: 'wifi', icon: WifiIcon },
  { value: 'vcard', icon: VCardIcon },
  { value: 'geo', icon: GeoIcon },
  { value: 'event', icon: EventIcon },
];

defineProps<{
  modelValue: QRDataType;
}>();

const emit = defineEmits<{
  select: [type: QRDataType];
  'update:modelValue': [value: QRDataType];
}>();

const buttons = ref<HTMLButtonElement[]>([]);

function selectType(type: QRDataType): void {
  emit('select', type);
  emit('update:modelValue', type);
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const key = event.key;
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(key)) {
    return;
  }

  event.preventDefault();

  const total = qrTypes.length;
  let nextIndex = index;

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    nextIndex = (index + 1) % total;
  } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
    nextIndex = (index - 1 + total) % total;
  } else if (key === 'Home') {
    nextIndex = 0;
  } else if (key === 'End') {
    nextIndex = total - 1;
  }

  const nextType = qrTypes[nextIndex];
  if (!nextType) {
    return;
  }
  selectType(nextType.value);
  nextTick(() => {
    buttons.value[nextIndex]?.focus();
  });
}
</script>
