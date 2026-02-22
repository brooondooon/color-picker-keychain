#pragma once
#include <Arduino.h>

// Initialize the rotary encoder
void scroll_wheel_init(int clkPin, int dtPin, int swPin);

// Read encoder rotation since last call. Returns -1, 0, or +1.
int scroll_wheel_read();

// Check if encoder push button was pressed (secondary action)
bool scroll_wheel_button_pressed();
