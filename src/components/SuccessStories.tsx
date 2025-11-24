import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Quote, TrendingUp, Building2 } from "lucide-react";

interface SuccessStory {
  id: string;
  empresa: string;
  industria: string;
  caso_uso: string;
  descripcion: string;
  impacto_negocio: string;
  metrica_clave: string;
  valor_metrica: string;
  testimonio: string | null;
  nombre_contacto: string | null;
  cargo_contacto: string | null;
  pais: string | null;
}

export const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<SuccessStory[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (selectedIndustry === "all") {
      setFilteredStories(stories);
    } else {
      setFilteredStories(stories.filter(s => s.industria === selectedIndustry));
    }
  }, [selectedIndustry, stories]);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
      setFilteredStories(data || []);
    } catch (error) {
      console.error('Error loading success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const industries = Array.from(new Set(stories.map(s => s.industria)));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-muted"></CardHeader>
            <CardContent className="h-40 bg-muted/50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Casos de Éxito</h3>
          <p className="text-muted-foreground">Empresas que están transformando su negocio con IA</p>
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por industria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las industrias</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map(story => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow duration-300 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{story.empresa}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">{story.industria}</Badge>
              </div>
              <CardDescription className="font-medium text-foreground/80">
                {story.caso_uso}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{story.descripcion}</p>
              
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{story.metrica_clave}</p>
                  <p className="text-2xl font-bold text-primary">{story.valor_metrica}</p>
                </div>
              </div>

              {story.testimonio && (
                <div className="relative p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Quote className="absolute top-2 left-2 h-4 w-4 text-muted-foreground/30" />
                  <p className="text-sm italic text-muted-foreground pl-6">"{story.testimonio}"</p>
                  {story.nombre_contacto && (
                    <div className="mt-2 pl-6">
                      <p className="text-xs font-semibold text-foreground">{story.nombre_contacto}</p>
                      <p className="text-xs text-muted-foreground">{story.cargo_contacto}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{story.impacto_negocio}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron casos de éxito para esta industria.</p>
        </div>
      )}
    </div>
  );
};
