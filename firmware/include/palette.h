#pragma once
#include "camera.h"

#define MAX_PALETTE_SIZE 20

// Initialize palette storage (loads from flash)
void palette_init();

// Save a new color to the palette
void palette_save(RGBColor color);

// Navigate through palette (-1 = prev, +1 = next)
void palette_navigate(int delta);

// Get the currently selected color
RGBColor palette_get_current();

// Get the full palette (for BLE sync)
int palette_get_all(RGBColor* out, int maxCount);

// Get count of saved colors
int palette_get_count();
