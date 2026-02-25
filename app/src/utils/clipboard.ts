// Clipboard helper using expo-clipboard
import * as ExpoClipboard from "expo-clipboard";

export async function copy(text: string) {
  await ExpoClipboard.setStringAsync(text);
}
