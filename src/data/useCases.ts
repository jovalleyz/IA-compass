import { UseCase } from "@/types/framework";

export const useCases: UseCase[] = [
  // ============= NUEVOS CASOS DE USO - TECNOLOGÍA/IA GENERATIVA =============
  {
    id: "uc_tech_001",
    title: "Urmobo - Agente Virtual Odin",
    category: "Tecnología",
    industry: "Tecnología / Soporte",
    description: "Plataforma de gestión de dispositivos móviles que crea un agente virtual llamado Odin para mejorar la experiencia del usuario y reducir tickets de soporte interactuando con lenguaje natural.",
    benefits: [
      "Reducción significativa de tickets de soporte",
      "Mejora en experiencia de usuario 24/7",
      "Interacción en lenguaje natural con dispositivos",
      "Automatización de troubleshooting común"
    ],
    aiType: "NLP, Conversational AI, Agentic AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de dispositivos móviles, logs de soporte, base de conocimientos técnicos"
  },
  {
    id: "uc_tech_002",
    title: "VideoShow - Generación de Videos con Gemini Flash",
    category: "Medios",
    industry: "Medios / Entretenimiento",
    description: "Usa Gemini Flash y Imagen 3 en Vertex AI para generar guiones, texto creativo e imágenes desde prompts simples, reduciendo 3 meses de entrenamiento a unos pocos clics.",
    benefits: [
      "Reducción de 90%+ en tiempo de producción",
      "Generación rápida de contenido creativo",
      "Democratización de creación de videos",
      "Escalabilidad en producción de contenido"
    ],
    aiType: "Generative AI, Multimodal AI, Video Generation",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Prompts creativos, templates de video, bibliotecas de assets"
  },
  {
    id: "uc_tech_003",
    title: "accessiBe - Soluciones de Accesibilidad Web",
    category: "Tecnología",
    industry: "Tecnología / Inclusión Digital",
    description: "Usa Google Cloud AI para reducir el tiempo de despliegue en 5X y ofrecer accesibilidad a más de 23,000 sitios web mediante entornos serverless.",
    benefits: [
      "Reducción de 80% en tiempo de implementación",
      "Accesibilidad para más de 23,000 sitios",
      "Cumplimiento automático con WCAG",
      "Escalabilidad serverless"
    ],
    aiType: "Computer Vision, NLP, Accessibility AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Estructura de sitios web, estándares de accesibilidad, datos de usuarios"
  },
  {
    id: "uc_tech_004",
    title: "AI2 - Modelos Abiertos en Vertex AI Model Garden",
    category: "Investigación",
    industry: "Investigación / Ciencia de Datos",
    description: "Proporciona acceso abierto a modelos de IA desde Vertex AI, mejorando el ecosistema de investigación y desarrollo.",
    benefits: [
      "Democratización de modelos de IA avanzados",
      "Aceleración de investigación científica",
      "Reducción de costos de infraestructura",
      "Colaboración abierta en comunidad científica"
    ],
    aiType: "Machine Learning, Foundation Models, Research AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datasets de investigación, modelos pre-entrenados, infraestructura de cómputo"
  },
  {
    id: "uc_tech_005",
    title: "Anyscale - Escalado de Procesamiento Multimodal",
    category: "Desarrollo",
    industry: "Desarrollo / Computación",
    description: "Usa Ray en Google Cloud para escalar cargas complejas de datos, entrenamiento e inferencia con GPUs y TPUs.",
    benefits: [
      "Procesamiento paralelo masivo",
      "Optimización de costos de GPU/TPU",
      "Escalabilidad automática de workloads",
      "Reducción de tiempo de entrenamiento"
    ],
    aiType: "Distributed ML, GPU Computing, Multimodal Processing",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datasets masivos multimodales, infraestructura distribuida, pipelines de entrenamiento"
  },
  {
    id: "uc_tech_006",
    title: "Anywidth - Editor de Código AI (Cursor)",
    category: "Tecnología",
    industry: "Tecnología / Programación",
    description: "Plataforma que permite a agentes autónomos escribir y chatear sobre código contextual para entender proyectos complejos y acelerar el desarrollo con Gemini y Claude.",
    benefits: [
      "Aceleración de desarrollo de software",
      "Comprensión contextual de código complejo",
      "Reducción de bugs y mejora de calidad",
      "Asistencia en programación en tiempo real"
    ],
    aiType: "Code AI, NLP, Agentic AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Repositorios de código, documentación técnica, patrones de programación"
  },
  {
    id: "uc_tech_007",
    title: "Arize - Observabilidad de Aplicaciones Generativas",
    category: "Ingeniería",
    industry: "Ingeniería / IA",
    description: "Plataforma que ayuda a las empresas a desarrollar, evaluar y monitorear sus aplicaciones de IA generativa sobre Vertex AI y Kubernetes.",
    benefits: [
      "Monitoreo en tiempo real de modelos de IA",
      "Detección temprana de degradación de performance",
      "Evaluación continua de calidad de outputs",
      "Optimización de costos de inferencia"
    ],
    aiType: "MLOps, Monitoring AI, Observability",
    complexity: "high",
    impact: "high",
    dataRequirements: "Logs de aplicaciones, métricas de modelos, datos de inferencia, KPIs de performance"
  },
  {
    id: "uc_tech_008",
    title: "aSim - Generador de Mini Aplicaciones con IA",
    category: "Desarrollo",
    industry: "Desarrollo / Aplicaciones",
    description: "Crea miniapps instantáneamente a partir de prompts usando APIs de Google Maps, Gemini, Nano Banana y Veo 3.",
    benefits: [
      "Prototipado rápido de aplicaciones",
      "Desarrollo sin código para no-programadores",
      "Integración automática de múltiples APIs",
      "Reducción de 95% en tiempo de desarrollo"
    ],
    aiType: "Code Generation, Low-Code AI, Multimodal AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Prompts de usuario, templates de aplicaciones, APIs de servicios externos"
  },
  {
    id: "uc_tech_009",
    title: "Augment Code - Asistente de Programación con Claude y Vertex AI",
    category: "Tecnología",
    industry: "Tecnología / Desarrollo",
    description: "Integra Claude 3.5 Sonnet en Vertex AI para chat de código seguro y rápido, mejorando la productividad de desarrolladores.",
    benefits: [
      "Aumento de 40-60% en productividad de desarrollo",
      "Sugerencias contextuales de código",
      "Detección automática de vulnerabilidades",
      "Refactoring inteligente de código"
    ],
    aiType: "Code AI, NLP, Pair Programming AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Repositorios de código, estándares de programación, documentación de APIs"
  },
  {
    id: "uc_tech_010",
    title: "Avataar - Plataforma de Escalabilidad de Ingeniería",
    category: "Ingeniería",
    industry: "Ingeniería / Software",
    description: "Usa Vertex AI con Gemini para acelerar la productividad de ingeniería a miles de desarrolladores, integrando nuevas funcionalidades.",
    benefits: [
      "Escalamiento de equipos de desarrollo",
      "Estandarización de prácticas de ingeniería",
      "Aceleración de onboarding de desarrolladores",
      "Integración continua mejorada"
    ],
    aiType: "Development AI, Workflow Automation, Knowledge Management",
    complexity: "high",
    impact: "high",
    dataRequirements: "Código fuente, documentación técnica, mejores prácticas, métricas de desarrollo"
  },
  {
    id: "uc_tech_011",
    title: "Box - Gemini 2.5 para Aplicaciones Inteligentes",
    category: "Nube",
    industry: "Nube / Almacenamiento",
    description: "Implementa Gemini 2.5 para ofrecer aplicaciones más sofisticadas y análisis avanzados en su ecosistema de almacenamiento en la nube.",
    benefits: [
      "Búsqueda inteligente en documentos",
      "Análisis automático de contenido",
      "Organización predictiva de archivos",
      "Insights automáticos de datos empresariales"
    ],
    aiType: "Document AI, Search AI, Analytics AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Documentos empresariales, metadatos de archivos, patrones de uso"
  },
  {
    id: "uc_tech_012",
    title: "Canonical - Infraestructura Ubuntu Optimizada para IA",
    category: "Infraestructura",
    industry: "Infraestructura / IT",
    description: "Colabora con Google Cloud para optimizar Ubuntu como entorno confiable y escalable para cargas de IA intensivas en datos.",
    benefits: [
      "Rendimiento optimizado para workloads de IA",
      "Reducción de costos de infraestructura",
      "Escalabilidad horizontal automática",
      "Seguridad mejorada para datos sensibles"
    ],
    aiType: "Infrastructure AI, Cloud Optimization, Performance Tuning",
    complexity: "high",
    impact: "medium",
    dataRequirements: "Métricas de performance, configuraciones de sistema, logs de infraestructura"
  },
  {
    id: "uc_tech_013",
    title: "Cognizant - Asistente de Desarrolladores con Gemini",
    category: "Consultoría",
    industry: "Consultoría / Tecnología",
    description: "Usa Gemini y Vertex AI para mejorar la calidad del código, productividad de desarrolladores y generación de usuarios.",
    benefits: [
      "Mejora de 50% en calidad de código",
      "Reducción de tiempo de desarrollo",
      "Detección automática de code smells",
      "Documentación automática de código"
    ],
    aiType: "Code Quality AI, Developer Tools, Documentation AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Código fuente, estándares de calidad, métricas de desarrollo, feedback de usuarios"
  },
  {
    id: "uc_tech_014",
    title: "Crew AI - Framework para Construcción de Agentes",
    category: "Tecnología",
    industry: "Tecnología / Automatización",
    description: "Ofrece marcos de creación de agentes en Vertex AI para automatizar flujos de trabajo en diversas industrias.",
    benefits: [
      "Creación rápida de agentes especializados",
      "Automatización de procesos complejos",
      "Orquestación multi-agente",
      "Reducción de desarrollo de 70%"
    ],
    aiType: "Agentic AI, Workflow Automation, Multi-Agent Systems",
    complexity: "high",
    impact: "high",
    dataRequirements: "Procesos de negocio, reglas de workflow, datos de dominio específico"
  },
  {
    id: "uc_tech_015",
    title: "DataCurve - Análisis de Datos con Web3 e IA Generativa",
    category: "Analítica",
    industry: "Analítica / Blockchain",
    description: "Combina Web3 y IA generativa en Google Cloud para análisis profundo y autenticidad de datos, mejorando la toma de decisiones.",
    benefits: [
      "Verificación de autenticidad de datos",
      "Análisis predictivo avanzado",
      "Trazabilidad completa de información",
      "Insights accionables en tiempo real"
    ],
    aiType: "Generative AI, Blockchain AI, Analytics",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos blockchain, datasets empresariales, históricos de transacciones"
  },
  {
    id: "uc_tech_016",
    title: "DeSource - Plataforma de Seguridad Código",
    category: "Desarrollo",
    industry: "Desarrollo / Seguridad",
    description: "Usa Gemini 2.5 para analizar y corregir código automáticamente, escalando a millones de líneas diarias para mejor costo operativo.",
    benefits: [
      "Detección automática de vulnerabilidades",
      "Corrección automática de código inseguro",
      "Escaneo de millones de líneas diarias",
      "Reducción de 80% en costos de seguridad"
    ],
    aiType: "Security AI, Code Analysis, Vulnerability Detection",
    complexity: "high",
    impact: "high",
    dataRequirements: "Código fuente, bases de datos de vulnerabilidades, patrones de seguridad"
  },
  {
    id: "uc_tech_017",
    title: "Factory AI - Ingeniería Dirigida por Agentes",
    category: "Ingeniería",
    industry: "Ingeniería / Software",
    description: "Unifica datos de GitHub y Jira con Gemini 2.5 Flash y Pro para delegar tareas de desarrollo y generar documentación avanzada.",
    benefits: [
      "Automatización de tareas de desarrollo",
      "Documentación técnica automática",
      "Integración de proyecto management",
      "Reducción de overhead administrativo"
    ],
    aiType: "Agentic AI, Code Generation, Documentation AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Repositorios GitHub, tickets Jira, especificaciones técnicas, documentación"
  },
  {
    id: "uc_tech_018",
    title: "Fireworks AI - Motor de Inferencia de Alta Velocidad",
    category: "Tecnología",
    industry: "Tecnología / Cloud",
    description: "Usa GKE y Compute Engine para procesar más de 140 millones de tokens diarios con baja latencia y alta eficiencia.",
    benefits: [
      "Inferencia ultra-rápida de modelos",
      "Procesamiento masivo de tokens",
      "Optimización de costos de GPU",
      "Escalabilidad automática de carga"
    ],
    aiType: "Inference Optimization, High-Performance Computing, Model Serving",
    complexity: "high",
    impact: "high",
    dataRequirements: "Modelos de IA, requests de inferencia, métricas de performance"
  },
  {
    id: "uc_tech_019",
    title: "HykoA - Evaluación de Riesgos para Modelos IA",
    category: "Cumplimiento",
    industry: "Cumplimiento / Riesgo",
    description: "Automatiza la evaluación de riesgos y compliance en modelos de IA generativa, evitando implementos riesgosos y no deseados.",
    benefits: [
      "Evaluación automática de riesgos de IA",
      "Cumplimiento normativo automatizado",
      "Prevención de sesgos en modelos",
      "Auditoría continua de modelos"
    ],
    aiType: "Risk AI, Compliance AI, Model Governance",
    complexity: "high",
    impact: "high",
    dataRequirements: "Modelos de IA, normativas regulatorias, datos de entrenamiento, métricas de sesgo"
  },
  {
    id: "uc_tech_020",
    title: "Installly - Plataforma de Agentes Verticales B2B",
    category: "Tecnología",
    industry: "Tecnología / Startups",
    description: "Crea agentes especializados que automatizan flujos B2B entre departamentos mediante Vertex AI.",
    benefits: [
      "Automatización de procesos inter-departamentales",
      "Reducción de silos organizacionales",
      "Mejora en coordinación B2B",
      "Eficiencia operacional de 60%"
    ],
    aiType: "Agentic AI, Workflow Automation, B2B Integration",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de departamentos, flujos de trabajo B2B, políticas empresariales"
  },
  {
    id: "uc_tech_021",
    title: "Kahuna Labs - Soporte Técnico con IA",
    category: "Tecnología",
    industry: "Tecnología / Soporte",
    description: "Desarrolla la primera plataforma de soporte técnico y empresarial impulsada por IA dentro del programa Google Startups Cloud AI Acelerator.",
    benefits: [
      "Resolución automática de tickets técnicos",
      "Soporte 24/7 sin intervención humana",
      "Escalamiento de expertise técnico",
      "Reducción de 70% en tiempo de resolución"
    ],
    aiType: "Conversational AI, Technical Support AI, Knowledge Management",
    complexity: "high",
    impact: "high",
    dataRequirements: "Base de conocimientos técnico, historial de tickets, documentación de productos"
  },
  {
    id: "uc_tech_022",
    title: "Lakehouse - Evaluación Humana de Modelos en Vertex AI",
    category: "Ciencia de Datos",
    industry: "Ciencia de Datos / Evaluación",
    description: "Mejora procesos de evaluación humana de modelos directamente en Vertex AI para garantizar confianza y rapidez.",
    benefits: [
      "Validación humana de outputs de IA",
      "Mejora continua de modelos",
      "Detección de alucinaciones y errores",
      "Ciclos de feedback más rápidos"
    ],
    aiType: "Human-in-the-Loop AI, Model Evaluation, Quality Assurance",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Outputs de modelos, criterios de evaluación, feedback humano, métricas de calidad"
  },
  {
    id: "uc_tech_023",
    title: "Linear - Detección de Tickets Duplicados con IA",
    category: "Desarrollo",
    industry: "Desarrollo / Gestión de Producto",
    description: "Desarrolla la función 'Similar Issues' que usa IA para detectar tickets duplicados y mejorar la precisión de datos.",
    benefits: [
      "Reducción de trabajo duplicado",
      "Mejora en organización de issues",
      "Detección inteligente de similitudes",
      "Optimización de flujo de trabajo"
    ],
    aiType: "NLP, Similarity Detection, Deduplication AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Tickets históricos, descripciones de issues, metadatos de proyectos"
  },
  {
    id: "uc_tech_024",
    title: "Lovable - Ingeniero de Software con IA en Vertex AI",
    category: "Tecnología",
    industry: "Tecnología / Programación",
    description: "Orquesta modelos Gemini y Anthropic para generar aplicaciones web completas desde descripciones en lenguaje natural.",
    benefits: [
      "Generación automática de aplicaciones",
      "Desarrollo sin código técnico",
      "Prototipado ultrarrápido",
      "Democratización del desarrollo de software"
    ],
    aiType: "Code Generation, Multi-Model AI, Application Builder",
    complexity: "high",
    impact: "high",
    dataRequirements: "Descripciones en lenguaje natural, templates de aplicaciones, mejores prácticas de código"
  },
  {
    id: "uc_tech_025",
    title: "Magic - Plataforma para Consultas sobre Grandes Bases de Código",
    category: "Tecnología",
    industry: "Tecnología / Software",
    description: "Crea una plataforma de desarrollo con ventana contextual de 100 millones de tokens, permitiendo analizar enormes bases de código con asistencia de IA.",
    benefits: [
      "Comprensión de codebases masivos",
      "Búsqueda semántica en código",
      "Análisis de dependencias complejas",
      "Refactoring inteligente a gran escala"
    ],
    aiType: "Large Context AI, Code Understanding, Semantic Search",
    complexity: "high",
    impact: "high",
    dataRequirements: "Repositorios de código masivos, documentación técnica, historiales de commits"
  },
  // ============= CASOS DE USO ORIGINALES =============
  // Insurance
  {
    id: "uc_001",
    title: "Asistente de Suscripción (Underwriting)",
    category: "Seguros",
    industry: "Seguros",
    description: "Automatización del proceso de suscripción mediante IA que analiza riesgos, valida elegibilidad y determina precios y términos de pólizas.",
    benefits: [
      "Reducción del tiempo de procesamiento",
      "Mayor precisión en la evaluación de riesgos",
      "Mejor experiencia del cliente"
    ],
    aiType: "Machine Learning, NLP",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos históricos de pólizas, reclamaciones y perfiles de clientes"
  },
  {
    id: "uc_002",
    title: "Agente Q&A de Pólizas",
    category: "Seguros",
    industry: "Seguros",
    description: "Asistente virtual que responde preguntas sobre pólizas usando solo información de documentos oficiales.",
    benefits: [
      "Respuestas instantáneas 24/7",
      "Reducción de carga en servicio al cliente",
      "Mejora en satisfacción del cliente"
    ],
    aiType: "NLP, Generative AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Base de conocimientos de pólizas y documentación oficial"
  },
  {
    id: "uc_003",
    title: "Procesamiento Automático de Formularios",
    category: "Seguros",
    industry: "Seguros",
    description: "Extracción automática de datos estructurados de formularios y documentos mediante OCR y NLP.",
    benefits: [
      "Eliminación de entrada manual de datos",
      "Reducción de errores",
      "Aceleración de procesos"
    ],
    aiType: "OCR, Document AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Formularios digitalizados y plantillas de documentos"
  },
  {
    id: "uc_004",
    title: "Agente FNOL (First Notice of Loss)",
    category: "Seguros",
    industry: "Seguros",
    description: "Sistema automatizado para recibir y procesar el primer aviso de pérdida o reclamación.",
    benefits: [
      "Procesamiento inmediato de reclamaciones",
      "Captura completa de información",
      "Inicio rápido del proceso de reclamación"
    ],
    aiType: "NLP, Workflow Automation",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Información de pólizas y procesos de reclamación"
  },
  {
    id: "uc_005",
    title: "Procesamiento de Reclamaciones",
    category: "Seguros",
    industry: "Seguros",
    description: "Verificación automática de reclamaciones mediante validación cruzada de documentos y datos de pólizas.",
    benefits: [
      "Decisiones rápidas y consistentes",
      "Reducción de fraude",
      "Mejor experiencia del cliente"
    ],
    aiType: "Machine Learning, Document AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial de reclamaciones, pólizas activas, documentos de soporte"
  },

  // Government
  {
    id: "uc_006",
    title: "Redactor de Memorandos de Política",
    category: "Gobierno",
    industry: "Gobierno",
    description: "Generación automatizada de documentos de política mediante análisis de datos económicos y comparación internacional.",
    benefits: [
      "Creación rápida de documentos complejos",
      "Análisis comprehensivo de datos",
      "Consistencia en formato y contenido"
    ],
    aiType: "Generative AI, Research AI",
    complexity: "high",
    impact: "medium",
    dataRequirements: "Documentos gubernamentales, datos económicos, políticas internacionales"
  },
  {
    id: "uc_007",
    title: "Agente de Correspondencia de Subvenciones",
    category: "Gobierno",
    industry: "Gobierno",
    description: "Análisis y correspondencia automática entre perfiles organizacionales y oportunidades de subvenciones.",
    benefits: [
      "Identificación rápida de oportunidades",
      "Mejora en tasa de éxito",
      "Ahorro de tiempo en búsqueda"
    ],
    aiType: "NLP, Matching Algorithms",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Base de datos de subvenciones, perfiles organizacionales"
  },
  {
    id: "uc_008",
    title: "Agente de Cumplimiento Regulatorio",
    category: "Gobierno",
    industry: "Gobierno",
    description: "Validación automática de documentos contra requisitos regulatorios mediante análisis de referencias cruzadas.",
    benefits: [
      "Reducción de errores de cumplimiento",
      "Aceleración de aprobaciones",
      "Mitigación de riesgos legales"
    ],
    aiType: "NLP, Compliance AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Documentación regulatoria, propuestas, contratos"
  },
  {
    id: "uc_009",
    title: "Asistente de Presupuesto y Finanzas",
    category: "Gobierno",
    industry: "Gobierno",
    description: "Análisis automatizado de presupuestos con capacidad de responder consultas en lenguaje natural.",
    benefits: [
      "Insights rápidos sobre finanzas",
      "Identificación de variaciones",
      "Mejora en planificación"
    ],
    aiType: "NLP, Financial AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Datos presupuestarios, reportes financieros"
  },
  {
    id: "uc_010",
    title: "Mesa de Ayuda IT",
    category: "Gobierno",
    industry: "Gobierno",
    description: "Soporte técnico automatizado que resuelve problemas comunes y escala casos complejos con contexto.",
    benefits: [
      "Resolución instantánea de problemas comunes",
      "Reducción de tickets",
      "Mejor experiencia de usuario"
    ],
    aiType: "NLP, Helpdesk AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Base de conocimientos IT, historial de tickets"
  },

  // Finance
  {
    id: "uc_011",
    title: "Generador de Memorandos de Inversión",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Creación automatizada de análisis de inversión a partir de datos financieros y de mercado.",
    benefits: [
      "Generación rápida de análisis",
      "Consistencia en evaluaciones",
      "Mayor cobertura de oportunidades"
    ],
    aiType: "Generative AI, Financial Analysis",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos financieros, información de mercado, análisis históricos"
  },
  {
    id: "uc_012",
    title: "Agente de Comparación de Documentos",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Análisis automatizado de diferencias entre versiones de documentos financieros.",
    benefits: [
      "Identificación rápida de cambios",
      "Reducción de errores",
      "Eficiencia en revisiones"
    ],
    aiType: "Document AI, NLP",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Documentos financieros, contratos, acuerdos"
  },
  {
    id: "uc_013",
    title: "Analista de Earnings Calls",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Análisis y resumen automatizado de conferencias de resultados financieros.",
    benefits: [
      "Insights inmediatos",
      "Identificación de tendencias",
      "Ahorro de tiempo de análisis"
    ],
    aiType: "NLP, Sentiment Analysis",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Transcripciones de earnings calls, datos financieros"
  },
  {
    id: "uc_014",
    title: "Asistente de Hojas de Cálculo",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Chatbot que responde consultas en lenguaje natural sobre datos en hojas de cálculo.",
    benefits: [
      "Acceso rápido a insights",
      "Democratización de datos",
      "Reducción de errores de fórmulas"
    ],
    aiType: "NLP, Data Analysis AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Hojas de cálculo, datos financieros"
  },
  {
    id: "uc_015",
    title: "Asistente de Reconciliación de Estados Financieros",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Automatización de la reconciliación entre diferentes estados y reportes financieros.",
    benefits: [
      "Reducción de tiempo de cierre",
      "Mayor precisión",
      "Identificación temprana de discrepancias"
    ],
    aiType: "Machine Learning, Pattern Recognition",
    complexity: "high",
    impact: "high",
    dataRequirements: "Estados financieros, libros contables, transacciones"
  },
  {
    id: "uc_016",
    title: "Agente de Clasificación de CapEx",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Clasificación automática de gastos de capital según categorías y reglas contables.",
    benefits: [
      "Consistencia en clasificación",
      "Ahorro de tiempo",
      "Mejor reporting"
    ],
    aiType: "Machine Learning, Classification",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Transacciones de CapEx, reglas de clasificación"
  },
  {
    id: "uc_017",
    title: "Automatización KYC",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Proceso automatizado de conocimiento del cliente (KYC) mediante verificación de documentos y datos.",
    benefits: [
      "Aceleración de onboarding",
      "Cumplimiento regulatorio",
      "Reducción de riesgos"
    ],
    aiType: "Document AI, Identity Verification",
    complexity: "high",
    impact: "high",
    dataRequirements: "Documentos de identidad, información corporativa, listas de sanciones"
  },
  {
    id: "uc_018",
    title: "Agente de Reembolsos y Gastos",
    category: "Finanzas",
    industry: "Finanzas",
    description: "Procesamiento automático de solicitudes de reembolso y validación de gastos.",
    benefits: [
      "Aprobaciones más rápidas",
      "Detección de anomalías",
      "Mejor control de gastos"
    ],
    aiType: "Document AI, Rules Engine",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Políticas de gastos, recibos, historial de reembolsos"
  },

  // Education
  {
    id: "uc_019",
    title: "Agente de Correspondencia de Becas",
    category: "Educación",
    industry: "Educación",
    description: "Identificación automática de oportunidades de becas que coincidan con el perfil del estudiante.",
    benefits: [
      "Aumento en acceso a becas",
      "Ahorro de tiempo en búsqueda",
      "Mayor tasa de éxito"
    ],
    aiType: "Matching AI, Recommendation Systems",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Perfiles estudiantiles, base de datos de becas"
  },
  {
    id: "uc_020",
    title: "Asistente de Asesoría Académica",
    category: "Educación",
    industry: "Educación",
    description: "Orientación personalizada sobre programas, requisitos y planificación académica.",
    benefits: [
      "Disponibilidad 24/7",
      "Orientación personalizada",
      "Reducción de carga administrativa"
    ],
    aiType: "NLP, Recommendation Systems",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Catálogos de cursos, requisitos académicos, perfiles estudiantiles"
  },
  {
    id: "uc_021",
    title: "Asistente de Curso",
    category: "Educación",
    industry: "Educación",
    description: "Respuestas automáticas a preguntas sobre contenido del curso basadas en materiales.",
    benefits: [
      "Soporte continuo para estudiantes",
      "Reducción de preguntas repetitivas",
      "Mejor engagement"
    ],
    aiType: "NLP, Generative AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Materiales del curso, syllabus, recursos educativos"
  },
  {
    id: "uc_022",
    title: "Retroalimentación de Escritura",
    category: "Educación",
    industry: "Educación",
    description: "Análisis automatizado de ensayos y trabajos con retroalimentación constructiva.",
    benefits: [
      "Feedback inmediato",
      "Mejora en habilidades de escritura",
      "Escalabilidad para profesores"
    ],
    aiType: "NLP, Writing Analysis AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Trabajos estudiantiles, rúbricas de evaluación"
  },
  {
    id: "uc_023",
    title: "Asistente IT Universitario",
    category: "Educación",
    industry: "Educación",
    description: "Soporte técnico automatizado para estudiantes y personal universitario.",
    benefits: [
      "Resolución rápida de problemas",
      "Reducción de tickets IT",
      "Mejor experiencia de usuario"
    ],
    aiType: "NLP, Helpdesk AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Base de conocimientos IT, historial de soporte"
  },
  {
    id: "uc_024",
    title: "Asistente de Investigación Bibliotecaria",
    category: "Educación",
    industry: "Educación",
    description: "Ayuda en la búsqueda y análisis de recursos académicos y publicaciones.",
    benefits: [
      "Búsquedas más efectivas",
      "Descubrimiento de recursos relevantes",
      "Ahorro de tiempo en investigación"
    ],
    aiType: "NLP, Search AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Catálogo bibliotecario, bases de datos académicas"
  },

  // Private Lending
  {
    id: "uc_025",
    title: "Agente de Borrador de Term Sheet",
    category: "Préstamos Privados",
    industry: "Préstamos Privados",
    description: "Generación automatizada de borradores de hojas de términos para préstamos.",
    benefits: [
      "Creación rápida de documentos",
      "Consistencia en términos",
      "Reducción de errores"
    ],
    aiType: "Generative AI, Document Generation",
    complexity: "high",
    impact: "high",
    dataRequirements: "Templates de term sheets, datos de préstamos, regulaciones"
  },
  {
    id: "uc_026",
    title: "Agente de Revisión de Expedientes de Préstamo",
    category: "Préstamos Privados",
    industry: "Préstamos Privados",
    description: "Análisis automatizado de completitud y precisión de expedientes de préstamo.",
    benefits: [
      "Validación completa",
      "Reducción de rechazos",
      "Aceleración de aprobaciones"
    ],
    aiType: "Document AI, Compliance AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Expedientes de préstamo, requisitos regulatorios"
  },
  {
    id: "uc_027",
    title: "Agente de Cumplimiento de Cierre",
    category: "Préstamos Privados",
    industry: "Préstamos Privados",
    description: "Verificación de cumplimiento de todos los requisitos en el cierre de préstamos.",
    benefits: [
      "Reducción de riesgos legales",
      "Cierres más rápidos",
      "Mayor precisión"
    ],
    aiType: "Compliance AI, Document AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Documentos de cierre, checklist regulatorios"
  },
  {
    id: "uc_028",
    title: "Agente de Riesgo de Aplicación",
    category: "Préstamos Privados",
    industry: "Préstamos Privados",
    description: "Evaluación automática de riesgo crediticio en solicitudes de préstamo.",
    benefits: [
      "Evaluación rápida y consistente",
      "Mejor gestión de riesgos",
      "Reducción de morosidad"
    ],
    aiType: "Machine Learning, Risk Assessment",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial crediticio, datos financieros, modelos de riesgo"
  },
  {
    id: "uc_029",
    title: "Agente de Validación",
    category: "Préstamos Privados",
    industry: "Préstamos Privados",
    description: "Validación cruzada de información en múltiples documentos y fuentes.",
    benefits: [
      "Detección de inconsistencias",
      "Prevención de fraude",
      "Mayor confiabilidad"
    ],
    aiType: "Document AI, Data Validation",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Documentos de aplicación, fuentes de verificación"
  },

  // Banking
  {
    id: "uc_030",
    title: "Agente de Clasificación de Documentos",
    category: "Banca",
    industry: "Banca",
    description: "Clasificación automática de documentos bancarios por tipo y categoría.",
    benefits: [
      "Organización eficiente",
      "Búsqueda rápida",
      "Reducción de errores de archivo"
    ],
    aiType: "Document AI, Classification",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Repositorio de documentos, taxonomía de clasificación"
  },
  {
    id: "uc_031",
    title: "Verificador de Controles",
    category: "Banca",
    industry: "Banca",
    description: "Validación automática de controles internos y procesos de cumplimiento.",
    benefits: [
      "Cumplimiento continuo",
      "Detección temprana de brechas",
      "Reducción de auditorías manuales"
    ],
    aiType: "Compliance AI, Process Mining",
    complexity: "high",
    impact: "high",
    dataRequirements: "Controles internos, logs de procesos, requisitos regulatorios"
  },
  {
    id: "uc_032",
    title: "Chatbot de Cumplimiento",
    category: "Banca",
    industry: "Banca",
    description: "Asistente para consultas sobre regulaciones y políticas de cumplimiento.",
    benefits: [
      "Acceso rápido a información",
      "Consistencia en interpretaciones",
      "Soporte para empleados"
    ],
    aiType: "NLP, Knowledge Management",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Base de conocimientos regulatorios, políticas internas"
  },
  {
    id: "uc_033",
    title: "Agente de Soporte al Cliente",
    category: "Banca",
    industry: "Banca",
    description: "Atención automatizada de consultas y transacciones comunes de clientes.",
    benefits: [
      "Disponibilidad 24/7",
      "Reducción de tiempos de espera",
      "Mayor satisfacción del cliente"
    ],
    aiType: "NLP, Conversational AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "FAQs, historial de consultas, información de productos"
  },
  {
    id: "uc_034",
    title: "Mesa de Ayuda para Banqueros",
    category: "Banca",
    industry: "Banca",
    description: "Soporte interno para empleados bancarios con acceso a información de productos y procesos.",
    benefits: [
      "Respuestas rápidas",
      "Mejora en productividad",
      "Consistencia en información"
    ],
    aiType: "NLP, Knowledge Management",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Manuales de productos, procedimientos internos"
  },

  // Additional cross-industry use cases
  {
    id: "uc_035",
    title: "Detección de Fraude",
    category: "Seguridad",
    industry: "Múltiples",
    description: "Identificación de patrones anómalos y actividades sospechosas en tiempo real.",
    benefits: [
      "Reducción de pérdidas",
      "Detección proactiva",
      "Protección de clientes"
    ],
    aiType: "Machine Learning, Anomaly Detection",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial de transacciones, patrones de fraude conocidos"
  },
  {
    id: "uc_036",
    title: "Mantenimiento Predictivo",
    category: "Operaciones",
    industry: "Manufactura, Utilities",
    description: "Predicción de fallas en equipos antes de que ocurran mediante análisis de datos de sensores.",
    benefits: [
      "Reducción de tiempo fuera de servicio",
      "Optimización de mantenimiento",
      "Ahorro en costos"
    ],
    aiType: "Machine Learning, IoT Analytics",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de sensores, historial de mantenimiento, especificaciones de equipos"
  },
  {
    id: "uc_037",
    title: "Optimización de Cadena de Suministro",
    category: "Operaciones",
    industry: "Retail, Manufactura",
    description: "Predicción de demanda y optimización de inventarios mediante análisis avanzado.",
    benefits: [
      "Reducción de inventario excesivo",
      "Prevención de desabastecimientos",
      "Mejora en márgenes"
    ],
    aiType: "Machine Learning, Forecasting",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial de ventas, datos de inventario, factores externos"
  },
  {
    id: "uc_038",
    title: "Personalización de Marketing",
    category: "Marketing",
    industry: "Retail, E-commerce",
    description: "Recomendaciones personalizadas y campañas segmentadas basadas en comportamiento.",
    benefits: [
      "Aumento en conversión",
      "Mejor experiencia del cliente",
      "ROI de marketing mejorado"
    ],
    aiType: "Recommendation Systems, Segmentation",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Comportamiento de usuario, historial de compras, datos demográficos"
  },
  {
    id: "uc_039",
    title: "Análisis de Sentimiento de Clientes",
    category: "Customer Experience",
    industry: "Múltiples",
    description: "Análisis automatizado de feedback y opiniones de clientes en múltiples canales.",
    benefits: [
      "Insights de clientes en tiempo real",
      "Identificación de problemas",
      "Mejora continua de productos"
    ],
    aiType: "NLP, Sentiment Analysis",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Reviews, redes sociales, encuestas, tickets de soporte"
  },
  {
    id: "uc_040",
    title: "Transcripción y Análisis de Llamadas",
    category: "Customer Service",
    industry: "Múltiples",
    description: "Transcripción automática de llamadas con análisis de calidad y cumplimiento.",
    benefits: [
      "Control de calidad mejorado",
      "Identificación de oportunidades de entrenamiento",
      "Cumplimiento regulatorio"
    ],
    aiType: "Speech-to-Text, NLP",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Grabaciones de llamadas, scripts de calidad"
  },
  {
    id: "uc_041",
    title: "Automatización de Procesos (RPA Inteligente)",
    category: "Operaciones",
    industry: "Múltiples",
    description: "Automatización de tareas repetitivas combinando RPA con capacidades de IA.",
    benefits: [
      "Reducción de costos operativos",
      "Eliminación de errores humanos",
      "Liberación de capacidad para tareas de valor"
    ],
    aiType: "RPA, Machine Learning",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Documentación de procesos, reglas de negocio"
  },
  {
    id: "uc_042",
    title: "Clasificación de Tickets de Soporte",
    category: "IT/Customer Service",
    industry: "Múltiples",
    description: "Clasificación y enrutamiento automático de tickets según prioridad y categoría.",
    benefits: [
      "Tiempo de respuesta reducido",
      "Mejor asignación de recursos",
      "Mayor satisfacción"
    ],
    aiType: "NLP, Classification",
    complexity: "low",
    impact: "medium",
    dataRequirements: "Historial de tickets, categorías definidas"
  },
  {
    id: "uc_043",
    title: "Generación de Reportes Automatizados",
    category: "Business Intelligence",
    industry: "Múltiples",
    description: "Creación automática de reportes narrativos a partir de datos estructurados.",
    benefits: [
      "Ahorro de tiempo",
      "Consistencia en reporting",
      "Insights automatizados"
    ],
    aiType: "Generative AI, NLP",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Datos de negocio, templates de reportes"
  },
  {
    id: "uc_044",
    title: "Traducción Automática",
    category: "Comunicación",
    industry: "Múltiples",
    description: "Traducción de documentos y comunicaciones en múltiples idiomas.",
    benefits: [
      "Expansión global facilitada",
      "Comunicación mejorada",
      "Reducción de costos de traducción"
    ],
    aiType: "NLP, Machine Translation",
    complexity: "low",
    impact: "medium",
    dataRequirements: "Contenido en idioma origen, glosarios especializados"
  },
  {
    id: "uc_045",
    title: "Resumen Automático de Documentos",
    category: "Productividad",
    industry: "Múltiples",
    description: "Generación de resúmenes concisos de documentos largos.",
    benefits: [
      "Ahorro de tiempo de lectura",
      "Mejora en toma de decisiones",
      "Procesamiento rápido de información"
    ],
    aiType: "NLP, Summarization",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Documentos, papers, reportes"
  },
  {
    id: "uc_046",
    title: "Verificación de Identidad Digital",
    category: "Seguridad",
    industry: "Finanzas, Gobierno",
    description: "Autenticación biométrica y verificación de documentos de identidad.",
    benefits: [
      "Mayor seguridad",
      "Experiencia de usuario mejorada",
      "Prevención de fraude"
    ],
    aiType: "Computer Vision, Biometrics",
    complexity: "high",
    impact: "high",
    dataRequirements: "Imágenes faciales, documentos de identidad"
  },
  {
    id: "uc_047",
    title: "Control de Calidad Visual",
    category: "Manufactura",
    industry: "Manufactura",
    description: "Inspección automatizada de productos mediante visión artificial.",
    benefits: [
      "Detección precisa de defectos",
      "Reducción de productos defectuosos",
      "Mejora en consistencia"
    ],
    aiType: "Computer Vision, Image Classification",
    complexity: "high",
    impact: "high",
    dataRequirements: "Imágenes de productos, especificaciones de calidad"
  },
  {
    id: "uc_048",
    title: "Chatbot de Recursos Humanos",
    category: "RRHH",
    industry: "Múltiples",
    description: "Asistente virtual para consultas de empleados sobre políticas, beneficios y procesos.",
    benefits: [
      "Respuestas inmediatas",
      "Reducción de carga en HR",
      "Mejor experiencia de empleados"
    ],
    aiType: "NLP, Conversational AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Políticas de RRHH, manuales de empleados"
  },
  {
    id: "uc_049",
    title: "Análisis de Currículums",
    category: "RRHH",
    industry: "Múltiples",
    description: "Filtrado y clasificación automática de candidatos basado en requisitos del puesto.",
    benefits: [
      "Aceleración del reclutamiento",
      "Identificación de mejores candidatos",
      "Reducción de sesgo"
    ],
    aiType: "NLP, Matching AI",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "CVs, descripciones de puestos, perfiles exitosos"
  },
  {
    id: "uc_050",
    title: "Predicción de Rotación de Empleados",
    category: "RRHH",
    industry: "Múltiples",
    description: "Identificación temprana de empleados en riesgo de abandonar la empresa.",
    benefits: [
      "Retención proactiva",
      "Reducción de costos de rotación",
      "Mejora en planificación"
    ],
    aiType: "Machine Learning, Predictive Analytics",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Datos de empleados, encuestas, historial de rotación"
  },
  {
    id: "uc_051",
    title: "Optimización de Precios Dinámicos",
    category: "Revenue Management",
    industry: "Retail, Hospitality, Airlines",
    description: "Ajuste automático de precios basado en demanda, competencia y otros factores.",
    benefits: [
      "Maximización de ingresos",
      "Respuesta rápida al mercado",
      "Mejor competitividad"
    ],
    aiType: "Machine Learning, Optimization",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial de precios, demanda, datos de competidores"
  },
  {
    id: "uc_052",
    title: "Asistente de Planificación de Rutas",
    category: "Logística",
    industry: "Transporte, Delivery",
    description: "Optimización de rutas de entrega considerando múltiples variables.",
    benefits: [
      "Reducción de costos de combustible",
      "Entregas más rápidas",
      "Menor huella de carbono"
    ],
    aiType: "Optimization, Machine Learning",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de GPS, tráfico, pedidos, capacidad de vehículos"
  },
  {
    id: "uc_053",
    title: "Diagnóstico Médico Asistido",
    category: "Salud",
    industry: "Healthcare",
    description: "Apoyo en diagnóstico mediante análisis de imágenes médicas y datos clínicos.",
    benefits: [
      "Mayor precisión diagnóstica",
      "Detección temprana",
      "Soporte a decisiones clínicas"
    ],
    aiType: "Computer Vision, Medical AI",
    complexity: "high",
    impact: "high",
    dataRequirements: "Imágenes médicas, historiales clínicos, literatura médica"
  },
  {
    id: "uc_054",
    title: "Monitoreo de Pacientes",
    category: "Salud",
    industry: "Healthcare",
    description: "Vigilancia continua de signos vitales con alertas de anomalías.",
    benefits: [
      "Intervención temprana",
      "Reducción de complicaciones",
      "Optimización de recursos"
    ],
    aiType: "IoT Analytics, Anomaly Detection",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de dispositivos médicos, umbrales clínicos"
  },
  {
    id: "uc_055",
    title: "Búsqueda Inteligente de Documentos",
    category: "Knowledge Management",
    industry: "Múltiples",
    description: "Motor de búsqueda semántica que entiende el contexto y significado.",
    benefits: [
      "Búsquedas más precisas",
      "Descubrimiento de información relevante",
      "Ahorro de tiempo"
    ],
    aiType: "NLP, Semantic Search",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Repositorio documental, metadatos"
  },
  {
    id: "uc_056",
    title: "Generación de Contenido de Marketing",
    category: "Marketing",
    industry: "Múltiples",
    description: "Creación automatizada de copy para anuncios, emails y redes sociales.",
    benefits: [
      "Producción de contenido escalable",
      "Consistencia de marca",
      "Rapidez en campañas"
    ],
    aiType: "Generative AI, NLP",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Brand guidelines, contenido histórico, audiencia objetivo"
  },
  {
    id: "uc_057",
    title: "Análisis de Competidores",
    category: "Inteligencia de Mercado",
    industry: "Múltiples",
    description: "Monitoreo y análisis automatizado de actividades de competidores.",
    benefits: [
      "Insights competitivos",
      "Respuesta rápida a cambios",
      "Ventaja estratégica"
    ],
    aiType: "Web Scraping, NLP, Analytics",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Datos públicos de competidores, fuentes web"
  },
  {
    id: "uc_058",
    title: "Validación de Direcciones y Datos",
    category: "Data Quality",
    industry: "Múltiples",
    description: "Verificación y estandarización automática de información de contacto.",
    benefits: [
      "Mejora en calidad de datos",
      "Reducción de devoluciones",
      "Mayor eficiencia en comunicaciones"
    ],
    aiType: "NLP, Data Validation",
    complexity: "low",
    impact: "medium",
    dataRequirements: "Bases de datos de direcciones, reglas de validación"
  },
  {
    id: "uc_059",
    title: "Asistente de Ventas Conversacional",
    category: "Ventas",
    industry: "Múltiples",
    description: "Chatbot que califica prospectos y agenda reuniones automáticamente.",
    benefits: [
      "Generación de leads continua",
      "Calificación automática",
      "Mayor productividad de ventas"
    ],
    aiType: "Conversational AI, Lead Scoring",
    complexity: "medium",
    impact: "high",
    dataRequirements: "CRM data, scripts de calificación, disponibilidad"
  },
  {
    id: "uc_060",
    title: "Análisis Predictivo de Churn",
    category: "Customer Retention",
    industry: "Telecom, SaaS, Finance",
    description: "Predicción de clientes en riesgo de cancelar servicio.",
    benefits: [
      "Retención proactiva",
      "Aumento de lifetime value",
      "Reducción de churn"
    ],
    aiType: "Machine Learning, Predictive Analytics",
    complexity: "high",
    impact: "high",
    dataRequirements: "Datos de uso, interacciones, historial de churn"
  },
  {
    id: "uc_061",
    title: "Clasificación Automática de Emails",
    category: "Productividad",
    industry: "Múltiples",
    description: "Organización inteligente de correos electrónicos por prioridad y categoría.",
    benefits: [
      "Inbox organizado",
      "Priorización automática",
      "Ahorro de tiempo"
    ],
    aiType: "NLP, Classification",
    complexity: "low",
    impact: "low",
    dataRequirements: "Historial de emails, patrones de uso"
  },
  {
    id: "uc_062",
    title: "Extracción de Datos de Facturas",
    category: "Finance/Accounting",
    industry: "Múltiples",
    description: "Digitalización y extracción automática de información de facturas.",
    benefits: [
      "Eliminación de entrada manual",
      "Procesamiento rápido",
      "Reducción de errores"
    ],
    aiType: "OCR, Document AI",
    complexity: "medium",
    impact: "high",
    dataRequirements: "Facturas digitalizadas, formatos de datos de salida"
  },
  {
    id: "uc_063",
    title: "Sistema de Recomendación de Productos",
    category: "E-commerce",
    industry: "Retail",
    description: "Sugerencias personalizadas de productos basadas en comportamiento e historial.",
    benefits: [
      "Aumento en ventas cruzadas",
      "Mejor experiencia de compra",
      "Mayor ticket promedio"
    ],
    aiType: "Recommendation Systems, Collaborative Filtering",
    complexity: "high",
    impact: "high",
    dataRequirements: "Historial de compras, navegación, catálogo de productos"
  },
  {
    id: "uc_064",
    title: "Análisis de Tendencias en Redes Sociales",
    category: "Marketing/Social Media",
    industry: "Múltiples",
    description: "Identificación de tendencias emergentes y temas virales en tiempo real.",
    benefits: [
      "Oportunidades de marketing",
      "Gestión de reputación",
      "Content strategy informado"
    ],
    aiType: "NLP, Trend Analysis",
    complexity: "medium",
    impact: "medium",
    dataRequirements: "Feeds de redes sociales, menciones de marca"
  },
  {
    id: "uc_065",
    title: "Asistente de Código (Code Copilot)",
    category: "Desarrollo de Software",
    industry: "Tecnología",
    description: "Sugerencias y completado automático de código durante el desarrollo.",
    benefits: [
      "Mayor productividad de desarrolladores",
      "Reducción de bugs",
      "Aprendizaje acelerado"
    ],
    aiType: "Generative AI, Code Analysis",
    complexity: "high",
    impact: "high",
    dataRequirements: "Código base, patrones de código, documentación"
  }
];
