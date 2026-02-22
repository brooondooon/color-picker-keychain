#include "color_names.h"
#include <math.h>

// ---- CIE LAB conversion helpers ----

struct LABColor {
    float L, a, b;
};

static float pivotXYZ(float n) {
    return (n > 0.008856f) ? cbrtf(n) : (7.787f * n + 16.0f / 116.0f);
}

static LABColor rgbToLAB(uint8_t r, uint8_t g, uint8_t b) {
    // RGB -> linear RGB -> XYZ -> LAB
    float rf = r / 255.0f, gf = g / 255.0f, bf = b / 255.0f;

    // sRGB gamma correction
    rf = (rf > 0.04045f) ? powf((rf + 0.055f) / 1.055f, 2.4f) : rf / 12.92f;
    gf = (gf > 0.04045f) ? powf((gf + 0.055f) / 1.055f, 2.4f) : gf / 12.92f;
    bf = (bf > 0.04045f) ? powf((bf + 0.055f) / 1.055f, 2.4f) : bf / 12.92f;

    // XYZ (D65 illuminant)
    float x = (rf * 0.4124f + gf * 0.3576f + bf * 0.1805f) / 0.95047f;
    float y = (rf * 0.2126f + gf * 0.7152f + bf * 0.0722f) / 1.00000f;
    float z = (rf * 0.0193f + gf * 0.1192f + bf * 0.9505f) / 1.08883f;

    x = pivotXYZ(x);
    y = pivotXYZ(y);
    z = pivotXYZ(z);

    LABColor lab;
    lab.L = 116.0f * y - 16.0f;
    lab.a = 500.0f * (x - y);
    lab.b = 200.0f * (y - z);
    return lab;
}

static float labDistance(LABColor a, LABColor b) {
    float dL = a.L - b.L;
    float da = a.a - b.a;
    float db = a.b - b.b;
    return sqrtf(dL * dL + da * da + db * db);
}

// ---- Built-in color database ----
// Starter set — expand to ~1500 colors later from a comprehensive list.
// Stored as {R, G, B, "Name"} for simplicity.

struct NamedColor {
    uint8_t r, g, b;
    const char* name;
};

static const NamedColor COLOR_DB[] = {
    {255, 0, 0, "Red"},
    {0, 255, 0, "Green"},
    {0, 0, 255, "Blue"},
    {255, 255, 0, "Yellow"},
    {255, 165, 0, "Orange"},
    {128, 0, 128, "Purple"},
    {255, 192, 203, "Pink"},
    {0, 255, 255, "Cyan"},
    {255, 255, 255, "White"},
    {0, 0, 0, "Black"},
    {128, 128, 128, "Gray"},
    {165, 42, 42, "Brown"},
    {245, 245, 220, "Beige"},
    {0, 128, 128, "Teal"},
    {255, 127, 80, "Coral"},
    {250, 128, 114, "Salmon"},
    {75, 0, 130, "Indigo"},
    {230, 230, 250, "Lavender"},
    {128, 0, 0, "Maroon"},
    {0, 128, 0, "Forest Green"},
    {0, 0, 128, "Navy"},
    {128, 128, 0, "Olive"},
    {255, 215, 0, "Gold"},
    {192, 192, 192, "Silver"},
    {64, 224, 208, "Turquoise"},
    {233, 150, 122, "Dark Salmon"},
    {138, 43, 226, "Blue Violet"},
    {255, 99, 71, "Tomato"},
    {46, 139, 87, "Sea Green"},
    {210, 105, 30, "Chocolate"},
    {255, 228, 196, "Bisque"},
    {240, 128, 128, "Light Coral"},
    {32, 178, 170, "Light Sea Green"},
    {135, 206, 235, "Sky Blue"},
    {106, 90, 205, "Slate Blue"},
    {244, 164, 96, "Sandy Brown"},
    {34, 139, 34, "Forest Green"},
    {178, 34, 34, "Firebrick"},
    {255, 250, 205, "Lemon Chiffon"},
    {72, 61, 139, "Dark Slate Blue"},
    // TODO: Expand to ~1500 colors from a comprehensive named color database
};

static const int COLOR_DB_SIZE = sizeof(COLOR_DB) / sizeof(COLOR_DB[0]);

// Pre-computed LAB values for the database
static LABColor labDB[sizeof(COLOR_DB) / sizeof(COLOR_DB[0])];

void color_names_init() {
    for (int i = 0; i < COLOR_DB_SIZE; i++) {
        labDB[i] = rgbToLAB(COLOR_DB[i].r, COLOR_DB[i].g, COLOR_DB[i].b);
    }
    Serial.printf("Color name DB loaded: %d colors\n", COLOR_DB_SIZE);
}

const char* color_name_lookup(RGBColor color) {
    LABColor target = rgbToLAB(color.r, color.g, color.b);

    float bestDist = 999999.0f;
    int bestIdx = 0;

    for (int i = 0; i < COLOR_DB_SIZE; i++) {
        float dist = labDistance(target, labDB[i]);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }

    return COLOR_DB[bestIdx].name;
}
