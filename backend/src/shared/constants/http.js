/**
 * Constantes HTTP y configuración de servidor
 */

module.exports = {
  // Puerto y host
  PORT: parseInt(process.env.PORT || '4000', 10),
  HOST: process.env.HOST || 'localhost',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 min
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  RATE_LIMIT_AUTH_MAX_ATTEMPTS: 5, // Intentos de autenticación

  // Tamaños de request
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || '10mb',

  // URLs del sistema
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],

  CORS_ENABLED: process.env.CORS_ENABLED !== 'false',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS !== 'false',

  // Email SMTP
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'ChatBot 3IT',

  // URLs de assets (logos, imágenes)
  COMPANY_LOGO_URL: process.env.COMPANY_LOGO_URL || 'https://static.wixstatic.com/media/3ec04d_1f1f0d021fce4472a254b66aca24f876~mv2.png',

  // Timeouts
  DB_CONNECT_TIMEOUT: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),
  HTTP_TIMEOUT: parseInt(process.env.HTTP_TIMEOUT || '30000', 10)
};
