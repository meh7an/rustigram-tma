import { createMiddleware } from "@solidjs/start/middleware";
import { createTmaMiddleware } from "@rustigram/tma-server/solidstart";

// Validation is skipped silently when BOT_TOKEN is not set — useful for
// local dev. Set BOT_TOKEN in .env for production.
const handlers = process.env["BOT_TOKEN"]
  ? [createTmaMiddleware(process.env["BOT_TOKEN"])]
  : [];

export default createMiddleware({ onRequest: handlers });
