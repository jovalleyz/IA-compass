import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileSpreadsheet, Settings2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportOptions {
  includeMaturity: boolean;
  includePrioritization: boolean;
  includeRoadmap: boolean;
  includeActionPlan: boolean;
  includeCharts: boolean;
  template: "executive" | "technical" | "strategic";
}

interface AdvancedExportDialogProps {
  onExport: (format: "pdf" | "excel" | "csv", options: ExportOptions) => void;
  maturityScore?: number;
  maturityLevel?: string;
  selectedUseCasesCount?: number;
}

export const AdvancedExportDialog = ({ 
  onExport, 
  maturityScore = 0, 
  maturityLevel = "Inicial",
  selectedUseCasesCount = 0 
}: AdvancedExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [options, setOptions] = useState<ExportOptions>({
    includeMaturity: true,
    includePrioritization: true,
    includeRoadmap: true,
    includeActionPlan: true,
    includeCharts: true,
    template: "executive"
  });

  const handleExport = () => {
    onExport(selectedFormat, options);
    setOpen(false);
    toast.success(`Exportando reporte en formato ${selectedFormat.toUpperCase()}...`);
  };

  const templates = {
    executive: {
      name: "Ejecutivo",
      description: "Resumen de alto nivel para directivos con foco en impacto de negocio",
      sections: ["Madurez", "Priorización", "Roadmap", "Plan de Acción"]
    },
    technical: {
      name: "Técnico",
      description: "Detalles técnicos completos para equipos de implementación",
      sections: ["Todas las secciones", "Gráficos detallados", "Análisis técnico"]
    },
    strategic: {
      name: "Estratégico",
      description: "Visión estratégica y alineamiento con objetivos corporativos",
      sections: ["Madurez", "Roadmap", "Plan de Acción", "Recomendaciones"]
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="lg">
          <Settings2 className="h-4 w-4" />
          Exportar Reporte Personalizado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Exportación de Reporte</DialogTitle>
          <DialogDescription>
            Personaliza tu reporte seleccionando el formato, template y secciones a incluir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Formato de Exportación</Label>
            <RadioGroup value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as any)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">PDF</p>
                      <p className="text-xs text-muted-foreground">Ideal para presentaciones y compartir</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Excel (.xlsx)</p>
                      <p className="text-xs text-muted-foreground">Datos estructurados para análisis</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-muted-foreground">Compatible con múltiples sistemas</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Template Selection (only for PDF) */}
          {selectedFormat === "pdf" && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Template de Reporte</Label>
                <Select value={options.template} onValueChange={(value: any) => setOptions({...options, template: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Secciones incluidas:</p>
                  <div className="flex flex-wrap gap-2">
                    {templates[options.template].sections.map((section, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded border">
                        <Check className="h-3 w-3 text-primary" />
                        {section}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sections to Include */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Personalizar Secciones</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="maturity" 
                      checked={options.includeMaturity}
                      onCheckedChange={(checked) => setOptions({...options, includeMaturity: checked as boolean})}
                    />
                    <Label htmlFor="maturity" className="flex-1 cursor-pointer">
                      <p className="font-medium">Análisis de Madurez</p>
                      <p className="text-xs text-muted-foreground">Puntaje: {maturityScore.toFixed(1)}/5.0 - {maturityLevel}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="prioritization" 
                      checked={options.includePrioritization}
                      onCheckedChange={(checked) => setOptions({...options, includePrioritization: checked as boolean})}
                    />
                    <Label htmlFor="prioritization" className="flex-1 cursor-pointer">
                      <p className="font-medium">Matriz de Priorización</p>
                      <p className="text-xs text-muted-foreground">{selectedUseCasesCount} casos de uso evaluados</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="roadmap" 
                      checked={options.includeRoadmap}
                      onCheckedChange={(checked) => setOptions({...options, includeRoadmap: checked as boolean})}
                    />
                    <Label htmlFor="roadmap" className="flex-1 cursor-pointer">
                      <p className="font-medium">Roadmap de Implementación</p>
                      <p className="text-xs text-muted-foreground">Timeline con hitos y entregables</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="actionplan" 
                      checked={options.includeActionPlan}
                      onCheckedChange={(checked) => setOptions({...options, includeActionPlan: checked as boolean})}
                    />
                    <Label htmlFor="actionplan" className="flex-1 cursor-pointer">
                      <p className="font-medium">Plan de Acción Detallado</p>
                      <p className="text-xs text-muted-foreground">Próximos pasos y recomendaciones</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="charts" 
                      checked={options.includeCharts}
                      onCheckedChange={(checked) => setOptions({...options, includeCharts: checked as boolean})}
                    />
                    <Label htmlFor="charts" className="flex-1 cursor-pointer">
                      <p className="font-medium">Gráficos y Visualizaciones</p>
                      <p className="text-xs text-muted-foreground">Capturas de gráficos del dashboard</p>
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Data preview for Excel/CSV */}
          {(selectedFormat === "excel" || selectedFormat === "csv") && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Datos a Exportar</Label>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Evaluación de madurez organizacional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Lista de casos de uso con scores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Respuestas del cuestionario</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Priorización y recomendaciones</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
