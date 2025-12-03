# API de Invitaciones - Documentación Postman

## Endpoints de Invitaciones

### 1. Enviar Invitaciones por Email

**Endpoint:** `POST /api/config/:id/invitar`

**Descripción:** Envía invitaciones por email a uno o varios candidatos. Crea una sesión única para cada candidato y envía un link personalizado.

**Parámetros de URL:**
- `id` (number): ID del chatbot

**Body (JSON):**
```json
{
  "emails": [
    "candidato1@example.com",
    "candidato2@example.com",
    "candidato3@example.com"
  ]
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "3 de 3 invitaciones enviadas",
  "enviados": 3,
  "fallidos": 0,
  "resultados": [
    {
      "email": "candidato1@example.com",
      "sesionId": 1,
      "enviado": true,
      "messageId": "<abc123@gmail.com>"
    },
    {
      "email": "candidato2@example.com",
      "sesionId": 2,
      "enviado": true,
      "messageId": "<def456@gmail.com>"
    },
    {
      "email": "candidato3@example.com",
      "sesionId": 3,
      "enviado": true,
      "messageId": "<ghi789@gmail.com>"
    }
  ]
}
```

**Respuesta con Errores Parciales (200):**
```json
{
  "success": false,
  "message": "2 de 3 invitaciones enviadas",
  "enviados": 2,
  "fallidos": 1,
  "resultados": [
    {
      "email": "candidato1@example.com",
      "sesionId": 1,
      "enviado": true,
      "messageId": "<abc123@gmail.com>"
    },
    {
      "email": "candidato2@example.com",
      "sesionId": 2,
      "enviado": true,
      "messageId": "<def456@gmail.com>"
    }
  ],
  "errores": [
    {
      "email": "candidato3@example.com",
      "error": "Invalid login: 535-5.7.8 Username and Password not accepted"
    }
  ]
}
```

**Errores:**

- **400 Bad Request** - Array de emails vacío o inválido
```json
{
  "success": false,
  "message": "Se requiere un array de emails"
}
```

- **400 Bad Request** - Emails con formato inválido
```json
{
  "success": false,
  "message": "Algunos emails tienen formato inválido",
  "emailsInvalidos": ["email-invalido", "otro@"]
}
```

- **404 Not Found** - Chatbot no encontrado
```json
{
  "success": false,
  "message": "Chatbot no encontrado"
}
```

- **400 Bad Request** - Chatbot inactivo
```json
{
  "success": false,
  "message": "El chatbot no está activo"
}
```

- **400 Bad Request** - Sin configuración SMTP
```json
{
  "success": false,
  "message": "El chatbot no tiene configuración SMTP"
}
```

---

### 2. Verificar Configuración SMTP

**Endpoint:** `POST /api/config/:id/verificar-smtp`

**Descripción:** Verifica que la configuración SMTP del chatbot sea válida y pueda conectarse al servidor de correo.

**Parámetros de URL:**
- `id` (number): ID del chatbot

**Body:** No requiere

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Configuración SMTP válida"
}
```

**Respuesta con Error (200):**
```json
{
  "success": false,
  "message": "Invalid login: 535-5.7.8 Username and Password not accepted"
}
```

**Errores:**

- **404 Not Found** - Chatbot no encontrado
```json
{
  "success": false,
  "message": "Chatbot no encontrado"
}
```

- **400 Bad Request** - Sin configuración SMTP
```json
{
  "success": false,
  "message": "El chatbot no tiene configuración SMTP"
}
```

---

## Ejemplos de Uso en Postman

### Ejemplo 1: Enviar invitación a un solo candidato

```
POST http://localhost:4000/api/config/1/invitar
Content-Type: application/json

{
  "emails": ["candidato@example.com"]
}
```

### Ejemplo 2: Enviar invitaciones a múltiples candidatos

```
POST http://localhost:4000/api/config/1/invitar
Content-Type: application/json

{
  "emails": [
    "candidato1@example.com",
    "candidato2@example.com",
    "candidato3@example.com",
    "candidato4@example.com",
    "candidato5@example.com"
  ]
}
```

### Ejemplo 3: Verificar configuración SMTP antes de enviar

```
POST http://localhost:4000/api/config/1/verificar-smtp
```

---

## Notas Importantes

### Configuración SMTP del Chatbot

Para que el envío de emails funcione, el chatbot debe tener configurado el campo `smtp_config` con la siguiente estructura:

```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "tu-email@gmail.com",
  "pass": "tu-contraseña-de-aplicacion"
}
```

### Gmail - Contraseña de Aplicación

Si usas Gmail, necesitas generar una "Contraseña de aplicación":

1. Ve a tu cuenta de Google
2. Seguridad → Verificación en dos pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en el campo `pass` de la configuración SMTP

### Formato del Email Enviado

El email que reciben los candidatos incluye:

- **Asunto:** "Invitación: [Nombre del Chatbot]"
- **Remitente:** "[Nombre del Asistente]" <email_reclutador>
- **Contenido:**
  - Nombre y descripción del chatbot
  - Detalles de la evaluación (asistente, vigencia, tiempo estimado)
  - Botón con link único a la sesión
  - Link alternativo en texto plano
  - Email de contacto del reclutador

### Link de Sesión

El link generado tiene el formato:
```
http://localhost:5173/chat/{sesionId}
```

Donde `{sesionId}` es el ID único de la sesión creada para ese candidato.

### Variables de Entorno Requeridas

Asegúrate de tener configurada la variable en `.env`:

```env
FRONTEND_URL=http://localhost:5173
```

Esta URL se usa para generar los links en los emails.

---

## Flujo Completo de Invitación

1. **Crear/Configurar Chatbot** con preguntas y configuración SMTP
2. **Verificar SMTP** (opcional pero recomendado)
3. **Enviar Invitaciones** con lista de emails
4. **Sistema crea sesiones** automáticamente para cada candidato
5. **Emails enviados** con links únicos
6. **Candidatos acceden** al link y completan la evaluación

---

## Testing

### Test 1: Verificar SMTP
```bash
curl -X POST http://localhost:4000/api/config/1/verificar-smtp
```

### Test 2: Enviar invitación de prueba
```bash
curl -X POST http://localhost:4000/api/config/1/invitar \
  -H "Content-Type: application/json" \
  -d '{"emails": ["tu-email@example.com"]}'
```

### Test 3: Enviar múltiples invitaciones
```bash
curl -X POST http://localhost:4000/api/config/1/invitar \
  -H "Content-Type: application/json" \
  -d '{"emails": ["email1@example.com", "email2@example.com", "email3@example.com"]}'
```
