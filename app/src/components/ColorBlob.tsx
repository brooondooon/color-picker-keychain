// Organic paint-blob color swatch with neobrutalist ink border
// Each blob has a unique shape, size, and rotation — like paint on a palette

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { borders, shadows, colors, typography, spacing } from "../theme";
import type { SavedColor } from "../utils/mockData";

interface ColorBlobProps {
  item: SavedColor;
  size?: number;
  onPress?: (item: SavedColor) => void;
  onLongPress?: (item: SavedColor) => void;
  showLabel?: boolean;
  // Palette mode: varied sizes, rotation, offsets
  organic?: boolean;
}

// FNV-1a hash — good spread even for short strings like "1"-"15"
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= str.length;
  h = Math.imul(h, 2654435761);
  return h >>> 0;
}

// Deterministic organic border radii
function blobRadii(h: number): [number, number, number, number] {
  const base = 20;
  const vary = 32;
  return [
    base + ((h & 0xff) % vary),
    base + (((h >> 8) & 0xff) % vary),
    base + (((h >> 16) & 0xff) % vary),
    base + (((h >> 24) & 0xff) % vary),
  ];
}

// Deterministic rotation in degrees (-12 to +12)
function blobRotation(h: number): number {
  return ((h >> 4) % 25) - 12;
}

// Deterministic size variation (0.75 to 1.15 multiplier)
function blobSizeMultiplier(h: number): number {
  return 0.75 + ((h >> 12) % 40) / 100;
}

// Deterministic horizontal offset (-8 to +8)
function blobOffset(h: number): number {
  return ((h >> 6) % 17) - 8;
}

export default function ColorBlob({
  item,
  size = 100,
  onPress,
  onLongPress,
  showLabel = true,
  organic = false,
}: ColorBlobProps) {
  const h = hashString(item.id);
  const [tl, tr, br, bl] = blobRadii(h);

  const actualSize = organic ? Math.round(size * blobSizeMultiplier(h)) : size;
  const rotation = organic ? blobRotation(h) : 0;
  const offsetX = organic ? blobOffset(h) : 0;

  const blobStyle: Record<string, unknown> = {
    width: actualSize,
    height: actualSize,
    backgroundColor: item.hex,
    borderTopLeftRadius: tl,
    borderTopRightRadius: tr,
    borderBottomRightRadius: br,
    borderBottomLeftRadius: bl,
    borderWidth: borders.width,
    borderColor: colors.border,
    ...shadows.offset,
  };

  const wrapperTransform = organic
    ? {
        transform: [
          { rotate: `${rotation}deg` },
          { translateX: offsetX },
        ],
      }
    : {};

  const content = (
    <View style={[styles.wrapper, wrapperTransform]}>
      <View style={blobStyle} />
      {showLabel && (
        <Text style={styles.label} numberOfLines={1}>
          {item.hex}
        </Text>
      )}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress ? () => onPress(item) : undefined}
        onLongPress={onLongPress ? () => onLongPress(item) : undefined}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    margin: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    ...typography.mono,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.93 }],
  },
});
