import { z } from "zod";

const insetShape = {
  top: z.number().int().nonnegative(),
  bottom: z.number().int().nonnegative(),
  left: z.number().int().nonnegative(),
  right: z.number().int().nonnegative(),
};

export const SafeAreaInsetSchema = z.object(insetShape);
export type SafeAreaInset = z.infer<typeof SafeAreaInsetSchema>;

export const ContentSafeAreaInsetSchema = z.object(insetShape);
export type ContentSafeAreaInset = z.infer<typeof ContentSafeAreaInsetSchema>;
