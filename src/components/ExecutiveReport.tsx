import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase, QuestionnaireResponse, GlobalAnswers } from "@/types/framework";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ExecutiveReportProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
  globalAnswers: GlobalAnswers | null;
}

const ExecutiveReport = ({ selectedUseCases, evaluatedUseCases, globalAnswers }: ExecutiveReportProps) => {
  
  // Calculate maturity score from global answers
  const calculateMaturityScore = () => {
    if (!globalAnswers) return 0;
    
    const ratingQuestions = [
      "global_estrategia_1_nivel",
      "global_estrategia_2_nivel",
      "global_datos_1_nivel",
      "global_datos_2_nivel",
      "global_tecnologia_1_nivel",
      "global_personas_1_nivel"
    ];
    
    const scores = ratingQuestions
      .map(q => globalAnswers.answers[q] as number)
      .filter(s => s !== undefined);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const maturityScore = calculateMaturityScore();
  const maturityLevel = maturityScore >= 4 ? "Avanzado" : maturityScore >= 2.5 ? "Intermedio" : "Inicial";

  // Get top 3 prioritized use cases
  const topUseCases = selectedUseCases
    .map(useCase => {
      const evaluation = evaluatedUseCases.find(e => e.useCaseId === useCase.id);
      const impactMap = { low: 3, medium: 6, high: 9 };
      const complexityMap = { low: 9, medium: 6, high: 3 };
      const score = evaluation?.score || (impactMap[useCase.impact || "medium"] + complexityMap[useCase.complexity || "medium"]) / 2;
      
      return { ...useCase, score, evaluation };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topUseCase = topUseCases[0];

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Informe Ejecutivo", 105, yPos, { align: "center" });
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Framework de Identificación de Casos de Uso de IA", 105, yPos, { align: "center" });
    yPos += 15;

    // Maturity Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Madurez Organizacional para IA", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Puntaje de Madurez: ${maturityScore.toFixed(1)}/5.0`, 20, yPos);
    yPos += 7;
    doc.text(`Nivel: ${maturityLevel}`, 20, yPos);
    yPos += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Acciones Clave Recomendadas:", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    
    const actions = maturityLevel === "Inicial" 
      ? [
          "• Establecer estrategia de transformación digital y objetivos de IA",
          "• Desarrollar gobernanza de datos básica",
          "• Formar equipo de IA con capacitación inicial",
          "• Iniciar con casos de uso de baja complejidad"
        ]
      : maturityLevel === "Intermedio"
      ? [
          "• Fortalecer infraestructura de datos y analítica",
          "• Ampliar capacidades del equipo de IA",
          "• Implementar pilotos de casos de uso prioritarios",
          "• Establecer métricas de éxito claras"
        ]
      : [
          "• Escalar casos de uso exitosos",
          "• Optimizar procesos de MLOps",
          "• Expandir uso de IA a nuevas áreas",
          "• Compartir mejores prácticas internamente"
        ];

    actions.forEach(action => {
      doc.text(action, 25, yPos);
      yPos += 6;
    });
    yPos += 5;

    // Prioritization Section
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. Priorización de Casos de Uso", 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de casos evaluados: ${selectedUseCases.length}`, 20, yPos);
    yPos += 7;
    doc.text(`Casos prioritarios identificados: ${Math.min(3, topUseCases.length)}`, 20, yPos);
    yPos += 10;

    topUseCases.forEach((uc, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${uc.title}`, 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`   Puntaje: ${uc.score.toFixed(1)} | Impacto: ${uc.impact} | Complejidad: ${uc.complexity}`, 20, yPos);
      yPos += 10;
    });

    // Recommendation Section
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("3. Caso de Uso Inicial Recomendado", 20, yPos);
    yPos += 10;

    if (topUseCase) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(topUseCase.title, 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(topUseCase.description, 170);
      descLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Next Steps
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("4. Próximos Pasos Sugeridos", 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const nextSteps = [
      "1. Desarrollar caso de negocio detallado con análisis ROI",
      "2. Definir alcance de piloto (proceso/departamento específico)",
      "3. Evaluar y preparar fuentes de datos necesarias",
      "4. Identificar y formar equipo de proyecto",
      "5. Abordar brechas de madurez organizacional en paralelo",
      "6. Establecer KPIs y métricas de éxito",
      "7. Planificar ejecución de piloto (8-12 semanas)"
    ];

    nextSteps.forEach(step => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(step, 20, yPos);
      yPos += 7;
    });

    // Technical Sheet
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("5. Ficha Técnica del Caso Prioritario", 20, yPos);
    yPos += 10;

    if (topUseCase) {
      const sections = [
        { title: "Alineamiento Estratégico", content: "Este caso de uso se alinea con objetivos corporativos prioritarios" },
        { title: "Problema y Solución", content: topUseCase.description },
        { title: "Datos y Tecnología", content: `Tecnología: ${topUseCase.aiType || "N/A"}` },
        { title: "Impacto y Métricas", content: "KPIs a definir durante la fase de preparación" },
        { title: "Riesgos y Viabilidad", content: `Complejidad: ${topUseCase.complexity}` }
      ];

      sections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(section.content, 170);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += 5;
        });
        yPos += 5;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("© 2025 OVM Consulting - Framework IA Empresarial", 105, 285, { align: "center" });
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
    }

    doc.save("Informe_Ejecutivo_IA.pdf");
    toast.success("Informe ejecutivo descargado exitosamente");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informe Ejecutivo
            </CardTitle>
            <Button onClick={generatePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maturity Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resumen de Madurez para IA</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Puntaje de Madurez</p>
                    <p className="text-3xl font-bold text-primary">{maturityScore.toFixed(1)}/5.0</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Nivel</p>
                    <p className="text-2xl font-semibold">{maturityLevel}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Casos Evaluados</p>
                    <p className="text-3xl font-bold">{selectedUseCases.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Use Case */}
          {topUseCase && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Caso de Uso Inicial Recomendado</h3>
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xl font-bold">{topUseCase.title}</h4>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="text-muted-foreground">{topUseCase.description}</p>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Puntaje</p>
                        <p className="text-lg font-semibold">{topUseCase.score.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Impacto</p>
                        <p className="text-lg font-semibold capitalize">{topUseCase.impact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Complejidad</p>
                        <p className="text-lg font-semibold capitalize">{topUseCase.complexity}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strategic Recommendations */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recomendaciones Estratégicas</h3>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Enfocar esfuerzos iniciales en el caso de uso prioritario identificado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Desarrollar piloto de 8-12 semanas con alcance limitado y bien definido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Abordar brechas de madurez organizacional en paralelo al piloto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Establecer métricas de éxito claras y medibles desde el inicio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">Asegurar sponsorship ejecutivo y comunicación constante</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveReport;
