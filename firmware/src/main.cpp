#include <Arduino.h>
#include "camera.h"
#include "display.h"
#include "palette.h"
#include "scroll_wheel.h"
#include "ble_service.h"
#include "color_names.h"

// Pin definitions
#define SCAN_BUTTON_PIN  D1
#define ENCODER_CLK_PIN  D2
#define ENCODER_DT_PIN   D3
#define ENCODER_SW_PIN   D4  // encoder push button (secondary action)

// Device states
enum DeviceState {
    STATE_LIVE_PREVIEW,   // camera streaming, showing live color
    STATE_COLOR_CAPTURED, // color locked in, showing hex + name
    STATE_PALETTE_BROWSE  // scrolling through saved colors
};

DeviceState currentState = STATE_LIVE_PREVIEW;

void setup() {
    Serial.begin(115200);
    Serial.println("Color Picker Keychain — booting...");

    // Initialize button
    pinMode(SCAN_BUTTON_PIN, INPUT_PULLUP);

    // Initialize subsystems
    camera_init();
    display_init();
    palette_init();
    scroll_wheel_init(ENCODER_CLK_PIN, ENCODER_DT_PIN, ENCODER_SW_PIN);
    ble_init();
    color_names_init();

    Serial.println("Ready!");
}

void loop() {
    // Read inputs
    bool scanPressed = (digitalRead(SCAN_BUTTON_PIN) == LOW);
    int scrollDelta = scroll_wheel_read(); // -1, 0, or +1

    switch (currentState) {
        case STATE_LIVE_PREVIEW: {
            // Camera captures frame, extract center color
            RGBColor color = camera_capture_center_color();
            display_show_live_color(color);

            if (scanPressed) {
                // Capture the color
                palette_save(color);
                currentState = STATE_COLOR_CAPTURED;
                Serial.printf("Captured: #%02X%02X%02X\n", color.r, color.g, color.b);
                delay(200); // debounce
            }
            break;
        }

        case STATE_COLOR_CAPTURED: {
            // Show the captured color with name
            RGBColor captured = palette_get_current();
            const char* name = color_name_lookup(captured);
            display_show_captured(captured, name);

            if (scanPressed) {
                // Back to live preview
                currentState = STATE_LIVE_PREVIEW;
                delay(200);
            }
            if (scrollDelta != 0) {
                // Switch to palette browsing
                currentState = STATE_PALETTE_BROWSE;
            }
            break;
        }

        case STATE_PALETTE_BROWSE: {
            if (scrollDelta != 0) {
                palette_navigate(scrollDelta);
            }
            RGBColor browsed = palette_get_current();
            const char* name = color_name_lookup(browsed);
            display_show_captured(browsed, name);

            if (scanPressed) {
                // Back to live preview
                currentState = STATE_LIVE_PREVIEW;
                delay(200);
            }
            break;
        }
    }

    // BLE: sync palette to phone if connected
    ble_update();
}
