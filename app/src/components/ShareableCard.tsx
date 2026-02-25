// Offscreen Pantone-style card for image capture + sharing
// 360x480, big color block + white info strip + footer
// Rendered offscreen (left: -9999) and captured via react-native-view-shot

import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { typography } from "../theme";
import type { SavedColor } from "../utils/mockData";

interface ShareableCardProps {
  item: SavedColor | null;
}

const ShareableCard = forwardRef<View, ShareableCardProps>(({ item }, ref) => {
  if (!item) return null;

  return (
    <View style={styles.offscreen} pointerEvents="none">
      <View ref={ref} style={styles.card} collapsable={false}>
        {/* Color block */}
        <View style={[styles.colorBlock, { backgroundColor: item.hex }]} />

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.hex}>{item.hex}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>COLOR PICKER</Text>
        </View>
      </View>
    </View>
  );
});

ShareableCard.displayName = "ShareableCard";
export default ShareableCard;

const CARD_W = 360;
const CARD_H = 480;
const BORDER = 3;

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    left: -9999,
    top: 0,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "#FFFFFF",
    borderWidth: BORDER,
    borderColor: "#000000",
    overflow: "hidden",
  },
  colorBlock: {
    flex: 1,
  },
  infoStrip: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: BORDER,
    borderTopColor: "#000000",
  },
  hex: {
    color: "#000000",
    ...typography.mono,
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "400",
    marginTop: 4,
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  footerText: {
    color: "#AAAAAA",
    ...typography.caption,
    fontSize: 9,
    letterSpacing: 3,
  },
});
