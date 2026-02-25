// Pantone-inspired color swatch card with neobrutalist ink border
// Big clean color rectangle on top, white info strip on bottom
// Card has rounded outer corners, color area is a sharp rectangle

import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { borders, shadows, colors, typography, spacing } from "../theme";
import type { SavedColor } from "../utils/mockData";

interface ColorCardProps {
  item: SavedColor;
  onPress?: (item: SavedColor) => void;
  onLongPress?: (item: SavedColor) => void;
  size?: "normal" | "large";
}

export default function ColorCard({ item, onPress, onLongPress, size = "normal" }: ColorCardProps) {
  const isLarge = size === "large";

  const content = (
    <View style={[styles.card, isLarge && styles.cardLarge]}>
      {/* Color swatch — clean sharp rectangle, no rounded corners */}
      <View
        style={[
          styles.colorArea,
          isLarge && styles.colorAreaLarge,
          { backgroundColor: item.hex },
        ]}
      />
      {/* White info strip */}
      <View style={[styles.infoStrip, isLarge && styles.infoStripLarge]}>
        <Text style={[styles.hex, isLarge && styles.hexLarge]} numberOfLines={1}>
          {item.hex}
        </Text>
        <Text style={[styles.name, isLarge && styles.nameLarge]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress ? () => onPress(item) : undefined}
        onLongPress={onLongPress ? () => onLongPress(item) : undefined}
        style={({ pressed }) => [
          styles.wrapper,
          isLarge && styles.wrapperLarge,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.wrapper, isLarge && styles.wrapperLarge]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    width: "47%",
    marginBottom: spacing.md,
  },
  wrapperLarge: {
    width: "100%",
  },
  card: {
    borderWidth: borders.width,
    borderColor: colors.border,
    borderRadius: 2, // sharp outer corners
    backgroundColor: colors.border, // match border so no white bleed on dark colors
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardLarge: {
    borderRadius: 3,
  },
  colorArea: {
    aspectRatio: 1,
    width: "100%",
    // No border radius — clean rectangle
  },
  colorAreaLarge: {
    aspectRatio: 1.6,
  },
  infoStrip: {
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  infoStripLarge: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  hex: {
    color: colors.textOnSurface,
    ...typography.mono,
    fontSize: 12,
    fontWeight: "700",
  },
  hexLarge: {
    fontSize: 22,
  },
  name: {
    color: colors.textOnSurface,
    ...typography.body,
    fontSize: 11,
    marginTop: 1,
    opacity: 0.6,
  },
  nameLarge: {
    fontSize: 15,
    marginTop: spacing.xs,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
