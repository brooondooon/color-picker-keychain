import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
} from "react-native";
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

type PaletteScreenProps = {
  navigation: StackNavigationProp<any>;
};

type ViewMode = "blobs" | "grid";

export default function PaletteScreen({ navigation }: PaletteScreenProps) {
  const [palette, setPalette] = useState<SavedColor[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("blobs");
  const [sheetItem, setSheetItem] = useState<SavedColor | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [shareItem, setShareItem] = useState<SavedColor | null>(null);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    loadColors().then(setPalette);
  }, []);

  const handleColorPress = async (item: SavedColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await copy(item.hex);
  };

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

    // Wait a frame for the offscreen card to render
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
      // Fallback: share as text if capture fails (e.g. Expo Go)
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      // Can't share text directly with expo-sharing, so copy instead
      await copy(`${item.name}: ${item.hex}`);
    } finally {
      setShareItem(null);
      setSheetItem(null);
    }
  }, []);

  const toggleView = () => {
    Haptics.selectionAsync();
    setViewMode((m) => (m === "blobs" ? "grid" : "blobs"));
  };

  if (palette.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO COLORS YET</Text>
          <Text style={styles.emptySubtitle}>
            Connect your device to start scanning
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <BrutCard style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{"\u2190"}</Text>
          </BrutCard>
        </View>
        <Text style={styles.title}>PALETTE</Text>
        <BrutCard style={styles.toggleBtn} onPress={toggleView}>
          <Text style={styles.toggleText}>
            {viewMode === "blobs" ? "GRID" : "BLOBS"}
          </Text>
        </BrutCard>
      </View>

      <Text style={styles.countLabel}>{palette.length} COLORS</Text>

      {viewMode === "blobs" ? (
        <BlobView palette={palette} onPress={handleColorPress} onLongPress={handleColorLongPress} />
      ) : (
        <GridView palette={palette} onPress={handleColorPress} onLongPress={handleColorLongPress} />
      )}

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

// --- Blob View: painter's palette — organic, scattered, alive ---
function BlobView({
  palette,
  onPress,
  onLongPress,
}: {
  palette: SavedColor[];
  onPress: (item: SavedColor) => void;
  onLongPress: (item: SavedColor) => void;
}) {
  // Lay out blobs in staggered rows of 2-3, varied sizes
  const rows: SavedColor[][] = [];
  let i = 0;
  let rowIndex = 0;
  while (i < palette.length) {
    // Alternate between 3 and 2 per row for organic rhythm
    const count = rowIndex % 3 === 1 ? 2 : 3;
    rows.push(palette.slice(i, i + count));
    i += count;
    rowIndex++;
  }

  return (
    <ScrollView contentContainerStyle={styles.blobContainer}>
      {rows.map((row, rIdx) => (
        <View
          key={rIdx}
          style={[
            styles.blobRow,
            // Offset alternate rows for scattered feel
            rIdx % 2 === 1 && { paddingLeft: 20 },
          ]}
        >
          {row.map((item) => (
            <ColorBlob
              key={item.id}
              item={item}
              size={96}
              onPress={onPress}
              onLongPress={onLongPress}
              showLabel
              organic
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// --- Grid View: Pantone-inspired swatch cards ---
function GridView({
  palette,
  onPress,
  onLongPress,
}: {
  palette: SavedColor[];
  onPress: (item: SavedColor) => void;
  onLongPress: (item: SavedColor) => void;
}) {
  return (
    <FlatList
      data={palette}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContainer}
      columnWrapperStyle={styles.gridRow}
      renderItem={({ item }) => (
        <ColorCard item={item} onPress={onPress} onLongPress={onLongPress} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.textOnSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    color: colors.textPrimary,
    ...typography.h1,
    fontSize: 28,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  toggleText: {
    color: colors.textOnSurface,
    ...typography.caption,
    fontSize: 10,
  },
  countLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  // Blob view — painter's palette
  blobContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  blobRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  // Grid view (ColorCard handles individual card styling)
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    ...typography.h2,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
