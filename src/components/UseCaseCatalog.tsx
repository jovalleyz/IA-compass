import { useState, useEffect } from "react";
import { UseCase } from "@/types/framework";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, TrendingUp, Zap, Shield, Award, X, Building2 } from "lucide-react";

interface UseCaseCatalogProps {
  useCases: UseCase[];
  selectedUseCases: UseCase[];
  onToggleUseCase: (useCase: UseCase) => void;
  onViewDetails?: (useCase: UseCase) => void;
  defaultIndustry?: string; // Industria por defecto del usuario
}

const UseCaseCatalog = ({ useCases, selectedUseCases, onToggleUseCase, onViewDetails, defaultIndustry }: UseCaseCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>(defaultIndustry || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Update selected industry when defaultIndustry changes
  useEffect(() => {
    if (defaultIndustry) {
      setSelectedIndustry(defaultIndustry);
    }
  }, [defaultIndustry]);

  const industries = Array.from(new Set(useCases.map(uc => uc.industry).filter(Boolean)));
  const categories = Array.from(new Set(useCases.map(uc => uc.category)));

  // Función helper para verificar si un caso está seleccionado
  const isSelected = (useCase: UseCase) => {
    return selectedUseCases.some(uc => uc.id === useCase.id);
  };

  const filteredUseCases = useCases.filter(uc => {
    const matchesSearch = uc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || uc.industry === selectedIndustry;
    const matchesCategory = selectedCategory === "all" || uc.category === selectedCategory;
    return matchesSearch && matchesIndustry && matchesCategory;
  });

  // Ordenar: primero los seleccionados, luego los no seleccionados
  const sortedUseCases = [...filteredUseCases].sort((a, b) => {
    const aSelected = isSelected(a);
    const bSelected = isSelected(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case "low": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "high": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case "high": return "text-green-600 dark:text-green-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-gray-600 dark:text-gray-400";
      default: return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "en_evaluacion": return "En Evaluación";
      case "en_ejecucion": return "En Ejecución";
      case "caso_de_exito": return "Caso de Éxito";
      default: return "En Evaluación";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "en_evaluacion": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "en_ejecucion": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "caso_de_exito": return "bg-green-500/10 text-green-700 dark:text-green-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Barra de búsqueda sticky con fondo sólido */}
        <div className="sticky top-16 z-20 bg-background pb-4 -mx-4 px-4 pt-4 border-b shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar casos de uso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Industria" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">Todas las industrias</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredUseCases.length} de {useCases.length} casos de uso
            </div>
            {selectedUseCases.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {selectedUseCases.length} seleccionado{selectedUseCases.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Casos seleccionados fijos */}
          {selectedUseCases.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Casos de uso seleccionados:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUseCases.map((useCase) => (
                  <Badge
                    key={useCase.id}
                    variant="default"
                    className="px-3 py-2 gap-2 cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => onViewDetails?.(useCase)}
                  >
                    <span className="max-w-[200px] truncate">{useCase.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleUseCase(useCase);
                      }}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Deseleccionar ${useCase.title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedUseCases.map((useCase) => {
            const selected = isSelected(useCase);
            return (
            <Card 
              key={useCase.id} 
              className={`hover:shadow-lg transition-all relative ${
                selected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              {/* Badge de caso de éxito en la esquina superior derecha */}
              {useCase.isUserCreated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className={`${getStatusColor(useCase.statusCase)} gap-1.5 pr-2`}>
                        <Award className="h-3 w-3" />
                        <span className="text-xs">{getStatusLabel(useCase.statusCase)}</span>
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {useCase.creatorCompany || "Empresa no especificada"}
                      </p>
                      <p className="text-sm">
                        Este caso de uso fue implementado por{" "}
                        <span className="font-medium">{useCase.creatorCompany || "un usuario"}</span>
                        {useCase.statusCase === "caso_de_exito" && " y calificado como exitoso por la comunidad"}
                        {useCase.statusCase === "en_ejecucion" && " y actualmente está en ejecución"}
                        {useCase.statusCase === "en_evaluacion" && " y está en fase de evaluación"}
                        .
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{useCase.category}</Badge>
                  {useCase.impact && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${getImpactColor(useCase.impact)}`} />
                      <span className={`text-xs ${getImpactColor(useCase.impact)}`}>
                        {useCase.impact === "high" ? "Alto" : useCase.impact === "medium" ? "Medio" : "Bajo"} impacto
                      </span>
                    </div>
                  )}
                </div>
              <CardTitle className="text-lg">{useCase.title}</CardTitle>
              {useCase.industry && (
                <CardDescription className="text-xs">{useCase.industry}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {useCase.description}
              </p>
              
              {useCase.aiType && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{useCase.aiType}</span>
                </div>
              )}

              {useCase.complexity && (
                <Badge className={getComplexityColor(useCase.complexity)}>
                  {useCase.complexity === "low" ? "Baja" : useCase.complexity === "medium" ? "Media" : "Alta"} complejidad
                </Badge>
              )}

              <Button 
                onClick={() => onToggleUseCase(useCase)}
                className="w-full"
                variant={selected ? "default" : "outline"}
              >
                {selected ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Seleccionado
                  </>
                ) : (
                  'Seleccionar caso de uso'
                )}
              </Button>
              </CardContent>
            </Card>
          );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UseCaseCatalog;
