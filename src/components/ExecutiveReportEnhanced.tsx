import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase, QuestionnaireResponse, GlobalAnswers } from "@/types/framework";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { AdvancedExportDialog } from "./AdvancedExportDialog";

interface ExecutiveReportEnhancedProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
  globalAnswers: GlobalAnswers | null;
  maturityScore: number;
  maturityLevel: string;
}

interface ExportOptions {
  includeMaturity: boolean;
  includePrioritization: boolean;
  includeRoadmap: boolean;
  includeActionPlan: boolean;
  includeCharts: boolean;
  template: "executive" | "technical" | "strategic";
}

const ExecutiveReportEnhanced = ({ 
  selectedUseCases, 
  evaluatedUseCases, 
  globalAnswers,
  maturityScore,
  maturityLevel 
}: ExecutiveReportEnhancedProps) => {
  
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

  const captureElement = async (elementId: string): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) return "";
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing element:", error);
      return "";
    }
  };

  const generateEnhancedPDF = async (options: ExportOptions) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 133, 244); // Primary color
    doc.text("Informe Ejecutivo de IA", 105, yPos, { align: "center" });
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Framework de Identificación de Casos de Uso", 105, yPos, { align: "center" });
    yPos += 15;
    doc.setTextColor(0, 0, 0);

    // Maturity Section (if included)
    if (options.includeMaturity) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("1. Análisis de Madurez Organizacional", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Puntaje de Madurez: ${maturityScore.toFixed(1)}/5.0`, 20, yPos);
      yPos += 7;
      doc.text(`Nivel: ${maturityLevel}`, 20, yPos);
      yPos += 10;

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

      doc.setFont("helvetica", "bold");
      doc.text("Acciones Clave Recomendadas:", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      
      actions.forEach(action => {
        doc.text(action, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Prioritization Section (if included)
    if (options.includePrioritization) {
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
    }

    // Recommended Use Case
    if (topUseCase) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("3. Caso de Uso Inicial Recomendado", 20, yPos);
      yPos += 10;

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
    if (options.includeActionPlan) {
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
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("© 2025 Framework IA Empresarial", 105, 285, { align: "center" });
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
    }

    const fileName = `Informe_IA_${options.template}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success("Informe PDF descargado exitosamente");
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Maturity Analysis
    const maturityData = [
      ["Análisis de Madurez Organizacional"],
      [""],
      ["Métrica", "Valor"],
      ["Puntaje de Madurez", `${maturityScore.toFixed(1)}/5.0`],
      ["Nivel de Madurez", maturityLevel],
      ["Fecha de Evaluación", new Date().toLocaleDateString()],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(maturityData);
    XLSX.utils.book_append_sheet(wb, ws1, "Madurez");

    // Sheet 2: Use Cases
    const useCaseHeaders = ["Caso de Uso", "Industria", "Impacto", "Complejidad", "Tipo IA", "Puntaje"];
    const useCaseData = selectedUseCases.map(uc => {
      const evaluation = evaluatedUseCases.find(e => e.useCaseId === uc.id);
      const impactMap = { low: 3, medium: 6, high: 9 };
      const complexityMap = { low: 9, medium: 6, high: 3 };
      const score = evaluation?.score || (impactMap[uc.impact || "medium"] + complexityMap[uc.complexity || "medium"]) / 2;
      
      return [
        uc.title,
        uc.industry || "N/A",
        uc.impact || "N/A",
        uc.complexity || "N/A",
        uc.aiType || "N/A",
        score.toFixed(1)
      ];
    });

    const ws2 = XLSX.utils.aoa_to_sheet([useCaseHeaders, ...useCaseData]);
    XLSX.utils.book_append_sheet(wb, ws2, "Casos de Uso");

    // Sheet 3: Top Priorities
    const priorityHeaders = ["Ranking", "Caso de Uso", "Puntaje", "Impacto", "Complejidad"];
    const priorityData = topUseCases.map((uc, idx) => [
      idx + 1,
      uc.title,
      uc.score.toFixed(1),
      uc.impact,
      uc.complexity
    ]);

    const ws3 = XLSX.utils.aoa_to_sheet([priorityHeaders, ...priorityData]);
    XLSX.utils.book_append_sheet(wb, ws3, "Priorización");

    // Export
    const fileName = `Reporte_IA_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Reporte Excel descargado exitosamente");
  };

  const exportToCSV = () => {
    const headers = ["Caso de Uso", "Industria", "Impacto", "Complejidad", "Tipo IA", "Puntaje"];
    const rows = selectedUseCases.map(uc => {
      const evaluation = evaluatedUseCases.find(e => e.useCaseId === uc.id);
      const impactMap = { low: 3, medium: 6, high: 9 };
      const complexityMap = { low: 9, medium: 6, high: 3 };
      const score = evaluation?.score || (impactMap[uc.impact || "medium"] + complexityMap[uc.complexity || "medium"]) / 2;
      
      return [
        uc.title,
        uc.industry || "N/A",
        uc.impact || "N/A",
        uc.complexity || "N/A",
        uc.aiType || "N/A",
        score.toFixed(1)
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Casos_Uso_IA_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV descargado exitosamente");
  };

  const handleExport = (format: "pdf" | "excel" | "csv", options: ExportOptions) => {
    if (format === "pdf") {
      generateEnhancedPDF(options);
    } else if (format === "excel") {
      exportToExcel();
    } else if (format === "csv") {
      exportToCSV();
    }
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
            <div className="flex gap-2">
              <Button onClick={() => generateEnhancedPDF({
                includeMaturity: true,
                includePrioritization: true,
                includeRoadmap: true,
                includeActionPlan: true,
                includeCharts: false,
                template: "executive"
              })} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                PDF Rápido
              </Button>
              <AdvancedExportDialog
                onExport={handleExport}
                maturityScore={maturityScore}
                maturityLevel={maturityLevel}
                selectedUseCasesCount={selectedUseCases.length}
              />
            </div>
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

export default ExecutiveReportEnhanced;
