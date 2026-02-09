import type {
  CardScheme,
  EditorLayer,
  EditorLayerEffect,
  EditorGradientSource,
  EditorPersistence,
  SharedEffect,
  PosAxisConfig,
  LayerEffectValue,
} from "./editor-types";
import {
  generateId,
  createDefaultScheme,
  createDefaultLayer,
  createDefaultEffect,
  createDefaultPosAxis,
} from "./editor-types";

// 模式校验

/**
 * 校验并修复 EditorPersistence 数据
 *
 * 用于 localStorage 读取后的数据完整性保证。
 * 修复策略：尽可能保留用户数据，仅补全缺失字段或修正类型错误。
 *
 * @returns 修复后的数据，以及是否做了修复
 */
export function validateAndRepairPersistence(raw: unknown): {
  data: EditorPersistence;
  repaired: boolean;
} {
  let repaired = false;

  if (!raw || typeof raw !== "object") {
    return {
      data: createFreshPersistence(),
      repaired: true,
    };
  }

  const obj = raw as Record<string, unknown>;

  // 方案列表
  if (!Array.isArray(obj.schemes) || obj.schemes.length === 0) {
    obj.schemes = [createDefaultScheme({ name: "My Card" })];
    repaired = true;
  } else {
    const validSchemes: CardScheme[] = [];
    for (const s of obj.schemes) {
      const result = validateScheme(s);
      if (result.repaired) repaired = true;
      if (result.data) validSchemes.push(result.data);
    }
    if (validSchemes.length === 0) {
      validSchemes.push(createDefaultScheme({ name: "My Card" }));
      repaired = true;
    }
    obj.schemes = validSchemes;
  }

  const schemes = obj.schemes as CardScheme[];

  // 当前激活方案ID
  if (
    typeof obj.activeSchemeId !== "string" ||
    !schemes.some((s) => s.id === obj.activeSchemeId)
  ) {
    obj.activeSchemeId = schemes[0]!.id;
    repaired = true;
  }

  // 默认方案ID
  if (obj.defaultSchemeId !== null && typeof obj.defaultSchemeId !== "string") {
    obj.defaultSchemeId = null;
    repaired = true;
  }
  if (
    typeof obj.defaultSchemeId === "string" &&
    !schemes.some((s) => s.id === obj.defaultSchemeId)
  ) {
    obj.defaultSchemeId = null;
    repaired = true;
  }

  return {
    data: obj as unknown as EditorPersistence,
    repaired,
  };
}

function createFreshPersistence(): EditorPersistence {
  const scheme = createDefaultScheme({ name: "My Card" });
  return {
    schemes: [scheme],
    defaultSchemeId: null,
    activeSchemeId: scheme.id,
  };
}

// 方案校验

function validateScheme(raw: unknown): {
  data: CardScheme | null;
  repaired: boolean;
} {
  if (!raw || typeof raw !== "object") {
    return { data: null, repaired: true };
  }

  let repaired = false;
  const obj = raw as Record<string, unknown>;

  // id
  if (typeof obj.id !== "string" || !obj.id) {
    obj.id = generateId();
    repaired = true;
  }

  // name
  if (typeof obj.name !== "string" || !obj.name) {
    obj.name = "Untitled";
    repaired = true;
  }

  // cardWidth
  if (typeof obj.cardWidth !== "string") {
    obj.cardWidth = "300px";
    repaired = true;
  }

  // layers
  if (!Array.isArray(obj.layers) || obj.layers.length === 0) {
    obj.layers = [createDefaultLayer(1)];
    repaired = true;
  } else {
    for (let i = 0; i < obj.layers.length; i++) {
      const result = validateLayer(obj.layers[i]);
      if (result.repaired) repaired = true;
      obj.layers[i] = result.data;
    }
  }

  // sharedEffects
  if (!Array.isArray(obj.sharedEffects)) {
    obj.sharedEffects = [];
    repaired = true;
  } else {
    const validEffects: SharedEffect[] = [];
    for (const se of obj.sharedEffects) {
      const result = validateSharedEffect(se);
      if (result.repaired) repaired = true;
      if (result.data) validEffects.push(result.data);
    }
    obj.sharedEffects = validEffects;
  }

  return { data: obj as unknown as CardScheme, repaired };
}

// 图层校验

function validateLayer(raw: unknown): {
  data: EditorLayer;
  repaired: boolean;
} {
  if (!raw || typeof raw !== "object") {
    return { data: createDefaultLayer(), repaired: true };
  }

  let repaired = false;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== "number") {
    obj.id = Date.now();
    repaired = true;
  }
  if (typeof obj.img !== "string") {
    obj.img = "";
    repaired = true;
  }
  if (typeof obj.zHeight !== "number") {
    obj.zHeight = 0;
    repaired = true;
  }
  if (!["auto", "full", "custom"].includes(obj.maskMode as string)) {
    obj.maskMode = "auto";
    repaired = true;
  }
  if (typeof obj.maskUrl !== "string") {
    obj.maskUrl = "";
    repaired = true;
  }
  if (typeof obj.visible !== "boolean") {
    obj.visible = true;
    repaired = true;
  }

  // shine / glare — 保留联合类型（string | EditorLayerEffect | EffectConfig）
  for (const key of ["shine", "glare"] as const) {
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = createDefaultEffect();
      repaired = true;
    } else if (typeof obj[key] === "object") {
      const result = validateEffectObject(obj[key]);
      if (result.repaired) repaired = true;
      obj[key] = result.data;
    }
    // string (shared ref ID) — keep as-is
  }

  return { data: obj as unknown as EditorLayer, repaired };
}

// 效果校验

/**
 * 校验效果对象（EditorLayerEffect 或 EffectConfig）
 * 根据存在 "sources" 还是 "layers" 字段来判断类型
 */
function validateEffectObject(raw: unknown): {
  data: LayerEffectValue;
  repaired: boolean;
} {
  if (!raw || typeof raw !== "object") {
    return { data: createDefaultEffect(), repaired: true };
  }

  const obj = raw as Record<string, unknown>;

  // EffectConfig — has "layers" array
  if ("layers" in obj && Array.isArray(obj.layers)) {
    // EffectConfig 结构较简单，不做深度修复
    return { data: raw as LayerEffectValue, repaired: false };
  }

  // EditorLayerEffect — has "sources" array
  let repaired = false;

  if (typeof obj.enabled !== "boolean") {
    obj.enabled = false;
    repaired = true;
  }
  if (!Array.isArray(obj.sources)) {
    obj.sources = [];
    repaired = true;
  }
  if (typeof obj.opacity !== "number") {
    obj.opacity = 80;
    repaired = true;
  }
  if (typeof obj.mixBlendMode !== "string") {
    obj.mixBlendMode = "";
    repaired = true;
  }
  if (typeof obj.filter !== "string") {
    obj.filter = "";
    repaired = true;
  }
  if (typeof obj.mask !== "string") {
    obj.mask = "";
    repaired = true;
  }

  return { data: obj as unknown as EditorLayerEffect, repaired };
}

// 共享效果校验

function validateSharedEffect(raw: unknown): {
  data: SharedEffect | null;
  repaired: boolean;
} {
  if (!raw || typeof raw !== "object") {
    return { data: null, repaired: true };
  }

  let repaired = false;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== "string" || !obj.id) {
    obj.id = generateId();
    repaired = true;
  }
  if (typeof obj.name !== "string" || !obj.name) {
    obj.name = "Unnamed Effect";
    repaired = true;
  }
  if (!obj.effect || typeof obj.effect !== "object") {
    obj.effect = createDefaultEffect();
    repaired = true;
  } else {
    const result = validateEffectObject(obj.effect);
    if (result.repaired) repaired = true;
    obj.effect = result.data;
  }

  return { data: obj as unknown as SharedEffect, repaired };
}

// JSON 导入

/**
 * 从 JSON 字符串导入方案
 *
 * 支持两种格式：
 * 1. 完整 CardScheme 对象 (含 id, name, layers...)
 * 2. 导出的 { cardWidth?, layers: ParallaxLayer[] } 格式（exportLayersToJSON 输出）
 *
 * @returns 解析后的 CardScheme，或错误信息
 */
export function importSchemeFromJSON(jsonStr: string): {
  scheme: CardScheme | null;
  error: string | null;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { scheme: null, error: "invalid_json" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { scheme: null, error: "invalid_structure" };
  }

  const obj = parsed as Record<string, unknown>;

  // 格式 1: 完整 CardScheme
  if (Array.isArray(obj.layers) && typeof obj.name === "string") {
    const result = validateScheme(parsed);
    if (result.data) {
      // 生成新 ID 避免冲突
      result.data.id = generateId();
      return { scheme: result.data, error: null };
    }
    return { scheme: null, error: "invalid_scheme" };
  }

  // 格式 2: { cardWidth?, layers: ParallaxLayer[] } (导出格式)
  if (Array.isArray(obj.layers)) {
    const cardWidth =
      typeof obj.cardWidth === "string" ? obj.cardWidth : "300px";

    // 将 ParallaxLayer[] 转换为 EditorLayer[]
    const editorLayers = (obj.layers as Record<string, unknown>[]).map((l, i) =>
      parallaxToEditorLayer(l, i),
    );

    const scheme = createDefaultScheme({
      name: "Imported",
      cardWidth,
      layers: editorLayers,
    });

    return { scheme, error: null };
  }

  return { scheme: null, error: "invalid_structure" };
}

/**
 * 将 ParallaxLayer 格式（导出格式）转换为 EditorLayer 格式
 */
function parallaxToEditorLayer(
  raw: Record<string, unknown>,
  index: number,
): EditorLayer {
  return {
    id: typeof raw.id === "number" ? raw.id : index + 1,
    img: typeof raw.img === "string" ? raw.img : "",
    zHeight: typeof raw.zHeight === "number" ? raw.zHeight : 0,
    maskMode: raw.mask === "full" ? "full" : raw.mask ? "custom" : "auto",
    maskUrl:
      typeof raw.mask === "string" && raw.mask !== "full" ? raw.mask : "",
    visible: true,
    shine:
      raw.shineEffects && typeof raw.shineEffects === "object"
        ? (raw.shineEffects as LayerEffectValue)
        : createDefaultEffect(),
    glare:
      raw.glareEffects && typeof raw.glareEffects === "object"
        ? (raw.glareEffects as LayerEffectValue)
        : createDefaultEffect(),
  };
}
