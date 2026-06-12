# @rustigram/tma-solid

Solid.js reactive bindings for Telegram Mini Apps.
Built on `@rustigram/tma-core` — provides `TmaProvider`, fine-grained signals,
declarative UI components, and hooks for storage, sensors, and biometrics.

```bash
pnpm add @rustigram/tma-solid @rustigram/tma-core solid-js zod
```

## Setup (SolidStart v2)

**1. `src/entry-server.tsx` — inject CDN script:**

```tsx
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          {/* Must load synchronously before Solid mounts */}
          <script src="https://telegram.org/js/telegram-web-app.js" />
          {assets}
        </head>
        <body>
          {children}
          {scripts}
        </body>
      </html>
    )}
  />
));
```

**2. `src/app.tsx` — wrap with TmaProvider:**

```tsx
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { TmaProvider } from "@rustigram/tma-solid";

export default function App() {
  return (
    <Router
      root={(props) => (
        <TmaProvider fallback={<div>Open in Telegram</div>}>
          <Suspense>{props.children}</Suspense>
        </TmaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

**3. `vite.config.ts`:**

```typescript
import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/vite";

export default defineConfig({
  plugins: [solidStart({ ssr: false })],
});
```

## TmaProvider

```tsx
<TmaProvider
  options={{ skipReady: false }} // BridgeOptions — optional
  fallback={<NotInTelegram />} // shown when window.Telegram.WebApp is absent
>
  {props.children}
</TmaProvider>
```

Injects all `--tg-theme-*` and `--tg-safe-area-inset-*` CSS variables automatically.
Calls `webApp.ready()` on mount and `appState.destroy()` on unmount.

## useTma()

```typescript
const { bridge, appState } = useTma();
// bridge.webApp — raw TelegramWebApp
// bridge.launchContext — { version, platform, colorScheme, themeParams, initDataUnsafe }
// bridge.isVersionAtLeast("8.0")
```

## Signals

```typescript
import {
  useColorScheme, // Accessor<"light" | "dark">
  useThemeParams, // Accessor<ThemeParams>
  useIsActive, // Accessor<boolean>
  useIsExpanded, // Accessor<boolean>
  useIsFullscreen, // Accessor<boolean>
  useIsOrientationLocked, // Accessor<boolean>
  useViewportHeight, // Accessor<number>
  useViewportStableHeight, // Accessor<number>
  useSafeAreaInset, // Accessor<SafeAreaInset>
  useContentSafeAreaInset, // Accessor<ContentSafeAreaInset>
  useHeaderColor, // Accessor<string>
  useBackgroundColor, // Accessor<string>
  useBottomBarColor, // Accessor<string>
  useInitData, // Accessor<WebAppInitData>
  useIsVersionAtLeast, // (version: string) => Accessor<boolean>
} from "@rustigram/tma-solid";
```

## Theme

```typescript
const { colorScheme, themeParams, isDark } = useTmaTheme();
const style = useSafeAreaStyle(); // Accessor<JSX.CSSProperties> — for fullscreen layouts
```

CSS variables are injected automatically — use them directly:

```css
background: var(--tg-theme-bg-color);
color: var(--tg-theme-text-color);
```

## Components

Side-effect-only components — render `null`, interact with the Telegram WebApp:

```tsx
import { BackButton, MainButton, SecondaryButton, SettingsButton } from "@rustigram/tma-solid";

<BackButton onBack={() => navigate(-1)} />

<MainButton
  text="Pay"
  loading={isPending()}
  disabled={false}
  onClick={handlePay}
/>

<SecondaryButton text="Cancel" position="left" onClick={handleCancel} />  {/* Bot API 7.10+ */}

<SettingsButton onSettings={() => navigate("/settings")} />
```

## Error Boundary

```tsx
import { TmaErrorBoundary } from "@rustigram/tma-solid";

<TmaErrorBoundary fallback={(err) => <div>Error: {err.message}</div>}>
  <MyPage />
</TmaErrorBoundary>;
```

## Version Gate

```tsx
import { useVersionGate } from "@rustigram/tma-solid";

const gate = useVersionGate("8.0");
// gate.supported — Accessor<boolean>
// gate.Guard     — component that renders children only when version ≥ requirement
// gate.assert()  — throws TmaBridgeError if not supported

<gate.Guard fallback={<p>Requires Bot API 8.0+</p>}>
  <SensorDashboard />
</gate.Guard>;
```

## Storage Hooks

```typescript
const cloud = useCloudStorage(); // + useDeviceStorage(), useSecureStorage()

await cloud.setItem("key", "value");
const val = await cloud.getItem("key"); // string | null
// cloud.loading — Accessor<boolean>
```

## Sensor Hooks

```typescript
const acc = useAccelerometer(); // + useGyroscope(), useDeviceOrientation()
await acc.start({ refresh_rate: 100 });
// acc.data()      — Vector3D | null
// acc.isRunning() — boolean

const bm = useBiometric();
await bm.init();
const granted = await bm.requestAccess({ reason: "Verify" });
const { success, token } = await bm.authenticate({ reason: "Confirm" });
// bm.status() — BiometricStatus

const lm = useLocation();
await lm.init();
const data = await lm.getLocation(); // LocationData | null
// lm.status() — LocationManagerStatus
```

## Testing

```typescript
import { createTmaMock } from "@rustigram/tma-core/mock";
import { render } from "@solidjs/testing-library";
import { TmaProvider } from "@rustigram/tma-solid";

const mock = createTmaMock({ colorScheme: "dark" });

render(() => (
  <TmaProvider options={{ mockWebApp: mock.webApp, skipReady: true }}>
    <MyComponent />
  </TmaProvider>
));

mock.setState({ colorScheme: "light" });
mock.emit("themeChanged", undefined);
```
