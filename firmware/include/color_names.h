#pragma once
#include "camera.h"

// Initialize the built-in color name database
void color_names_init();

// Look up the nearest named color. Returns a string like "Burnt Sienna".
// Uses CIE LAB nearest-neighbor for perceptually accurate matching.
const char* color_name_lookup(RGBColor color);
