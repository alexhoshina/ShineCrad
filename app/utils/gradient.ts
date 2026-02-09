import { hexToRgb } from "./color";

export type GradientType =
  | "linear-gradient"
  | "radial-gradient"
  | "conic-gradient"
  | "repeating-linear-gradient"
  | "repeating-radial-gradient"
  | "repeating-conic-gradient";

export type BaseGradientType =
  | "linear-gradient"
  | "radial-gradient"
  | "conic-gradient";

export interface GradientStop {
  id: number;
  color: string;
  position: number;
  alpha: number; // 0-100
}

export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

export interface GradientOutput {
  type: GradientType;
  value: string;
}

function stopToRgba(stop: GradientStop): string {
  const rgb = hexToRgb(stop.color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(stop.alpha / 100).toFixed(2)})`;
  }
  return stop.color;
}

function isRadialType(type: GradientType): boolean {
  return type === "radial-gradient" || type === "repeating-radial-gradient";
}

function isConicType(type: GradientType): boolean {
  return type === "conic-gradient" || type === "repeating-conic-gradient";
}

export function toGradientOutput(config: GradientConfig): GradientOutput {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const stopString = sortedStops
    .map((s) => `${stopToRgba(s)} ${s.position}%`)
    .join(", ");

  let value: string;
  if (isRadialType(config.type)) {
    value = `circle, ${stopString}`;
  } else if (isConicType(config.type)) {
    value = `from ${config.angle}deg, ${stopString}`;
  } else {
    value = `${config.angle}deg, ${stopString}`;
  }

  return { type: config.type, value };
}

export function toGradientCSS(config: GradientConfig): string {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const stopString = sortedStops
    .map((s) => `${stopToRgba(s)} ${s.position}%`)
    .join(", ");

  if (isRadialType(config.type)) {
    return `${config.type}(circle, ${stopString})`;
  }
  if (isConicType(config.type)) {
    return `${config.type}(from ${config.angle}deg, ${stopString})`;
  }
  return `${config.type}(${config.angle}deg, ${stopString})`;
}
