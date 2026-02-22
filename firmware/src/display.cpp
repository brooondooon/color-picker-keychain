#include "display.h"
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

// Convert 8-bit RGB to 16-bit RGB565 for the TFT
uint16_t rgbTo565(uint8_t r, uint8_t g, uint8_t b) {
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
}

void display_init() {
    tft.init();
    tft.setRotation(1); // landscape
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(1);
    Serial.println("Display initialized");
}

void display_show_live_color(RGBColor color) {
    uint16_t color565 = rgbTo565(color.r, color.g, color.b);

    // Top half: color blob
    tft.fillRect(0, 0, 160, 50, color565);

    // Bottom half: hex code
    char hex[8];
    snprintf(hex, sizeof(hex), "#%02X%02X%02X", color.r, color.g, color.b);
    tft.setCursor(10, 58);
    tft.setTextSize(2);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.print(hex);
}

void display_show_captured(RGBColor color, const char* name) {
    uint16_t color565 = rgbTo565(color.r, color.g, color.b);

    // Top: color blob
    tft.fillRect(0, 0, 160, 40, color565);

    // Middle: hex code
    char hex[8];
    snprintf(hex, sizeof(hex), "#%02X%02X%02X", color.r, color.g, color.b);
    tft.setCursor(10, 46);
    tft.setTextSize(2);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.print(hex);

    // Bottom: color name
    tft.setCursor(10, 66);
    tft.setTextSize(1);
    tft.print(name);
    // Pad with spaces to clear previous longer names
    tft.print("                ");
}
