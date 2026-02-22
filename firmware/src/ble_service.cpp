#include "ble_service.h"
#include "palette.h"
#include <NimBLEDevice.h>

// Custom 128-bit UUIDs (random, NOT in Bluetooth SIG reserved range)
// Generated unique UUIDs for this project. Same base, vary first group.
#define SERVICE_UUID        "c010c0de-0001-4b9a-b5a7-d4f2e0a13572"
#define COLOR_CHAR_UUID     "c010c0de-0002-4b9a-b5a7-d4f2e0a13572"
#define PALETTE_CHAR_UUID   "c010c0de-0003-4b9a-b5a7-d4f2e0a13572"

static NimBLEServer* pServer = nullptr;
static NimBLECharacteristic* pColorChar = nullptr;
static NimBLECharacteristic* pPaletteChar = nullptr;
static bool deviceConnected = false;

class ServerCallbacks : public NimBLEServerCallbacks {
    void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override {
        deviceConnected = true;
        Serial.println("BLE: Phone connected");
    }
    void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override {
        deviceConnected = false;
        Serial.println("BLE: Phone disconnected");
        NimBLEDevice::startAdvertising();
    }
};

void ble_init() {
    NimBLEDevice::init("ColorPicker");
    NimBLEDevice::setPower(ESP_PWR_LVL_P6);

    pServer = NimBLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    NimBLEService* pService = pServer->createService(SERVICE_UUID);

    // Color characteristic — notifies phone ONLY when a new color is captured
    pColorChar = pService->createCharacteristic(
        COLOR_CHAR_UUID,
        NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
    );

    // Palette characteristic — phone reads on demand (count byte + packed RGB)
    pPaletteChar = pService->createCharacteristic(
        PALETTE_CHAR_UUID,
        NIMBLE_PROPERTY::READ
    );

    pService->start();

    NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->start();

    Serial.println("BLE initialized, advertising...");
}

void ble_notify_new_color(RGBColor color) {
    if (!deviceConnected) return;

    // Send the captured color
    uint8_t data[3] = {color.r, color.g, color.b};
    pColorChar->setValue(data, 3);
    pColorChar->notify();

    // Also update the palette characteristic so phone can read full palette
    RGBColor colors[MAX_PALETTE_SIZE];
    int count = palette_get_all(colors, MAX_PALETTE_SIZE);

    uint8_t buffer[1 + MAX_PALETTE_SIZE * 3]; // max 61 bytes
    buffer[0] = (uint8_t)count;
    for (int i = 0; i < count; i++) {
        buffer[1 + i * 3 + 0] = colors[i].r;
        buffer[1 + i * 3 + 1] = colors[i].g;
        buffer[1 + i * 3 + 2] = colors[i].b;
    }
    pPaletteChar->setValue(buffer, 1 + count * 3);
}

bool ble_is_connected() {
    return deviceConnected;
}
