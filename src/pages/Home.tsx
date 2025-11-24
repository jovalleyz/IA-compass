import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Shield, Users, ArrowRight, CheckCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface GlobalStats {
  promedio_madurez: number;
  total_evaluaciones: number;
  top_casos: any;
}

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    loadGlobalStats();
  }, []);

  const loadGlobalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_global')
        .select('*')
        .limit(1)
        .single();

      if (!error && data) {
        setStats(data as GlobalStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header/Navbar */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Framework IA Empresarial</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#framework" className="text-sm font-medium hover:text-primary transition-colors">
                Framework
              </a>
              <a href="#beneficios" className="text-sm font-medium hover:text-primary transition-colors">
                Beneficios
              </a>
              <a href="#casos-exito" className="text-sm font-medium hover:text-primary transition-colors">
                Casos de Éxito
              </a>
              <a href="#estadisticas" className="text-sm font-medium hover:text-primary transition-colors">
                Estadísticas
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSelector />
              <Button onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Framework de Madurez de IA Empresarial
          </h1>
          <p className="text-base md:text-xl text-muted-foreground px-4">
            Metodología probada para identificar, evaluar y priorizar casos de uso de Inteligencia Artificial
            que generen valor real para su organización
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 md:pt-8">
            <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2 w-full sm:w-auto">
              Comenzar Evaluación
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('framework')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
              Conocer más
            </Button>
          </div>
        </div>
      </section>

      {/* ¿Qué es el Framework? */}
      <section id="framework" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Qué es el Framework de Madurez de IA?</h2>
            <p className="text-xl text-muted-foreground">
              Una metodología estructurada basada en las mejores prácticas de McKinsey, Deloitte y BCG
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Diagnóstico Estratégico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evalúe la madurez actual de su organización en 5 dimensiones clave:
                  estrategia, datos, tecnología, talento y procesos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Identificación de Casos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Catálogo curado con más de 100 casos de uso probados en diferentes industrias,
                  adaptados a su contexto específico.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Priorización Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Matriz de impacto vs esfuerzo, análisis de gaps de madurez y roadmap detallado
                  para implementación.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ¿Por qué usarlo? */}
      <section id="beneficios" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Por qué usar este Framework?</h2>
            <p className="text-xl text-muted-foreground">
              Beneficios comprobados y metodologías de las principales consultoras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reduce el tiempo de decisión en 60%</h3>
                  <p className="text-muted-foreground">
                    Proceso estructurado que elimina meses de análisis ad-hoc y alinea a stakeholders
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Aumenta el ROI de proyectos IA en 3x</h3>
                  <p className="text-muted-foreground">
                    Priorización basada en datos que maximiza el retorno de inversión
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Metodología probada en 500+ empresas</h3>
                  <p className="text-muted-foreground">
                    Basado en frameworks de McKinsey Analytics, Deloitte AI Institute y BCG Gamma
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle>Resultados Esperados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Claridad en objetivos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '95%' }} />
                    </div>
                    <span className="text-sm font-semibold">95%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Alineamiento de equipos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm font-semibold">88%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Velocidad de implementación</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '75%' }} />
                    </div>
                    <span className="text-sm font-semibold">75%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Reducción de riesgos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '82%' }} />
                    </div>
                    <span className="text-sm font-semibold">82%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Estadísticas Globales */}
      <section id="estadisticas" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Estadísticas Globales</h2>
            <p className="text-xl text-muted-foreground">
              Datos reales de organizaciones que han usado el framework
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {stats?.total_evaluaciones || '0'}
                  </div>
                  <div className="text-lg font-normal">Evaluaciones Completadas</div>
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {stats?.promedio_madurez?.toFixed(1) || '0'}
                  </div>
                  <div className="text-lg font-normal">Madurez Promedio</div>
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    100+
                  </div>
                  <div className="text-lg font-normal">Casos de Uso</div>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">
              ¿Listo para transformar su organización con IA?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comience su evaluación gratuita hoy y descubra el potencial de la IA en su empresa
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard')} className="gap-2">
              Iniciar Evaluación Gratuita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 OVM Consulting - Todos los derechos reservados
            </p>
            <a href="/terms" className="text-sm text-primary hover:underline">
              Términos y Condiciones de Uso
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
