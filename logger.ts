import { DEBUG_ENABLED } from "./config.js";

function logMessage(...args: any) {
  const date = new Date().toISOString();
  console.log(`[${date}] -`, ...args);
}

export default {
  info: logMessage,
  debug: (...args: any) => {
    if (DEBUG_ENABLED) {
      logMessage(...args);
    }
  },
};
