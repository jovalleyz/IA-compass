export interface UseCaseQuestion {
  id: string;
  question: string;
  category: "estrategia" | "datos" | "tecnologia" | "personas" | "valor" | "riesgos";
  type: "text" | "rating" | "boolean" | "select";
  options?: string[];
  scope?: "global" | "per-use-case"; // Indica si la pregunta es global o por caso de uso
}

export interface UseCase {
  id: string;
  title: string;
  category: string;
  industry?: string;
  description: string;
  benefits?: string[];
  aiType?: string;
  complexity?: "low" | "medium" | "high";
  impact?: "low" | "medium" | "high";
  dataRequirements?: string;
  // Nuevos campos para identificación de casos de éxito
  isUserCreated?: boolean;
  creatorCompany?: string;
  statusCase?: "en_evaluacion" | "en_ejecucion" | "caso_de_exito";
  dbId?: string; // ID from database for tracking
  // Scores from evaluation
  alineamiento_estrategico?: number;
  nivel_madurez_requerido?: number;
  madurez_gap?: number;
}

export interface QuestionnaireResponse {
  useCaseId: string;
  answers: Record<string, string | number | boolean>;
  score?: number;
}

export interface GlobalAnswers {
  answers: Record<string, string | number | boolean>;
}

export interface MaturityScores {
  estrategia: number;
  datos: number;
  tecnologia: number;
  personas: number;
  procesos: number;
}

export const useCaseQuestions: UseCaseQuestion[] = [
  // Preguntas Globales - Estrategia
  {
    id: "global_estrategia_1",
    question: "¿Cuáles son los principales objetivos estratégicos de la organización?",
    category: "estrategia",
    type: "text",
    scope: "global"
  },
  {
    id: "global_estrategia_1_nivel",
    question: "¿Qué tan definidos están los objetivos estratégicos?",
    category: "estrategia",
    type: "rating",
    scope: "global"
  },
  {
    id: "global_estrategia_2",
    question: "¿La organización tiene una estrategia de transformación digital definida?",
    category: "estrategia",
    type: "boolean",
    scope: "global"
  },
  {
    id: "global_estrategia_2_nivel",
    question: "Nivel de madurez de la estrategia de transformación digital",
    category: "estrategia",
    type: "rating",
    scope: "global"
  },
  
  // Preguntas por Caso de Uso - Estrategia
  {
    id: "estrategia_1",
    question: "¿El caso de uso se alinea con un objetivo estratégico prioritario de la empresa?",
    category: "estrategia",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "estrategia_2",
    question: "¿Qué tan crítico es el problema/oportunidad que aborda?",
    category: "estrategia",
    type: "select",
    options: ["Dolor intenso", "Mejora importante", "Mejora menor", "No crítico"],
    scope: "per-use-case"
  },
  {
    id: "estrategia_3",
    question: "¿Se conecta directamente con KPIs y metas del negocio?",
    category: "estrategia",
    type: "boolean",
    scope: "per-use-case"
  },
  
  // Preguntas Globales - Datos
  {
    id: "global_datos_1",
    question: "¿La organización tiene una estrategia de gobernanza de datos establecida?",
    category: "datos",
    type: "boolean",
    scope: "global"
  },
  {
    id: "global_datos_1_nivel",
    question: "Nivel de madurez de la gobernanza de datos",
    category: "datos",
    type: "rating",
    scope: "global"
  },
  {
    id: "global_datos_2",
    question: "Describa la madurez actual de la infraestructura de datos de la organización:",
    category: "datos",
    type: "text",
    scope: "global"
  },
  {
    id: "global_datos_2_nivel",
    question: "Nivel de disponibilidad y calidad de datos",
    category: "datos",
    type: "rating",
    scope: "global"
  },
  
  // Preguntas por Caso de Uso - Datos
  {
    id: "datos_1",
    question: "¿Existen suficientes datos de calidad para entrenar el modelo de IA requerido?",
    category: "datos",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "datos_2",
    question: "¿Los datos están accesibles, integrados y limpios?",
    category: "datos",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "datos_3",
    question: "¿Hay políticas de gobernanza de datos que habiliten el uso de esos datos?",
    category: "datos",
    type: "boolean",
    scope: "per-use-case"
  },
  {
    id: "datos_4",
    question: "Describa la disponibilidad y ubicación de los datos necesarios:",
    category: "datos",
    type: "text",
    scope: "per-use-case"
  },
  
  // Preguntas Globales - Tecnología
  {
    id: "global_tecnologia_1",
    question: "¿Qué capacidades tecnológicas actuales tiene la organización?",
    category: "tecnologia",
    type: "text",
    scope: "global"
  },
  {
    id: "global_tecnologia_1_nivel",
    question: "Nivel de madurez de la infraestructura tecnológica",
    category: "tecnologia",
    type: "rating",
    scope: "global"
  },
  
  // Preguntas por Caso de Uso - Tecnología
  {
    id: "tecnologia_1",
    question: "¿Tenemos acceso a la tecnología/algoritmos necesarios?",
    category: "tecnologia",
    type: "boolean",
    scope: "per-use-case"
  },
  {
    id: "tecnologia_2",
    question: "¿Hay precedentes de éxito con tecnología similar?",
    category: "tecnologia",
    type: "boolean",
    scope: "per-use-case"
  },
  {
    id: "tecnologia_3",
    question: "¿Cuál es el nivel estimado de esfuerzo/costo de implementación?",
    category: "tecnologia",
    type: "select",
    options: ["Bajo", "Medio", "Alto", "Muy Alto"],
    scope: "per-use-case"
  },
  {
    id: "tecnologia_4",
    question: "¿La tecnología requerida es probada o experimental?",
    category: "tecnologia",
    type: "select",
    options: ["Probada", "Emergente", "Experimental"],
    scope: "per-use-case"
  },
  
  // Preguntas Globales - Personas
  {
    id: "global_personas_1",
    question: "¿Cuál es el nivel de madurez digital del equipo de la organización?",
    category: "personas",
    type: "select",
    options: ["Inicial", "En desarrollo", "Avanzado", "Experto"],
    scope: "global"
  },
  {
    id: "global_personas_1_nivel",
    question: "Nivel de recursos y habilidades en IA/Data Science",
    category: "personas",
    type: "rating",
    scope: "global"
  },
  
  // Preguntas por Caso de Uso - Personas
  {
    id: "personas_1",
    question: "¿Contamos con el talento (interno o externo) para desarrollar e implementar este caso?",
    category: "personas",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "personas_2",
    question: "¿Está la organización preparada para adoptar este cambio (cultura, procesos, liderazgo)?",
    category: "personas",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "personas_3",
    question: "¿Los líderes y usuarios están dispuestos a adoptar esta solución IA?",
    category: "personas",
    type: "rating",
    scope: "per-use-case"
  },
  
  // Preguntas por Caso de Uso - Valor
  {
    id: "valor_1",
    question: "¿Cuál sería el impacto potencial en métricas de negocio si funciona?",
    category: "valor",
    type: "text",
    scope: "per-use-case"
  },
  {
    id: "valor_1_nivel",
    question: "Califica el nivel de impacto potencial en métricas de negocio",
    category: "valor",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "valor_2",
    question: "Estimación de beneficios (ahorro de costos, aumento de ingresos, etc.):",
    category: "valor",
    type: "text",
    scope: "per-use-case"
  },
  {
    id: "valor_3",
    question: "¿Cuál es la probabilidad de éxito técnico?",
    category: "valor",
    type: "select",
    options: ["Alta", "Media", "Baja", "Incierta"],
    scope: "per-use-case"
  },
  {
    id: "valor_3_nivel",
    question: "Califica la probabilidad de éxito técnico de este caso de uso",
    category: "valor",
    type: "rating",
    scope: "per-use-case"
  },
  
  // Preguntas Globales - Riesgos
  {
    id: "global_riesgos_1",
    question: "¿La organización tiene políticas de ética y cumplimiento en IA?",
    category: "riesgos",
    type: "boolean",
    scope: "global"
  },
  {
    id: "global_riesgos_1_nivel",
    question: "Nivel de madurez de las políticas de ética y cumplimiento en IA",
    category: "riesgos",
    type: "rating",
    scope: "global"
  },
  
  // Preguntas por Caso de Uso - Riesgos
  {
    id: "riesgos_1",
    question: "¿Existen riesgos éticos, de sesgo o regulatorios asociados?",
    category: "riesgos",
    type: "boolean",
    scope: "per-use-case"
  },
  {
    id: "riesgos_1_nivel",
    question: "Califica el nivel de riesgo (1 = Riesgo muy alto, 5 = Riesgo muy bajo)",
    category: "riesgos",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "riesgos_2",
    question: "Si existen riesgos, ¿cómo se mitigarían?",
    category: "riesgos",
    type: "text",
    scope: "per-use-case"
  },
  {
    id: "riesgos_2_nivel",
    question: "Califica la capacidad de la organización para mitigar los riesgos identificados",
    category: "riesgos",
    type: "rating",
    scope: "per-use-case"
  },
  {
    id: "riesgos_3",
    question: "¿Presenta riesgos de ciberseguridad o privacidad?",
    category: "riesgos",
    type: "boolean",
    scope: "per-use-case"
  },
  {
    id: "riesgos_4",
    question: "¿Hay impactos legales o reputacionales a considerar?",
    category: "riesgos",
    type: "rating",
    scope: "per-use-case"
  }
];
