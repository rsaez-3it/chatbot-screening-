<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()

  function irACrear() {
    router.push('/chatbots/new')
  }

  function irALista() {
    router.push('/chatbots')
  }

  function irACandidatos() {
    router.push('/candidatos')
  }
</script>

<template>
  <div data-eit-p="5">
    <!-- Header -->
    <h1 
      data-eit-font="primary"
      data-eit-font-size="x7"
      data-eit-color="text"
      data-eit-font-weight="900"
      data-eit-mt="0"
      data-eit-mb="2"
    >
      {{ route.meta.title }}
    </h1>
    
    <p data-eit-color="text-soft" data-eit-font-size="x3" data-eit-mb="5">
      Sistema de Chatbot de Screening
    </p>

    <!-- Card: Crear Chatbot -->
    <div 
      data-eit-border="all"
      data-eit-border-color="default"
      data-eit-border-radius="x3"
      data-eit-p="5"
      data-eit-mb="4"
      style="max-width: 600px;"
    >
      <div data-eit-display="flex" data-eit-align="center" data-eit-gap="4" data-eit-mb="4">
        <font-awesome-icon 
          icon="fa-solid fa-robot"
          data-eit-font-size="x8"
          data-eit-color="primary"
        />
        <div>
          <h2 data-eit-font-size="x5" data-eit-mt="0" data-eit-mb="1" data-eit-color="text">
            Configurar Nuevo Chatbot
          </h2>
          <p data-eit-color="text-soft" data-eit-mb="0">
            Crea y configura un chatbot de evaluación para candidatos
          </p>
        </div>
      </div>

      <button
        @click="irACrear"
        style="background: #4A5568; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 8px;"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Crear Chatbot
      </button>
    </div>

    <!-- Card: Ver Chatbots -->
    <div 
      data-eit-border="all"
      data-eit-border-color="default"
      data-eit-border-radius="x3"
      data-eit-p="5"
      data-eit-mb="4"
      style="max-width: 600px;"
    >
      <div data-eit-display="flex" data-eit-align="center" data-eit-gap="4" data-eit-mb="4">
        <font-awesome-icon 
          icon="fa-solid fa-list"
          data-eit-font-size="x8"
          data-eit-color="primary"
        />
        <div>
          <h2 data-eit-font-size="x5" data-eit-mt="0" data-eit-mb="1" data-eit-color="text">
            Ver Mis Chatbots
          </h2>
          <p data-eit-color="text-soft" data-eit-mb="0">
            Administra y edita tus chatbots existentes
          </p>
        </div>
      </div>

      <button
        @click="irALista"
        style="background: #4A5568; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 8px;"
      >
        <font-awesome-icon icon="fa-solid fa-eye" />
        Ver Chatbots
      </button>
    </div>

    <!-- Card: Ver Candidatos -->
    <div 
      data-eit-border="all"
      data-eit-border-color="default"
      data-eit-border-radius="x3"
      data-eit-p="5"
      style="max-width: 600px;"
    >
      <div data-eit-display="flex" data-eit-align="center" data-eit-gap="4" data-eit-mb="4">
        <font-awesome-icon 
          icon="fa-solid fa-users"
          data-eit-font-size="x8"
          data-eit-color="primary"
        />
        <div>
          <h2 data-eit-font-size="x5" data-eit-mt="0" data-eit-mb="1" data-eit-color="text">
            Ver Candidatos
          </h2>
          <p data-eit-color="text-soft" data-eit-mb="0">
            Revisa el progreso y resultados de tus candidatos
          </p>
        </div>
      </div>

      <button
        @click="irACandidatos"
        style="background: #4A5568; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 8px;"
      >
        <font-awesome-icon icon="fa-solid fa-users" />
        Ver Candidatos
      </button>
    </div>
  </div>
</template>
