#include "scroll_wheel.h"

static int pinCLK, pinDT, pinSW;
static int lastCLKState;

void scroll_wheel_init(int clkPin, int dtPin, int swPin) {
    pinCLK = clkPin;
    pinDT = dtPin;
    pinSW = swPin;

    // Use INPUT_PULLUP for all encoder pins.
    // ESP32-S3 internal pull-ups (~45k) are sufficient for breadboard prototyping.
    // If encoder is jumpy/unreliable, add external 10k pull-ups to 3.3V.
    pinMode(pinCLK, INPUT_PULLUP);
    pinMode(pinDT, INPUT_PULLUP);
    pinMode(pinSW, INPUT_PULLUP);

    lastCLKState = digitalRead(pinCLK);
    Serial.println("Scroll wheel initialized");
}

int scroll_wheel_read() {
    int currentCLK = digitalRead(pinCLK);

    if (currentCLK != lastCLKState && currentCLK == HIGH) {
        // CLK changed — check direction via DT
        int dtState = digitalRead(pinDT);
        lastCLKState = currentCLK;
        return (dtState != currentCLK) ? 1 : -1;
    }

    lastCLKState = currentCLK;
    return 0;
}

bool scroll_wheel_button_pressed() {
    static bool lastState = HIGH;
    bool current = digitalRead(pinSW);

    if (lastState == HIGH && current == LOW) {
        lastState = current;
        delay(50); // debounce
        return true;
    }
    lastState = current;
    return false;
}
