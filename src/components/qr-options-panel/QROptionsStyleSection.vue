<template>
  <section class="space-y-4">
    <h4 class="text-sm font-medium text-muted">{{ t('qr.options.style') }}</h4>

    <div>
      <label class="form-label">{{ t('qr.options.module_shape') }}</label>
      <OptionButtonGroup
        :options="moduleShapes"
        :model-value="options.style.moduleShape"
        button-class="btn-ghost gap-2 px-3 py-2 text-xs"
        @update:model-value="(value) => updateModuleShape(value as ModuleShape)"
      >
        <template #option="{ option }">
          <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <span :class="option.iconClass" />
          </span>
          <span>{{ t(option.labelKey as string) }}</span>
        </template>
      </OptionButtonGroup>
    </div>

    <div>
      <label class="form-label">{{ t('qr.options.corner_square') }}</label>
      <OptionButtonGroup
        :options="cornerSquareStyles"
        :model-value="options.style.cornerSquareStyle"
        button-class="btn-ghost gap-2 px-3 py-2 text-xs"
        @update:model-value="(value) => updateCornerSquareStyle(value as CornerSquareStyle)"
      >
        <template #option="{ option }">
          <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <span :class="option.iconClass" />
          </span>
          <span>{{ t(option.labelKey as string) }}</span>
        </template>
      </OptionButtonGroup>
    </div>

    <div>
      <label class="form-label">{{ t('qr.options.corner_dot') }}</label>
      <OptionButtonGroup
        :options="cornerDotStyles"
        :model-value="options.style.cornerDotStyle"
        button-class="btn-ghost gap-2 px-3 py-2 text-xs"
        @update:model-value="(value) => updateCornerDotStyle(value as CornerDotStyle)"
      >
        <template #option="{ option }">
          <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <span :class="option.iconClass" />
          </span>
          <span>{{ t(option.labelKey as string) }}</span>
        </template>
      </OptionButtonGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import OptionButtonGroup from '../ui/OptionButtonGroup.vue';
import type {
  QROptions,
  ModuleShape,
  CornerSquareStyle,
  CornerDotStyle,
} from '../../types/qrOptions';

const { t } = useI18n();

const props = defineProps<{
  options: QROptions;
}>();

const emit = defineEmits<{
  'update:options': [options: QROptions];
}>();

const moduleShapes: Array<{ value: ModuleShape; labelKey: string; iconClass: string }> = [
  { value: 'square', labelKey: 'qr.options.shape_square', iconClass: 'h-4 w-4 bg-body' },
  { value: 'dot', labelKey: 'qr.options.shape_dot', iconClass: 'h-4 w-4 rounded-full bg-body' },
  {
    value: 'rounded',
    labelKey: 'qr.options.shape_rounded',
    iconClass: 'h-4 w-4 rounded bg-body',
  },
  {
    value: 'diamond',
    labelKey: 'qr.options.shape_diamond',
    iconClass: 'h-3 w-3 bg-body rotate-45',
  },
];

const cornerSquareStyles: Array<{ value: CornerSquareStyle; labelKey: string; iconClass: string }> =
  [
    {
      value: 'square',
      labelKey: 'qr.options.shape_square',
      iconClass: 'h-4 w-4 border-2 border-body',
    },
    {
      value: 'rounded',
      labelKey: 'qr.options.shape_rounded',
      iconClass: 'h-4 w-4 rounded border-2 border-body',
    },
    {
      value: 'dot',
      labelKey: 'qr.options.shape_dot',
      iconClass: 'h-4 w-4 rounded-full border-2 border-body',
    },
  ];

const cornerDotStyles: Array<{ value: CornerDotStyle; labelKey: string; iconClass: string }> = [
  { value: 'square', labelKey: 'qr.options.shape_square', iconClass: 'h-3 w-3 bg-body' },
  { value: 'dot', labelKey: 'qr.options.shape_dot', iconClass: 'h-3 w-3 rounded-full bg-body' },
  {
    value: 'diamond',
    labelKey: 'qr.options.shape_diamond',
    iconClass: 'h-3 w-3 bg-body rotate-45',
  },
];

function emitUpdate(partial: Partial<QROptions>) {
  emit('update:options', { ...props.options, ...partial });
}

function updateModuleShape(moduleShape: ModuleShape) {
  emitUpdate({
    style: { ...props.options.style, moduleShape },
  });
}

function updateCornerSquareStyle(cornerSquareStyle: CornerSquareStyle) {
  emitUpdate({
    style: { ...props.options.style, cornerSquareStyle },
  });
}

function updateCornerDotStyle(cornerDotStyle: CornerDotStyle) {
  emitUpdate({
    style: { ...props.options.style, cornerDotStyle },
  });
}
</script>
