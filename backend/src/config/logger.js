/**
 * Configuración centralizada de Winston Logger
 * Reemplaza console.log con logging profesional y seguro
 */

const winston = require('winston');
const path = require('path');

// Nivel de log desde variables de entorno
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Carpeta de logs
const LOG_DIR = path.join(__dirname, '../../logs');

/**
 * Formato para sanitizar datos sensibles
 * Remueve/enmascara: emails, teléfonos, tokens, contraseñas
 */
const sanitizeFormat = winston.format((info) => {
  // Lista de campos sensibles a enmascarar
  const sensitiveFields = [
    'password',
    'token',
    'email',
    'telefono',
    'phone',
    'email_candidato',
    'candidato_email',
    'authorization',
    'cookie',
    'session'
  ];

  // Función recursiva para enmascarar datos
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();

      // Si es un campo sensible, enmascarar
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof sanitized[key] === 'string') {
          // Email: mostrar solo primeros 2 caracteres
          if (lowerKey.includes('email') && sanitized[key].includes('@')) {
            const [local, domain] = sanitized[key].split('@');
            sanitized[key] = `${local.substring(0, 2)}***@${domain}`;
          }
          // Token: mostrar solo últimos 4 caracteres
          else if (lowerKey.includes('token')) {
            sanitized[key] = `***${sanitized[key].slice(-4)}`;
          }
          // Otros: enmascarar completamente
          else {
            sanitized[key] = '***REDACTED***';
          }
        }
      }
      // Recursión para objetos anidados
      else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key]);
      }
    }

    return sanitized;
  };

  // Sanitizar el objeto de info
  info = sanitize(info);

  return info;
});

/**
 * Formato para desarrollo (consola bonita con colores)
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  sanitizeFormat(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let log = `${timestamp} [${level}]`;

    if (service) {
      log += ` [${service}]`;
    }

    log += `: ${message}`;

    // Añadir metadata si existe
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

/**
 * Formato para producción (JSON estructurado)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  sanitizeFormat(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Transports (destinos de logs)
 */
const transports = [
  // Consola (siempre activa)
  new winston.transports.Console({
    format: NODE_ENV === 'production' ? productionFormat : developmentFormat
  }),

  // Archivo para TODOS los logs (solo en producción)
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'combined.log'),
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // Archivo solo para ERRORES
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'error.log'),
    level: 'error',
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

/**
 * Crear logger
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'chatbot-backend',
    environment: NODE_ENV
  },
  transports,

  // No salir del proceso en caso de error
  exitOnError: false
});

/**
 * Función helper para logging de solicitudes HTTP
 */
logger.logRequest = (req, message = 'HTTP Request') => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });
};

/**
 * Función helper para logging de errores con contexto
 */
logger.logError = (error, context = {}) => {
  logger.error(error.message || 'Error desconocido', {
    error: error.name || 'Error',
    stack: error.stack,
    code: error.code,
    ...context
  });
};

/**
 * Stream para Morgan (HTTP logging middleware)
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
