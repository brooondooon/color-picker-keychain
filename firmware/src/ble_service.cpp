#include "ble_service.h"
#include "palette.h"
#include <NimBLEDevice.h>

// Custom UUIDs for our color picker service
#define SERVICE_UUID        "CC01"
#define COLOR_CHAR_UUID     "CC02"  // latest captured color (notifies phone)
#define PALETTE_CHAR_UUID   "CC03"  // full palette data (phone can read)

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

    // Color characteristic — notifies phone when a new color is captured
    pColorChar = pService->createCharacteristic(
        COLOR_CHAR_UUID,
        NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
    );

    // Palette characteristic — phone can read the full palette
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

void ble_update() {
    if (!deviceConnected) return;

    // Update the color characteristic with the latest captured color
    RGBColor current = palette_get_current();
    uint8_t data[3] = {current.r, current.g, current.b};
    pColorChar->setValue(data, 3);
    pColorChar->notify();
}

bool ble_is_connected() {
    return deviceConnected;
}
