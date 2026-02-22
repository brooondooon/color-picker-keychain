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
| **Camera module** | OV2640 or OV3660 (built into XIAO Sense) | Captures scene → firmware extracts center-region color. Seeed may ship OV3660 on newer units — both work, no code change. | Included |
| **Color display** | 0.96" 80x160 ST7735 TFT, 8-pin SPI breakout | Shows color blob, hex code, color name. Full RGB color. 3.3V logic. | ~$3-5 |
| **Rotary encoder** | KY-040 module (EC11 on breakout PCB) | Scroll wheel for browsing palette. Built-in pull-up resistors. Breadboard-friendly headers. **Do NOT buy bare EC11 — it won't fit a breadboard.** | ~$1-2 |
| **Scan button** | Tactile switch (quality, e.g. Kailh or Alps micro) | Satisfying click. The main interaction. | ~$0.50-1 |
| **Battery** | LiPo 250-400mAh with protection circuit | See power budget below — 250mAh is tight. Use a cell WITH built-in protection (the XIAO has no low-voltage cutoff). | ~$3-5 |
| **Charge controller** | Built into XIAO (SGM40567) | USB-C charging built in. ~50-100mA charge rate. Red LED indicates charging. | $0 |
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

### 4.3 Verified Pin Map

Source: `arduino-esp32/variants/XIAO_ESP32S3/pins_arduino.h` (the compiler source of truth).

```
Pin   GPIO   Assignment           Component
────  ─────  ───────────────────  ──────────────────
D0    GPIO1  Scan button          Tactile push button
D1    GPIO2  TFT_CS               ST7735 chip select (ONLY reliable CS pin)
D2    GPIO3  Encoder CLK          KY-040 rotation A
D3    GPIO4  TFT_DC               ST7735 data/command
D4    GPIO5  TFT_RST              ST7735 reset
D5    GPIO6  Encoder DT           KY-040 rotation B
D6    GPIO43 Encoder SW           KY-040 push button (secondary action)
D7    GPIO44 [DO NOT USE FOR SPI] UART RX — fails as SPI CS. Free for non-SPI use.
D8    GPIO7  TFT_SCLK             ST7735 SPI clock
D9    GPIO8  [FREE]               Available (SPI MISO — unused, ST7735 is write-only)
D10   GPIO9  TFT_MOSI             ST7735 SPI data
```

**9 of 11 pins used. Camera uses internal GPIOs (10-18, 38-40, 47-48) — NO conflict.**

**Key verification:** D10 = GPIO9 (NOT GPIO10). Camera XCLK = GPIO10 (internal only).
These are different physical pins. Confirmed in `pins_arduino.h` source code.

### 4.4 Form Factor
- **Size target:** Tamagotchi / Flipper Zero Mini scale — roughly 50x40x15mm
- **Not strict keychain-tiny** — small enough to clip to a bag or keyring, big enough to be comfortable and house the display + wheel
- **Lens opening** on one end (where you point it)
- **Display** on the face
- **Scroll wheel** on the side
- **Scan button** on top or front (thumb-accessible)
- **USB-C port** on bottom for charging

### 4.4 Power Budget (VERIFIED estimates)
| State | Current Draw | Notes |
|-------|-------------|-------|
| Deep sleep | ~10uA | Device idle on keychain |
| Standby (screen on, no camera) | ~20-30mA | Browsing palette |
| Live preview (camera streaming) | ~180-280mA | Camera (~50mA) + CPU (~100mA) + display (~30mA) + BLE (~15mA) |
| BLE advertising only | ~10-15mA | Intermittent TX bursts |

**Battery life reality check (250mAh):**
- Continuous scanning: **~45-75 minutes** (this is tight)
- Moderate use (a few scans/day + palette browsing): **~1 day**
- Deep sleep standby: weeks

**Power-saving strategies (must implement):**
- Camera OFF when not actively scanning (biggest power saver)
- Display auto-dim/off after 10 seconds idle
- BLE: use long connection intervals (500ms+) when idle
- Consider 400mAh battery if enclosure size allows (doubles runtime)

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

## 8. Shopping List (Phase 1-3) — VERIFIED

Order these ASAP — most ship in 1-3 days from Amazon.

| # | Item | Link | Est. Cost | Critical Notes |
|---|------|------|-----------|----------------|
| 1 | **Seeed XIAO ESP32S3 Sense (Pre-Soldered)** | [Amazon](https://www.amazon.com/Seeed-Studio-XIAO-ESP32-Sense/dp/B0C69FFVHH) | ~$16 | **VERIFY** listing says "Sense" + "OV2640 camera" (or OV3660). Pre-soldered = pin headers attached = plugs into breadboard with zero soldering. If out of stock, the [non-pre-soldered version](https://www.amazon.com/Seeed-Studio-XIAO-ESP32S3-Sense/dp/B0C33N99BX) works but needs header pins soldered on. |
| 2 | **0.96" ST7735 TFT Display** (80x160, 8-pin, SPI) | [Amazon](https://www.amazon.com/Rakstore-Display-80x160-ST7735-Drive/dp/B09WQSF1P8) | ~$4 | Must be the 8-pin breakout board version (not bare display). Verify it has pre-soldered pin headers in the product photos. 3.3V operation — direct compatible. |
| 3 | **KY-040 Rotary Encoder Module** (NOT bare EC11) | [Amazon](https://www.amazon.com/WayinTop-Encoder-Potentiometer-Electronics-Projects/dp/B08728K3YB) | ~$7 | **Must be KY-040 breakout module** with 5 header pins (CLK, DT, SW, +, GND). Has built-in 10k pull-ups. Plugs directly into breadboard. A bare EC11 encoder WILL NOT fit a breadboard. |
| 4 | **Tactile Push Buttons** (assortment) | [Amazon](https://www.amazon.com/Tactile-Momentary-Assortment-Kit-200-Switches/dp/B0723BG637) | ~$8 | 200pc assortment with 10 heights. Find the click feel you like. For final product, upgrade to Kailh/Alps micro switch. |
| 5 | **Breadboard + Jumper Wire Kit** | [Amazon](https://www.amazon.com/Smraza-Breadboard-Resistors-Mega2560-Raspberry/dp/B01HRR7EBG) | ~$10 | Includes breadboard, male-to-male jumper wires, resistors, LEDs. Everything needed for prototyping. |
| 6 | **USB-C data cable** | You probably have one | $0 | Must be a DATA cable, not charge-only. |

**Phase 1-3 total: ~$45**

### Buy later (Phase 6+)
| Item | Cost | Notes |
|------|------|-------|
| **LiPo battery 300-400mAh** (WITH protection circuit) | $5-7 | The XIAO has no low-voltage cutoff — use a protected cell. |
| **Soldering iron** (if you don't have one) | $20-30 | Needed for final assembly. Not needed if you buy the pre-soldered XIAO. |

### Gotchas to watch for
- **ST7735 vs GC9106:** Some very cheap 80x160 displays use a GC9106 controller instead of ST7735. If the display shows cropped/offset content and no GREENTAB/REDTAB config fixes it, you may have a GC9106 clone. Buy from a listing with good reviews.
- **OV3660 vs OV2640:** Seeed is transitioning to OV3660 cameras on newer Sense units. Both work with `esp_camera` library — no code change needed. OV3660 actually runs cooler.

---

## 9. Assembly Guide (How to Actually Build It)

### 9.1 Physical Layout

The XIAO ESP32S3 Sense is 21x17.8mm — it uses 7 rows on a breadboard and straddles the
center channel. The camera expansion board sits ON TOP (connected via B2B snap connector,
press firmly until it clicks). Camera points straight up. Total height with camera: ~15mm.

A half-size breadboard (400 tie points) has 30 rows. The XIAO uses 7, leaving 23 rows
for the display, encoder, and button.

### 9.2 Complete Wiring Table (14 jumper wires)

```
XIAO Pin  │ GPIO  │ Wire To               │ Component
──────────┼───────┼───────────────────────┼──────────────
3V3       │ --    │ VCC + BLK on display  │ ST7735 power + backlight
GND       │ --    │ GND on display        │ ST7735 ground
GND       │ --    │ GND on encoder module │ KY-040 ground
GND       │ --    │ One leg of button     │ Scan button ground
D0 (GPIO1)│ 1     │ Other leg of button   │ Scan button signal
D1 (GPIO2)│ 2     │ CS on display         │ ST7735 chip select
D2 (GPIO3)│ 3     │ CLK on encoder module │ KY-040 rotation A
D3 (GPIO4)│ 4     │ DC on display         │ ST7735 data/command
D4 (GPIO5)│ 5     │ RES on display        │ ST7735 reset
D5 (GPIO6)│ 6     │ DT on encoder module  │ KY-040 rotation B
D6(GPIO43)│ 43    │ SW on encoder module  │ KY-040 push button
D8 (GPIO7)│ 7     │ SCL on display        │ ST7735 SPI clock
D10(GPIO9)│ 9     │ SDA on display        │ ST7735 SPI data (MOSI)
```

**Tip:** Use the breadboard power rails. Run 3V3 → red rail, GND → blue rail.
Then connect display VCC/BLK from red rail, all GNDs from blue rail. Keeps wiring clean.

### 9.3 Testing Order (test one component at a time)

1. **Blink test** — Just the XIAO, no external parts. Upload Blink sketch. LED blinks = board works.
2. **Button test** — Wire button to D0 + GND. Read `digitalRead()` in serial monitor.
3. **Display test** — Wire all 8 display connections. Upload `tft.fillScreen(TFT_RED)`. See red = display works.
4. **Encoder test** — Wire encoder module. Print rotation count to serial. Twist and verify.
5. **Camera test** — Snap on expansion board (no extra wires). Upload camera capture sketch. Check serial for "Camera initialized."
6. **Integration** — Upload full firmware. All components work together.

### 9.4 Top Beginner Mistakes to Avoid

1. **VCC to 5V instead of 3V3** — The ST7735 is 3.3V. 5V can permanently damage it.
2. **Missing encoder GND** — The KY-040 module has one GND pin. Must be connected or nothing works.
3. **Swapping SDA/SCL (or DC/CS)** — Produces blank screen with no error message. Triple-check.
4. **Loose jumper wires** — Wiggle each wire. If the component flickers, that wire is loose.
5. **BLK pin unconnected** — Some displays default to backlight OFF. Always wire BLK to 3V3.
6. **Camera board not clicked in** — The B2B connector needs a firm press until it clicks.

---

## 10. Business Model (unchanged)

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

## 11. Open Questions

### Resolved (10 of 15)
- [x] Scan button vs encoder push → **Dedicated button.** TE design philosophy.
- [x] React Native vs Flutter → **React Native / Expo.** Leverages JS/TS skills.
- [x] Color TFT vs OLED + LED → **Color TFT.** Single-surface TE aesthetic.
- [x] Color accuracy → **Genuinely accurate** with 3-layer calibration.
- [x] D10/GPIO10 camera conflict → **No conflict.** D10=GPIO9, camera XCLK=GPIO10 (internal).
- [x] D7 as SPI CS → **Does NOT work.** UART RX. Use D1/GPIO2 instead.
- [x] BLE UUIDs → **Random 128-bit UUIDs.** Short UUIDs are SIG-reserved.
- [x] Camera module → OV2640 or OV3660, both work. No code change.
- [x] Bare EC11 → **KY-040 module** for breadboard. Bare EC11 won't fit.
- [x] Battery → 250mAh = ~1hr active. Consider 400mAh for better runtime.

### Still Open (5)
- [ ] Product name
- [ ] Enclosure CAD design
- [ ] FCC/CE certification requirements for BLE product sales
- [ ] App store approval timeline
- [ ] Patent landscape for handheld color picker devices
- [ ] ST7735 GREENTAB vs REDTAB — test when display arrives

---

## 12. Tech Stack Summary

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
