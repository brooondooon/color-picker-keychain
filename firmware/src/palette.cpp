#include "palette.h"
#include <Preferences.h>

static RGBColor palette[MAX_PALETTE_SIZE];
static int paletteCount = 0;
static int currentIndex = 0;
static Preferences prefs;

void palette_init() {
    prefs.begin("palette", false);
    paletteCount = prefs.getInt("count", 0);
    if (paletteCount > MAX_PALETTE_SIZE) paletteCount = MAX_PALETTE_SIZE;

    for (int i = 0; i < paletteCount; i++) {
        char key[8];
        snprintf(key, sizeof(key), "c%d", i);
        uint32_t packed = prefs.getUInt(key, 0);
        palette[i].r = (packed >> 16) & 0xFF;
        palette[i].g = (packed >> 8) & 0xFF;
        palette[i].b = packed & 0xFF;
    }
    currentIndex = (paletteCount > 0) ? paletteCount - 1 : 0;
    Serial.printf("Palette loaded: %d colors\n", paletteCount);
}

void palette_save(RGBColor color) {
    if (paletteCount >= MAX_PALETTE_SIZE) {
        // Shift everything down, drop oldest
        for (int i = 0; i < MAX_PALETTE_SIZE - 1; i++) {
            palette[i] = palette[i + 1];
        }
        paletteCount = MAX_PALETTE_SIZE - 1;
    }

    palette[paletteCount] = color;
    paletteCount++;
    currentIndex = paletteCount - 1;

    // Persist to flash
    uint32_t packed = ((uint32_t)color.r << 16) | ((uint32_t)color.g << 8) | color.b;
    char key[8];
    snprintf(key, sizeof(key), "c%d", currentIndex);
    prefs.putUInt(key, packed);
    prefs.putInt("count", paletteCount);
}

void palette_navigate(int delta) {
    if (paletteCount == 0) return;
    currentIndex += delta;
    if (currentIndex < 0) currentIndex = paletteCount - 1;
    if (currentIndex >= paletteCount) currentIndex = 0;
}

RGBColor palette_get_current() {
    if (paletteCount == 0) return {0, 0, 0};
    return palette[currentIndex];
}

int palette_get_all(RGBColor* out, int maxCount) {
    int count = (paletteCount < maxCount) ? paletteCount : maxCount;
    for (int i = 0; i < count; i++) {
        out[i] = palette[i];
    }
    return count;
}

int palette_get_count() {
    return paletteCount;
}
