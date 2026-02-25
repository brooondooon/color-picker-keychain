// Local color storage — no auth, no cloud, just AsyncStorage
// Will swap for Supabase sync in Phase 5

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedColor } from "../utils/mockData";
import { MOCK_COLORS } from "../utils/mockData";

const STORAGE_KEY = "color_picker_palette";
const INITIALIZED_KEY = "color_picker_initialized";

export async function loadColors(): Promise<SavedColor[]> {
  try {
    // On first launch, seed with mock data
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COLORS));
      await AsyncStorage.setItem(INITIALIZED_KEY, "true");
      return MOCK_COLORS;
    }

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveColor(color: SavedColor): Promise<void> {
  const existing = await loadColors();
  existing.unshift(color); // newest first
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function deleteColor(id: string): Promise<void> {
  const existing = await loadColors();
  const filtered = existing.filter((c) => c.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearAllColors(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(INITIALIZED_KEY);
}
