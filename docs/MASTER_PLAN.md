# Color Picker Keychain — Master Product Document

> A handheld keychain device that captures any real-world color — from a sunset to a
> sneaker — displays the hex code, and syncs it to your phone and smart lights.

---

## 1. Product Vision

Point at anything. Press a button. Capture the color.

The device works at any distance — hold it against a fabric swatch or aim it at the sky.
A live color preview on the device shifts in real-time as you sweep around, so you always
know what you're reading. Press the clicky, satisfying button to lock in the color. The
hex code and a human-readable name appear on-screen. Spin the mechanical scroll wheel
(with tactile detent clicks) to browse your saved palette. Sync everything to the companion
phone app for a full library, AI-generated color names, and smart light control.

It should feel like a premium fidget toy that also happens to be genuinely useful.

**Design inspiration:** Teenage Engineering (EP-133, OP-1 Field). Minimalist but playful.
Every control is deliberate and purposeful. Premium materials and satisfying tactile
interactions. The kind of object that belongs in the MoMA Design Store.

---

## 2. Target User & Market

- **Primary:** Designers, artists, interior decorators, hobbyists who think in color
- **Secondary:** Smart home enthusiasts who want to match room lighting to real-world colors
- **Tertiary:** Gadget lovers, fidget toy fans, gift buyers ("that's cool, I want one")
- **Go-to-market:** Build one for yourself first. Validate with friends/community. Then sell.
- **Sales channel:** TBD — evaluate Kickstarter, Etsy, Shopify after prototype is proven.

---

## 3. User Experience (How It Works)

### 3.1 Core Flow
```
1. Pull device off keychain
2. Point at any color (close-up or far away)
3. Watch the live color preview shift on the display in real-time
4. Press the SCAN button (satisfying click) to capture
5. Display shows: [color blob] + #FF5A2B + "Burnt Sienna"
6. Color is saved to on-device palette (last ~20 colors)
7. Spin the scroll wheel to browse your saved palette — each detent = next color
8. Colors auto-sync to phone app over Bluetooth when in range
```

### 3.2 Device Inputs
| Input | Type | Feel | Action |
|-------|------|------|--------|
| **Scan button** | Dedicated tactile push button (Kailh/Alps micro) | Satisfying, clicky, high-quality snap | PRIMARY: capture a color |
| **Scroll wheel** | Rotary encoder (EC11) with mechanical detents | Notched clicks — each click = next color | Browse saved palette |
| **Scroll wheel press** | Built-in push button on encoder shaft | Softer click | SECONDARY: delete color / toggle mode |

The scan button is a **dedicated, separate control** — not overloaded onto the encoder push.
This follows the Teenage Engineering philosophy: the primary interaction deserves its own
purposeful, premium-feeling input. The encoder push handles secondary actions only.

### 3.3 Device Display (DECIDED: Color TFT)
- **0.96" ST7735 color TFT** (80x160 pixels, SPI interface)
- Full RGB color capable — shows the actual captured color, not just text
- Shows three things: **color blob** + **hex code** + **color name**
- In live preview mode: color blob updates in real-time as you aim
- Low-res is fine — the point is seeing the real color on-device

Alternative considered and rejected: mono OLED + separate RGB LED. The LED "glow" would be
striking, but having everything on one surface is cleaner design and better for the
Teenage Engineering-inspired aesthetic. A single, purposeful screen.

### 3.4 Color Naming (Priority Order)
1. **Built-in library** (~1,500 named colors) — matched on-device, works offline
2. **AI-generated names** — creative/descriptive names via API when phone is connected
3. **User rename** — user can rename any color in the phone app

---

## 4. Hardware Architecture

### 4.1 Core Components

| Component | Specific Part | Purpose | Est. Cost |
|-----------|--------------|---------|-----------|
| **Microcontroller** | ESP32-S3 (e.g. XIAO ESP32S3 Sense) | Brain — has camera interface, WiFi, BLE, enough processing power | ~$8-10 |
| **Camera module** | OV2640 (built into XIAO Sense, or standalone) | Captures scene → firmware extracts center-region color | Included or ~$3 |
| **Color display** | 0.96" 80x160 ST7735 TFT (or small IPS) | Shows color blob, hex code, color name. Capable of full RGB color. | ~$3-4 |
| **Rotary encoder** | EC11 or similar with detents | Scroll wheel for browsing palette. Mechanical clicks, no motor needed. | ~$1-2 |
| **Scan button** | Tactile switch (quality, e.g. Kailh or Alps micro) | Satisfying click. The main interaction. | ~$0.50-1 |
| **Battery** | LiPo 200-300mAh | Charge every 1-3 days with moderate use | ~$2-3 |
| **Charge controller** | TP4056 or built-in on dev board | USB-C charging | ~$0-1 (often built-in) |
| **Enclosure** | 3D printed (ordered online via JLCPCB, Shapeways, or PCBWay) | Keychain-sized shell, Tamagotchi-ish form factor | ~$3-5 per unit |

**Estimated BOM per unit: ~$18-25**

### 4.2 Why Camera Instead of a Color Sensor

The original approach was a TCS34725 RGB color sensor. **This was scrapped** because:
- TCS34725 is a **contact sensor** — it reads reflected light from surfaces ~2-10mm away
- It CANNOT read colors from a distance (can't capture a sunset, a mural, a car)
- The core vision is "point at anything" — that requires optics, not contact sensing

A **camera module** (OV2640) solves this:
- Works at any distance — close-up surfaces AND distant scenes
- Firmware captures a frame and extracts the average color from the center region
- Live preview is natural — stream frames, compute center color, update display
- Bonus: enables future palette-from-scene extraction (capture 5 colors from a photo)

### 4.3 Form Factor
- **Size target:** Tamagotchi / Flipper Zero Mini scale — roughly 50x40x15mm
- **Not strict keychain-tiny** — small enough to clip to a bag or keyring, big enough to be comfortable and house the display + wheel
- **Lens opening** on one end (where you point it)
- **Display** on the face
- **Scroll wheel** on the side
- **Scan button** on top or front (thumb-accessible)
- **USB-C port** on bottom for charging

### 4.4 Power Budget (Rough Estimates)
| State | Current Draw | Notes |
|-------|-------------|-------|
| Deep sleep | ~10uA | Device idle on keychain |
| Standby (screen on, no camera) | ~20-30mA | Browsing palette |
| Live preview (camera streaming) | ~100-150mA | Active scanning mode |
| BLE transmitting | ~30-50mA | Syncing to phone |

With a 250mAh battery: ~1.5-2 hours of continuous scanning, or ~2-3 days of moderate use
(a few scans per day + palette browsing). Acceptable for the form factor.

---

## 5. Software Architecture

### 5.1 Firmware (ESP32-S3 — Arduino/C++)

```
firmware/
  src/
    main.cpp              — Setup, main loop, state machine
    camera.cpp            — Camera init, frame capture, color extraction
    display.cpp           — TFT driver, UI rendering (color blob, hex, name)
    palette.cpp           — Local storage of ~20 colors (NVS/SPIFFS)
    scroll_wheel.cpp      — Rotary encoder input handling
    ble_service.cpp       — BLE GATT server for phone communication
    color_names.cpp       — Built-in ~1500 color name lookup table
    power.cpp             — Sleep modes, battery monitoring
```

**Key algorithms:**
- **Center-weighted color extraction:** Capture 320x240 frame → sample center 20x20 pixel
  region → average RGB → convert to hex. Optionally apply white-balance correction.
- **Color name matching:** Nearest-neighbor search in CIE LAB color space against the
  built-in name database. LAB is perceptually uniform (unlike RGB), so "nearest" actually
  means "looks most similar to a human."
- **Live preview loop:** Capture frame → extract color → update display. Target ~10-15 FPS
  for a responsive feel without draining the battery.

### 5.2 Companion Phone App (DECIDED: React Native / Expo — iOS + Android)

**Why React Native over Flutter:** Deep research concluded React Native is the right call.
- Leverages existing JavaScript/TypeScript knowledge (no learning Dart from scratch)
- Expo config plugin auto-wires BLE permissions on both platforms
- EAS Build handles app signing and store submission in the cloud
- `supabase-js` is the primary, most mature Supabase SDK
- Flutter's BLE libraries are marginally better, but that advantage is negated by the
  cost of learning a new language + manually managing native config as a beginner

**BLE library:** `@sfourdrinier/react-native-ble-plx` (community fork of react-native-ble-plx
with Expo SDK 54+ support, auto-reconnection, TypeScript, iOS BLE state restoration).
The official `dotintent/react-native-ble-plx` does NOT support modern Expo.

**Important gotcha:** BLE does NOT work in Expo Go (the QR code test app). You must use
an Expo Development Build (`npx expo prebuild` + `npx expo run:ios`). This is not "ejecting"
— you keep all Expo tooling. And you need a physical phone anyway (simulators have no BLE).

```
app/
  src/
    screens/
      HomeScreen        — Connected device status, quick scan trigger
      PaletteScreen     — Full color library (grid/list view)
      ColorDetailScreen — Single color: hex, RGB, HSL, name, rename, send to lights
      LightsScreen      — Smart light connections and control
      SettingsScreen    — Device settings, account, subscription
    services/
      ble.ts            — BLE connection, color receive, device management
      colorNames.ts     — Built-in name DB + AI naming API calls
      lightsAPI.ts      — Smart light integrations (Hue, LIFX, Govee)
      supabase.ts       — Auth, cloud sync, user data
    utils/
      colorConvert.ts   — RGB/Hex/HSL/LAB conversion utilities
```

**Key features:**
- BLE auto-connect when device is nearby
- Receive scanned colors in real-time
- Full palette library with search, sort, folders/tags
- Color naming: show built-in name, offer AI rename, allow custom rename
- Export palette (ASE for Adobe, JSON, image swatch)
- Smart light control (v2): send any color to connected lights

### 5.3 Backend (Supabase)

| Table | Purpose |
|-------|---------|
| `users` | Auth (Supabase Auth — email + social login) |
| `palettes` | User palette collections |
| `colors` | Individual saved colors (hex, name, source, timestamp, palette_id) |
| `devices` | Registered devices per user |

**Edge Functions:**
- `ai-color-name` — Takes hex code, calls Claude API, returns creative color name
- `sync-colors` — Receives batch of colors from app, merges with cloud storage

**Freemium model:**
- **Free tier:** Device sync, local palette, built-in color names, basic app
- **Premium ($2-3/mo):** AI color names, cloud sync across devices, smart light integrations, palette sharing/export

---

## 6. Engineering Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Color accuracy varies with lighting** | HIGH | Three-layer approach: (1) Camera auto white-balance, (2) software white-balance correction in firmware, (3) user calibration feature — scan a white card to set baseline. Goal is "genuinely accurate for creative work" not "lab-grade Pantone match." |
| **Camera color ≠ perceived color** | MEDIUM | OV2640 has its own color profile. Will calibrate against known color swatches during development. CIE LAB color space for name matching ensures perceptual accuracy. |
| **Battery life too short** | MEDIUM | Aggressive sleep modes. Camera only on when scan button held. Display auto-off after 10 seconds. BLE only active during sync. |
| **BLE connection flaky** | MEDIUM | Use well-tested ESP32 BLE libraries. Implement retry/reconnect logic. Store colors locally first, sync when possible. |
| **Miniaturization hard for a beginner** | HIGH | Phase 1-3 are on a dev board (not miniaturized). Only tackle enclosure/PCB design in Phase 5 after everything works. |
| **3D printing without a printer** | LOW | Use online services (JLCPCB 3D printing is cheap, ~$2-5 per piece). Or local library/makerspace. |
| **Scroll wheel mechanical integration** | MEDIUM | Use an off-the-shelf EC11 rotary encoder. Tons of tutorials. The shaft pokes through the enclosure wall. |

---

## 7. Development Phases & Timeline

### Phase 1: Breadboard Proof of Concept (Week 1)
**Goal:** Camera captures a frame → extracts center color → displays hex on serial monitor.
- Set up Arduino IDE / PlatformIO on Mac
- Wire ESP32-S3 dev board + camera module on breadboard
- Write firmware: capture frame → extract center RGB → print hex
- **Success = seeing accurate hex codes in the serial monitor when pointed at colored objects**
- **Order parts NOW** (some may take a few days to ship)

### Phase 2: Add Display + Live Preview (Week 1-2)
**Goal:** Device shows live-updating color blob + hex code on the TFT screen.
- Wire up the ST7735 TFT display
- Implement live preview loop (camera → color → display at ~10 FPS)
- Add scan button: press to "capture" and freeze the display
- Implement color name lookup (built-in database)
- **Success = point at objects, see color + hex + name update live, press to capture**

### Phase 3: Scroll Wheel + Local Palette (Week 2)
**Goal:** Save captured colors and browse them with the physical scroll wheel.
- Wire up rotary encoder
- Implement palette storage in ESP32 flash (NVS)
- Scroll wheel navigates through saved colors
- Display updates to show each saved color as you scroll
- **Success = scan 10 colors, scroll through them with satisfying clicks**

### Phase 4: BLE + Phone App MVP (Week 2-3)
**Goal:** Colors sync to a phone app over Bluetooth.
- Implement BLE GATT service on ESP32 (advertise, send color data)
- Scaffold React Native / Expo app
- Implement BLE scanning + connection in app
- Receive colors → display in a palette grid
- Add color detail view (hex, RGB, HSL, name)
- **Success = scan a color on device, see it appear on phone within seconds**

### Phase 5: App Features (Week 3-4)
**Goal:** Full app experience — naming, management, cloud sync.
- Set up Supabase backend (auth, database, edge functions)
- Implement cloud palette sync
- Add AI color naming (Claude API via edge function)
- User rename capability
- Palette organization (folders/tags)
- Export palette (image swatch, JSON)

### Phase 6: Enclosure + Miniaturization (Week 4+)
**Goal:** A device that looks and feels like a product, not a breadboard.
- Design enclosure in Fusion 360 or TinkerCAD (beginner-friendly)
- Account for: lens hole, display window, scroll wheel shaft, button, USB-C port
- Order 3D prints from JLCPCB or similar
- Assemble and iterate on fit

### Phase 7 (Future): Production & Polish
- Design custom PCB (KiCad) to replace breadboard wiring
- Optimize firmware for power efficiency
- Smart light integrations (Philips Hue, LIFX, Govee)
- Scene palette extraction (5 colors from one photo)
- FCC/CE certification considerations (if selling)
- Packaging design

---

## 8. Shopping List (Phase 1-3)

Order these ASAP — some ship in 1-3 days from Amazon, others take longer.

| Item | Where to Buy | Est. Cost | Notes |
|------|-------------|-----------|-------|
| **Seeed XIAO ESP32S3 Sense** (includes camera) | Amazon / Seeed Studio | $14-18 | Best option: tiny, has built-in camera + mic, USB-C. All-in-one. |
| **0.96" ST7735 TFT display** (80x160, SPI, color) | Amazon / AliExpress | $3-5 | Full RGB color capable. SPI interface = 4 wires. |
| **EC11 rotary encoder** (with detents + push button) | Amazon (pack of 5) | $6-8 for 5 | Mechanical clicks built in. Some have a push-button on the shaft too. |
| **Tactile push button** (quality, through-hole) | Amazon (assortment pack) | $5-7 for 100+ | Get an assortment, find the click feel you like best. |
| **Breadboard + jumper wires** | Amazon | $8-10 | Half-size breadboard + male-to-male/female jumper wire kit. |
| **USB-C cable** | You probably have one | $0 | For programming and charging the dev board. |
| **LiPo battery 250mAh** (with JST connector) | Amazon / Adafruit | $5-7 | NOT needed for Phase 1-3 (dev board runs off USB). Buy when ready for Phase 6. |

**Phase 1-3 total: ~$35-48**

### Optional but Recommended
| Item | Cost | Why |
|------|------|-----|
| **Soldering iron kit** (if you don't have one) | $20-30 | Pinecil or cheap Amazon kit. Needed for headers + final assembly. |
| **Colored objects for testing** | $0 | Pantone swatch book, paint chips from hardware store, or just use household items. |

---

## 9. Business Model

### Revenue Streams
1. **Hardware sale:** $40-50 per unit (BOM ~$18-25, gross margin ~$15-25 before labor/shipping)
2. **Premium app subscription:** $2-3/month
   - AI-generated color names
   - Cloud sync across multiple devices
   - Smart light integrations
   - Palette sharing and export (Adobe ASE, etc.)
3. **Future:** Pro version with larger display, more storage, direct WiFi-to-lights

### Unit Economics Target (at scale, 100+ units)
| | Per Unit |
|---|---|
| BOM (parts) | $15-18 (drops with volume) |
| 3D printed enclosure | $2-4 |
| Assembly labor | $3-5 (or self-assembled early on) |
| Packaging + shipping materials | $3-5 |
| **Total COGS** | **~$23-32** |
| **Retail price** | **$45-50** |
| **Gross margin** | **~$13-27 (30-55%)** |

---

## 10. Open Questions (To Resolve During Build)

### Resolved
- [x] ~~Does the rotary encoder's push button replace the scan button?~~ **No.** Dedicated scan button stays. Encoder push = secondary action only.
- [x] ~~React Native vs Flutter?~~ **React Native / Expo.** Leverages existing JS/TS skills, better Expo tooling, mature Supabase SDK.
- [x] ~~Color TFT vs mono OLED + RGB LED?~~ **Color TFT.** Cleaner single-surface design fits the TE-inspired aesthetic.
- [x] ~~Color accuracy expectations?~~ **Genuinely accurate for creative work** with 3-layer calibration. Not lab-grade, but not "approximate vibes" either.

### Still Open
- [ ] Product name — needs to be memorable, short, evocative
- [ ] Exact camera module — XIAO Sense has a built-in OV2640, test if quality is sufficient
- [ ] Enclosure design — need to find a designer or learn basic CAD
- [ ] FCC/CE implications — does BLE transmitter require certification for sale?
- [ ] Scroll wheel physical integration — how to mount EC11 in a small enclosure
- [ ] App store approval process timeline
- [ ] Patent landscape — are there existing patents on handheld color picker devices?

---

## 11. Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| **Microcontroller** | ESP32-S3 (XIAO Sense) | Camera interface, BLE, WiFi, great community, cheap |
| **Firmware** | Arduino / PlatformIO (C++) | Beginner-friendly, massive library ecosystem for ESP32 |
| **Display driver** | TFT_eSPI library | Best ESP32 TFT library, supports ST7735 |
| **BLE** | NimBLE (ESP32) | Lighter and more reliable than default ESP32 BLE stack |
| **Phone app** | React Native / Expo | Cross-platform (iOS + Android) from one codebase |
| **App BLE** | @sfourdrinier/react-native-ble-plx | Community fork with Expo 54+ support, auto-reconnect, TypeScript |
| **Backend** | Supabase | Auth, Postgres DB, Edge Functions, real-time — all-in-one |
| **AI naming** | Claude API (via Supabase Edge Function) | Creative, contextual color names |
| **3D modeling** | TinkerCAD (beginner) → Fusion 360 (later) | Free, browser-based, no install needed |
| **PCB design** | KiCad (Phase 7+) | Free, open-source, industry-standard |

---

*This is a living document. Update it as decisions are made and unknowns are resolved.*
