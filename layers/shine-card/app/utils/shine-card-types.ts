/**
 * ShineCard 组件类型定义
 * ShineCard 组件的公共 API，不依赖任何编辑器或项目内部模块。
 */

// 背景源

/**
 * 光效对应的 Background Image 属性
 */
export interface BackgroundSource {
  type:
    | "linear-gradient"
    | "radial-gradient"
    | "conic-gradient"
    | "image"
    | "repeating-linear-gradient"
    | "repeating-radial-gradient"
    | "repeating-conic-gradient";
  /** 对应 type 中类型的所需值 */
  value: string;
  /** 具体尺寸，默认 cover */
  size?: string;
  /** 位置，默认 center */
  position?: string;
  /** 重复模式，默认 repeat */
  repeat?: string;
  /** background-blend-mode */
  blendMode?: string;
}

// 效果配置

/**
 * 整个光效配置（ShineCard 直接消费的格式）
 */
export interface EffectConfig {
  layers: BackgroundSource[];
  opacity?: number | string;
  mask?: string;
  filter?: string;
  mixBlendMode?: string;
}

// 视差图层

/**
 * 卡片图层数据（ShineCard 组件 props 中的层格式）
 */
export interface ParallaxLayer {
  /** 唯一标识，用于稳定渲染 key (避免不必要的 DOM 重建) */
  id?: string | number;
  img: string;
  zHeight: number;
  mask?: string;
  shineEffects?: EffectConfig;
  glareEffects?: EffectConfig;
}
