import { useState } from "react";
import { useCaseQuestions, GlobalAnswers } from "@/types/framework";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { questionTooltips } from "@/data/questionTooltips";

interface GlobalQuestionnaireFormProps {
  onComplete: (response: GlobalAnswers) => void;
}

const GlobalQuestionnaireForm = ({ onComplete }: GlobalQuestionnaireFormProps) => {
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [currentCategory, setCurrentCategory] = useState<string>("estrategia");

  const categories = ["estrategia", "datos", "tecnologia", "personas", "riesgos"];
  const categoryTitles: Record<string, string> = {
    estrategia: "Alineación Estratégica",
    datos: "Disponibilidad de Datos",
    tecnologia: "Factibilidad Técnica",
    personas: "Recursos y Habilidades",
    riesgos: "Riesgos y Consideraciones"
  };

  // Solo preguntas globales
  const globalQuestions = useCaseQuestions.filter(q => q.scope === "global");
  const currentQuestions = globalQuestions.filter(q => q.category === currentCategory);
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
      onComplete({ answers });
      toast.success("Preguntas globales completadas");
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
          <div className="space-y-3">
            <Slider
              value={[answers[question.id] as number || 3]}
              onValueChange={([value]) => handleAnswer(question.id, value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Muy bajo</span>
              <span className="font-semibold text-primary">{answers[question.id] || 3}</span>
              <span>5 - Muy alto</span>
            </div>
          </div>
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
        <h3 className="text-lg font-semibold mb-2">Contexto Organizacional (Preguntas Globales)</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Categoría {currentCategoryIndex + 1} de {categories.length}: {categoryTitles[currentCategory]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{categoryTitles[currentCategory]}</CardTitle>
          <CardDescription>
            Responda las siguientes preguntas sobre su organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions.length > 0 ? (
            currentQuestions.map((question) => {
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
                  {renderQuestion(question)}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No hay preguntas globales para esta categoría.</p>
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
          {currentCategoryIndex < categories.length - 1 ? "Siguiente" : "Finalizar Contexto Global"}
        </Button>
      </div>
    </div>
  );
};

export default GlobalQuestionnaireForm;
