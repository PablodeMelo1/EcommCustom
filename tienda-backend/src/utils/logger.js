/**
 * src/utils/logger.js
 * Utilidad de registro de eventos.
 */

/**
 * Registra un mensaje de éxito.
 * @param {string} message - El mensaje a registrar.
 */
export const logSuccess = (message) => {
    console.log(`✅ ${message}`);
};

/**
 * Registra un mensaje de error.
 * @param {string} message - El mensaje de error.
 * @param {Error} [error] - Opcional, el objeto de error.
 */
export const logError = (message, error) => {
    console.error(`❌ ${message}`, error ? error : '');
};