# 🤖 ChatBot Screening 3IT

Sistema de chatbot conversacional para screening automatizado de candidatos en procesos de reclutamiento.

## 📋 Descripción

Plataforma que automatiza el proceso de evaluación inicial de candidatos mediante:
- Chatbot conversacional con preguntas configurables
- Evaluación automática con reglas personalizables
- Sistema de puntajes y resultados (APROBADO/CONSIDERAR/RECHAZADO)
- Notificaciones por email con reportes en PDF
- Panel de administración para reclutadores

**Objetivo**: Automatizar el 90% del trabajo de screening inicial.

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend**: Vue.js 3 + TypeScript + Pinia  
**Backend**: Node.js + Express + MySQL 8.4.6  
**Emails**: Nodemailer  
**PDFs**: PDFKit

### Estructura

```
Frontend (Vue 3) → Backend (Node.js) → MySQL
```

---

## 🚀 Instalación

### 1. Base de Datos

```bash
mysql -u root -p
CREATE DATABASE chatbot_screening;
exit;

cd backend
node database/runSchema.js
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 3. Frontend

```bash
cd Frontend
npm install
cp .env.example .env
# Editar .env
npm run dev
```

---

## 📖 Uso

### Reclutadores
1. Crear chatbot y configurar preguntas
2. Enviar invitaciones a candidatos
3. Revisar resultados y reportes

### Candidatos
1. Recibir email con link único
2. Completar evaluación
3. Recibir resultado inmediato

---

## 🎯 Funcionalidades

### Resultados
- ✅ **APROBADO**: 100% correcto
- ⚠️ **CONSIDERAR**: Alcanza umbral pero reprueba preguntas no eliminatorias
- ❌ **RECHAZADO**: Reprueba eliminatoria o no alcanza umbral

### Emails Automáticos
- Invitación con link único
- Resultado al candidato
- Reporte al reclutador (con PDF)

---

## 🧪 Testing

Ver: **[DOCUMENTACION_TESTING.md](./DOCUMENTACION_TESTING.md)**

```bash
npm test                # Ejecutar tests
npm run test:coverage   # Con cobertura
```

---

## 📊 Base de Datos

Ver: **[ESTRUCTURA_DE_DATOS.md](./ESTRUCTURA_DE_DATOS.md)**

Tablas principales:
- `cb_config` - Chatbots
- `cb_preguntas` - Preguntas
- `cb_sesiones` - Evaluaciones
- `cb_evaluaciones` - Resultados

---

## 📞 Soporte

**Equipo**: 3IT Ingeniería y Desarrollo  
**Email**: ro.saezp@duocuc.cl

---

**Versión**: 1.0.0 | **Última actualización**: Diciembre 2025
