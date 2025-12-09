<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useStoreSesion } from '@/stores/sesion.store'
import { utils } from 'uikit-3it-vue'
import type { DialogExpose } from 'uikit-3it-vue'

const store = useStoreSesion()

// State para dialogs
const dialogReenviar = ref<DialogExpose | null>(null)
const dialogEliminar = ref<DialogExpose | null>(null)
const sesionAReenviar = ref<any>(null)
const sesionAEliminar = ref<any>(null)

const controlLoadingTable = computed(() => {
  return { row: 8, column: store.sesiones.columns.length }
})

const { actionView, actionDelete } = utils.useAction()

onMounted(async () => {
  handleTableActions()
  await store.getSesiones(store.queryParams)
})

function handleTableActions() {
  store.sesiones.actions = [
    actionView(handleReenviar, 'Reenviar invitación'),
    actionDelete(handleEliminar, 'Eliminar sesión')
  ]
}

function handleReenviar(record: any) {
  // record viene del mapper con phantomKey
  // Solo reenviar si está expirado o pendiente
  if (record.phantomKey?.estado === 'expirado' || record.phantomKey?.estado === 'pendiente') {
    abrirDialogReenviar(record)
  }
}

function handleEliminar(record: any) {
  abrirDialogEliminar(record)
}

function handleUpdateSort(newSort: any) {
  store.sesiones.sort.index = newSort.index
  store.sesiones.sort.asc = newSort.asc
}

function abrirDialogReenviar(record: any) {
  sesionAReenviar.value = record
  dialogReenviar.value?.showDialog()
}

function abrirDialogEliminar(record: any) {
  sesionAEliminar.value = record
  dialogEliminar.value?.showDialog()
}

async function confirmarReenviar() {
  if (!sesionAReenviar.value?.phantomKey?.id) return

  const id = sesionAReenviar.value.phantomKey.id
  dialogReenviar.value?.closeDialog()

  try {
    await store.reenviarInvitacion(id)
    alert('✅ Invitación reenviada exitosamente')
  } catch (error: any) {
    const mensaje = error.response?.data?.message || 'Error al reenviar invitación'
    alert(`❌ ${mensaje}`)
  } finally {
    sesionAReenviar.value = null
  }
}

function cancelarReenviar() {
  dialogReenviar.value?.closeDialog()
  sesionAReenviar.value = null
}

async function confirmarEliminar() {
  if (!sesionAEliminar.value?.phantomKey?.id) return

  const id = sesionAEliminar.value.phantomKey.id
  dialogEliminar.value?.closeDialog()

  try {
    await store.eliminarSesion(id)
    alert('✅ Sesión eliminada exitosamente')
  } catch (error: any) {
    const mensaje = error.response?.data?.message || 'Error al eliminar sesión'
    alert(`❌ ${mensaje}`)
  } finally {
    sesionAEliminar.value = null
  }
}

function cancelarEliminar() {
  dialogEliminar.value?.closeDialog()
  sesionAEliminar.value = null
}

function handleUpdatePaginator(page: number) {
  store.queryParams.page = page
  store.getSesiones(store.queryParams)
}

</script>

<template>
  <div data-eit-p="5">
    <!-- Header -->
    <div data-eit-mb="5">
      <h1 
        data-eit-font="primary"
        data-eit-font-size="x7"
        data-eit-color="text"
        data-eit-font-weight="900"
        data-eit-mt="0"
        data-eit-mb="2"
      >
        Candidatos
      </h1>
      <p data-eit-color="text-soft" data-eit-font-size="x3" data-eit-mb="0">
        Gestiona las evaluaciones de tus candidatos
      </p>
    </div>

    <!-- Error -->
    <AlertComponent
      v-if="store.errorBack"
      data-eit-variant="danger"
      data-eit-mb="4"
      icon="fa-solid fa-exclamation-triangle"
      message="Error al cargar las sesiones"
    />

    <!-- Tabla -->
    <TableComponent
      :sort="store.sesiones.sort"
      :columns="store.sesiones.columns"
      :data="store.filterTable"
      :loading="store.loadingTable"
      :skeleton="controlLoadingTable"
      :actions="store.sesiones.actions"
      @updateSort="handleUpdateSort"
    >
      <template #paginator>
        <div 
          data-eit-display="flex"
          data-eit-align="center"
        >
          <div data-eit-flex="fill">
            <p 
              data-eit-font-size="x2"
              data-eit-color="text-soft"
              data-eit-mb="0"
            >
              <font-awesome-icon 
                icon="fa-solid fa-users" 
                data-eit-me="1"
              />
              <strong data-eit-color="text">
                {{ store.sesiones.paginator.total }}
              </strong> Candidatos
            </p>
          </div>
          <div data-eit-flex="fill">
            <PaginationComponent
              :data="store.sesiones.paginator"
              @updatePaginator="handleUpdatePaginator"
            />
          </div>
        </div>
      </template>
    </TableComponent>

    <!-- Dialog de Confirmación de Reenvío -->
    <DialogComponent
      ref="dialogReenviar"
      class="eit-dialog--center"
    >
      <template #content>
        <div data-eit-p="4">
          <h3 data-eit-font-size="x4" data-eit-mt="0" data-eit-mb="3" data-eit-color="text">
            ¿Reenviar invitación?
          </h3>
          <p data-eit-color="text-soft" data-eit-mb="4">
            Se enviará una nueva invitación a <strong>{{ sesionAReenviar?.phantomKey?.candidato_email || 'el candidato' }}</strong>
            con una nueva fecha de expiración.
          </p>
          <div data-eit-display="flex" data-eit-justify="end" data-eit-gap="2">
            <ButtonComponent
              data-eit-variant="gray"
              data-eit-outline
              text="Cancelar"
              @emitEvent="cancelarReenviar"
            />
            <ButtonComponent
              data-eit-variant="blue"
              text="Reenviar"
              icon="fa-solid fa-paper-plane"
              @emitEvent="confirmarReenviar"
              :loading="store.loadingBtnDialog"
            />
          </div>
        </div>
      </template>
    </DialogComponent>

    <!-- Dialog de Confirmación de Eliminación -->
    <DialogComponent
      ref="dialogEliminar"
      class="eit-dialog--center"
    >
      <template #content>
        <div data-eit-p="4">
          <h3 data-eit-font-size="x4" data-eit-mt="0" data-eit-mb="3" data-eit-color="text">
            ¿Eliminar sesión?
          </h3>
          <p data-eit-color="text-soft" data-eit-mb="4">
            Se eliminará permanentemente la sesión de <strong>{{ sesionAEliminar?.candidato || 'el candidato' }}</strong>
            para el chatbot <strong>{{ sesionAEliminar?.chatbot }}</strong>.
            <br><br>
            <strong>Esta acción no se puede deshacer.</strong>
          </p>
          <div data-eit-display="flex" data-eit-justify="end" data-eit-gap="2">
            <ButtonComponent
              data-eit-variant="gray"
              data-eit-outline
              text="Cancelar"
              @emitEvent="cancelarEliminar"
            />
            <ButtonComponent
              data-eit-variant="red"
              text="Eliminar"
              icon="fa-solid fa-trash"
              @emitEvent="confirmarEliminar"
              :loading="store.loadingBtnDialog"
            />
          </div>
        </div>
      </template>
    </DialogComponent>
  </div>
</template>
