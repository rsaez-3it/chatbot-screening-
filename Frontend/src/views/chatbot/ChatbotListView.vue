<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreChatbot } from '@/stores'

const router = useRouter()
const store = useStoreChatbot()

onMounted(async () => {
  await store.getChatbots()
})

function crearNuevo() {
  router.push('/chatbots/new')
}

function editar(id: number) {
  router.push(`/chatbots/edit=${id}`)
}

async function eliminar(id: number) {
  if (confirm('¿Estás seguro de eliminar este chatbot?')) {
    try {
      await store.mutationDeleteChatbot(id)
      alert('Chatbot eliminado exitosamente')
    } catch (error) {
      alert('Error al eliminar el chatbot')
    }
  }
}
</script>

<template>
  <div data-eit-p="5">
    <!-- Header -->
    <div data-eit-display="flex" data-eit-justify="space-between" data-eit-align="center" data-eit-mb="5">
      <div>
        <h1 
          data-eit-font="primary"
          data-eit-font-size="x7"
          data-eit-color="text"
          data-eit-font-weight="900"
          data-eit-mt="0"
          data-eit-mb="2"
        >
          Chatbots Creados
        </h1>
        <p data-eit-color="text-soft" data-eit-font-size="x3" data-eit-mb="0">
          Gestiona tus chatbots de evaluación
        </p>
      </div>

      <ButtonComponent
        data-eit-variant="blue"
        text="Crear Nuevo"
        icon="fa-solid fa-plus"
        @emitEvent="crearNuevo"
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loadingTable" data-eit-text-align="center" data-eit-p="5">
      <p data-eit-color="text-soft">Cargando chatbots...</p>
    </div>

    <!-- Error -->
    <AlertComponent
      v-if="store.errorBack"
      data-eit-variant="danger"
      data-eit-mb="4"
      icon="fa-solid fa-exclamation-triangle"
      message="Error al cargar los chatbots"
    />

    <!-- Lista de Chatbots -->
    <div 
      v-if="!store.loadingTable && store.chatbots.length > 0"
      data-eit-display="grid"
      data-eit-grid-cols="1"
      data-eit-grid-cols-md="2"
      data-eit-grid-cols-lg="3"
      data-eit-gap="4"
    >
      <div 
        v-for="chatbot in store.chatbots"
        :key="chatbot.id"
        data-eit-border="all"
        data-eit-border-color="default"
        data-eit-border-radius="x3"
        data-eit-p="4"
      >
        <!-- Header del Card -->
        <div data-eit-display="flex" data-eit-align="start" data-eit-gap="3" data-eit-mb="3">
          <font-awesome-icon 
            icon="fa-solid fa-robot"
            data-eit-font-size="x6"
            data-eit-color="primary"
          />
          <div data-eit-flex="fill">
            <h3 data-eit-font-size="x4" data-eit-mt="0" data-eit-mb="1" data-eit-color="text">
              {{ chatbot.nombre }}
            </h3>
            <p 
              v-if="chatbot.descripcion"
              data-eit-font-size="x2" 
              data-eit-color="text-soft" 
              data-eit-mb="0"
              style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ chatbot.descripcion }}
            </p>
          </div>
        </div>

        <!-- Info -->
        <div data-eit-mb="3">
          <div data-eit-display="flex" data-eit-align="center" data-eit-gap="2" data-eit-mb="2">
            <font-awesome-icon icon="fa-solid fa-user" data-eit-color="text-soft" />
            <span data-eit-font-size="x2" data-eit-color="text">
              {{ chatbot.nombre_asistente }}
            </span>
          </div>

          <div data-eit-display="flex" data-eit-align="center" data-eit-gap="2" data-eit-mb="2">
            <font-awesome-icon icon="fa-solid fa-calendar" data-eit-color="text-soft" />
            <span data-eit-font-size="x2" data-eit-color="text">
              Vigencia: {{ chatbot.duracion_dias }} días
            </span>
          </div>

          <div data-eit-display="flex" data-eit-align="center" data-eit-gap="2">
            <font-awesome-icon icon="fa-solid fa-chart-line" data-eit-color="text-soft" />
            <span data-eit-font-size="x2" data-eit-color="text">
              Umbral: {{ chatbot.umbral_aprobacion }}%
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div data-eit-display="flex" data-eit-gap="2">
          <ButtonComponent
            data-eit-variant="blue"
            data-eit-outline
            text="Editar"
            icon="fa-solid fa-edit"
            @emitEvent="editar(chatbot.id!)"
          />
          <ButtonComponent
            data-eit-variant="red"
            data-eit-outline
            text="Eliminar"
            icon="fa-solid fa-trash"
            @emitEvent="eliminar(chatbot.id!)"
          />
        </div>
      </div>
    </div>

    <!-- Sin chatbots -->
    <div 
      v-if="!store.loadingTable && store.chatbots.length === 0"
      data-eit-text-align="center"
      data-eit-p="5"
    >
      <font-awesome-icon 
        icon="fa-solid fa-robot"
        data-eit-font-size="x9"
        data-eit-color="text-soft"
        data-eit-mb="3"
      />
      <h3 data-eit-color="text" data-eit-mb="2">No hay chatbots creados</h3>
      <p data-eit-color="text-soft" data-eit-mb="4">
        Crea tu primer chatbot para comenzar a evaluar candidatos
      </p>
      <ButtonComponent
        data-eit-variant="blue"
        text="Crear Primer Chatbot"
        icon="fa-solid fa-plus"
        @emitEvent="crearNuevo"
      />
    </div>
  </div>
</template>
