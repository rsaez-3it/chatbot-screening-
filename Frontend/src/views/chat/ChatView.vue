<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const sesionId = route.params.id as string

// State
const loading = ref(true)
const sesion = ref<any>(null)
const chatbot = ref<any>(null)
const preguntas = ref<any[]>([])
const mensajes = ref<any[]>([])
const preguntaActual = ref(0)
const respuestaActual = ref('')
const enviando = ref(false)
const finalizado = ref(false)
const error = ref('')

// Computed
const preguntaActiva = computed(() => preguntas.value[preguntaActual.value])
const progreso = computed(() => {
  if (preguntas.value.length === 0) return 0
  return Math.round((preguntaActual.value / preguntas.value.length) * 100)
})

// Cargar sesión y chatbot
onMounted(async () => {
  try {
    loading.value = true
    
    // Obtener sesión por token (el sesionId es el token)
    const resSesion = await axios.get(`http://localhost:4000/api/sesiones/${sesionId}`)
    sesion.value = resSesion.data.data
    
    // Obtener chatbot con preguntas
    const resChatbot = await axios.get(`http://localhost:4000/api/config/${sesion.value.config_id}`)
    chatbot.value = resChatbot.data.data
    preguntas.value = resChatbot.data.data.preguntas || []
    
    // Iniciar la sesión (cambiar estado a "en_progreso")
    // Ignorar error si ya está iniciada o completada
    try {
      await axios.post(`http://localhost:4000/api/sesiones/${sesionId}/iniciar`)
    } catch (err: any) {
      // Ignorar si ya está iniciada o completada
      if (!err.response?.data?.message?.includes('ya ha sido')) {
        throw err
      }
    }
    
    // Secuencia de mensajes de bienvenida
    setTimeout(() => {
      // 1. Saludo del asistente
      mensajes.value.push({
        tipo: 'asistente',
        contenido: `¡Hola! Soy ${chatbot.value.nombre_asistente}, tu asistente virtual 👋`,
        timestamp: new Date()
      })
      scrollToBottom()
    }, 500)
    
    setTimeout(() => {
      // 2. Mensaje de bienvenida personalizado
      mensajes.value.push({
        tipo: 'asistente',
        contenido: chatbot.value.mensaje_bienvenida,
        timestamp: new Date()
      })
      scrollToBottom()
    }, 1500)
    
    setTimeout(() => {
      // 3. Instrucciones
      mensajes.value.push({
        tipo: 'asistente',
        contenido: `Te haré ${preguntas.value.length} preguntas. Tómate tu tiempo para responder cada una. ¿Listo para comenzar? 🚀`,
        timestamp: new Date()
      })
      scrollToBottom()
    }, 2500)
    
    // 4. Primera pregunta
    if (preguntas.value.length > 0) {
      setTimeout(() => {
        mensajes.value.push({
          tipo: 'asistente',
          contenido: preguntas.value[0].pregunta,
          timestamp: new Date()
        })
        scrollToBottom()
      }, 3500)
    }
    
    loading.value = false
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar la sesión'
    loading.value = false
  }
})

// Auto-scroll al último mensaje
function scrollToBottom() {
  setTimeout(() => {
    const container = document.querySelector('[data-scroll-container]')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, 100)
}

// Enviar respuesta
async function enviarRespuesta() {
  if (!respuestaActual.value.trim() || enviando.value) return
  
  try {
    enviando.value = true
    
    // Agregar respuesta del candidato a los mensajes
    mensajes.value.push({
      tipo: 'candidato',
      contenido: respuestaActual.value,
      timestamp: new Date()
    })
    
    scrollToBottom()
    
    // Guardar respuesta en el backend
    await axios.post('http://localhost:4000/api/mensajes', {
      sesion_id: sesion.value.id,
      pregunta_id: preguntaActiva.value.id,
      tipo: 'respuesta',
      contenido: respuestaActual.value
    })
    
    // Limpiar input INMEDIATAMENTE
    respuestaActual.value = ''
    
    // Pasar a la siguiente pregunta
    preguntaActual.value++
    
    // Si hay más preguntas, mostrarla
    if (preguntaActual.value < preguntas.value.length) {
      setTimeout(() => {
        mensajes.value.push({
          tipo: 'asistente',
          contenido: `Pregunta ${preguntaActual.value + 1} de ${preguntas.value.length}:`,
          timestamp: new Date()
        })
        scrollToBottom()
      }, 800)
      
      setTimeout(() => {
        mensajes.value.push({
          tipo: 'asistente',
          contenido: preguntas.value[preguntaActual.value].pregunta,
          timestamp: new Date()
        })
        scrollToBottom()
      }, 1500)
    } else {
      // Finalizar evaluación
      setTimeout(() => {
        mensajes.value.push({
          tipo: 'asistente',
          contenido: '¡Excelente! Has completado todas las preguntas 🎉',
          timestamp: new Date()
        })
        scrollToBottom()
      }, 800)
      
      setTimeout(async () => {
        mensajes.value.push({
          tipo: 'asistente',
          contenido: chatbot.value.mensaje_finalizacion || 'Gracias por tu tiempo. Hemos recibido tus respuestas y las revisaremos pronto.',
          timestamp: new Date()
        })
        scrollToBottom()
        
        // Finalizar la evaluación (esto envía el email al reclutador automáticamente)
        try {
          await axios.post(`http://localhost:4000/api/sesiones/${sesionId}/finalizar`)
          console.log('✅ Evaluación finalizada correctamente')
        } catch (finalizarError: any) {
          console.error('❌ Error al finalizar evaluación:', finalizarError)
          // Mostrar error al usuario pero no bloquear
          mensajes.value.push({
            tipo: 'asistente',
            contenido: '⚠️ Hubo un problema al procesar tu evaluación. Por favor contacta al reclutador.',
            timestamp: new Date()
          })
          scrollToBottom()
        }
        
        finalizado.value = true
      }, 1800)
    }
    
    enviando.value = false
  } catch (err: any) {
    error.value = 'Error al enviar la respuesta'
    enviando.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<template>
  <div :style="`min-height: 100vh; background: ${chatbot?.color_fondo || '#ffffff'};`">
    
    <!-- Loading -->
    <div v-if="loading" data-eit-p="5" data-eit-text-align="center">
      <p data-eit-color="text-soft" data-eit-font-size="x4">Cargando evaluación...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" data-eit-p="5" data-eit-text-align="center">
      <AlertComponent
        data-eit-variant="danger"
        icon="fa-solid fa-exclamation-triangle"
        :message="error"
      />
    </div>

    <!-- Chat -->
    <div v-else data-eit-display="flex" data-eit-flex-direction="column" style="height: 100vh;">
      
      <!-- Header -->
      <div 
        data-eit-p="4"
        data-eit-bg="white"
        data-eit-border="bottom"
        data-eit-border-color="default"
      >
        <div style="max-width: 900px; margin: 0 auto;">
          <div data-eit-display="flex" data-eit-align="center" data-eit-gap="3" data-eit-mb="3">
            <!-- Avatar grande del asistente -->
            <div 
              v-if="chatbot.avatar_url"
              style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            >
              <img 
                :src="chatbot.avatar_url" 
                :alt="chatbot.nombre_asistente"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
            </div>
            <div 
              v-else
              :style="`background: ${chatbot.color_botones || '#3b82f6'}; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`"
            >
              <font-awesome-icon 
                icon="fa-solid fa-robot"
                data-eit-color="white"
                data-eit-font-size="x5"
              />
            </div>
            
            <div>
              <h2 data-eit-font-size="x5" data-eit-mt="0" data-eit-mb="1" data-eit-color="text" data-eit-font-weight="700">
                {{ chatbot.nombre }}
              </h2>
              <p data-eit-font-size="x2" data-eit-color="text-soft" data-eit-mb="0">
                con {{ chatbot.nombre_asistente }}
              </p>
            </div>
          </div>
          
          <!-- Barra de progreso -->
          <div data-eit-mb="2">
            <div style="background: #e5e7eb; height: 6px; border-radius: 10px; overflow: hidden;">
              <div 
                :style="`width: ${progreso}%; background: ${chatbot.color_botones || '#3b82f6'}; height: 100%; transition: width 0.5s ease;`"
              ></div>
            </div>
          </div>
          
          <div data-eit-display="flex" data-eit-justify="space-between" data-eit-align="center">
            <p data-eit-font-size="x2" data-eit-color="text-soft" data-eit-mb="0">
              Pregunta {{ preguntaActual + 1 }} de {{ preguntas.length }}
            </p>
            <p data-eit-font-size="x2" data-eit-color="text-soft" data-eit-mb="0">
              {{ progreso }}% completado
            </p>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div 
        data-scroll-container
        data-eit-p="4"
        style="flex: 1; overflow-y: auto; max-width: 900px; width: 100%; margin: 0 auto; padding-bottom: 20px; scroll-behavior: smooth;"
      >
        <div 
          v-for="(mensaje, index) in mensajes"
          :key="index"
          data-eit-mb="4"
          style="animation: fadeIn 0.3s ease-in;"
        >
          <!-- Mensaje del asistente (izquierda con avatar) -->
          <div 
            v-if="mensaje.tipo === 'asistente'"
            data-eit-display="flex"
            data-eit-align="start"
            data-eit-gap="3"
          >
            <!-- Avatar -->
            <div 
              v-if="chatbot.avatar_url"
              style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            >
              <img 
                :src="chatbot.avatar_url" 
                :alt="chatbot.nombre_asistente"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
            </div>
            <div 
              v-else
              :style="`background: ${chatbot.color_botones || '#3b82f6'}; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`"
            >
              <font-awesome-icon 
                icon="fa-solid fa-robot"
                data-eit-color="white"
                data-eit-font-size="x4"
              />
            </div>
            
            <!-- Mensaje -->
            <div style="flex: 1; max-width: 65%;">
              <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mb="1" data-eit-font-weight="600">
                {{ chatbot.nombre_asistente }}
              </p>
              <div 
                data-eit-p="3"
                data-eit-font-size="x3"
                :style="`background: ${chatbot.color_conversacion || '#ffffff'}; color: #1f2937; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);`"
              >
                {{ mensaje.contenido }}
              </div>
            </div>
          </div>

          <!-- Mensaje del candidato (derecha sin avatar) -->
          <div 
            v-else
            data-eit-display="flex"
            data-eit-justify="end"
          >
            <div style="max-width: 65%;">
              <p data-eit-font-size="x1" data-eit-color="text-soft" data-eit-mb="1" data-eit-font-weight="600" data-eit-text-align="right">
                Tú
              </p>
              <div 
                data-eit-p="3"
                data-eit-font-size="x3"
                :style="`background: ${chatbot.color_botones || '#3b82f6'}; color: white; border-radius: 18px 18px 4px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);`"
              >
                {{ mensaje.contenido }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div 
        v-if="!finalizado"
        data-eit-p="4"
        data-eit-bg="white"
        data-eit-border="top"
        data-eit-border-color="default"
      >
        <div style="max-width: 900px; margin: 0 auto;" data-eit-display="flex" data-eit-gap="3" data-eit-align="end">
          <div style="flex: 1;">
            <InputComponent
              :key="preguntaActual"
              inputType="text"
              placeHolder="Escribe tu respuesta aquí..."
              :input="respuestaActual"
              @emitValue="respuestaActual = $event"
              @keyup.enter="enviarRespuesta"
            />
          </div>
          <ButtonComponent
            icon="fa-solid fa-paper-plane"
            :loading="enviando"
            :disabled="!respuestaActual.trim() || enviando"
            @emitEvent="enviarRespuesta"
            :style="`background: ${chatbot.color_botones || '#3b82f6'}; border: none;`"
          />
        </div>
      </div>

      <!-- Finalizado -->
      <div 
        v-else
        data-eit-p="5"
        data-eit-text-align="center"
        data-eit-bg="white"
        data-eit-border="top"
        data-eit-border-color="default"
      >
        <div style="max-width: 500px; margin: 0 auto;">
          <div 
            :style="`width: 80px; height: 80px; margin: 0 auto 20px; background: ${chatbot.color_botones || '#3b82f6'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15);`"
          >
            <font-awesome-icon 
              icon="fa-solid fa-check" 
              data-eit-color="white"
              style="font-size: 40px;"
            />
          </div>
          <h3 data-eit-color="text" data-eit-font-size="x6" data-eit-mb="2" data-eit-font-weight="700">
            ¡Evaluación Completada!
          </h3>
          <p data-eit-color="text-soft" data-eit-font-size="x3" data-eit-mb="0">
            Gracias por tu tiempo. Hemos recibido tus respuestas.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
