#pragma once

// Initialize BLE GATT server
void ble_init();

// Call each loop — handles BLE events and palette sync
void ble_update();

// Returns true if a phone is connected
bool ble_is_connected();
