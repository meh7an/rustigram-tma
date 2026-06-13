/**
 * TypeScript types generated from `rustigram-miniapp` Rust structs via ts-rs.
 *
 * These are the canonical type definitions for all Telegram Mini App initData
 * objects when the backend is built with the rustigram Rust framework. They
 * are structurally identical to the types inferred by the Zod schemas in the
 * main `@rustigram/tma-core` export — Rust is the single source of truth.
 *
 * Import from this subpath when you want an explicit dependency on the
 * Rust-generated types rather than the Zod-derived ones:
 *
 * ```ts
 * import type { WebAppUser, WebAppInitData } from "@rustigram/tma-core/generated";
 * ```
 *
 * The individual `.ts` files in this directory are auto-generated — do not
 * edit them by hand. Only this barrel (`index.ts`) is maintained manually.
 *
 * To regenerate after changing any Rust type in `rustigram-miniapp`:
 * ```bash
 * cargo run --example gen-types --features ts
 * ```
 */

export type { ColorScheme } from "./ColorScheme";
export type { ContentSafeAreaInset } from "./ContentSafeAreaInset";
export type { InitDataChatType } from "./InitDataChatType";
export type { SafeAreaInset } from "./SafeAreaInset";
export type { ThemeParams } from "./ThemeParams";
export type { WebAppChat } from "./WebAppChat";
export type { WebAppChatType } from "./WebAppChatType";
export type { WebAppInitData } from "./WebAppInitData";
export type { WebAppUser } from "./WebAppUser";