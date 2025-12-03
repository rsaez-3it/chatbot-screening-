import axiosInstance from '@/config/axios.config'
import type { Chatbot, Sesion } from '@/interfaces'

/**
 * Servicio para gestión de chatbots
 * Contiene todas las llamadas HTTP relacionadas con chatbots
 */
export const chatbotService = {
  /**
   * Obtener todos los chatbots
   */
  async getAll() {
    const response = await axiosInstance.get('/config')
    return response.data.data
  },

  /**
   * Obtener un chatbot por ID
   * @param id - ID del chatbot
   */
  async getById(id: number) {
    const response = await axiosInstance.get(`/config/${id}`)
    return response.data.data
  },

  /**
   * Crear un nuevo chatbot
   * @param chatbot - Datos del chatbot a crear
   */
  async create(chatbot: Chatbot) {
    const response = await axiosInstance.post('/config', chatbot)
    return response.data.data
  },

  /**
   * Actualizar un chatbot existente
   * @param id - ID del chatbot
   * @param chatbot - Datos actualizados del chatbot
   */
  async update(id: number, chatbot: Chatbot) {
    const response = await axiosInstance.put(`/config/${id}`, chatbot)
    return response.data.data
  },

  /**
   * Eliminar un chatbot
   * @param id - ID del chatbot a eliminar
   */
  async delete(id: number) {
    await axiosInstance.delete(`/config/${id}`)
  },

  /**
   * Obtener sesiones con filtros opcionales
   * @param filtros - Objeto con filtros para las sesiones
   */
  async getSesiones(filtros?: Record<string, any>) {
    const params = new URLSearchParams(filtros).toString()
    const url = filtros ? `/sesiones?${params}` : '/sesiones'
    const response = await axiosInstance.get(url)
    return response.data.data
  },

  /**
   * Enviar invitaciones por email
   * @param id - ID del chatbot
   * @param emails - Array de emails a invitar
   */
  async enviarInvitaciones(id: number, emails: string[]) {
    const response = await axiosInstance.post(`/config/${id}/invitar`, { emails })
    return response.data
  },

  /**
   * Verificar configuración SMTP
   * @param id - ID del chatbot
   */
  async verificarSMTP(id: number) {
    const response = await axiosInstance.post(`/config/${id}/verificar-smtp`)
    return response.data
  }
}
