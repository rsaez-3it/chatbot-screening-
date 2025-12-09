import axiosInstance from '@/config/axios.config'
import type { Sesion } from '@/interfaces'

export const sesionService = {
  /**
   * Obtener todas las sesiones con paginación
   */
  async getAll(params?: Record<string, unknown>) {
    const response = await axiosInstance.get('/sesiones', { params })
    return response.data
  },

  /**
   * Obtener una sesión por ID
   */
  async getById(id: number) {
    const response = await axiosInstance.get(`/sesiones/${id}`)
    return response.data.data
  },

  /**
   * Reenviar invitación
   */
  async reenviarInvitacion(sesionId: number) {
    const response = await axiosInstance.post(`/sesiones/${sesionId}/reenviar`)
    return response.data
  },

  /**
   * Eliminar sesión
   */
  async eliminar(sesionId: number) {
    const response = await axiosInstance.delete(`/sesiones/${sesionId}`)
    return response.data
  }
}
