// Cargar variables de entorno
require('dotenv').config();

// Importar dependencias
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar configuraciones
const HTTP_CONSTANTS = require('./shared/constants/http');
const logger = require('./config/logger');

// Importar rutas
const configRoutes = require('./modules/chatbot/routes/configRoutes');
const sesionRoutes = require('./modules/chatbot/routes/sesionRoutes');
const mensajeRoutes = require('./modules/chatbot/routes/mensajeRoutes');
const evaluacionRoutes = require('./modules/chatbot/routes/evaluacionRoutes');

// Importar middlewares
const { notFound, errorHandler } = require('./shared/middleware/errorHandler');

// Crear instancia de Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 4000;

// ============================================================================
// SEGURIDAD: Helmet (Headers HTTP seguros)
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ============================================================================
// SEGURIDAD: Rate Limiting (Prevenir ataques de fuerza bruta/DDoS)
// ============================================================================
const limiter = rateLimit({
  windowMs: HTTP_CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: HTTP_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido', {
      service: 'rateLimiter',
      ip: req.ip,
      ruta: req.originalUrl
    });
    res.status(429).json({
      success: false,
      error: {
        type: 'Rate Limit',
        message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
        statusCode: 429
      }
    });
  }
});

app.use(limiter);

// ============================================================================
// SEGURIDAD: CORS Configurado (Solo orígenes permitidos)
// ============================================================================
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, apps móviles)
    if (!origin) return callback(null, true);

    if (HTTP_CONSTANTS.CORS_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS bloqueado', {
        service: 'cors',
        origin,
        origenesPermitidos: HTTP_CONSTANTS.CORS_ORIGINS
      });
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: HTTP_CONSTANTS.CORS_CREDENTIALS,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ============================================================================
// Middlewares básicos
// ============================================================================
app.use(express.json({ limit: HTTP_CONSTANTS.REQUEST_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: HTTP_CONSTANTS.REQUEST_SIZE_LIMIT }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido al Backend del Sistema de Chatbot de Screening',
    version: '1.0.0',
    estado: 'Activo',
    endpoints: {
      config: '/api/config',
      sesiones: '/api/sesiones',
      mensajes: '/api/mensajes',
      evaluaciones: '/api/evaluaciones',
      health: '/health'
    }
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    estado: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================
app.use('/api/config', configRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);

// ============================================================================
// MIDDLEWARES DE MANEJO DE ERRORES (deben ir al final)
// ============================================================================
app.use(notFound); // Captura rutas no encontradas (404)
app.use(errorHandler); // Manejo global de errores

// Iniciar servidor
app.listen(PORT, () => {
  logger.info('Servidor iniciado correctamente', {
    service: 'server',
    puerto: PORT,
    entorno: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`,
    seguridad: {
      helmet: 'activado',
      rateLimit: `${HTTP_CONSTANTS.RATE_LIMIT_MAX_REQUESTS} req/${HTTP_CONSTANTS.RATE_LIMIT_WINDOW_MS}ms`,
      cors: HTTP_CONSTANTS.CORS_ORIGINS.join(', ')
    }
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado en proceso', {
    service: 'server',
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada', {
    service: 'server',
    reason: reason
  });
  process.exit(1);
});

// Exportar app para testing
module.exports = app;
