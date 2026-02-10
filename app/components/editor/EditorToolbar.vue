<script setup lang="ts">
const {
  activeScheme,
  activeSchemeId,
  defaultSchemeId,
  schemeNameEditing,
  schemeNameDraft,
  schemeDeleteDisabled,
  forceInteracting,
  canUndo,
  canRedo,
  schemeDropdownItems,
  exportDropdownItems,
  undo,
  redo,
  addScheme,
  duplicateScheme,
  removeScheme,
  resetScheme,
  startRenameScheme,
  confirmRenameScheme,
  toggleDefaultScheme,
} = useEditorStateInjection();
</script>

<template>
  <div
    class="absolute top-15 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 shadow-lg"
  >
    <!-- 方案下拉菜单 -->
    <UDropdownMenu
      :items="schemeDropdownItems"
      :content="{ align: 'start' }"
      :modal="false"
    >
      <UButton
        :label="activeScheme?.name ?? '—'"
        icon="i-lucide-layers-2"
        trailing-icon="i-lucide-chevron-down"
        color="neutral"
        variant="ghost"
        size="xs"
        class="max-w-48 shrink-0"
        :ui="{ label: 'truncate' }"
      />
    </UDropdownMenu>

    <USeparator orientation="vertical" class="h-5" />

    <!-- 方案名称编辑 -->
    <template v-if="schemeNameEditing === activeSchemeId">
      <UInput
        v-model="schemeNameDraft"
        color="neutral"
        size="xs"
        autofocus
        class="w-28"
        @keydown.enter="confirmRenameScheme()"
        @blur="confirmRenameScheme()"
      />
    </template>
    <UTooltip v-else :text="$t('editor.rename')">
      <UButton
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="startRenameScheme(activeSchemeId)"
      />
    </UTooltip>

    <USeparator orientation="vertical" class="h-5" />

    <!-- Force Interacting Toggle -->
    <UTooltip
      :text="
        forceInteracting
          ? $t('editor.disableInteracting')
          : $t('editor.forceInteracting')
      "
    >
      <UButton
        :icon="forceInteracting ? 'i-lucide-hand' : 'i-lucide-hand'"
        :color="forceInteracting ? 'primary' : 'neutral'"
        :variant="forceInteracting ? 'solid' : 'ghost'"
        size="xs"
        @click="forceInteracting = !forceInteracting"
      />
    </UTooltip>

    <USeparator orientation="vertical" class="h-5" />

    <!-- Undo / Redo -->
    <UTooltip :text="`${$t('editor.undo')} (Ctrl+Z)`">
      <UButton
        icon="i-lucide-undo-2"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="!canUndo"
        @click="undo()"
      />
    </UTooltip>
    <UTooltip :text="`${$t('editor.redo')} (Ctrl+Shift+Z)`">
      <UButton
        icon="i-lucide-redo-2"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="!canRedo"
        @click="redo()"
      />
    </UTooltip>

    <USeparator orientation="vertical" class="h-5" />

    <!-- Scheme Actions -->
    <UTooltip :text="`${$t('common.new')} (Ctrl+N)`">
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="addScheme('Untitled')"
      />
    </UTooltip>
    <UTooltip :text="`${$t('common.duplicate')} (Ctrl+D)`">
      <UButton
        icon="i-lucide-copy"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="duplicateScheme(activeSchemeId)"
      />
    </UTooltip>
    <UTooltip
      :text="
        defaultSchemeId === activeSchemeId
          ? $t('common.default')
          : $t('common.setDefault')
      "
    >
      <UButton
        :icon="
          defaultSchemeId === activeSchemeId
            ? 'i-lucide-star'
            : 'i-lucide-star-off'
        "
        :color="defaultSchemeId === activeSchemeId ? 'primary' : 'neutral'"
        variant="ghost"
        size="xs"
        @click="toggleDefaultScheme(activeSchemeId)"
      />
    </UTooltip>
    <UTooltip :text="$t('editor.resetScheme')">
      <UButton
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="resetScheme(activeSchemeId)"
      />
    </UTooltip>
    <UDropdownMenu
      :items="exportDropdownItems"
      :content="{ align: 'end' }"
      :modal="false"
    >
      <UTooltip :text="`${$t('editor.export')} (Ctrl+S)`">
        <UButton
          icon="i-lucide-download"
          trailing-icon="i-lucide-chevron-down"
          color="neutral"
          variant="ghost"
          size="xs"
        />
      </UTooltip>
    </UDropdownMenu>
    <UTooltip :text="`${$t('common.delete')} (Del)`">
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="xs"
        square
        :disabled="schemeDeleteDisabled"
        @click="removeScheme(activeSchemeId)"
      />
    </UTooltip>
  </div>
</template>
