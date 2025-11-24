import { UseCase, QuestionnaireResponse, GlobalAnswers } from "@/types/framework";

export interface ValidationResult {
  useCaseId: string;
  useCase: UseCase;
  status: "green" | "yellow" | "red";
  readinessScore: number;
  maturityGap: number;
  recommendations: string[];
  bloqueadores: string[];
  warnings: string[];
}

export const calculateValidationResults = (
  selectedUseCases: UseCase[],
  evaluatedUseCases: QuestionnaireResponse[],
  globalAnswers: GlobalAnswers,
  maturityScore: number
): ValidationResult[] => {
  
  const calculateReadiness = (useCase: UseCase, evaluation: QuestionnaireResponse): ValidationResult => {
    const answers = evaluation.answers;
    
    // Calculate complexity requirement (1-5 scale)
    const complexityRequirement = useCase.complexity === "low" ? 2 : useCase.complexity === "medium" ? 3.5 : 4.5;
    
    // Calculate maturity gap
    const maturityGap = complexityRequirement - maturityScore;
    
    // Analyze evaluation answers
    const bloqueadores: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Data readiness
    const dataAvailability = answers.datos_1 as number || 0;
    const dataQuality = answers.datos_2 as number || 0;
    const dataGovernance = answers.datos_3 as boolean;
    
    if (dataAvailability < 3) {
      bloqueadores.push("Datos insuficientes para entrenamiento del modelo");
    } else if (dataAvailability < 4) {
      warnings.push("Disponibilidad de datos limitada");
    }
    
    if (dataQuality < 3) {
      bloqueadores.push("Calidad de datos no cumple requisitos mínimos");
    } else if (dataQuality < 4) {
      warnings.push("Se requiere trabajo de limpieza y preparación de datos");
    }
    
    if (!dataGovernance) {
      warnings.push("Falta establecer políticas de gobernanza de datos");
    }
    
    // Technology readiness
    const techAccess = answers.tecnologia_1 as boolean;
    const techPrecedent = answers.tecnologia_2 as boolean;
    const techEffort = answers.tecnologia_3 as string;
    const techMaturity = answers.tecnologia_4 as string;
    
    if (!techAccess) {
      bloqueadores.push("No se tiene acceso a la tecnología necesaria");
    }
    
    if (!techPrecedent) {
      warnings.push("Sin casos previos de éxito con tecnología similar");
    }
    
    if (techEffort === "Alto" || techEffort === "Muy Alto") {
      warnings.push("Esfuerzo de implementación significativo requerido");
    }
    
    if (techMaturity === "Experimental") {
      warnings.push("Tecnología experimental - alto riesgo técnico");
    }
    
    // People & culture readiness
    const talentAvailability = answers.personas_1 as number || 0;
    const orgReadiness = answers.personas_2 as number || 0;
    const stakeholderBuyIn = answers.personas_3 as number || 0;
    
    if (talentAvailability < 3) {
      bloqueadores.push("Falta de talento necesario para desarrollar la solución");
    } else if (talentAvailability < 4) {
      warnings.push("Se requiere contratar o capacitar personal adicional");
    }
    
    if (orgReadiness < 3) {
      bloqueadores.push("Organización no preparada para adoptar el cambio");
    } else if (orgReadiness < 4) {
      warnings.push("Se requiere trabajo de gestión de cambio");
    }
    
    if (stakeholderBuyIn < 3) {
      bloqueadores.push("Falta apoyo crítico de stakeholders");
    } else if (stakeholderBuyIn < 4) {
      warnings.push("Se requiere mayor compromiso de stakeholders");
    }
    
    // Strategy alignment
    const strategicAlignment = answers.estrategia_1 as number || 0;
    const strategicSupport = answers.estrategia_2 as number || 0;
    const strategicPriority = answers.estrategia_3 as number || 0;
    
    if (strategicAlignment < 3) {
      bloqueadores.push("Caso de uso no alineado con objetivos estratégicos");
    } else if (strategicAlignment < 4) {
      warnings.push("Alineamiento estratégico mejorable");
    }
    
    if (strategicSupport < 3) {
      bloqueadores.push("Insuficiente apoyo de liderazgo ejecutivo");
    }
    
    if (strategicPriority < 3) {
      warnings.push("Baja prioridad estratégica para la iniciativa");
    }
    
    // Risk assessment
    const technicalRisk = answers.riesgos_1 as number || 0;
    const operationalRisk = answers.riesgos_2 as number || 0;
    const financialRisk = answers.riesgos_3 as boolean;
    
    if (technicalRisk > 7) {
      bloqueadores.push("Riesgo técnico muy alto");
    } else if (technicalRisk > 5) {
      warnings.push("Riesgo técnico considerable a gestionar");
    }
    
    if (operationalRisk > 7) {
      bloqueadores.push("Riesgo operacional muy alto");
    } else if (operationalRisk > 5) {
      warnings.push("Requiere plan de mitigación de riesgos operacionales");
    }
    
    if (!financialRisk) {
      warnings.push("No se ha evaluado el retorno de inversión adecuadamente");
    }
    
    // Calculate readiness score (0-10) based on multiple factors
    let readinessScore = 10;
    
    // Factor 1: Average of key readiness indicators (40% of score)
    const readinessIndicators = [
      dataAvailability,
      dataQuality,
      talentAvailability,
      orgReadiness,
      stakeholderBuyIn,
      strategicAlignment,
      strategicSupport
    ].filter(val => val > 0);
    
    const avgReadiness = readinessIndicators.length > 0
      ? readinessIndicators.reduce((a, b) => a + b, 0) / readinessIndicators.length
      : 3;
    
    const readinessFactor = (avgReadiness / 5) * 4; // Convert 1-5 scale to 0-4 points
    
    // Factor 2: Maturity gap penalty (max -2 points)
    const maturityPenalty = maturityGap > 0 ? Math.min(maturityGap * 0.5, 2) : 0;
    
    // Factor 3: Bloqueadores penalty (each bloqueador -1.5 points)
    const bloqueadorPenalty = bloqueadores.length * 1.5;
    
    // Factor 4: Warnings penalty (each warning -0.5 points)
    const warningPenalty = warnings.length * 0.5;
    
    // Calculate final score
    readinessScore = readinessFactor + 6; // Base from indicators (4) + base score (6)
    readinessScore -= maturityPenalty;
    readinessScore -= bloqueadorPenalty;
    readinessScore -= warningPenalty;
    
    // Ensure score is within bounds
    readinessScore = Math.max(0, Math.min(10, readinessScore));
    
    console.log(`Readiness calculation for ${useCase.title}:`, {
      avgReadiness: avgReadiness.toFixed(2),
      readinessFactor: readinessFactor.toFixed(2),
      maturityGap,
      maturityPenalty: maturityPenalty.toFixed(2),
      bloqueadores: bloqueadores.length,
      bloqueadorPenalty: bloqueadorPenalty.toFixed(2),
      warnings: warnings.length,
      warningPenalty: warningPenalty.toFixed(2),
      finalScore: readinessScore.toFixed(1)
    });
    
    // Determine status based on score
    let status: "green" | "yellow" | "red";
    if (readinessScore >= 7 && bloqueadores.length === 0) {
      status = "green";
    } else if (readinessScore >= 4 && bloqueadores.length < 2) {
      status = "yellow";
    } else {
      status = "red";
    }
    
    // Generate recommendations based on status
    if (status === "green") {
      recommendations.push("✅ Proceder con implementación en este momento");
      recommendations.push("Desarrollar plan de proyecto detallado");
      recommendations.push("Asignar equipo y recursos necesarios");
    } else if (status === "yellow") {
      recommendations.push("⚠️ Resolver advertencias antes de implementar");
      if (warnings.length > 0) {
        recommendations.push("Desarrollar plan de mitigación para advertencias identificadas");
      }
      recommendations.push("Considerar piloto limitado mientras se subsanan advertencias");
    } else {
      recommendations.push("🛑 No proceder con implementación en este momento");
      recommendations.push("Resolver bloqueadores críticos identificados");
      recommendations.push("Considerar casos de uso de menor complejidad primero");
    }
    
    return {
      useCaseId: useCase.id,
      useCase,
      status,
      readinessScore: Math.round(readinessScore * 10) / 10,
      maturityGap: Math.round(maturityGap * 10) / 10,
      recommendations,
      bloqueadores,
      warnings
    };
  };
  
  return selectedUseCases.map((useCase) => {
    const evaluation = evaluatedUseCases.find(e => e.useCaseId === useCase.id);
    
    if (!evaluation) {
      return {
        useCaseId: useCase.id,
        useCase,
        status: "red" as const,
        readinessScore: 0,
        maturityGap: 0,
        recommendations: ["❌ Caso de uso no evaluado"],
        bloqueadores: ["Completar evaluación del caso de uso"],
        warnings: []
      };
    }
    return calculateReadiness(useCase, evaluation);
  });
};
