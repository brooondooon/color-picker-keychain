// TFT_eSPI User Setup for ST7735 0.96" 80x160 display
// Board: Seeed XIAO ESP32S3 Sense
//
// Pin mapping VERIFIED against:
//   - arduino-esp32 pins_arduino.h (D10=GPIO9, NOT GPIO10)
//   - TFT_eSPI Discussion #2757 (D7/GPIO44 fails as CS)
//   - Seeed Forum ST7789 thread (working config confirmed)

// ---- Driver ----
#define ST7735_DRIVER

// ---- CRITICAL: Tab type for 80x160 module ----
// Without this, display shows cropped/shifted content.
// If colors are wrong after flashing, try ST7735_REDTAB160x80 instead.
#define ST7735_GREENTAB160x80

// ---- Display dimensions ----
#define TFT_WIDTH  80
#define TFT_HEIGHT 160

// ---- Pin assignments (raw GPIO numbers for safety) ----
// Using GPIO numbers directly avoids any D-label resolution ambiguity.
//
//   D10 = GPIO9  = SPI MOSI
//   D8  = GPIO7  = SPI SCK
//   D1  = GPIO2  = CS  (D7/GPIO44 is UART RX — DOES NOT WORK for SPI CS)
//   D3  = GPIO4  = DC
//   D4  = GPIO5  = RST
//
#define TFT_MOSI  9    // D10 — SDA on display module
#define TFT_SCLK  7    // D8  — SCL on display module
#define TFT_CS    2    // D1  — CS  (VERIFIED working pin)
#define TFT_DC    4    // D3  — DC
#define TFT_RST   5    // D4  — RES
// BLK pin: wire directly to 3V3 for always-on backlight

// ---- SPI speed ----
// ST7735 max reliable speed is ~27MHz.
#define SPI_FREQUENCY  27000000

// ---- Fonts ----
#define LOAD_GLCD    // Font 1: 8-pixel Adafruit
#define LOAD_FONT2   // Font 2: 16-pixel small
#define LOAD_GFXFF   // FreeFonts
#define SMOOTH_FONT
