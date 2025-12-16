// Cargar variables de entorno
require('dotenv').config();

// Importar dependencias
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================================

// 1. Helmet - Protección de headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  crossOriginEmbedderPolicy: false // Permitir embeddings si es necesario
}));

// 2. Rate Limiting - Prevención de brute force y DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP. Por favor intente más tarde.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Rate limiting más estricto para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Por favor intente más tarde.'
  }
});

// 3. CORS Restrictivo
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173']; // Default para desarrollo

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS no permite el acceso desde este origen.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Request Size Limits - Prevención de ataques de carga masiva
app.use(express.json({ limit: '10mb' })); // Límite de 10MB para JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Límite de 10MB para URL-encoded

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
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Servidor iniciado correctamente                        ║
║   Puerto: ${PORT}                                           ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                              ║
║   URL: http://localhost:${PORT}                             ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Exportar app para testing
module.exports = app;
