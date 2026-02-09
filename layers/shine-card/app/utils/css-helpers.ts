import type { CSSProperties } from "vue";

/**
 * 将 camelCase/厂商前缀的 CSS 属性名转换为 kebab-case
 */
export function camelToKebab(key: string): string {
  if (key.startsWith("--")) return key;
  if (key.startsWith("Webkit")) {
    return `-webkit-${key.slice(6).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
  }
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * 将 CSSProperties 对象转换为 CSS 声明字符串
 */
export function cssPropsToDeclarations(props: CSSProperties): string {
  return Object.entries(props)
    .filter(([, v]) => v != null && v !== "")
    .map(([key, value]) => `  ${camelToKebab(key)}: ${value};`)
    .join("\n");
}
