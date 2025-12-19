/**
 * Middleware: Manejo Global de Errores
 * Captura y formatea todos los errores de la aplicación
 */

const logger = require('../../config/logger');

/**
 * Middleware para manejar errores 404 (ruta no encontrada)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 * Debe ser el último middleware en la cadena
 */
const errorHandler = (err, req, res, next) => {
  // Determinar el código de estado
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Determinar el tipo de error
  let errorType = 'Error del Servidor';
  let message = err.message || 'Ha ocurrido un error inesperado';

  // Errores de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        errorType = 'Error de Duplicación';
        message = 'El registro ya existe en la base de datos';
        res.status(400);
        break;

      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        errorType = 'Error de Referencia';
        message = 'El registro referenciado no existe';
        res.status(400);
        break;

      case 'ER_ROW_IS_REFERENCED':
      case 'ER_ROW_IS_REFERENCED_2':
        errorType = 'Error de Integridad';
        message = 'No se puede eliminar el registro porque está siendo referenciado';
        res.status(400);
        break;

      case 'ER_BAD_FIELD_ERROR':
        errorType = 'Error de Campo';
        message = 'Campo no válido en la consulta';
        res.status(400);
        break;

      case 'ER_PARSE_ERROR':
        errorType = 'Error de Sintaxis SQL';
        message = 'Error en la sintaxis de la consulta';
        res.status(500);
        break;

      case 'ECONNREFUSED':
        errorType = 'Error de Conexión';
        message = 'No se pudo conectar a la base de datos';
        res.status(503);
        break;

      case 'ER_ACCESS_DENIED_ERROR':
        errorType = 'Error de Autenticación';
        message = 'Acceso denegado a la base de datos';
        res.status(500);
        break;

      default:
        errorType = 'Error de Base de Datos';
        message = err.message;
        break;
    }
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    errorType = 'Error de Validación';
    res.status(400);
  }

  // Errores de autenticación/autorización
  if (err.name === 'UnauthorizedError') {
    errorType = 'Error de Autenticación';
    message = 'Token no válido o expirado';
    res.status(401);
  }

  // Estructura de respuesta de error
  const errorResponse = {
    success: false,
    error: {
      type: errorType,
      message: message,
      statusCode: res.statusCode || statusCode
    }
  };

  // En desarrollo, incluir el stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = {
      originalError: err.message,
      code: err.code || null,
      sql: err.sql || null
    };
  }

  // Log del error con Winston
  logger.error('Error capturado en aplicación', {
    service: 'errorHandler',
    tipo: errorType,
    mensaje: message,
    codigo: res.statusCode || statusCode,
    metodo: req.method,
    ruta: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Enviar respuesta de error
  res.status(res.statusCode || statusCode).json(errorResponse);
};

module.exports = {
  notFound,
  errorHandler
};
