/**
 * Constantes relacionadas con sesiones
 */

module.exports = {
  // Duración de sesiones
  SESSION_EXPIRATION_DAYS: parseInt(process.env.SESSION_EXPIRATION_DAYS || '7', 10),
  SESSION_TOKEN_LENGTH: parseInt(process.env.SESSION_TOKEN_LENGTH || '32', 10),

  // Estados de sesión
  ESTADOS_SESION: {
    PENDIENTE: 'pendiente',
    EN_PROGRESO: 'en_progreso',
    COMPLETADA: 'completada',
    CANCELADA: 'cancelada',
    EXPIRADA: 'expirada'
  },

  // Mensajes
  MENSAJES_SESION: {
    EXPIRADA: 'Esta sesión ha expirado. Por favor, contacta con el reclutador.',
    COMPLETADA: 'Esta sesión ya ha sido completada.',
    CANCELADA: 'Esta sesión ha sido cancelada.',
    NO_ENCONTRADA: 'Sesión no encontrada.'
  }
};
