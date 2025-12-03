# Guía de Uso - Sistema de Invitaciones por Email

## Descripción General

El sistema de invitaciones permite enviar emails automáticos a candidatos con un link único para completar la evaluación del chatbot.

## Características

✅ **Envío masivo de invitaciones** - Envía a múltiples candidatos a la vez
✅ **Validación de emails** - Verifica formato antes de enviar
✅ **Sesiones únicas** - Cada candidato recibe un link personalizado
✅ **Contador en tiempo real** - Muestra emails válidos e inválidos
✅ **Feedback visual** - Indicadores de estado y errores
✅ **Diseño minimalista** - Siguiendo el UIKit 3IT

---

## Cómo Usar

### 1. Configurar el Chatbot

Antes de enviar invitaciones, asegúrate de que el chatbot tenga:

- ✅ Nombre y descripción
- ✅ Preguntas configuradas
- ✅ Email del reclutador
- ✅ Configuración SMTP válida

**Configuración SMTP:**
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "tu-email@gmail.com",
  "pass": "contraseña-de-aplicacion"
}
```

### 2. Acceder a la Lista de Chatbots

Navega a la vista de "Chatbots Creados" donde verás todos tus chatbots en formato de cards.

### 3. Abrir el Modal de Invitaciones

En cada card de chatbot, haz clic en el botón verde **"Invitar"** con el ícono de avión de papel.

### 4. Ingresar Emails de Candidatos

En el modal que se abre, ingresa los emails de los candidatos. Puedes usar cualquiera de estos formatos:

**Separados por comas:**
```
candidato1@example.com, candidato2@example.com, candidato3@example.com
```

**Separados por espacios:**
```
candidato1@example.com candidato2@example.com candidato3@example.com
```

**Uno por línea:**
```
candidato1@example.com
candidato2@example.com
candidato3@example.com
```

**Combinación:**
```
candidato1@example.com, candidato2@example.com
candidato3@example.com candidato4@example.com
candidato5@example.com
```

### 5. Validación Automática

El sistema valida automáticamente los emails mientras escribes:

- **Contador Total:** Muestra cuántos emails detectó
- **Contador Válidos:** Emails con formato correcto (verde)
- **Contador Inválidos:** Emails con formato incorrecto (rojo)

Si hay emails inválidos, se muestra una alerta con la lista de emails problemáticos.

### 6. Enviar Invitaciones

Haz clic en el botón **"Enviar Invitaciones"**. El botón estará:

- ✅ **Habilitado:** Si hay al menos un email válido y ninguno inválido
- ❌ **Deshabilitado:** Si no hay emails, o hay emails inválidos

### 7. Confirmación

Después del envío, recibirás un mensaje indicando:

- ✅ **Éxito total:** "✅ X invitación(es) enviada(s) exitosamente"
- ⚠️ **Éxito parcial:** "⚠️ X enviados, Y fallidos"
- ❌ **Error:** Mensaje de error específico

---

## Componentes del Sistema

### Vista: ChatbotListView.vue

**Ubicación:** `Frontend/src/views/chatbot/ChatbotListView.vue`

**Funcionalidad:**
- Muestra lista de chatbots en cards
- Botón "Invitar" en cada card
- Maneja el dialog de invitaciones
- Procesa el envío y muestra resultados

### Componente: InvitacionDialogComponent.vue

**Ubicación:** `Frontend/src/components/chatbot/InvitacionDialogComponent.vue`

**Props:**
- `chatbotId` (number): ID del chatbot
- `chatbotNombre` (string): Nombre del chatbot
- `loading` (boolean): Estado de carga

**Emits:**
- `enviar` (emails: string[]): Emite cuando se envían invitaciones
- `cerrar`: Emite cuando se cierra el modal

**Características:**
- Textarea para ingresar emails
- Validación en tiempo real
- Contadores visuales
- Alertas de error
- Botones de acción

### Store: chatbot.store.ts

**Nuevas Acciones:**

```typescript
// Enviar invitaciones
mutationEnviarInvitaciones(id: number, emails: string[])

// Verificar configuración SMTP
verificarSMTP(id: number)
```

### Service: chatbot.service.ts

**Nuevos Métodos:**

```typescript
// Enviar invitaciones por email
enviarInvitaciones(id: number, emails: string[])

// Verificar configuración SMTP
verificarSMTP(id: number)
```

---

## Estructura del Email Enviado

Los candidatos reciben un email con:

### Asunto
```
Invitación: [Nombre del Chatbot]
```

### Remitente
```
"[Nombre del Asistente]" <email_reclutador>
```

### Contenido

1. **Header:** Título del chatbot con emoji 🤖
2. **Descripción:** Texto descriptivo del chatbot
3. **Detalles:**
   - Nombre del asistente
   - Vigencia en días
   - Tiempo estimado
4. **Botón de Acción:** Link único a la sesión
5. **Link Alternativo:** URL en texto plano
6. **Footer:** Email de contacto del reclutador

### Ejemplo Visual

```
🤖 Evaluación de Desarrollador Frontend

Has sido invitado a participar en una evaluación

Hola,

Te invitamos a completar una evaluación mediante nuestro 
asistente virtual para el puesto de Desarrollador Frontend.

📋 Detalles de la evaluación:
Asistente: Ana Reclutadora
Vigencia: 7 días desde el inicio
Tiempo estimado: 10-15 minutos

[Botón: Iniciar Evaluación]

O copia y pega este enlace en tu navegador:
http://localhost:5173/chat/123

---
Este es un email automático, por favor no respondas.
Si tienes dudas, contacta a: ana@empresa.com
```

---

## Flujo Técnico

### 1. Usuario hace clic en "Invitar"
```typescript
function abrirDialogInvitacion(chatbot: Chatbot) {
  chatbotSeleccionado.value = chatbot
  showDialogInvitacion.value = true
}
```

### 2. Usuario ingresa emails y hace clic en "Enviar"
```typescript
async function enviarInvitaciones(emails: string[]) {
  const resultado = await store.mutationEnviarInvitaciones(
    chatbotSeleccionado.value.id, 
    emails
  )
  // Mostrar resultado
}
```

### 3. Store llama al servicio
```typescript
const mutationEnviarInvitaciones = async (id: number, emails: string[]) => {
  const result = await chatbotService.enviarInvitaciones(id, emails)
  return result
}
```

### 4. Servicio hace petición HTTP
```typescript
async enviarInvitaciones(id: number, emails: string[]) {
  const response = await axiosInstance.post(
    `/config/${id}/invitar`, 
    { emails }
  )
  return response.data
}
```

### 5. Backend procesa
- Valida emails
- Verifica chatbot activo
- Verifica configuración SMTP
- Crea sesión para cada candidato
- Genera link único
- Envía email con nodemailer
- Retorna resultados

---

## Manejo de Errores

### Errores de Validación (Frontend)

**Sin emails:**
```
"Debes ingresar al menos un email"
```

**Emails inválidos:**
```
"Hay X email(s) con formato inválido"
```

### Errores del Backend

**Chatbot no encontrado:**
```
"Chatbot no encontrado"
```

**Chatbot inactivo:**
```
"El chatbot no está activo"
```

**Sin configuración SMTP:**
```
"El chatbot no tiene configuración SMTP"
```

**Sin email de reclutador:**
```
"El chatbot no tiene email de reclutador configurado"
```

**Error de SMTP:**
```
"Invalid login: 535-5.7.8 Username and Password not accepted"
```

---

## Estilos y UIKit

El componente sigue estrictamente las reglas del UIKit 3IT:

### Colores Minimalistas
- Fondo azul claro para instrucciones: `#f0f7ff`
- Fondo verde claro para válidos: `#f0fdf4`
- Fondo rojo claro para inválidos: `#fef2f2`

### Atributos UIKit Usados
- `data-eit-border`
- `data-eit-border-color`
- `data-eit-border-radius`
- `data-eit-p` (padding)
- `data-eit-mb` (margin-bottom)
- `data-eit-display`
- `data-eit-gap`
- `data-eit-font-size`
- `data-eit-color`
- `data-eit-font-weight`

### Componentes UIKit
- `ButtonComponent`
- `AlertComponent`
- `DialogComponent`

---

## Testing

### Test Manual - Frontend

1. Crear un chatbot con configuración SMTP válida
2. Ir a la lista de chatbots
3. Hacer clic en "Invitar"
4. Probar diferentes formatos de emails:
   - Un solo email
   - Múltiples emails separados por comas
   - Emails con saltos de línea
   - Mezcla de válidos e inválidos
5. Verificar contadores en tiempo real
6. Enviar invitaciones
7. Verificar mensaje de confirmación

### Test de Validación

**Emails válidos:**
- `test@example.com` ✅
- `user.name@domain.co` ✅
- `user+tag@example.com` ✅

**Emails inválidos:**
- `test@` ❌
- `@example.com` ❌
- `test` ❌
- `test @example.com` ❌

---

## Troubleshooting

### Problema: Botón "Enviar" deshabilitado

**Causas posibles:**
- Hay emails con formato inválido
- No hay emails ingresados
- El sistema está enviando (loading)

**Solución:**
- Corregir emails inválidos
- Ingresar al menos un email válido

### Problema: Error "Sin configuración SMTP"

**Causa:** El chatbot no tiene configurado el campo `smtp_config`

**Solución:**
1. Editar el chatbot
2. Agregar configuración SMTP en el formulario
3. Guardar cambios

### Problema: Error "Invalid login"

**Causa:** Credenciales SMTP incorrectas

**Solución para Gmail:**
1. Activar verificación en dos pasos
2. Generar contraseña de aplicación
3. Usar esa contraseña en la configuración SMTP

### Problema: Emails no llegan

**Causas posibles:**
- Configuración SMTP incorrecta
- Email en spam
- Servidor SMTP bloqueado

**Solución:**
1. Verificar configuración SMTP con el endpoint de verificación
2. Revisar carpeta de spam
3. Verificar logs del backend

---

## Próximos Pasos

Después de enviar invitaciones, los candidatos:

1. Reciben el email con el link único
2. Hacen clic en el link
3. Son redirigidos a `/chat/{sesionId}`
4. Completan la evaluación interactiva
5. El sistema guarda sus respuestas
6. Se calcula el resultado automáticamente

El reclutador puede ver los resultados en la sección de sesiones del chatbot.
