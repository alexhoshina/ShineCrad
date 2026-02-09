import type { CSSProperties } from "vue";
import type { EffectConfig, ParallaxLayer } from "./shine-card-types";

/**
 * 将光效配置转换为 CSS 样式
 * 映射 EffectConfig 中的 layers 到对应的 CSS background 属性。
 */
export function parseEffectToCSS(
  effect: EffectConfig | undefined,
): CSSProperties {
  if (!effect?.layers?.length) return {};

  try {
    const bgImages = effect.layers.map((layer) =>
      layer.type === "image"
        ? `url(${layer.value})`
        : `${layer.type}(${layer.value})`,
    );
    const bgSizes = effect.layers.map((layer) => layer.size || "cover");
    const bgPositions = effect.layers.map(
      (layer) => layer.position || "center",
    );
    const bgBlends = effect.layers.map((layer) => layer.blendMode || "normal");
    const bgRepeats = effect.layers.map((layer) => layer.repeat || "repeat");

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
  } catch (error) {
    console.error("[ShineCard] Error parsing effect CSS:", error);
    return {};
  }
}

/**
 * 生成图层布局样式（Z 轴深度）
 */
export function getLayerLayoutStyle(layer: ParallaxLayer): CSSProperties {
  return {
    "--layer-depth": `${layer.zHeight}px`,
  } as CSSProperties;
}
