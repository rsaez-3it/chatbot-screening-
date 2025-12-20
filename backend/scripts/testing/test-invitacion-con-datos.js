/**
 * Script de prueba: Invitaciones con datos completos
 * Prueba el envío de invitaciones con nombre, email y teléfono
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function testInvitacionConDatos() {
  try {
    console.log('='.repeat(80));
    console.log('🧪 TEST: INVITACIONES CON DATOS COMPLETOS');
    console.log('='.repeat(80));
    console.log('');

    // 1. Obtener chatbots
    console.log('📋 Obteniendo chatbots...');
    const { data: chatbotsResponse } = await axios.get(`${API_URL}/config`);
    const chatbots = chatbotsResponse.data;

    if (chatbots.length === 0) {
      console.log('❌ No hay chatbots disponibles');
      return;
    }

    const chatbot = chatbots[0];
    console.log(`✅ Usando chatbot: ${chatbot.nombre} (ID: ${chatbot.id})`);
    console.log('');

    // 2. Preparar candidatos con diferentes formatos
    const candidatos = [
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@test.com',
        telefono: '+56912345678'
      },
      {
        nombre: 'María González',
        email: 'maria.gonzalez@test.com',
        telefono: '+56987654321'
      },
      {
        nombre: 'Pedro Silva',
        email: 'pedro.silva@test.com'
        // Sin teléfono
      },
      {
        email: 'ana.martinez@test.com'
        // Sin nombre ni teléfono
      }
    ];

    console.log('👥 Candidatos a invitar:');
    candidatos.forEach((c, i) => {
      const info = [
        c.nombre || '(Sin nombre)',
        c.email,
        c.telefono || '(Sin teléfono)'
      ].join(' - ');
      console.log(`  ${i + 1}. ${info}`);
    });
    console.log('');

    // 3. Enviar invitaciones
    console.log('📧 Enviando invitaciones...');
    const { data: resultado } = await axios.post(
      `${API_URL}/config/${chatbot.id}/invitar`,
      { candidatos }
    );

    console.log('');
    console.log('='.repeat(80));
    console.log('📊 RESULTADO');
    console.log('='.repeat(80));
    console.log(`✅ Enviados: ${resultado.enviados}`);
    console.log(`❌ Fallidos: ${resultado.fallidos}`);
    console.log('');

    if (resultado.resultados && resultado.resultados.length > 0) {
      console.log('📋 Detalle:');
      resultado.resultados.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.nombre || '(Sin nombre)'} - ${r.email}`);
        console.log(`     Sesión ID: ${r.sesionId}`);
      });
    }

    if (resultado.errores && resultado.errores.length > 0) {
      console.log('');
      console.log('❌ Errores:');
      resultado.errores.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.email}: ${e.error}`);
      });
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETADO');
    console.log('='.repeat(80));
    console.log('');
    console.log('💡 Revisa:');
    console.log('   1. Los emails enviados deben tener "Hola Juan Pérez," (con nombre)');
    console.log('   2. Los emails sin nombre deben tener "Hola,"');
    console.log('   3. La base de datos debe tener los datos guardados');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ ERROR');
    console.error('='.repeat(80));
    console.error('Mensaje:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testInvitacionConDatos();
