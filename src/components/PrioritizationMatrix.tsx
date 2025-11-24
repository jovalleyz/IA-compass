import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { UseCase, QuestionnaireResponse } from "@/types/framework";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, TrendingUp, Info } from "lucide-react";

interface ValidationResult {
  useCaseId: string;
  status: "green" | "yellow" | "red";
  readinessScore: number;
  bloqueadores: string[];
}

interface PrioritizationMatrixProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
  validationResults?: ValidationResult[];
}

interface UseCaseWithScores extends UseCase {
  finalScore: number;
  impactScore: number;
  complexityScore: number;
  alignmentScore: number;
  validationStatus?: "green" | "yellow" | "red";
}

const PrioritizationMatrix = ({ selectedUseCases, evaluatedUseCases, validationResults = [] }: PrioritizationMatrixProps) => {
  const [impactWeight, setImpactWeight] = useState(5);
  const [complexityWeight, setComplexityWeight] = useState(6);
  const [alignmentWeight, setAlignmentWeight] = useState(5);

  // Calculate scores for each use case
  const useCasesWithScores: UseCaseWithScores[] = selectedUseCases.map(useCase => {
    const evaluation = evaluatedUseCases.find(e => e.useCaseId === useCase.id);
    const validation = validationResults.find(v => v.useCaseId === useCase.id);
    
    // Base impact from use case definition
    const impactMap = { low: 3, medium: 6, high: 9 };
    const baseImpact = impactMap[useCase.impact || "medium"];
    
    // Complexity (inverted - lower complexity = higher score for ease)
    const complexityMap = { low: 9, medium: 6, high: 3 };
    const complexityScore = complexityMap[useCase.complexity || "medium"];
    
    // Get alignment score from use_cases table (alineamiento_estrategico)
    // This should be stored when saving the use case evaluation
    const alignmentScore = useCase.alineamiento_estrategico || 3;
    
    // Apply readiness penalty from traffic light validation
    let readinessPenalty = 1.0;
    if (validation) {
      if (validation.status === "red") {
        readinessPenalty = 0.5; // 50% penalty for red status
      } else if (validation.status === "yellow") {
        readinessPenalty = 0.75; // 25% penalty for yellow status
      }
    }
    
    // Final weighted score with readiness penalty
    const rawScore = (baseImpact * impactWeight + complexityScore * complexityWeight + alignmentScore * alignmentWeight) / (impactWeight + complexityWeight + alignmentWeight);
    const finalScore = rawScore * readinessPenalty;
    
    return {
      ...useCase,
      finalScore: Number(finalScore.toFixed(1)),
      impactScore: baseImpact,
      complexityScore,
      alignmentScore: Number(alignmentScore.toFixed(1)),
      validationStatus: validation?.status || "green"
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="space-y-6">
      {/* Explicación de ponderaciones */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Info className="h-5 w-5" />
            ℹ️ Ajuste de Ponderaciones
          </CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            Estos pesos le permiten ajustar la priorización según las necesidades actuales de su organización. 
            Por ejemplo, si necesita resultados rápidos, aumente el peso de "Facilidad de Implementación". 
            Si busca transformación estratégica, aumente "Alineamiento Estratégico".
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Ponderación de Criterios
          </CardTitle>
          <CardDescription>
            Ajuste la importancia de cada criterio para personalizar la priorización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <Label className="text-blue-900 dark:text-blue-100 font-semibold">
                Impacto en Negocio ({impactWeight})
              </Label>
            </div>
            <Slider
              value={[impactWeight]}
              onValueChange={([value]) => setImpactWeight(value)}
              min={1}
              max={10}
              step={1}
              className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-700"
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="flex justify-between items-center">
              <Label className="text-purple-900 dark:text-purple-100 font-semibold">
                Facilidad de Implementación ({complexityWeight})
              </Label>
            </div>
            <Slider
              value={[complexityWeight]}
              onValueChange={([value]) => setComplexityWeight(value)}
              min={1}
              max={10}
              step={1}
              className="w-full [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-700"
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex justify-between items-center">
              <Label className="text-green-900 dark:text-green-100 font-semibold">
                Alineamiento Estratégico ({alignmentWeight})
              </Label>
            </div>
            <Slider
              value={[alignmentWeight]}
              onValueChange={([value]) => setAlignmentWeight(value)}
              min={1}
              max={10}
              step={1}
              className="w-full [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-green-700"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Priorización de Casos de Uso</CardTitle>
          <CardDescription>
            Casos ordenados por puntaje ponderado (Mayor = Mayor prioridad)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Caso de Uso</TableHead>
                  <TableHead className="text-center">Puntaje Final</TableHead>
                  <TableHead className="text-center">Impacto</TableHead>
                  <TableHead className="text-center">Facilidad</TableHead>
                  <TableHead className="text-center">Alineamiento</TableHead>
                  <TableHead>Recomendación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {useCasesWithScores.map((useCase, index) => (
                  <TableRow key={useCase.id} className={index < 3 ? "bg-accent/50" : ""}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{useCase.title}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{useCase.finalScore}</span>
                    </TableCell>
                    <TableCell className="text-center">{useCase.impactScore}</TableCell>
                    <TableCell className="text-center">{useCase.complexityScore}</TableCell>
                    <TableCell className="text-center">{useCase.alignmentScore}</TableCell>
                    <TableCell>
                      {useCase.validationStatus === "red" ? (
                        <span className="text-sm font-medium text-red-600">
                          🛑 No Implementar - Subsanar bloqueadores críticos
                        </span>
                      ) : useCase.validationStatus === "yellow" ? (
                        <span className="text-sm font-medium text-yellow-600">
                          ⚠️ Implementar después de resolver advertencias
                        </span>
                      ) : index === 0 ? (
                        <span className="text-sm font-medium text-green-600">
                          🏆 Iniciar Primero - Máxima Prioridad
                        </span>
                      ) : index === 1 ? (
                        <span className="text-sm font-medium text-blue-600">
                          📋 Segunda Prioridad
                        </span>
                      ) : index === 2 ? (
                        <span className="text-sm font-medium text-orange-600">
                          ⏳ Tercera Prioridad
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Evaluar posteriormente
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Matrix */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Matriz Visual: Impacto vs Facilidad
          </CardTitle>
          <CardDescription>
            Los casos de uso más arriba y a la derecha son los prioritarios
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative w-full h-96 border-2 rounded-xl bg-gradient-to-br from-muted/10 to-muted/30 shadow-inner">
            {/* Quadrant backgrounds */}
            <div className="absolute top-4 left-12 right-1/2 bottom-1/2 bg-yellow-100/30 dark:bg-yellow-900/10 rounded-tl-lg"></div>
            <div className="absolute top-4 left-1/2 right-4 bottom-1/2 bg-green-100/30 dark:bg-green-900/10 rounded-tr-lg"></div>
            <div className="absolute top-1/2 left-12 right-1/2 bottom-12 bg-red-100/30 dark:bg-red-900/10 rounded-bl-lg"></div>
            <div className="absolute top-1/2 left-1/2 right-4 bottom-12 bg-orange-100/30 dark:bg-orange-900/10 rounded-br-lg"></div>
            
            {/* Axes */}
            <div className="absolute bottom-12 left-12 right-4 h-0.5 bg-border shadow-sm"></div>
            <div className="absolute top-4 bottom-12 left-12 w-0.5 bg-border shadow-sm"></div>
            
            {/* Quadrant labels */}
            <div className="absolute top-8 left-16 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              Analizar
            </div>
            <div className="absolute top-8 right-8 text-xs font-medium text-green-700 dark:text-green-400">
              Implementar Ya
            </div>
            <div className="absolute bottom-16 left-16 text-xs font-medium text-red-700 dark:text-red-400">
              Evitar
            </div>
            <div className="absolute bottom-16 right-8 text-xs font-medium text-orange-700 dark:text-orange-400">
              Quick Wins
            </div>
            
            {/* Labels */}
            <div className="absolute bottom-2 right-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
              Facilidad de Implementación →
            </div>
            <div className="absolute top-28 left-2 text-[10px] font-medium text-muted-foreground -rotate-90 origin-left whitespace-nowrap">
              ← Impacto en Negocio
            </div>
            
            {/* Plot points */}
            {useCasesWithScores.map((useCase, index) => {
              const x = 12 + (useCase.complexityScore / 11) * 85;
              const y = 96 - 12 - (useCase.impactScore / 11) * 85;
              
              const statusColors = {
                green: "bg-green-500 border-green-600 hover:bg-green-600",
                yellow: "bg-yellow-500 border-yellow-600 hover:bg-yellow-600",
                red: "bg-red-500 border-red-600 hover:bg-red-600"
              };
              
              return (
                <div
                  key={useCase.id}
                  className="absolute w-14 h-14 -ml-7 -mt-7 flex items-center justify-center group transition-transform hover:scale-110 hover:z-10 cursor-pointer"
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                  }}
                  title={`${useCase.title}\nPuntaje: ${useCase.finalScore}`}
                >
                  <div className={`w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center text-white font-bold transition-all ${statusColors[useCase.validationStatus || "green"]}`}>
                    {index + 1}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg z-20">
                    {useCase.title}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className="text-muted-foreground">Listo (Verde)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
              <span className="text-muted-foreground">Preparación (Amarillo)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
              <span className="text-muted-foreground">No Recomendado (Rojo)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrioritizationMatrix;
