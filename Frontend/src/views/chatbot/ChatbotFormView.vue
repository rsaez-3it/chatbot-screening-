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
    <div v-if="mensajeError" data-eit-mb="4">
      <AlertComponent
        data-eit-variant="error"
        icon="fa-solid fa-exclamation-triangle"
        :message="mensajeError"
      />
    </div>

    <!-- TabComponent con 5 pasos -->
    <TabComponent :data="pasos">

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
            <label data-eit-display="block" data-eit-mb="2" data-eit-font-weight="500">
              Avatar del asistente (opcional)
            </label>
            
            <!-- Preview y botón -->
            <div data-eit-display="flex" data-eit-align="center" data-eit-gap="3">
              <!-- Preview del avatar seleccionado -->
              <img
                v-if="formData.avatar_url"
                :src="formData.avatar_url"
                alt="Avatar seleccionado"
                data-eit-shape="circle"
                data-eit-shape-size="60"
                data-eit-object-fit="cover"
                data-eit-border="all"
                data-eit-border-color="default"
                data-eit-flex-shrink="0"
              />
              <span
                v-else
                data-eit-shape="circle"
                data-eit-shape-size="60"
                data-eit-bg="soft"
                data-eit-display="flex"
                data-eit-align="center"
                data-eit-justify="center"
                data-eit-border="all"
                data-eit-border-color="default"
                data-eit-flex-shrink="0"
              >
                <font-awesome-icon
                  icon="fa-solid fa-robot"
                  data-eit-color="text-soft"
                  data-eit-font-size="x5"
                />
              </span>
              
              <!-- Botón para abrir selector -->
              <ButtonComponent
                text="Seleccionar avatar"
                icon="fa-solid fa-image"
                data-eit-variant="secondary"
                @emitEvent="abrirModalAvatar"
              />
              
              <!-- Botón para quitar avatar -->
              <ButtonComponent
                v-if="formData.avatar_url"
                text="Quitar"
                icon="fa-solid fa-times"
                data-eit-variant="danger"
                @emitEvent="seleccionarAvatar('')"
              />
            </div>
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
              inputType="text"
              floatLabel="Email(s) del reclutador *"
              :input="formData.email_reclutador"
              :requiredField="true"
              :floatLeft="true"
              maxLength="500"
              @emitValue="formData.email_reclutador = $event"
            >
              <template #float-left>
                <font-awesome-icon icon="fa-solid fa-envelope" data-eit-color="primary" />
              </template>
            </InputComponent>
            <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mt="2" data-eit-mb="0">
              💡 Puedes ingresar múltiples emails separados por comas: email1@example.com, email2@example.com
            </p>
          </div>

          <!-- Info sobre emails -->
          <AlertComponent
            data-eit-variant="info"
            data-eit-mb="4"
            icon="fa-solid fa-info-circle"
            message="Los emails de invitación se enviarán automáticamente desde el sistema. Solo necesitas configurar tu email para recibir los resultados."
          />

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

          <!-- Botón Guardar -->
          <div data-eit-display="flex" data-eit-justify="end" data-eit-mt="5" data-eit-pt="4">
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
      ref="preguntaFormRef"
      :isOpen="modalPreguntaAbierto"
      :pregunta="preguntaEnEdicion"
      :isEditing="!!preguntaEnEdicion"
      @save="guardarPregunta"
      @cancel="cerrarModalPregunta"
    />

    <!-- Modal de selección de avatar -->
    <DialogComponent
      ref="dialogAvatarRef"
      class="eit-dialog--top eit-dialog--medium"
    >
      <template #head>
        <h3 data-eit-font-size="x5" data-eit-my="0">
          Selecciona un avatar
        </h3>
      </template>
      
      <template #content>
        <div 
          data-eit-display="grid" 
          style="grid-template-columns: repeat(3, 1fr); gap: 16px;"
        >
          <!-- Avatar 1 -->
          <div 
            @click="seleccionarAvatar('/avatars/Trit-1.jpg')"
            data-eit-cursor="pointer"
            data-eit-border="all"
            :data-eit-border-color="formData.avatar_url === '/avatars/Trit-1.jpg' ? 'primary' : 'default'"
            data-eit-border-radius="x2"
            data-eit-p="3"
            data-eit-text-align="center"
            data-eit-bg="white"
            :data-eit-box-shadow="formData.avatar_url === '/avatars/Trit-1.jpg' ? 'medium' : 'none'"
          >
            <img
              src="/avatars/Trit-1.jpg"
              alt="Avatar 1"
              data-eit-width="full"
              data-eit-border-radius="x2"
              data-eit-object-fit="cover"
              style="height: 80px;"
            />
            <p data-eit-font-size="x1" data-eit-mt="2" data-eit-mb="0" data-eit-color="text-soft">
              Avatar 1
            </p>
          </div>

          <!-- Avatar 2 -->
          <div 
            @click="seleccionarAvatar('/avatars/Trit-2.jpg')"
            data-eit-cursor="pointer"
            data-eit-border="all"
            :data-eit-border-color="formData.avatar_url === '/avatars/Trit-2.jpg' ? 'primary' : 'default'"
            data-eit-border-radius="x2"
            data-eit-p="3"
            data-eit-text-align="center"
            data-eit-bg="white"
            :data-eit-box-shadow="formData.avatar_url === '/avatars/Trit-2.jpg' ? 'medium' : 'none'"
          >
            <img
              src="/avatars/Trit-2.jpg"
              alt="Avatar 2"
              data-eit-width="full"
              data-eit-border-radius="x2"
              data-eit-object-fit="cover"
              style="height: 80px;"
            />
            <p data-eit-font-size="x1" data-eit-mt="2" data-eit-mb="0" data-eit-color="text-soft">
              Avatar 2
            </p>
          </div>

          <!-- Avatar 3 -->
          <div 
            @click="seleccionarAvatar('/avatars/Trit-3.jpg')"
            data-eit-cursor="pointer"
            data-eit-border="all"
            :data-eit-border-color="formData.avatar_url === '/avatars/Trit-3.jpg' ? 'primary' : 'default'"
            data-eit-border-radius="x2"
            data-eit-p="3"
            data-eit-text-align="center"
            data-eit-bg="white"
            :data-eit-box-shadow="formData.avatar_url === '/avatars/Trit-3.jpg' ? 'medium' : 'none'"
          >
            <img
              src="/avatars/Trit-3.jpg"
              alt="Avatar 3"
              data-eit-width="full"
              data-eit-border-radius="x2"
              data-eit-object-fit="cover"
              style="height: 80px;"
            />
            <p data-eit-font-size="x1" data-eit-mt="2" data-eit-mb="0" data-eit-color="text-soft">
              Avatar 3
            </p>
          </div>

          <!-- Avatar 4 -->
          <div 
            @click="seleccionarAvatar('/avatars/Trit-4.jpg')"
            data-eit-cursor="pointer"
            data-eit-border="all"
            :data-eit-border-color="formData.avatar_url === '/avatars/Trit-4.jpg' ? 'primary' : 'default'"
            data-eit-border-radius="x2"
            data-eit-p="3"
            data-eit-text-align="center"
            data-eit-bg="white"
            :data-eit-box-shadow="formData.avatar_url === '/avatars/Trit-4.jpg' ? 'medium' : 'none'"
          >
            <img
              src="/avatars/Trit-4.jpg"
              alt="Avatar 4"
              data-eit-width="full"
              data-eit-border-radius="x2"
              data-eit-object-fit="cover"
              style="height: 80px;"
            />
            <p data-eit-font-size="x1" data-eit-mt="2" data-eit-mb="0" data-eit-color="text-soft">
              Avatar 4
            </p>
          </div>

          <!-- Sin avatar -->
          <div 
            @click="seleccionarAvatar('')"
            data-eit-cursor="pointer"
            data-eit-border="all"
            :data-eit-border-color="!formData.avatar_url ? 'primary' : 'default'"
            data-eit-border-radius="x2"
            data-eit-p="3"
            data-eit-text-align="center"
            data-eit-bg="white"
            data-eit-display="flex"
            data-eit-flex-direction="column"
            data-eit-align="center"
            data-eit-justify="center"
            :data-eit-box-shadow="!formData.avatar_url ? 'medium' : 'none'"
            style="min-height: 112px;"
          >
            <font-awesome-icon 
              icon="fa-solid fa-robot" 
              data-eit-color="text-soft"
              data-eit-font-size="x6"
            />
            <p data-eit-font-size="x1" data-eit-mt="2" data-eit-mb="0" data-eit-color="text-soft">
              Sin avatar
            </p>
          </div>
        </div>
      </template>
    </DialogComponent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreChatbot } from '@/stores'
import type { Chatbot, Pregunta } from '@/interfaces'
import type { SelectOption, DialogExpose } from 'uikit-3it-vue'
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
const mensajeError = ref('')
const modalPreguntaAbierto = ref(false)
const preguntaEnEdicion = ref<Pregunta | null>(null)
const indicePreguntaEnEdicion = ref<number | null>(null)

// Refs para componentes
const dialogAvatarRef = ref<DialogExpose | null>(null)
const preguntaFormRef = ref<{ limpiarFormulario: () => void } | null>(null)

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

// Función para limpiar el formulario principal
function limpiarFormularioPrincipal() {
  formData.value = { ...initialChatbot }
  selectedCategoria.value = null
  pasoActual.value = 0
  formError.value = false
}

// Cargar chatbot si estamos editando, limpiar si es nuevo
onMounted(async () => {
  if (esEdicion.value) {
    try {
      await store.getChatbotForm(Number(route.params.id))
      if (store.chatbot) {
        formData.value = { 
          ...store.chatbot,
          preguntas: store.chatbot.preguntas || []
        }
        selectedCategoria.value = categorias.find(c => String(c.id) === store.chatbot?.categoria) || null
        console.log('Chatbot cargado para edición:', formData.value)
        console.log('Preguntas cargadas:', formData.value.preguntas)
      }
    } catch (error) {
      console.error('Error al cargar chatbot:', error)
    }
  } else {
    // Nuevo chatbot - asegurar que esté limpio
    limpiarFormularioPrincipal()
  }
})

// Watch para actualizar categoria
watch(selectedCategoria, (newVal) => {
  if (newVal) {
    formData.value.categoria = String(newVal.id)
  }
})

// Watch para limpiar cuando cambie de edición a nuevo
watch(() => route.params.id, (newId, oldId) => {
  // Si cambia de tener ID a no tener ID (de edición a nuevo)
  if (oldId && !newId) {
    limpiarFormularioPrincipal()
  }
})

// Seleccionar avatar
function abrirModalAvatar() {
  setTimeout(() => dialogAvatarRef.value?.showDialog(), 100)
}

function cerrarModalAvatar() {
  dialogAvatarRef.value?.closeDialog()
}

function seleccionarAvatar(avatarUrl: string) {
  formData.value.avatar_url = avatarUrl
  cerrarModalAvatar()
}

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
    // El watch en PreguntaFormComponent limpiará automáticamente el formulario
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
    mensajeError.value = ''  // Limpiar error anterior

    console.log('🔍 DIAGNÓSTICO - formData completo:', JSON.parse(JSON.stringify(formData.value)))
    console.log('🔍 DIAGNÓSTICO - Preguntas en formData:', formData.value.preguntas)
    console.log('🔍 DIAGNÓSTICO - Cantidad de preguntas:', formData.value.preguntas?.length)

    // Validar campos requeridos
    if (!formData.value.nombre_asistente || !formData.value.nombre || !formData.value.email_reclutador) {
      formError.value = true
      mensajeError.value = 'Por favor completa todos los campos requeridos'
      return
    }

    if (!formData.value.preguntas || formData.value.preguntas.length === 0) {
      mensajeError.value = 'Debes agregar al menos una pregunta'
      return
    }

    console.log('📤 Enviando al backend:', formData.value)

    if (esEdicion.value && formData.value.id) {
      await store.mutationUpdateChatbot(formData.value.id, formData.value)
    } else {
      await store.mutationCreateChatbot(formData.value)
    }

    // Redirigir a la lista de chatbots
    router.push('/')
  } catch (error: any) {
    console.error('Error al guardar chatbot:', error)

    // Extraer el mensaje específico del backend
    if (error?.response?.data?.message) {
      // Mensaje del backend (ej: "Ya existe un chatbot con ese nombre")
      mensajeError.value = error.response.data.message
    } else if (error?.response?.data?.error) {
      // Formato alternativo del backend
      mensajeError.value = error.response.data.error
    } else if (error?.message) {
      // Error genérico de Axios o red
      mensajeError.value = `Error: ${error.message}`
    } else {
      // Fallback
      mensajeError.value = 'Error al guardar el chatbot. Por favor intenta de nuevo.'
    }

    // Scroll al inicio para que vea el error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
