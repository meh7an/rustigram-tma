# rustigram-tma

Full-stack TypeScript framework for building Telegram Mini Apps with Solid.js.
The frontend counterpart to the [`rustigram`](https://github.com/meh7an/rustigram) Rust Bot API framework.

```
@rustigram/tma-core    framework-agnostic bridge, state, storage, sensors, mock
@rustigram/tma-solid   Solid.js reactive bindings — TmaProvider, signals, components, hooks
@rustigram/tma-server  server-side initData validation, SolidStart v2 middleware
```

## Install

```bash
pnpm add @rustigram/tma-core @rustigram/tma-solid @rustigram/tma-server
```

> **Peer dependency:** `@rustigram/tma-core` requires `zod ^4.x` and `solid-js ^1.9.0` (via `@rustigram/tma-solid`).

## Quick-start

```tsx
// src/entry-server.tsx — inject the CDN script before anything else
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
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

```tsx
// src/app.tsx
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

```tsx
// src/routes/index.tsx
import { useTma, useColorScheme, BackButton, MainButton } from "@rustigram/tma-solid";

export default function Page() {
  const { bridge } = useTma();
  const scheme = useColorScheme();
  const user = bridge.launchContext.initDataUnsafe.user;

  return (
    <>
      <BackButton onBack={() => history.back()} />
      <MainButton text="Continue" onClick={() => {}} />
      <p>
        Hello {user?.first_name} — {scheme()} mode
      </p>
    </>
  );
}
```

## Packages

| Package                                      | Docs                                                 | Description             |
| -------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| [`@rustigram/tma-core`](./packages/core)     | [API](https://meh7an.github.io/rustigram-tma/core)   | Framework-agnostic core |
| [`@rustigram/tma-solid`](./packages/solid)   | [API](https://meh7an.github.io/rustigram-tma/solid)  | Solid.js bindings       |
| [`@rustigram/tma-server`](./packages/server) | [API](https://meh7an.github.io/rustigram-tma/server) | Server validation       |

## Monorepo

```
rustigram-tma/
├── packages/
│   ├── core/      @rustigram/tma-core
│   ├── solid/     @rustigram/tma-solid
│   └── server/    @rustigram/tma-server
└── apps/
    └── demo/      SolidStart v2 demo app
```

**Requirements:** Node.js ≥ 22.12, pnpm ≥ 10.

```bash
pnpm install
pnpm -r --filter './packages/**' build
pnpm test               # 124 tests across all packages
cd apps/demo && pnpm dev
```

## License

MIT
