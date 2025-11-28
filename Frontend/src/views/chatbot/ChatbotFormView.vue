<template>
  <div data-eit-p="5" style="max-width: 1200px; margin: 0 auto;">
    <!-- Header -->
    <div data-eit-mb="5">
      <h1 data-eit-font-size="x6" data-eit-font-weight="900" data-eit-mt="0" data-eit-mb="2">
        {{ esEdicion ? 'Editar Chatbot' : 'Crear Nuevo Chatbot' }}
      </h1>
      <p data-eit-color="text-soft" data-eit-mt="2">
        {{ esEdicion ? 'Modifica la configuración del chatbot' : 'Configura tu chatbot en 5 sencillos pasos' }}
      </p>
    </div>

    <!-- Error del backend -->
    <div v-if="store.errorBack" data-eit-mb="4">
      <AlertComponent
        data-eit-variant="danger"
        icon="fa-solid fa-exclamation-triangle"
        message="Error al procesar la solicitud"
      />
    </div>

    <!-- TabComponent con 5 pasos -->
    <TabComponent :data="pasos" :activeTab="pasoActual">

      <!-- ============================================ -->
      <!-- TAB 0: ASISTENTE -->
      <!-- ============================================ -->
      <template #tab-0>
        <div
          data-eit-border="all"
          data-eit-border-color="default"
          data-eit-border-radius="x3"
          data-eit-p="5"
          data-eit-mt="4"
        >
          <h2 data-eit-color="secondary" data-eit-font-size="x5" data-eit-mb="4" data-eit-mt="0">
            Configuración del Asistente
          </h2>

          <div data-eit-mb="4">
            <InputComponent
              inputType="text"
              floatLabel="Nombre del asistente *"
              :input="formData.nombre_asistente"
              :requiredField="true"
              :error="formError"
              maxLength="100"
              @emitValue="formData.nombre_asistente = $event"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Ejemplo: Eva, Alex, María
            </p>
          </div>

          <div data-eit-mb="5">
            <InputComponent
              inputType="text"
              floatLabel="Avatar URL (opcional)"
              :input="formData.avatar_url"
              maxLength="500"
              :floatLeft="true"
              @emitValue="formData.avatar_url = $event"
            >
              <template #float-left>
                <font-awesome-icon icon="fa-solid fa-image" data-eit-color="secondary" />
              </template>
            </InputComponent>
          </div>

          <div data-eit-mb="4">
            <label data-eit-display="block" data-eit-mb="2" data-eit-font-weight="500">
              Color de botones
            </label>
            <div data-eit-display="flex" data-eit-align="center" data-eit-gap="3">
              <input
                type="color"
                v-model="formData.color_botones"
                style="width: 60px; height: 40px; border-radius: 4px; border: 1px solid #e5e7eb; cursor: pointer;"
              />
              <span data-eit-color="text-soft">{{ formData.color_botones }}</span>
            </div>
          </div>

          <div data-eit-mb="4">
            <label data-eit-display="block" data-eit-mb="2" data-eit-font-weight="500">
              Color de conversación
            </label>
            <div data-eit-display="flex" data-eit-align="center" data-eit-gap="3">
              <input
                type="color"
                v-model="formData.color_conversacion"
                style="width: 60px; height: 40px; border-radius: 4px; border: 1px solid #e5e7eb; cursor: pointer;"
              />
              <span data-eit-color="text-soft">{{ formData.color_conversacion }}</span>
            </div>
          </div>

          <div data-eit-mb="5">
            <label data-eit-display="block" data-eit-mb="2" data-eit-font-weight="500">
              Color de fondo
            </label>
            <div data-eit-display="flex" data-eit-align="center" data-eit-gap="3">
              <input
                type="color"
                v-model="formData.color_fondo"
                style="width: 60px; height: 40px; border-radius: 4px; border: 1px solid #e5e7eb; cursor: pointer;"
              />
              <span data-eit-color="text-soft">{{ formData.color_fondo }}</span>
            </div>
          </div>

          <!-- Botones -->
          <div data-eit-display="flex" data-eit-justify="end" data-eit-mt="5" data-eit-pt="4">
            <ButtonComponent
              data-eit-variant="blue"
              text="Siguiente"
              icon="fa-solid fa-arrow-right"
              @emitEvent="siguientePaso"
            />
          </div>
        </div>
      </template>

      <!-- ============================================ -->
      <!-- TAB 1: EVALUACIÓN -->
      <!-- ============================================ -->
      <template #tab-1>
        <div
          data-eit-border="all"
          data-eit-border-color="default"
          data-eit-border-radius="x3"
          data-eit-p="5"
          data-eit-mt="4"
        >
          <h2 data-eit-color="secondary" data-eit-font-size="x5" data-eit-mb="4" data-eit-mt="0">
            Configuración de Evaluación
          </h2>

          <AlertComponent
            data-eit-variant="info"
            data-eit-mb="4"
            icon="fa-solid fa-info-circle"
            message="El candidato NO verá el resultado. Solo tú lo recibirás por email con toda la información."
          />

          <div data-eit-mb="4">
            <InputComponent
              inputType="text"
              floatLabel="Nombre del chatbot *"
              :input="formData.nombre"
              :requiredField="true"
              :error="formError"
              maxLength="200"
              @emitValue="formData.nombre = $event"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Ejemplo: Evaluación Desarrollador Full Stack
            </p>
          </div>

          <div data-eit-mb="4">
            <InputComponent
              inputType="textarea"
              floatLabel="Descripción (opcional)"
              :input="formData.descripcion"
              maxLength="500"
              @emitValue="formData.descripcion = $event"
            />
          </div>

          <div data-eit-mb="4">
            <label data-eit-display="block" data-eit-mb="2" data-eit-font-weight="500">
              Categoría
            </label>
            <v-select
              v-model="selectedCategoria"
              :options="categorias"
              label="label"
              placeholder="Selecciona una categoría"
              :reduce="(option: any) => option"
            />
          </div>

          <div data-eit-mb="4">
            <InputComponent
              inputType="number"
              floatLabel="Duración (días) *"
              :input="String(formData.duracion_dias)"
              maxLength="4"
              @emitValue="formData.duracion_dias = Number($event)"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Días que la sesión estará vigente para el candidato
            </p>
          </div>

          <div data-eit-mb="5">
            <InputComponent
              inputType="number"
              floatLabel="Umbral de aprobación (%) *"
              :input="String(formData.umbral_aprobacion)"
              maxLength="3"
              @emitValue="formData.umbral_aprobacion = Number($event)"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Porcentaje mínimo para aprobar (0-100)
            </p>
          </div>

          <!-- Botones -->
          <div data-eit-display="flex" data-eit-justify="space-between" data-eit-mt="5" data-eit-pt="4" data-eit-gap="3">
            <ButtonComponent
              data-eit-variant="blue"
              data-eit-outline
              text="Anterior"
              icon="fa-solid fa-arrow-left"
              @emitEvent="anteriorPaso"
            />
            <ButtonComponent
              data-eit-variant="blue"
              text="Siguiente"
              icon="fa-solid fa-arrow-right"
              @emitEvent="siguientePaso"
            />
          </div>
        </div>
      </template>

      <!-- ============================================ -->
      <!-- TAB 2: MENSAJES -->
      <!-- ============================================ -->
      <template #tab-2>
        <div
          data-eit-border="all"
          data-eit-border-color="default"
          data-eit-border-radius="x3"
          data-eit-p="5"
          data-eit-mt="4"
        >
          <h2 data-eit-color="secondary" data-eit-font-size="x5" data-eit-mb="4" data-eit-mt="0">
            Mensajes Personalizados
          </h2>

          <AlertComponent
            data-eit-variant="warning"
            data-eit-mb="4"
            icon="fa-solid fa-comment-dots"
            message="Estos mensajes se mostrarán al candidato al inicio y final de la evaluación."
          />

          <div data-eit-mb="4">
            <InputComponent
              inputType="textarea"
              floatLabel="Mensaje de bienvenida *"
              :input="formData.mensaje_bienvenida"
              maxLength="500"
              @emitValue="formData.mensaje_bienvenida = $event"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Primer mensaje que verá el candidato
            </p>
          </div>

          <div data-eit-mb="5">
            <InputComponent
              inputType="textarea"
              floatLabel="Mensaje de finalización *"
              :input="formData.mensaje_finalizacion"
              maxLength="500"
              @emitValue="formData.mensaje_finalizacion = $event"
            />
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              Mensaje después de completar todas las preguntas
            </p>
          </div>

          <!-- Botones -->
          <div data-eit-display="flex" data-eit-justify="space-between" data-eit-mt="5" data-eit-pt="4" data-eit-gap="3">
            <ButtonComponent
              data-eit-variant="blue"
              data-eit-outline
              text="Anterior"
              icon="fa-solid fa-arrow-left"
              @emitEvent="anteriorPaso"
            />
            <ButtonComponent
              data-eit-variant="blue"
              text="Siguiente"
              icon="fa-solid fa-arrow-right"
              @emitEvent="siguientePaso"
            />
          </div>
        </div>
      </template>

      <!-- ============================================ -->
      <!-- TAB 3: EMAIL -->
      <!-- ============================================ -->
      <template #tab-3>
        <div
          data-eit-border="all"
          data-eit-border-color="default"
          data-eit-border-radius="x3"
          data-eit-p="5"
          data-eit-mt="4"
        >
          <h2 data-eit-color="secondary" data-eit-font-size="x5" data-eit-mb="4" data-eit-mt="0">
            Configuración de Email
          </h2>

          <AlertComponent
            data-eit-variant="success"
            data-eit-mb="4"
            icon="fa-solid fa-envelope"
            message="Recibirás un email COMPLETO con la conversación + evaluaciones + PDF adjunto."
          />

          <div data-eit-mb="5">
            <InputComponent
              inputType="email"
              floatLabel="Email del reclutador *"
              :input="formData.email_reclutador"
              :requiredField="true"
              :floatLeft="true"
              maxLength="200"
              @emitValue="formData.email_reclutador = $event"
            >
              <template #float-left>
                <font-awesome-icon icon="fa-solid fa-envelope" data-eit-color="primary" />
              </template>
            </InputComponent>
          </div>

          <!-- SMTP Config (Acordeón) -->
          <details data-eit-mb="5">
            <summary
              data-eit-p="3"
              data-eit-border="all"
              data-eit-border-radius="x3"
              style="cursor: pointer;"
            >
              <strong>⚙️ Configuración SMTP (Opcional)</strong>
            </summary>

            <div data-eit-mt="3" data-eit-p="4" data-eit-border="all" data-eit-border-radius="x3">
              <div data-eit-mb="3">
                <InputComponent
                  inputType="text"
                  floatLabel="Host SMTP"
                  :input="formData.smtp_config?.host || ''"
                  maxLength="200"
                  @emitValue="formData.smtp_config && (formData.smtp_config.host = $event)"
                />
              </div>

              <div data-eit-mb="3">
                <InputComponent
                  inputType="number"
                  floatLabel="Puerto SMTP"
                  :input="String(formData.smtp_config?.port || 587)"
                  maxLength="5"
                  @emitValue="formData.smtp_config && (formData.smtp_config.port = Number($event))"
                />
              </div>

              <div data-eit-mb="3">
                <InputComponent
                  inputType="text"
                  floatLabel="Usuario SMTP"
                  :input="formData.smtp_config?.user || ''"
                  maxLength="200"
                  @emitValue="formData.smtp_config && (formData.smtp_config.user = $event)"
                />
              </div>

              <div data-eit-mb="3">
                <InputComponent
                  inputType="password"
                  floatLabel="Contraseña SMTP"
                  :input="formData.smtp_config?.pass || ''"
                  maxLength="200"
                  @emitValue="formData.smtp_config && (formData.smtp_config.pass = $event)"
                />
              </div>

              <div data-eit-mb="0">
                <InputComponent
                  inputType="text"
                  floatLabel="Nombre del remitente"
                  :input="formData.smtp_config?.from_name || ''"
                  maxLength="200"
                  @emitValue="formData.smtp_config && (formData.smtp_config.from_name = $event)"
                />
              </div>
            </div>
          </details>

          <!-- Botones -->
          <div data-eit-display="flex" data-eit-justify="space-between" data-eit-mt="5" data-eit-pt="4" data-eit-gap="3">
            <ButtonComponent
              data-eit-variant="blue"
              data-eit-outline
              text="Anterior"
              icon="fa-solid fa-arrow-left"
              @emitEvent="anteriorPaso"
            />
            <ButtonComponent
              data-eit-variant="blue"
              text="Siguiente"
              icon="fa-solid fa-arrow-right"
              @emitEvent="siguientePaso"
            />
          </div>
        </div>
      </template>

      <!-- ============================================ -->
      <!-- TAB 4: PREGUNTAS -->
      <!-- ============================================ -->
      <template #tab-4>
        <div
          data-eit-border="all"
          data-eit-border-color="default"
          data-eit-border-radius="x3"
          data-eit-p="5"
          data-eit-mt="4"
        >
          <h2 data-eit-color="secondary" data-eit-font-size="x5" data-eit-mb="4" data-eit-mt="0">
            Preguntas del Chatbot
          </h2>

          <AlertComponent
            data-eit-variant="info"
            data-eit-mb="4"
            icon="fa-solid fa-comments"
            message="Las preguntas se mostrarán UNA POR UNA como chat. El sistema evaluará automáticamente cada respuesta."
          />

          <!-- Lista de preguntas -->
          <div data-eit-mb="4">
            <PreguntaListComponent
              :preguntas="formData.preguntas"
              @editar="editarPregunta"
              @eliminar="eliminarPregunta"
            />
          </div>

          <!-- Botón agregar pregunta -->
          <div data-eit-mb="5">
            <ButtonComponent
              data-eit-variant="green"
              text="Agregar Pregunta"
              icon="fa-solid fa-plus"
              @emitEvent="abrirFormPregunta()"
            />
          </div>

          <!-- Botones -->
          <div data-eit-display="flex" data-eit-justify="space-between" data-eit-mt="5" data-eit-pt="4" data-eit-gap="3">
            <ButtonComponent
              data-eit-variant="blue"
              data-eit-outline
              text="Anterior"
              icon="fa-solid fa-arrow-left"
              @emitEvent="anteriorPaso"
            />
            <ButtonComponent
              data-eit-variant="blue"
              text="Guardar Chatbot"
              icon="fa-solid fa-save"
              :disabled="store.loadingBtnForm"
              @emitEvent="guardarChatbot"
            />
          </div>
        </div>
      </template>

    </TabComponent>

    <!-- Modal de pregunta -->
    <PreguntaFormComponent
      :isOpen="modalPreguntaAbierto"
      :pregunta="preguntaEnEdicion"
      :isEditing="!!preguntaEnEdicion"
      @save="guardarPregunta"
      @cancel="cerrarModalPregunta"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreChatbot } from '@/stores'
import type { Chatbot, Pregunta } from '@/interfaces'
import type { SelectOption } from 'uikit-3it-vue'
import { categorias } from '@/constants'
import { initialChatbot } from '@/factories'
import PreguntaListComponent from '@/components/chatbot/PreguntaListComponent.vue'
import PreguntaFormComponent from '@/components/chatbot/PreguntaFormComponent.vue'

// UIKit Components are globally registered in main.ts - DO NOT import them

const route = useRoute()
const router = useRouter()
const store = useStoreChatbot()

// Estado del formulario
const pasoActual = ref(0)
const formError = ref(false)
const modalPreguntaAbierto = ref(false)
const preguntaEnEdicion = ref<Pregunta | null>(null)
const indicePreguntaEnEdicion = ref<number | null>(null)

const pasos = [
  { name: 'Asistente' },
  { name: 'Evaluación' },
  { name: 'Mensajes' },
  { name: 'Email' },
  { name: 'Preguntas' }
]

// Datos del formulario
const formData = ref<Chatbot>({ ...initialChatbot })

const selectedCategoria = ref<SelectOption | null>(null)

const esEdicion = computed(() => !!route.params.id)

// Cargar chatbot si estamos editando
onMounted(async () => {
  if (esEdicion.value) {
    try {
      await store.getChatbotForm(Number(route.params.id))
      if (store.chatbot) {
        formData.value = { ...store.chatbot }
        selectedCategoria.value = categorias.find(c => String(c.id) === store.chatbot.categoria) || null
      }
    } catch (error) {
      console.error('Error al cargar chatbot:', error)
    }
  }
})

// Watch para actualizar categoria
watch(selectedCategoria, (newVal) => {
  if (newVal) {
    formData.value.categoria = String(newVal.id)
  }
})

// Navegación entre pasos
function siguientePaso() {
  if (pasoActual.value < pasos.length - 1) {
    pasoActual.value++
  }
}

function anteriorPaso() {
  if (pasoActual.value > 0) {
    pasoActual.value--
  }
}

// Gestión de preguntas
function abrirFormPregunta(pregunta?: Pregunta, index?: number) {
  if (pregunta && index !== undefined) {
    preguntaEnEdicion.value = { ...pregunta }
    indicePreguntaEnEdicion.value = index
  } else {
    preguntaEnEdicion.value = null
    indicePreguntaEnEdicion.value = null
  }
  modalPreguntaAbierto.value = true
}

function cerrarModalPregunta() {
  modalPreguntaAbierto.value = false
  preguntaEnEdicion.value = null
  indicePreguntaEnEdicion.value = null
}

function guardarPregunta(pregunta: Pregunta) {
  if (indicePreguntaEnEdicion.value !== null) {
    // Editar pregunta existente
    formData.value.preguntas[indicePreguntaEnEdicion.value] = {
      ...pregunta,
      orden: indicePreguntaEnEdicion.value + 1
    }
  } else {
    // Agregar nueva pregunta
    formData.value.preguntas.push({
      ...pregunta,
      orden: formData.value.preguntas.length + 1
    })
  }
  cerrarModalPregunta()
}

function editarPregunta(index: number) {
  abrirFormPregunta(formData.value.preguntas[index], index)
}

function eliminarPregunta(index: number) {
  if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
    formData.value.preguntas.splice(index, 1)
    // Reordenar
    formData.value.preguntas.forEach((p, i) => {
      p.orden = i + 1
    })
  }
}

// Guardar chatbot
async function guardarChatbot() {
  try {
    formError.value = false

    // Validar campos requeridos
    if (!formData.value.nombre_asistente || !formData.value.nombre || !formData.value.email_reclutador) {
      formError.value = true
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (formData.value.preguntas.length === 0) {
      alert('Debes agregar al menos una pregunta')
      return
    }

    if (esEdicion.value && formData.value.id) {
      await store.mutationUpdateChatbot(formData.value.id, formData.value)
    } else {
      await store.mutationCreateChatbot(formData.value)
    }

    alert(esEdicion.value ? 'Chatbot actualizado exitosamente' : 'Chatbot creado exitosamente')
    router.push('/')
  } catch (error) {
    console.error('Error al guardar chatbot:', error)
    alert('Error al guardar el chatbot')
  }
}
</script>
