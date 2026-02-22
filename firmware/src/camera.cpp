#include "camera.h"
#include "esp_camera.h"

// XIAO ESP32S3 Sense camera pin definitions
#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  10
#define SIOD_GPIO_NUM  40
#define SIOC_GPIO_NUM  39
#define Y9_GPIO_NUM    48
#define Y8_GPIO_NUM    11
#define Y7_GPIO_NUM    12
#define Y6_GPIO_NUM    14
#define Y5_GPIO_NUM    16
#define Y4_GPIO_NUM    18
#define Y3_GPIO_NUM    17
#define Y2_GPIO_NUM    15
#define VSYNC_GPIO_NUM 38
#define HREF_GPIO_NUM  47
#define PCLK_GPIO_NUM  13

void camera_init() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.pixel_format = PIXFORMAT_RGB565;
    config.grab_mode = CAMERA_GRAB_LATEST;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.fb_count = 1;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed: 0x%x\n", err);
        return;
    }
    Serial.println("Camera initialized");
}

RGBColor camera_capture_center_color() {
    RGBColor result = {0, 0, 0};

    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return result;
    }

    // Frame is 320x240 in RGB565 format
    // Sample center 20x20 pixel region and average
    int width = 320;
    int centerX = width / 2;
    int centerY = 240 / 2;
    int sampleSize = 10; // 10 pixels in each direction = 20x20 region

    uint32_t totalR = 0, totalG = 0, totalB = 0;
    int count = 0;

    for (int y = centerY - sampleSize; y < centerY + sampleSize; y++) {
        for (int x = centerX - sampleSize; x < centerX + sampleSize; x++) {
            // RGB565: RRRRRGGGGGGBBBBB (16 bits per pixel)
            int idx = (y * width + x) * 2;
            uint16_t pixel = (fb->buf[idx] << 8) | fb->buf[idx + 1];

            // Extract RGB components and scale to 8-bit
            totalR += ((pixel >> 11) & 0x1F) << 3;
            totalG += ((pixel >> 5) & 0x3F) << 2;
            totalB += (pixel & 0x1F) << 3;
            count++;
        }
    }

    esp_camera_fb_return(fb);

    if (count > 0) {
        result.r = totalR / count;
        result.g = totalG / count;
        result.b = totalB / count;
    }

    return result;
}
