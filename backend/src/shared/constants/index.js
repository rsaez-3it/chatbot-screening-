/**
 * Constantes globales de la aplicación
 * Centraliza todos los magic numbers y valores hardcodeados
 */

// Re-exportar todas las constantes de módulos
module.exports = {
  ...require('./sesiones'),
  ...require('./evaluaciones'),
  ...require('./validaciones'),
  ...require('./http')
};
