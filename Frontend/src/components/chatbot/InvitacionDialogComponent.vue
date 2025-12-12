<script setup lang="ts">
import { ref, computed } from 'vue'

// Interfaces
interface Candidato {
  nombre?: string
  email: string
  telefono?: string
}

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
  enviar: [candidatos: Candidato[]]
  cerrar: []
}>()

// State
const emailsTexto = ref('')
const erroresValidacion = ref<string[]>([])
const formKey = ref(0) // Key para forzar re-render del formulario

// Helper: Parsear una línea de texto a candidato
function parsearLinea(linea: string): Candidato | null {
  const lineaTrim = linea.trim()
  if (!lineaTrim) return null

  // Detectar si tiene TAB (Excel) o comas
  const partes = lineaTrim.includes('\t')
    ? lineaTrim.split('\t').map(p => p.trim()).filter(p => p)
    : lineaTrim.split(',').map(p => p.trim()).filter(p => p)

  if (partes.length === 1) {
    // Solo email
    return { email: partes[0] }
  } else if (partes.length === 2) {
    // Nombre + Email
    return { nombre: partes[0], email: partes[1] }
  } else if (partes.length >= 3) {
    // Nombre + Email + Teléfono
    return { nombre: partes[0], email: partes[1], telefono: partes[2] }
  }

  return null
}

// Computed
const candidatosArray = computed(() => {
  if (!emailsTexto.value.trim()) return []
  
  const lineas = emailsTexto.value.split('\n')
  return lineas
    .map(linea => parsearLinea(linea))
    .filter((c): c is Candidato => c !== null)
})

const candidatosValidos = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return candidatosArray.value.filter(c => emailRegex.test(c.email))
})

const candidatosInvalidos = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return candidatosArray.value.filter(c => !emailRegex.test(c.email))
})

const totalCandidatos = computed(() => candidatosArray.value.length)
const totalValidos = computed(() => candidatosValidos.value.length)
const totalInvalidos = computed(() => candidatosInvalidos.value.length)
const conNombre = computed(() => candidatosValidos.value.filter(c => c.nombre).length)
const conTelefono = computed(() => candidatosValidos.value.filter(c => c.telefono).length)

const puedeEnviar = computed(() => {
  return totalValidos.value > 0 && totalInvalidos.value === 0 && !props.loading
})

// Methods
function validarYEnviar() {
  erroresValidacion.value = []

  if (candidatosArray.value.length === 0) {
    erroresValidacion.value.push('Debes ingresar al menos un candidato')
    return
  }

  if (candidatosInvalidos.value.length > 0) {
    erroresValidacion.value.push(`Hay ${candidatosInvalidos.value.length} candidato(s) con email inválido`)
    return
  }

  emit('enviar', candidatosValidos.value)
}

function cerrar() {
  emailsTexto.value = ''
  erroresValidacion.value = []
  formKey.value++ // Incrementar key para forzar re-render
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
    <AlertComponent
      data-eit-variant="info"
      data-eit-mb="3"
      icon="fa-solid fa-info-circle"
      message="💡 Puedes copiar desde Excel (Nombre, Email, Teléfono) o ingresar solo emails"
    />

    <!-- Textarea de candidatos con key para forzar re-render -->
    <div data-eit-mb="3" :key="formKey">
      <label
        data-eit-display="block"
        data-eit-mb="2"
        data-eit-font-size="x3"
        data-eit-font-weight="600"
        data-eit-color="text"
      >
        Datos de candidatos
      </label>
      <TextareaResizeComponent
        :input="emailsTexto"
        placeHolder="Pega desde Excel o ingresa emails:
Juan Pérez	juan@example.com	+56912345678
maria@example.com
Pedro Silva	pedro@example.com"
        maxLength="5000"
        @emitValue="emailsTexto = $event"
      />
    </div>

    <!-- Contador de candidatos -->
    <div
      v-if="totalCandidatos > 0"
      data-eit-display="flex"
      data-eit-gap="2"
      data-eit-mb="3"
      data-eit-font-size="x2"
    >
      <span data-eit-color="text">Total: <strong>{{ totalCandidatos }}</strong></span>
      <span data-eit-color="green">Válidos: <strong>{{ totalValidos }}</strong></span>
      <span v-if="totalInvalidos > 0" data-eit-color="red">Inválidos: <strong>{{ totalInvalidos }}</strong></span>
      <span v-if="conNombre > 0" data-eit-color="blue">Con nombre: <strong>{{ conNombre }}</strong></span>
      <span v-if="conTelefono > 0" data-eit-color="purple">Con teléfono: <strong>{{ conTelefono }}</strong></span>
    </div>

    <!-- Candidatos inválidos -->
    <AlertComponent
      v-if="totalInvalidos > 0"
      data-eit-variant="danger"
      data-eit-mb="4"
      icon="fa-solid fa-exclamation-triangle"
      :message="`${totalInvalidos} candidato(s) con email inválido`"
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
