const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = levels[process.env.LOG_LEVEL] ?? levels.info;

export const logger = {
  error: (...a) => current >= levels.error && console.error('[ERROR]', ...a),
  warn: (...a) => current >= levels.warn && console.warn('[WARN]', ...a),
  info: (...a) => current >= levels.info && console.log('[INFO]', ...a),
  debug: (...a) => current >= levels.debug && console.log('[DEBUG]', ...a),
};
