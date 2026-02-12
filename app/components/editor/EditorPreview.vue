<script setup lang="ts">
const {
  computedLayers,
  cardWidthNumber,
  forceInteracting,
  importModalOpen,
  importJsonDraft,
  handleImport,
} = useEditorStateInjection();

const cssPreviewOpen = ref(false);
</script>

<template>
  <!-- 网格背景图案 -->
  <div class="absolute inset-0 pointer-events-none editor-grid-bg" />

  <!-- 工具栏插槽 -->
  <slot name="toolbar" />

  <!-- 卡片预览 -->
  <div class="relative z-10">
    <ShineCard
      :layers="computedLayers"
      :width="`${cardWidthNumber}px`"
      :force-interacting="forceInteracting"
    />
  </div>

  <!-- CSS Preview Toggle -->
  <div class="absolute bottom-3 right-3 z-20">
    <UTooltip :text="$t('editor.cssPreview')">
      <UButton
        icon="i-lucide-code"
        :color="cssPreviewOpen ? 'primary' : 'neutral'"
        :variant="cssPreviewOpen ? 'solid' : 'outline'"
        size="sm"
        class="shadow-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
        @click="cssPreviewOpen = !cssPreviewOpen"
      />
    </UTooltip>
  </div>

  <!-- CSS Preview Drawer -->
  <Transition name="css-drawer">
    <div
      v-if="cssPreviewOpen"
      class="absolute bottom-0 left-0 right-0 z-20 h-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 shadow-lg"
    >
      <CssPreview />
    </div>
  </Transition>

  <!-- Import Modal -->
  <UModal v-model:open="importModalOpen">
    <template #content>
      <div class="p-6 flex flex-col gap-y-4">
        <div class="text-lg font-semibold">
          {{ $t("editor.importJson") }}
        </div>
        <p class="text-sm text-neutral-500">
          {{ $t("editor.importJsonHint") }}
        </p>
        <UTextarea
          v-model="importJsonDraft"
          :placeholder="$t('editor.importJsonPlaceholder')"
          color="neutral"
          autofocus
          :rows="10"
          class="w-full font-mono text-xs"
        />
        <div class="flex items-center justify-end gap-x-2">
          <UButton
            :label="$t('common.back')"
            color="neutral"
            variant="ghost"
            @click="importModalOpen = false"
          />
          <UButton
            :label="$t('editor.importJson')"
            icon="i-lucide-upload"
            color="primary"
            :disabled="!importJsonDraft.trim()"
            @click="handleImport()"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.editor-grid-bg {
  --grid-color: color-mix(in srgb, var(--color-neutral-400) 15%, transparent);
  background-image:
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  background-size: 24px 24px;
}

:root.dark .editor-grid-bg {
  --grid-color: color-mix(in srgb, var(--color-neutral-600) 12%, transparent);
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.css-drawer-enter-active,
.css-drawer-leave-active {
  transition: transform 0.25s ease;
}

.css-drawer-enter-from,
.css-drawer-leave-to {
  transform: translateY(100%);
}
</style>
