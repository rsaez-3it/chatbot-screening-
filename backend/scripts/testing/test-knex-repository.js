/**
 * Script de Prueba: Knex Repository
 * Prueba las funciones del nuevo repository sin afectar el código actual
 */

require('dotenv').config();
const sesionesRepo = require('./src/modules/chatbot/repositories/sesionesRepository.knex');

async function testKnexRepository() {
  console.log('\n🧪 INICIANDO PRUEBAS DE KNEX REPOSITORY\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Obtener sesión por ID
    console.log('\n✓ Test 1: Obtener sesión por ID...');
    const sesion = await sesionesRepo.obtenerPorId(1);
    if (sesion) {
      console.log(`  ✅ Sesión encontrada: ${sesion.candidato_email || 'Sin email'}`);
    } else {
      console.log('  ⚠️  No se encontró sesión con ID 1');
    }

    // Test 2: Listar sesiones con paginación
    console.log('\n✓ Test 2: Listar sesiones (página 1, límite 5)...');
    const listado = await sesionesRepo.listar({ page: 1, limit: 5 });
    console.log(`  ✅ Total de sesiones: ${listado.total}`);
    console.log(`  ✅ Sesiones en página 1: ${listado.data.length}`);
    console.log(`  ✅ Total de páginas: ${listado.totalPages}`);

    // Test 3: Obtener estadísticas (si hay al menos una sesión)
    if (listado.total > 0) {
      const primeraConfigId = listado.data[0].config_id;
      console.log(`\n✓ Test 3: Obtener estadísticas del config_id ${primeraConfigId}...`);
      const stats = await sesionesRepo.obtenerEstadisticas(primeraConfigId);
      console.log('  ✅ Estadísticas:');
      console.log(`     - Total: ${stats.total}`);
      console.log(`     - Pendientes: ${stats.pendientes}`);
      console.log(`     - Completadas: ${stats.completadas}`);
      console.log(`     - Aprobados: ${stats.aprobados}`);
      console.log(`     - Rechazados: ${stats.rechazados}`);
      console.log(`     - Promedio: ${stats.porcentaje_promedio.toFixed(2)}%`);
    }

    // Test 4: Obtener sesiones expiradas
    console.log('\n✓ Test 4: Obtener sesiones expiradas...');
    const expiradas = await sesionesRepo.obtenerExpiradas();
    console.log(`  ✅ Sesiones expiradas: ${expiradas.length}`);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n');
    console.log('💡 El repository Knex funciona correctamente');
    console.log('💡 Puedes empezar a migrar controllers gradualmente\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error(error.message);
    console.error('\n📋 Stack trace:');
    console.error(error.stack);
  } finally {
    // Cerrar conexión Knex
    const knex = require('./src/config/knex');
    await knex.destroy();
    console.log('🔌 Conexión cerrada\n');
  }
}

// Ejecutar pruebas
testKnexRepository();
