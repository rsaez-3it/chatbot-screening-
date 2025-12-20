/**
 * Script para actualizar el resultado de una sesión con los cálculos correctos
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');
const EvaluacionService = require('./src/modules/chatbot/services/evaluacion/evaluacionService');
const sesionesRepository = require('./src/modules/chatbot/repositories/sesionesRepository');

async function actualizarResultado(sesionId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`ACTUALIZANDO RESULTADO DE SESIÓN ${sesionId}`);
    console.log('='.repeat(80));
    console.log('');

    // Obtener sesión
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      console.log('❌ Sesión no encontrada');
      await closePool();
      return;
    }

    // Obtener configuración del chatbot
    const [configs] = await pool.query(
      'SELECT umbral_aprobacion FROM cb_config WHERE id = ?',
      [sesion.config_id]
    );
    const umbral = configs[0]?.umbral_aprobacion || 70;

    // Calcular resultado
    const resultado = await EvaluacionService.determinarResultado(sesionId, umbral);

    console.log('📊 RESULTADO CALCULADO:');
    console.log(`   Puntaje: ${resultado.puntaje_total}/${resultado.puntaje_maximo}`);
    console.log(`   Porcentaje: ${resultado.porcentaje}%`);
    console.log(`   Resultado: ${resultado.resultado.toUpperCase()}`);
    console.log(`   Razón: ${resultado.razon}`);
    console.log('');

    // Actualizar en BD
    await sesionesRepository.actualizar(sesionId, {
      puntaje_total: resultado.puntaje_total,
      porcentaje: resultado.porcentaje,
      resultado: resultado.resultado
    });

    console.log('✅ Sesión actualizada correctamente');
    console.log('');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

const sesionId = process.argv[2];

if (!sesionId) {
  console.log('');
  console.log('USO: node actualizar-resultado-sesion.js <sesion_id>');
  console.log('');
  process.exit(1);
}

actualizarResultado(parseInt(sesionId));
