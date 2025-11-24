import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UseCase } from "@/types/framework";
import { Building2, Sparkles, TrendingUp, Zap } from "lucide-react";

interface UseCaseDetailDialogProps {
  useCase: UseCase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UseCaseDetailDialog = ({ useCase, open, onOpenChange }: UseCaseDetailDialogProps) => {
  if (!useCase) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Caso de Uso</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'baja': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'media': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'alta': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'bajo': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
      case 'medio': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'alto': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{useCase.title}</DialogTitle>
              <DialogDescription className="text-base">
                {useCase.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Industria</p>
                <p className="font-medium">{useCase.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo de IA</p>
                <p className="font-medium">{useCase.aiType || 'Generativa'}</p>
              </div>
            </div>
          </div>

          {/* Complejidad e Impacto */}
          <div className="flex gap-3">
            {useCase.complexity && (
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Complejidad</p>
                <Badge variant="outline" className={`w-full justify-center ${getComplexityColor(useCase.complexity)}`}>
                  <Zap className="h-3 w-3 mr-1" />
                  {useCase.complexity}
                </Badge>
              </div>
            )}
            {useCase.impact && (
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Impacto Esperado</p>
                <Badge variant="outline" className={`w-full justify-center ${getImpactColor(useCase.impact)}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {useCase.impact}
                </Badge>
              </div>
            )}
          </div>

          {/* Category */}
          {useCase.category && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Categoría</p>
              <Badge variant="secondary" className="text-sm">
                {useCase.category}
              </Badge>
            </div>
          )}

          {/* Creator info for user-created use cases */}
          {useCase.isUserCreated && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                ✨ Caso de uso personalizado creado por ti
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
