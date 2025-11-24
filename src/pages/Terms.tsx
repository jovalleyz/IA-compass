import { Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Framework IA Empresarial
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Términos y Condiciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Objetivo del Framework</h2>
              <p className="text-muted-foreground">
                El Framework IA Empresarial es una herramienta de evaluación y diagnóstico diseñada para ayudar a
                organizaciones a identificar, evaluar y priorizar casos de uso de Inteligencia Artificial. Este
                framework provee orientación estratégica basada en las respuestas proporcionadas por el usuario.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Uso de Datos</h2>
              <p className="text-muted-foreground">
                Los datos ingresados en este framework se utilizan exclusivamente para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Generar evaluaciones y recomendaciones personalizadas</li>
                <li>Crear matrices de priorización y planes de acción</li>
                <li>Producir informes ejecutivos para su organización</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Los datos se almacenan localmente en su navegador y no se transmiten a servidores externos sin su
                consentimiento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Responsabilidades de OVM Consulting</h2>
              <p className="text-muted-foreground">OVM Consulting se compromete a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Proveer una herramienta funcional y actualizada para la evaluación de casos de uso de IA</li>
                <li>Mantener la confidencialidad de la información ingresada</li>
                <li>Ofrecer recomendaciones basadas en mejores prácticas de la industria</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>OVM Consulting NO se hace responsable de:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Decisiones de negocio tomadas basándose únicamente en los resultados del framework</li>
                <li>Pérdidas económicas derivadas de la implementación de casos de uso evaluados</li>
                <li>Exactitud de la información proporcionada por el usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Responsabilidades del Cliente</h2>
              <p className="text-muted-foreground">El cliente se compromete a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Proporcionar información veraz y actualizada durante la evaluación</li>
                <li>Utilizar los resultados como guía orientativa, no como única base para decisiones estratégicas</li>
                <li>Realizar validaciones adicionales antes de implementar cualquier caso de uso</li>
                <li>Consultar con expertos en IA y consultores especializados para decisiones críticas</li>
                <li>Respetar los derechos de propiedad intelectual del framework</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Naturaleza de las Recomendaciones</h2>
              <p className="text-muted-foreground">
                Las recomendaciones, evaluaciones y puntuaciones generadas por este framework son orientativas y se
                basan en algoritmos de evaluación estándar de la industria. No constituyen asesoría profesional
                definitiva y deben ser complementadas con análisis adicional por parte de expertos en IA y consultores
                estratégicos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Privacidad y Confidencialidad</h2>
              <p className="text-muted-foreground">
                OVM Consulting se compromete a mantener la confidencialidad de toda información corporativa sensible
                compartida a través del framework. No se compartirán datos con terceros sin consentimiento explícito del
                cliente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Limitación de Garantías</h2>
              <p className="text-muted-foreground">
                Este framework se proporciona "tal cual" sin garantías de ningún tipo, expresas o implícitas. OVM
                Consulting no garantiza que el uso del framework resulte en el éxito de proyectos de IA o en beneficios
                económicos específicos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Modificaciones</h2>
              <p className="text-muted-foreground">
                OVM Consulting se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los
                cambios entrarán en vigor inmediatamente después de su publicación en el framework.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Contacto</h2>
              <p className="text-muted-foreground">
                Para consultas sobre estos términos y condiciones, por favor contacte a OVM Consulting a través de los
                canales oficiales de comunicación.
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">Última actualización: Enero 2025</p>
              <p className="text-sm text-muted-foreground mt-2">
                Al utilizar este framework, usted acepta estos términos y condiciones en su totalidad.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate("/")}>Volver al Framework</Button>
        </div>
      </main>
    </div>
  );
};

export default Terms;
