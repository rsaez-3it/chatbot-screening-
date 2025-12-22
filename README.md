# 🤖 ChatBot Screening 3IT

> Sistema de chatbot conversacional para screening automatizado de candidatos en procesos de reclutamiento.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-8.4.6-blue)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/vulnerabilities-0-success)](https://www.npmjs.com/)

---

## 📋 Descripción

Plataforma que automatiza el proceso de evaluación inicial de candidatos mediante:

- ✅ Chatbot conversacional con preguntas configurables
- 🎯 Evaluación automática con reglas personalizables
- 📊 Sistema de puntajes y resultados (APROBADO/CONSIDERAR/RECHAZADO)
- 📧 Notificaciones por email con reportes en PDF
- 🛡️ Panel de administración para reclutadores

**Objetivo**: Automatizar el 90% del trabajo de screening inicial, reduciendo tiempo y costos de reclutamiento.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Vue.js 3 + TypeScript + Pinia |
| **Backend** | Node.js 20 + Express 5.2.1 |
| **Base de Datos** | MySQL 8.4.6 |
| **ORM/Query Builder** | Knex.js 3.1.0 |
| **Emails** | Nodemailer |
| **PDFs** | PDFKit |
| **Seguridad** | Helmet, CORS, Rate Limiting |

**Arquitectura:**
```
Frontend (Vue 3) ←→ Backend API (Node.js) ←→ MySQL
```

---

## ⚙️ Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Node.js** >= 20.0.0 ([Descargar](https://nodejs.org/))
- **MySQL** >= 8.0 ([Descargar](https://dev.mysql.com/downloads/))
- **npm** >= 10.0.0 (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

**Verificar versiones:**
```bash
node --version   # Debe ser >= 20.0.0
mysql --version  # Debe ser >= 8.0
npm --version    # Debe ser >= 10.0.0
```

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/rsaez-3it/chatbot-screening-.git
cd chatbot-screening
```

### 2️⃣ Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE chatbot_screening CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Ejecutar migraciones
cd backend
node database/runSchema.js
```

### 3️⃣ Configurar Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Editar `backend/.env` con tus credenciales:**

⚠️ **IMPORTANTE:** Usa el archivo `.env.example` como plantilla y completa con TUS valores reales.

```bash
# Ver plantilla de ejemplo
cat backend/.env.example

# Copiar y editar con tus credenciales
cp backend/.env.example backend/.env
nano backend/.env  # O usa tu editor favorito
```

**Variables requeridas:** Base de datos, servidor, email, JWT (ver `.env.example` para lista completa)

**Iniciar backend:**
```bash
npm run dev
```

**Debe mostrar:**
```
✓ Servidor escuchando en http://localhost:4000
✓ Conexión a base de datos exitosa
```

### 4️⃣ Configurar Frontend

```bash
cd Frontend
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Editar `Frontend/.env`:**

Configurar la URL del backend (ver `.env.example` para plantilla completa)

**Iniciar frontend:**
```bash
npm run dev
```

**Acceder a:** http://localhost:3000

---

## 📖 Uso

### Para Reclutadores

1. **Configurar chatbot:**
   - Crear chatbot desde el panel de administración
   - Agregar preguntas con reglas de evaluación
   - Configurar umbral de aprobación

2. **Invitar candidatos:**
   - Enviar invitaciones por email con link único
   - Cada candidato recibe acceso individual

3. **Revisar resultados:**
   - Ver evaluaciones en tiempo real
   - Descargar reportes en PDF
   - Recibir notificaciones por email

### Para Candidatos

1. Recibir email con link único de evaluación
2. Completar cuestionario conversacional
3. Recibir resultado inmediato (sin detalles)

**El reclutador recibe un reporte completo con toda la conversación y evaluaciones.**

---

## 🎯 Funcionalidades Principales

### Sistema de Resultados

| Estado | Descripción | Criterio |
|--------|-------------|----------|
| ✅ **APROBADO** | Candidato cumple todos los requisitos | 100% de preguntas correctas |
| ⚠️ **CONSIDERAR** | Cumple umbral pero falla preguntas no críticas | Alcanza umbral (ej: 70%) pero falla no eliminatorias |
| ❌ **RECHAZADO** | No cumple requisitos mínimos | Falla eliminatoria o no alcanza umbral |

### Emails Automáticos

- 📧 **Invitación:** Link único con expiración configurable
- 📄 **Resultado al candidato:** Notificación de finalización (sin puntajes)
- 📊 **Reporte al reclutador:** Email con PDF adjunto (conversación completa + evaluaciones)

### Seguridad

- 🔒 Winston Logger con sanitización de PII (datos personales)
- 🛡️ Helmet para headers HTTP seguros
- 🚦 Rate Limiting anti-DoS (100 req/15min)
- 🔐 Knex.js para prevención de SQL Injection
- ✅ 0 vulnerabilidades detectadas (npm audit)

---

## 🧪 Testing

Ver documentación completa: **[DOCUMENTACION_TESTING.md](./DOCUMENTACION_TESTING.md)**

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

---

## 📊 Base de Datos

Ver estructura completa: **[ESTRUCTURA_DE_DATOS.md](./ESTRUCTURA_DE_DATOS.md)**

**Tablas principales:**

| Tabla | Descripción |
|-------|-------------|
| `cb_config` | Configuraciones de chatbots |
| `cb_preguntas` | Preguntas y reglas de evaluación |
| `cb_sesiones` | Sesiones de candidatos |
| `cb_evaluaciones` | Resultados de evaluaciones |
| `cb_mensajes` | Historial de conversaciones |
| `cb_invitaciones` | Control de invitaciones enviadas |

**Migraciones:**
```bash
cd backend
node database/runSchema.js       # Crear estructura
node database/runSeeds.js        # Datos de prueba (opcional)
```

---

## 🔧 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Modo desarrollo con nodemon |
| `npm start` | Modo producción |
| `npm test` | Ejecutar tests con Jest |
| `npm run test:coverage` | Tests con reporte de cobertura |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build |

---

## 📂 Estructura del Proyecto

```
chatbot-screening/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuraciones (DB, logger, email)
│   │   ├── modules/          # Módulos de negocio
│   │   │   └── chatbot/
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       ├── repositories/  # Knex.js queries
│   │   │       └── routes/
│   │   ├── shared/           # Utilidades compartidas
│   │   └── server.js         # Entry point
│   ├── database/             # Migraciones y seeds
│   ├── scripts/              # Scripts de utilidad
│   │   ├── migrations/
│   │   ├── testing/
│   │   ├── diagnostics/
│   │   └── utils/
│   └── logs/                 # Logs de Winston
│
└── Frontend/
    ├── src/
    │   ├── views/            # Vistas principales
    │   ├── components/       # Componentes reutilizables
    │   ├── stores/           # Pinia stores
    │   ├── services/         # API services
    │   └── router/           # Vue Router
    └── public/               # Assets estáticos
```

---

## 🤝 Contribución

Este es un proyecto privado de 3IT. Para contribuir:

1. Crear branch desde `main`
2. Realizar cambios y commits con mensajes descriptivos
3. Ejecutar tests: `npm test`
4. Crear Pull Request para revisión

**Estándares de código:**
- ESLint configurado
- Commits descriptivos (convencional commits)
- Tests para nuevas funcionalidades


**Repositorio:** https://github.com/rsaez-3it/chatbot-screening-


**Versión:** 1.0.0
**Última actualización:** Diciembre 2025
**Estado:** ✅ Production-Ready

