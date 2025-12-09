import type { Sesion, SesionQueryParams, SesionFilters } from '@/interfaces'
import { createTableData } from '@/factories/common/table.factory'

export const initialSesion: Sesion = {
  id: 0,
  config_id: 0,
  token: '',
  candidato_nombre: null,
  candidato_email: null,
  candidato_telefono: null,
  chatbot_nombre: '',
  estado: 'pendiente',
  resultado: 'sin_evaluar',
  puntaje_total: 0,
  porcentaje: 0,
  fecha_inicio: null,
  fecha_completado: null,
  fecha_expiracion: '',
  created_at: '',
  updated_at: ''
}

export const initialQueryParamsSesion: SesionQueryParams = {
  page: 1,
  limit: 10,
  search: '',
  estado: '',
  config_id: undefined
}

export const initialFiltersSesion: SesionFilters = {
  page: 1,
  search: '',
  estado: '',
  config_id: null
}

export { createTableData }
