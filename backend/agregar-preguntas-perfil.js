/**
 * Script para agregar preguntas de perfil predefinidas a un chatbot
 * Las preguntas de perfil son: Nombre, Email, Teléfono
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

const PREGUNTAS_PERFIL = [
  {
    pregunta: '¿Cuál es tu nombre completo?',
    tipo_campo: 'texto',
    metodo_evaluacion: 'regla_fija',
    regla: {
      tipo: 'longitud',
      longitud_minima: 3,
      longitud_maxima: 100
    },
    peso: 1,
    es_eliminatoria: false,
    requerida: true,
    orden: -3,
    activo: true
  },
  {
    pregunta: '¿Cuál es tu correo electrónico?',
    tipo_campo: 'email',
    metodo_evaluacion: 'regla_fija',
    regla: {
      tipo: 'formato',
      formato: 'email'
    },
    peso: 1,
    es_eliminatoria: false,
    requerida: true,
    orden: -2,
    activo: true
  },
  {
    pregunta: '¿Cuál es tu número de teléfono?',
    tipo_campo: 'telefono',
    metodo_evaluacion: 'regla_fija',
    regla: {
      tipo: 'formato',
      formato: 'telefono'
    },
    peso: 1,
    es_eliminatoria: false,
    requerida: true,
    orden: -1,
    activo: true
  }
];

async function agregarPreguntasPerfil(configId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`AGREGANDO PREGUNTAS DE PERFIL AL CHATBOT ${configId}`);
    console.log('='.repeat(80));
    console.log('');

    // Verificar si ya tiene preguntas de perfil
    const [existentes] = await pool.query(
      'SELECT id, pregunta, orden FROM cb_preguntas WHERE config_id = ? AND orden < 0',
      [configId]
    );

    if (existentes.length > 0) {
      console.log('⚠️  El chatbot ya tiene preguntas de perfil:');
      existentes.forEach(p => {
        console.log(`   - ${p.pregunta} (orden: ${p.orden})`);
      });
      console.log('');
      console.log('¿Deseas eliminarlas y agregar las nuevas? (Ctrl+C para cancelar)');
      console.log('Continuando en 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Eliminar preguntas de perfil existentes
      await pool.query('DELETE FROM cb_preguntas WHERE config_id = ? AND orden < 0', [configId]);
      console.log('✅ Preguntas de perfil anteriores eliminadas');
      console.log('');
    }

    // Agregar nuevas preguntas de perfil
    console.log('Agregando preguntas de perfil:');
    
    for (const pregunta of PREGUNTAS_PERFIL) {
      const sql = `
        INSERT INTO cb_preguntas (
          config_id,
          pregunta,
          tipo_campo,
          metodo_evaluacion,
          regla,
          peso,
          es_eliminatoria,
          requerida,
          orden
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        configId,
        pregunta.pregunta,
        pregunta.tipo_campo,
        pregunta.metodo_evaluacion,
        JSON.stringify(pregunta.regla),
        pregunta.peso,
        pregunta.es_eliminatoria ? 1 : 0,
        pregunta.requerida ? 1 : 0,
        pregunta.orden
      ];

      await pool.query(sql, params);
      console.log(`   ✅ ${pregunta.pregunta} (orden: ${pregunta.orden})`);
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ PREGUNTAS DE PERFIL AGREGADAS EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Las preguntas de perfil se harán ANTES de las preguntas de evaluación.');
    console.log('Los datos se guardarán automáticamente en la sesión.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

const configId = process.argv[2];

if (!configId) {
  console.log('');
  console.log('USO: node agregar-preguntas-perfil.js <config_id>');
  console.log('');
  console.log('Ejemplo: node agregar-preguntas-perfil.js 13');
  console.log('');
  console.log('Esto agregará 3 preguntas de perfil predefinidas:');
  console.log('  1. Nombre completo (orden: -3)');
  console.log('  2. Email (orden: -2)');
  console.log('  3. Teléfono (orden: -1)');
  console.log('');
  process.exit(1);
}

agregarPreguntasPerfil(parseInt(configId));
