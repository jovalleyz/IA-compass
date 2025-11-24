// Tooltips con contexto, ejemplos y mejores prácticas para cada pregunta

export const questionTooltips: Record<string, { title: string; description: string; example?: string; bestPractice?: string }> = {
  // ESTRATEGIA - Global
  "global_estrategia_1": {
    title: "Objetivos Estratégicos",
    description: "Identifique los objetivos prioritarios de su organización.",
    example: "Aumentar market share 15%, reducir costos operativos 20%, mejorar NPS a 80+",
    bestPractice: "McKinsey: Los objetivos deben ser SMART y vinculados a indicadores financieros medibles"
  },
  "global_estrategia_1_nivel": {
    title: "Nivel de Definición Estratégica",
    description: "Evalúe qué tan claros y comunicados están los objetivos.",
    example: "1=No documentados, 3=Documentados pero no comunicados, 5=Documentados, comunicados y monitoreados",
    bestPractice: "Accenture: Empresas con estrategia clara tienen 2.5x más probabilidad de éxito digital"
  },
  "global_estrategia_2": {
    title: "Estrategia de Transformación Digital",
    description: "Evalúe si existe un plan formal de transformación digital.",
    example: "Debe incluir: visión, roadmap, presupuesto y governance",
    bestPractice: "McKinsey: 70% de transformaciones fallan por falta de estrategia clara y patrocinio ejecutivo"
  },
  "global_estrategia_2_nivel": {
    title: "Madurez Digital",
    description: "1=Iniciativas aisladas. 3=Roadmap definido. 5=Transformación integrada con KPIs.",
    bestPractice: "BCG: Organizaciones maduras digitalmente logran 3x mayor ROI en proyectos tecnológicos"
  },

  // ESTRATEGIA - Por caso de uso
  "estrategia_1": {
    title: "Alineación con Objetivos",
    description: "¿Este caso de uso contribuye directamente a un objetivo estratégico?",
    example: "Si el objetivo es reducir costos, un chatbot de soporte puede reducir 30% tickets nivel 1",
    bestPractice: "Deloitte: Casos alineados a estrategia tienen 4x más probabilidad de aprobación ejecutiva"
  },
  "estrategia_2": {
    title: "Criticidad del Problema",
    description: "Evalúe la urgencia e impacto del problema.",
    example: "Dolor intenso: pérdidas >$1M/año. Mejora importante: 20%+ eficiencia",
    bestPractice: "McKinsey: Priorizar 'dolores intensos' para quick wins y momentum"
  },
  "estrategia_3": {
    title: "Conexión con KPIs",
    description: "Verifique si el caso de uso impacta KPIs medibles.",
    example: "Reducción de tiempo de respuesta de 48h a 2h (KPI: tiempo promedio de resolución)",
    bestPractice: "Definir 2-3 KPIs primarios antes de iniciar el proyecto"
  },

  // DATOS - Global
  "global_datos_1": {
    title: "Gobernanza de Datos",
    description: "¿Existen políticas sobre calidad, propiedad, acceso y privacidad de datos?",
    example: "Data owners, políticas de calidad, procesos de acceso documentados",
    bestPractice: "KPMG: 85% de proyectos de IA fallan por falta de gobernanza"
  },
  "global_datos_1_nivel": {
    title: "Nivel de Gobernanza",
    description: "1=Sin políticas. 3=Políticas básicas. 5=Gobierno activo con data stewards.",
    bestPractice: "Gartner: Gobernanza madura reduce 50% el time-to-market de proyectos de datos"
  },
  "global_datos_2": {
    title: "Infraestructura de Datos",
    description: "Describa sistemas actuales: ERP, CRM, data warehouse, data lake.",
    example: "SAP ERP, Salesforce CRM, data lake en AWS S3, pipeline con Informatica",
    bestPractice: "Accenture: Infraestructura moderna (cloud, APIs) acelera 3x implementación de IA"
  },
  "global_datos_2_nivel": {
    title: "Disponibilidad y Calidad",
    description: "1=Datos siloed, baja calidad. 3=Integración parcial. 5=Centralizados, tiempo real.",
    bestPractice: "McKinsey: 40% del tiempo en proyectos de IA se dedica a limpieza de datos"
  },

  // DATOS - Por caso de uso
  "datos_1": {
    title: "Suficiencia de Datos",
    description: "¿Hay volumen y variedad suficiente para entrenar el modelo?",
    example: "ML supervisado: 10K+ registros. NLP: 50K+ textos",
    bestPractice: "Google: 'Más datos > mejor algoritmo' en la mayoría de casos"
  },
  "datos_2": {
    title: "Accesibilidad e Integración",
    description: "Evalúe qué tan accesibles y limpios están los datos.",
    example: "Alto(5): APIs disponibles, limpios, documentados. Bajo(1): Papel, legacy sin integración",
    bestPractice: "Deloitte: 60% del esfuerzo de IA es preparación de datos"
  },
  "datos_3": {
    title: "Políticas de Uso",
    description: "Verifique permisos legales y técnicos para usar los datos.",
    example: "¿Se puede usar data de clientes para entrenar modelos? ¿Hay consentimiento explícito?",
    bestPractice: "PwC: Incumplimiento de GDPR puede costar hasta 4% del revenue global"
  },
  "datos_4": {
    title: "Ubicación de Datos",
    description: "Mapee todos los sistemas fuente y formatos.",
    example: "Transacciones en Oracle DB on-premise, logs en Splunk cloud, emails en Office365",
    bestPractice: "Incluir frecuencia de actualización y latencia aceptable"
  },

  // TECNOLOGÍA - Global
  "global_tecnologia_1": {
    title: "Capacidades Tecnológicas",
    description: "Liste infraestructura actual: cloud, plataformas, CI/CD, monitoring.",
    example: "Cloud AWS, plataforma Databricks, CI/CD con Jenkins, monitoring con Datadog",
    bestPractice: "BCG: Stack moderno (cloud-native, microservicios) reduce 50% costo de innovación"
  },
  "global_tecnologia_1_nivel": {
    title: "Madurez Tecnológica",
    description: "1=Legacy on-premise. 3=Cloud híbrido. 5=Cloud-native, DevOps maduro.",
    bestPractice: "Forrester: Infraestructura moderna es prerequisito para escalar IA"
  },

  // TECNOLOGÍA - Por caso de uso
  "tecnologia_1": {
    title: "Disponibilidad de Tecnología",
    description: "¿Existe la tecnología internamente o es accesible?",
    example: "OpenAI API, TensorFlow, plataforma Salesforce Einstein",
    bestPractice: "Gartner: 'Build vs Buy': considere tiempo al mercado vs diferenciación"
  },
  "tecnologia_2": {
    title: "Precedentes de Éxito",
    description: "¿Hay casos de uso similares validados en la industria?",
    example: "Chatbots en banca tienen múltiples casos exitosos documentados",
    bestPractice: "McKinsey: Tecnologías probadas reducen 70% el riesgo de implementación"
  },
  "tecnologia_3": {
    title: "Esfuerzo de Implementación",
    description: "Estime tiempo y complejidad del desarrollo.",
    example: "Bajo: Config SaaS (1-3m). Medio: Custom (3-6m). Alto: I+D (6-12+m)",
    bestPractice: "Accenture: Quick wins (<3 meses) generan momentum para proyectos mayores"
  },
  "tecnologia_4": {
    title: "Madurez Tecnológica",
    description: "Evalúe el nivel de madurez de la tecnología requerida.",
    example: "Probada: GPT-4, OCR. Emergente: Agentes autónomos. Experimental: AGI",
    bestPractice: "BCG: Balance 70% probada, 20% emergente, 10% experimental"
  },

  // PERSONAS - Global
  "global_personas_1": {
    title: "Madurez Digital del Equipo",
    description: "Inicial: Resistencia. En desarrollo: Apertura. Avanzado: Cultura de experimentación.",
    bestPractice: "Deloitte: Cultura digital es el principal predictor de éxito en transformación"
  },
  "global_personas_1_nivel": {
    title: "Skills en IA/Data Science",
    description: "1=Sin skills. 3=Equipo pequeño interno/externo. 5=Centro de excelencia.",
    bestPractice: "McKinsey: Desarrollar talento interno reduce 60% el costo total de ownership"
  },

  // PERSONAS - Por caso de uso
  "personas_1": {
    title: "Disponibilidad de Talento",
    description: "Evalúe skills necesarios vs disponibles.",
    example: "ML Engineer, Data Engineer, Product Owner, UX Designer",
    bestPractice: "PwC: Considere modelo híbrido core interno + especialización externa"
  },
  "personas_2": {
    title: "Preparación para el Cambio",
    description: "¿Hay apoyo ejecutivo y gestión de cambio?",
    example: "Comunicación, training, early adopters, incentivos alineados",
    bestPractice: "KPMG: 70% de transformaciones fallan por resistencia cultural"
  },
  "personas_3": {
    title: "Disposición a Adopción",
    description: "5=Líderes champions, usuarios ansiosos. 1=Resistencia activa.",
    bestPractice: "Accenture: Involucrar usuarios desde diseño aumenta 80% adopción final"
  },

  // VALOR - Por caso de uso
  "valor_1": {
    title: "Impacto Potencial",
    description: "Cuantifique impacto en métricas clave del negocio.",
    example: "Reducción 30% en tiempo de onboarding → ahorro $500K/año",
    bestPractice: "McKinsey: Business case debe incluir baseline, target, timeline, supuestos"
  },
  "valor_2": {
    title: "Estimación de Beneficios",
    description: "Calcule ahorros, incremento de ingresos, mejoras de eficiencia.",
    example: "Ahorro $2M/año en costos operativos, aumento 15% conversión → +$5M revenue",
    bestPractice: "BCG: Incluya beneficios tangibles e intangibles. Use método NPV para comparar"
  },
  "valor_3": {
    title: "Probabilidad de Éxito",
    description: "Alta: Tecnología probada + datos disponibles. Baja: Experimental + datos inexistentes.",
    bestPractice: "Gartner: Priorice casos con >70% probabilidad para construir credibilidad"
  },

  // RIESGOS - Global
  "global_riesgos_1": {
    title: "Políticas de Ética en IA",
    description: "¿Existen guidelines sobre fairness, transparencia, accountability?",
    example: "Comité de ética, revisión de bias, explicabilidad de decisiones",
    bestPractice: "PwC: 85% de consumidores dejarían de comprar si detectan uso irresponsable de IA"
  },

  // RIESGOS - Por caso de uso
  "riesgos_1": {
    title: "Riesgos Éticos y Regulatorios",
    description: "Identifique riesgos de sesgo, discriminación, compliance.",
    example: "AI Act UE, algoritmos de crédito deben ser auditables y explicables",
    bestPractice: "Deloitte: Construya fairness desde diseño, no como afterthought"
  },
  "riesgos_2": {
    title: "Estrategia de Mitigación",
    description: "¿Cómo se mitigarán los riesgos identificados?",
    example: "Auditorías trimestrales de bias, diverse training data, human-in-the-loop",
    bestPractice: "McKinsey: Plan de mitigación debe ser parte del business case"
  },
  "riesgos_3": {
    title: "Riesgos de Seguridad",
    description: "Evalúe exposición a ataques, fugas de datos.",
    example: "Modelos con PII requieren encryption at rest, access controls estrictos",
    bestPractice: "Gartner: 60% de organizaciones sufrirán incidente de seguridad en IA para 2025"
  },
  "riesgos_4": {
    title: "Impactos Legales/Reputacionales",
    description: "Alto(5): Decisiones sobre personas. Bajo(1): Optimización interna.",
    bestPractice: "BCG: Para alto riesgo, incluya comité de ética y revisión legal antes de deployment"
  }
};
