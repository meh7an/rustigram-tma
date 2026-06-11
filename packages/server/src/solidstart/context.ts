import type { WebAppInitData, WebAppUser } from "@rustigram/tma-core";

const INIT_DATA_KEY = "tmaInitData";
const USER_KEY = "tmaUser";

interface EventWithLocals {
  locals: Record<string, unknown>;
}

export function setTmaLocals(event: EventWithLocals, data: WebAppInitData): void {
  event.locals[INIT_DATA_KEY] = data;
  if (data.user) event.locals[USER_KEY] = data.user;
}

export function getTmaInitData(event: EventWithLocals): WebAppInitData {
  const data = event.locals[INIT_DATA_KEY];
  if (!data) {
    throw new Error(
      "tmaInitData not found in event.locals. " +
        "Ensure createTmaMiddleware() is registered for this route.",
    );
  }
  return data as WebAppInitData;
}

export function getTmaUser(event: EventWithLocals): WebAppUser {
  const user = event.locals[USER_KEY];
  if (!user) {
    throw new Error(
      "tmaUser not found in event.locals. " +
        "Ensure createTmaMiddleware() is active and initData includes a user field.",
    );
  }
  return user as WebAppUser;
}
