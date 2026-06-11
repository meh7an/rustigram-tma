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

export type HomeScreenStatus = "unsupported" | "unknown" | "added" | "missed";
export type InvoiceStatus = "paid" | "cancelled" | "failed" | "pending";
export type ChatType = "users" | "bots" | "groups" | "channels";

export interface CloseOptions {
  /** Return to the previous chat on close. @since Bot API 7.6 */
  return_back?: boolean;
}

export interface OpenLinkOptions {
  /** Open in Instant View if available. @since Bot API 6.4 */
  try_instant_view?: boolean;
}

export interface BottomButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  /** @since Bot API 7.10 */
  has_shine_effect?: boolean;
  /** Secondary button only. @since Bot API 7.10 */
  position?: "left" | "right" | "top" | "bottom";
  is_active?: boolean;
  is_visible?: boolean;
  /** @since Bot API 9.5 */
  icon_custom_emoji_id?: string;
}

/**
 * Handler for a TMA event. No-payload events receive no arguments.
 * Payload events receive a strongly-typed argument.
 * Per the spec, `this` is bound to the WebApp object inside every handler.
 */
export type TmaEventHandler<T extends TmaEventType> = TmaEventPayload<T> extends undefined
  ? (this: TelegramWebApp) => void
  : (this: TelegramWebApp, payload: TmaEventPayload<T>) => void;

// ─── Sub-Object Interfaces ────────────────────────────────────────────────────

/** @since Bot API 6.1 */
export interface TelegramBackButton {
  isVisible: boolean;
  show(): this;
  hide(): this;
  /** Alias for `onEvent("backButtonClicked", callback)`. */
  onClick(callback: () => void): this;
  offClick(callback: () => void): this;
}

export interface TelegramBottomButton {
  readonly type: "main" | "secondary";
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  readonly isProgressVisible: boolean;
  /** @since Bot API 7.10 */
  hasShineEffect: boolean;
  /** Secondary button only. @since Bot API 7.10 */
  position: "left" | "right" | "top" | "bottom";
  /** @since Bot API 9.5 */
  iconCustomEmojiId: string;
  setParams(params: BottomButtonParams): this;
  setText(text: string): this;
  show(): this;
  hide(): this;
  enable(): this;
  disable(): this;
  /**
   * Show a loading spinner on the button.
   * @param leaveActive - Keep the button clickable during loading. Defaults to false.
   */
  showProgress(leaveActive?: boolean): this;
  hideProgress(): this;
  onClick(callback: () => void): this;
  offClick(callback: () => void): this;
}

/** @since Bot API 7.0 */
export interface TelegramSettingsButton {
  isVisible: boolean;
  show(): this;
  hide(): this;
  /** Alias for `onEvent("settingsButtonClicked", callback)`. */
  onClick(callback: () => void): this;
  offClick(callback: () => void): this;
}

/** @since Bot API 6.1 */
export interface TelegramHapticFeedback {
  /**
   * Signal a physical impact. Use light/medium/heavy for UI element size;
   * rigid/soft for material feel.
   */
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): this;
  notificationOccurred(type: "error" | "success" | "warning"): this;
  /** Call only when selection changes, not when confirmed. */
  selectionChanged(): this;
}

/** @since Bot API 6.9 */
export interface TelegramCloudStorage {
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  getItem(key: string, callback: (error: string | null, value?: string) => void): this;
  getItems(
    keys: string[],
    callback: (error: string | null, values?: Record<string, string>) => void,
  ): this;
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  removeItems(keys: string[], callback?: (error: string | null, removed?: boolean) => void): this;
  getKeys(callback: (error: string | null, keys?: string[]) => void): this;
}

/** @since Bot API 9.0 */
export interface TelegramDeviceStorage {
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  getItem(key: string, callback: (error: string | null, value?: string) => void): this;
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  clear(callback?: (error: string | null, cleared?: boolean) => void): this;
}

/** @since Bot API 9.0 */
export interface TelegramSecureStorage {
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, stored?: boolean) => void,
  ): this;
  /**
   * `value` is null when the key is not found.
   * `canRestore` indicates whether the value can be recovered from backup.
   */
  getItem(
    key: string,
    callback: (error: string | null, value?: string | null, canRestore?: boolean) => void,
  ): this;
  restoreItem(key: string, callback: (error: string | null, value?: string) => void): this;
  removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): this;
  clear(callback?: (error: string | null, cleared?: boolean) => void): this;
}

/** @since Bot API 7.2 */
export interface TelegramBiometricManager {
  readonly isInited: boolean;
  readonly isBiometricAvailable: boolean;
  readonly biometricType: "finger" | "face" | "unknown";
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
  readonly isBiometricTokenSaved: boolean;
  readonly deviceId: string;
  /** Must be called before any other method. */
  init(callback?: () => void): this;
  requestAccess(params: BiometricRequestAccessParams, callback?: (granted: boolean) => void): this;
  authenticate(
    params: BiometricAuthenticateParams,
    callback?: (success: boolean, token?: string) => void,
  ): this;
  /** Pass an empty string to clear the saved token. */
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): this;
  /** Must be called in response to a direct user interaction. */
  openSettings(): this;
}

/** @since Bot API 8.0 */
export interface TelegramAccelerometer {
  readonly isStarted: boolean;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  start(params: AccelerometerStartParams, callback?: (started: boolean) => void): this;
  stop(callback?: (stopped: boolean) => void): this;
}

/** @since Bot API 8.0 */
export interface TelegramDeviceOrientation {
  readonly isStarted: boolean;
  /**
   * Whether data is absolute (relative to magnetic north). May differ from
   * the `need_absolute` param — some devices cannot provide absolute data.
   */
  readonly absolute: boolean;
  readonly alpha: number;
  readonly beta: number;
  readonly gamma: number;
  start(params: DeviceOrientationStartParams, callback?: (started: boolean) => void): this;
  stop(callback?: (stopped: boolean) => void): this;
}

/** @since Bot API 8.0 */
export interface TelegramGyroscope {
  readonly isStarted: boolean;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  start(params: GyroscopeStartParams, callback?: (started: boolean) => void): this;
  stop(callback?: (stopped: boolean) => void): this;
}

/** @since Bot API 8.0 */
export interface TelegramLocationManager {
  readonly isInited: boolean;
  readonly isLocationAvailable: boolean;
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
  /** Must be called before any other method. */
  init(callback?: () => void): this;
  /** Callback receives null if access is denied or location unavailable. */
  getLocation(callback: (data: LocationData | null) => void): this;
  /** Must be called in response to a direct user interaction. */
  openSettings(): this;
}

// ─── Main WebApp Interface ────────────────────────────────────────────────────

export interface TelegramWebApp {
  // ── Data ──────────────────────────────────────────────────────────────────

  /** Raw string — send to your server for validation. Never trust client-side. */
  readonly initData: string;
  readonly initDataUnsafe: WebAppInitData;
  readonly version: string;
  readonly platform: string;

  // ── Appearance State ───────────────────────────────────────────────────────

  readonly colorScheme: ColorScheme;
  readonly themeParams: ThemeParams;
  /** @since Bot API 8.0 */
  readonly isActive: boolean;
  readonly isExpanded: boolean;
  /** @since Bot API 8.0 */
  readonly isFullscreen: boolean;
  /** @since Bot API 8.0 */
  readonly isOrientationLocked: boolean;
  readonly isClosingConfirmationEnabled: boolean;
  readonly isVerticalSwipesEnabled: boolean;
  readonly viewportHeight: number;
  readonly viewportStableHeight: number;
  readonly headerColor: string;
  readonly backgroundColor: string;
  /** @since Bot API 7.10 */
  readonly bottomBarColor: string;
  /** Device safe area in px (notch, home bar). @since Bot API 8.0 */
  readonly safeAreaInset: SafeAreaInset;
  /** Area clear of Telegram UI chrome in px. @since Bot API 8.0 */
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

  /** Call as soon as the UI is ready — hides the Telegram loading placeholder. */
  ready(): void;
  expand(): void;
  close(options?: CloseOptions): void;
  isVersionAtLeast(version: string): boolean;

  // ── Appearance Methods ─────────────────────────────────────────────────────

  /** @param color - `#RRGGBB`, `"bg_color"`, or `"secondary_bg_color"`. @since Bot API 6.1 */
  setHeaderColor(color: string): void;
  /** @since Bot API 6.1 */
  setBackgroundColor(color: string): void;
  /** @param color - Hex, `"bg_color"`, `"secondary_bg_color"`, or `"bottom_bar_bg_color"`. @since Bot API 7.10 */
  setBottomBarColor(color: string): void;

  // ── Behavior ──────────────────────────────────────────────────────────────

  /** @since Bot API 6.2 */
  enableClosingConfirmation(): void;
  /** @since Bot API 6.2 */
  disableClosingConfirmation(): void;
  /** @since Bot API 7.7 */
  enableVerticalSwipes(): void;
  /** @since Bot API 7.7 */
  disableVerticalSwipes(): void;

  // ── Fullscreen & Orientation ──────────────────────────────────────────────

  /** @since Bot API 8.0 */
  requestFullscreen(): void;
  /** @since Bot API 8.0 */
  exitFullscreen(): void;
  /** @since Bot API 8.0 */
  lockOrientation(): void;
  /** @since Bot API 8.0 */
  unlockOrientation(): void;

  // ── Home Screen ───────────────────────────────────────────────────────────

  /** @since Bot API 8.0 */
  addToHomeScreen(): void;
  /** Also fires the `homeScreenChecked` event. @since Bot API 8.0 */
  checkHomeScreenStatus(callback?: (status: HomeScreenStatus) => void): void;

  // ── Data Sending ──────────────────────────────────────────────────────────

  /**
   * Keyboard button Mini Apps only — sends data to the bot and closes the app.
   * @param data - Max 4096 bytes.
   */
  sendData(data: string): void;

  // ── Navigation ────────────────────────────────────────────────────────────

  openLink(url: string, options?: OpenLinkOptions): void;
  openTelegramLink(url: string): void;
  /** Also fires the `invoiceClosed` event. */
  openInvoice(url: string, callback?: (status: InvoiceStatus) => void): void;
  /** @param choose_chat_types - Filter which chat types the user can pick. @since Bot API 6.7 */
  switchInlineQuery(query: string, choose_chat_types?: ChatType[]): void;

  // ── Popups & Dialogs ──────────────────────────────────────────────────────

  /** Also fires the `popupClosed` event. @since Bot API 6.2 */
  showPopup(params: PopupParams, callback?: (button_id: string) => void): void;
  /** @since Bot API 6.2 */
  showAlert(message: string, callback?: () => void): void;
  /** @since Bot API 6.2 */
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
  /** @since Bot API 9.1 */
  hideKeyboard(): void;

  // ── QR Scanner ────────────────────────────────────────────────────────────

  /**
   * Also fires `qrTextReceived`. Return `true` from the callback to close the popup.
   * @since Bot API 6.4
   */
  showScanQrPopup(params: ScanQrPopupParams, callback?: (text: string) => boolean | void): void;
  /** @since Bot API 6.4 */
  closeScanQrPopup(): void;

  // ── Clipboard ─────────────────────────────────────────────────────────────

  /**
   * Attachment menu only — must be called in response to a user interaction.
   * Also fires `clipboardTextReceived`. @since Bot API 6.4
   */
  readTextFromClipboard(callback?: (text: string | null) => void): void;

  // ── Permissions ───────────────────────────────────────────────────────────

  /** Also fires `writeAccessRequested`. @since Bot API 6.9 */
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  /** Also fires `contactRequested`. @since Bot API 6.9 */
  requestContact(callback?: (shared: boolean) => void): void;

  // ── Media & Files ─────────────────────────────────────────────────────────

  /** @since Bot API 7.8 */
  shareToStory(media_url: string, params?: StoryShareParams): void;
  /** Also fires `shareMessageSent` or `shareMessageFailed`. @since Bot API 8.0 */
  shareMessage(msg_id: string, callback?: (sent: boolean) => void): void;
  /** Also fires `fileDownloadRequested`. @since Bot API 8.0 */
  downloadFile(params: DownloadFileParams, callback?: (accepted: boolean) => void): void;

  // ── Emoji Status ──────────────────────────────────────────────────────────

  /** Also fires `emojiStatusSet` or `emojiStatusFailed`. @since Bot API 8.0 */
  setEmojiStatus(
    custom_emoji_id: string,
    params?: EmojiStatusParams,
    callback?: (set: boolean) => void,
  ): void;
  /** Also fires `emojiStatusAccessRequested`. @since Bot API 8.0 */
  requestEmojiStatusAccess(callback?: (granted: boolean) => void): void;

  // ── Chat Selector ─────────────────────────────────────────────────────────

  /**
   * `req_id` must be obtained via the `savePreparedKeyboardButton` Bot API method.
   * @since Bot API 9.6
   */
  requestChat(req_id: string, callback?: (sent: boolean) => void): void;

  // ── Events ────────────────────────────────────────────────────────────────

  onEvent<T extends TmaEventType>(eventType: T, eventHandler: TmaEventHandler<T>): void;
  offEvent<T extends TmaEventType>(eventType: T, eventHandler: TmaEventHandler<T>): void;
}

// ─── Namespace & Global Augmentation ─────────────────────────────────────────

export interface TelegramNamespace {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram: TelegramNamespace;
  }
}
