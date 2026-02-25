// Neobrutalist card — thick black border + solid offset shadow
// The structural "ink" of the design system

import React from "react";
import { View, StyleSheet, Pressable, Platform, type ViewStyle } from "react-native";
import { borders, shadows, colors } from "../theme";

interface BrutCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "surface" | "transparent" | "color";
}

export default function BrutCard({
  children,
  style,
  onPress,
  variant = "surface",
}: BrutCardProps) {
  const shadow = variant === "surface" ? shadows.onLight : shadows.offset;

  const cardStyle: ViewStyle = {
    ...styles.card,
    ...(variant === "transparent" ? styles.transparent : undefined),
    ...shadow,
    ...style,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) =>
          pressed
            ? {
                ...cardStyle,
                ...(Platform.OS === "ios"
                  ? { shadowOffset: { width: 0, height: 0 } }
                  : { elevation: 0 }),
                transform: [{ translateX: 3 }, { translateY: 3 }],
              }
            : cardStyle
        }
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: borders.width,
    borderColor: colors.border,
    borderRadius: borders.radius,
  },
  transparent: {
    backgroundColor: "transparent",
    borderColor: colors.surface,
  },
});
