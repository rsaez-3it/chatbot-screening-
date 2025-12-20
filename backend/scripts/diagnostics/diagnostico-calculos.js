/**
 * Script de Diagnóstico - Verificar Cálculos de Evaluación
 * 
 * Este script verifica los cálculos de puntaje y porcentaje
 * para una sesión específica y muestra el detalle paso a paso.
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');
const ScoringService = require('./src/modules/chatbot/services/evaluacion/scoringService');

async function diagnosticarSesion(sesionId) {
  let pool;
  try {
    console.log('='.repeat(80));
    console.log('DIAGNÓSTICO DE CÁLCULOS - SESIÓN', sesionId);
    console.log('='.repeat(80));
    console.log('');

    pool = await getPool();

    // 1. Obtener datos de la sesión
    const [sesiones] = await pool.query(
      'SELECT * FROM cb_sesiones WHERE id = ?',
      [sesionId]
    );

    if (sesiones.length === 0) {
      console.log('❌ Sesión no encontrada');
      return;
    }

    const sesion = sesiones[0];
    console.log('📋 DATOS DE LA SESIÓN:');
    console.log(`   Token: ${sesion.token}`);
    console.log(`   Estado: ${sesion.estado}`);
    console.log(`   Resultado: ${sesion.resultado}`);
    console.log(`   Puntaje Total (BD): ${sesion.puntaje_total}`);
    console.log(`   Porcentaje (BD): ${sesion.porcentaje}%`);
    console.log('');

    // 2. Obtener evaluaciones con detalles
    const [evaluaciones] = await pool.query(`
      SELECT
        e.*,
        p.pregunta,
        p.peso,
        p.es_eliminatoria
      FROM cb_evaluaciones e
      INNER JOIN cb_preguntas p ON e.pregunta_id = p.id
      WHERE e.sesion_id = ?
      ORDER BY e.created_at ASC
    `, [sesionId]);

    console.log('📊 EVALUACIONES ENCONTRADAS:', evaluaciones.length);
    console.log('');

    // 3. Mostrar detalle de cada evaluación
    console.log('📝 DETALLE DE EVALUACIONES:');
    console.log('-'.repeat(80));
    
    evaluaciones.forEach((eval, index) => {
      console.log(`\nPregunta ${index + 1}:`);
      console.log(`   ID: ${eval.pregunta_id}`);
      console.log(`   Texto: ${eval.pregunta}`);
      console.log(`   Cumple: ${eval.cumple === 1 ? '✓ SÍ' : '✗ NO'}`);
      console.log(`   Puntaje: ${eval.puntaje}/100`);
      console.log(`   Peso: ${eval.peso}`);
      console.log(`   Es Eliminatoria: ${eval.es_eliminatoria ? 'SÍ' : 'NO'}`);
      console.log(`   Puntaje Ponderado: ${eval.puntaje} * ${eval.peso} = ${eval.puntaje * eval.peso}`);
      console.log(`   Puntaje Máximo: 100 * ${eval.peso} = ${100 * eval.peso}`);
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('CÁLCULOS USANDO SCORINGSERVICE:');
    console.log('='.repeat(80));
    console.log('');

    // 4. Calcular usando ScoringService
    const { puntaje_total, puntaje_maximo } = ScoringService.calcularPuntaje(evaluaciones);
    const porcentaje = ScoringService.calcularPorcentaje(puntaje_total, puntaje_maximo);

    console.log('📈 CÁLCULO DE PUNTAJE:');
    console.log(`   Puntaje Total: ${puntaje_total}`);
    console.log(`   Puntaje Máximo: ${puntaje_maximo}`);
    console.log(`   Porcentaje: ${porcentaje}%`);
    console.log('');

    // 5. Verificar eliminatorias
    const tieneEliminatoriasReprobadas = ScoringService.tieneEliminatoriasReprobadas(evaluaciones);
    console.log('🚫 ELIMINATORIAS:');
    console.log(`   Tiene eliminatorias reprobadas: ${tieneEliminatoriasReprobadas ? 'SÍ' : 'NO'}`);
    console.log('');

    // 6. Obtener configuración del chatbot
    const [configs] = await pool.query(
      'SELECT umbral_aprobacion FROM cb_config WHERE id = ?',
      [sesion.config_id]
    );

    const umbral = configs[0]?.umbral_aprobacion || 70;
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   Umbral de aprobación: ${umbral}%`);
    console.log('');

    // 7. Calcular resultado completo
    const resultadoCompleto = ScoringService.calcularResultadoCompleto(evaluaciones, umbral);

    console.log('🎯 RESULTADO COMPLETO:');
    console.log(`   Resultado: ${resultadoCompleto.resultado.toUpperCase()}`);
    console.log(`   Razón: ${resultadoCompleto.razon}`);
    console.log(`   Puntaje Total: ${resultadoCompleto.puntaje_total}`);
    console.log(`   Puntaje Máximo: ${resultadoCompleto.puntaje_maximo}`);
    console.log(`   Porcentaje: ${resultadoCompleto.porcentaje}%`);
    console.log('');

    console.log('📊 ESTADÍSTICAS:');
    console.log(`   Total Preguntas: ${resultadoCompleto.estadisticas.total_preguntas}`);
    console.log(`   Preguntas Aprobadas: ${resultadoCompleto.estadisticas.preguntas_aprobadas}`);
    console.log(`   Preguntas Reprobadas: ${resultadoCompleto.estadisticas.preguntas_reprobadas}`);
    console.log(`   % Preguntas Aprobadas: ${resultadoCompleto.estadisticas.porcentaje_preguntas_aprobadas}%`);
    console.log('');

    // 8. Comparar con valores en BD
    console.log('='.repeat(80));
    console.log('COMPARACIÓN BD vs CÁLCULO:');
    console.log('='.repeat(80));
    console.log('');

    const puntajeDiferente = Math.abs(parseFloat(sesion.puntaje_total) - puntaje_total) > 0.01;
    const porcentajeDiferente = Math.abs(parseFloat(sesion.porcentaje) - porcentaje) > 0.01;
    const resultadoDiferente = sesion.resultado !== resultadoCompleto.resultado;

    console.log('Puntaje Total:');
    console.log(`   BD: ${sesion.puntaje_total}`);
    console.log(`   Calculado: ${puntaje_total}`);
    console.log(`   ${puntajeDiferente ? '❌ DIFERENTE' : '✅ CORRECTO'}`);
    console.log('');

    console.log('Porcentaje:');
    console.log(`   BD: ${sesion.porcentaje}%`);
    console.log(`   Calculado: ${porcentaje}%`);
    console.log(`   ${porcentajeDiferente ? '❌ DIFERENTE' : '✅ CORRECTO'}`);
    console.log('');

    console.log('Resultado:');
    console.log(`   BD: ${sesion.resultado}`);
    console.log(`   Calculado: ${resultadoCompleto.resultado}`);
    console.log(`   ${resultadoDiferente ? '❌ DIFERENTE' : '✅ CORRECTO'}`);
    console.log('');

    if (puntajeDiferente || porcentajeDiferente || resultadoDiferente) {
      console.log('⚠️  HAY DIFERENCIAS EN LOS CÁLCULOS');
      console.log('');
      console.log('POSIBLES CAUSAS:');
      console.log('1. Los datos en la BD no se actualizaron correctamente');
      console.log('2. El cálculo se hizo con datos diferentes');
      console.log('3. Hay un bug en el código de finalización');
    } else {
      console.log('✅ TODOS LOS CÁLCULOS SON CORRECTOS');
    }

    console.log('');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await closePool();
  }
}

// Ejecutar diagnóstico
const sesionId = process.argv[2];

if (!sesionId) {
  console.log('');
  console.log('USO: node diagnostico-calculos.js <sesion_id>');
  console.log('');
  console.log('Ejemplo: node diagnostico-calculos.js 16');
  console.log('');
  process.exit(1);
}

diagnosticarSesion(parseInt(sesionId));
