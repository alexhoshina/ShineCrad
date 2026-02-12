import type { DropdownMenuItem } from "@nuxt/ui";
import type { InjectionKey } from "vue";
import type { ParallaxLayer } from "#layers/shine-card/app/utils/shine-card-types";
import type {
  EditorLayerEffect,
  EditorLayer,
  LayerEffectValue,
} from "~/utils/editor-types";
import { createDefaultEffect, createDefaultLayer } from "~/utils/editor-types";
import {
  effectToConfig,
  getLayerMask,
  resolveLayerEffect,
  resolveEditorEffect,
} from "~/utils/editor-convert";
import {
  exportLayersToTS,
  exportLayersToVueSFC,
  exportLayersToJSON,
} from "~/utils/export-config";

type ExportFormat = "ts" | "vue" | "json";

export type EditorStateReturn = ReturnType<typeof useEditorState>;
export const editorStateKey = Symbol(
  "editorState",
) as InjectionKey<EditorStateReturn>;

export function useEditorStateInjection() {
  const state = inject(editorStateKey);
  if (!state)
    throw new Error(
      "useEditorStateInjection must be used inside <EditorProvider>",
    );
  return state;
}

/**
 * 编辑器页面的核心状态管理
 * 从 editor.vue 拆分出来的 composable，管理 UI 交互、方案、图层和光效状态。
 */
export function useEditorState() {
  const {
    store,
    schemes,
    activeSchemeId,
    activeScheme,
    defaultSchemeId,
    addScheme,
    duplicateScheme,
    removeScheme,
    renameScheme,
    resetScheme,
    importScheme,
    addSharedEffect,
    removeSharedEffect,
    isStorageReady,
  } = useCardSchemes();

  // 历史记录 (撤销 / 重做)

  const { undo, redo, canUndo, canRedo } = useEditorHistory(store);

  // 国际化

  const { t } = useI18n();
  const toast = useToast();

  // UI 状态

  const selectedLayerIndex = ref(0);
  const schemeNameEditing = ref<string | null>(null);
  const schemeNameDraft = ref("");
  const schemeDeleteDisabled = computed(() => schemes.value.length <= 1);
  const importModalOpen = ref(false);
  const importJsonDraft = ref("");
  const forceInteracting = ref(false);

  // 方案快捷键

  const layers = computed({
    get: () => activeScheme.value?.layers ?? [],
    set: (val) => {
      if (activeScheme.value) activeScheme.value.layers = val;
    },
  });

  const cardWidthNumber = computed({
    get: () => {
      const raw = activeScheme.value?.cardWidth ?? "300px";
      return Number.parseInt(raw, 10) || 300;
    },
    set: (val: number) => {
      if (activeScheme.value) activeScheme.value.cardWidth = `${val}px`;
    },
  });

  const sharedEffects = computed(() => activeScheme.value?.sharedEffects ?? []);
  const selectedLayer = computed(() => layers.value[selectedLayerIndex.value]);

  // 确保选中图层索引在有效范围内
  watch(layers, (l) => {
    if (selectedLayerIndex.value >= l.length) {
      selectedLayerIndex.value = Math.max(0, l.length - 1);
    }
  });

  // 方案操作

  const schemeDropdownItems = computed<DropdownMenuItem[][]>(() => [
    schemes.value.map((s) => ({
      label: s.name,
      icon:
        s.id === defaultSchemeId.value ? "i-lucide-star" : "i-lucide-file-text",
      onSelect: () => {
        activeSchemeId.value = s.id;
        selectedLayerIndex.value = 0;
      },
    })),
  ]);

  function startRenameScheme(id: string) {
    const s = schemes.value.find((s) => s.id === id);
    if (!s) return;
    schemeNameEditing.value = id;
    schemeNameDraft.value = s.name;
  }

  function confirmRenameScheme() {
    if (schemeNameEditing.value && schemeNameDraft.value.trim()) {
      renameScheme(schemeNameEditing.value, schemeNameDraft.value.trim());
    }
    schemeNameEditing.value = null;
  }

  function toggleDefaultScheme(id: string) {
    defaultSchemeId.value = defaultSchemeId.value === id ? null : id;
  }

  // 遮罩模式选项

  const maskModeOptions = computed(() => [
    { label: t("editor.maskAuto"), value: "auto" },
    { label: t("editor.maskFull"), value: "full" },
    { label: t("editor.maskCustom"), value: "custom" },
  ]);

  // 共享效果绑定

  function getEffectMode(effectOrId: LayerEffectValue): "inline" | "shared" {
    return typeof effectOrId === "string" ? "shared" : "inline";
  }

  function getSharedEffectOptions() {
    return sharedEffects.value.map((e) => ({
      label: e.name,
      value: e.id,
    }));
  }

  function setLayerEffectShared(
    layer: EditorLayer,
    key: "shine" | "glare",
    effectId: string,
  ) {
    layer[key] = effectId;
  }

  function setLayerEffectInline(layer: EditorLayer, key: "shine" | "glare") {
    if (typeof layer[key] === "string") {
      const scheme = activeScheme.value;
      if (scheme) {
        const resolved = resolveEditorEffect(layer[key], scheme);
        layer[key] = JSON.parse(JSON.stringify(resolved));
      } else {
        layer[key] = createDefaultEffect();
      }
    }
  }

  function getEditableEffect(
    layer: EditorLayer,
    key: "shine" | "glare",
  ): EditorLayerEffect {
    const val = layer[key];
    if (!activeScheme.value) return createDefaultEffect();
    return resolveEditorEffect(val, activeScheme.value);
  }

  // 图层操作

  function addLayer() {
    layers.value.push(createDefaultLayer());
    selectedLayerIndex.value = layers.value.length - 1;
  }

  function removeLayer(index: number) {
    if (layers.value.length <= 1) return;
    layers.value.splice(index, 1);
    if (selectedLayerIndex.value >= layers.value.length) {
      selectedLayerIndex.value = layers.value.length - 1;
    }
  }

  function duplicateLayer(index: number) {
    const source = layers.value[index];
    if (!source) return;
    const clone: EditorLayer = JSON.parse(JSON.stringify(source));
    clone.id = Date.now();
    layers.value.splice(index + 1, 0, clone);
    selectedLayerIndex.value = index + 1;
  }

  function toggleLayerVisibility(index: number) {
    const layer = layers.value[index];
    if (layer) layer.visible = layer.visible !== false ? false : true;
  }

  // 计算图层（用于 ShineCard 预览）
  const computedLayers = computed<ParallaxLayer[]>(() => {
    const scheme = activeScheme.value;
    if (!scheme) return [];
    return scheme.layers
      .filter((layer) => layer.visible !== false)
      .map((layer) => ({
        id: layer.id,
        img: layer.img,
        zHeight: layer.zHeight,
        mask: getLayerMask(layer),
        shineEffects: effectToConfig(resolveLayerEffect(layer.shine, scheme)),
        glareEffects: effectToConfig(resolveLayerEffect(layer.glare, scheme)),
      }));
  });

  // 导出
  function exportConfig(format: ExportFormat = "ts") {
    const cardWidth = activeScheme.value?.cardWidth;
    const data = computedLayers.value;

    let output: string;
    switch (format) {
      case "vue":
        output = exportLayersToVueSFC(data, cardWidth);
        break;
      case "json":
        output = exportLayersToJSON(data, cardWidth);
        break;
      default:
        output = exportLayersToTS(data, cardWidth);
    }

    navigator.clipboard.writeText(output).then(() => {
      toast.add({
        title: t("common.copied"),
        icon: "i-lucide-check",
        color: "success",
      });
    });
  }

  const exportDropdownItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: t("editor.exportTs"),
        icon: "i-lucide-file-code",
        onSelect: () => exportConfig("ts"),
      },
      {
        label: t("editor.exportVue"),
        icon: "i-lucide-file-text",
        onSelect: () => exportConfig("vue"),
      },
      {
        label: t("editor.exportJson"),
        icon: "i-lucide-file-json",
        onSelect: () => exportConfig("json"),
      },
    ],
    [
      {
        label: t("editor.importJson"),
        icon: "i-lucide-upload",
        onSelect: () => {
          importJsonDraft.value = "";
          importModalOpen.value = true;
        },
      },
    ],
  ]);

  // 导入

  function handleImport() {
    const input = importJsonDraft.value.trim();
    if (!input) return;

    const { success, error } = importScheme(input);
    if (success) {
      importModalOpen.value = false;
      selectedLayerIndex.value = 0;
      toast.add({
        title: t("editor.importSuccess"),
        icon: "i-lucide-check",
        color: "success",
      });
    } else {
      toast.add({
        title: t(`editor.importError.${error}`),
        icon: "i-lucide-alert-triangle",
        color: "error",
      });
    }
  }

  // 键盘快捷键

  useEditorShortcuts({
    addLayer,
    removeLayer: () => removeLayer(selectedLayerIndex.value),
    duplicateLayer: () => duplicateLayer(selectedLayerIndex.value),
    exportConfig: () => exportConfig("ts"),
  });

  return {
    // 存储与历史
    store,
    isStorageReady,
    schemes,
    activeSchemeId,
    activeScheme,
    defaultSchemeId,
    canUndo,
    canRedo,
    undo,
    redo,

    // UI 状态
    selectedLayerIndex,
    schemeNameEditing,
    schemeNameDraft,
    schemeDeleteDisabled,
    importModalOpen,
    importJsonDraft,
    forceInteracting,

    // 派生状态
    layers,
    cardWidthNumber,
    sharedEffects,
    selectedLayer,
    computedLayers,
    maskModeOptions,
    schemeDropdownItems,
    exportDropdownItems,

    // 方案操作
    addScheme,
    duplicateScheme,
    removeScheme,
    resetScheme,
    startRenameScheme,
    confirmRenameScheme,
    toggleDefaultScheme,
    addSharedEffect,
    removeSharedEffect,

    // 图层操作
    addLayer,
    removeLayer,
    duplicateLayer,
    toggleLayerVisibility,

    // 效果操作
    getEffectMode,
    getSharedEffectOptions,
    setLayerEffectShared,
    setLayerEffectInline,
    getEditableEffect,

    // 导出/导入
    exportConfig,
    handleImport,
  };
}
