#pragma once
#include "camera.h"

// Initialize BLE GATT server
void ble_init();

// Notify phone of a newly captured color (call only on scan button press)
void ble_notify_new_color(RGBColor color);

// Returns true if a phone is connected
bool ble_is_connected();
