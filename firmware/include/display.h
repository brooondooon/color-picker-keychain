#pragma once
#include "camera.h"

// Initialize the ST7735 TFT display
void display_init();

// Show live preview color (updates rapidly during scanning)
void display_show_live_color(RGBColor color);

// Show captured color with hex code and name
void display_show_captured(RGBColor color, const char* name);
