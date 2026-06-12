import type {
  AccelerometerStartParams,
  BiometricAuthenticateParams,
  BiometricRequestAccessParams,
  ColorScheme,
  ContentSafeAreaInset,
  DeviceOrientationStartParams,
  DownloadFileParams,
  EmojiStatusParams,
  GyroscopeStartParams,
  LocationData,
  PopupParams,
  SafeAreaInset,
  ScanQrPopupParams,
  StoryShareParams,
  ThemeParams,
  TmaEventPayload,
  TmaEventType,
  WebAppInitData,
} from "../schemas/index";

// ─── Helper Types ─────────────────────────────────────────────────────────────

/** Status values for the `homeScreenChecked` event and `checkHomeScreenStatus` callback. */
export type HomeScreenStatus = "unsupported" | "unknown" | "added" | "missed";

/** Payment status values for the `invoiceClosed` event and `openInvoice` callback. */
export type InvoiceStatus = "paid" | "cancelled" | "failed" | "pending";

/** Chat types that can be passed to `switchInlineQuery` to filter the chat picker. */
export type ChatType = "users" | "bots" | "groups" | "channels";

/** Options for `WebApp.close()`. */
export interface CloseOptions {
  /** Return to the previous chat on close. @since Bot API 7.6 */
  return_back?: boolean;
}

/** Options for `WebApp.openLink()`. */
export interface OpenLinkOptions {
  /** Open the URL in Telegram's Instant View if a page is available for it. @since Bot API 6.4 */
  try_instant_view?: boolean;
}

/**
 * Params accepted by `BottomButton.setParams()` for both the main and
 * secondary buttons.
 *
 * @see https://core.telegram.org/bots/webapps#bottombutton
 */
export interface BottomButtonParams {
  /** Button label text. */
  text?: string;
  /** Button background color in `#RRGGBB` format. */
  color?: string;
  /** Button text color in `#RRGGBB` format. */
  text_color?: string;
  /**
   * Pass `true` to enable a shimmering shine effect on the button.
   * @since Bot API 7.10
   */
  has_shine_effect?: boolean;
  /**
   * Position of the secondary button relative to the main button.
   * Ignored on the main button.
   * @since Bot API 7.10
   */
  position?: "left" | "right" | "top" | "bottom";
  /** Whether the button accepts clicks. */
  is_active?: boolean;
  /** Whether the button is visible. */
  is_visible?: boolean;
  /**
   * Custom emoji identifier for the button icon.
   * @since Bot API 9.5
   */
  icon_custom_emoji_id?: string;
}

/**
 * Strongly-typed event handler for a TMA event.
 *
 * No-payload events (`z.undefined()`) receive no arguments.
 * Payload events receive a strongly-typed `payload` argument.
 * Per the Telegram spec, `this` inside every handler is bound to the
 * `WebApp` object.
 */
export type TmaEventHandler<T extends TmaEventType> = TmaEventPayload<T> extends undefined
  ? (this: TelegramWebApp) => void
  : (this: TelegramWebApp, payload: TmaEventPayload<T>) => void;

// ─── Sub-Object Interfaces ────────────────────────────────────────────────────

/**
 * Controls the back button shown in the Telegram header when the Mini App
 * is open. The button fires the `backButtonClicked` event when pressed.
 *
 * @since Bot API 6.1
 * @see https://core.telegram.org/bots/webapps#backbutton
 */
export interface TelegramBackButton {
  /** Whether the back button is currently visible. */
  isVisible: boolean;
  /** Make the back button visible. */
  show(): this;
  /** Hide the back button. */
  hide(): this;
  /** Register a click handler. Alias for `onEvent("backButtonClicked", callback)`. */
  onClick(callback: () => void): this;
  /** Remove a previously registered click handler. */
  offClick(callback: () => void): this;
}

/**
 * Controls a bottom action button (main or secondary). Both buttons share
 * this interface — use `type` to distinguish them.
 *
 * The main button defaults to `themeParams.button_color` background and
 * `themeParams.button_text_color` text. The secondary button defaults to
 * `themeParams.bottom_bar_bg_color` background and
 * `themeParams.button_color` text.
 *
 * @see https://core.telegram.org/bots/webapps#bottombutton
 */
export interface TelegramBottomButton {
  /** Whether this is the `"main"` or `"secondary"` button. */
  readonly type: "main" | "secondary";
  /** Current button label text. */
  text: string;
  /** Current button background color. */
  color: string;
  /** Current button text color. */
  textColor: string;
  /** Whether the button is currently visible. */
  isVisible: boolean;
  /** Whether the button currently accepts clicks. */
  isActive: boolean;
  /** Whether the loading spinner is currently shown on the button. */
  readonly isProgressVisible: boolean;
  /**
   * Whether the shine effect is active.
   * @since Bot API 7.10
   */
  hasShineEffect: boolean;
  /**
   * Position of the secondary button relative to the main button.
   * @since Bot API 7.10
   */
  position: "left" | "right" | "top" | "bottom";
  /**
   * Custom emoji identifier shown as the button icon.
   * @since Bot API 9.5
   */
  iconCustomEmojiId: string;
  /** Update multiple button properties in one call. */
  setParams(params: BottomButtonParams): this;
  /** Update the button label. */
  setText(text: string): this;
  /** Make the button visible. */
  show(): this;
  /** Hide the button. */
  hide(): this;
  /** Allow the button to receive clicks. */
  enable(): this;
  /** Prevent the button from receiving clicks. */
  disable(): this;
  /**
   * Show a loading spinner on the button.
   * @param leaveActive - Keep the button clickable during loading. Defaults to `false`.
   */
  showProgress(leaveActive?: boolean): this;
  /** Hide the loading spinner. */
  hideProgress(): this;
  /** Register a click handler. */
  onClick(callback: () => void): this;
  /** Remove a previously registered click handler. */
  offClick(callback: () => void): this;
}

/**
 * Controls the settings item shown in the context menu of the Mini App.
 * Pressing it fires the `settingsButtonClicked` event.
 *
 * @since Bot API 7.0
 * @see https://core.telegram.org/bots/webapps#settingsbutton
 */
export interface TelegramSettingsButton {
  /** Whether the settings item is currently visible. */
  isVisible: boolean;
  /** Make the settings item visible. */
  show(): this;
  /** Hide the settings item. */
  hide(): this;
  /** Register a click handler. Alias for `onEvent("settingsButtonClicked", callback)`. */
  onClick(callback: () => void): this;
  /** Remove a previously registered click handler. */
  offClick(callback: () => void): this;
}

/**
 * Provides access to the Telegram haptic feedback API.
 *
 * @since Bot API 6.1
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export interface TelegramHapticFeedback {
  /**
   * Signal a physical impact. Use `light` / `medium` / `heavy` to convey
   * the size of the UI element that was affected. Use `rigid` / `soft` for
   * material-feel feedback.
   */
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): this;
  /** Signal a task or action outcome. */
  notificationOccurred(type: "error" | "success" | "warning"): this;
  /**
   * Signal a selection change. Call only when the selection changes, not
   * when it is confirmed.
   */
  selectionChanged(): this;
}

/**
 * Provides access to Telegram's server-side key-value cloud storage,
 * shared across all Mini Apps for the same user. Keys are scoped per bot.
 *
 * Storage is limited to 1024 keys of up to 128 bytes each, with values up
 * to 4096 bytes.
 *
 * @since Bot API 6.9
 * @see https://core.telegram.org/bots/webapps#cloudstorage
 */
export interface TelegramCloudStorage {
  /** Store a key-value pair. */
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  /** Retrieve the value for a key. */
  getItem(key: string, callback: (error: string | null, value?: string) => void): this;
  /** Retrieve values for multiple keys in one call. */
  getItems(
    keys: string[],
    callback: (error: string | null, values?: Record<string, string>) => void,
  ): this;
  /** Delete a key-value pair. */
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  /** Delete multiple key-value pairs. */
  removeItems(keys: string[], callback?: (error: string | null, removed?: boolean) => void): this;
  /** Retrieve all stored keys. */
  getKeys(callback: (error: string | null, keys?: string[]) => void): this;
}

/**
 * Provides access to the device's local storage for persisting data across
 * Mini App sessions on the same device. Not synced across devices.
 *
 * @since Bot API 9.0
 * @see https://core.telegram.org/bots/webapps#devicestorage
 */
export interface TelegramDeviceStorage {
  /** Store a key-value pair. */
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  /** Retrieve the value for a key. */
  getItem(key: string, callback: (error: string | null, value?: string) => void): this;
  /** Delete a key-value pair. */
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  /** Clear all stored key-value pairs. */
  clear(callback?: (error: string | null, cleared?: boolean) => void): this;
}

/**
 * Provides access to the device's secure enclave (iOS Keychain / Android
 * Keystore) for storing sensitive values that survive app reinstallation.
 *
 * @since Bot API 9.0
 * @see https://core.telegram.org/bots/webapps#securestorage
 */
export interface TelegramSecureStorage {
  /** Store a key-value pair in the secure enclave. */
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  /**
   * Retrieve the value for a key from the secure enclave.
   * `value` is `null` when the key is not found.
   * `canRestore` is `true` when the value can be recovered from a backup.
   */
  getItem(
    key: string,
    callback: (error: string | null, value?: string | null, canRestore?: boolean) => void,
  ): this;
  /** Attempt to restore a backed-up value for a key. */
  restoreItem(key: string, callback: (error: string | null, value?: string) => void): this;
  /** Delete a key-value pair from the secure enclave. */
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  /** Clear all stored key-value pairs from the secure enclave. */
  clear(callback?: (error: string | null, cleared?: boolean) => void): this;
}

/**
 * Controls biometric authentication on the device. Must be initialized via
 * `init()` before any other method is called.
 *
 * @since Bot API 7.2
 * @see https://core.telegram.org/bots/webapps#biometricmanager
 */
export interface TelegramBiometricManager {
  /** Whether `init()` has completed. */
  readonly isInited: boolean;
  /** Whether biometric authentication is available on this device. */
  readonly isBiometricAvailable: boolean;
  /** The type of biometric authentication supported by the device. */
  readonly biometricType: "finger" | "face" | "unknown";
  /** Whether the bot has previously requested biometric access. */
  readonly isAccessRequested: boolean;
  /** Whether the user has granted biometric access to the bot. */
  readonly isAccessGranted: boolean;
  /** Whether a biometric token is currently saved in secure storage. */
  readonly isBiometricTokenSaved: boolean;
  /**
   * A unique device identifier — stable per bot and device, changes on
   * app reinstall.
   */
  readonly deviceId: string;
  /**
   * Initialize the `BiometricManager`. Must be called before any other
   * method.
   */
  init(callback?: () => void): this;
  /**
   * Show the native permission request popup, described by `params`.
   * The callback receives `true` if the user granted access.
   */
  requestAccess(params: BiometricRequestAccessParams, callback?: (granted: boolean) => void): this;
  /**
   * Authenticate the user using biometrics, described by `params`. The
   * callback receives `true` on success, plus the stored biometric token
   * if one was saved.
   */
  authenticate(
    params: BiometricAuthenticateParams,
    callback?: (success: boolean, token?: string) => void,
  ): this;
  /**
   * Save or update the biometric token in secure storage on the device.
   * Pass an empty string to clear the saved token.
   */
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): this;
  /**
   * Open the Telegram settings page for this bot's biometric permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): this;
}

/**
 * Provides access to accelerometer data on the device. Fires
 * `accelerometerChanged` events at the requested frequency while started.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#accelerometer
 */
export interface TelegramAccelerometer {
  /** Whether accelerometer tracking is currently active. */
  readonly isStarted: boolean;
  /** Acceleration along the X axis in m/s². */
  readonly x: number;
  /** Acceleration along the Y axis in m/s². */
  readonly y: number;
  /** Acceleration along the Z axis in m/s². */
  readonly z: number;
  /** Start tracking. The callback receives `true` if tracking started successfully. */
  start(params: AccelerometerStartParams, callback?: (started: boolean) => void): this;
  /** Stop tracking. The callback receives `true` if tracking stopped successfully. */
  stop(callback?: (stopped: boolean) => void): this;
}

/**
 * Provides access to device orientation data. Fires
 * `deviceOrientationChanged` events at the requested frequency while started.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#deviceorientation
 */
export interface TelegramDeviceOrientation {
  /** Whether orientation tracking is currently active. */
  readonly isStarted: boolean;
  /**
   * Whether the orientation data is absolute (relative to magnetic north)
   * or relative. May differ from the `need_absolute` param — some devices
   * cannot provide absolute data even when requested.
   */
  readonly absolute: boolean;
  /** Rotation around the Z axis (compass heading) in degrees [0, 360). */
  readonly alpha: number;
  /** Rotation around the X axis (front-to-back tilt) in degrees [-180, 180]. */
  readonly beta: number;
  /** Rotation around the Y axis (left-to-right tilt) in degrees [-90, 90]. */
  readonly gamma: number;
  /** Start tracking. The callback receives `true` if tracking started successfully. */
  start(params: DeviceOrientationStartParams, callback?: (started: boolean) => void): this;
  /** Stop tracking. The callback receives `true` if tracking stopped successfully. */
  stop(callback?: (stopped: boolean) => void): this;
}

/**
 * Provides access to gyroscope data on the device. Fires
 * `gyroscopeChanged` events at the requested frequency while started.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#gyroscope
 */
export interface TelegramGyroscope {
  /** Whether gyroscope tracking is currently active. */
  readonly isStarted: boolean;
  /** Angular velocity around the X axis in rad/s. */
  readonly x: number;
  /** Angular velocity around the Y axis in rad/s. */
  readonly y: number;
  /** Angular velocity around the Z axis in rad/s. */
  readonly z: number;
  /** Start tracking. The callback receives `true` if tracking started successfully. */
  start(params: GyroscopeStartParams, callback?: (started: boolean) => void): this;
  /** Stop tracking. The callback receives `true` if tracking stopped successfully. */
  stop(callback?: (stopped: boolean) => void): this;
}

/**
 * Controls location access on the device. Must be initialized via `init()`
 * before any other method is called.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#locationmanager
 */
export interface TelegramLocationManager {
  /** Whether `init()` has completed. */
  readonly isInited: boolean;
  /** Whether the device supports location services. */
  readonly isLocationAvailable: boolean;
  /** Whether the bot has previously requested location access. */
  readonly isAccessRequested: boolean;
  /** Whether the user has granted location access to the bot. */
  readonly isAccessGranted: boolean;
  /**
   * Initialize the `LocationManager`. Must be called before any other
   * method.
   */
  init(callback?: () => void): this;
  /**
   * Request the current location. The callback receives `null` if access
   * is denied or location services are unavailable.
   */
  getLocation(callback: (data: LocationData | null) => void): this;
  /**
   * Open the Telegram settings page for this bot's location permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): this;
}

// ─── Main WebApp Interface ────────────────────────────────────────────────────

/**
 * The main Telegram Mini App interface, available at
 * `window.Telegram.WebApp` after the `telegram-web-app.js` script loads.
 *
 * @see https://core.telegram.org/bots/webapps#initializing-mini-apps
 */
export interface TelegramWebApp {
  // ── Data ──────────────────────────────────────────────────────────────────

  /**
   * Raw `initData` string. Send this to your server for HMAC-SHA256
   * validation before trusting any values. Never use client-side data
   * without server-side validation.
   */
  readonly initData: string;
  /**
   * Parsed `initData` object. Convenient for reading on the client, but
   * must not be trusted without server-side validation of `initData`.
   */
  readonly initDataUnsafe: WebAppInitData;
  /** The current Bot API version as a semver-style string, e.g. `"8.0"`. */
  readonly version: string;
  /** The platform identifier, e.g. `"ios"`, `"android"`, `"tdesktop"`. */
  readonly platform: string;

  // ── Appearance State ───────────────────────────────────────────────────────

  /** Current color scheme of the Telegram app. */
  readonly colorScheme: ColorScheme;
  /** Current theme color parameters. */
  readonly themeParams: ThemeParams;
  /**
   * Whether the Mini App is currently active (in the foreground). `false`
   * when minimized or in the background.
   * @since Bot API 8.0
   */
  readonly isActive: boolean;
  /** Whether the Mini App is currently expanded to the maximum available height. */
  readonly isExpanded: boolean;
  /**
   * Whether the Mini App is currently in fullscreen mode.
   * @since Bot API 8.0
   */
  readonly isFullscreen: boolean;
  /**
   * Whether the screen orientation is currently locked.
   * @since Bot API 8.0
   */
  readonly isOrientationLocked: boolean;
  /** Whether the closing confirmation dialog is currently enabled. */
  readonly isClosingConfirmationEnabled: boolean;
  /** Whether vertical swipe-to-close / swipe-to-minimize is enabled. */
  readonly isVerticalSwipesEnabled: boolean;
  /** Current height of the visible area in pixels. */
  readonly viewportHeight: number;
  /**
   * Height of the visible area in its last stable state (not during
   * animation). Use this for layout to avoid jumps during transitions.
   */
  readonly viewportStableHeight: number;
  /** Current header color as a `#RRGGBB` string or keyword. */
  readonly headerColor: string;
  /** Current background color as a `#RRGGBB` string or keyword. */
  readonly backgroundColor: string;
  /**
   * Current bottom bar color as a `#RRGGBB` string or keyword.
   * @since Bot API 7.10
   */
  readonly bottomBarColor: string;
  /**
   * System-level safe area insets in pixels, accounting for notches and
   * navigation bars. Use to ensure content doesn't hide behind system UI.
   * @since Bot API 8.0
   */
  readonly safeAreaInset: SafeAreaInset;
  /**
   * Telegram UI-level safe area insets in pixels, accounting for the
   * header and bottom bar. Use to ensure content doesn't overlap Telegram
   * chrome.
   * @since Bot API 8.0
   */
  readonly contentSafeAreaInset: ContentSafeAreaInset;

  // ── Sub-Objects ────────────────────────────────────────────────────────────

  /** @since Bot API 6.1 */
  readonly BackButton: TelegramBackButton;
  readonly MainButton: TelegramBottomButton;
  /** @since Bot API 7.10 */
  readonly SecondaryButton: TelegramBottomButton;
  /** @since Bot API 7.0 */
  readonly SettingsButton: TelegramSettingsButton;
  /** @since Bot API 6.1 */
  readonly HapticFeedback: TelegramHapticFeedback;
  /** @since Bot API 6.9 */
  readonly CloudStorage: TelegramCloudStorage;
  /** @since Bot API 9.0 */
  readonly DeviceStorage: TelegramDeviceStorage;
  /** @since Bot API 9.0 */
  readonly SecureStorage: TelegramSecureStorage;
  /** @since Bot API 7.2 */
  readonly BiometricManager: TelegramBiometricManager;
  /** @since Bot API 8.0 */
  readonly Accelerometer: TelegramAccelerometer;
  /** @since Bot API 8.0 */
  readonly DeviceOrientation: TelegramDeviceOrientation;
  /** @since Bot API 8.0 */
  readonly Gyroscope: TelegramGyroscope;
  /** @since Bot API 8.0 */
  readonly LocationManager: TelegramLocationManager;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Signal to Telegram that the Mini App is ready to be displayed. Call
   * this as soon as the UI has rendered — it hides the loading placeholder.
   */
  ready(): void;
  /** Expand the Mini App to the maximum available height. */
  expand(): void;
  /** Close the Mini App. */
  close(options?: CloseOptions): void;
  /** Returns `true` if the current Bot API version is at least `version`. */
  isVersionAtLeast(version: string): boolean;

  // ── Appearance Methods ─────────────────────────────────────────────────────

  /**
   * Set the header color.
   * @param color - `#RRGGBB` hex, `"bg_color"`, or `"secondary_bg_color"`.
   * @since Bot API 6.1
   */
  setHeaderColor(color: string): void;
  /**
   * Set the background color.
   * @param color - `#RRGGBB` hex, `"bg_color"`, or `"secondary_bg_color"`.
   * @since Bot API 6.1
   */
  setBackgroundColor(color: string): void;
  /**
   * Set the bottom bar color. Also applied to the Android navigation bar.
   * @param color - `#RRGGBB` hex, `"bg_color"`, `"secondary_bg_color"`, or `"bottom_bar_bg_color"`.
   * @since Bot API 7.10
   */
  setBottomBarColor(color: string): void;

  // ── Behavior ──────────────────────────────────────────────────────────────

  /** Show a confirmation dialog when the user tries to close the Mini App. @since Bot API 6.2 */
  enableClosingConfirmation(): void;
  /** Remove the closing confirmation dialog. @since Bot API 6.2 */
  disableClosingConfirmation(): void;
  /** Allow swiping up to expand and down to minimize or close the Mini App. @since Bot API 7.7 */
  enableVerticalSwipes(): void;
  /** Disable vertical swipe gestures. @since Bot API 7.7 */
  disableVerticalSwipes(): void;

  // ── Fullscreen & Orientation ──────────────────────────────────────────────

  /** Request fullscreen mode. Fires `fullscreenChanged` on success or `fullscreenFailed` on error. @since Bot API 8.0 */
  requestFullscreen(): void;
  /** Exit fullscreen mode. @since Bot API 8.0 */
  exitFullscreen(): void;
  /** Lock the screen orientation to its current state. @since Bot API 8.0 */
  lockOrientation(): void;
  /** Unlock the screen orientation. @since Bot API 8.0 */
  unlockOrientation(): void;

  // ── Home Screen ───────────────────────────────────────────────────────────

  /** Prompt the user to add the Mini App to their home screen. @since Bot API 8.0 */
  addToHomeScreen(): void;
  /**
   * Check whether the Mini App is already on the user's home screen. Also
   * fires the `homeScreenChecked` event.
   * @since Bot API 8.0
   */
  checkHomeScreenStatus(callback?: (status: HomeScreenStatus) => void): void;

  // ── Data Sending ──────────────────────────────────────────────────────────

  /**
   * Send data to the bot and close the Mini App. Only available for Mini
   * Apps opened from a keyboard button.
   * @param data - UTF-8 string, max 4096 bytes.
   */
  sendData(data: string): void;

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Open an external URL. */
  openLink(url: string, options?: OpenLinkOptions): void;
  /** Open a `t.me` link inside Telegram without closing the Mini App. */
  openTelegramLink(url: string): void;
  /**
   * Open a payment invoice. Also fires the `invoiceClosed` event.
   */
  openInvoice(url: string, callback?: (status: InvoiceStatus) => void): void;
  /**
   * Switch to inline mode and pre-fill the query. Pass `choose_chat_types`
   * to restrict which chat types the user can pick.
   * @since Bot API 6.7
   */
  switchInlineQuery(query: string, choose_chat_types?: ChatType[]): void;

  // ── Popups & Dialogs ──────────────────────────────────────────────────────

  /**
   * Show a native popup. Also fires the `popupClosed` event.
   * @since Bot API 6.2
   */
  showPopup(params: PopupParams, callback?: (button_id: string) => void): void;
  /** Show a native alert dialog. @since Bot API 6.2 */
  showAlert(message: string, callback?: () => void): void;
  /** Show a native confirm dialog. @since Bot API 6.2 */
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
  /** Dismiss the on-screen keyboard. @since Bot API 9.1 */
  hideKeyboard(): void;

  // ── QR Scanner ────────────────────────────────────────────────────────────

  /**
   * Show the native QR code scanner. Fires `qrTextReceived` for each
   * scanned code. Return `true` from the callback to close the popup.
   * @since Bot API 6.4
   */
  showScanQrPopup(params: ScanQrPopupParams, callback?: (text: string) => boolean | void): void;
  /** Close the QR scanner popup opened by `showScanQrPopup`. @since Bot API 6.4 */
  closeScanQrPopup(): void;

  // ── Clipboard ─────────────────────────────────────────────────────────────

  /**
   * Read text from the clipboard. Must be called in response to a user
   * interaction. Only available in attachment-menu Mini Apps. Also fires
   * `clipboardTextReceived`.
   * @since Bot API 6.4
   */
  readTextFromClipboard(callback?: (text: string | null) => void): void;

  // ── Permissions ───────────────────────────────────────────────────────────

  /**
   * Request permission to send messages to the user. Also fires
   * `writeAccessRequested`.
   * @since Bot API 6.9
   */
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  /**
   * Request the user's phone number. Also fires `contactRequested`.
   * @since Bot API 6.9
   */
  requestContact(callback?: (shared: boolean) => void): void;

  // ── Media & Files ─────────────────────────────────────────────────────────

  /**
   * Open the native story editor with the given media URL.
   * @since Bot API 7.8
   */
  shareToStory(media_url: string, params?: StoryShareParams): void;
  /**
   * Share a prepared message to any chat. Also fires `shareMessageSent` or
   * `shareMessageFailed`.
   * @since Bot API 8.0
   */
  shareMessage(msg_id: string, callback?: (sent: boolean) => void): void;
  /**
   * Show a native file download prompt. Also fires `fileDownloadRequested`.
   * @since Bot API 8.0
   */
  downloadFile(params: DownloadFileParams, callback?: (accepted: boolean) => void): void;

  // ── Emoji Status ──────────────────────────────────────────────────────────

  /**
   * Open a dialog for the user to set a custom emoji as their status.
   * Also fires `emojiStatusSet` or `emojiStatusFailed`.
   *
   * Note: this requires user interaction and cannot be used to set the
   * status programmatically. For programmatic changes, use the Bot API
   * method `setUserEmojiStatus` after obtaining access via
   * `requestEmojiStatusAccess`.
   * @since Bot API 8.0
   */
  setEmojiStatus(
    custom_emoji_id: string,
    params?: EmojiStatusParams,
    callback?: (set: boolean) => void,
  ): void;
  /**
   * Request permission to update the user's emoji status via the Bot API.
   * Also fires `emojiStatusAccessRequested`.
   * @since Bot API 8.0
   */
  requestEmojiStatusAccess(callback?: (granted: boolean) => void): void;

  // ── Chat Selector ─────────────────────────────────────────────────────────

  /**
   * Open the chat selector. The `req_id` must be obtained via the
   * `savePreparedKeyboardButton` Bot API method before calling this.
   * @since Bot API 9.6
   */
  requestChat(req_id: string, callback?: (sent: boolean) => void): void;

  // ── Events ────────────────────────────────────────────────────────────────

  /** Register a handler for a TMA event. */
  onEvent<T extends TmaEventType>(eventType: T, eventHandler: TmaEventHandler<T>): void;
  /** Remove a previously registered handler for a TMA event. */
  offEvent<T extends TmaEventType>(eventType: T, eventHandler: TmaEventHandler<T>): void;
}

// ─── Namespace & Global Augmentation ─────────────────────────────────────────

/** The `window.Telegram` namespace injected by `telegram-web-app.js`. */
export interface TelegramNamespace {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram: TelegramNamespace;
  }
}