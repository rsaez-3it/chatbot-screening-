/**
 * Script de prueba completa del flujo de evaluación
 * Simula respuestas y verifica que las evaluaciones funcionen correctamente
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');
const evaluacionService = require('./src/modules/chatbot/services/evaluacion/evaluacionService');
const preguntasRepository = require('./src/modules/chatbot/repositories/preguntasRepository');

async function testEvaluacion() {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log('TEST DE EVALUACIÓN COMPLETA');
    console.log('='.repeat(80));
    console.log('');

    const configId = 13;
    const sesionId = 17; // Usar sesión existente para prueba

    // Obtener todas las preguntas
    const preguntas = await preguntasRepository.obtenerPorConfig(configId);
    console.log(`📋 Preguntas encontradas: ${preguntas.length}`);
    console.log('');

    // Respuestas de prueba
    const respuestas = {
      25: 'Juan Pérez',           // Nombre
      26: 'juan@example.com',     // Email
      27: '+56912345678',         // Teléfono
      20: '3',                    // Años experiencia (debe aprobar: 2-4)
      21: 'si',                   // React Hooks (debe aprobar)
      22: 'useState, useEffect, useContext, useRef', // Hooks (debe aprobar)
      23: 'si',                   // TypeScript (debe aprobar)
      24: 'no'                    // Next.js (debe reprobar pero no es eliminatoria)
    };

    console.log('🧪 SIMULANDO EVALUACIONES:');
    console.log('');

    for (const pregunta of preguntas) {
      const respuesta = respuestas[pregunta.id];
      
      console.log(`Pregunta ${pregunta.id}: ${pregunta.pregunta}`);
      console.log(`Tipo: ${pregunta.tipo_campo}`);
      console.log(`Respuesta: "${respuesta}"`);
      
      // Evaluar
      const resultado = await evaluacionService.evaluar(
        pregunta,
        respuesta,
        sesionId,
        null // mensaje_id
      );

      if (resultado.success) {
        const eval = resultado.evaluacion;
        console.log(`✅ Evaluación exitosa:`);
        console.log(`   Cumple: ${eval.cumple ? '✓ SÍ' : '✗ NO'}`);
        console.log(`   Puntaje: ${eval.puntaje}/100`);
        console.log(`   Razón: ${eval.razon}`);
      } else {
        console.log(`❌ Error: ${resultado.error}`);
      }
      
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('CALCULANDO RESULTADO FINAL');
    console.log('='.repeat(80));
    console.log('');

    // Calcular puntaje
    const puntaje = await evaluacionService.calcularPuntajeSesion(sesionId);
    console.log(`📊 Puntaje Total: ${puntaje.puntaje_total}/${puntaje.puntaje_maximo}`);
    console.log(`📈 Porcentaje: ${puntaje.porcentaje}%`);
    console.log(`✅ Aprobadas: ${puntaje.preguntas_aprobadas}`);
    console.log(`❌ Reprobadas: ${puntaje.preguntas_reprobadas}`);
    console.log('');

    // Determinar resultado
    const resultado = await evaluacionService.determinarResultado(sesionId, 75);
    console.log(`🎯 RESULTADO: ${resultado.resultado.toUpperCase()}`);
    console.log(`📝 Razón: ${resultado.razon}`);
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETADO');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

testEvaluacion();
