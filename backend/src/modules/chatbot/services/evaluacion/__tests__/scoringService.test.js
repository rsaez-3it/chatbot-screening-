/**
 * Tests Unitarios: ScoringService
 * 
 * Descripción:
 * Este archivo contiene tests para el servicio de cálculo de puntajes.
 * El ScoringService es responsable de:
 * - Calcular puntajes ponderados
 * - Calcular porcentajes
 * - Determinar resultado final (APROBADO/CONSIDERAR/RECHAZADO)
 * 
 * Fecha: Diciembre 2025
 * Autor: Equipo ChatBot 3IT
 */

const ScoringService = require('../scoringService');

describe('ScoringService', () => {
  
  // ============================================================================
  // TESTS: calcularPuntaje
  // ============================================================================
  
  describe('calcularPuntaje', () => {
    
    /**
     * Test: Debe calcular puntaje correctamente con pesos iguales
     * 
     * Escenario:
     * - 2 evaluaciones con peso 1
     * - Puntajes: 100 y 50
     * 
     * Resultado esperado:
     * - Puntaje total: 150 (100*1 + 50*1)
     * - Puntaje máximo: 200 (100*1 + 100*1)
     */
    test('debe calcular puntaje correctamente con pesos iguales', () => {
      // Arrange
      const evaluaciones = [
        { puntaje: 100, peso: 1 },
        { puntaje: 50, peso: 1 }
      ];
      
      // Act
      const resultado = ScoringService.calcularPuntaje(evaluaciones);
      
      // Assert
      expect(resultado.puntaje_total).toBe(150);
      expect(resultado.puntaje_maximo).toBe(200);
    });

    /**
     * Test: Debe calcular puntaje correctamente con pesos diferentes
     * 
     * Escenario:
     * - 2 evaluaciones con pesos diferentes
     * - Evaluación 1: puntaje 100, peso 1
     * - Evaluación 2: puntaje 50, peso 2
     * 
     * Resultado esperado:
     * - Puntaje total: 200 (100*1 + 50*2)
     * - Puntaje máximo: 300 (100*1 + 100*2)
     */
    test('debe calcular puntaje correctamente con pesos diferentes', () => {
      // Arrange
      const evaluaciones = [
        { puntaje: 100, peso: 1 },
        { puntaje: 50, peso: 2 }
      ];
      
      // Act
      const resultado = ScoringService.calcularPuntaje(evaluaciones);
      
      // Assert
      expect(resultado.puntaje_total).toBe(200);
      expect(resultado.puntaje_maximo).toBe(300);
    });

    /**
     * Test: Debe manejar evaluaciones con puntaje 0
     */
    test('debe manejar evaluaciones con puntaje 0', () => {
      // Arrange
      const evaluaciones = [
        { puntaje: 0, peso: 1 },
        { puntaje: 100, peso: 1 }
      ];
      
      // Act
      const resultado = ScoringService.calcularPuntaje(evaluaciones);
      
      // Assert
      expect(resultado.puntaje_total).toBe(100);
      expect(resultado.puntaje_maximo).toBe(200);
    });

    /**
     * Test: Debe manejar array vacío
     */
    test('debe manejar array vacío', () => {
      // Arrange
      const evaluaciones = [];
      
      // Act
      const resultado = ScoringService.calcularPuntaje(evaluaciones);
      
      // Assert
      expect(resultado.puntaje_total).toBe(0);
      expect(resultado.puntaje_maximo).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: calcularPorcentaje
  // ============================================================================
  
  describe('calcularPorcentaje', () => {
    
    /**
     * Test: Debe calcular porcentaje correctamente
     */
    test('debe calcular porcentaje correctamente', () => {
      // Arrange
      const puntajeTotal = 150;
      const puntajeMaximo = 200;
      
      // Act
      const porcentaje = ScoringService.calcularPorcentaje(puntajeTotal, puntajeMaximo);
      
      // Assert
      expect(porcentaje).toBe(75);
    });

    /**
     * Test: Debe retornar 100% cuando puntaje total = puntaje máximo
     */
    test('debe retornar 100% cuando puntaje total = puntaje máximo', () => {
      // Arrange
      const puntajeTotal = 200;
      const puntajeMaximo = 200;
      
      // Act
      const porcentaje = ScoringService.calcularPorcentaje(puntajeTotal, puntajeMaximo);
      
      // Assert
      expect(porcentaje).toBe(100);
    });

    /**
     * Test: Debe retornar 0% cuando puntaje máximo es 0
     */
    test('debe retornar 0% cuando puntaje máximo es 0', () => {
      // Arrange
      const puntajeTotal = 0;
      const puntajeMaximo = 0;
      
      // Act
      const porcentaje = ScoringService.calcularPorcentaje(puntajeTotal, puntajeMaximo);
      
      // Assert
      expect(porcentaje).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: calcularResultadoCompleto
  // ============================================================================
  
  describe('calcularResultadoCompleto', () => {
    
    /**
     * Test: Debe retornar APROBADO cuando pasa todas las preguntas
     * 
     * Escenario:
     * - Todas las evaluaciones con cumple: true
     * - Puntaje: 100%
     * 
     * Resultado esperado:
     * - resultado: 'aprobado'
     * - porcentaje: 100
     * - razon: mensaje de aprobación
     */
    test('debe retornar APROBADO cuando pasa todas las preguntas', () => {
      // Arrange
      const evaluaciones = [
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false },
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.calcularResultadoCompleto(evaluaciones, 70);
      
      // Assert
      expect(resultado.resultado).toBe('aprobado');
      expect(resultado.porcentaje).toBe(100);
      expect(resultado.razon).toContain('Respondió correctamente todas las preguntas');
    });

    /**
     * Test: Debe retornar CONSIDERAR cuando alcanza umbral pero reprueba pregunta no eliminatoria
     * 
     * Escenario:
     * - Alcanza el umbral (80% >= 70%)
     * - Reprueba 1 pregunta NO eliminatoria
     * 
     * Resultado esperado:
     * - resultado: 'considerar'
     * - porcentaje: >= 70
     * - razon: mensaje indicando preguntas reprobadas
     */
    test('debe retornar CONSIDERAR cuando alcanza umbral pero reprueba pregunta no eliminatoria', () => {
      // Arrange
      const evaluaciones = [
        { cumple: true, puntaje: 100, peso: 100, es_eliminatoria: true },
        { cumple: true, puntaje: 100, peso: 50, es_eliminatoria: false },
        { cumple: false, puntaje: 0, peso: 50, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.calcularResultadoCompleto(evaluaciones, 70);
      
      // Assert
      expect(resultado.resultado).toBe('considerar');
      expect(resultado.porcentaje).toBeGreaterThanOrEqual(70);
      expect(resultado.razon).toContain('Para considerar');
      expect(resultado.razon).toContain('reprobó');
    });

    /**
     * Test: Debe retornar RECHAZADO cuando reprueba pregunta eliminatoria
     * 
     * Escenario:
     * - Reprueba 1 pregunta eliminatoria
     * 
     * Resultado esperado:
     * - resultado: 'rechazado'
     * - porcentaje: 0
     * - razon: mensaje sobre pregunta eliminatoria
     * - eliminatorias_reprobadas: 1
     */
    test('debe retornar RECHAZADO cuando reprueba pregunta eliminatoria', () => {
      // Arrange
      const evaluaciones = [
        { cumple: false, puntaje: 0, peso: 1, es_eliminatoria: true },
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.calcularResultadoCompleto(evaluaciones, 70);
      
      // Assert
      expect(resultado.resultado).toBe('rechazado');
      expect(resultado.porcentaje).toBe(0);
      expect(resultado.razon).toContain('eliminatorias');
      expect(resultado.eliminatorias_reprobadas).toBe(1);
    });

    /**
     * Test: Debe retornar RECHAZADO cuando no alcanza el umbral
     * 
     * Escenario:
     * - No reprueba eliminatorias
     * - Puntaje: 50% < 70% (umbral)
     * 
     * Resultado esperado:
     * - resultado: 'rechazado'
     * - porcentaje: 50
     * - razon: mensaje sobre umbral no alcanzado
     */
    test('debe retornar RECHAZADO cuando no alcanza el umbral', () => {
      // Arrange
      const evaluaciones = [
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false },
        { cumple: false, puntaje: 0, peso: 1, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.calcularResultadoCompleto(evaluaciones, 70);
      
      // Assert
      expect(resultado.resultado).toBe('rechazado');
      expect(resultado.porcentaje).toBe(50);
      expect(resultado.razon).toContain('Reprobado');
      expect(resultado.razon).toContain('50%');
    });

    /**
     * Test: Debe incluir estadísticas en el resultado
     */
    test('debe incluir estadísticas en el resultado', () => {
      // Arrange
      const evaluaciones = [
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false },
        { cumple: false, puntaje: 0, peso: 1, es_eliminatoria: false },
        { cumple: true, puntaje: 100, peso: 1, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.calcularResultadoCompleto(evaluaciones, 70);
      
      // Assert
      expect(resultado.estadisticas).toBeDefined();
      expect(resultado.estadisticas.total_preguntas).toBe(3);
      expect(resultado.estadisticas.preguntas_aprobadas).toBe(2);
      expect(resultado.estadisticas.preguntas_reprobadas).toBe(1);
    });
  });

  // ============================================================================
  // TESTS: tieneEliminatoriasReprobadas
  // ============================================================================
  
  describe('tieneEliminatoriasReprobadas', () => {
    
    /**
     * Test: Debe detectar eliminatoria reprobada
     */
    test('debe detectar eliminatoria reprobada', () => {
      // Arrange
      const evaluaciones = [
        { cumple: false, es_eliminatoria: true }
      ];
      
      // Act
      const resultado = ScoringService.tieneEliminatoriasReprobadas(evaluaciones);
      
      // Assert
      expect(resultado).toBe(true);
    });

    /**
     * Test: Debe retornar false cuando no hay eliminatorias reprobadas
     */
    test('debe retornar false cuando no hay eliminatorias reprobadas', () => {
      // Arrange
      const evaluaciones = [
        { cumple: true, es_eliminatoria: true },
        { cumple: false, es_eliminatoria: false }
      ];
      
      // Act
      const resultado = ScoringService.tieneEliminatoriasReprobadas(evaluaciones);
      
      // Assert
      expect(resultado).toBe(false);
    });
  });
});
