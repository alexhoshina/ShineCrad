/**
 * 编辑器数据 → ShineCard 配置的转换工具
 *
 * 在 editor.vue 和 index.vue 中共享使用，避免重复代码。
 */
import type {
  BackgroundSource,
  EffectConfig,
} from "#layers/shine-card/app/utils/shine-card-types";
import type {
  PosAxisConfig,
  EditorGradientSource,
  EditorLayerEffect,
  EditorLayer,
  LayerEffectValue,
  CardScheme,
} from "./editor-types";
import {
  isEditorLayerEffect,
  isEffectConfig,
  createDefaultEffect,
} from "./editor-types";
import { toGradientOutput } from "./gradient";

// 位置 / 尺寸计算

export function computePosAxis(axis: PosAxisConfig): string {
  switch (axis.mode) {
    case "var":
      return `var(${axis.variable})`;
    case "calc":
      return `calc(var(${axis.variable}) * ${axis.calcFactor})`;
    default:
      return axis.value;
  }
}

export function computeSourceSize(source: EditorGradientSource): string {
  if (source.sizeMode === "keyword") return source.sizeKeyword;
  return `${source.sizeW}% ${source.sizeH}%`;
}

export function computeSourcePosition(source: EditorGradientSource): string {
  if (source.posMode === "preset") return source.posPreset;
  return `${computePosAxis(source.posX)} ${computePosAxis(source.posY)}`;
}

// 源 → 背景源

export function sourceToBackground(
  source: EditorGradientSource,
): BackgroundSource {
  const size = computeSourceSize(source);
  const position = computeSourcePosition(source);

  if (source.sourceType === "image") {
    return {
      type: "image",
      value: source.imageUrl,
      size: size || undefined,
      position: position || undefined,
      repeat: source.repeat || undefined,
      blendMode: source.blendMode || undefined,
    };
  }

  const output = toGradientOutput(source.gradientConfig);
  return {
    type: output.type as BackgroundSource["type"],
    value: output.value,
    size: size || undefined,
    position: position || undefined,
    repeat: source.repeat || undefined,
    blendMode: source.blendMode || undefined,
  };
}

// 效果 → 效果配置

/**
 * 将 EditorLayerEffect 转换为 ShineCard 可消费的 EffectConfig。
 * 如果传入的已经是 EffectConfig，直接返回。
 */
export function effectToConfig(
  effect: EditorLayerEffect | EffectConfig,
): EffectConfig | undefined {
  // 已经是 EffectConfig（直接 CSS 配置），直接返回
  if (isEffectConfig(effect)) {
    if (effect.layers.length === 0) return undefined;
    return effect;
  }

  // EditorLayerEffect — 需要转换
  if (!effect.enabled || effect.sources.length === 0) return undefined;

  return {
    layers: effect.sources.map(sourceToBackground),
    opacity: effect.opacity / 100,
    mixBlendMode: effect.mixBlendMode || undefined,
    filter: effect.filter || undefined,
    mask: effect.mask || undefined,
  };
}

// 解析效果

/**
 * 解析层的光效值：
 * - string → 从 scheme.sharedEffects 查找
 * - EditorLayerEffect → 直接返回
 * - EffectConfig → 直接返回
 */
export function resolveLayerEffect(
  effectOrId: LayerEffectValue,
  scheme: CardScheme,
): EditorLayerEffect | EffectConfig {
  if (typeof effectOrId === "string") {
    const shared = scheme.sharedEffects.find((e) => e.id === effectOrId);
    return shared?.effect ?? createDefaultEffect();
  }
  return effectOrId;
}

/**
 * 解析层的光效值，确保返回 EditorLayerEffect（用于编辑器 UI）。
 * 如果是 EffectConfig 则返回空默认值（EffectConfig 不可在编辑器中分解编辑）。
 */
export function resolveEditorEffect(
  effectOrId: LayerEffectValue,
  scheme: CardScheme,
): EditorLayerEffect {
  const resolved = resolveLayerEffect(effectOrId, scheme);
  if (isEditorLayerEffect(resolved)) return resolved;
  // EffectConfig — 无法在编辑器中编辑，返回默认值
  return createDefaultEffect();
}

// 图层遮罩

export function getLayerMask(layer: EditorLayer): string | undefined {
  switch (layer.maskMode) {
    case "full":
      return "full";
    case "custom":
      return layer.maskUrl || undefined;
    default:
      return undefined;
  }
}
