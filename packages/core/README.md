# @rustigram/tma-core

Framework-agnostic Telegram Mini App primitives.
Provides the bridge, reactive state, storage wrappers, sensor managers, and a full mock system for testing — with zero framework dependencies.

```bash
pnpm add @rustigram/tma-core zod
```

## What's inside

| Module  | Exports                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Bridge  | `initBridge`, `isTelegramAvailable`, `TmaBridgeError`                                                                  |
| State   | `createAppState`                                                                                                       |
| Storage | `createCloudStorage`, `createDeviceStorage`, `createSecureStorage`                                                     |
| Sensors | `createAccelerometer`, `createGyroscope`, `createDeviceOrientation`, `createBiometricManager`, `createLocationManager` |
| Mock    | `createTmaMock` (subpath `@rustigram/tma-core/mock`)                                                                   |
| Schemas | All TMA data types as Zod schemas + inferred TypeScript types                                                          |
| Types   | `TelegramWebApp` and all sub-object interfaces                                                                         |

## Usage

### Bridge

```typescript
import { initBridge, isTelegramAvailable } from "@rustigram/tma-core";

if (!isTelegramAvailable()) throw new Error("Not in Telegram");

const bridge = initBridge();
// bridge.webApp          — raw window.Telegram.WebApp
// bridge.launchContext   — { version, platform, colorScheme, themeParams, initDataUnsafe }
// bridge.isVersionAtLeast("8.0")
// bridge.on("themeChanged", handler) / bridge.off(...)
```

### State

```typescript
import { createAppState } from "@rustigram/tma-core";

const appState = createAppState(bridge);

// Subscribe to any scalar field
const unsub = appState.subscribe("colorScheme", (scheme) => {
  document.body.dataset.scheme = scheme;
});

// Read current value
const h = appState.getValue("viewportHeight");

appState.destroy(); // call on cleanup
```

CSS variables (`--tg-theme-*`, `--tg-safe-area-inset-*`) are injected onto `document.documentElement` automatically.

### Storage

```typescript
import { createCloudStorage } from "@rustigram/tma-core";

const storage = createCloudStorage(bridge.webApp.CloudStorage);

await storage.setItem("key", "value");
const val = await storage.getItem("key"); // string | null
const keys = await storage.getKeys(); // string[]
```

Same Promise-based API for `createDeviceStorage` and `createSecureStorage`.

### Sensors

```typescript
import { createAccelerometer } from "@rustigram/tma-core";

const acc = createAccelerometer(bridge);
await acc.start({ refresh_rate: 100 });

const unsubscribe = acc.subscribe(({ x, y, z }) => {
  console.log(x, y, z); // m/s²
});

acc.destroy(); // stops tracking, removes event listeners
```

### Mock (for testing)

Import from the `/mock` subpath — tree-shaken in production builds.

```typescript
import { createTmaMock } from "@rustigram/tma-core/mock";

const mock = createTmaMock({
  version: "8.0",
  colorScheme: "dark",
  themeParams: { bg_color: "#1c1c1d" },
  initData: { user: { id: 42, first_name: "Mehran" }, auth_date: 0, hash: "" },
  biometric: { isAvailable: true, grantAccess: true, token: "tok" },
  location: { grantAccess: true, data: { latitude: 37.77, longitude: -122.42 } },
});

// mock.webApp        — pass to initBridge({ mockWebApp: mock.webApp })
// mock.sensors       — { accelerometer, gyroscope, deviceOrientation } — mutable
// mock.storage       — { cloud, device, secure } — Map<string, string>
// mock.emit(event, payload) — simulate any TMA event
// mock.setState(updates)    — update internal state without clearing handlers
// mock.reset(config?)       — clear all state, handlers, storage

// Simulate sensor data
mock.sensors.accelerometer.x = 9.8;
mock.emit("accelerometerChanged", undefined);

// Pre-populate storage
mock.storage.cloud.set("pref", "dark");
```

## Types

All TMA data types are Zod schemas with inferred TypeScript types:

```typescript
import type {
  ThemeParams,
  WebAppInitData,
  WebAppUser,
  WebAppChat,
  LocationData,
  BiometricType,
  SafeAreaInset,
  ContentSafeAreaInset,
  TmaEventType,
  TmaEventPayload,
} from "@rustigram/tma-core";
```

## Requirements

- Node.js ≥ 22.12
- `zod ^4.x` (peer dependency)
- `telegram-web-app.js` loaded via CDN before your app script
