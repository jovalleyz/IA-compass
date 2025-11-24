import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndustryBenchmark } from "@/components/IndustryBenchmark";
import { SuccessStories } from "@/components/SuccessStories";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, TrendingUp, Target, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalInitiatives: 0,
    completedInitiatives: 0,
    totalUseCases: 0,
    avgMaturity: 0,
    industry: '',
  });
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>([]);
  const [useCasesByStatus, setUseCasesByStatus] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadUserAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUserAnalytics = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa, pais')
        .eq('id', user!.id)
        .single();

      // Load initiatives
      const { data: initiatives } = await supabase
        .from('initiatives')
        .select('*')
        .eq('user_id', user!.id);

      // Load use cases
      const { data: useCases } = await supabase
        .from('use_cases')
        .select('*')
        .eq('user_id', user!.id);

      // Load evaluations history
      const { data: evaluations } = await supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      // Calculate stats
      const completedInitiatives = initiatives?.filter(i => {
        // Consider completed if all stages have 100% progress
        return false; // Simplified for now
      }).length || 0;

      const avgMaturity = evaluations?.length 
        ? evaluations.reduce((acc, e) => acc + (e.puntaje_total || 0), 0) / evaluations.length 
        : 0;

      // Prepare evaluation timeline
      const timeline = evaluations?.map(e => ({
        fecha: new Date(e.created_at).toLocaleDateString('es', { month: 'short', year: 'numeric' }),
        madurez: e.puntaje_total || 0,
      })) || [];

      // Use cases by status
      const statusCounts = useCases?.reduce((acc: any, uc) => {
        const status = uc.estado || 'identificado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name === 'identificado' ? 'Identificado' : 
              name === 'evaluado' ? 'Evaluado' : 
              name === 'implementado' ? 'Implementado' : name,
        value,
      }));

      setUserStats({
        totalInitiatives: initiatives?.length || 0,
        completedInitiatives,
        totalUseCases: useCases?.length || 0,
        avgMaturity,
        industry: profile?.empresa || '',
      });

      setEvaluationHistory(timeline);
      setUseCasesByStatus(pieData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar las analíticas');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dashboard de Analíticas
              </h1>
              <p className="text-muted-foreground mt-1">
                Analiza tu progreso y compáralo con benchmarks de la industria
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Iniciativas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{userStats.totalInitiatives}</p>
              <p className="text-xs text-muted-foreground mt-1">Total creadas</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <CardTitle className="text-base">Casos de Uso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{userStats.totalUseCases}</p>
              <p className="text-xs text-muted-foreground mt-1">Identificados</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <CardTitle className="text-base">Madurez Promedio</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{userStats.avgMaturity.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">Nivel de madurez IA</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <CardTitle className="text-base">Evaluaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{evaluationHistory.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Evolución de Madurez IA</CardTitle>
              <CardDescription>Progreso en el tiempo de tu nivel de madurez</CardDescription>
            </CardHeader>
            <CardContent>
              {evaluationHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evaluationHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[0, 5]}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="madurez" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      name="Madurez"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No hay datos de evaluaciones previas
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Casos de Uso por Estado</CardTitle>
              <CardDescription>Distribución de casos según su estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              {useCasesByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={useCasesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {useCasesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No hay casos de uso registrados
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Benchmark and Success Stories */}
        <Tabs defaultValue="benchmark" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
            <TabsTrigger value="stories">Casos de Éxito</TabsTrigger>
          </TabsList>
          
          <TabsContent value="benchmark" className="mt-6">
            <IndustryBenchmark 
              userIndustry={userStats.industry} 
              userMaturity={userStats.avgMaturity}
            />
          </TabsContent>
          
          <TabsContent value="stories" className="mt-6">
            <SuccessStories />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
