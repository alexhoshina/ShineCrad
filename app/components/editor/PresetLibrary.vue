<script setup lang="ts">
import {
  effectPresets,
  clonePresetEffect,
  type EffectPreset,
} from "~/utils/effect-presets";

const props = defineProps<{
  target: "shine" | "glare";
}>();

const emit = defineEmits<{
  apply: [effect: import("~/utils/editor-types").EditorLayerEffect];
}>();

const { t } = useI18n();
const toast = useToast();

const filteredPresets = computed(() => {
  return effectPresets.filter(
    (p) => p.category === props.target || p.category === "both",
  );
});

function applyPreset(preset: EffectPreset) {
  const effect = clonePresetEffect(preset);
  emit("apply", effect);
  toast.add({
    title: t("editor.presetApplied"),
    icon: "i-lucide-check",
    color: "success",
  });
}
</script>

<template>
  <UPopover :content="{ side: 'bottom', align: 'start' }">
    <UButton
      icon="i-lucide-palette"
      :label="$t('editor.presets')"
      color="neutral"
      variant="ghost"
      size="xs"
    />
    <template #content>
      <div class="w-64 max-h-72 overflow-y-auto p-2">
        <div
          class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none mb-2 px-1"
        >
          {{ $t("editor.presetLibrary") }}
        </div>
        <div class="flex flex-col gap-y-1">
          <button
            v-for="preset in filteredPresets"
            :key="preset.id"
            class="flex items-center gap-x-2.5 px-2.5 py-2 rounded-md text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full"
            @click="applyPreset(preset)"
          >
            <UIcon
              :name="preset.icon"
              class="size-4 text-neutral-500 shrink-0"
            />
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ $t(preset.nameKey) }}
            </span>
          </button>
          <div
            v-if="filteredPresets.length === 0"
            class="text-center py-3 text-xs text-neutral-400"
          >
            {{ $t("editor.noPresetsForType") }}
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
