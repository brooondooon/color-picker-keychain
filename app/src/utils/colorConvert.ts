// Color conversion utilities

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function rgbToHsl(color: RGBColor): HSLColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Parse 3-byte BLE color data to RGBColor
export function parseBleColor(data: Uint8Array): RGBColor {
  return { r: data[0], g: data[1], b: data[2] };
}

export type ColorFormat = "hex" | "rgb" | "hsl" | "css";

export function formatColor(
  hex: string,
  rgb: RGBColor,
  name: string,
  format: ColorFormat,
): string {
  switch (format) {
    case "hex":
      return hex;
    case "rgb":
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case "hsl": {
      const hsl = rgbToHsl(rgb);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case "css": {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      return `--color-${slug}: ${hex};`;
    }
  }
}
