/**
 * Script para eliminar preguntas de perfil existentes
 * Ya no son necesarias porque los datos se capturan desde el formulario de invitaciones
 */

require('dotenv').config();
const { getPool } = require('./src/config/database');

async function eliminarPreguntasPerfil() {
  const pool = await getPool();

  try {
    console.log('='.repeat(80));
    console.log('🗑️  ELIMINANDO PREGUNTAS DE PERFIL');
    console.log('='.repeat(80));
    console.log('');

    // 1. Ver preguntas de perfil existentes
    console.log('📋 Buscando preguntas de perfil...');
    const [preguntas] = await pool.query(
      'SELECT * FROM cb_preguntas WHERE es_dato_perfil = 1'
    );

    if (preguntas.length === 0) {
      console.log('✅ No hay preguntas de perfil para eliminar');
      process.exit(0);
    }

    console.log(`📊 Encontradas ${preguntas.length} preguntas de perfil:`);
    console.log('');

    // Agrupar por chatbot
    const porChatbot = {};
    for (const p of preguntas) {
      if (!porChatbot[p.config_id]) {
        porChatbot[p.config_id] = [];
      }
      porChatbot[p.config_id].push(p);
    }

    // Mostrar por chatbot
    for (const [configId, preguntasDelChatbot] of Object.entries(porChatbot)) {
      // Obtener nombre del chatbot
      const [chatbot] = await pool.query(
        'SELECT nombre FROM cb_config WHERE id = ?',
        [configId]
      );
      
      const nombreChatbot = chatbot[0]?.nombre || `ID: ${configId}`;
      console.log(`📌 Chatbot: ${nombreChatbot}`);
      
      preguntasDelChatbot.forEach(p => {
        console.log(`   - ${p.pregunta} (campo: ${p.campo_perfil})`);
      });
      console.log('');
    }

    // 2. Confirmar eliminación
    console.log('⚠️  ATENCIÓN: Estas preguntas serán eliminadas permanentemente');
    console.log('');
    console.log('¿Deseas continuar? (Presiona Ctrl+C para cancelar)');
    console.log('Esperando 5 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Eliminar preguntas de perfil
    console.log('');
    console.log('🗑️  Eliminando preguntas de perfil...');
    
    const [resultado] = await pool.query(
      'DELETE FROM cb_preguntas WHERE es_dato_perfil = 1'
    );

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ ELIMINACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log(`📊 ${resultado.affectedRows} preguntas eliminadas`);
    console.log('');
    console.log('💡 Nota: Los datos de candidatos ahora se capturan desde el formulario');
    console.log('   de invitaciones (Excel) y se guardan directamente en cb_sesiones');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ ERROR');
    console.error('='.repeat(80));
    console.error(error);
  } finally {
    await pool.end();
  }
}

eliminarPreguntasPerfil();
