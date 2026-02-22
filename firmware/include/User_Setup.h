// TFT_eSPI User Setup for ST7735 0.96" 80x160 display
// This file configures the TFT_eSPI library for our specific display + XIAO ESP32S3

#define ST7735_DRIVER
#define TFT_WIDTH  80
#define TFT_HEIGHT 160

#define TFT_MOSI   D10  // SDA (data)
#define TFT_SCLK   D8   // SCL (clock)
#define TFT_CS     D7   // Chip select
#define TFT_DC     D6   // Data/command
#define TFT_RST    D5   // Reset

#define SPI_FREQUENCY  27000000

#define LOAD_GLCD   // Font 1: Adafruit 8 pixel
#define LOAD_FONT2  // Font 2: Small 16 pixel
#define LOAD_GFXFF  // FreeFonts
