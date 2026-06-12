import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);

// Force solid-js/web to resolve to the client build, not the SSR build.
require.resolve("solid-js/web");
const Module = require("module") as { _resolveFilename: (id: string, parent: unknown) => string; _cache: Record<string, unknown> };

const solidWebPath = resolve("./node_modules/solid-js/web/dist/web.js");
const solidWebServerPath = resolve("./node_modules/solid-js/web/dist/server.js");

// Swap server.js for web.js in Node's module cache.
Module._cache[solidWebServerPath] = Module._cache[solidWebPath];