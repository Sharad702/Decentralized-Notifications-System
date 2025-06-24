let isDebugMode = false;

/**
 * Sets the debug mode status for the application.
 * When enabled, debugLog messages will be printed to the console.
 * @param {boolean} isEnabled - Whether to enable or disable debug mode.
 */
export const setDebugMode = (isEnabled: boolean) => {
  isDebugMode = isEnabled;
  if (isEnabled) {
    console.log('Debug mode has been enabled. Detailed logs will now be shown.');
  }
};

/**
 * Logs messages to the console only if debug mode is enabled.
 * Prefixes messages with [DEBUG] to distinguish them.
 * @param {...any[]} args - The messages or objects to log.
 */
export const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[DEBUG]', ...args);
  }
}; 