import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UseCase } from '@/types/framework';

interface AIUseCaseSuggestionsProps {
  industry: string;
  maturityLevel: string;
  maturityScore: number;
  globalAnswers: any;
  onAddSuggestion: (useCase: UseCase) => void;
}

interface AISuggestion {
  title: string;
  description: string;
  rationale: string;
  complexity: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  aiType: string;
  dataRequirements: string;
}

const AIUseCaseSuggestions: React.FC<AIUseCaseSuggestionsProps> = ({
  industry,
  maturityLevel,
  maturityScore,
  globalAnswers,
  onAddSuggestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-use-cases', {
        body: {
          industry,
          maturityLevel,
          maturityScore,
          globalAnswers,
        },
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        toast.success('Sugerencias generadas exitosamente');
      } else {
        throw new Error('No se recibieron sugerencias');
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast.error(error.message || 'Error al generar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: AISuggestion) => {
    const newUseCase: UseCase = {
      id: `ai-suggested-${Date.now()}`,
      title: suggestion.title,
      category: 'IA Sugerida',
      industry,
      description: suggestion.description,
      aiType: suggestion.aiType,
      complexity: suggestion.complexity,
      impact: suggestion.impact,
      dataRequirements: suggestion.dataRequirements,
    };
    
    onAddSuggestion(newUseCase);
    toast.success(`Caso de uso "${suggestion.title}" agregado`);
  };

  return (
    <div className="space-y-4">
      {!showSuggestions ? (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Sugerencias de IA Personalizadas
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Basado en tu industria ({industry}) y nivel de madurez ({maturityLevel}), 
                nuestra IA puede sugerirte casos de uso específicos y alcanzables para tu organización.
              </p>
              <Button 
                onClick={generateSuggestions} 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando sugerencias...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generar Sugerencias con IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Casos de Uso Sugeridos por IA
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateSuggestions}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Regenerar'
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className="gap-2"
              >
                Cerrar
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>
                      
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-3">
                        <p className="text-sm">
                          <span className="font-medium text-primary">Por qué es relevante:</span>{' '}
                          {suggestion.rationale}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getComplexityColor(suggestion.complexity)}`}>
                          Complejidad: {suggestion.complexity === 'low' ? 'Baja' : suggestion.complexity === 'medium' ? 'Media' : 'Alta'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(suggestion.impact)}`}>
                          Impacto: {suggestion.impact === 'low' ? 'Bajo' : suggestion.impact === 'medium' ? 'Medio' : 'Alto'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full border bg-accent/10 text-accent border-accent/20">
                          {suggestion.aiType}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p><span className="font-medium">Datos requeridos:</span> {suggestion.dataRequirements}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddSuggestion(suggestion)}
                      size="sm"
                      className="gap-2 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIUseCaseSuggestions;
