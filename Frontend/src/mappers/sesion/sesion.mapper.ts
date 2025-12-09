import type { Sesion } from '@/interfaces'

function formatearFecha(fecha: string): string {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getEstadoBadge(estado: string) {
  const badges: Record<string, any> = {
    'pendiente': { name: 'Pendiente', className: 'eit-badge__outline--yellow', status: estado },
    'en_progreso': { name: 'En Progreso', className: 'eit-badge__outline--blue', status: estado },
    'completado': { name: 'Completado', className: 'eit-badge__outline--green', status: estado },
    'expirado': { name: 'Expirado', className: 'eit-badge__outline--red', status: estado },
    'cancelado': { name: 'Cancelado', className: 'eit-badge__outline--gray', status: estado }
  }
  return badges[estado] || { name: estado, className: 'eit-badge__outline--gray', status: estado }
}

export const mapperSesiones = (sesiones: Sesion[]) => {
  return sesiones.map((sesion) => ({
    // Las keys deben estar en camelCase y EN EL MISMO ORDEN que las columnas del store
    // Store: ['Candidato', 'Chatbot', 'Fecha Envío', 'Expiración', 'Estado']
    candidato: sesion.candidato_nombre || sesion.candidato_email || 'Sin nombre',
    chatbot: sesion.chatbot_nombre || 'N/A',
    fechaEnvio: formatearFecha(sesion.created_at),
    expiracion: formatearFecha(sesion.fecha_expiracion),
    recordStatus: getEstadoBadge(sesion.estado),  // IMPORTANTE: Debe llamarse "recordStatus" para que Table reconozca el badge
    // phantomKey: datos no visibles pero accesibles en acciones
    phantomKey: {
      id: sesion.id,
      estado: sesion.estado,
      candidato_email: sesion.candidato_email,
      candidato_nombre: sesion.candidato_nombre,
      token: sesion.token
    }
  }))
}
