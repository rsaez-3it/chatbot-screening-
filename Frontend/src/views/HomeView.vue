<script setup lang="ts">
  import { useRoute } from 'vue-router'
  const route = useRoute()
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

      <ButtonComponent
        data-eit-variant="blue"
        text="Crear Chatbot"
        icon="fa-solid fa-plus"
        @emitEvent="$router.push('/chatbots/new')"
      />
    </div>

    <!-- Card: Ver Chatbots -->
    <div 
      data-eit-border="all"
      data-eit-border-color="default"
      data-eit-border-radius="x3"
      data-eit-p="5"
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

      <ButtonComponent
        data-eit-variant="blue"
        text="Ver Chatbots"
        icon="fa-solid fa-eye"
        @emitEvent="$router.push('/chatbots')"
      />
    </div>
  </div>
</template>
