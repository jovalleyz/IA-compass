import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase, QuestionnaireResponse, GlobalAnswers } from "@/types/framework";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Lock, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAuth } from "@/hooks/useAuth";
import { calculateValidationResults } from "@/utils/validationUtils";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface TrafficLightValidatorProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
  globalAnswers: GlobalAnswers;
  maturityScore: number;
  maturityLevel: string;
}

const TrafficLightValidator = ({ 
  selectedUseCases, 
  evaluatedUseCases, 
  globalAnswers,
  maturityScore,
  maturityLevel 
}: TrafficLightValidatorProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  
  const validationResults = calculateValidationResults(
    selectedUseCases,
    evaluatedUseCases,
    globalAnswers,
    maturityScore
  );
  
  console.log('[TrafficLightValidator] Maturity Score:', maturityScore, 'Level:', maturityLevel);
  
  const greenCases = validationResults.filter(r => r.status === "green");
  const yellowCases = validationResults.filter(r => r.status === "yellow");
  const redCases = validationResults.filter(r => r.status === "red");
  
  // Calculate average readiness score for display
  const avgReadinessScore = validationResults.length > 0
    ? (validationResults.reduce((sum, r) => sum + r.readinessScore, 0) / validationResults.length).toFixed(1)
    : '0';
  
  // Helper functions for PDF generation
  const getBlockerImpact = (blocker: string): string => {
    const impacts: Record<string, string> = {
      "Datos insuficientes": "Sin datos adecuados, el modelo de IA no podra ser entrenado efectivamente, resultando en predicciones poco confiables y baja precision. Esto compromete directamente el ROI del proyecto.",
      "Calidad de datos": "Datos de baja calidad generan modelos sesgados y resultados incorrectos, llevando a decisiones de negocio erroneas. El costo de correccion post-implementacion puede superar 10x el costo de limpieza previa.",
      "tecnologia necesaria": "La falta de infraestructura tecnologica impide el desarrollo y despliegue de la solucion. Intentar implementar sin la tecnologia correcta resultara en fallas tecnicas y frustracion del equipo.",
      "talento necesario": "Sin el talento adecuado, el proyecto carecera de la expertise necesaria para disenar, implementar y mantener la solucion, aumentando significativamente el riesgo de fracaso.",
      "no preparada": "La resistencia organizacional al cambio puede sabotear incluso la mejor solucion tecnica. Sin buy-in cultural, la adopcion sera minima y el valor generado sera despreciable.",
      "apoyo critico": "Sin el respaldo de stakeholders clave, el proyecto carecera de los recursos, presupuesto y prioridad necesarios para tener exito. Alto riesgo de cancelacion prematura.",
      "no alineado": "Invertir en iniciativas no alineadas con la estrategia corporativa dispersa recursos y genera confusion organizacional. El proyecto puede ser descontinuado ante cambios de prioridades.",
      "Riesgo tecnico muy alto": "Tecnologias experimentales o no probadas introducen alta probabilidad de falla tecnica, retrasos significativos y sobrecostos. Puede comprometer la credibilidad del area de innovacion.",
      "Riesgo operacional": "Riesgos operacionales no mitigados pueden resultar en interrupciones del negocio, perdida de datos criticos o violaciones de compliance, con impactos legales y reputacionales severos."
    };
    
    for (const [key, value] of Object.entries(impacts)) {
      if (blocker.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "Este blocker representa un impedimento critico que debe ser resuelto antes de proceder. El impacto de ignorarlo incluye alto riesgo de fracaso del proyecto y desperdicio de recursos.";
  };

  const getBlockerRecommendation = (blocker: string): string => {
    const recommendations: Record<string, string> = {
      "Datos insuficientes": "Implementar estrategia de recoleccion de datos durante 3-6 meses antes de proceder. Considerar fuentes externas o sinteticas. Consultoras recomendadas: McKinsey Analytics, Deloitte Data Science.",
      "Calidad de datos": "Ejecutar proyecto de limpieza de datos con herramientas ETL (Talend, Informatica). Establecer data governance. Empresas especializadas: Gartner Data Quality, IBM Data Management.",
      "tecnologia": "Evaluar proveedores cloud (AWS, Azure, GCP) o soluciones on-premise. Presupuestar infraestructura necesaria. Partners: Microsoft Solutions, AWS Professional Services.",
      "talento": "Contratar especialistas o formar equipo interno (6-12 meses). Considerar outsourcing inicial. Consultoras: Accenture AI, KPMG Digital Transformation.",
      "no preparada": "Implementar programa de gestion del cambio (Change Management) con ejecutivos. Empresas: Prosci, McKinsey Implementation.",
      "apoyo": "Desarrollar business case robusto con ROI proyectado. Presentar casos de exito similares. Involucrar sponsors ejecutivos.",
      "alineado": "Reevaluar prioridades estrategicas o seleccionar caso de uso diferente mas alineado con objetivos corporativos.",
      "Riesgo tecnico": "Realizar prueba de concepto (PoC) de 2-4 semanas para validar viabilidad tecnica antes de comprometer recursos mayores.",
      "Riesgo operacional": "Desarrollar plan de contingencia detallado. Considerar implementacion por fases con rollback capability."
    };
    
    for (const [key, value] of Object.entries(recommendations)) {
      if (blocker.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "Desarrollar plan de mitigacion especifico con expertos del dominio. Considerar consultoria especializada.";
  };

  const getWarningRecommendation = (warning: string): string => {
    const recommendations: Record<string, string> = {
      "Disponibilidad de datos": "Aumentar cobertura de datos en 20-30 porciento mediante integracion de nuevas fuentes. Plazo: 2-3 meses. Evaluar APIs de terceros o compra de datasets comerciales.",
      "limpieza": "Asignar equipo de data engineering para pipeline de limpieza automatizada. Herramientas: Apache Airflow, dbt, Great Expectations. Presupuestar 1-2 FTEs por 3 meses.",
      "politicas": "Crear comite de gobernanza de datos con representantes de IT, Legal y Negocio. Definir politicas GDPR y compliance. Frameworks: DAMA-DMBOK, COBIT. Timeline: 6-8 semanas.",
      "casos previos": "Buscar benchmarks en industria similar (Gartner, Forrester). Contactar vendors para demos y referencias verificables. Considerar visita a cliente de referencia.",
      "Esfuerzo": "Planificar 6-9 meses de implementacion con enfoque agil. Dividir en sprints de 2 semanas. Considerar MVP para reducir time-to-market a 3-4 meses.",
      "experimental": "Evaluar alternativas mas maduras primero. Si se procede, establecer sandbox environment aislado para testing. Definir criterios de exito claros.",
      "capacitar": "Iniciar reclutamiento 3 meses antes del kick-off. Alternativamente: programa de upskilling interno (Coursera, edX, Udacity). Inversion: 2000-5000 USD por persona.",
      "cambio": "Designar change champions en cada departamento afectado. Plan de comunicacion: town halls mensuales, newsletters semanales. Medir adoption con KPIs.",
      "compromiso": "Organizar workshops ejecutivos para demonstrar valor (ROI proyectado, quick wins). Establecer steering committee con sponsor C-level.",
      "Alineamiento": "Refinar alcance para alineacion con OKRs corporativos del trimestre. Cuantificar impacto en metricas estrategicas.",
      "prioridad": "Reevaluar timing del proyecto. Considerar postponer 6-12 meses hasta que sea prioridad. Alternativamente: reducir scope para quick win.",
      "Riesgo tecnico": "Contratar consultor tecnico senior externo para assessment (2-3 semanas). Establecer hitos de validacion: PoC en semana 4.",
      "mitigacion": "Aplicar framework FMEA (Failure Mode Effects Analysis). Identificar top 10 riesgos, asignar owner. Crear RAID log.",
      "inversion": "Desarrollar modelo financiero detallado: NPV (3-5 anos), payback period, IRR. Incluir costos ocultos: licencias, training, mantenimiento."
    };
    
    for (const [key, value] of Object.entries(recommendations)) {
      if (warning.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "Monitorear de cerca y establecer KPIs para seguimiento continuo. Definir thresholds de escalacion.";
  };

  const generatePDF = (result: typeof validationResults[0]) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Helper function to add colored banner
      const addBanner = (text: string, color: [number, number, number], yPosition: number) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(0, yPosition, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(text, 10, yPosition + 8);
        doc.setTextColor(0, 0, 0);
        return yPosition + 12;
      };
      
      // Helper to add new page with footer
      const addPageWithFooter = () => {
        doc.addPage();
        addFooter();
        return 25;
      };
      
      // Helper to add footer
      const addFooter = () => {
        const pageNum = doc.internal.pages.length - 1;
        doc.setFillColor(41, 128, 185);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("OVM Consulting | Framework de IA Empresarial", 10, pageHeight - 12);
        doc.text(`Pagina ${pageNum}`, pageWidth - 30, pageHeight - 12);
        doc.setFontSize(7);
        doc.text("Todos los derechos reservados. Documento confidencial.", 10, pageHeight - 6);
        doc.setTextColor(0, 0, 0);
      };
      
      // PORTADA
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INFORME DE VALIDACION", pageWidth / 2, 35, { align: "center" });
      doc.setFontSize(16);
      doc.text("Caso de Uso - Inteligencia Artificial", pageWidth / 2, 50, { align: "center" });
      
      doc.setFillColor(52, 73, 94);
      doc.rect(0, 80, pageWidth, 30, 'F');
      doc.setFontSize(18);
      const titleLines = doc.splitTextToSize(result.useCase.title, pageWidth - 40);
      const titleY = 90 + (titleLines.length > 1 ? 0 : 5);
      doc.text(titleLines, pageWidth / 2, titleY, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPos = 125;
      
      // Estado del caso
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ESTADO DE VALIDACION:", 20, yPos);
      yPos += 10;
      
      const statusColor = result.status === "green" ? [39, 174, 96] : 
                         result.status === "yellow" ? [241, 196, 15] : [231, 76, 60];
      const statusText = result.status === "green" ? "LISTO PARA IMPLEMENTAR" : 
                        result.status === "yellow" ? "REQUIERE PREPARACION" : "NO RECOMENDADO";
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(20, yPos, 80, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(statusText, 60, yPos + 10, { align: "center" });
      doc.setTextColor(0, 0, 0);
      
      yPos += 25;
      
      // Metricas clave
      doc.setFillColor(236, 240, 241);
      doc.rect(15, yPos, pageWidth - 30, 35, 'F');
      doc.setDrawColor(189, 195, 199);
      doc.rect(15, yPos, pageWidth - 30, 35);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Puntaje de Preparacion:", 20, yPos + 10);
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text(`${result.readinessScore}/10`, 80, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Gap de Madurez:", 20, yPos + 22);
      doc.setFontSize(14);
      doc.setTextColor(231, 76, 60);
      doc.text(`${result.maturityGap > 0 ? '+' : ''}${result.maturityGap.toFixed(1)}`, 80, yPos + 22);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(`Madurez Organizacional: ${maturityScore.toFixed(1)}/5 (${maturityLevel})`, 120, yPos + 16);
      
      yPos += 45;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(`Fecha de generacion: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}`, 20, yPos);
      
      addFooter();
      
      // PAGINA 2: RESUMEN EJECUTIVO
      yPos = addPageWithFooter();
      yPos = addBanner("RESUMEN EJECUTIVO", [41, 128, 185], yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Descripcion del Caso de Uso:", 20, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(result.useCase.description || "Sin descripcion disponible.", pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 6 + 10;
      
      // Contexto de Negocio
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Contexto de Negocio:", 20, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const businessContext = `Este caso de uso ha sido evaluado en el contexto de una organizacion con nivel de madurez ${maturityLevel} (${maturityScore.toFixed(1)}/5), considerando capacidades actuales en datos, tecnologia, talento y alineacion estrategica. El analisis contempla la viabilidad tecnica, operacional y el retorno esperado de la inversion.`;
      const contextLines = doc.splitTextToSize(businessContext, pageWidth - 40);
      doc.text(contextLines, 20, yPos);
      yPos += contextLines.length * 6 + 10;
      
      // Hallazgos Principales
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Hallazgos Principales:", 20, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const findings = [
        `Bloqueadores críticos identificados: ${result.bloqueadores.length}`,
        `Advertencias a resolver: ${result.warnings.length}`,
        `Nivel de preparacion: ${result.readinessScore >= 7 ? 'Alto' : result.readinessScore >= 4 ? 'Medio' : 'Bajo'}`,
        `Gap de madurez requerido: ${result.maturityGap > 1 ? 'Significativo' : result.maturityGap > 0 ? 'Moderado' : 'Minimo'}`
      ];
      
      findings.forEach(finding => {
        doc.text(`- ${finding}`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;
      
      // Recomendacion estrategica
      doc.setFillColor(255, 243, 205);
      doc.rect(15, yPos, pageWidth - 30, 30, 'F');
      doc.setDrawColor(243, 156, 18);
      doc.rect(15, yPos, pageWidth - 30, 30);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("RECOMENDACION ESTRATEGICA:", 20, yPos + 10);
      yPos += 18;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const mainRecommendation = result.status === "green" 
        ? "Se recomienda proceder con la implementacion. La organizacion cuenta con las capacidades necesarias."
        : result.status === "yellow"
        ? "Se requiere trabajo preparatorio antes de implementar. Resolver advertencias identificadas en un plazo de 2-4 meses."
        : "No se recomienda proceder en este momento. Es necesario resolver bloqueadores críticos antes de continuar.";
      
      const recLines = doc.splitTextToSize(mainRecommendation, pageWidth - 50);
      doc.text(recLines, 20, yPos);
      
      // PAGINA 3: ANALISIS DETALLADO - BLOQUEADORES
      if (result.bloqueadores.length > 0) {
        yPos = addPageWithFooter();
        yPos = addBanner("ANÁLISIS DETALLADO - BLOQUEADORES CRÍTICOS", [231, 76, 60], yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const bloqueadorIntro = "Los siguientes bloqueadores críticos deben ser resueltos obligatoriamente antes de proceder con la implementación. Cada bloqueador incluye un análisis de impacto y recomendaciones específicas de mitigación basadas en mejores prácticas internacionales.";
        const introLines = doc.splitTextToSize(bloqueadorIntro, pageWidth - 40);
        doc.text(introLines, 20, yPos);
        yPos += introLines.length * 6 + 12;
        
        result.bloqueadores.forEach((bloqueador, idx) => {
          if (yPos > pageHeight - 80) {
            yPos = addPageWithFooter();
          }
          
          // Titulo del bloqueador
          doc.setFillColor(231, 76, 60);
          doc.rect(20, yPos, 5, 5, 'F');
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(`Bloqueador ${idx + 1}:`, 28, yPos + 4);
          yPos += 10;
          
          // Descripcion del bloqueador
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const bloqueadorLines = doc.splitTextToSize(bloqueador, pageWidth - 50);
          doc.text(bloqueadorLines, 25, yPos);
          yPos += bloqueadorLines.length * 6 + 8;
          
          // Impacto
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("IMPACTO:", 25, yPos);
          yPos += 6;
          
          doc.setFont("helvetica", "normal");
          const impact = getBlockerImpact(bloqueador);
          const impactLines = doc.splitTextToSize(impact, pageWidth - 50);
          doc.text(impactLines, 25, yPos);
          yPos += impactLines.length * 5 + 6;
          
          // Recomendaciones
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("RECOMENDACIONES DE MITIGACION:", 25, yPos);
          yPos += 6;
          
          doc.setFont("helvetica", "normal");
          const recommendation = getBlockerRecommendation(bloqueador);
          const recLines = doc.splitTextToSize(recommendation, pageWidth - 50);
          doc.text(recLines, 25, yPos);
          yPos += recLines.length * 5 + 8;
          
          // Linea separadora
          if (idx < result.bloqueadores.length - 1) {
            doc.setDrawColor(189, 195, 199);
            doc.line(20, yPos, pageWidth - 20, yPos);
            yPos += 8;
          }
        });
      }
      
      // PAGINA 4: ADVERTENCIAS
      if (result.warnings.length > 0) {
        yPos = addPageWithFooter();
        yPos = addBanner("ADVERTENCIAS Y AREAS DE MEJORA", [241, 196, 15], yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const warningIntro = "Las siguientes advertencias representan areas de mejora que, aunque no bloquean la implementacion, deben ser atendidas para maximizar las probabilidades de exito del proyecto.";
        const introLines = doc.splitTextToSize(warningIntro, pageWidth - 40);
        doc.text(introLines, 20, yPos);
        yPos += introLines.length * 6 + 12;
        
        result.warnings.forEach((warning, idx) => {
          if (yPos > pageHeight - 70) {
            yPos = addPageWithFooter();
          }
          
          doc.setFillColor(241, 196, 15);
          doc.rect(20, yPos, 5, 5, 'F');
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(`Advertencia ${idx + 1}:`, 28, yPos + 4);
          yPos += 10;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const warningLines = doc.splitTextToSize(warning, pageWidth - 50);
          doc.text(warningLines, 25, yPos);
          yPos += warningLines.length * 6 + 8;
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("PLAN DE ACCION:", 25, yPos);
          yPos += 6;
          
          doc.setFont("helvetica", "normal");
          const actionPlan = getWarningRecommendation(warning);
          const actionLines = doc.splitTextToSize(actionPlan, pageWidth - 50);
          doc.text(actionLines, 25, yPos);
          yPos += actionLines.length * 5 + 10;
        });
      }
      
      // PAGINA FINAL: RECOMENDACIONES ESTRATEGICAS Y PROXIMOS PASOS
      yPos = addPageWithFooter();
      yPos = addBanner("RECOMENDACIONES ESTRATEGICAS Y PROXIMOS PASOS", [39, 174, 96], yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Plan de Accion Recomendado:", 20, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      result.recommendations.forEach((rec, idx) => {
        if (yPos > pageHeight - 60) {
          yPos = addPageWithFooter();
        }
        
        const recText = rec.replace(/[✅⚠️🛑]/g, '').trim();
        const recLines = doc.splitTextToSize(`${idx + 1}. ${recText}`, pageWidth - 50);
        doc.text(recLines, 25, yPos);
        yPos += recLines.length * 6 + 5;
      });
      
      yPos += 10;
      
      // Timeline sugerido
      if (yPos > pageHeight - 80) {
        yPos = addPageWithFooter();
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Timeline Sugerido:", 20, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const timeline = result.status === "green" 
        ? [
            "Semanas 1-2: Formacion de equipo y planificacion detallada",
            "Semanas 3-6: Fase de piloto en ambiente controlado",
            "Semanas 7-12: Escalamiento gradual y ajustes",
            "Semanas 13+: Operacion completa y optimizacion continua"
          ]
        : result.status === "yellow"
        ? [
            "Mes 1-2: Resolucion de advertencias prioritarias",
            "Mes 3: Validacion de mejoras implementadas",
            "Mes 4-5: Inicio de piloto limitado",
            "Mes 6+: Evaluacion de resultados y decision de escalamiento"
          ]
        : [
            "Trimestre 1: Resolución de bloqueadores críticos",
            "Trimestre 2: Desarrollo de capacidades faltantes",
            "Trimestre 3: Re-evaluacion de viabilidad",
            "Trimestre 4+: Decision de proceder basada en nueva evaluacion"
          ];
      
      timeline.forEach(item => {
        if (yPos > pageHeight - 50) {
          yPos = addPageWithFooter();
        }
        const itemLines = doc.splitTextToSize(`- ${item}`, pageWidth - 50);
        doc.text(itemLines, 25, yPos);
        yPos += itemLines.length * 6 + 3;
      });
      
      // Contacto
      if (yPos > pageHeight - 70) {
        yPos = addPageWithFooter();
      }
      
      yPos += 15;
      doc.setFillColor(236, 240, 241);
      doc.rect(15, yPos, pageWidth - 30, 30, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Contacto para Consulta Especializada:", 20, yPos + 10);
      yPos += 18;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Para acompanamiento en la implementacion, contacte a:", 20, yPos);
      yPos += 6;
      doc.text("OVM Consulting - contacto@ovm-consulting.com", 20, yPos);
      
      // Save
      const fileName = `Informe_Validacion_${result.useCase.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <CardTitle>Resumen de Validación</CardTitle>
          <CardDescription>
            Análisis de preparación organizacional para implementación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Explicación de modelos de madurez */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {maturityScore.toFixed(1)}
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    📊 Nivel de Madurez Organizacional
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Escala 1-5: {maturityLevel}
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200 pl-10">
                Indica la capacidad <strong>general</strong> de su organización para adoptar IA, 
                promediando las 6 dimensiones evaluadas (Estrategia, Datos, Tecnología, Personas, Valor, Riesgos).
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                  {avgReadinessScore}
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">
                    ✅ Verificación de Controles (Readiness)
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Escala 0-10: Promedio {avgReadinessScore}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-800 dark:text-green-200 pl-10">
                Indica qué tan preparada está su organización para ejecutar <strong>cada caso de uso específico</strong>, 
                considerando bloqueadores críticos, advertencias y disponibilidad de recursos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-700 dark:text-green-400">Listos</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">{greenCases.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pueden iniciar implementación
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">En Preparación</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{yellowCases.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Requieren trabajo previo
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-700 dark:text-red-400">No Recomendados</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">{redCases.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bloqueadores críticos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <div className="space-y-4">
        {validationResults.map((result) => {
          const statusConfig = {
            green: {
              color: "bg-green-100 dark:bg-green-950/20 border-green-300",
              icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
              badge: "bg-green-600",
              title: "Listo para Implementar"
            },
            yellow: {
              color: "bg-yellow-100 dark:bg-yellow-950/20 border-yellow-300",
              icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
              badge: "bg-yellow-600",
              title: "Requiere Preparación"
            },
            red: {
              color: "bg-red-100 dark:bg-red-950/20 border-red-300",
              icon: <AlertCircle className="h-6 w-6 text-red-600" />,
              badge: "bg-red-600",
              title: "No Recomendado"
            }
          };
          
          const config = statusConfig[result.status];
          
          return (
            <Card key={result.useCase.id} className={config.color}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {config.icon}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {result.useCase.title}
                        <Badge className={config.badge}>{config.title}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {result.useCase.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Preparación</div>
                    <div className="text-2xl font-bold">{result.readinessScore}/10</div>
                    {result.maturityGap !== 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Gap: {result.maturityGap > 0 ? `+${result.maturityGap}` : result.maturityGap}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAdmin ? (
                  <>
                    {/* Bloqueadores */}
                    {result.bloqueadores.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Bloqueadores Críticos
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.bloqueadores.map((bloqueador, idx) => (
                            <li key={idx} className="text-red-600 dark:text-red-400">{bloqueador}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Advertencias
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx} className="text-yellow-600 dark:text-yellow-400">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-2">Recomendaciones</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* PDF Download Button for Admins */}
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => generatePDF(result)}
                        className="w-full"
                        variant="default"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Informe Completo (PDF)
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">Análisis Detallado Disponible</h4>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Para acceder al análisis completo de bloqueadores críticos, advertencias y recomendaciones personalizadas, 
                        contacta con nuestros expertos de OVM Consulting.
                      </p>
                    </div>
                    <Button 
                      onClick={() => window.open('mailto:contacto@ovm-consulting.com?subject=Solicitud%20de%20Informe%20Completo%20-%20' + encodeURIComponent(result.useCase.title), '_blank')}
                      className="mt-4"
                    >
                      Solicitar Informe Completo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TrafficLightValidator;
