// Sample colors for development — remove when device is ready

import type { RGBColor } from "./colorConvert";

export interface SavedColor {
  id: string;
  color: RGBColor;
  hex: string;
  name: string;
  timestamp: number;
}

export const MOCK_COLORS: SavedColor[] = [
  { id: "1", color: { r: 255, g: 90, b: 43 }, hex: "#FF5A2B", name: "Burnt Sienna", timestamp: Date.now() - 3600000 },
  { id: "2", color: { r: 30, g: 30, b: 30 }, hex: "#1E1E1E", name: "Charcoal", timestamp: Date.now() - 3500000 },
  { id: "3", color: { r: 64, g: 224, b: 208 }, hex: "#40E0D0", name: "Turquoise", timestamp: Date.now() - 3400000 },
  { id: "4", color: { r: 255, g: 195, b: 0 }, hex: "#FFC300", name: "Sunflower", timestamp: Date.now() - 3300000 },
  { id: "5", color: { r: 142, g: 68, b: 173 }, hex: "#8E44AD", name: "Wisteria", timestamp: Date.now() - 3200000 },
  { id: "6", color: { r: 46, g: 204, b: 113 }, hex: "#2ECC71", name: "Emerald", timestamp: Date.now() - 3100000 },
  { id: "7", color: { r: 231, g: 76, b: 60 }, hex: "#E74C3C", name: "Alizarin", timestamp: Date.now() - 3000000 },
  { id: "8", color: { r: 52, g: 73, b: 94 }, hex: "#34495E", name: "Wet Asphalt", timestamp: Date.now() - 2900000 },
  { id: "9", color: { r: 241, g: 196, b: 15 }, hex: "#F1C40F", name: "Buttercup", timestamp: Date.now() - 2800000 },
  { id: "10", color: { r: 155, g: 89, b: 182 }, hex: "#9B59B6", name: "Amethyst", timestamp: Date.now() - 2700000 },
  { id: "11", color: { r: 26, g: 188, b: 156 }, hex: "#1ABC9C", name: "Mint Leaf", timestamp: Date.now() - 2600000 },
  { id: "12", color: { r: 211, g: 84, b: 0 }, hex: "#D35400", name: "Pumpkin", timestamp: Date.now() - 2500000 },
  { id: "13", color: { r: 44, g: 62, b: 80 }, hex: "#2C3E50", name: "Midnight Blue", timestamp: Date.now() - 2400000 },
  { id: "14", color: { r: 243, g: 156, b: 18 }, hex: "#F39C12", name: "Orange Peel", timestamp: Date.now() - 2300000 },
  { id: "15", color: { r: 236, g: 240, b: 241 }, hex: "#ECF0F1", name: "Cloud White", timestamp: Date.now() - 2200000 },
];
