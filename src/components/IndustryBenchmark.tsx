import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { TrendingUp, Users, Award } from "lucide-react";

interface IndustryData {
  industria: string;
  promedio_madurez: number;
  total_evaluaciones: number;
  top_casos: any;
}

interface BenchmarkProps {
  userIndustry?: string;
  userMaturity?: number;
}

export const IndustryBenchmark = ({ userIndustry, userMaturity }: BenchmarkProps) => {
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmarkData();
  }, []);

  const loadBenchmarkData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_global')
        .select('*')
        .order('promedio_madurez', { ascending: false });

      if (error) throw error;
      setIndustryData(data || []);
    } catch (error) {
      console.error('Error loading benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="h-20 bg-muted"></CardHeader>
          <CardContent className="h-64 bg-muted/50"></CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const barChartData = industryData.map(d => ({
    industria: d.industria.length > 15 ? d.industria.substring(0, 15) + '...' : d.industria,
    madurez: d.promedio_madurez?.toFixed(1) || 0,
    evaluaciones: d.total_evaluaciones || 0,
  }));

  // Radar chart for industry comparison - include user's industry if available
  const radarIndustries = userIndustry && !industryData.some(d => d.industria === userIndustry)
    ? [...industryData.slice(0, 5), { industria: userIndustry, promedio_madurez: userMaturity || 0, total_evaluaciones: 1, top_casos: null }]
    : industryData.slice(0, 6);
    
  const radarData = radarIndustries.map(d => ({
    industria: d.industria.length > 12 ? d.industria.substring(0, 12) + '...' : d.industria,
    madurez: d.promedio_madurez || 0,
  }));

  const userIndustryData = industryData.find(d => d.industria === userIndustry);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Promedio Global</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {(industryData.reduce((acc, d) => acc + (d.promedio_madurez || 0), 0) / industryData.length || 0).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Nivel de madurez IA</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              <CardTitle className="text-base">Total Evaluaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {industryData.reduce((acc, d) => acc + (d.total_evaluaciones || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Organizaciones evaluadas</p>
          </CardContent>
        </Card>

        {userIndustryData && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Tu Industria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {userIndustryData.promedio_madurez?.toFixed(1) || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{userIndustryData.industria}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Madurez IA por Industria</CardTitle>
            <CardDescription>Promedio de nivel de madurez en diferentes sectores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="industria" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  fontSize={11}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 5]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="madurez" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                  name="Madurez"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Comparativa Radar</CardTitle>
            <CardDescription>Nivel de madurez en los principales sectores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="industria" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar 
                  name="Madurez IA" 
                  dataKey="madurez" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {userIndustry && userMaturity !== undefined && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Tu Posición Competitiva</CardTitle>
            <CardDescription>Comparación con el promedio de tu industria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tu Madurez</p>
                <p className="text-4xl font-bold text-primary">{userMaturity.toFixed(1)}</p>
              </div>
              <div className="text-4xl text-muted-foreground">vs</div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Promedio Industria</p>
                <p className="text-4xl font-bold text-secondary">
                  {userIndustryData?.promedio_madurez?.toFixed(1) || '0'}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-background/50 rounded-lg">
              {userMaturity > (userIndustryData?.promedio_madurez || 0) ? (
                <p className="text-sm text-center text-foreground">
                  🎉 <span className="font-semibold">¡Excelente!</span> Estás por encima del promedio de tu industria.
                </p>
              ) : (
                <p className="text-sm text-center text-foreground">
                  💡 <span className="font-semibold">Oportunidad de mejora:</span> Hay espacio para alcanzar el promedio de tu sector.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
