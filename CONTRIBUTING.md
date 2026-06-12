# Contributing to rustigram-tma

## Requirements

- Node.js ≥ 22.12
- pnpm ≥ 10

## Setup

```bash
git clone https://github.com/meh7an/rustigram-tma
cd rustigram-tma
pnpm install
pnpm -r --filter './packages/**' build
```

## Project structure

```
rustigram-tma/
├── packages/
│   ├── core/      @rustigram/tma-core   — framework-agnostic primitives
│   ├── solid/     @rustigram/tma-solid  — Solid.js bindings
│   └── server/    @rustigram/tma-server — server-side validation
└── apps/
    └── demo/      SolidStart v2 demo app (not published)
```

## Dev workflow

```bash
# Build all packages (required before running tests or demo)
pnpm -r --filter './packages/**' build

# Run all tests (124 tests across three packages)
pnpm -r --filter './packages/**' exec vitest --run

# Or per-package
pnpm --filter @rustigram/tma-core   test --run
pnpm --filter @rustigram/tma-solid  test --run
pnpm --filter @rustigram/tma-server test --run

# Run the demo app
cd apps/demo && pnpm dev

# Lint
pnpm lint

# Typecheck
pnpm -r --filter './packages/**' typecheck

# Generate API docs
pnpm generate-docs
```

## Making changes

### All three packages use strict TypeScript

- `noUncheckedIndexedAccess` — array/object index access returns `T | undefined`
- `exactOptionalPropertyTypes` — never spread `{ key: val | undefined }` into `{ key?: val }`

### Core patterns

- Never use `any` — use `unknown` + type narrowing
- Web Crypto API only in server (`globalThis.crypto.subtle`) — no `node:crypto`
- Zod schemas are the single source of truth for all TMA data types
- Keep `z.infer<typeof Schema>` on one line — esbuild 0.27 chokes on multi-line generics

### Adding to `@rustigram/tma-solid`

JSX is compiled with `babel-preset-solid` via an esbuild plugin in `tsup.config.ts`.
Do not change `esbuildOptions.jsx` — it will regenerate `solid-js/jsx-runtime` imports
that Vite's pre-bundler drops.

### Adding new exports to a subpath

If you add a new subpath export (e.g. `@rustigram/tma-core/new-thing`), update **both**:

1. `exports` in `package.json`
2. `typesVersions` in `package.json` — use `"./new-thing"` (with `./`) as the key

## Tests

Tests use `vitest ^4.x`. Each package has its own `vitest.config.ts`.

```bash
# Watch mode during development
pnpm --filter @rustigram/tma-solid test
```

Solid component tests use `@solidjs/testing-library` with `happy-dom`.
Core and server tests run in `happy-dom` and `node` environments respectively.

When testing components, always pass `skipReady: true` to `TmaProvider` options to avoid
calling `webApp.ready()` during tests.

## Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning.
All three packages are linked — a single changeset bumps all of them together.

```bash
# After making changes, add a changeset
pnpm changeset

# Review pending changesets
pnpm changeset status

# Version and publish (maintainers only)
pnpm changeset version
pnpm -r --filter './packages/**' publish --access public
```

## CI

GitHub Actions runs on every push and pull request:

- Typecheck → Build → Lint → Test

Docs are built and deployed to GitHub Pages on every push to `main`.

## Known issues

See the `## Known Workarounds` section in [progress.md](./progress.md) for a full list
of active workarounds and why they exist.
