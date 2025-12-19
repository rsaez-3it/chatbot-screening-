/**
 * Constantes relacionadas con evaluaciones
 */

module.exports = {
  // Umbrales y scoring
  EVAL_DEFAULT_THRESHOLD: parseInt(process.env.EVAL_DEFAULT_THRESHOLD || '70', 10),
  EVAL_MIN_SCORE: 0,
  EVAL_MAX_SCORE: 100,
  EVAL_SCORE_PRECISION: 2, // Decimales

  // Resultados de evaluación
  RESULTADOS_EVALUACION: {
    SIN_EVALUAR: 'sin_evaluar',
    APROBADO: 'aprobado',
    RECHAZADO: 'rechazado',
    PENDIENTE_REVISION: 'pendiente_revision'
  },

  // Tipos de evaluación
  TIPOS_EVALUACION: {
    MANUAL: 'manual',
    IA: 'ia',
    REGLA_FIJA: 'regla_fija'
  },

  // Proveedor de IA
  IA_PROVIDER: process.env.IA_PROVIDER || 'openai',
  IA_ENABLED: process.env.IA_ENABLED === 'true',

  // Configuración OpenAI
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),

  // Mock IA (para desarrollo sin API key)
  IA_MOCK_MIN_LENGTH: 50,
  IA_MOCK_MAX_LENGTH: 1000,
  IA_MOCK_DELAY_MS: 500
};
