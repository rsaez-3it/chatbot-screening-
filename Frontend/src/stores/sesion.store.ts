import { defineStore } from 'pinia'
import axios from 'axios'
import type { AxiosError } from 'axios'
import { utils } from 'uikit-3it-vue'
import { ref, reactive, computed } from 'vue'

import type { AlertsCore, ErrorBack } from 'uikit-3it-vue'
import type { Sesion, SesionQueryParams, SesionFilters } from '@/interfaces'
import { 
  createTableData,
  initialQueryParamsSesion,
  initialFiltersSesion,
  initialAlert
} from '@/factories'
import { sesionService } from '@/services/sesion/sesion.service'
import { mapperSesiones } from '@/mappers/sesion/sesion.mapper'

const { sortTable } = utils.useTable()

export const useStoreSesion = defineStore('storeSesion', () => {

  // Data - Las columnas deben coincidir con las keys del mapper en orden
  const sesiones = ref(createTableData([
    'Candidato',      // key: candidato
    'Chatbot',        // key: chatbot
    'Fecha Envío',    // key: fechaEnvio
    'Expiración',     // key: expiracion
    'Estado'          // key: recordStatus (nombre requerido por UIKit para badges)
  ]))

  const filters = reactive<SesionFilters>({ ...initialFiltersSesion })
  const queryParams = reactive<SesionQueryParams>({ ...initialQueryParamsSesion })

  // UI State
  const slideFilter = ref(false)
  const slideDetail = ref(false)
  const smallSize = ref(false)

  // Messages
  const messageToast = ref<Record<string, unknown>>({})
  const messageAlert = ref<AlertsCore>({ ...initialAlert })
  const messageDialogAlert = ref<AlertsCore>({ ...initialAlert })

  // Loading
  const loadingTable = ref(true)
  const loadingFilters = ref(true)
  const loadingBtnFilters = ref(false)
  const loadingDetail = ref(true)
  const loadingBtnDialog = ref(false)

  // Error
  const errorBack = ref<AxiosError<ErrorBack> | null>(null)

  // Getters
  const filterTable = computed(() => {
    return sortTable(sesiones.value)
  })

  // Actions
  const getSesiones = async (payload: Record<string, unknown>) => {
    try {
      loadingTable.value = true
      errorBack.value = null

      const response = await sesionService.getAll(payload)

      sesiones.value.data = mapperSesiones(response.data)

      // Paginator
      if (response.meta?.pagination) {
        sesiones.value.paginator.total = response.meta.pagination.total
        sesiones.value.paginator.finalPage = response.meta.pagination.pageCount
        sesiones.value.paginator.currentPage = response.meta.pagination.page + 1
        filters.page = sesiones.value.paginator.currentPage
      }

      // Define Sort
      if (sesiones.value.data.length) {
        sesiones.value.sort.keys = Object.keys(sesiones.value.data[0])
      }

    } catch (error) {
      if (axios.isAxiosError(error)) errorBack.value = error
      else errorBack.value = null
    } finally {
      loadingTable.value = false
    }
  }

  const reenviarInvitacion = async (sesionId: number) => {
    try {
      loadingBtnDialog.value = true
      errorBack.value = null

      await sesionService.reenviarInvitacion(sesionId)

      messageToast.value = {
        message: 'Invitación reenviada exitosamente',
        variant: 'success',
        icon: 'fa-solid fa-check'
      }

      // Recargar sesiones
      await getSesiones(queryParams)

    } catch (error) {
      if (axios.isAxiosError(error)) errorBack.value = error
      else errorBack.value = null
      throw error
    } finally {
      loadingBtnDialog.value = false
    }
  }

  const eliminarSesion = async (sesionId: number) => {
    try {
      loadingBtnDialog.value = true
      errorBack.value = null

      await sesionService.eliminar(sesionId)

      messageToast.value = {
        message: 'Sesión eliminada exitosamente',
        variant: 'success',
        icon: 'fa-solid fa-check'
      }

      // Recargar sesiones
      await getSesiones(queryParams)

    } catch (error) {
      if (axios.isAxiosError(error)) errorBack.value = error
      else errorBack.value = null
      throw error
    } finally {
      loadingBtnDialog.value = false
    }
  }

  // UI Handlers
  const handleSlideFilter = () => {
    slideDetail.value = false
    slideFilter.value = true
    loadingFilters.value = false
  }

  const handleSlideDetail = () => {
    slideFilter.value = false
    slideDetail.value = true
  }

  const handleCloseSlide = () => {
    slideFilter.value = false
    slideDetail.value = false
  }

  const resetStore = () => {
    sesiones.value = createTableData([
      'Candidato',
      'Chatbot',
      'Fecha Envío',
      'Expiración',
      'Estado'
    ])
    Object.assign(filters, initialFiltersSesion)
    Object.assign(queryParams, initialQueryParamsSesion)
    errorBack.value = null
  }

  return {
    // State
    sesiones,
    filters,
    queryParams,
    slideFilter,
    slideDetail,
    smallSize,
    messageToast,
    messageAlert,
    messageDialogAlert,
    loadingTable,
    loadingFilters,
    loadingBtnFilters,
    loadingDetail,
    loadingBtnDialog,
    errorBack,

    // Getters
    filterTable,

    // Actions
    getSesiones,
    reenviarInvitacion,
    eliminarSesion,

    // UI Handlers
    handleSlideFilter,
    handleSlideDetail,
    handleCloseSlide,
    resetStore
  }
})
