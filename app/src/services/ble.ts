// BLE service for communicating with the Color Picker device
// Uses @sfourdrinier/react-native-ble-plx
//
// NOTE: BLE will NOT work in Expo Go. You must use a Development Build:
//   npx expo prebuild
//   npx expo run:ios (or run:android)
//
// TODO: Install BLE library when ready for Phase 4:
//   npm install @sfourdrinier/react-native-ble-plx buffer
//   Then add to app.json plugins: ["@sfourdrinier/react-native-ble-plx"]

// Custom 128-bit UUIDs (must match firmware — ble_service.cpp)
export const COLOR_PICKER_SERVICE_UUID =
  "c010c0de-0001-4b9a-b5a7-d4f2e0a13572";
export const COLOR_CHAR_UUID = "c010c0de-0002-4b9a-b5a7-d4f2e0a13572";
export const PALETTE_CHAR_UUID = "c010c0de-0003-4b9a-b5a7-d4f2e0a13572";

// ---- Data decoding ----
// react-native-ble-plx returns all characteristic values as base64 strings.
// Use Buffer.from(value, 'base64') to decode.
//
// Color notification: 3 bytes [R, G, B]
// Palette read: 1 byte count + (count * 3) bytes [R, G, B, R, G, B, ...]

import type { RGBColor } from "../utils/colorConvert";

export function decodeBleColor(base64Value: string): RGBColor {
  // Decode without importing Buffer yet (will add in Phase 4)
  const binary = atob(base64Value);
  return {
    r: binary.charCodeAt(0),
    g: binary.charCodeAt(1),
    b: binary.charCodeAt(2),
  };
}

export function decodePalette(base64Value: string): RGBColor[] {
  const binary = atob(base64Value);
  const count = binary.charCodeAt(0);
  const colors: RGBColor[] = [];

  for (let i = 0; i < count; i++) {
    colors.push({
      r: binary.charCodeAt(1 + i * 3 + 0),
      g: binary.charCodeAt(1 + i * 3 + 1),
      b: binary.charCodeAt(1 + i * 3 + 2),
    });
  }
  return colors;
}

// Placeholder — will implement full BLE manager in Phase 4
export function initBle() {
  console.log("BLE init — not yet implemented");
}
