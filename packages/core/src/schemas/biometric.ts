import { z } from "zod";

/**
 * The type of biometric authentication available on the device.
 *
 * @see https://core.telegram.org/bots/webapps#biometricmanager
 */
export const BiometricTypeSchema = z.enum(["finger", "face", "unknown"]);
export type BiometricType = z.infer<typeof BiometricTypeSchema>;

/**
 * Describes the native popup shown when requesting permission to use
 * biometrics via `BiometricManager.requestAccess()`.
 *
 * @since Bot API 7.2
 * @see https://core.telegram.org/bots/webapps#biometricrequestaccessparams
 */
export const BiometricRequestAccessParamsSchema = z.object({
  /**
   * The text to be displayed to the user in the popup describing why
   * biometric access is being requested. 0–128 characters.
   */
  reason: z.string().max(128).optional(),
});
export type BiometricRequestAccessParams = z.infer<typeof BiometricRequestAccessParamsSchema>;

/**
 * Describes the native popup shown when authenticating the user via
 * `BiometricManager.authenticate()`.
 *
 * @since Bot API 7.2
 * @see https://core.telegram.org/bots/webapps#biometricauthenticateparams
 */
export const BiometricAuthenticateParamsSchema = z.object({
  /**
   * The text to be displayed to the user in the popup describing why
   * authentication is being requested and what action will be taken based
   * on that authentication. 0–128 characters.
   */
  reason: z.string().max(128).optional(),
});
export type BiometricAuthenticateParams = z.infer<typeof BiometricAuthenticateParamsSchema>;