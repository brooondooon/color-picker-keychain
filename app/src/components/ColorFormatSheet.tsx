// Bottom sheet modal for choosing color format + sharing
// Slides up from bottom, neobrutalist styling, no extra deps

import React, { useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography, spacing, borders } from "../theme";
import { formatColor, type ColorFormat } from "../utils/colorConvert";
import { copy } from "../utils/clipboard";
import type { SavedColor } from "../utils/mockData";

interface ColorFormatSheetProps {
  item: SavedColor | null;
  visible: boolean;
  onDismiss: () => void;
  onShare: (item: SavedColor) => void;
}

const FORMATS: { key: ColorFormat; label: string }[] = [
  { key: "hex", label: "HEX" },
  { key: "rgb", label: "RGB" },
  { key: "hsl", label: "HSL" },
  { key: "css", label: "CSS" },
];

export default function ColorFormatSheet({
  item,
  visible,
  onDismiss,
  onShare,
}: ColorFormatSheetProps) {
  const insets = useSafeAreaInsets();
  const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);

  const handleCopy = useCallback(
    async (format: ColorFormat) => {
      if (!item) return;
      const value = formatColor(item.hex, item.color, item.name, format);
      await copy(value);
      setCopiedFormat(format);
      setTimeout(() => {
        setCopiedFormat(null);
        onDismiss();
      }, 600);
    },
    [item, onDismiss],
  );

  const handleDismiss = useCallback(() => {
    setCopiedFormat(null);
    onDismiss();
  }, [onDismiss]);

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top border accent */}
          <View style={styles.topBorder} />

          {/* Color preview */}
          <View style={styles.preview}>
            <View
              style={[styles.swatch, { backgroundColor: item.hex }]}
            />
            <View style={styles.previewText}>
              <Text style={styles.colorName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.colorHex}>{item.hex}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Format rows */}
          {FORMATS.map((fmt) => {
            const value = formatColor(
              item.hex,
              item.color,
              item.name,
              fmt.key,
            );
            const isCopied = copiedFormat === fmt.key;

            return (
              <Pressable
                key={fmt.key}
                style={({ pressed }) => [
                  styles.formatRow,
                  pressed && styles.formatRowPressed,
                ]}
                onPress={() => handleCopy(fmt.key)}
              >
                <Text style={styles.formatLabel}>{fmt.label}</Text>
                <Text
                  style={[styles.formatValue, isCopied && styles.copiedValue]}
                  numberOfLines={1}
                >
                  {isCopied ? "COPIED" : value}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.divider} />

          {/* Share button */}
          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && styles.shareBtnPressed,
            ]}
            onPress={() => onShare(item)}
          >
            <Text style={styles.shareBtnText}>SHARE</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
  },
  topBorder: {
    height: 3,
    backgroundColor: colors.border,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderWidth: borders.width,
    borderColor: colors.border,
  },
  previewText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  colorName: {
    color: colors.textOnSurface,
    ...typography.h3,
    fontSize: 16,
  },
  colorHex: {
    color: colors.textOnSurface,
    ...typography.mono,
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border,
  },
  formatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  formatRowPressed: {
    backgroundColor: "#F0F0F0",
  },
  formatLabel: {
    color: colors.textOnSurface,
    ...typography.caption,
    fontSize: 11,
    width: 40,
  },
  formatValue: {
    color: colors.textOnSurface,
    ...typography.mono,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  copiedValue: {
    ...typography.caption,
    fontFamily: undefined,
    fontSize: 12,
    color: "#555",
  },
  shareBtn: {
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    // Neobrutalist shadow
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  shareBtnPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 3 }, { translateY: 3 }],
    elevation: 0,
  },
  shareBtnText: {
    color: colors.surface,
    ...typography.caption,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 3,
  },
});
