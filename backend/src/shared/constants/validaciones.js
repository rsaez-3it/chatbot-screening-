/**
 * Constantes para validaciones de campos
 */

module.exports = {
  // Límites de caracteres
  MAX_RESPUESTA_LENGTH: 5000,
  MAX_JUSTIFICACION_LENGTH: 2000,
  MAX_NOTAS_LENGTH: 1000,
  MAX_URL_LENGTH: 500,
  MAX_NOMBRE_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_TELEFONO_LENGTH: 20,

  // Formatos
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,

  // Configuración de paginación
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};
