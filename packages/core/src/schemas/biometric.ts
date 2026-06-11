import { z } from "zod";

export const BiometricTypeSchema = z.enum(["finger", "face", "unknown"]);
export type BiometricType = z.infer<typeof BiometricTypeSchema>;

export const BiometricRequestAccessParamsSchema = z.object({
  reason: z.string().max(128).optional(),
});
export type BiometricRequestAccessParams = z.infer<typeof BiometricRequestAccessParamsSchema>;

export const BiometricAuthenticateParamsSchema = z.object({
  reason: z.string().max(128).optional(),
});
export type BiometricAuthenticateParams = z.infer<typeof BiometricAuthenticateParamsSchema>;
