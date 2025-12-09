export interface Sesion {
  id: number
  config_id: number
  token: string
  candidato_nombre: string | null
  candidato_email: string | null
  candidato_telefono: string | null
  chatbot_nombre?: string
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'expirado' | 'cancelado'
  resultado: 'sin_evaluar' | 'aprobado' | 'rechazado' | 'considerar'
  puntaje_total: number
  porcentaje: number
  fecha_inicio: string | null
  fecha_completado: string | null
  fecha_expiracion: string
  created_at: string
  updated_at: string
}

export interface SesionQueryParams {
  page: number
  limit: number
  search?: string
  estado?: string
  config_id?: number
}

export interface SesionFilters {
  page: number
  search: string
  estado: string
  config_id: number | null
}
