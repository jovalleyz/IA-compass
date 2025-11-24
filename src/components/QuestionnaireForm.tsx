import { useState } from "react";
import { useCaseQuestions, QuestionnaireResponse } from "@/types/framework";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { questionTooltips } from "@/data/questionTooltips";
import { DataCoherenceValidator } from "./DataCoherenceValidator";

interface QuestionnaireFormProps {
  useCaseId: string;
  useCaseTitle: string;
  onComplete: (response: QuestionnaireResponse) => void;
}

const QuestionnaireForm = ({ useCaseId, useCaseTitle, onComplete }: QuestionnaireFormProps) => {
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [currentCategory, setCurrentCategory] = useState<string>("estrategia");

  const categories = ["estrategia", "datos", "tecnologia", "personas", "valor", "riesgos"];
  const categoryTitles: Record<string, string> = {
    estrategia: "Alineación Estratégica",
    datos: "Disponibilidad de Datos",
    tecnologia: "Factibilidad Técnica",
    personas: "Recursos y Habilidades",
    valor: "Valor Potencial",
    riesgos: "Riesgos y Consideraciones"
  };

  const categoryColors: Record<string, { bg: string; border: string; title: string }> = {
    estrategia: { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800", title: "text-blue-700 dark:text-blue-300" },
    datos: { bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-200 dark:border-green-800", title: "text-green-700 dark:text-green-300" },
    tecnologia: { bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-800", title: "text-purple-700 dark:text-purple-300" },
    personas: { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800", title: "text-orange-700 dark:text-orange-300" },
    valor: { bg: "bg-teal-50 dark:bg-teal-950/20", border: "border-teal-200 dark:border-teal-800", title: "text-teal-700 dark:text-teal-300" },
    riesgos: { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800", title: "text-red-700 dark:text-red-300" }
  };

  // Solo preguntas específicas por caso de uso
  const perUseCaseQuestions = useCaseQuestions.filter(q => q.scope === "per-use-case");
  const currentQuestions = perUseCaseQuestions.filter(q => q.category === currentCategory);
  const currentCategoryIndex = categories.indexOf(currentCategory);
  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

  const handleAnswer = (questionId: string, value: string | number | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const unansweredQuestions = currentQuestions.filter(q => !(q.id in answers));
    if (unansweredQuestions.length > 0) {
      toast.error("Por favor responda todas las preguntas antes de continuar");
      return;
    }

    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategory(categories[currentCategoryIndex + 1]);
    } else {
      // Calculate score (simplified)
      const ratingAnswers = Object.values(answers).filter(v => typeof v === 'number');
      const avgRating = ratingAnswers.reduce((sum: number, val) => sum + (val as number), 0) / ratingAnswers.length;
      
      onComplete({
        useCaseId,
        answers,
        score: avgRating
      });
      toast.success("Evaluación completada");
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategory(categories[currentCategoryIndex - 1]);
    }
  };

  const renderQuestion = (question: typeof useCaseQuestions[0]) => {
    switch (question.type) {
      case "rating":
        return (
          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            className="flex gap-4"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                <Label htmlFor={`${question.id}-${rating}`}>{rating}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case "boolean":
        return (
          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswer(question.id, value === "true")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-si`} />
              <Label htmlFor={`${question.id}-si`}>Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>No</Label>
            </div>
          </RadioGroup>
        );
      
      case "select":
        return (
          <Select
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "text":
        return question.question.length > 100 ? (
          <Textarea
            value={answers[question.id]?.toString() || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Escriba su respuesta aquí..."
            rows={4}
          />
        ) : (
          <Input
            value={answers[question.id]?.toString() || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Escriba su respuesta aquí..."
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Evaluando: {useCaseTitle}</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Categoría {currentCategoryIndex + 1} de {categories.length}: {categoryTitles[currentCategory]}
        </p>
      </div>

      <Card className={`${categoryColors[currentCategory].bg} ${categoryColors[currentCategory].border} border-2`}>
        <CardHeader>
          <CardTitle className={categoryColors[currentCategory].title}>{categoryTitles[currentCategory]}</CardTitle>
          <CardDescription>
            Responda las siguientes preguntas para evaluar la viabilidad de este caso de uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions.map((question) => {
            const tooltip = questionTooltips[question.id];
            return (
              <div key={question.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">{question.question}</Label>
                  {tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4 space-y-2" side="right" align="start">
                        <p className="font-semibold text-sm text-primary">{tooltip.title}</p>
                        <p className="text-xs text-foreground">{tooltip.description}</p>
                        {tooltip.example && (
                          <div className="pt-1 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground">Ejemplo:</p>
                            <p className="text-xs text-foreground">{tooltip.example}</p>
                          </div>
                        )}
                        {tooltip.bestPractice && (
                          <div className="pt-1 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground">Best Practice:</p>
                            <p className="text-xs text-foreground italic">{tooltip.bestPractice}</p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {question.type === "rating" && (
                  <p className="text-xs text-muted-foreground">1 = Muy bajo, 5 = Muy alto</p>
                )}
                {renderQuestion(question)}
              </div>
            );
          })}
          
          {/* Validador de coherencia para la categoría de datos */}
          {currentCategory === "datos" && (
            <DataCoherenceValidator
              dataAvailability={answers.datos_1 as number || 0}
              dataQuality={answers.datos_2 as number || 0}
              dataGovernance={answers.datos_3 as boolean || false}
              dataDescription={answers.datos_4 as string || ""}
              onValidationComplete={(isCoherent, feedback) => {
                console.log("Coherencia validada:", isCoherent, feedback);
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0}
        >
          Anterior
        </Button>
        <Button onClick={handleNext}>
          {currentCategoryIndex < categories.length - 1 ? "Siguiente" : "Finalizar"}
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
