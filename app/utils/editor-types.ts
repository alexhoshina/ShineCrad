/**
 * 编辑器专属类型定义
 *
 * 包含编辑器 UI 所需的所有类型、类型守卫和工厂函数。
 * ShineCard 组件的公共类型（BackgroundSource / EffectConfig / ParallaxLayer）
 * 请从 `~/utils/card-types` 导入。
 */
import type { EffectConfig } from "#layers/shine-card/app/utils/shine-card-types";
import type { GradientConfig } from "./gradient";

// 工具函数

/** 生成 UUID，优先使用 crypto.randomUUID，不可用时 fallback */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// 位置 / 尺寸

export type PosAxisMode = "value" | "var" | "calc";
export type SizeMode = "keyword" | "split";

export interface PosAxisConfig {
  mode: PosAxisMode;
  value: string;
  variable: string;
  calcFactor: number;
}

// 编辑器源

export interface EditorGradientSource {
  id: number;
  sourceType: "gradient" | "image";
  gradientConfig: GradientConfig;
  imageUrl: string;
  sizeMode: SizeMode;
  sizeKeyword: string;
  sizeW: number;
  sizeH: number;
  posMode: "preset" | "split";
  posPreset: string;
  posX: PosAxisConfig;
  posY: PosAxisConfig;
  repeat: string;
  blendMode: string;
}

// 编辑器效果

export interface EditorLayerEffect {
  enabled: boolean;
  sources: EditorGradientSource[];
  opacity: number;
  mixBlendMode: string;
  filter: string;
  mask: string;
}

/**
 * 层光效的联合类型：
 * - `EditorLayerEffect` — 编辑器内部的富结构（可在编辑器 UI 中完整编辑）
 * - `EffectConfig` — ShineCard 直接消费的 CSS 配置（如系统默认方案中使用）
 * - `string` — 共享光效的 ID 引用
 */
export type LayerEffectValue = EditorLayerEffect | EffectConfig | string;

// 类型守卫

/** 判断是否为编辑器内部的富光效结构 */
export function isEditorLayerEffect(
  val: LayerEffectValue,
): val is EditorLayerEffect {
  return typeof val === "object" && "sources" in val;
}

/** 判断是否为 ShineCard 直接消费的 CSS 光效配置 */
export function isEffectConfig(val: LayerEffectValue): val is EffectConfig {
  return typeof val === "object" && "layers" in val;
}

// 共享效果

export interface SharedEffect {
  id: string;
  name: string;
  effect: EditorLayerEffect;
}

// 编辑器图层

export interface EditorLayer {
  id: number;
  img: string;
  zHeight: number;
  maskMode: "auto" | "full" | "custom";
  maskUrl: string;
  /** 图层可见性（用于编辑器预览调试） */
  visible: boolean;
  /** 内联编辑器光效 / 直接 CSS 光效配置 / 共享光效 ID */
  shine: LayerEffectValue;
  /** 内联编辑器光效 / 直接 CSS 光效配置 / 共享光效 ID */
  glare: LayerEffectValue;
}

// 方案

export interface CardScheme {
  id: string;
  name: string;
  cardWidth: string;
  layers: EditorLayer[];
  sharedEffects: SharedEffect[];
}

// 根持久化

export interface EditorPersistence {
  schemes: CardScheme[];
  defaultSchemeId: string | null;
  activeSchemeId: string;
}

// 工厂辅助函数

export function createDefaultPosAxis(
  value = "50%",
  variable = "--pointer-x",
): PosAxisConfig {
  return { mode: "value", value, variable, calcFactor: 1 };
}

export function createDefaultEffect(): EditorLayerEffect {
  return {
    enabled: false,
    sources: [],
    opacity: 80,
    mixBlendMode: "",
    filter: "",
    mask: "",
  };
}

export function createDefaultLayer(id?: number): EditorLayer {
  return {
    id: id ?? Date.now(),
    img: "",
    zHeight: 0,
    maskMode: "auto",
    maskUrl: "",
    visible: true,
    shine: createDefaultEffect(),
    glare: createDefaultEffect(),
  };
}

export function createDefaultScheme(partial?: Partial<CardScheme>): CardScheme {
  return {
    id: partial?.id ?? generateId(),
    name: partial?.name ?? "Untitled",
    cardWidth: partial?.cardWidth ?? "300px",
    layers: partial?.layers ?? [{ ...createDefaultLayer(1) }],
    sharedEffects: partial?.sharedEffects ?? [],
  };
}
