import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import BrutCard from "../components/BrutCard";
import ColorBlob from "../components/ColorBlob";
import ColorCard from "../components/ColorCard";
import ColorFormatSheet from "../components/ColorFormatSheet";
import ShareableCard from "../components/ShareableCard";
import { colors, typography, spacing } from "../theme";
import { loadColors } from "../services/storage";
import type { SavedColor } from "../utils/mockData";
import { copy } from "../utils/clipboard";

type HomeScreenProps = {
  navigation: StackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [palette, setPalette] = useState<SavedColor[]>([]);
  const [sheetItem, setSheetItem] = useState<SavedColor | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [shareItem, setShareItem] = useState<SavedColor | null>(null);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    loadColors().then(setPalette);
  }, []);

  const lastScanned = palette[0];
  const recent = palette.slice(0, 6);

  const handleColorLongPress = useCallback((item: SavedColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetItem(item);
    setSheetVisible(true);
  }, []);

  const handleDismissSheet = useCallback(() => {
    setSheetVisible(false);
    setSheetItem(null);
  }, []);

  const handleShare = useCallback(async (item: SavedColor) => {
    setSheetVisible(false);
    setShareItem(item);

    await new Promise((r) => setTimeout(r, 100));

    try {
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `${item.name} — ${item.hex}`,
      });
    } catch {
      await copy(`${item.name}: ${item.hex}`);
    } finally {
      setShareItem(null);
      setSheetItem(null);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>COLOR{"\n"}PICKER</Text>

        {/* Device status card */}
        <BrutCard style={styles.statusCard} variant="transparent">
          <View style={styles.statusDot} />
          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>DEVICE</Text>
            <Text style={styles.statusValue}>Disconnected</Text>
          </View>
        </BrutCard>

        {/* Last scanned — Pantone-style card */}
        {lastScanned && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LAST SCANNED</Text>
            <ColorCard item={lastScanned} size="large" onLongPress={handleColorLongPress} />
          </View>
        )}

        {/* Recent colors — rendered inline (not FlatList) to avoid nesting issue */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              <BrutCard
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate("Palette")}
              >
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </BrutCard>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recent.map((item) => (
                <ColorBlob
                  key={item.id}
                  item={item}
                  size={72}
                  onPress={() => navigation.navigate("Palette")}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <ColorFormatSheet
        item={sheetItem}
        visible={sheetVisible}
        onDismiss={handleDismissSheet}
        onShare={handleShare}
      />

      <ShareableCard ref={shareCardRef} item={shareItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    ...typography.h1,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: spacing.lg,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#555",
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    fontSize: 10,
  },
  statusValue: {
    color: colors.textPrimary,
    ...typography.h3,
    fontSize: 14,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  viewAllBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  viewAllText: {
    color: colors.textOnSurface,
    ...typography.caption,
    fontSize: 10,
  },
});
