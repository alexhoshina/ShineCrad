import { useStorage } from "@vueuse/core";
import type {
  CardScheme,
  EditorLayerEffect,
  EditorPersistence,
  SharedEffect,
  LayerEffectValue,
} from "~/utils/editor-types";
import {
  createDefaultEffect,
  createDefaultScheme,
  isEditorLayerEffect,
  generateId,
} from "~/utils/editor-types";
import {
  resolveLayerEffect,
  resolveEditorEffect,
} from "~/utils/editor-convert";
import {
  validateAndRepairPersistence,
  importSchemeFromJSON,
} from "~/utils/editor-validation";
import { systemDefaultScheme } from "~/utils/default-card";

const STORAGE_KEY = "shinecard-editor-v2";

/**
 * 共享的卡片方案管理 composable
 * 使用 useStorage 持久化到 localStorage，支持多方案、命名、默认方案选择。
 */
export function useCardSchemes() {
  const store = useStorage<EditorPersistence>(
    STORAGE_KEY,
    {
      schemes: [createDefaultScheme({ name: "My Card" })],
      defaultSchemeId: null,
      activeSchemeId: "",
    },
    undefined,
    { mergeDefaults: true },
  );

  // 数据校验与自动修复

  {
    const { data, repaired } = validateAndRepairPersistence(store.value);
    if (repaired) {
      console.warn(
        "[useCardSchemes] localStorage data was corrupted and has been repaired",
      );
      store.value = data;
    }
  }

  // 确保 activeSchemeId 有效
  if (
    store.value.schemes.length > 0 &&
    !store.value.schemes.some((s) => s.id === store.value.activeSchemeId)
  ) {
    store.value.activeSchemeId = store.value.schemes[0]!.id;
  }

  const isStorageReady = ref(false);
  onMounted(() => {
    isStorageReady.value = true;
  });

  // 方案增删改查

  const schemes = computed(() => store.value.schemes);
  const activeSchemeId = computed({
    get: () => store.value.activeSchemeId,
    set: (val) => {
      store.value.activeSchemeId = val;
    },
  });

  const activeScheme = computed(() =>
    store.value.schemes.find((s) => s.id === store.value.activeSchemeId),
  );

  const defaultSchemeId = computed({
    get: () => store.value.defaultSchemeId,
    set: (val) => {
      store.value.defaultSchemeId = val;
    },
  });

  function addScheme(name = "Untitled") {
    const scheme = createDefaultScheme({ name });
    store.value.schemes.push(scheme);
    store.value.activeSchemeId = scheme.id;
    return scheme;
  }

  function duplicateScheme(id: string) {
    const source = store.value.schemes.find((s) => s.id === id);
    if (!source) return;
    const clone: CardScheme = JSON.parse(JSON.stringify(source));
    clone.id = generateId();
    clone.name = `${source.name} (Copy)`;
    store.value.schemes.push(clone);
    store.value.activeSchemeId = clone.id;
  }

  function removeScheme(id: string) {
    if (store.value.schemes.length <= 1) return;
    store.value.schemes = store.value.schemes.filter((s) => s.id !== id);
    if (store.value.defaultSchemeId === id) {
      store.value.defaultSchemeId = null;
    }
    if (store.value.activeSchemeId === id) {
      store.value.activeSchemeId = store.value.schemes[0]!.id;
    }
  }

  function renameScheme(id: string, name: string) {
    const scheme = store.value.schemes.find((s) => s.id === id);
    if (scheme) scheme.name = name;
  }

  // 默认方案

  /**
   * 获取默认方案的配置（用于首页展示）
   * 如果用户选择了默认方案则使用该方案，否则回退到系统内置默认配置。
   */
  const defaultScheme = computed<CardScheme>(() => {
    if (store.value.defaultSchemeId) {
      const found = store.value.schemes.find(
        (s) => s.id === store.value.defaultSchemeId,
      );
      if (found) return found;
    }
    return systemDefaultScheme;
  });

  // 共享效果

  /**
   * 解析光效值（支持 EditorLayerEffect / EffectConfig / 共享引用 ID）
   * 返回 EditorLayerEffect | EffectConfig
   */
  function resolveEffect(effectOrId: LayerEffectValue, scheme: CardScheme) {
    return resolveLayerEffect(effectOrId, scheme);
  }

  /**
   * 解析光效值，确保返回 EditorLayerEffect（用于编辑器 UI 编辑）
   */
  function resolveEditableEffect(
    effectOrId: LayerEffectValue,
    scheme: CardScheme,
  ): EditorLayerEffect {
    return resolveEditorEffect(effectOrId, scheme);
  }

  function addSharedEffect(scheme: CardScheme, name: string): SharedEffect {
    const effect: SharedEffect = {
      id: generateId(),
      name,
      effect: createDefaultEffect(),
    };
    scheme.sharedEffects.push(effect);
    return effect;
  }

  function removeSharedEffect(scheme: CardScheme, effectId: string) {
    scheme.sharedEffects = scheme.sharedEffects.filter(
      (e) => e.id !== effectId,
    );
    // 将引用该共享效果的层回退到 inline effect
    for (const layer of scheme.layers) {
      if (layer.shine === effectId) layer.shine = createDefaultEffect();
      if (layer.glare === effectId) layer.glare = createDefaultEffect();
    }
  }

  // 重置

  function resetScheme(id: string) {
    const scheme = store.value.schemes.find((s) => s.id === id);
    if (!scheme) return;
    const fresh = createDefaultScheme({ id: scheme.id, name: scheme.name });
    Object.assign(scheme, fresh);
  }

  function resetAll() {
    store.value = {
      schemes: [createDefaultScheme({ name: "My Card" })],
      defaultSchemeId: null,
      activeSchemeId: "",
    };
    store.value.activeSchemeId = store.value.schemes[0]!.id;
  }

  // 导入

  /**
   * 从 JSON 字符串导入方案
   *
   * @returns `{ success, error }` — error 为 i18n key 后缀
   */
  function importScheme(jsonStr: string): {
    success: boolean;
    error: string | null;
  } {
    const { scheme, error } = importSchemeFromJSON(jsonStr);
    if (!scheme || error) {
      return { success: false, error: error ?? "unknown" };
    }
    store.value.schemes.push(scheme);
    store.value.activeSchemeId = scheme.id;
    return { success: true, error: null };
  }

  return {
    store,
    schemes,
    activeSchemeId,
    activeScheme,
    defaultSchemeId,
    defaultScheme,
    addScheme,
    duplicateScheme,
    removeScheme,
    renameScheme,
    resetScheme,
    resetAll,
    importScheme,
    resolveEffect,
    resolveEditableEffect,
    addSharedEffect,
    removeSharedEffect,
    isStorageReady,
  };
}
