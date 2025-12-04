/**
 * Script de prueba para verificar el email de invitación
 */

require('dotenv').config();
const emailService = require('./src/shared/services/emailService');

const testData = {
  candidatoEmail: 'ro.saezp@duocuc.cl',
  chatbotUrl: 'http://localhost:3000/chatbot/test123',
  config: {
    nombre: 'Desarrollador Frontend React',
    total_preguntas: 5
  },
  sesion: {
    candidato_nombre: 'Romina Sáez',
    token: 'abc123def456ghi789',
    fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
};

console.log('🧪 Enviando email de prueba...');
console.log('📧 Destinatario:', testData.candidatoEmail);
console.log('');

emailService.enviarInvitacion(
  testData.candidatoEmail,
  testData.chatbotUrl,
  testData.config,
  testData.sesion
).then(() => {
  console.log('✅ Email enviado correctamente');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
