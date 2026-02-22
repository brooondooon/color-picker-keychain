#pragma once
#include <Arduino.h>

struct RGBColor {
    uint8_t r;
    uint8_t g;
    uint8_t b;
};

// Initialize the OV2640 camera on the XIAO ESP32S3 Sense
void camera_init();

// Capture a frame and return the average color of the center region
RGBColor camera_capture_center_color();
