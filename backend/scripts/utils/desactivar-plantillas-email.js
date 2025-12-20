/**
 * Script para desactivar plantillas de email de la base de datos
 * Para que use las plantillas del código en lugar de la BD
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function desactivarPlantillas() {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log('DESACTIVANDO PLANTILLAS DE EMAIL EN BASE DE DATOS');
    console.log('='.repeat(80));
    console.log('');

    // Ver plantillas existentes
    const [plantillas] = await pool.query('SELECT * FROM cb_email_templates WHERE activa = 1');

    if (plantillas.length === 0) {
      console.log('✅ No hay plantillas activas en la base de datos');
      await closePool();
      return;
    }

    console.log(`Encontradas ${plantillas.length} plantillas activas:`);
    plantillas.forEach(p => {
      console.log(`   - ${p.codigo}: ${p.nombre}`);
    });

    console.log('');
    console.log('Desactivando todas las plantillas...');

    // Desactivar todas las plantillas
    await pool.query('UPDATE cb_email_templates SET activa = 0');

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ PLANTILLAS DESACTIVADAS');
    console.log('='.repeat(80));
    console.log('');
    console.log('Ahora el sistema usará las plantillas HTML del código.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

desactivarPlantillas();
