<script setup lang="ts">
import { editorStateKey, useEditorState } from "~/composables/useEditorState";

definePageMeta({
  layout: "editor",
});

const { t } = useI18n();
const state = useEditorState();

provide(editorStateKey, state);

useSeoMeta({
  title: () => t("editor.title"),
});

// 响应式：检测小屏幕
const isMobile = ref(false);
const mobileTab = ref<"preview" | "edit">("preview");

function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <div class="h-full w-full overflow-hidden">
    <!-- 桌面端：并排布局 -->
    <UDashboardGroup
      v-if="!isMobile"
      unit="px"
      storage-key="shinecard-editor-layout"
      class="relative h-full flex overflow-hidden"
    >
      <!-- 左侧：编辑器侧边栏 -->
      <UDashboardPanel
        id="editor-sidebar"
        :default-size="420"
        :min-size="320"
        :max-size="600"
        resizable
        :ui="{
          root: 'min-h-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900',
          body: 'p-0',
        }"
      >
        <template #body>
          <EditorSidebar />
        </template>

        <template #footer>
          <AppFooter />
        </template>
      </UDashboardPanel>

      <!-- Right: Preview Panel -->
      <UDashboardPanel
        id="preview-panel"
        :ui="{
          root: 'flex-1 min-w-0 min-h-0',
          body: 'relative flex items-center justify-center overflow-hidden p-0',
        }"
      >
        <template #body>
          <EditorPreview>
            <template #toolbar>
              <EditorToolbar />
            </template>
          </EditorPreview>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>

    <!-- Mobile: Stacked layout with tab switching -->
    <div v-else class="relative h-full flex flex-col overflow-hidden">
      <!-- Mobile Tab Bar -->
      <div
        class="flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0"
      >
        <button
          class="flex-1 flex items-center justify-center gap-x-1.5 px-4 py-2.5 text-sm font-medium transition-colors"
          :class="
            mobileTab === 'preview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          "
          @click="mobileTab = 'preview'"
        >
          <UIcon name="i-lucide-eye" class="size-4" />
          {{ $t("common.preview") }}
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-x-1.5 px-4 py-2.5 text-sm font-medium transition-colors"
          :class="
            mobileTab === 'edit'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          "
          @click="mobileTab = 'edit'"
        >
          <UIcon name="i-lucide-sliders-horizontal" class="size-4" />
          {{ $t("common.editor") }}
        </button>
      </div>

      <!-- Mobile Preview -->
      <div
        v-show="mobileTab === 'preview'"
        class="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden"
      >
        <EditorPreview>
          <template #toolbar>
            <EditorToolbar />
          </template>
        </EditorPreview>
      </div>

      <!-- Mobile Editor -->
      <div
        v-show="mobileTab === 'edit'"
        class="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-neutral-900"
      >
        <EditorSidebar />
      </div>
    </div>
  </div>
</template>
