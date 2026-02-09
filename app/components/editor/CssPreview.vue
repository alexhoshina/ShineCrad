<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { EffectConfig } from "#layers/shine-card/app/utils/shine-card-types";

const { selectedLayer, selectedLayerIndex, activeScheme } =
  useEditorStateInjection();

const { t } = useI18n();

/**
 * 内联 CSS 生成，避免跨层运行时导入。
 * 镜像自 shine-card 层的 parseEffectToCSS。
 */
function effectToCSS(effect: EffectConfig | undefined): CSSProperties {
  if (!effect?.layers?.length) return {};
  const bgImages = effect.layers.map((l) =>
    l.type === "image" ? `url(${l.value})` : `${l.type}(${l.value})`,
  );
  const bgSizes = effect.layers.map((l) => l.size || "cover");
  const bgPositions = effect.layers.map((l) => l.position || "center");
  const bgBlends = effect.layers.map((l) => l.blendMode || "normal");
  const bgRepeats = effect.layers.map((l) => l.repeat || "repeat");
  return {
    backgroundImage: bgImages.join(", "),
    backgroundSize: bgSizes.join(", "),
    backgroundPosition: bgPositions.join(", "),
    backgroundBlendMode: bgBlends.join(", "),
    backgroundRepeat: bgRepeats.join(", "),
    filter: effect.filter,
    mixBlendMode: effect.mixBlendMode as CSSProperties["mixBlendMode"],
    opacity: effect.opacity,
  };
}

const cssOutput = computed(() => {
  const layer = selectedLayer.value;
  const scheme = activeScheme.value;
  if (!layer || !scheme) return "";

  const lines: string[] = [];

  lines.push(
    `/* --- ${t("common.layer")} ${selectedLayerIndex.value + 1} --- */`,
  );
  lines.push("");

  // Shine effects
  const shineResolved = resolveLayerEffect(layer.shine, scheme);
  const shineConfig = effectToConfig(shineResolved);
  if (shineConfig) {
    const shineCSS = effectToCSS(shineConfig);
    lines.push("/* Shine Effects */");
    lines.push(".shine-layer {");
    for (const [key, val] of Object.entries(shineCSS)) {
      if (val !== undefined && val !== "" && val !== "normal") {
        lines.push(`  ${toKebabCase(key)}: ${val};`);
      }
    }
    lines.push("}");
    lines.push("");
  }

  // Glare effects
  const glareResolved = resolveLayerEffect(layer.glare, scheme);
  const glareConfig = effectToConfig(glareResolved);
  if (glareConfig) {
    const glareCSS = effectToCSS(glareConfig);
    lines.push("/* Glare Effects */");
    lines.push(".glare-layer {");
    for (const [key, val] of Object.entries(glareCSS)) {
      if (val !== undefined && val !== "" && val !== "normal") {
        lines.push(`  ${toKebabCase(key)}: ${val};`);
      }
    }
    lines.push("}");
  }

  if (!shineConfig && !glareConfig) {
    lines.push(`/* ${t("editor.cssPreviewEmpty")} */`);
  }

  return lines.join("\n");
});

function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

const toast = useToast();

function copyCSS() {
  navigator.clipboard.writeText(cssOutput.value).then(() => {
    toast.add({
      title: t("common.copied"),
      icon: "i-lucide-check",
      color: "success",
    });
  });
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      class="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800"
    >
      <div class="flex items-center gap-x-2">
        <UIcon name="i-lucide-code" class="size-4 text-neutral-500" />
        <span
          class="text-xs text-neutral-500 uppercase font-black tracking-wider leading-none"
        >
          {{ $t("editor.cssPreview") }}
        </span>
      </div>
      <UTooltip :text="$t('common.copied')">
        <UButton
          icon="i-lucide-copy"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="copyCSS"
        />
      </UTooltip>
    </div>
    <div class="flex-1 overflow-auto p-3">
      <pre
        class="text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap break-all leading-relaxed"
        >{{ cssOutput }}</pre
      >
    </div>
  </div>
</template>
