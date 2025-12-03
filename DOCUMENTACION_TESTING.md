# Documentación Completa de Testing - ChatBot Screening 3IT

**Versión**: 1.0  
**Fecha**: 2 de Diciembre 2025  
**Sistema**: ChatBot Screening 3IT

---

## 📋 Índice

1. [Estado Actual](#estado-actual)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Tests Unitarios](#tests-unitarios)
4. [Tests de Integración](#tests-de-integración)
5. [Pruebas Manuales](#pruebas-manuales)
6. [Configuración](#configuración)
7. [Ejecución](#ejecución)
8. [Plan de Acción](#plan-de-acción)

---

## 📊 Estado Actual

### Resumen General

| Tipo de Test | Implementados | Pasando | Cobertura | Estado |
|--------------|---------------|---------|-----------|--------|
| **Tests Unitarios** | 14 | 14 (100%) | 75% (ScoringService) | ✅ |
| **Tests Integración** | 0 | - | - | ⏳ Pendiente |
| **Pruebas Manuales** | 1/8 | 1 (100%) | - | 🔄 En progreso |
| **Tests E2E** | 0 | - | - | ⏳ Pendiente |

**Cobertura Global**: 1.54% (Objetivo: 70%)

### Última Actualización
- **Fecha**: 2 de Diciembre 2025, 17:45
- **Última prueba**: PRUEBA MANUAL 1 - Configuración ✅
- **Último test unitario**: ScoringService (14 tests) ✅

---

## 🎯 Estrategia de Testing

### Pirámide de Testing

```
           /\
          /E2E\          ← Tests E2E (10%) - 0 implementados
         /------\
        /  Int.  \       ← Tests Integración (30%) - 0 implementados
       /----------\
      /  Unitarios \     ← Tests Unitarios (60%) - 14 implementados
     /--------------\
```

### Distribución Objetivo

- **60% Tests Unitarios**: Funciones, servicios, validadores
- **30% Tests de Integración**: APIs, base de datos
- **10% Tests E2E**: Flujos completos

### Herramientas

- **Framework**: Jest
- **API Testing**: Supertest
- **E2E**: Playwright (pendiente)
- **Cobertura**: Istanbul (incluido en Jest)

---

## ✅ Tests Unitarios

### Estado: 14 tests implementados, 14 pasando (100%)

### 1. ScoringService (14 tests) ✅

**Archivo**: `backend/src/modules/chatbot/services/evaluacion/__tests__/scoringService.test.js`  
**Cobertura**: 75% ✅

#### Métodos Testeados

##### calcularPuntaje (4 tests)
- ✅ Debe calcular puntaje correctamente con pesos iguales
- ✅ Debe calcular puntaje correctamente con pesos diferentes
- ✅ Debe manejar evaluaciones con puntaje 0
- ✅ Debe manejar array vacío

##### calcularPorcentaje (3 tests)
- ✅ Debe calcular porcentaje correctamente
- ✅ Debe retornar 100% cuando puntaje total = puntaje máximo
- ✅ Debe retornar 0% cuando puntaje máximo es 0

##### calcularResultadoCompleto (5 tests)
- ✅ Debe retornar APROBADO cuando pasa todas las preguntas
- ✅ Debe retornar CONSIDERAR cuando alcanza umbral pero reprueba pregunta no eliminatoria
- ✅ Debe retornar RECHAZADO cuando reprueba pregunta eliminatoria
- ✅ Debe retornar RECHAZADO cuando no alcanza el umbral
- ✅ Debe incluir estadísticas en el resultado

##### tieneEliminatoriasReprobadas (2 tests)
- ✅ Debe detectar eliminatoria reprobada
- ✅ Debe retornar false cuando no hay eliminatorias reprobadas

### Próximos Tests Unitarios

#### Prioridad Alta

**1. Validadores** (~20 tests estimados)
- IgualValidator
- RangoValidator
- KeywordValidator
- ContieneValidator
- OpcionValidator

**2. PerfilService** (~15 tests estimados)
- obtenerPreguntasFaltantes
- guardarRespuestaPerfil
- validarRespuestaPerfil
- esPreguntaPerfil

**3. ReglaFijaEvaluator** (~10 tests estimados)
- evaluar (con diferentes tipos de reglas)
- validarReglas

---

## 🔗 Tests de Integración

### Estado: 0 tests implementados

### Tests Planificados

#### 1. Endpoints de Sesiones
- POST /api/sesiones (crear sesión)
- GET /api/sesiones/:token (obtener sesión)
- POST /api/sesiones/:token/iniciar (iniciar sesión)
- POST /api/sesiones/:token/finalizar (finalizar evaluación)

#### 2. Endpoints de Mensajes
- GET /api/sesiones/:token/mensajes/siguiente-pregunta
- POST /api/sesiones/:token/mensajes/responder

#### 3. Flujo Completo
- Crear sesión → Iniciar → Responder → Finalizar

---

## 📝 Pruebas Manuales

### Estado: 4/8 completadas (50%)

### ✅ PRUEBA 1: Verificar Configuración del Chatbot

**Fecha**: 2 de Diciembre 2025, 17:45  
**Ejecutado por**: Romina Sáez  
**Estado**: ✅ PASÓ  
**Tiempo**: 5 minutos

#### Resultados

**1.1 Listar Chatbots**
- ✅ Status: 200 OK
- ✅ 2 chatbots activos encontrados
  - Chatbot #12: "Desarrollador Java SpringBoot" (umbral 70%)
  - Chatbot #1: "Chatbot Desarrollador Backend Senior" (umbral 80%)
- ✅ Ambos con email_reclutador configurado

**1.2 Obtener Preguntas del Chatbot #12**
- ✅ Total: 6 preguntas
- ✅ Preguntas de perfil: 3 (IDs: 17, 18, 19)
- ✅ Preguntas de evaluación: 3 (IDs: 11, 12, 13)
- ✅ Preguntas eliminatorias: 2 (IDs: 11, 13)
- ✅ Sistema de pesos: 200 puntos máximo

**Detalle de Preguntas**:

| ID | Pregunta | Tipo | Orden | Eliminatoria | Peso | Regla |
|----|----------|------|-------|--------------|------|-------|
| 17 | ¿Cuál es tu nombre y apellido? | texto | -3 | No | 1 | - |
| 18 | ¿Cuál es tu email? | email | -2 | No | 1 | - |
| 19 | ¿Cuál es tu teléfono? | telefono | -1 | No | 1 | - |
| 11 | ¿Años de experiencia? | numero | 1 | **Sí** | 100 | >= 2 |
| 12 | ¿Base de datos? | si_no | 2 | No | 50 | = "si" |
| 13 | ¿Microservicios? | si_no | 3 | **Sí** | 50 | = "si" |

**Observaciones**:
- Configuración correcta y completa
- Sistema listo para pruebas de evaluación

---

---

### ✅ PRUEBA 2: Enviar Invitación a Candidato

**Fecha**: 2 de Diciembre 2025, 20:15  
**Estado**: ✅ PASÓ

**Resultados**:
- ✅ POST /api/config/12/invitar - 200 OK
- ✅ Sesión creada: ID 16
- ✅ Token generado: b54223556584c189f8b6dcaee4ca5c463968cf79bba0e2f9656427fb37658bd6
- ✅ Email enviado correctamente
- ✅ Datos del candidato guardados (nombre, email, teléfono)

---

### ✅ PRUEBA 3: Acceso del Candidato

**Fecha**: 2 de Diciembre 2025, 20:16  
**Estado**: ✅ PASÓ

**Resultados**:
- ✅ GET /api/sesiones/:token - 200 OK
- ✅ Sesión accesible con token
- ✅ Datos completos del candidato
- ✅ Configuración del chatbot incluida

---

### ✅ PRUEBA 4: Iniciar Evaluación

**Fecha**: 2 de Diciembre 2025, 20:08  
**Estado**: ✅ PASÓ

**Resultados**:
- ✅ POST /api/sesiones/:token/iniciar - 200 OK
- ✅ Estado cambió a "en_progreso"
- ✅ Fecha de inicio registrada

---

### 🔄 PRUEBA 5: Responder Preguntas

**Fecha**: 2 de Diciembre 2025, 20:15  
**Estado**: 🔄 EN PROGRESO (1/6 preguntas respondidas)

**Resultados**:
- ✅ Pregunta 1 (Nombre): Respondida correctamente
- ✅ Dato de perfil guardado en sesión
- ✅ Validación correcta
- ✅ Progreso: 16.67% (1/6)

**Pendiente**: Completar preguntas 2-6

---

### ⏳ Pruebas Manuales Pendientes

#### PRUEBA 6: Finalizar Evaluación
**Objetivo**: Calcular resultado y enviar emails  
**Estado**: Pendiente

#### PRUEBA 7: Verificación de Emails
**Objetivo**: Verificar emails al candidato y reclutador  
**Estado**: Pendiente

#### PRUEBA 8: Casos Adicionales
**Objetivo**: Probar estados CONSIDERAR y RECHAZADO  
**Estado**: Pendiente

---

## ⚙️ Configuración

### Instalación de Dependencias

```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

### Configuración de Jest

**Archivo**: `backend/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=tests/integration"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js",
      "!src/server.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### Estructura de Carpetas

```
backend/
├── src/
│   └── modules/
│       └── chatbot/
│           ├── services/
│           │   └── evaluacion/
│           │       ├── __tests__/
│           │       │   └── scoringService.test.js ✅
│           │       └── scoringService.js
│           └── ...
├── tests/
│   └── integration/ (pendiente)
└── package.json
```

---

## 🚀 Ejecución

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ver cobertura de código
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration
```

### Resultado de Tests Unitarios

```
PASS  src/modules/chatbot/services/evaluacion/__tests__/scoringService.test.js
  ScoringService
    calcularPuntaje
      ✓ debe calcular puntaje correctamente con pesos iguales (10 ms)
      ✓ debe calcular puntaje correctamente con pesos diferentes (1 ms)
      ✓ debe manejar evaluaciones con puntaje 0 (2 ms)
      ✓ debe manejar array vacío (4 ms)
    calcularPorcentaje
      ✓ debe calcular porcentaje correctamente (2 ms)
      ✓ debe retornar 100% cuando puntaje total = puntaje máximo (1 ms)
      ✓ debe retornar 0% cuando puntaje máximo es 0 (1 ms)
    calcularResultadoCompleto
      ✓ debe retornar APROBADO cuando pasa todas las preguntas (8 ms)
      ✓ debe retornar CONSIDERAR cuando alcanza umbral pero reprueba pregunta no eliminatoria (2 ms)
      ✓ debe retornar RECHAZADO cuando reprueba pregunta eliminatoria (1 ms)
      ✓ debe retornar RECHAZADO cuando no alcanza el umbral (6 ms)
      ✓ debe incluir estadísticas en el resultado (1 ms)
    tieneEliminatoriasReprobadas
      ✓ debe detectar eliminatoria reprobada
      ✓ debe retornar false cuando no hay eliminatorias reprobadas (1 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        3.688 s
```

---

## 📅 Plan de Acción

### Semana 1 (Actual)
- [x] Configurar Jest
- [x] Implementar tests de ScoringService (14 tests)
- [x] Ejecutar PRUEBA MANUAL 1 - Configuración ✅
- [ ] Completar pruebas manuales (2-8)
- [ ] Implementar tests de Validadores
- [ ] Implementar tests de PerfilService

### Semana 2
- [ ] Implementar tests de EvaluacionService
- [ ] Implementar tests de ReglaFijaEvaluator
- [ ] Alcanzar 30% de cobertura global

### Semana 3
- [ ] Implementar tests de integración (APIs)
- [ ] Alcanzar 50% de cobertura global

### Semana 4
- [ ] Implementar tests E2E con Playwright
- [ ] Alcanzar 70% de cobertura global
- [ ] Integrar con CI/CD

---

## 📊 Métricas de Calidad

### Objetivos de Cobertura

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| Líneas | 70% | 1.54% | 🔴 |
| Funciones | 70% | 3.43% | 🔴 |
| Branches | 70% | 1.36% | 🔴 |
| Statements | 70% | 1.52% | 🔴 |

### Progreso por Módulo

| Módulo | Cobertura | Estado |
|--------|-----------|--------|
| ScoringService | 75% | ✅ Completado |
| Validadores | 0% | ⏳ Pendiente |
| PerfilService | 0% | ⏳ Pendiente |
| EvaluacionService | 0% | ⏳ Pendiente |
| SesionService | 0% | ⏳ Pendiente |

---

## 📚 Documentos Relacionados

### Archivos de Referencia

1. **FLUJO_PRUEBA_MANUAL.md** - Guía detallada paso a paso para pruebas manuales
2. **INFORME_PRUEBAS_EJEMPLO.md** - Ejemplo de cómo documentar pruebas
3. **INFORME_PRUEBAS_MANUALES.md** - Plantilla vacía para completar

### Archivos de Código

1. **backend/package.json** - Configuración de Jest
2. **backend/src/modules/chatbot/services/evaluacion/__tests__/scoringService.test.js** - Tests implementados

---

## 🎓 Convenciones y Mejores Prácticas

### Estructura de un Test (Patrón AAA)

```javascript
test('descripción del comportamiento esperado', () => {
  // Arrange (Preparar)
  const input = ...;
  
  // Act (Actuar)
  const resultado = funcion(input);
  
  // Assert (Verificar)
  expect(resultado).toBe(esperado);
});
```

### Nomenclatura

- **Archivos**: `*.test.js`
- **Ubicación**: Carpeta `__tests__/` junto al archivo
- **Describe**: Nombre del servicio/clase
- **Test**: "debe + verbo + comportamiento"

### Ejemplos

✅ **Buenos**:
- `debe calcular puntaje correctamente`
- `debe retornar error cuando email es inválido`

❌ **Malos**:
- `test 1`
- `funciona`

---

## 🐛 Bugs Encontrados Durante Testing

### Ninguno hasta el momento

---

## ✅ Funcionalidades Verificadas

### Tests Unitarios
- [x] Cálculo de puntajes ponderados
- [x] Cálculo de porcentajes
- [x] Determinación de resultado (APROBADO/CONSIDERAR/RECHAZADO)
- [x] Detección de preguntas eliminatorias reprobadas
- [x] Estadísticas de evaluación

### Pruebas Manuales
- [x] Listado de chatbots
- [x] Obtención de preguntas
- [x] Configuración de reglas
- [ ] Envío de invitaciones
- [ ] Evaluación automática
- [ ] Finalización y emails
- [ ] Generación de PDF

---

## 📞 Contacto y Soporte

**Equipo**: ChatBot 3IT  
**Responsable**: Romina Sáez  
**Email**: ro.saezp@duocuc.cl

---

**Última actualización**: 2 de Diciembre 2025, 18:00  
**Versión del documento**: 1.0
