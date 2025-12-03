<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  chatbotId: number
  chatbotNombre: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  enviar: [emails: string[]]
  cerrar: []
}>()

// State
const emailsTexto = ref('')
const erroresValidacion = ref<string[]>([])

// Computed
const emailsArray = computed(() => {
  if (!emailsTexto.value.trim()) return []
  
  // Separar por comas, saltos de línea o espacios
  return emailsTexto.value
    .split(/[,\n\s]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0)
})

const emailsValidos = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailsArray.value.filter(email => emailRegex.test(email))
})

const emailsInvalidos = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailsArray.value.filter(email => !emailRegex.test(email))
})

const totalEmails = computed(() => emailsArray.value.length)
const totalValidos = computed(() => emailsValidos.value.length)
const totalInvalidos = computed(() => emailsInvalidos.value.length)

const puedeEnviar = computed(() => {
  return totalValidos.value > 0 && totalInvalidos.value === 0 && !props.loading
})

// Methods
function validarYEnviar() {
  erroresValidacion.value = []

  if (emailsArray.value.length === 0) {
    erroresValidacion.value.push('Debes ingresar al menos un email')
    return
  }

  if (emailsInvalidos.value.length > 0) {
    erroresValidacion.value.push(`Hay ${emailsInvalidos.value.length} email(s) con formato inválido`)
    return
  }

  emit('enviar', emailsValidos.value)
}

function cerrar() {
  emailsTexto.value = ''
  erroresValidacion.value = []
  emit('cerrar')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div data-eit-mb="4">
      <h3 
        data-eit-font-size="x5" 
        data-eit-mt="0" 
        data-eit-mb="2"
        data-eit-color="text"
      >
        Enviar Invitaciones
      </h3>
      <p data-eit-color="text-soft" data-eit-font-size="x2" data-eit-mb="0">
        Chatbot: <strong>{{ chatbotNombre }}</strong>
      </p>
    </div>

    <!-- Instrucciones -->
    <p data-eit-font-size="x2" data-eit-color="text-soft" data-eit-mb="3">
      Ingresa los emails separados por comas, espacios o saltos de línea. Se creará una sesión única para cada candidato.
    </p>

    <!-- Textarea de emails -->
    <div data-eit-mb="3">
      <label 
        data-eit-display="block"
        data-eit-mb="2"
        data-eit-font-size="x3"
        data-eit-font-weight="600"
        data-eit-color="text"
      >
        Emails de candidatos
      </label>
      <TextareaResizeComponent
        :input="emailsTexto"
        placeHolder="ejemplo1@email.com, ejemplo2@email.com
ejemplo3@email.com"
        maxLength="2000"
        @emitValue="emailsTexto = $event"
      />
    </div>

    <!-- Contador de emails -->
    <div 
      v-if="totalEmails > 0"
      data-eit-display="flex"
      data-eit-gap="2"
      data-eit-mb="3"
      data-eit-font-size="x2"
    >
      <span data-eit-color="text">Total: <strong>{{ totalEmails }}</strong></span>
      <span data-eit-color="green">Válidos: <strong>{{ totalValidos }}</strong></span>
      <span v-if="totalInvalidos > 0" data-eit-color="red">Inválidos: <strong>{{ totalInvalidos }}</strong></span>
    </div>

    <!-- Emails inválidos -->
    <AlertComponent
      v-if="totalInvalidos > 0"
      data-eit-variant="danger"
      data-eit-mb="4"
      icon="fa-solid fa-exclamation-triangle"
      :message="`Emails con formato inválido: ${emailsInvalidos.join(', ')}`"
    />

    <!-- Errores de validación -->
    <AlertComponent
      v-if="erroresValidacion.length > 0"
      data-eit-variant="danger"
      data-eit-mb="4"
      icon="fa-solid fa-exclamation-triangle"
      :message="erroresValidacion.join('. ')"
    />

    <!-- Botón -->
    <div data-eit-display="flex" data-eit-justify="end">
      <ButtonComponent
        data-eit-variant="blue"
        text="Enviar Invitaciones"
        icon="fa-solid fa-paper-plane"
        @emitEvent="validarYEnviar"
        :disabled="!puedeEnviar"
        :loading="loading"
      />
    </div>
  </div>
</template>
