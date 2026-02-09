import type {
  ParallaxLayer,
  BackgroundSource,
  EffectConfig,
} from "#layers/shine-card/app/utils/shine-card-types";

// TypeScript 数据导出

/**
 * 将 ParallaxLayer[] 配置导出为可直接使用的 TypeScript 代码字符串。
 * 生成的代码可以直接传递给 ShineCard 组件的 :layers 属性。
 */
export function exportLayersToTS(
  layers: ParallaxLayer[],
  cardWidth?: string,
): string {
  const lines: string[] = [];

  lines.push(
    `import type { ParallaxLayer } from '#layers/shine-card/app/utils/shine-card-types'`,
  );
  lines.push(``);

  if (cardWidth) {
    lines.push(`export const cardWidth = ${JSON.stringify(cardWidth)}`);
    lines.push(``);
  }

  lines.push(
    `export const layers: ParallaxLayer[] = ${stringifyLayers(layers)}`,
  );

  return lines.join("\n");
}

// Vue SFC 导出

/**
 * 将 ParallaxLayer[] 配置导出为可直接运行的 Vue SFC 代码字符串。
 * 生成完整的 ShineCard 使用示例，包含 @ready 事件处理和加载状态。
 */
export function exportLayersToVueSFC(
  layers: ParallaxLayer[],
  cardWidth?: string,
): string {
  const widthValue = cardWidth ?? "300px";
  const lines: string[] = [];

  lines.push(`<script setup lang="ts">`);
  lines.push(
    `import type { ParallaxLayer } from '#layers/shine-card/app/utils/shine-card-types'`,
  );
  lines.push(``);
  lines.push(`const isReady = ref(false)`);
  lines.push(``);
  lines.push(`const layers: ParallaxLayer[] = ${stringifyLayers(layers)}`);
  lines.push(`</script>`);
  lines.push(``);
  lines.push(`<template>`);
  lines.push(`  <ShineCard`);
  lines.push(`    :layers="layers"`);
  lines.push(`    width="${widthValue}"`);
  lines.push(`    @ready="isReady = true"`);
  lines.push(`  />`);
  lines.push(`</template>`);

  return lines.join("\n");
}

// JSON 导出

/**
 * 将 ParallaxLayer[] 配置导出为 JSON 字符串。
 * 便于数据传输、存储和跨项目导入。
 */
export function exportLayersToJSON(
  layers: ParallaxLayer[],
  cardWidth?: string,
): string {
  const payload: { cardWidth?: string; layers: ParallaxLayer[] } = { layers };
  if (cardWidth) payload.cardWidth = cardWidth;
  return JSON.stringify(payload, null, 2);
}

// 字符串化辅助函数

function stringifyLayers(layers: ParallaxLayer[]): string {
  const items = layers.map((layer) => stringifyLayer(layer));
  return `[\n${items.join(",\n")}\n]`;
}

function stringifyLayer(layer: ParallaxLayer): string {
  const parts: string[] = [];

  if (layer.id != null) {
    parts.push(`    id: ${JSON.stringify(layer.id)}`);
  }
  parts.push(`    img: ${JSON.stringify(layer.img)}`);
  parts.push(`    zHeight: ${layer.zHeight}`);

  if (layer.mask) {
    parts.push(`    mask: ${JSON.stringify(layer.mask)}`);
  }

  if (layer.shineEffects) {
    parts.push(
      `    shineEffects: ${stringifyEffectConfig(layer.shineEffects, 4)}`,
    );
  }

  if (layer.glareEffects) {
    parts.push(
      `    glareEffects: ${stringifyEffectConfig(layer.glareEffects, 4)}`,
    );
  }

  return `  {\n${parts.join(",\n")}\n  }`;
}

function stringifyEffectConfig(config: EffectConfig, indent: number): string {
  const pad = " ".repeat(indent);
  const innerPad = " ".repeat(indent + 2);
  const parts: string[] = [];

  parts.push(
    `${innerPad}layers: ${stringifyBackgroundSources(config.layers, indent + 2)}`,
  );

  if (config.opacity !== undefined) {
    parts.push(`${innerPad}opacity: ${config.opacity}`);
  }
  if (config.mixBlendMode) {
    parts.push(
      `${innerPad}mixBlendMode: ${JSON.stringify(config.mixBlendMode)}`,
    );
  }
  if (config.filter) {
    parts.push(`${innerPad}filter: ${JSON.stringify(config.filter)}`);
  }
  if (config.mask) {
    parts.push(`${innerPad}mask: ${JSON.stringify(config.mask)}`);
  }

  return `{\n${parts.join(",\n")}\n${pad}}`;
}

function stringifyBackgroundSources(
  sources: BackgroundSource[],
  indent: number,
): string {
  if (sources.length === 0) return "[]";

  const pad = " ".repeat(indent);
  const items = sources.map((s) => stringifyBackgroundSource(s, indent + 2));
  return `[\n${items.join(",\n")}\n${pad}]`;
}

function stringifyBackgroundSource(
  source: BackgroundSource,
  indent: number,
): string {
  const pad = " ".repeat(indent);
  const parts: string[] = [];

  parts.push(`${pad}type: ${JSON.stringify(source.type)}`);

  // 对于多行 value（如渐变），保持可读格式
  if (source.value.includes("\n")) {
    parts.push(`${pad}value: \`\n${source.value}\n${pad}\``);
  } else {
    parts.push(`${pad}value: ${JSON.stringify(source.value)}`);
  }

  if (source.size) parts.push(`${pad}size: ${JSON.stringify(source.size)}`);
  if (source.position)
    parts.push(`${pad}position: ${JSON.stringify(source.position)}`);
  if (source.repeat)
    parts.push(`${pad}repeat: ${JSON.stringify(source.repeat)}`);
  if (source.blendMode)
    parts.push(`${pad}blendMode: ${JSON.stringify(source.blendMode)}`);

  return `${" ".repeat(indent - 2)}{\n${parts.join(",\n")}\n${" ".repeat(indent - 2)}}`;
}
