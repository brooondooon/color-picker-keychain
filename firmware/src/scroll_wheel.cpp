#include "scroll_wheel.h"

static int pinCLK, pinDT, pinSW;
static int lastCLKState;

void scroll_wheel_init(int clkPin, int dtPin, int swPin) {
    pinCLK = clkPin;
    pinDT = dtPin;
    pinSW = swPin;

    pinMode(pinCLK, INPUT);
    pinMode(pinDT, INPUT);
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
