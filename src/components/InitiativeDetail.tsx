import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Users, Edit2, Check, X, Download, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InitiativeStages } from "@/components/InitiativeStages";
import { InitiativeCollaborators } from "@/components/InitiativeCollaborators";
import { InitiativeComments } from "@/components/InitiativeComments";
import { InitiativeActivityLog } from "@/components/InitiativeActivityLog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import jsPDF from "jspdf";

interface Initiative {
  id: string;
  nombre: string;
  prioridad: string;
  unidad_negocio: string | null;
  puntaje_total: number | null;
  recomendacion: string;
  descripcion: string | null;
  status_general: string | null;
  porcentaje_avance: number | null;
  fecha_cierre_comprometida: string | null;
  use_case_id: string | null;
}

interface UseCase {
  id: string;
  nombre: string;
  respuestas: any;
}

interface InitiativeDetailProps {
  initiativeId: string;
  onBack: () => void;
}

export const InitiativeDetail = ({ initiativeId, onBack }: InitiativeDetailProps) => {
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [isEditingBusinessUnit, setIsEditingBusinessUnit] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [tempBusinessUnit, setTempBusinessUnit] = useState('');
  const [openBusinessUnitPopover, setOpenBusinessUnitPopover] = useState(false);
  const [generatingActivities, setGeneratingActivities] = useState(false);
  const [activitiesGenerated, setActivitiesGenerated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInitiative();
    loadBusinessUnits();
  }, [initiativeId]);

  const loadBusinessUnits = async () => {
    const { data, error } = await supabase
      .from('business_units')
      .select('nombre')
      .order('nombre');

    if (!error && data) {
      setBusinessUnits(data.map(bu => bu.nombre));
    }
  };

  const loadInitiative = async () => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', initiativeId)
        .single();

      if (error) throw error;

      setInitiative(data);
      
      // Cargar caso de uso si existe
      if (data.use_case_id) {
        const { data: useCaseData } = await supabase
          .from('use_cases')
          .select('id, nombre, respuestas')
          .eq('id', data.use_case_id)
          .single();
        
        if (useCaseData) {
          setUseCase(useCaseData);
        }
      }
    } catch (error) {
      console.error('Error loading initiative:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la iniciativa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    if (!useCase || !initiative) {
      toast({
        title: "Error",
        description: "No hay datos del caso de uso para generar el informe",
        variant: "destructive",
      });
      return;
    }

    try {
      // Obtener respuestas del caso de uso
      const respuestas = useCase.respuestas as any;
      if (!respuestas) {
        toast({
          title: "Error",
          description: "No hay respuestas evaluadas para este caso de uso",
          variant: "destructive",
        });
        return;
      }

      // Obtener evaluación global del usuario
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: evaluation } = await supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const maturityScore = evaluation?.puntaje_total || 0;
      
      if (maturityScore === 0) {
        toast({
          title: "Advertencia",
          description: "No se encontró puntaje de madurez calculado. Completar evaluación global.",
          variant: "destructive",
        });
      }
      const maturityLevel = maturityScore >= 3.5 ? "Avanzado" : maturityScore >= 2.5 ? "Intermedio" : "Inicial";

      // Calcular validación del caso de uso (misma lógica que TrafficLightValidator)
      const bloqueadores: string[] = [];
      const warnings: string[] = [];
      
      // Validar tecnología
      if (respuestas.tecnologia_1 === false) {
        bloqueadores.push("[CRITICO - Tecnologia] No cuenta con infraestructura de IA en la nube (AWS, Azure, GCP)");
      }
      if (respuestas.tecnologia_2 === false) {
        bloqueadores.push("[CRITICO - Tecnologia] No cuenta con plataformas de MLOps");
      }
      
      // Validar personas/talento
      if (respuestas.personas_2 && respuestas.personas_2 < 3) {
        warnings.push("[ATENCION - Talento] Capacidades internas de IA insuficientes");
      }
      
      // Validar riesgos
      if (respuestas.riesgos_3 === false) {
        warnings.push("[ATENCION - Riesgos] No cuenta con framework de etica y gobernanza de IA");
      }
      if (respuestas.riesgos_1 === false) {
        warnings.push("[ATENCION - Riesgos] No cuenta con plan de mitigacion de sesgos algoritmicos");
      }
      
      // Validar ROI
      if (respuestas.valor_3 === "Baja" || respuestas.valor_3_nivel < 3) {
        warnings.push("[ATENCION - ROI] Baja certeza en retorno de inversion");
      }

      // Calcular scores
      let readinessScore = 10;
      readinessScore -= bloqueadores.length * 2;
      readinessScore -= warnings.length * 0.5;
      readinessScore = Math.max(0, Math.min(10, readinessScore));

      const maturityGap = (respuestas.nivel_madurez_requerido || 3) - maturityScore;
      
      const status = readinessScore >= 7 ? "green" : readinessScore >= 4 ? "yellow" : "red";

      // Generar PDF con la misma lógica que TrafficLightValidator
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      const getBlockerImpact = (blocker: string): string => {
        const impacts: { [key: string]: string } = {
          "infraestructura": "Sin infraestructura cloud escalable, el modelo de IA no podra entrenarse ni desplegarse en produccion. Esto impide cualquier implementacion real.",
          "MLOps": "La ausencia de MLOps significa: imposibilidad de versionar modelos, monitorear rendimiento en produccion, detectar data drift, y mantener calidad del servicio. El modelo degradara rapidamente sin deteccion.",
          "datos estructurados": "Modelos de IA requieren datos limpios y estructurados. Datos en silos/Excel impiden entrenamiento efectivo y generan predicciones erroneas.",
          "gobierno": "Sin gobierno de datos: riesgo de uso indebido de informacion sensible, incumplimiento GDPR/regulaciones, exposicion legal significativa.",
          "ROI": "Sin modelo financiero claro: imposibilidad de justificar inversion ante stakeholders, riesgo de cancelacion de proyecto, falta de metricas de exito.",
        };
        for (const [key, value] of Object.entries(impacts)) {
          if (blocker.toLowerCase().includes(key.toLowerCase())) {
            return value;
          }
        }
        return "Este blocker impide la implementacion exitosa del caso de uso y debe resolverse antes de proceder.";
      };

      const getBlockerRecommendation = (blocker: string): string => {
        const recommendations: { [key: string]: string } = {
          "infraestructura": "Contratar servicio cloud (AWS SageMaker, Azure ML, Google Vertex AI). Presupuesto inicial: $5-15K/mes. Tiempo de setup: 2-4 semanas. Consultoras especializadas: Accenture, Deloitte, IBM.",
          "MLOps": "Implementar plataforma MLOps (MLflow, Kubeflow, o SageMaker Pipelines). Establecer CI/CD para modelos. Contratar MLOps Engineer o capacitar equipo existente. Costo: $80-150K anuales.",
          "datos estructurados": "Proyecto de Data Engineering: ETL pipelines, data warehouse (Snowflake/BigQuery), data quality frameworks. Duracion: 3-6 meses. Inversion: $150-300K. Partners: Databricks, Snowflake.",
          "gobierno": "Desarrollar Data Governance Framework: politicas de acceso, clasificacion de datos (PII, sensible, publico), auditoria, encriptacion. Consultoria: PwC, EY. Tiempo: 2-3 meses.",
          "ROI": "Desarrollar business case detallado: NPV analysis (3-5 anos), identificar quick wins, pilotos medibles. Incluir costos ocultos: training, mantenimiento, escalamiento. Consultoria estrategica recomendada.",
        };
        for (const [key, value] of Object.entries(recommendations)) {
          if (blocker.toLowerCase().includes(key.toLowerCase())) {
            return value;
          }
        }
        return "Establecer plan de accion con hitos claros, presupuesto asignado y responsables definidos. Considerar consultoria externa especializada.";
      };

      const getWarningRecommendation = (warning: string): string => {
        const recommendations: { [key: string]: string } = {
          "talento": "Programa de upskilling: Coursera/Udacity para equipo (AI/ML fundamentals, $400-800/persona). Contratar AI Engineer senior ($120-180K/ano) o Staff Augmentation. Alternativamente: socios como DataRobot, H2O.ai para AutoML.",
          "etica": "Implementar AI Ethics Framework: comite de etica IA, evaluacion de impacto algoritmico, transparencia de decisiones. Frameworks: IEEE, EU AI Act guidelines. Consultoria: McKinsey, BCG AI practices.",
          "sesgos": "Desarrollar bias testing framework: auditorias de fairness (equalized odds, demographic parity), diverse training data, A/B testing con grupos demograficos. Tools: IBM AI Fairness 360, Google What-If.",
          "ROI": "Validar hipotesis de valor: pilotos controlados, metricas de negocio claras (revenue impact, cost savings, efficiency gains), benchmarking con industria. Considerar retorno gradual vs. transformacional.",
          "inversion": "Desarrollar modelo financiero detallado: NPV (3-5 anos), payback period, IRR. Incluir costos ocultos: licencias, training, mantenimiento.",
        };
        for (const [key, value] of Object.entries(recommendations)) {
          if (warning.toLowerCase().includes(key.toLowerCase())) {
            return value;
          }
        }
        return "Monitorear de cerca y establecer KPIs para seguimiento continuo. Definir thresholds de escalacion.";
      };
      
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
      
      const addPageWithFooter = () => {
        doc.addPage();
        addFooter();
        return 25;
      };
      
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
      const titleLines = doc.splitTextToSize(useCase.nombre, pageWidth - 40);
      const titleY = 90 + (titleLines.length > 1 ? 0 : 5);
      doc.text(titleLines, pageWidth / 2, titleY, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPos = 125;
      
      // Estado del caso
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ESTADO DE VALIDACION:", 20, yPos);
      yPos += 10;
      
      const statusColor = status === "green" ? [39, 174, 96] : 
                         status === "yellow" ? [241, 196, 15] : [231, 76, 60];
      const statusText = status === "green" ? "LISTO PARA IMPLEMENTAR" : 
                        status === "yellow" ? "REQUIERE PREPARACION" : "NO RECOMENDADO";
      
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
      doc.text(`${readinessScore.toFixed(1)}/10`, 80, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Gap de Madurez:", 20, yPos + 22);
      doc.setFontSize(14);
      doc.setTextColor(231, 76, 60);
      doc.text(`${maturityGap > 0 ? '+' : ''}${maturityGap.toFixed(1)}`, 80, yPos + 22);
      
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
      
      // Agregar páginas adicionales con detalles de bloqueadores y warnings si existen
      if (bloqueadores.length > 0 || warnings.length > 0) {
        yPos = addPageWithFooter();
        yPos = addBanner("ANÁLISIS DETALLADO", [41, 128, 185], yPos);
        yPos += 10;

        if (bloqueadores.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("Bloqueadores Críticos:", 20, yPos);
          yPos += 8;

          bloqueadores.forEach((bloqueador, index) => {
            if (yPos > pageHeight - 40) {
              yPos = addPageWithFooter();
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(231, 76, 60);
            const bloqueadorLines = doc.splitTextToSize(`${index + 1}. ${bloqueador}`, pageWidth - 40);
            doc.text(bloqueadorLines, 25, yPos);
            yPos += bloqueadorLines.length * 5 + 5;

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const impactLines = doc.splitTextToSize(`Impacto: ${getBlockerImpact(bloqueador)}`, pageWidth - 50);
            doc.text(impactLines, 30, yPos);
            yPos += impactLines.length * 5 + 5;

            const recLines = doc.splitTextToSize(`Recomendación: ${getBlockerRecommendation(bloqueador)}`, pageWidth - 50);
            doc.text(recLines, 30, yPos);
            yPos += recLines.length * 5 + 10;
          });
        }

        if (warnings.length > 0) {
          if (yPos > pageHeight - 60) {
            yPos = addPageWithFooter();
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("Advertencias:", 20, yPos);
          yPos += 8;

          warnings.forEach((warning, index) => {
            if (yPos > pageHeight - 40) {
              yPos = addPageWithFooter();
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(243, 156, 18);
            const warningLines = doc.splitTextToSize(`${index + 1}. ${warning}`, pageWidth - 40);
            doc.text(warningLines, 25, yPos);
            yPos += warningLines.length * 5 + 5;

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const recLines = doc.splitTextToSize(`Recomendacion: ${getWarningRecommendation(warning)}`, pageWidth - 50);
            doc.text(recLines, 30, yPos);
            yPos += recLines.length * 5 + 10;
          });
        }
      }

      doc.save(`Informe_${useCase.nombre.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "Éxito",
        description: "Informe PDF generado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe PDF",
        variant: "destructive",
      });
    }
  };

  const generateActivitiesFromValidation = async () => {
    if (!useCase || !initiative) return;

    setGeneratingActivities(true);

    try {
      // Buscar la etapa de Diagnóstico
      const { data: stages } = await supabase
        .from('initiative_stages')
        .select('id, etapa')
        .eq('initiative_id', initiativeId)
        .eq('etapa', 'Diagnóstico')
        .single();

      if (!stages) {
        toast({
          title: "Error",
          description: "No se encontró la etapa de Diagnóstico",
          variant: "destructive",
        });
        setGeneratingActivities(false);
        return;
      }

      const validationResults = useCase.respuestas?.validation_results || {};
      const activitiesToCreate = [];

      // Convertir bloqueadores en actividades
      if (validationResults.bloqueadores && validationResults.bloqueadores.length > 0) {
        validationResults.bloqueadores.forEach((bloqueador: any) => {
          activitiesToCreate.push({
            stage_id: stages.id,
            nombre: `[CRÍTICO] ${bloqueador.title || bloqueador}`,
            notas: bloqueador.description || bloqueador,
            status: 'no_iniciado',
            responsable: null,
          });
        });
      }

      // Convertir warnings en actividades
      if (validationResults.warnings && validationResults.warnings.length > 0) {
        validationResults.warnings.forEach((warning: any) => {
          activitiesToCreate.push({
            stage_id: stages.id,
            nombre: `[ATENCIÓN] ${warning.title || warning}`,
            notas: warning.description || warning,
            status: 'no_iniciado',
            responsable: null,
          });
        });
      }

      if (activitiesToCreate.length === 0) {
        toast({
          title: "Sin brechas detectadas",
          description: "No hay bloqueadores ni advertencias para convertir en actividades",
        });
        setGeneratingActivities(false);
        return;
      }

      // Insertar actividades en la base de datos
      const { error } = await supabase
        .from('initiative_activities')
        .insert(activitiesToCreate);

      if (error) throw error;

      toast({
        title: "Actividades generadas",
        description: `Se crearon ${activitiesToCreate.length} actividades en la etapa de Diagnóstico`,
      });

      setActivitiesGenerated(true);
      
      // Recargar la página para mostrar las nuevas actividades
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error generating activities:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar las actividades",
        variant: "destructive",
      });
      setGeneratingActivities(false);
    }
  };

  const handleUpdateBusinessUnit = async () => {
    if (!initiative || !tempBusinessUnit.trim()) return;

    try {
      const { error } = await supabase
        .from('initiatives')
        .update({ unidad_negocio: tempBusinessUnit.trim() })
        .eq('id', initiativeId);

      if (error) throw error;

      setInitiative({ ...initiative, unidad_negocio: tempBusinessUnit.trim() });
      setIsEditingBusinessUnit(false);
      toast({
        title: "Unidad de negocio actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error updating business unit:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de negocio",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando iniciativa...</p>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <p className="text-muted-foreground">Iniciativa no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a iniciativas
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{initiative.nombre}</h1>
              {initiative.descripcion && (
                <p className="text-muted-foreground">{initiative.descripcion}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Badge>{initiative.prioridad}</Badge>
                {initiative.unidad_negocio && (
                  <Badge variant="outline">{initiative.unidad_negocio}</Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {useCase && (
                <>
                  <Button
                    variant="outline"
                    onClick={generatePDFReport}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Informe PDF
                  </Button>
                  <Button
                    variant={activitiesGenerated ? "default" : "outline"}
                    onClick={generateActivitiesFromValidation}
                    disabled={generatingActivities || activitiesGenerated}
                    className={`gap-2 transition-all duration-300 ${
                      !activitiesGenerated && !generatingActivities
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 animate-pulse'
                        : activitiesGenerated
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : ''
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {generatingActivities ? 'Generando...' : activitiesGenerated ? '✓ Actividades Generadas' : 'Generar Actividades desde Brechas'}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => setShowCollaborators(true)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Gestionar colaboradores
              </Button>
            </div>
          </div>
        </div>

        {/* Información general */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status General</CardTitle>
              <CardDescription className="text-xs">Estado actual de la iniciativa</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={initiative.status_general === 'activa' ? 'default' : 'secondary'} className="text-base px-3 py-1">
                {initiative.status_general || 'activa'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">% de Avance</CardTitle>
              <CardDescription className="text-xs">Progreso del plan de proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={initiative.porcentaje_avance || 0} className="h-2" />
                <p className="text-2xl font-bold">{initiative.porcentaje_avance || 0}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Fecha de Cierre</CardTitle>
              <CardDescription className="text-xs">Compromiso de cierre del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {initiative.fecha_cierre_comprometida 
                  ? new Date(initiative.fecha_cierre_comprometida).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'No definida'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Puntaje de Madurez</CardTitle>
              <CardDescription className="text-xs">Nivel de preparación en IA</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {initiative.puntaje_total && initiative.puntaje_total > 0 
                  ? initiative.puntaje_total.toFixed(1) 
                  : '0.0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Escala de 1 a 5</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recomendación</CardTitle>
              <CardDescription className="text-xs">Acción sugerida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className="text-base px-3 py-1">
                {initiative.recomendacion.replace(/_/g, ' ')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {initiative.recomendacion === 'implementar_ahora' && 
                  'La organización tiene alta madurez (≥3.5) y está lista para implementar este caso de uso de manera inmediata.'}
                {initiative.recomendacion === 'analizar_mas' && 
                  'Se requiere análisis adicional. La madurez organizacional es intermedia (2.5-3.4) y es necesario evaluar capacidades específicas antes de proceder.'}
                {initiative.recomendacion === 'postergar' && 
                  'La madurez organizacional es baja (<2.5). Se recomienda fortalecer capacidades fundamentales en estrategia, datos y tecnología antes de implementar este caso de uso.'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Unidad de Negocio
                {!isEditingBusinessUnit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingBusinessUnit(true);
                      setTempBusinessUnit(initiative.unidad_negocio || '');
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="text-xs">Área responsable</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingBusinessUnit ? (
                <div className="space-y-2">
                  <Popover open={openBusinessUnitPopover} onOpenChange={setOpenBusinessUnitPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between text-sm"
                      >
                        {tempBusinessUnit || "Seleccionar o escribir..."}
                        <Edit2 className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-background border-border z-50">
                      <Command className="bg-background">
                        <CommandInput 
                          placeholder="Buscar o crear unidad de negocio..." 
                          value={tempBusinessUnit}
                          onValueChange={setTempBusinessUnit}
                        />
                        {businessUnits.filter(unit => 
                          unit.toLowerCase().includes(tempBusinessUnit.toLowerCase())
                        ).length === 0 && tempBusinessUnit ? (
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                // Usar el valor personalizado
                                setOpenBusinessUnitPopover(false);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Crear "{tempBusinessUnit}"
                            </Button>
                          </CommandEmpty>
                        ) : (
                          <CommandEmpty>No se encontró unidad de negocio.</CommandEmpty>
                        )}
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          {businessUnits
                            .filter(unit => 
                              unit.toLowerCase().includes(tempBusinessUnit.toLowerCase())
                            )
                            .map((unit) => (
                              <CommandItem
                                key={unit}
                                onSelect={() => {
                                  setTempBusinessUnit(unit);
                                  setOpenBusinessUnitPopover(false);
                                }}
                                className="cursor-pointer hover:bg-accent"
                              >
                                {unit}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateBusinessUnit}
                      className="flex-1"
                      disabled={!tempBusinessUnit.trim()}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingBusinessUnit(false);
                        setTempBusinessUnit('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-lg font-medium">
                  {initiative.unidad_negocio || 'No especificada'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs para organizar el contenido */}
        <Tabs defaultValue="stages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger 
              value="stages" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Etapas
            </TabsTrigger>
            <TabsTrigger 
              value="comments"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Comentarios
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Historial
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stages" className="mt-6">
            <InitiativeStages initiativeId={initiativeId} />
          </TabsContent>
          
          <TabsContent value="comments" className="mt-6">
            <InitiativeComments initiativeId={initiativeId} />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <InitiativeActivityLog initiativeId={initiativeId} />
          </TabsContent>
        </Tabs>

        {/* Modal de colaboradores */}
        {showCollaborators && (
          <InitiativeCollaborators
            initiativeId={initiativeId}
            onClose={() => setShowCollaborators(false)}
          />
        )}
      </div>
    </div>
  );
};
