import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseCase, QuestionnaireResponse } from "@/types/framework";
import { Calendar, Target, Users, TrendingUp } from "lucide-react";

interface ActionPlanProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
}

const ActionPlan = ({ selectedUseCases, evaluatedUseCases }: ActionPlanProps) => {
  // Get top 3 prioritized use cases (simplified scoring)
  const topUseCases = selectedUseCases
    .map(useCase => {
      const evaluation = evaluatedUseCases.find(e => e.useCaseId === useCase.id);
      const impactMap = { low: 3, medium: 6, high: 9 };
      const complexityMap = { low: 9, medium: 6, high: 3 };
      const score = (impactMap[useCase.impact || "medium"] + complexityMap[useCase.complexity || "medium"]) / 2;
      
      return { ...useCase, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const phases = [
    {
      title: "Fase 1: Preparación (Semanas 1-4)",
      icon: Target,
      activities: [
        "Desarrollar caso de negocio detallado para caso prioritario",
        "Definir KPIs y métricas de éxito",
        "Identificar stakeholders clave y formar equipo de proyecto",
        "Evaluar y abordar brechas de madurez organizacional"
      ]
    },
    {
      title: "Fase 2: Piloto (Semanas 5-12)",
      icon: Users,
      activities: [
        "Diseñar y ejecutar piloto con alcance limitado",
        "Establecer línea base de datos y preparar infraestructura",
        "Iterar basado en feedback inicial",
        "Documentar lecciones aprendidas"
      ]
    },
    {
      title: "Fase 3: Escalamiento (Semanas 13-24)",
      icon: TrendingUp,
      activities: [
        "Evaluar resultados del piloto y ROI preliminar",
        "Planificar expansión a mayor escala",
        "Implementar mejoras identificadas",
        "Preparar siguiente caso de uso prioritario"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* MaturityGauge removed - already displayed in validation step */}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Roadmap de Implementación
          </CardTitle>
          <CardDescription>
            Plan recomendado para los próximos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {phases.map((phase, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <phase.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{phase.title}</h3>
              </div>
              <ul className="ml-13 space-y-2">
                {phase.activities.map((activity, actIndex) => (
                  <li key={actIndex} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm text-muted-foreground">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos de Uso Priorizados</CardTitle>
          <CardDescription>
            Orden sugerido de implementación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topUseCases.map((useCase, index) => (
            <div key={useCase.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold">{useCase.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{useCase.description}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t space-y-2">
                <h5 className="text-sm font-semibold">Próximos Pasos Recomendados:</h5>
                {index === 0 && (
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Desarrollar caso de negocio completo con análisis costo-beneficio</li>
                    <li>• Definir alcance del piloto (departamento o proceso específico)</li>
                    <li>• Identificar fuentes de datos y evaluar calidad</li>
                    <li>• Abordar en paralelo brechas de madurez identificadas</li>
                  </ul>
                )}
                {index === 1 && (
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Documentar caso de uso en formato estándar</li>
                    <li>• Planificar inicialmente para Q2-Q3</li>
                    <li>• Identificar dependencias con caso prioritario</li>
                  </ul>
                )}
                {index === 2 && (
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Mantener en backlog priorizado</li>
                    <li>• Re-evaluar según resultados de pilotos anteriores</li>
                    <li>• Considerar para segunda mitad del año</li>
                  </ul>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Factores Críticos de Éxito</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong className="text-sm">Sponsorship Ejecutivo:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  Asegurar compromiso de liderazgo senior
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong className="text-sm">Gestión del Cambio:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  Preparar a la organización para adopción de IA
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong className="text-sm">Métricas Claras:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  Definir y medir KPIs desde el inicio
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong className="text-sm">Iteración Rápida:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  Aprender del piloto y ajustar antes de escalar
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong className="text-sm">Gobernanza de Datos:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  Establecer políticas claras de uso de datos
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionPlan;
